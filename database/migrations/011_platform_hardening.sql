BEGIN;
CREATE TABLE IF NOT EXISTS verification_reviews (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 application_type VARCHAR(20) NOT NULL CHECK (application_type IN ('DOCTOR','ASHA')),
 application_id UUID NOT NULL,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 decision VARCHAR(20) NOT NULL CHECK (decision IN ('APPROVED','REJECTED')),
 notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verification_reviews_user_created ON verification_reviews(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_reviews_app_created ON verification_reviews(application_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_apps_created_status ON doctor_applications(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asha_apps_created_status ON asha_applications(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource_created ON audit_logs(resource_type,resource_id,created_at DESC);
ALTER TABLE doctor_applications ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
COMMIT;
