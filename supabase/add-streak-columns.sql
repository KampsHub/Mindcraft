-- Add streak tracking columns to program_enrollments
-- Run this in Supabase SQL Editor

ALTER TABLE program_enrollments ADD COLUMN IF NOT EXISTS current_streak int DEFAULT 0;
ALTER TABLE program_enrollments ADD COLUMN IF NOT EXISTS best_streak int DEFAULT 0;
ALTER TABLE program_enrollments ADD COLUMN IF NOT EXISTS last_completed_date date;
