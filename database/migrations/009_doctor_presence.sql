BEGIN;

CREATE TABLE IF NOT EXISTS doctor_presence (
  doctor_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(16) NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE','AWAY','OFFLINE')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_presence_status_seen
  ON doctor_presence(status, last_seen_at DESC);

COMMIT;
