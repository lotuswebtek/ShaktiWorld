import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const r = await pool.query('select current_database() as db')
console.log('connected', r.rows[0].db)

const tables = await pool.query(
  "select tablename from pg_tables where schemaname = 'public' order by tablename",
)
console.log('tables', tables.rows.map((x) => x.tablename).join(',') || '(none)')
await pool.end()
