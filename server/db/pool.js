import pg from 'pg'

// Connection string comes from Railway DATABASE_PUBLIC_URL in server/.env
const connectionString = String(process.env.DATABASE_URL || '')
  .trim()
  .replace(/^['"]|['"]$/g, '')

function useSsl(url) {
  if (process.env.DATABASE_SSL === 'false') return false
  if (process.env.DATABASE_SSL === 'true') return true
  if (process.env.VERCEL) return true
  return /railway|rlwy\.net|supabase/i.test(url)
}

const pool = new pg.Pool({
  connectionString,
  ssl: useSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
})

export default pool

