-- ============================================================
-- Migration 013: events RSVP + resources library fields
-- Events remain admin-created. RSVP has a capacity limit.
-- Resources distinguish in-house markdown from third-party links.
-- ============================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS capacity INT CHECK (capacity IS NULL OR capacity > 0);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'going'
                CHECK (status IN ('going', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps (event_id) WHERE status = 'going';

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS resource_type TEXT
    CHECK (resource_type IN ('article', 'video', 'guide', 'downloadable')),
  ADD COLUMN IF NOT EXISTS reading_time_minutes INT
    CHECK (reading_time_minutes IS NULL OR reading_time_minutes > 0),
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS body_markdown TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'external'
    CHECK (source IN ('in_house', 'external'));

-- Backfill topic from the original category column where present.
UPDATE resources SET topic = category WHERE topic IS NULL AND category IS NOT NULL;
UPDATE resources SET resource_type = 'article' WHERE resource_type IS NULL AND body_markdown IS NOT NULL;
UPDATE resources SET resource_type = 'guide' WHERE resource_type IS NULL;
UPDATE resources SET source = 'in_house' WHERE body_markdown IS NOT NULL AND coalesce(url, '') = '';

CREATE INDEX IF NOT EXISTS idx_resources_topic ON resources (topic);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources (resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources (is_published);
