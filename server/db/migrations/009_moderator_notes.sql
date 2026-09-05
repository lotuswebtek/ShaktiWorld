-- ============================================================
-- Migration 009: moderator_notes
-- ============================================================

-- moderator_notes: internal notes attached to support requests.
-- Visible only to moderators and admins — never shown to the member.
CREATE TABLE moderator_notes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  support_request_id UUID NOT NULL REFERENCES support_requests(id) ON DELETE CASCADE,
  author_id         UUID NOT NULL REFERENCES users(id),
  body              TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mod_notes_request ON moderator_notes (support_request_id);

ALTER TABLE moderator_notes ENABLE ROW LEVEL SECURITY;

-- Only moderators and admins can read/insert notes.
CREATE POLICY mod_notes_staff_read ON moderator_notes
  FOR SELECT USING (
    current_setting('app.role', true) IN ('moderator', 'admin')
  );

CREATE POLICY mod_notes_staff_insert ON moderator_notes
  FOR INSERT WITH CHECK (
    current_setting('app.role', true) IN ('moderator', 'admin')
  );
