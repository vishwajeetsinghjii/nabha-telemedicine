-- =============================================================================
-- Migration 017 — SOAP Notes, Follow-up Date, Doctor Decline Flow
-- v5.0 Production Consultation Workflow
-- =============================================================================

-- 1. SOAP structured clinical documentation on consultations
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS chief_complaint   TEXT,
  ADD COLUMN IF NOT EXISTS soap_subjective   TEXT,
  ADD COLUMN IF NOT EXISTS soap_objective    TEXT,
  ADD COLUMN IF NOT EXISTS soap_assessment   TEXT,
  ADD COLUMN IF NOT EXISTS soap_plan         TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_date    DATE;

-- 2. Doctor decline flow on consultation_requests
ALTER TABLE consultation_requests
  ADD COLUMN IF NOT EXISTS chief_complaint TEXT,
  ADD COLUMN IF NOT EXISTS declined_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS decline_reason   TEXT;

-- Extend the status check constraint to include DECLINED
-- (PostgreSQL requires dropping and recreating the check constraint)
ALTER TABLE consultation_requests
  DROP CONSTRAINT IF EXISTS consultation_requests_status_check;

ALTER TABLE consultation_requests
  ADD CONSTRAINT consultation_requests_status_check
  CHECK (status IN ('REQUESTED','ASSIGNED','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED','DECLINED'));

-- 3. Useful indexes
CREATE INDEX IF NOT EXISTS idx_consultations_followup
  ON consultations(doctor_id, follow_up_date)
  WHERE follow_up_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_consultation_requests_declined
  ON consultation_requests(patient_id, status)
  WHERE status = 'DECLINED';
