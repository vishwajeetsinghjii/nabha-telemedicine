-- Normalize the patients.gender constraint for databases created from older schemas.
-- Safe for existing data: known variants are normalized; unknown non-null values become Other.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'patients_gender_check'
      AND conrelid = 'patients'::regclass
  ) THEN
    ALTER TABLE patients DROP CONSTRAINT patients_gender_check;
  END IF;
END $$;

UPDATE patients
SET gender = CASE UPPER(TRIM(gender))
  WHEN 'MALE' THEN 'Male'
  WHEN 'M' THEN 'Male'
  WHEN 'FEMALE' THEN 'Female'
  WHEN 'F' THEN 'Female'
  WHEN 'OTHER' THEN 'Other'
  WHEN 'O' THEN 'Other'
  WHEN 'PREFER_NOT_TO_SAY' THEN 'Other'
  ELSE 'Other'
END;

ALTER TABLE patients
  ADD CONSTRAINT patients_gender_check
  CHECK (gender IN ('Female', 'Male', 'Other'));
