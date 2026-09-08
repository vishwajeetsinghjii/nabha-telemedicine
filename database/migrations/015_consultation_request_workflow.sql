-- Admin-mediated consultation workflow
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  health_center_id UUID REFERENCES health_centers(id) ON DELETE SET NULL,
  symptoms TEXT NOT NULL,
  preferred_language VARCHAR(30),
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED','ASSIGNED','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED')),
  assigned_doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status,created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_patient ON consultation_requests(patient_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_doctor ON consultation_requests(assigned_doctor_id,status,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_patient_consultation_request ON consultation_requests(patient_id) WHERE status IN ('REQUESTED','ASSIGNED','ACCEPTED','IN_PROGRESS');
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES consultation_requests(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_request ON appointments(request_id);
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES consultation_requests(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_consultations_request ON consultations(request_id);
