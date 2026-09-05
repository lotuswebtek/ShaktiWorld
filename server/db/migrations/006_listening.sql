-- ============================================================
-- Migration 006: listening_posts & listening_replies
-- ============================================================

-- listening_posts: a peer-support space where members share experiences.
-- Not therapy, not counselling — human connection.
-- visibility controls who can see each post.
CREATE TABLE listening_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT,
  body        TEXT NOT NULL,
  visibility  TEXT NOT NULL DEFAULT 'members_only'
                CHECK (visibility IN ('public', 'members_only', 'private_to_moderators')),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listening_posts_author     ON listening_posts (author_id);
CREATE INDEX idx_listening_posts_visibility ON listening_posts (visibility);

-- listening_replies: threaded responses to a listening post.
CREATE TABLE listening_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES listening_posts(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listening_replies_post_id ON listening_replies (post_id);

-- ---- Row-Level Security ----

ALTER TABLE listening_posts ENABLE ROW LEVEL SECURITY;

-- Public posts: anyone can read.
CREATE POLICY listening_public_read ON listening_posts
  FOR SELECT USING (visibility = 'public');

-- Members-only posts: any authenticated user can read.
CREATE POLICY listening_members_read ON listening_posts
  FOR SELECT USING (
    visibility = 'members_only'
    AND current_setting('app.clerk_id', true) IS NOT NULL
  );

-- Private-to-moderators posts: only author and staff can read.
CREATE POLICY listening_private_read ON listening_posts
  FOR SELECT USING (
    visibility = 'private_to_moderators'
    AND (
      author_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true))
      OR current_setting('app.role', true) IN ('moderator', 'admin')
    )
  );

-- Authors can always read their own posts regardless of visibility.
CREATE POLICY listening_self_read ON listening_posts
  FOR SELECT USING (
    author_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true))
  );
