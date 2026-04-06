-- ============================================================
-- Extend quality_flags so users can flag an exercise as "doesn't fit"
-- and get an immediate replacement.
--
-- Adds:
--   - new flag_reason values specific to exercise fit
--   - user_initiated boolean (distinguish auto-detected vs user-flagged)
--   - framework_id column so the matcher can exclude it on the next pick
-- ============================================================

-- Add the new columns if they don't exist
ALTER TABLE public.quality_flags
  ADD COLUMN IF NOT EXISTS user_initiated boolean NOT NULL DEFAULT false;

ALTER TABLE public.quality_flags
  ADD COLUMN IF NOT EXISTS framework_id uuid REFERENCES public.frameworks_library(id) ON DELETE SET NULL;

-- Widen the reason check to include exercise-specific reasons
ALTER TABLE public.quality_flags
  DROP CONSTRAINT IF EXISTS quality_flags_flag_reason_check;

ALTER TABLE public.quality_flags
  ADD CONSTRAINT quality_flags_flag_reason_check
  CHECK (flag_reason IN (
    -- Original auto-detection / generic quality reasons
    'off_tone', 'inaccurate', 'unhelpful', 'confusing', 'inappropriate', 'other',
    -- New exercise-fit reasons
    'not_relevant', 'too_intense', 'too_vague', 'already_did'
  ));

CREATE INDEX IF NOT EXISTS idx_flags_framework ON public.quality_flags(framework_id) WHERE framework_id IS NOT NULL;
