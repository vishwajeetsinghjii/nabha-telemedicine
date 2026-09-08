-- 014_backfill_patient_profiles.sql
-- Ensure every active PATIENT account has a corresponding operational patient record.
-- Safe/idempotent: existing patient rows are untouched.
INSERT INTO patients (
  id, patient_code, user_id, name, age, gender, mobile, village,
  address, emergency_contact, blood_group, allergies, existing_conditions,
  medical_history, created_by, health_center_id
)
SELECT
  uuid_generate_v4(),
  'PT-' || UPPER(SUBSTRING(REPLACE(u.id::text,'-','') FROM 1 FOR 8)),
  u.id,
  u.name,
  18,
  'Other',
  COALESCE(u.mobile,''),
  'Not specified',
  NULL,
  NULL,
  'Unknown',
  'None',
  'None',
  'None',
  u.id,
  u.health_center_id
FROM users u
WHERE u.role='PATIENT'
  AND NOT EXISTS (SELECT 1 FROM patients p WHERE p.user_id=u.id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_patient_code ON patients(patient_code);
