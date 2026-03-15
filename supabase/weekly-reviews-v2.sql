-- Weekly reviews v2: add enrollment_id and goal_ratings
-- Run this in Supabase SQL Editor

ALTER TABLE public.weekly_reviews
  ADD COLUMN IF NOT EXISTS enrollment_id uuid REFERENCES public.program_enrollments(id),
  ADD COLUMN IF NOT EXISTS goal_ratings jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS week_number int,
  ADD COLUMN IF NOT EXISTS key_insights jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS sessions_completed int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exercises_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_day_rating numeric(3,1);
