import { Router } from 'express'
import { getAuth } from '@clerk/express'
import pool from '../db/pool.js'

const router = Router()

const VALID_REACTIONS = ['heart', 'hug', 'strength', 'listen', 'pray']
const DAILY_POST_LIMIT = 5

/**
 * Resolve the internal user id and account age from a Clerk user id.
 */
async function resolveUser(client, clerkId) {
  const { rows } = await client.query(
    'SELECT id, created_at FROM users WHERE clerk_id = $1',
    [clerkId],
  )
  return rows[0] || null
}

/**
 * Check whether the account is younger than 7 days.
 */
function isNewAccount(user) {
  const age = Date.now() - new Date(user.created_at).getTime()
  return age < 7 * 24 * 60 * 60 * 1000
}

// ───────────────────────────────────────────────
// GET /api/community/listening
// Feed of approved listening posts, newest first.
// ───────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { userId } = getAuth(req)
  let client
  try {
    client = await pool.connect()
    const user = userId ? await resolveUser(client, userId) : null

    const { rows } = await client.query(
      `SELECT
         lp.id, lp.title, lp.body, lp.visibility, lp.is_anonymous,
         lp.moderation_status, lp.created_at,
         lp.author_id,
         p.full_name AS author_name,
         (SELECT count(*) FROM listening_replies lr WHERE lr.post_id = lp.id) AS reply_count
       FROM listening_posts lp
       LEFT JOIN profiles p ON p.user_id = lp.author_id
       WHERE lp.moderation_status = 'approved'
         AND lp.is_archived = false
         AND lp.visibility IN ('public', 'members_only')
       ORDER BY lp.created_at DESC
       LIMIT 50`,
    )

    // Mask author for anonymous posts
    const posts = rows.map((r) => ({
      ...r,
      author_name: r.is_anonymous ? null : r.author_name,
      is_own: user ? r.author_id === user.id : false,
      author_id: undefined, // never expose to client
    }))

    return res.json({ posts })
  } catch (err) {
    console.error('listening GET error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// POST /api/community/listening
// Create a new listening post.
// Rate limited to 5 per user per day.
// New accounts (< 7 days) go to pre-publication review.
// ───────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const { title, body, isAnonymous } = req.body || {}
  if (!body || !body.trim()) {
    return res.status(400).json({ message: 'Post body is required.' })
  }

  let client
  try {
    client = await pool.connect()
    const user = await resolveUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Account not found.' })

    // Rate limit: 5 posts per day
    const { rows: countRows } = await client.query(
      `SELECT count(*) AS cnt FROM listening_posts
       WHERE author_id = $1 AND created_at > now() - interval '24 hours'`,
      [user.id],
    )
    if (parseInt(countRows[0].cnt, 10) >= DAILY_POST_LIMIT) {
      return res.status(429).json({
        message: `You can share up to ${DAILY_POST_LIMIT} posts per day. Please try again tomorrow.`,
      })
    }

    // New accounts go to review queue
    const moderationStatus = isNewAccount(user) ? 'pending_review' : 'approved'

    const { rows } = await client.query(
      `INSERT INTO listening_posts (author_id, title, body, is_anonymous, moderation_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, moderation_status, created_at`,
      [
        user.id,
        title ? String(title).trim() : null,
        String(body).trim(),
        Boolean(isAnonymous),
        moderationStatus,
      ],
    )

    const post = rows[0]
    return res.json({
      ok: true,
      id: post.id,
      moderationStatus: post.moderation_status,
      message: moderationStatus === 'pending_review'
        ? 'Your post has been submitted for review. It will appear in the feed once a moderator approves it.'
        : 'Your post is now live.',
    })
  } catch (err) {
    console.error('listening POST error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// GET /api/community/listening/:postId
// Single post with replies.
// ───────────────────────────────────────────────
router.get('/:postId', async (req, res) => {
  const { userId } = getAuth(req)
  let client
  try {
    client = await pool.connect()
    const user = userId ? await resolveUser(client, userId) : null

    const { rows: postRows } = await client.query(
      `SELECT lp.*, p.full_name AS author_name
       FROM listening_posts lp
       LEFT JOIN profiles p ON p.user_id = lp.author_id
       WHERE lp.id = $1 AND lp.moderation_status = 'approved'`,
      [req.params.postId],
    )
    if (postRows.length === 0) {
      return res.status(404).json({ message: 'Post not found.' })
    }

    const post = postRows[0]

    // Replies (one level deep)
    const { rows: replies } = await client.query(
      `SELECT lr.id, lr.body, lr.is_anonymous, lr.created_at,
              lr.author_id,
              p.full_name AS author_name
       FROM listening_replies lr
       LEFT JOIN profiles p ON p.user_id = lr.author_id
       WHERE lr.post_id = $1
       ORDER BY lr.created_at ASC`,
      [req.params.postId],
    )

    // Reactions for post + all replies
    const allIds = [post.id, ...replies.map((r) => r.id)]
    const { rows: reactions } = await client.query(
      `SELECT target_type, target_id, reaction, count(*) AS cnt
       FROM listening_reactions
       WHERE target_id = ANY($1)
       GROUP BY target_type, target_id, reaction`,
      [allIds],
    )

    // User's own reactions
    let userReactions = []
    if (user) {
      const { rows: ur } = await client.query(
        `SELECT target_type, target_id, reaction
         FROM listening_reactions
         WHERE user_id = $1 AND target_id = ANY($2)`,
        [user.id, allIds],
      )
      userReactions = ur
    }

    // Build reaction map
    const reactionMap = {}
    for (const r of reactions) {
      const key = `${r.target_type}:${r.target_id}`
      if (!reactionMap[key]) reactionMap[key] = {}
      reactionMap[key][r.reaction] = parseInt(r.cnt, 10)
    }

    const userReactionSet = new Set(
      userReactions.map((r) => `${r.target_type}:${r.target_id}:${r.reaction}`),
    )

    return res.json({
      post: {
        id: post.id,
        title: post.title,
        body: post.body,
        is_anonymous: post.is_anonymous,
        author_name: post.is_anonymous ? null : post.author_name,
        is_own: user ? post.author_id === user.id : false,
        created_at: post.created_at,
        reactions: reactionMap[`post:${post.id}`] || {},
        userReactions: VALID_REACTIONS.filter((r) =>
          userReactionSet.has(`post:${post.id}:${r}`),
        ),
      },
      replies: replies.map((r) => ({
        id: r.id,
        body: r.body,
        is_anonymous: r.is_anonymous,
        author_name: r.is_anonymous ? null : r.author_name,
        is_own: user ? r.author_id === user.id : false,
        created_at: r.created_at,
        reactions: reactionMap[`reply:${r.id}`] || {},
        userReactions: VALID_REACTIONS.filter((rx) =>
          userReactionSet.has(`reply:${r.id}:${rx}`),
        ),
      })),
    })
  } catch (err) {
    console.error('listening/:postId error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// POST /api/community/listening/:postId/replies
// Add a reply (one level deep — no nested replies).
// ───────────────────────────────────────────────
router.post('/:postId/replies', async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const { body, isAnonymous } = req.body || {}
  if (!body || !body.trim()) {
    return res.status(400).json({ message: 'Reply body is required.' })
  }

  let client
  try {
    client = await pool.connect()
    const user = await resolveUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Account not found.' })

    // Verify post exists
    const { rows: postRows } = await client.query(
      'SELECT id FROM listening_posts WHERE id = $1 AND moderation_status = $2',
      [req.params.postId, 'approved'],
    )
    if (postRows.length === 0) {
      return res.status(404).json({ message: 'Post not found.' })
    }

    const { rows } = await client.query(
      `INSERT INTO listening_replies (post_id, author_id, body, is_anonymous)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [req.params.postId, user.id, String(body).trim(), Boolean(isAnonymous)],
    )

    return res.json({ ok: true, id: rows[0].id })
  } catch (err) {
    console.error('listening reply POST error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// POST /api/community/listening/react
// Toggle a supportive reaction on a post or reply.
// ───────────────────────────────────────────────
router.post('/react', async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const { targetType, targetId, reaction } = req.body || {}

  if (!['post', 'reply'].includes(targetType)) {
    return res.status(400).json({ message: 'Invalid target type.' })
  }
  if (!VALID_REACTIONS.includes(reaction)) {
    return res.status(400).json({ message: 'Only supportive reactions are allowed.' })
  }

  let client
  try {
    client = await pool.connect()
    const user = await resolveUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Account not found.' })

    // Toggle: if exists, remove; if not, add
    const { rows: existing } = await client.query(
      `SELECT id FROM listening_reactions
       WHERE user_id = $1 AND target_type = $2 AND target_id = $3 AND reaction = $4`,
      [user.id, targetType, targetId, reaction],
    )

    if (existing.length > 0) {
      await client.query('DELETE FROM listening_reactions WHERE id = $1', [existing[0].id])
      return res.json({ ok: true, toggled: 'removed' })
    }

    await client.query(
      `INSERT INTO listening_reactions (user_id, target_type, target_id, reaction)
       VALUES ($1, $2, $3, $4)`,
      [user.id, targetType, targetId, reaction],
    )
    return res.json({ ok: true, toggled: 'added' })
  } catch (err) {
    console.error('listening react error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// POST /api/community/listening/report
// Report a post or reply to the moderation queue.
// ───────────────────────────────────────────────
router.post('/report', async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const { targetType, targetId, reason } = req.body || {}

  if (!['post', 'reply'].includes(targetType)) {
    return res.status(400).json({ message: 'Invalid target type.' })
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: 'A reason for reporting is required.' })
  }

  let client
  try {
    client = await pool.connect()
    const user = await resolveUser(client, userId)
    if (!user) return res.status(403).json({ message: 'Account not found.' })

    await client.query(
      `INSERT INTO listening_reports (reporter_id, target_type, target_id, reason)
       VALUES ($1, $2, $3, $4)`,
      [user.id, targetType, targetId, String(reason).trim()],
    )

    return res.json({ ok: true, message: 'Report submitted. A moderator will review it.' })
  } catch (err) {
    console.error('listening report error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

export default router
