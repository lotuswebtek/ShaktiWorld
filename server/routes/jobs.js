import { Router } from 'express'
import { getRequestUserId } from '../auth.js'
import pool from '../db/pool.js'

const router = Router()

const VALID_WORK_MODES = ['remote', 'onsite']
const VALID_CONTACT_METHODS = ['email', 'phone', 'whatsapp', 'other']

async function resolveUser(client, clerkId) {
  const { rows } = await client.query(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  )
  return rows[0] || null
}

function parseExpiryDate(expiryDateStr) {
  // Expect YYYY-MM-DD from HTML date inputs.
  if (!expiryDateStr) return null
  const d = new Date(expiryDateStr + 'T00:00:00.000Z')
  if (Number.isNaN(d.getTime())) return null
  return d
}

function within60Days(createdAt, expiryAt) {
  const ms = expiryAt.getTime() - createdAt.getTime()
  return ms >= 0 && ms <= 60 * 24 * 60 * 60 * 1000
}

// ───────────────────────────────────────────────
// POST /api/community/jobs/opportunities
// Member posts an opportunity.
// ───────────────────────────────────────────────
router.post('/opportunities', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const {
    title,
    description,
    location,
    workMode,
    salaryRange, // UI label: compensation range (required)
    contactMethod,
    contactValue,
    expiryDate, // YYYY-MM-DD (required, must be within 60 days)
  } = req.body || {}

  if (!title || !description || !location) {
    return res.status(400).json({ message: 'Title, description, and location are required.' })
  }
  if (!workMode || !VALID_WORK_MODES.includes(workMode)) {
    return res.status(400).json({ message: 'Remote/onsite selection is required.' })
  }

  // Compensation range is required.
  if (!salaryRange || !String(salaryRange).trim()) {
    return res.status(400).json({ message: 'Compensation range is required.' })
  }

  if (!contactMethod || !VALID_CONTACT_METHODS.includes(contactMethod)) {
    return res.status(400).json({ message: 'Contact method is required.' })
  }
  if (!contactValue || !String(contactValue).trim()) {
    return res.status(400).json({ message: 'Contact value is required.' })
  }

  const expiryAt = parseExpiryDate(expiryDate)
  if (!expiryAt) {
    return res.status(400).json({ message: 'Valid expiry date is required.' })
  }

  let client
  try {
    client = await pool.connect()

    const user = await resolveUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Account not found.' })

    const createdAt = new Date()
    if (!within60Days(createdAt, expiryAt)) {
      return res.status(400).json({ message: 'Expiry date must be within 60 days.' })
    }

    const { rows } = await client.query(
      `INSERT INTO job_posts
        (posted_by, title, description, location, work_mode, salary_range, contact_method, contact_value, expires_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, expires_at`,
      [
        user.id,
        String(title).trim(),
        String(description).trim(),
        String(location).trim(),
        workMode,
        String(salaryRange).trim(),
        contactMethod,
        String(contactValue).trim(),
        expiryAt,
      ],
    )

    return res.json({ ok: true, id: rows[0].id, expires_at: rows[0].expires_at })
  } catch (err) {
    console.error('jobs/opportunities POST error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// GET /api/community/jobs/opportunities
// Filters:
//  - city (matches location)
//  - skill (searches title/description)
//  - workMode: remote|onsite|either
//  - contact details are intentionally NOT returned.
// ───────────────────────────────────────────────
router.get('/opportunities', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const { city, skill, workMode } = req.query || {}

  let client
  try {
    client = await pool.connect()
    const user = await resolveUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Account not found.' })

    const params = [user.id]
    let idx = 2
    let sql = `SELECT
      jp.id,
      jp.title,
      jp.description,
      jp.location,
      jp.work_mode,
      jp.salary_range,
      jp.contact_method,
      jp.created_at,
      jp.expires_at,
      (jp.posted_by = $1) AS is_own
    FROM job_posts jp
    WHERE jp.expires_at > now()
    `

    if (city && String(city).trim()) {
      sql += ` AND jp.location ILIKE $${idx}`
      params.push(`%${String(city).trim()}%`)
      idx++
    }

    if (workMode && String(workMode).trim() && String(workMode).trim() !== 'either') {
      if (!VALID_WORK_MODES.includes(workMode)) {
        return res.status(400).json({ message: 'Invalid work mode filter.' })
      }
      sql += ` AND jp.work_mode = $${idx}`
      params.push(workMode)
      idx++
    }

    if (skill && String(skill).trim()) {
      const s = String(skill).trim()
      sql += ` AND (
        jp.title ILIKE $${idx}
        OR jp.description ILIKE $${idx}
      )`
      params.push(`%${s}%`)
      idx++
    }

    sql += ` ORDER BY jp.created_at DESC LIMIT 100`

    const { rows } = await client.query(sql, params)
    return res.json({ ok: true, opportunities: rows })
  } catch (err) {
    console.error('jobs/opportunities GET error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// POST /api/community/jobs/seekers
// Member creates/updates her skills profile.
// ───────────────────────────────────────────────
router.post('/seekers', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const {
    skills, // array of tags
    experienceSummary,
    availability,
    preferredLocation,
    preferredWorkMode, // remote|onsite|either
    wantsDirectContact,
  } = req.body || {}

  if (!Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ message: 'Skills are required.' })
  }
  const cleanedSkills = skills.map((s) => String(s).trim()).filter(Boolean)
  if (cleanedSkills.length === 0) {
    return res.status(400).json({ message: 'At least one skill tag is required.' })
  }

  if (!preferredLocation || !String(preferredLocation).trim()) {
    return res.status(400).json({ message: 'Preferred location is required.' })
  }

  const mode = preferredWorkMode || 'either'
  if (!['remote', 'onsite', 'either'].includes(mode)) {
    return res.status(400).json({ message: 'Invalid work mode.' })
  }

  let client
  try {
    client = await pool.connect()
    const user = await resolveUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Account not found.' })

    await client.query(
      `INSERT INTO job_seeker_profiles
        (user_id, skills, experience_summary, availability, preferred_location, preferred_work_mode, wants_direct_contact)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         skills = EXCLUDED.skills,
         experience_summary = EXCLUDED.experience_summary,
         availability = EXCLUDED.availability,
         preferred_location = EXCLUDED.preferred_location,
         preferred_work_mode = EXCLUDED.preferred_work_mode,
         wants_direct_contact = EXCLUDED.wants_direct_contact,
         updated_at = now()`,
      [
        user.id,
        cleanedSkills,
        experienceSummary ? String(experienceSummary).trim() : null,
        availability ? String(availability).trim() : null,
        String(preferredLocation).trim(),
        mode,
        Boolean(wantsDirectContact),
      ],
    )

    return res.json({ ok: true })
  } catch (err) {
    console.error('jobs/seekers POST error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// GET /api/community/jobs/seekers
// Filters:
//  - city (preferred_location)
//  - skill (skills contains match)
//  - workMode: remote|onsite|either
// ───────────────────────────────────────────────
router.get('/seekers', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const { city, skill, workMode } = req.query || {}

  let client
  try {
    client = await pool.connect()
    const user = await resolveUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Account not found.' })

    const params = [user.id]
    let idx = 2

    let sql = `SELECT
      jsp.id,
      jsp.skills,
      jsp.experience_summary,
      jsp.availability,
      jsp.preferred_location,
      jsp.preferred_work_mode,
      jsp.wants_direct_contact,
      jsp.created_at,
      (jsp.user_id = $1) AS is_own,
      p.full_name AS member_name
    FROM job_seeker_profiles jsp
    JOIN users u ON jsp.user_id = u.id
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE jsp.is_visible = true
    `

    if (city && String(city).trim()) {
      sql += ` AND jsp.preferred_location ILIKE $${idx}`
      params.push(`%${String(city).trim()}%`)
      idx++
    }

    if (workMode && String(workMode).trim() && String(workMode).trim() !== 'either') {
      if (!VALID_WORK_MODES.includes(workMode)) {
        return res.status(400).json({ message: 'Invalid work mode filter.' })
      }
      sql += ` AND (jsp.preferred_work_mode = $${idx} OR jsp.preferred_work_mode = 'either')`
      params.push(workMode)
      idx++
    }

    if (skill && String(skill).trim()) {
      sql += ` AND EXISTS (
        SELECT 1
        FROM unnest(jsp.skills) s
        WHERE s ILIKE $${idx}
      )`
      params.push(`%${String(skill).trim()}%`)
      idx++
    }

    sql += ` ORDER BY jsp.created_at DESC LIMIT 100`

    const { rows } = await client.query(sql, params)
    return res.json({ ok: true, seekers: rows })
  } catch (err) {
    console.error('jobs/seekers GET error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// POST /api/community/jobs/contact/reveal
// Reveals contact details to verified members and writes to audit_log.
// Contact details are returned only in this endpoint.
// ───────────────────────────────────────────────
router.post('/contact/reveal', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const { targetType, targetId } = req.body || {}

  if (!targetType || !['opportunity', 'seeker'].includes(targetType)) {
    return res.status(400).json({ message: 'Invalid target type.' })
  }
  if (!targetId) {
    return res.status(400).json({ message: 'Target id is required.' })
  }

  let client
  try {
    client = await pool.connect()
    const actor = await resolveUser(client, userId)
    if (!actor) return res.status(403).json({ message: 'Account not found.' })

    let contactPayload = null

    if (targetType === 'opportunity') {
      const { rows } = await client.query(
        `SELECT id, contact_method, contact_value
         FROM job_posts
         WHERE id = $1 AND expires_at > now()`,
        [targetId],
      )
      if (rows.length === 0) return res.status(404).json({ message: 'Opportunity not found.' })
      contactPayload = {
        contact_method: rows[0].contact_method,
        contact_value: rows[0].contact_value,
      }
    }

    if (targetType === 'seeker') {
      const { rows } = await client.query(
        `SELECT
          jsp.id,
          jsp.wants_direct_contact,
          p.email,
          p.phone,
          p.whatsapp
        FROM job_seeker_profiles jsp
        LEFT JOIN profiles p ON p.user_id = jsp.user_id
        WHERE jsp.id = $1
          AND jsp.is_visible = true`,
        [targetId],
      )
      if (rows.length === 0) return res.status(404).json({ message: 'Profile not found.' })
      if (!rows[0].wants_direct_contact) {
        return res.status(403).json({ message: 'This member does not share direct contact details.' })
      }
      contactPayload = {
        email: rows[0].email || null,
        phone: rows[0].phone || null,
        whatsapp: rows[0].whatsapp || null,
      }
    }

    // Write audit log (no PII in metadata).
    await client.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        actor.id,
        'jobs.contact_revealed',
        targetType === 'opportunity' ? 'job_post' : 'job_seeker_profile',
        targetId,
        JSON.stringify({ reveal_type: targetType }),
      ],
    )

    return res.json({ ok: true, contact: contactPayload })
  } catch (err) {
    console.error('jobs/contact/reveal error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

export default router

