-- ============================================================
-- Migration 014: legal consents
-- Records which terms version a member accepted, and when.
-- Append-only: a new version is a new row, never an overwrite.
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS terms_version TEXT,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

CREATE TABLE legal_consents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document    TEXT NOT NULL
                CHECK (document IN ('terms', 'privacy', 'guidelines')),
  version     TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, document, version)
);

CREATE INDEX idx_legal_consents_user ON legal_consents (user_id);

ALTER TABLE legal_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY legal_consents_self_read ON legal_consents
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true))
  );

CREATE POLICY legal_consents_staff_read ON legal_consents
  FOR SELECT USING (
    current_setting('app.role', true) IN ('moderator', 'admin')
  );
