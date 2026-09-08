-- Generate human-readable IDs for patient records created before patient_code was populated.
DO $$
DECLARE
  patient_row RECORD;
  generated_code VARCHAR(20);
BEGIN
  FOR patient_row IN SELECT id FROM patients WHERE patient_code IS NULL LOOP
    LOOP
      generated_code := 'NAB-' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
      BEGIN
        UPDATE patients SET patient_code = generated_code WHERE id = patient_row.id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;
  END LOOP;
END $$;