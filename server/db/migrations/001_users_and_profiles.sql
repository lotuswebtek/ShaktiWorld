-- ============================================================
-- Migration 001: users & profiles
-- ============================================================

-- users: core identity record linked to Clerk auth.
-- Stores role and account status; never stores passwords (Clerk handles auth).
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      TEXT NOT NULL UNIQUE,                        -- Clerk external user id
  role          TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('member', 'moderator', 'admin')),
  account_status TEXT NOT NULL DEFAULT 'pending'
                  CHECK (account_status IN ('pending', 'verified', 'suspended')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_clerk_id ON users (clerk_id);
CREATE INDEX idx_users_role     ON users (role);

-- profiles: public-facing member info.
-- Separated from users so profile data can be shared without exposing auth internals.
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name   TEXT,
  photo_url   TEXT,
  city        TEXT,
  state       TEXT,
  country     TEXT,
  email       TEXT,
  phone       TEXT,
  whatsapp    TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON profiles (user_id);
CREATE INDEX idx_profiles_city    ON profiles (city);

-- ---- Row-Level Security ----

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Members can read only their own row.
CREATE POLICY users_self_read ON users
  FOR SELECT USING (clerk_id = current_setting('app.clerk_id', true));

-- Moderators & admins can read all users.
CREATE POLICY users_staff_read ON users
  FOR SELECT USING (
    current_setting('app.role', true) IN ('moderator', 'admin')
  );

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Members can read and update only their own profile.
CREATE POLICY profiles_self_read ON profiles
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true))
  );

CREATE POLICY profiles_self_update ON profiles
  FOR UPDATE USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true))
  );

-- Moderators & admins can read all profiles.
CREATE POLICY profiles_staff_read ON profiles
  FOR SELECT USING (
    current_setting('app.role', true) IN ('moderator', 'admin')
  );
