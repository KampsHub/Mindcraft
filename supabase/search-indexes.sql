-- Search indexes for exercise, journal, and insight search
-- Run this in Supabase SQL Editor

CREATE INDEX IF NOT EXISTS idx_exercise_completions_client_name
  ON exercise_completions (client_id, framework_name);

CREATE INDEX IF NOT EXISTS idx_exercise_completions_client_completed
  ON exercise_completions (client_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_sessions_client_day
  ON daily_sessions (client_id, day_number DESC);

CREATE INDEX IF NOT EXISTS idx_frameworks_library_name
  ON frameworks_library (name);
