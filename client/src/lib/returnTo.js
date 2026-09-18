const KEY = 'sw_next'

export function isSafeAppPath(path) {
  return (
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.startsWith('/log-in') &&
    !path.startsWith('/register')
  )
}

export function rememberReturnTo(path) {
  if (isSafeAppPath(path)) sessionStorage.setItem(KEY, path)
}

export function peekReturnTo() {
  const next = sessionStorage.getItem(KEY)
  return isSafeAppPath(next) ? next : null
}

export function consumeReturnTo(fallback) {
  const next = peekReturnTo()
  sessionStorage.removeItem(KEY)
  return next || fallback
}
