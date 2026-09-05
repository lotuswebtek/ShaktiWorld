-- ============================================================
-- Migration 003: job_posts & job_seeker_profiles
-- ============================================================

-- job_posts: opportunities shared within the community.
-- The platform is not an employment agency — these are informational listings.
CREATE TABLE job_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  company       TEXT,
  location      TEXT,
  job_type      TEXT CHECK (job_type IN ('full_time', 'part_time', 'contract', 'freelance', 'internship')),
  description   TEXT NOT NULL,
  requirements  TEXT,
  salary_range  TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_posts_posted_by ON job_posts (posted_by);
CREATE INDEX idx_job_posts_active    ON job_posts (is_active) WHERE is_active = true;

-- job_seeker_profiles: members looking for work can make themselves discoverable.
CREATE TABLE job_seeker_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  headline        TEXT,
  skills          TEXT[],
  experience_years INT,
  preferred_location TEXT,
  resume_storage_key TEXT,                                   -- private bucket path
  is_visible      BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_seekers_user_id ON job_seeker_profiles (user_id);
