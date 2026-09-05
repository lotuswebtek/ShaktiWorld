import pg from 'pg'

// Connection string comes from Railway DATABASE_PUBLIC_URL in server/.env
const connectionString = process.env.DATABASE_URL || ''

function useSsl(url) {
  if (process.env.DATABASE_SSL === 'false') return false
  if (process.env.DATABASE_SSL === 'true') return true
  return /railway|rlwy\.net|supabase/i.test(url)
}

const pool = new pg.Pool({
  connectionString,
  ssl: useSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
})

export default pool

