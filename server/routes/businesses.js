import { Router } from 'express'
import { getRequestUserId } from '../auth.js'
import pool from '../db/pool.js'

const router = Router()

const VALID_CATEGORIES = [
  'home_cooked_food',
  'tailoring',
  'handicrafts',
  'childcare',
  'beauty_services',
  'other',
]

async function resolveUser(client, clerkId) {
  const { rows } = await client.query(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  )
  return rows[0] || null
}

router.get('/cities', async (_req, res) => {
  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      `SELECT city, count(*)::int AS count
       FROM businesses
       WHERE is_active = true
       GROUP BY city
       ORDER BY city ASC`,
    )
    return res.json({ ok: true, cities: rows })
  } catch (err) {
    console.error('businesses/cities error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

router.get('/mine', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  let client
  try {
    client = await pool.connect()
    const user = await resolveUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Account not found.' })

    const { rows } = await client.query(
      `SELECT id, name, category, description, city, state, country,
              service_area, contact, operating_hours, photo_urls, is_active
       FROM businesses
       WHERE owner_id = $1
       LIMIT 1`,
      [user.id],
    )

    return res.json({ ok: true, business: rows[0] || null })
  } catch (err) {
    console.error('businesses/mine error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

router.post('/mine', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const {
    name,
    category,
    description,
    city,
    state,
    country,
    serviceArea,
    contact,
    operatingHours,
    photoUrls,
  } = req.body || {}

  if (!name || !city || !category || !contact) {
    return res.status(400).json({ message: 'Name, category, city, and contact are required.' })
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: 'Invalid business category.' })
  }

  const cleanedPhotos = Array.isArray(photoUrls)
    ? photoUrls.map((v) => String(v).trim()).filter(Boolean).slice(0, 5)
    : []

  let client
  try {
    client = await pool.connect()
    const user = await resolveUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Account not found.' })

    await client.query(
      `INSERT INTO businesses
        (owner_id, name, category, description, city, state, country, service_area, contact, operating_hours, photo_urls, is_active)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
       ON CONFLICT (owner_id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         city = EXCLUDED.city,
         state = EXCLUDED.state,
         country = EXCLUDED.country,
         service_area = EXCLUDED.service_area,
         contact = EXCLUDED.contact,
         operating_hours = EXCLUDED.operating_hours,
         photo_urls = EXCLUDED.photo_urls,
         updated_at = now(),
         is_active = true`,
      [
        user.id,
        String(name).trim(),
        category,
        description ? String(description).trim() : null,
        String(city).trim(),
        state ? String(state).trim() : null,
        country ? String(country).trim() : 'India',
        serviceArea ? String(serviceArea).trim() : null,
        String(contact).trim(),
        operatingHours ? String(operatingHours).trim() : null,
        cleanedPhotos,
      ],
    )

    return res.json({ ok: true })
  } catch (err) {
    console.error('businesses/mine POST error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

router.get('/city/:city', async (req, res) => {
  const { city } = req.params
  const { category, q } = req.query || {}

  let client
  try {
    client = await pool.connect()
    const params = [city]
    let idx = 2
    let sql = `SELECT
      b.id,
      b.name,
      b.category,
      b.description,
      b.city,
      b.state,
      b.country,
      b.service_area,
      b.contact,
      b.operating_hours,
      b.photo_urls,
      b.owner_id,
      p.full_name AS owner_name
    FROM businesses b
    LEFT JOIN profiles p ON p.user_id = b.owner_id
    WHERE b.is_active = true
      AND lower(b.city) = lower($1)`

    if (category && String(category).trim()) {
      if (!VALID_CATEGORIES.includes(String(category).trim())) {
        return res.status(400).json({ message: 'Invalid category filter.' })
      }
      sql += ` AND b.category = $${idx}`
      params.push(String(category).trim())
      idx++
    }

    if (q && String(q).trim()) {
      sql += ` AND (
        b.name ILIKE $${idx}
        OR coalesce(b.description, '') ILIKE $${idx}
      )`
      params.push(`%${String(q).trim()}%`)
      idx++
    }

    sql += ' ORDER BY b.name ASC'

    const { rows } = await client.query(sql, params)
    return res.json({ ok: true, businesses: rows })
  } catch (err) {
    console.error('businesses/city error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

router.get('/members/:userId', async (req, res) => {
  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      `SELECT u.id, p.full_name, p.photo_url, p.city, p.state, p.country, p.bio
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1
       LIMIT 1`,
      [req.params.userId],
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Member not found.' })
    }

    return res.json({ ok: true, member: rows[0] })
  } catch (err) {
    console.error('businesses/member error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

export { VALID_CATEGORIES }
export default router

