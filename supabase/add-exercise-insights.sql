-- Add insight fields to exercise_completions
-- Run this in Supabase SQL Editor

ALTER TABLE exercise_completions
ADD COLUMN IF NOT EXISTS insight text,
ADD COLUMN IF NOT EXISTS insight_edited_at timestamptz;

-- Index for fetching insights by enrollment + week
CREATE INDEX IF NOT EXISTS idx_exercise_completions_insight
ON exercise_completions (enrollment_id, insight)
WHERE insight IS NOT NULL;
