-- ============================================================
-- Add 'lapsed' to program_enrollments.status for users detected
-- as inactive 14+ days by the dropout detection cron.
-- Treat 'lapsed' as non-terminal (user can still return and reactivate).
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
    'paused',
    'lapsed'
  ));
