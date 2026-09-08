import { API } from '../config/env.js'

/**
 * Same-origin API call with a Clerk session JWT.
 * Skips empty tokens and retries once with a fresh token on 401.
 */
export async function fetchWithClerkToken(path, getToken, options = {}) {
  const run = async (skipCache) => {
    const token = await getToken(skipCache ? { skipCache: true } : undefined)
    if (!token) return { token: null, res: null }
    const res = await fetch(`${API}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    })
    return { token, res }
  }

  let { token, res } = await run(false)
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
}
