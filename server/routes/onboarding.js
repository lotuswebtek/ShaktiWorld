import { Router } from 'express'
import multer from 'multer'
import { getAuth } from '@clerk/express'
import pool from '../db/pool.js'
import { uploadIdDocument } from '../storage.js'
import { CURRENT_LEGAL } from '../legal.js'

async function recordCurrentConsent(client, dbUserId) {
  const acceptedAt = new Date()
  await client.query(
    `UPDATE users
     SET terms_version = $2,
         terms_accepted_at = CASE
           WHEN terms_version IS DISTINCT FROM $2 OR terms_accepted_at IS NULL THEN $3
           ELSE terms_accepted_at
         END,
         updated_at = now()
     WHERE id = $1`,
    [dbUserId, CURRENT_LEGAL.terms, acceptedAt],
  )

  for (const document of ['terms', 'privacy', 'guidelines']) {
    await client.query(
      `INSERT INTO legal_consents (user_id, document, version, accepted_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, document, version) DO NOTHING`,
      [dbUserId, document, CURRENT_LEGAL[document], acceptedAt],
    )
  }

  const { rows: consentRows } = await client.query(
    'SELECT terms_accepted_at FROM users WHERE id = $1',
    [dbUserId],
  )
  return consentRows[0]?.terms_accepted_at
    ? new Date(consentRows[0].terms_accepted_at)
    : acceptedAt
}

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    cb(null, allowed.includes(file.mimetype))
  },
})

// ───────────────────────────────────────────────
// GET /api/onboarding/status
// Returns the user's current onboarding step so the
// client can route to the correct screen.
// ───────────────────────────────────────────────
router.get('/status', async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  let client
  try {
    client = await pool.connect()

    // Check if user row exists
    const { rows: userRows } = await client.query(
      'SELECT id, account_status, role, terms_version, terms_accepted_at FROM users WHERE clerk_id = $1',
      [userId],
    )

    if (userRows.length === 0) {
      return res.json({
        step: 'profile',
        accountStatus: null,
        role: null,
        termsVersion: null,
        termsAcceptedAt: null,
      })
    }

    const user = userRows[0]
    const consent = {
      termsVersion: user.terms_version || null,
      termsAcceptedAt: user.terms_accepted_at || null,
    }

    // Check if profile exists
    const { rows: profileRows } = await client.query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [user.id],
    )

    if (profileRows.length === 0) {
      return res.json({
        step: 'profile',
        accountStatus: user.account_status,
        role: user.role,
        ...consent,
      })
    }

    // Check verification
    const { rows: verRows } = await client.query(
      `SELECT status, rejection_reason FROM identity_verifications
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [user.id],
    )

    if (verRows.length === 0) {
      return res.json({
        step: 'id-upload',
        accountStatus: user.account_status,
        role: user.role,
        ...consent,
      })
    }

    const ver = verRows[0]

    if (ver.status === 'rejected') {
      return res.json({
        step: 'id-upload',
        accountStatus: user.account_status,
        role: user.role,
        verificationStatus: 'rejected',
        rejectionReason: ver.rejection_reason,
        ...consent,
      })
    }

    if (ver.status === 'approved') {
      return res.json({
        step: 'complete',
        accountStatus: user.account_status,
        role: user.role,
        ...consent,
      })
    }

    // submitted or under_review
    return res.json({
      step: 'waiting',
      accountStatus: user.account_status,
      role: user.role,
      verificationStatus: ver.status,
      ...consent,
    })
  } catch (err) {
    console.error('onboarding/status error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// POST /api/onboarding/profile
// Creates user + profile rows after Clerk signup.
// ───────────────────────────────────────────────
router.post('/profile', async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const { fullName, city, state, country, email, phone, whatsapp, bio, acceptedTermsVersion } =
    req.body || {}

  if (!fullName || !city || !country || !email) {
    return res.status(400).json({
      message: 'Full name, city, country, and email are required.',
    })
  }

  if (acceptedTermsVersion !== CURRENT_LEGAL.terms) {
    return res.status(400).json({
      message: 'Accept the current Terms of Use, Privacy Policy, and Community Guidelines to continue.',
    })
  }

  let client
  try {
    client = await pool.connect()
    await client.query('BEGIN')

    // Upsert user row
    const { rows: userRows } = await client.query(
      `INSERT INTO users (clerk_id, role, account_status)
       VALUES ($1, 'member', 'pending')
       ON CONFLICT (clerk_id) DO UPDATE SET updated_at = now()
       RETURNING id`,
      [userId],
    )
    const dbUserId = userRows[0].id

    // Upsert profile
    await client.query(
      `INSERT INTO profiles (user_id, full_name, city, state, country, email, phone, whatsapp, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         city = EXCLUDED.city,
         state = EXCLUDED.state,
         country = EXCLUDED.country,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         whatsapp = EXCLUDED.whatsapp,
         bio = EXCLUDED.bio,
         updated_at = now()`,
      [
        dbUserId,
        String(fullName).trim(),
        String(city).trim(),
        state ? String(state).trim() : null,
        String(country).trim(),
        String(email).trim().toLowerCase(),
        phone ? String(phone).trim() : null,
        whatsapp ? String(whatsapp).trim() : null,
        bio ? String(bio).trim() : null,
      ],
    )

    const acceptedAt = await recordCurrentConsent(client, dbUserId)

    await client.query('COMMIT')
    return res.json({
      ok: true,
      step: 'id-upload',
      termsVersion: CURRENT_LEGAL.terms,
      termsAcceptedAt: acceptedAt.toISOString(),
    })
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {})
    console.error('onboarding/profile error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

// ───────────────────────────────────────────────
// POST /api/onboarding/upload-id
// Uploads ID document to private disk storage
// (local folder, or Railway volume via ID_STORAGE_DIR).
// Stores only document_type + storage_key.
// The ID number itself is NEVER stored.
// ───────────────────────────────────────────────
router.post('/upload-id', upload.single('document'), async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ message: 'Not authenticated.' })

  const { documentType } = req.body || {}
  const validTypes = ['aadhaar', 'passport', 'driving_licence', 'student_id', 'other']

  if (!documentType || !validTypes.includes(documentType)) {
    return res.status(400).json({ message: 'Valid document type is required.' })
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Document file is required.' })
  }

  let client
  try {
    client = await pool.connect()

    const { rows: userRows } = await client.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId],
    )
    if (userRows.length === 0) {
      return res.status(400).json({ message: 'Complete your profile first.', step: 'profile' })
    }

    const dbUserId = userRows[0].id

    // Upload to private bucket
    const storageKey = await uploadIdDocument(
      dbUserId,
      req.file.originalname,
      req.file.buffer,
      req.file.mimetype,
    )

    // Insert verification record
    await client.query(
      `INSERT INTO identity_verifications (user_id, document_type, status, storage_key)
       VALUES ($1, $2, 'submitted', $3)`,
      [dbUserId, documentType, storageKey],
    )

    return res.json({ ok: true, step: 'waiting' })
  } catch (err) {
    console.error('onboarding/upload-id error:', err.message)
    return res.status(500).json({ message: 'Internal error.' })
  } finally {
    if (client) client.release()
  }
})

export default router
