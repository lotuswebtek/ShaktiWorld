import '../server/clerkEnv.js'
import { databaseHost, readDatabaseUrl } from '../server/db/url.js'

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

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  try {
    req.url = requestPath(req)
    const pathOnly = String(req.url).split('?')[0]

    if (req.method === 'GET' && (pathOnly === '/api/health' || pathOnly === '/health' || pathOnly === '/api')) {
      const host = databaseHost()
      sendJson(res, 200, {
        ok: true,
        name: 'Shaktiworld API',
        db: Boolean(readDatabaseUrl()),
        dbHost: host,
        clerk: Boolean(process.env.CLERK_SECRET_KEY),
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasDatabasePublicUrl: Boolean(process.env.DATABASE_PUBLIC_URL),
        dbHint:
          !host
            ? 'Set DATABASE_URL in Vercel to Railway DATABASE_PUBLIC_URL.'
            : host === 'base' || host.endsWith('.railway.internal')
              ? 'DATABASE_URL host is not reachable from Vercel. Use Railway DATABASE_PUBLIC_URL (host ends with proxy.rlwy.net).'
              : null,
      })
      return
    }

    const { default: app } = await import('../server/app.js')
    return app(req, res)
  } catch (err) {
    if (res.headersSent) return
    sendJson(res, 500, {
      message: 'Internal error.',
      detail: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
