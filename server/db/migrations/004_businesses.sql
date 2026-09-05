-- ============================================================
-- Migration 004: businesses (Small Business Directory)
-- ============================================================

-- businesses: women-owned businesses listed in a city-based directory.
-- Members can browse by city to find and support local businesses.
CREATE TABLE businesses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT,
  description   TEXT,
  city          TEXT NOT NULL,
  state         TEXT,
  country       TEXT NOT NULL DEFAULT 'India',
  address       TEXT,
  phone         TEXT,
  email         TEXT,
  website       TEXT,
  photo_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary index for directory browsing by city.
CREATE INDEX idx_businesses_city     ON businesses (city);
CREATE INDEX idx_businesses_owner    ON businesses (owner_id);
CREATE INDEX idx_businesses_category ON businesses (category);
