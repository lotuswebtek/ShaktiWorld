-- ============================================================
-- Migration 011: jobs extended fields
-- Adds work mode, expiration, contact method/value, and
-- richer seeker profile fields (availability + direct contact).
-- ============================================================

-- ── job_posts extensions ──
ALTER TABLE job_posts
  ADD COLUMN IF NOT EXISTS work_mode TEXT
    NOT NULL DEFAULT 'onsite'
    CHECK (work_mode IN ('remote', 'onsite')),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
    NOT NULL DEFAULT (now() + interval '60 days'),
  ADD COLUMN IF NOT EXISTS contact_method TEXT
    NOT NULL DEFAULT 'email'
    CHECK (contact_method IN ('email', 'phone', 'whatsapp', 'other')),
  ADD COLUMN IF NOT EXISTS contact_value TEXT;

-- Helpful indexes for filtering and expiry.
CREATE INDEX IF NOT EXISTS idx_job_posts_city ON job_posts (location);
CREATE INDEX IF NOT EXISTS idx_job_posts_work_mode ON job_posts (work_mode);
CREATE INDEX IF NOT EXISTS idx_job_posts_expires_at ON job_posts (expires_at);

-- ── job_seeker_profiles extensions ──
ALTER TABLE job_seeker_profiles
  ADD COLUMN IF NOT EXISTS experience_summary TEXT,
  ADD COLUMN IF NOT EXISTS availability TEXT,
  ADD COLUMN IF NOT EXISTS preferred_work_mode TEXT
    NOT NULL DEFAULT 'either'
    CHECK (preferred_work_mode IN ('remote', 'onsite', 'either')),
  ADD COLUMN IF NOT EXISTS wants_direct_contact BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_job_seekers_city ON job_seeker_profiles (preferred_location);
CREATE INDEX IF NOT EXISTS idx_job_seekers_work_mode ON job_seeker_profiles (preferred_work_mode);

