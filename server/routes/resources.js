import { Router } from 'express'
import pool from '../db/pool.js'

const router = Router()

const RESOURCE_SELECT = `
  id, title, description, topic, resource_type, reading_time_minutes,
  tags, body_markdown, url, storage_key, source, created_at
`

router.get('/', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.json({ ok: true, topics: [], groups: {}, resources: [] })
  }
  const { topic } = req.query || {}
  let client
  try {
    client = await pool.connect()
    const params = []
    let sql = `SELECT ${RESOURCE_SELECT}
      FROM resources
      WHERE is_published = true`

    if (topic && String(topic).trim()) {
      params.push(String(topic).trim())
      sql += ` AND topic = $1`
    }

    sql += ' ORDER BY topic ASC NULLS LAST, created_at DESC'

    const { rows: topicRows } = await client.query(
      `SELECT DISTINCT topic
       FROM resources
       WHERE is_published = true AND topic IS NOT NULL
       ORDER BY topic ASC`,
    )

    const { rows } = await client.query(sql, params)

    const grouped = {}
    for (const item of rows) {
      const key = item.topic || 'Uncategorised'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push({
        ...item,
        body_markdown: undefined,
      })
    }

    const topics = topicRows.map((r) => r.topic)
    return res.json({
      ok: true,
      topics,
      groups: grouped,
      resources: rows.map((r) => ({ ...r, body_markdown: undefined })),
    })
  } catch (err) {
    console.error('resources GET error:', err.message)
    return res.status(500).json({ message: 'Internal error.', detail: err.message })
  } finally {
    if (client) client.release()
  }
})

router.get('/:id', async (req, res) => {
  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      `SELECT ${RESOURCE_SELECT}
       FROM resources
       WHERE id = $1 AND is_published = true`,
      [req.params.id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Resource not found.' })
    }

    return res.json({ ok: true, resource: rows[0] })
  } catch (err) {
    console.error('resources/:id error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

export default router
