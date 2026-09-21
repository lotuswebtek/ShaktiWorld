import { API } from '../config/env.js'

const TOKEN_TIMEOUT_MS = 10000
const FETCH_TIMEOUT_MS = 15000

function timeoutError(message) {
  const err = new Error(message)
  err.name = 'TimeoutError'
  return err
}

export function withTimeout(promise, ms, message) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(timeoutError(message)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

function abortAfter(parentSignal, ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  const onParentAbort = () => controller.abort()
  if (parentSignal) {
    if (parentSignal.aborted) controller.abort()
    else parentSignal.addEventListener('abort', onParentAbort, { once: true })
  }
  controller.signal.addEventListener(
    'abort',
    () => {
      clearTimeout(timer)
      if (parentSignal) parentSignal.removeEventListener('abort', onParentAbort)
    },
    { once: true },
  )
  return controller.signal
}

function friendlyFetchError(err) {
  if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
    return new Error('The server took too long to respond. Try again.')
  }
  return err instanceof Error ? err : new Error('Could not reach the server.')
}

/**
 * Same-origin API call with a Clerk session JWT.
 * Skips empty tokens and retries once with a fresh token on 401.
 */
export async function fetchWithClerkToken(path, getToken, options = {}) {
  const method = String(options.method || 'GET').toUpperCase()
  const skipCacheFirst = method !== 'GET' && method !== 'HEAD'

  const run = async (skipCache) => {
    const token = await withTimeout(
      Promise.resolve(getToken(skipCache ? { skipCache: true } : undefined)),
      TOKEN_TIMEOUT_MS,
      'Your session is taking too long to load.',
    )
    if (!token) return { token: null, res: null }
    const res = await fetch(`${API}${path}`, {
      ...options,
      signal: abortAfter(options.signal, FETCH_TIMEOUT_MS),
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        // Vercel production often strips Authorization; this copy survives.
        'X-Clerk-Session': token,
      },
    })
    return { token, res }
  }

  try {
    let { token, res } = await run(skipCacheFirst)
    if (!token) {
      const retry = await run(true)
      token = retry.token
      res = retry.res
    }

    if (!token || !res) {
      const err = new Error('Session expired. Sign in again to continue.')
      err.status = 401
      throw err
    }

    if (res.status === 401) {
      const retry = await run(true)
      if (retry.res) res = retry.res
    }

    return res
  } catch (err) {
    throw friendlyFetchError(err)
  }
}
