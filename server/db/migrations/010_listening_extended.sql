-- ============================================================
-- Migration 010: listening extensions
-- Adds anonymity, moderation hold, reactions, and reports.
-- ============================================================

-- ── Alter listening_posts ──

-- is_anonymous: if true, display "A member" publicly but author_id
-- is still recorded internally for moderation.
ALTER TABLE listening_posts
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- moderation_status: new accounts (< 7 days) get 'pending_review';
-- moderators approve to 'approved' or reject to 'rejected'.
-- Posts from established accounts default to 'approved'.
ALTER TABLE listening_posts
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('pending_review', 'approved', 'rejected'));

CREATE INDEX idx_listening_posts_mod_status ON listening_posts (moderation_status);

-- ── Alter listening_replies ──

ALTER TABLE listening_replies
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- ── Reactions ──

-- listening_reactions: supportive reactions only.
-- Allowed types: heart, hug, strength, listen, pray.
-- No downvote, no dislike — this is a support space.
CREATE TABLE listening_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'reply')),
  target_id   UUID NOT NULL,
  reaction    TEXT NOT NULL CHECK (reaction IN ('heart', 'hug', 'strength', 'listen', 'pray')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id, reaction)
);

CREATE INDEX idx_reactions_target ON listening_reactions (target_type, target_id);

-- ── Reports ──

-- listening_reports: report button on posts and replies.
-- Routes to the moderation queue.
CREATE TABLE listening_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'reply')),
  target_id   UUID NOT NULL,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON listening_reports (status);
CREATE INDEX idx_reports_target ON listening_reports (target_type, target_id);

ALTER TABLE listening_reports ENABLE ROW LEVEL SECURITY;

-- Reporters can see their own reports.
CREATE POLICY reports_self_read ON listening_reports
  FOR SELECT USING (
    reporter_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true))
  );

-- Staff can see all reports.
CREATE POLICY reports_staff_read ON listening_reports
  FOR SELECT USING (
    current_setting('app.role', true) IN ('moderator', 'admin')
  );
