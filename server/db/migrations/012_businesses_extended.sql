-- ============================================================
-- Migration 012: businesses extended directory fields
-- Adds category enum checks, photo gallery, service area,
-- contact details, operating hours, and one-business-per-member.
-- ============================================================

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS service_area TEXT,
  ADD COLUMN IF NOT EXISTS contact TEXT,
  ADD COLUMN IF NOT EXISTS operating_hours TEXT;

-- Tighten categories to the initial launch set.
ALTER TABLE businesses
  DROP CONSTRAINT IF EXISTS businesses_category_check;

ALTER TABLE businesses
  ADD CONSTRAINT businesses_category_check
  CHECK (
    category IN (
      'home_cooked_food',
      'tailoring',
      'handicrafts',
      'childcare',
      'beauty_services',
      'other'
    )
  );

-- One business per member to start.
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_owner_unique ON businesses (owner_id);

-- City-first browsing and search.
CREATE INDEX IF NOT EXISTS idx_businesses_city_active ON businesses (city, is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_category_active ON businesses (category, is_active);

