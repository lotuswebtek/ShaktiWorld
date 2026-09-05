import { getAuth } from '@clerk/express'
import pool from '../db/pool.js'

/**
 * Express middleware that blocks every request under /community/*
 * unless the user's account_status is 'verified'.
 *
 * Checked server-side against the database — not a client-side guard.
 */
export default async function requireVerified(req, res, next) {
  const { userId } = getAuth(req)

  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated.' })
  }

  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      'SELECT account_status FROM users WHERE clerk_id = $1',
      [userId],
    )

    if (rows.length === 0) {
      return res.status(403).json({
        message: 'Account setup incomplete.',
        step: 'profile',
      })
    }

    const { account_status } = rows[0]

    if (account_status === 'verified') {
      return next()
    }

    if (account_status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended.' })
    }

    // pending
    return res.status(403).json({
      message: 'Account verification pending.',
      step: 'verification',
    })
  } catch (err) {
    console.error('requireVerified error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
}
