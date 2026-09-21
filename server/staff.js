import { clerkClient } from '@clerk/express'

function configuredAdminEmails() {
  return new Set(
    String(process.env.ADMIN_EMAILS || 'ritzdhanwani@gmail.com')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  )
}

async function clerkEmailsFor(clerkId) {
  const user = await clerkClient.users.getUser(clerkId)
  return (user.emailAddresses || [])
    .map((item) => String(item.emailAddress || '').trim().toLowerCase())
    .filter(Boolean)
}

/**
 * If this Clerk user is a configured admin, attach admin + verified
 * to the current clerk_id so staff nav and moderation APIs work.
 */
export async function ensureConfiguredAdmin(client, clerkId) {
  const allowed = configuredAdminEmails()
  if (!clerkId || allowed.size === 0) return

  let emails
  try {
    emails = await clerkEmailsFor(clerkId)
  } catch (err) {
    console.error('admin lookup:', err instanceof Error ? err.message : 'unknown')
    return
  }

  const matched = emails.filter((email) => allowed.has(email))
  if (matched.length === 0) return

  const { rows: current } = await client.query(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  )

  if (current.length === 0) {
    const { rowCount } = await client.query(
      `UPDATE users u
       SET clerk_id = $1,
           role = 'admin',
           account_status = 'verified',
           updated_at = now()
       FROM profiles p
       WHERE p.user_id = u.id
         AND lower(p.email) = ANY($2::text[])
         AND NOT EXISTS (SELECT 1 FROM users x WHERE x.clerk_id = $1)`,
      [clerkId, matched],
    )
    if (rowCount > 0) return
  }

  await client.query(
    `INSERT INTO users (clerk_id, role, account_status)
     VALUES ($1, 'admin', 'verified')
     ON CONFLICT (clerk_id) DO UPDATE SET
       role = 'admin',
       account_status = 'verified',
       updated_at = now()`,
    [clerkId],
  )
}
