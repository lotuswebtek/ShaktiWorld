import { getAuth, verifyToken } from '@clerk/express'

const DEFAULT_AUTHORIZED_PARTIES = [
  'https://shakti-world.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
]

export function clerkAuthorizedParties() {
  const parties = [...DEFAULT_AUTHORIZED_PARTIES]
  const vercel = process.env.VERCEL_URL
  if (vercel) {
    parties.push(`https://${String(vercel).replace(/^https?:\/\//, '')}`)
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

export function readBearerToken(req) {
  const header = req.headers.authorization
  if (typeof header !== 'string') return ''
  const match = header.match(/^Bearer\s+(\S+)/i)
  const token = match?.[1] || ''
  if (!token || token === 'null' || token === 'undefined') return ''
  return token
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

async function payloadFromBearer(token) {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!token || !secretKey) return null

  try {
    return await verifyToken(token, {
      secretKey,
      authorizedParties: clerkAuthorizedParties(),
    })
  } catch {
    try {
      return await verifyToken(token, { secretKey })
    } catch {
      return null
    }
  }
}

function existingUserId(req) {
  try {
    return getAuth(req).userId || null
  } catch {
    return null
  }
}

/**
 * After clerkMiddleware, verify the SPA Authorization Bearer JWT.
 * Development Clerk keys on a public domain often skip cookies; the React
 * client still sends a valid session token.
 */
export async function attachBearerAuth(req, _res, next) {
  try {
    if (existingUserId(req)) return next()

    const token = readBearerToken(req)
    const payload = await payloadFromBearer(token)
    const userId = payload?.sub
    if (userId) {
      const authObject = signedInAuth(userId, payload.sid, token, payload)
      req.auth = () => authObject
    }
  } catch (err) {
    console.error('Bearer auth:', err instanceof Error ? err.message : 'unknown')
  }
  next()
}

export async function getRequestUserId(req) {
  const fromMiddleware = existingUserId(req)
  if (fromMiddleware) return fromMiddleware

  const payload = await payloadFromBearer(readBearerToken(req))
  return payload?.sub || null
}
