import express from 'express'
import cors from 'cors'
import { clerkClient, clerkMiddleware, getAuth } from '@clerk/express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
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
const DATA_DIR = path.join(__dirname, 'data')
const CLIENT_DIST = path.join(__dirname, '../client/dist')
const PORT = process.env.PORT || 5000

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

const app = express()
app.use(clerkMiddleware())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

// ── Onboarding (profile + ID upload) ──
app.use('/api/onboarding', onboardingRoutes)

// ── Public-readable events & resources (RSVP is verified separately) ──
app.use('/api/events', eventsRoutes)
app.use('/api/resources', resourcesRoutes)

// ── Community routes: blocked for non-verified users ──
app.use('/api/community', requireVerified)

// ── Support routes: no-cache headers for sensitive data ──
app.use('/api/community/support', noCache)
app.use('/api/community/listening', noCache)

// ── Support request CRUD ──
app.use('/api/community/support', supportRoutes)

// ── Listening space ──
app.use('/api/community/listening', listeningRoutes)

// ── Jobs noticeboard ──
app.use('/api/community/jobs', jobsRoutes)

// ── Small business directory ──
app.use('/api/community/businesses', businessesRoutes)

// ── Event RSVP (verified members only) ──
app.use('/api/community/events', eventRsvpRoutes)

// ── Moderation routes (staff only, own auth check inside) ──
app.use('/api/moderation', moderationRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'Shaktiworld API' })
})

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

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST))
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Shaktiworld API running on http://localhost:${PORT}`)
})
