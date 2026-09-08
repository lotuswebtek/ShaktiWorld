import { Router } from 'express'
import { getRequestUserId } from '../auth.js'
import pool from '../db/pool.js'

const router = Router()

const VALID_CATEGORIES = ['health', 'mental_wellbeing', 'domestic_violence', 'dowry']
const VALID_VISIBILITY = ['public', 'members_only', 'private_to_moderators']

// ───────────────────────────────────────────────
// POST /api/community/support
// Create a new support request.
// Never sends email containing the request content.
// ───────────────────────────────────────────────
router.post('/', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const { category, subject, body, visibility } = req.body || {}

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: 'Valid category is required.' })
  }
  if (!subject || !body) {
    return res.status(400).json({ message: 'Subject and message are required.' })
  }
  if (visibility && !VALID_VISIBILITY.includes(visibility)) {
    return res.status(400).json({ message: 'Invalid visibility setting.' })
  }

  // Default visibility: private for DV and dowry categories
  const effectiveVisibility = visibility ||
    (['domestic_violence', 'dowry'].includes(category) ? 'private_to_moderators' : 'members_only')

  let client
  try {
    client = await pool.connect()

    const { rows: userRows } = await client.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId],
    )
    if (userRows.length === 0) {
      return res.status(403).json({ message: 'Account not found.' })
    }
    const dbUserId = userRows[0].id

    const { rows } = await client.query(
      `INSERT INTO support_requests (user_id, category, subject, body, visibility)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [dbUserId, category, String(subject).trim(), String(body).trim(), effectiveVisibility],
    )

    // No email notification is sent — moderators check the inbox directly.

    return res.json({
      ok: true,
      id: rows[0].id,
      message: 'Your request has been submitted. A moderator will review it.',
    })
  } catch (err) {
    console.error('support POST error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// GET /api/community/support/mine
// List the current user's own support requests.
// ───────────────────────────────────────────────
router.get('/mine', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  let client
  try {
    client = await pool.connect()

    const { rows: userRows } = await client.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId],
    )
    if (userRows.length === 0) return res.json({ requests: [] })

    const { rows } = await client.query(
      `SELECT id, category, subject, visibility, status, created_at, updated_at
       FROM support_requests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userRows[0].id],
    )

    return res.json({ requests: rows })
  } catch (err) {
    console.error('support/mine error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

export default router
