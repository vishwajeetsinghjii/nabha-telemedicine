BEGIN;

-- Complete the user hierarchy used by the API.
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- Public AI triage can legitimately return EMERGENCY. Existing persisted results must support it too.
ALTER TABLE ai_triage_results DROP CONSTRAINT IF EXISTS ai_triage_results_risk_level_check;
ALTER TABLE ai_triage_results ADD CONSTRAINT ai_triage_results_risk_level_check CHECK (risk_level IN ('EMERGENCY','HIGH','MODERATE','LOW'));

-- Refresh-token rotation/revocation support.
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_expires ON refresh_tokens(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active ON refresh_tokens(token_hash) WHERE revoked_at IS NULL;

-- Operational notification inbox.
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- Prevent duplicate active appointments for the same doctor at the same instant.
CREATE UNIQUE INDEX IF NOT EXISTS uq_doctor_active_appointment_time
  ON appointments(doctor_id, scheduled_at)
  WHERE doctor_id IS NOT NULL AND status IN ('SCHEDULED','WAITING','IN_PROGRESS');

COMMIT;
