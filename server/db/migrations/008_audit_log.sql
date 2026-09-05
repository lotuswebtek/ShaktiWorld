-- ============================================================
-- Migration 008: audit_log
-- ============================================================

-- audit_log: immutable record of every moderator and admin action.
-- Used for accountability and dispute resolution.
-- Rows are append-only — no UPDATE or DELETE policies are granted.
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID NOT NULL REFERENCES users(id),            -- the moderator/admin who acted
  action      TEXT NOT NULL,                                 -- e.g. 'verification.approved', 'user.suspended'
  target_type TEXT NOT NULL,                                 -- e.g. 'identity_verification', 'user', 'support_request'
  target_id   UUID NOT NULL,                                 -- PK of the affected row
  metadata    JSONB DEFAULT '{}',                            -- extra context (old/new status, reason, etc.)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No updated_at — audit rows are immutable.

CREATE INDEX idx_audit_log_actor      ON audit_log (actor_id);
CREATE INDEX idx_audit_log_target     ON audit_log (target_type, target_id);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at);

-- ---- Row-Level Security ----

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs.
CREATE POLICY audit_admin_read ON audit_log
  FOR SELECT USING (
    current_setting('app.role', true) = 'admin'
  );

-- No UPDATE or DELETE policies — audit log is append-only.
-- INSERT is allowed only through server-side functions (not via RLS).
