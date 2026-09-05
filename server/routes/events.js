import { Router } from 'express'
import { getAuth } from '@clerk/express'
import pool from '../db/pool.js'
import { buildEventIcs, icsFilename } from '../ics.js'

const router = Router()

const EVENT_SELECT = `
  e.id, e.title, e.description, e.location, e.is_online,
  e.starts_at, e.ends_at, e.cover_image, e.capacity,
  (
    SELECT count(*)::int FROM event_rsvps r
    WHERE r.event_id = e.id AND r.status = 'going'
  ) AS rsvp_count
`

async function resolveVerifiedUser(client, clerkId) {
  if (!clerkId) return null
  const { rows } = await client.query(
    `SELECT id, account_status FROM users WHERE clerk_id = $1`,
    [clerkId],
  )
  if (rows.length === 0 || rows[0].account_status !== 'verified') return null
  return rows[0]
}

router.get('/', async (_req, res) => {
  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      `SELECT ${EVENT_SELECT}
       FROM events e
       WHERE e.is_published = true
       ORDER BY e.starts_at ASC`,
    )

    const now = Date.now()
    const upcoming = []
    const past = []
    for (const event of rows) {
      const end = new Date(event.ends_at || event.starts_at).getTime()
      if (end >= now) upcoming.push(event)
      else past.push(event)
    }
    past.reverse()

    return res.json({ ok: true, upcoming, past })
  } catch (err) {
    console.error('events GET error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

router.get('/:id/ics', async (req, res) => {
  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      `SELECT id, title, description, location, is_online, event_url, starts_at, ends_at
       FROM events
       WHERE id = $1 AND is_published = true`,
      [req.params.id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' })
    }

    const ics = buildEventIcs(rows[0])
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${icsFilename(rows[0].title)}"`)
    return res.send(ics)
  } catch (err) {
    console.error('events ics error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

router.get('/:id', async (req, res) => {
  const { userId } = getAuth(req)
  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      `SELECT ${EVENT_SELECT}, e.event_url
       FROM events e
       WHERE e.id = $1 AND e.is_published = true`,
      [req.params.id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' })
    }

    const event = rows[0]
    const spotsLeft = event.capacity == null ? null : Math.max(0, event.capacity - event.rsvp_count)
    let hasRsvp = false

    const user = await resolveVerifiedUser(client, userId)
    if (user) {
      const { rows: rsvpRows } = await client.query(
        `SELECT status FROM event_rsvps WHERE event_id = $1 AND user_id = $2`,
        [event.id, user.id],
      )
      hasRsvp = rsvpRows[0]?.status === 'going'
    }

    return res.json({
      ok: true,
      event: {
        ...event,
        event_url: hasRsvp ? event.event_url : null,
        spots_left: spotsLeft,
        has_rsvp: hasRsvp,
      },
    })
  } catch (err) {
    console.error('events/:id error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

export default router
