import pg from 'pg'
import { databaseHost, libpqParams, readDatabaseUrl } from './url.js'

function useSsl(url) {
  if (process.env.DATABASE_SSL === 'false') return false
  if (process.env.DATABASE_SSL === 'true') return true
  if (process.env.VERCEL) return true
  return /railway|rlwy\.net|supabase/i.test(url)
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function poolConfig() {
  const connectionString = readDatabaseUrl()
  if (!connectionString) {
    return {
      host: '127.0.0.1',
      port: 5432,
      user: 'unused',
      password: 'unused',
      database: 'unused',
    }
  }

  try {
    const url = new URL(connectionString.replace(/^postgres:\/\//, 'postgresql://'))
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 5432,
      user: safeDecode(url.username),
      password: safeDecode(url.password),
      database: safeDecode(url.pathname.replace(/^\//, '')) || 'railway',
      ssl: useSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    }
  } catch {
    const params = libpqParams(connectionString)
    if (params.host) {
      return {
        host: params.host,
        port: params.port ? Number(params.port) : 5432,
        user: params.user,
        password: params.password,
        database: params.dbname || params.database || 'railway',
        ssl: useSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
      }
    }
    return {
      connectionString,
      ssl: useSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    }
  }
}

export { databaseHost }

const pool = new pg.Pool(poolConfig())

export default pool
