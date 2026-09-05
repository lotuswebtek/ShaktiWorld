import pg from 'pg'

function readDatabaseUrl() {
  return String(process.env.DATABASE_URL || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
}

function useSsl(url) {
  if (process.env.DATABASE_SSL === 'false') return false
  if (process.env.DATABASE_SSL === 'true') return true
  if (process.env.VERCEL) return true
  return /railway|rlwy\.net|supabase/i.test(url)
}

function poolConfig() {
  const connectionString = readDatabaseUrl()
  if (!connectionString) {
    return { connectionString: '' }
  }

  try {
    const url = new URL(connectionString.replace(/^postgres:\/\//, 'postgresql://'))
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 5432,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, '')) || 'railway',
      ssl: useSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    }
  } catch {
    return {
      connectionString,
      ssl: useSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    }
  }
}

export function databaseHost() {
  const connectionString = readDatabaseUrl()
  if (!connectionString) return null
  try {
    return new URL(connectionString.replace(/^postgres:\/\//, 'postgresql://')).hostname
  } catch {
    return null
  }
}

const pool = new pg.Pool(poolConfig())

export default pool
