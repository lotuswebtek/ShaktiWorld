import app from '../server/app.js'

export const config = {
  maxDuration: 30,
}

export default function handler(req, res) {
  const url = req.url || '/'
  if (!url.startsWith('/api')) {
    req.url = '/api' + (url.startsWith('/') ? url : `/${url}`)
  }
  return app(req, res)
}
