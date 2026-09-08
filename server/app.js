import './clerkEnv.js'
import express from 'express'
import cors from 'cors'
import { clerkClient, clerkMiddleware, getAuth } from '@clerk/express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { databaseHost } from './db/pool.js'
import onboardingRoutes from './routes/onboarding.js'
import supportRoutes from './routes/support.js'
import listeningRoutes from './routes/listening.js'
import jobsRoutes from './routes/jobs.js'
import businessesRoutes from './routes/businesses.js'
import eventsRoutes from './routes/events.js'
import eventRsvpRoutes from './routes/eventRsvp.js'
import resourcesRoutes from './routes/resources.js'
import moderationRoutes from './routes/moderation.js'
import requireVerified from './middleware/requireVerified.js'
import noCache from './middleware/noCache.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'shaktiworld-data')
  : path.join(__dirname, 'data')

fs.mkdirSync(DATA_DIR, { recursive: true })

function readJson(file, fallback) {
  const full = path.join(DATA_DIR, file)
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2))
}

function isPublicApi(req) {
  const pathOnly = String(req.url || '').split('?')[0]
  if (req.method !== 'GET') return false
  return (
    pathOnly === '/api/health' ||
    pathOnly === '/health' ||
    pathOnly.startsWith('/api/events') ||
    pathOnly.startsWith('/api/resources')
  )
}

const app = express()
app.set('trust proxy', 1)

let clerk = null
try {
  if (process.env.CLERK_SECRET_KEY) {
    clerk = clerkMiddleware()
  }
} catch (err) {
  console.error('Clerk middleware was not created:', err instanceof Error ? err.message : 'unknown')
}

app.use((req, res, next) => {
  if (isPublicApi(req) || !clerk) return next()
  return clerk(req, res, next)
})
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    ok: true,
    name: 'Shaktiworld API',
    db: Boolean(process.env.DATABASE_URL),
    dbHost: databaseHost(),
    clerk: Boolean(process.env.CLERK_SECRET_KEY),
  })
})

app.use('/api/onboarding', onboardingRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/resources', resourcesRoutes)
app.use('/api/community', requireVerified)
app.use('/api/community/support', noCache)
app.use('/api/community/listening', noCache)
app.use('/api/community/support', supportRoutes)
app.use('/api/community/listening', listeningRoutes)
app.use('/api/community/jobs', jobsRoutes)
app.use('/api/community/businesses', businessesRoutes)
app.use('/api/community/events', eventRsvpRoutes)
app.use('/api/moderation', moderationRoutes)

app.get('/api/me', async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req)
  if (!isAuthenticated) {
    return res.status(401).json({ message: 'Please log in to continue.' })
  }

  const user = await clerkClient.users.getUser(userId)
  res.json({
    user: {
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
      email: user.emailAddresses[0]?.emailAddress || '',
    },
  })
})

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {}
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' })
  }
  const contacts = readJson('contacts.json', [])
  contacts.unshift({
    id: Date.now().toString(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    subject: String(subject || 'General inquiry').trim(),
    message: String(message).trim(),
    createdAt: new Date().toISOString(),
  })
  writeJson('contacts.json', contacts)
  res.json({ ok: true, message: 'Thank you. We will get back to you soon.' })
})

app.post('/api/applications', (req, res) => {
  const { name, email, interest, message } = req.body || {}
  if (!name || !email || !interest) {
    return res.status(400).json({ message: 'Name, email, and interest are required.' })
  }
  const applications = readJson('applications.json', [])
  applications.unshift({
    id: Date.now().toString(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    interest: String(interest).trim(),
    message: String(message || '').trim(),
    createdAt: new Date().toISOString(),
  })
  writeJson('applications.json', applications)
  res.json({ ok: true, message: 'Application received. Our team will reach out soon.' })
})

app.use((req, res) => {
  res.status(404).json({ message: 'Not found.', path: req.url })
})

app.use((err, req, res, _next) => {
  const detail = err instanceof Error ? err.message : 'Unknown error'
  console.error('API error:', detail)
  if (res.headersSent) return
  res.status(500).json({ message: 'Internal error.', detail })
})

export default app
