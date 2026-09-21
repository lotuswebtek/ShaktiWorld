import { getAuth, verifyToken } from '@clerk/express'

const DEFAULT_AUTHORIZED_PARTIES = [
  'https://shakti-world.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
]

const CLOCK_SKEW_MS = 60_000

function headerValue(value) {
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === 'string' && item.trim()) || ''
  }
  return typeof value === 'string' ? value : ''
}

function getHeader(req, name) {
  const key = name.toLowerCase()
  const headers = req.headers
  if (!headers) return ''
  if (typeof headers.get === 'function') {
    return headerValue(headers.get(name) || headers.get(key))
  }
  return headerValue(headers[key] || headers[name])
}

function clerkFrontendOrigin() {
  const pk = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || ''
  const encoded = pk.replace(/^pk_(?:test|live)_/, '')
  if (!encoded) return ''
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8').replace(/\$+$/, '').trim()
    if (decoded.includes('.')) return `https://${decoded}`
  } catch {
    return ''
  }
  return ''
}

export function clerkAuthorizedParties() {
  const parties = [...DEFAULT_AUTHORIZED_PARTIES]
  const frontend = clerkFrontendOrigin()
  if (frontend) parties.push(frontend)

  for (const value of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    if (!value) continue
    const host = String(value).replace(/^https?:\/\//, '')
    parties.push(`https://${host}`)
  }

  const extra = process.env.CLERK_AUTHORIZED_PARTIES
  if (extra) {
    for (const party of extra.split(',')) {
      const trimmed = party.trim()
      if (trimmed) parties.push(trimmed)
    }
  }

  return [...new Set(parties)]
}

export function clerkMiddlewareOptions() {
  return {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
    authorizedParties: clerkAuthorizedParties(),
    // Handshake is for document navigations. API calls on Vercel with
    // Clerk development keys otherwise come back signed-out (dev-browser-missing).
    enableHandshake: false,
  }
}

function extractBearer(raw) {
  const text = headerValue(raw).trim()
  if (!text || text === 'null' || text === 'undefined') return ''
  const match = text.match(/Bearer\s+([A-Za-z0-9\-._~+/]+=*)/i)
  if (match?.[1]) return match[1]
  if (text.split('.').length === 3) return text
  return ''
}

function looksLikeClerkJwt(token) {
  const parts = String(token || '').split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    const iss = String(payload.iss || '').toLowerCase()
    const sub = String(payload.sub || '')
    const sid = String(payload.sid || '')
    if (iss === 'serverless' || iss.includes('vercel')) return false
    return sub.startsWith('user_') || sid.startsWith('sess_')
  } catch {
    return false
  }
}

function tokenFromRawHeaders(req) {
  const raw = req.rawHeaders
  if (!Array.isArray(raw)) return ''
  for (let i = 0; i < raw.length - 1; i += 2) {
    const name = String(raw[i] || '').toLowerCase()
    if (name !== 'authorization' && name !== 'x-clerk-session') continue
    const token = extractBearer(raw[i + 1])
    if (looksLikeClerkJwt(token)) return token
  }
  return ''
}

function tokenFromVercelScHeaders(req) {
  const raw = getHeader(req, 'x-vercel-sc-headers')
  if (!raw) return ''
  try {
    const parsed = JSON.parse(raw)
    const candidates = [
      parsed.Authorization,
      parsed.authorization,
      parsed['X-Clerk-Session'],
      parsed['x-clerk-session'],
    ]
    for (const candidate of candidates) {
      const token = extractBearer(candidate)
      if (looksLikeClerkJwt(token)) return token
    }
  } catch {
    return ''
  }
  return ''
}

function tokenFromCookie(req) {
  const cookie = getHeader(req, 'cookie')
  if (!cookie) return ''
  const match = cookie.match(/(?:^|;\s*)__session=([^;]+)/)
  if (!match?.[1]) return ''
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

export function readBearerToken(req) {
  const candidates = [
    extractBearer(getHeader(req, 'authorization')),
    extractBearer(getHeader(req, 'x-clerk-session')),
    tokenFromRawHeaders(req),
    tokenFromVercelScHeaders(req),
    tokenFromCookie(req),
  ]

  return candidates.find((token) => looksLikeClerkJwt(token)) || candidates.find(Boolean) || ''
}

function signedInAuth(userId, sessionId, token, claims) {
  return {
    userId,
    sessionId: sessionId || null,
    isAuthenticated: true,
    tokenType: 'session_token',
    sessionClaims: claims || {},
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: () => false,
    debug: () => ({}),
    getToken: async () => token,
    factorVerificationAge: null,
  }
}

function verifyOptions(includeParties, extra = {}) {
  const secretKey = process.env.CLERK_SECRET_KEY
  const jwtKey = process.env.CLERK_JWT_KEY
  const options = {
    clockSkewInMs: CLOCK_SKEW_MS,
    ...extra,
  }
  if (secretKey) options.secretKey = secretKey
  if (jwtKey) options.jwtKey = jwtKey
  if (includeParties) options.authorizedParties = clerkAuthorizedParties()
  return options
}

async function payloadFromBearer(token) {
  const secretKey = process.env.CLERK_SECRET_KEY
  const jwtKey = process.env.CLERK_JWT_KEY
  if (!token || (!secretKey && !jwtKey)) return null

  const attempts = [
    verifyOptions(true),
    verifyOptions(false, { skipJwksCache: true }),
  ]

  for (const options of attempts) {
    try {
      return await verifyToken(token, options)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'verify failed'
      if (!message.toLowerCase().includes('azp') && !message.toLowerCase().includes('authorized party')) {
        console.error('Bearer auth verify:', message)
      }
    }
  }
  return null
}

function existingUserId(req) {
  if (req.shaktiUserId) return req.shaktiUserId
  try {
    return getAuth(req).userId || null
  } catch {
    return null
  }
}

function applyVerifiedUser(req, userId, sessionId, token, claims) {
  req.shaktiUserId = userId
  const authObject = signedInAuth(userId, sessionId, token, claims)
  req.auth = () => authObject
}

/**
 * After clerkMiddleware, verify the SPA session JWT.
 * Vercel often strips Authorization; the client also sends X-Clerk-Session.
 */
export function attachBearerAuth(req, _res, next) {
  const finish = () => next()

  Promise.resolve()
    .then(async () => {
      const existing = existingUserId(req)
      if (existing) {
        req.shaktiUserId = existing
        return
      }

      const token = readBearerToken(req)
      const payload = await payloadFromBearer(token)
      const userId = payload?.sub
      if (userId) applyVerifiedUser(req, userId, payload.sid, token, payload)
    })
    .then(finish)
    .catch((err) => {
      console.error('Bearer auth:', err instanceof Error ? err.message : 'unknown')
      finish()
    })
}

export async function getRequestUserId(req) {
  const fromMiddleware = existingUserId(req)
  if (fromMiddleware) return fromMiddleware

  const payload = await payloadFromBearer(readBearerToken(req))
  const userId = payload?.sub || null
  if (userId) req.shaktiUserId = userId
  return userId
}
