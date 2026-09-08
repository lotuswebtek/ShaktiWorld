import { Router } from 'express'
import { getRequestUserId } from '../auth.js'
import pool from '../db/pool.js'

const router = Router()

async function resolveVerifiedUser(client, clerkId) {
  const { rows } = await client.query(
    'SELECT id, account_status FROM users WHERE clerk_id = $1',
    [clerkId],
  )
  return rows[0] || null
}

router.post('/:id/rsvp', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  let client
  try {
    client = await pool.connect()
    await client.query('BEGIN')

    const user = await resolveVerifiedUser(client, userId)
    if (!user || user.account_status !== 'verified') {
      await client.query('ROLLBACK')
      return res.status(403).json({ message: 'A verified member account is required to RSVP.' })
    }

    const { rows: eventRows } = await client.query(
      `SELECT id, capacity, starts_at, ends_at
       FROM events
       WHERE id = $1 AND is_published = true
       FOR UPDATE`,
      [req.params.id],
    )
    if (eventRows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Event not found.' })
    }

    const event = eventRows[0]
    const end = new Date(event.ends_at || event.starts_at).getTime()
    if (end < Date.now()) {
      await client.query('ROLLBACK')
      return res.status(400).json({ message: 'This event has already ended.' })
    }

    const { rows: countRows } = await client.query(
      `SELECT count(*)::int AS cnt FROM event_rsvps
       WHERE event_id = $1 AND status = 'going'`,
      [event.id],
    )
    const goingCount = countRows[0].cnt

    const { rows: existing } = await client.query(
      `SELECT status FROM event_rsvps WHERE event_id = $1 AND user_id = $2`,
      [event.id, user.id],
    )

    if (existing[0]?.status === 'going') {
      await client.query('COMMIT')
      return res.json({ ok: true, status: 'going', already: true })
    }

    if (event.capacity != null && goingCount >= event.capacity) {
      await client.query('ROLLBACK')
      return res.status(409).json({ message: 'This gathering is at capacity.' })
    }

    await client.query(
      `INSERT INTO event_rsvps (event_id, user_id, status)
       VALUES ($1, $2, 'going')
       ON CONFLICT (event_id, user_id) DO UPDATE SET
         status = 'going',
         updated_at = now()`,
      [event.id, user.id],
    )

    await client.query('COMMIT')
    return res.json({ ok: true, status: 'going' })
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {})
    console.error('event rsvp POST error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

router.delete('/:id/rsvp', async (req, res) => {
  const userId = await getRequestUserId(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  let client
  try {
    client = await pool.connect()
    const user = await resolveVerifiedUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Not authenticated.' })

    await client.query(
      `UPDATE event_rsvps
       SET status = 'cancelled', updated_at = now()
       WHERE event_id = $1 AND user_id = $2`,
      [req.params.id, user.id],
    )

    return res.json({ ok: true, status: 'cancelled' })
  } catch (err) {
    console.error('event rsvp DELETE error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

export default router
