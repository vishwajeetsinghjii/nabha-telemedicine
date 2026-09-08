-- Harden admin-mediated consultation workflow.
-- video_sessions was introduced without created_at in migration 001; add it here so
-- existing installations and fresh databases have a consistent audit timestamp.
ALTER TABLE video_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
-- Safe for existing installations: close duplicate active video sessions before enforcing uniqueness.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY consultation_id ORDER BY started_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC) AS rn
  FROM video_sessions
  WHERE status='ACTIVE'
)
UPDATE video_sessions v SET status='ENDED', ended_at=COALESCE(v.ended_at,NOW())
FROM ranked r WHERE v.id=r.id AND r.rn>1;
CREATE INDEX IF NOT EXISTS idx_consultations_appointment_status ON consultations(appointment_id,status);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_consultation_created ON consultation_notes(consultation_id,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_video_session_per_consultation ON video_sessions(consultation_id) WHERE status='ACTIVE';
