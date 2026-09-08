import { Router } from 'express'
import { getRequestUserId } from '../auth.js'
import pool from '../db/pool.js'
import { readIdDocument, mimeFromStorageKey } from '../storage.js'

const router = Router()

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value)
}

/**
 * Middleware: require moderator or admin role.
 */
async function requireStaff(req, res, next) {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      'SELECT id, role FROM users WHERE clerk_id = $1',
      [userId],
    )
    if (rows.length === 0 || !['moderator', 'admin'].includes(rows[0].role)) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    req.staffUser = rows[0]
    next()
  } catch (err) {
    console.error('requireStaff error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
}

router.use(requireStaff)

// ───────────────────────────────────────────────
// GET /api/moderation/verifications
// Queue of identity-document reviews.
// ───────────────────────────────────────────────
router.get('/verifications', async (req, res) => {
  const status = req.query.status
  const allowed = ['submitted', 'under_review', 'approved', 'rejected']

  let client
  try {
    client = await pool.connect()
    const params = []
    let where = ''
    if (status && allowed.includes(String(status))) {
      params.push(status)
      where = `WHERE iv.status = $1`
    }

    const { rows } = await client.query(
      `SELECT iv.id, iv.document_type, iv.status, iv.created_at, iv.reviewed_at,
              iv.rejection_reason,
              p.full_name, p.city, p.country,
              u.account_status
       FROM identity_verifications iv
       JOIN users u ON u.id = iv.user_id
       LEFT JOIN profiles p ON p.user_id = u.id
       ${where}
       ORDER BY
         CASE iv.status
           WHEN 'submitted' THEN 0
           WHEN 'under_review' THEN 1
           WHEN 'rejected' THEN 2
           ELSE 3
         END,
         iv.created_at ASC`,
      params,
    )
    return res.json({ verifications: rows })
  } catch (err) {
    console.error('moderation/verifications GET error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// GET /api/moderation/verifications/:id/file
// Streams the private document to authenticated staff only.
// ───────────────────────────────────────────────
router.get('/verifications/:id/file', async (req, res) => {
  if (!isUuid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid request.' })
  }

  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      'SELECT storage_key FROM identity_verifications WHERE id = $1',
      [req.params.id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Not found.' })
    }

    const buffer = await readIdDocument(rows[0].storage_key)
    const mime = mimeFromStorageKey(rows[0].storage_key)
    res.setHeader('Content-Type', mime)
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Disposition', 'inline')
    return res.send(buffer)
  } catch (err) {
    console.error('moderation/verifications file error:', err.message)
    return res.status(404).json({ message: 'Document is not available.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// PATCH /api/moderation/verifications/:id
// Approve or reject. Approve also verifies the member account.
// ───────────────────────────────────────────────
router.patch('/verifications/:id', async (req, res) => {
  if (!isUuid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid request.' })
  }

  const { action, rejectionReason } = req.body || {}
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Action must be approve or reject.' })
  }
  if (action === 'reject' && !String(rejectionReason || '').trim()) {
    return res.status(400).json({ message: 'A rejection reason is required.' })
  }

  let client
  try {
    client = await pool.connect()
    await client.query('BEGIN')

    const { rows } = await client.query(
      `SELECT id, user_id, status FROM identity_verifications WHERE id = $1 FOR UPDATE`,
      [req.params.id],
    )
    if (rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Not found.' })
    }

    const current = rows[0]
    if (!['submitted', 'under_review'].includes(current.status)) {
      await client.query('ROLLBACK')
      return res.status(409).json({ message: 'This document has already been reviewed.' })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const reason = action === 'reject' ? String(rejectionReason).trim() : null

    await client.query(
      `UPDATE identity_verifications
       SET status = $1,
           reviewed_by = $2,
           reviewed_at = now(),
           rejection_reason = $3,
           updated_at = now()
       WHERE id = $4`,
      [newStatus, req.staffUser.id, reason, req.params.id],
    )

    if (action === 'approve') {
      await client.query(
        `UPDATE users SET account_status = 'verified', updated_at = now() WHERE id = $1`,
        [current.user_id],
      )
    }

    await client.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, 'identity_verification', $3, $4)`,
      [
        req.staffUser.id,
        `verification.${action}d`,
        req.params.id,
        JSON.stringify({ new_status: newStatus }),
      ],
    )

    await client.query('COMMIT')
    return res.json({ ok: true, status: newStatus })
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {})
    console.error('moderation/verifications PATCH error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// GET /api/moderation/support
// List support requests visible to this moderator.
// Sorted by category, then by creation date (oldest first).
// Query param: ?category=health|mental_wellbeing|domestic_violence|dowry
// ───────────────────────────────────────────────
router.get('/support', async (req, res) => {
  const { category, status } = req.query
  let client
  try {
    client = await pool.connect()

    let sql = `
      SELECT sr.id, sr.category, sr.subject, sr.body, sr.visibility,
             sr.status, sr.assigned_to, sr.created_at, sr.updated_at,
             p.full_name AS requester_name
      FROM support_requests sr
      JOIN users u ON sr.user_id = u.id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE 1=1
    `
    const params = []
    let idx = 1

    // Moderators: see unassigned private_to_moderators + assigned to them
    // Admins: see everything
    if (req.staffUser.role === 'moderator') {
      sql += ` AND (
        sr.assigned_to = $${idx}
        OR (sr.assigned_to IS NULL AND sr.visibility = 'private_to_moderators')
      )`
      params.push(req.staffUser.id)
      idx++
    }

    if (category) {
      sql += ` AND sr.category = $${idx}`
      params.push(category)
      idx++
    }

    if (status) {
      sql += ` AND sr.status = $${idx}`
      params.push(status)
      idx++
    }

    sql += ' ORDER BY sr.category, sr.created_at ASC'

    const { rows } = await client.query(sql, params)
    return res.json({ requests: rows })
  } catch (err) {
    console.error('moderation/support GET error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// GET /api/moderation/support/:id
// Single support request detail with moderator notes.
// ───────────────────────────────────────────────
router.get('/support/:id', async (req, res) => {
  let client
  try {
    client = await pool.connect()

    const { rows: srRows } = await client.query(
      `SELECT sr.*, p.full_name AS requester_name
       FROM support_requests sr
       JOIN users u ON sr.user_id = u.id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE sr.id = $1`,
      [req.params.id],
    )
    if (srRows.length === 0) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    // Check access for moderators
    const sr = srRows[0]
    if (
      req.staffUser.role === 'moderator' &&
      sr.assigned_to !== null &&
      sr.assigned_to !== req.staffUser.id
    ) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    const { rows: notes } = await client.query(
      `SELECT mn.id, mn.body, mn.created_at, p.full_name AS author_name
       FROM moderator_notes mn
       JOIN users u ON mn.author_id = u.id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE mn.support_request_id = $1
       ORDER BY mn.created_at ASC`,
      [req.params.id],
    )

    return res.json({ request: sr, notes })
  } catch (err) {
    console.error('moderation/support/:id error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// PATCH /api/moderation/support/:id
// Update status, assign to self. Writes to audit_log.
// ───────────────────────────────────────────────
router.patch('/support/:id', async (req, res) => {
  const { status, assignToSelf } = req.body || {}
  const validStatuses = ['open', 'in_progress', 'resolved', 'closed']

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' })
  }

  let client
  try {
    client = await pool.connect()
    await client.query('BEGIN')

    // Get current state
    const { rows: current } = await client.query(
      'SELECT status, assigned_to FROM support_requests WHERE id = $1',
      [req.params.id],
    )
    if (current.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Request not found.' })
    }

    const oldStatus = current[0].status
    const oldAssigned = current[0].assigned_to

    const updates = []
    const params = []
    let idx = 1

    if (status) {
      updates.push(`status = $${idx}`)
      params.push(status)
      idx++
    }

    if (assignToSelf) {
      updates.push(`assigned_to = $${idx}`)
      params.push(req.staffUser.id)
      idx++
    }

    if (updates.length > 0) {
      updates.push(`updated_at = now()`)
      params.push(req.params.id)
      await client.query(
        `UPDATE support_requests SET ${updates.join(', ')} WHERE id = $${idx}`,
        params,
      )
    }

    // Write to audit_log
    await client.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, 'support_request', $3, $4)`,
      [
        req.staffUser.id,
        status ? `support_request.status_${status}` : 'support_request.assigned',
        req.params.id,
        JSON.stringify({
          old_status: oldStatus,
          new_status: status || oldStatus,
          old_assigned: oldAssigned,
          new_assigned: assignToSelf ? req.staffUser.id : oldAssigned,
        }),
      ],
    )

    await client.query('COMMIT')
    return res.json({ ok: true })
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {})
    console.error('moderation/support PATCH error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// POST /api/moderation/support/:id/notes
// Add an internal moderator note. Writes to audit_log.
// ───────────────────────────────────────────────
router.post('/support/:id/notes', async (req, res) => {
  const { body } = req.body || {}
  if (!body || !body.trim()) {
    return res.status(400).json({ message: 'Note body is required.' })
  }

  let client
  try {
    client = await pool.connect()
    await client.query('BEGIN')

    // Verify request exists
    const { rows: srRows } = await client.query(
      'SELECT id FROM support_requests WHERE id = $1',
      [req.params.id],
    )
    if (srRows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Request not found.' })
    }

    const { rows: noteRows } = await client.query(
      `INSERT INTO moderator_notes (support_request_id, author_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [req.params.id, req.staffUser.id, String(body).trim()],
    )

    // Audit log
    await client.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, 'support_request.note_added', 'support_request', $2, $3)`,
      [
        req.staffUser.id,
        req.params.id,
        JSON.stringify({ note_id: noteRows[0].id }),
      ],
    )

    await client.query('COMMIT')
    return res.json({ ok: true, noteId: noteRows[0].id })
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {})
    console.error('moderation/notes POST error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ═══════════════════════════════════════════════
// LISTENING MODERATION
// ═══════════════════════════════════════════════

// ───────────────────────────────────────────────
// GET /api/moderation/listening/review
// Posts pending pre-publication review (new accounts).
// ───────────────────────────────────────────────
router.get('/listening/review', async (req, res) => {
  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      `SELECT lp.id, lp.title, lp.body, lp.is_anonymous,
              lp.moderation_status, lp.created_at,
              p.full_name AS author_name
       FROM listening_posts lp
       LEFT JOIN profiles p ON p.user_id = lp.author_id
       WHERE lp.moderation_status = 'pending_review'
       ORDER BY lp.created_at ASC`,
    )
    return res.json({ posts: rows })
  } catch (err) {
    console.error('moderation/listening/review error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// PATCH /api/moderation/listening/review/:postId
// Approve or reject a post. Writes to audit_log.
// ───────────────────────────────────────────────
router.patch('/listening/review/:postId', async (req, res) => {
  const { action } = req.body || {} // 'approve' or 'reject'
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Action must be approve or reject.' })
  }

  let client
  try {
    client = await pool.connect()
    await client.query('BEGIN')

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    const { rowCount } = await client.query(
      `UPDATE listening_posts SET moderation_status = $1, updated_at = now()
       WHERE id = $2 AND moderation_status = 'pending_review'`,
      [newStatus, req.params.postId],
    )

    if (rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Post not found or already reviewed.' })
    }

    await client.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, 'listening_post', $3, $4)`,
      [
        req.staffUser.id,
        `listening_post.${action}d`,
        req.params.postId,
        JSON.stringify({ new_status: newStatus }),
      ],
    )

    await client.query('COMMIT')
    return res.json({ ok: true })
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {})
    console.error('moderation/listening/review PATCH error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// GET /api/moderation/reports
// All open reports across posts and replies.
// ───────────────────────────────────────────────
router.get('/reports', async (req, res) => {
  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      `SELECT lr.id, lr.target_type, lr.target_id, lr.reason,
              lr.status, lr.created_at,
              p.full_name AS reporter_name
       FROM listening_reports lr
       JOIN users u ON lr.reporter_id = u.id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE lr.status = 'open'
       ORDER BY lr.created_at ASC`,
    )
    return res.json({ reports: rows })
  } catch (err) {
    console.error('moderation/reports error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// PATCH /api/moderation/reports/:id
// Review a report (dismiss or mark reviewed). Writes to audit_log.
// ───────────────────────────────────────────────
router.patch('/reports/:id', async (req, res) => {
  const { action } = req.body || {} // 'reviewed' or 'dismissed'
  if (!['reviewed', 'dismissed'].includes(action)) {
    return res.status(400).json({ message: 'Action must be reviewed or dismissed.' })
  }

  let client
  try {
    client = await pool.connect()
    await client.query('BEGIN')

    const { rowCount } = await client.query(
      `UPDATE listening_reports
       SET status = $1, reviewed_by = $2, reviewed_at = now()
       WHERE id = $3 AND status = 'open'`,
      [action, req.staffUser.id, req.params.id],
    )

    if (rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Report not found or already handled.' })
    }

    await client.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, 'listening_report', $3, $4)`,
      [
        req.staffUser.id,
        `report.${action}`,
        req.params.id,
        JSON.stringify({ action }),
      ],
    )

    await client.query('COMMIT')
    return res.json({ ok: true })
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {})
    console.error('moderation/reports PATCH error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

router.get('/whoami', (req, res) => {
  return res.json({ ok: true, role: req.staffUser.role, id: req.staffUser.id })
})

function requireAdmin(req, res, next) {
  if (req.staffUser?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied.' })
  }
  next()
}

const RESOURCE_TYPES = ['article', 'video', 'guide', 'downloadable']

router.post('/events', requireAdmin, async (req, res) => {
  const {
    title,
    description,
    location,
    isOnline,
    eventUrl,
    startsAt,
    endsAt,
    coverImage,
    capacity,
  } = req.body || {}

  if (!title || !startsAt) {
    return res.status(400).json({ message: 'Title and start time are required.' })
  }

  const starts = new Date(startsAt)
  if (Number.isNaN(starts.getTime())) {
    return res.status(400).json({ message: 'Valid start time is required.' })
  }
  const ends = endsAt ? new Date(endsAt) : null
  if (endsAt && Number.isNaN(ends.getTime())) {
    return res.status(400).json({ message: 'End time is invalid.' })
  }

  const cap = capacity === '' || capacity == null ? null : Number(capacity)
  if (cap != null && (!Number.isInteger(cap) || cap < 1)) {
    return res.status(400).json({ message: 'Capacity must be a positive whole number.' })
  }

  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      `INSERT INTO events
        (created_by, title, description, location, is_online, event_url, starts_at, ends_at, cover_image, capacity, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING id`,
      [
        req.staffUser.id,
        String(title).trim(),
        description ? String(description).trim() : null,
        location ? String(location).trim() : null,
        Boolean(isOnline),
        eventUrl ? String(eventUrl).trim() : null,
        starts,
        ends,
        coverImage ? String(coverImage).trim() : null,
        cap,
      ],
    )

    await client.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, 'event.created', 'event', $2, $3)`,
      [req.staffUser.id, rows[0].id, JSON.stringify({ published: true })],
    )

    return res.json({ ok: true, id: rows[0].id })
  } catch (err) {
    console.error('moderation/events POST error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

router.post('/resources', requireAdmin, async (req, res) => {
  const {
    title,
    description,
    topic,
    resourceType,
    readingTimeMinutes,
    tags,
    bodyMarkdown,
    url,
    source,
  } = req.body || {}

  if (!title || !topic || !resourceType) {
    return res.status(400).json({ message: 'Title, topic, and type are required.' })
  }
  if (!RESOURCE_TYPES.includes(resourceType)) {
    return res.status(400).json({ message: 'Invalid resource type.' })
  }

  const origin = source === 'in_house' ? 'in_house' : 'external'
  if (origin === 'in_house' && !bodyMarkdown) {
    return res.status(400).json({ message: 'In-house articles need markdown content.' })
  }
  if (origin === 'external' && !url) {
    return res.status(400).json({ message: 'Third-party resources need an external link.' })
  }

  const minutes = readingTimeMinutes === '' || readingTimeMinutes == null
    ? null
    : Number(readingTimeMinutes)
  if (minutes != null && (!Number.isInteger(minutes) || minutes < 1)) {
    return res.status(400).json({ message: 'Reading time must be a positive whole number of minutes.' })
  }

  const cleanedTags = Array.isArray(tags)
    ? tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
    : String(tags || '').split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12)

  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      `INSERT INTO resources
        (created_by, title, description, category, topic, resource_type, reading_time_minutes, tags, body_markdown, url, source, is_published)
       VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING id`,
      [
        req.staffUser.id,
        String(title).trim(),
        description ? String(description).trim() : null,
        String(topic).trim(),
        resourceType,
        minutes,
        cleanedTags,
        origin === 'in_house' ? String(bodyMarkdown).trim() : null,
        origin === 'external' ? String(url).trim() : (url ? String(url).trim() : null),
        origin,
      ],
    )

    await client.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, 'resource.created', 'resource', $2, $3)`,
      [req.staffUser.id, rows[0].id, JSON.stringify({ source: origin, resource_type: resourceType })],
    )

    return res.json({ ok: true, id: rows[0].id })
  } catch (err) {
    console.error('moderation/resources POST error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

export default router
