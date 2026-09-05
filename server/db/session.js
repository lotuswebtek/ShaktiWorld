import pool from './pool.js'

/**
 * Acquire a DB client and set session-level variables (app.clerk_id, app.role)
 * so PostgreSQL RLS policies can inspect the current user.
 *
 * Usage:
 *   const { client, user } = await withDbSession(clerkId)
 *   try { ... } finally { client.release() }
 */
export async function withDbSession(clerkId) {
  const client = await pool.connect()

  if (!clerkId) {
    await client.query("SET LOCAL app.clerk_id = ''")
    await client.query("SET LOCAL app.role = ''")
    return { client, user: null }
  }

  await client.query('SET LOCAL app.clerk_id = $1', [clerkId])

  const { rows } = await client.query(
    'SELECT id, role, account_status FROM users WHERE clerk_id = $1',
    [clerkId],
  )
  const user = rows[0] || null

  await client.query('SET LOCAL app.role = $1', [user?.role || ''])

  return { client, user }
}
