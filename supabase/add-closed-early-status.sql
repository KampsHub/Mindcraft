-- ============================================================
-- Allow users to end a program early.
-- Adds 'closed_early' to the program_enrollments.status enum check.
-- Treat closed_early as terminal, like 'completed'.
-- ============================================================

ALTER TABLE public.program_enrollments
  DROP CONSTRAINT IF EXISTS program_enrollments_status_check;

ALTER TABLE public.program_enrollments
  ADD CONSTRAINT program_enrollments_status_check
  CHECK (status IN (
    'pre_start',
    'onboarding',
    'awaiting_goals',
    'active',
    'completed',
    'closed_early',
    'paused'
  ));
