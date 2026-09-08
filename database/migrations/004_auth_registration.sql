BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(32);
UPDATE users SET account_status='ACTIVE' WHERE account_status IS NULL;
ALTER TABLE users ALTER COLUMN account_status SET DEFAULT 'ACTIVE';
ALTER TABLE users ALTER COLUMN account_status SET NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_status_check;
ALTER TABLE users ADD CONSTRAINT users_account_status_check CHECK (account_status IN ('ACTIVE','PENDING_APPROVAL','SUSPENDED','REJECTED','DISABLED'));
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (LOWER(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_mobile_unique_idx ON users (mobile) WHERE mobile IS NOT NULL;
CREATE TABLE IF NOT EXISTS asha_applications (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 application_data JSONB NOT NULL DEFAULT '{}'::jsonb,
 status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED')),
 reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
 reviewed_at TIMESTAMPTZ,
 rejection_reason TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS asha_applications_user_idx ON asha_applications(user_id);
CREATE INDEX IF NOT EXISTS asha_applications_status_idx ON asha_applications(status);
COMMIT;
