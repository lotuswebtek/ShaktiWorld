-- ============================================================
-- Migration 007: support_requests
-- ============================================================

-- support_requests: members seeking information or connections for health,
-- mental wellbeing, domestic violence, or dowry-related concerns.
-- The platform connects people with resources — it is NOT a crisis service,
-- NOT legal counsel, and NOT a medical provider.
-- visibility controls access: moderators can see private requests but
-- NOT other users' support_requests (enforced by RLS).
CREATE TABLE support_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL
                CHECK (category IN ('health', 'mental_wellbeing', 'domestic_violence', 'dowry')),
  subject     TEXT NOT NULL,
  body        TEXT NOT NULL,
  visibility  TEXT NOT NULL DEFAULT 'private_to_moderators'
                CHECK (visibility IN ('public', 'members_only', 'private_to_moderators')),
  status      TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users(id),                     -- moderator handling this request
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_requests_user_id  ON support_requests (user_id);
CREATE INDEX idx_support_requests_category ON support_requests (category);
CREATE INDEX idx_support_requests_status   ON support_requests (status);

-- ---- Row-Level Security ----

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Members can read only their own support requests.
CREATE POLICY support_self_read ON support_requests
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true))
  );

-- Admins can read all support requests (for oversight).
CREATE POLICY support_admin_read ON support_requests
  FOR SELECT USING (
    current_setting('app.role', true) = 'admin'
  );

-- Moderators can read support requests that are private_to_moderators
-- (assigned to them or unassigned) but NOT other users' personal requests.
-- This is the key constraint: moderators see the moderation queue, not
-- everything a user ever submitted.
CREATE POLICY support_moderator_read ON support_requests
  FOR SELECT USING (
    current_setting('app.role', true) = 'moderator'
    AND (
      assigned_to = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true))
      OR (assigned_to IS NULL AND visibility = 'private_to_moderators')
    )
  );
