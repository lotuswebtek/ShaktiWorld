import pg from 'pg'

const email = process.argv[2]
if (!email) {
  console.error('Pass the account email as the first argument.')
  process.exit(1)
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const client = await pool.connect()
try {
  await client.query('BEGIN')
  const { rows } = await client.query(
    `UPDATE users u
     SET role = 'admin', account_status = 'verified', updated_at = now()
     FROM profiles p
     WHERE p.user_id = u.id AND lower(p.email) = lower($1)
     RETURNING u.id`,
    [email],
  )

  if (rows.length === 0) {
    await client.query('ROLLBACK')
    console.error('No profile found for that address.')
    process.exit(1)
  }

  await client.query(
    `UPDATE identity_verifications
     SET status = 'approved', reviewed_at = now(), updated_at = now()
     WHERE user_id = $1 AND status IN ('submitted', 'under_review')`,
    [rows[0].id],
  )

  await client.query('COMMIT')
  console.log('updated', rows.length, 'user to admin')
} catch (err) {
  await client.query('ROLLBACK').catch(() => {})
  console.error(err.message)
  process.exit(1)
} finally {
  client.release()
  await pool.end()
}
