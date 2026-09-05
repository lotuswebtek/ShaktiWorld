/**
 * Sets no-store cache headers on support-related API responses.
 * Prevents browsers from caching sensitive support request data.
 */
export default function noCache(_req, res, next) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  next()
}
