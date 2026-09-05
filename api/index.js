import app from '../server/app.js'

export const config = {
  maxDuration: 30,
}

function requestPath(req) {
  const forwarded = req.headers['x-forwarded-uri']
  if (typeof forwarded === 'string' && forwarded.startsWith('/')) {
    return forwarded
  }

  const route = req.query?.route
  if (typeof route === 'string' && route.length > 0) {
    const params = new URL(req.url || '/', 'http://localhost').searchParams
    params.delete('route')
    const search = params.toString()
    return `/api/${route.replace(/^\//, '')}${search ? `?${search}` : ''}`
  }

  const splat = req.query?.path
  if (splat) {
    const rest = Array.isArray(splat) ? splat.filter(Boolean).join('/') : String(splat)
    if (rest) return `/api/${rest.replace(/^\//, '')}`
  }

  const url = req.url || '/'
  if (url.startsWith('/api')) return url
  return `/api${url.startsWith('/') ? url : `/${url}`}`
}

export default function handler(req, res) {
  try {
    req.url = requestPath(req)
    const pathOnly = String(req.url).split('?')[0]

    if (req.method === 'GET' && (pathOnly === '/api/health' || pathOnly === '/health' || pathOnly === '/api')) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          ok: true,
          name: 'Shaktiworld API',
          db: Boolean(process.env.DATABASE_URL),
          clerk: Boolean(process.env.CLERK_SECRET_KEY),
        }),
      )
      return
    }

    return app(req, res)
  } catch (err) {
    if (res.headersSent) return
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        message: 'Internal error.',
        detail: err instanceof Error ? err.message : 'Unknown error',
      }),
    )
  }
}
