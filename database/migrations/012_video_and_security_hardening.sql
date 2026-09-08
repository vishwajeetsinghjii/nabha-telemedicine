BEGIN;
ALTER TABLE video_sessions ADD COLUMN IF NOT EXISTS join_url TEXT;
ALTER TABLE video_sessions ADD COLUMN IF NOT EXISTS start_url TEXT;
CREATE INDEX IF NOT EXISTS idx_video_sessions_consultation ON video_sessions(consultation_id,started_at DESC);
COMMIT;
