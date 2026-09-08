-- Doctor verification documents and review lifecycle
CREATE TABLE IF NOT EXISTS doctor_verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES doctor_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('REGISTRATION','QUALIFICATION','OTHER')),
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 5242880),
  sha256 CHAR(64) NOT NULL,
  content BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_doctor_docs_application ON doctor_verification_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_doctor_docs_user ON doctor_verification_documents(user_id);
