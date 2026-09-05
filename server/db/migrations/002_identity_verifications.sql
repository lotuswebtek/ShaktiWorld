-- ============================================================
-- Migration 002: identity_verifications
-- ============================================================

-- identity_verifications: tracks document-based KYC for member accounts.
-- IMPORTANT: never stores the actual ID number. Only the document type and
-- a storage_key pointing to a file in a private object-storage bucket.
CREATE TABLE identity_verifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type    TEXT NOT NULL
                     CHECK (document_type IN ('aadhaar', 'passport', 'driving_licence', 'student_id', 'other')),
  status           TEXT NOT NULL DEFAULT 'submitted'
                     CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  storage_key      TEXT NOT NULL,                            -- private bucket path, never a raw ID number
  reviewed_by      UUID REFERENCES users(id),                -- moderator/admin who reviewed
  reviewed_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verifications_user_id ON identity_verifications (user_id);
CREATE INDEX idx_verifications_status  ON identity_verifications (status);

-- ---- Row-Level Security ----

ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;

-- Members can read only their own verification records.
CREATE POLICY verifications_self_read ON identity_verifications
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true))
  );

-- Moderators & admins can read all verification records (for review queue).
CREATE POLICY verifications_staff_read ON identity_verifications
  FOR SELECT USING (
    current_setting('app.role', true) IN ('moderator', 'admin')
  );
