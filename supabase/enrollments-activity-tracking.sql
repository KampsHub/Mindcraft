-- ============================================================
-- ANALYTICS INSTRUMENTATION: activity tracking on enrollments
--
-- Adds fields needed for:
--   - Dropout / inactivity detection (last_active_at)
--   - Cohort segmentation by inactivity gaps (had_3d_gap, had_7d_gap)
--   - Server-side GA4 Measurement Protocol events (ga_client_id)
--   - Retention metrics (max_inactivity_days)
--
-- Trigger: whenever a daily_sessions row is marked complete,
-- the corresponding enrollment's last_active_at is bumped.
-- ============================================================

-- 1. Columns
ALTER TABLE public.program_enrollments
  ADD COLUMN IF NOT EXISTS last_active_at      timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ga_client_id        text,
  ADD COLUMN IF NOT EXISTS max_inactivity_days int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS had_3d_gap          boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS had_7d_gap          boolean DEFAULT false;

-- Backfill last_active_at for existing enrollments:
-- use the most recent daily_session.completed_at if one exists,
-- otherwise fall back to created_at.
UPDATE public.program_enrollments e
SET last_active_at = COALESCE(
  (SELECT MAX(ds.completed_at)
     FROM public.daily_sessions ds
     WHERE ds.enrollment_id = e.id),
  e.started_at,
  e.created_at
)
WHERE last_active_at IS NULL OR last_active_at = e.created_at;

-- 2. Index for the nightly dropout cron
CREATE INDEX IF NOT EXISTS idx_enrollments_last_active
  ON public.program_enrollments(last_active_at)
  WHERE status IN ('active', 'onboarding', 'awaiting_goals', 'pre_start');

-- 3. Trigger: bump enrollment.last_active_at when a daily_session is completed
CREATE OR REPLACE FUNCTION public.bump_enrollment_last_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.completed_at IS DISTINCT FROM OLD.completed_at AND NEW.completed_at IS NOT NULL)
     OR (TG_OP = 'INSERT' AND NEW.completed_at IS NOT NULL)
  THEN
    UPDATE public.program_enrollments
       SET last_active_at = NEW.completed_at
     WHERE id = NEW.enrollment_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_daily_sessions_bump_enrollment_activity ON public.daily_sessions;

CREATE TRIGGER trg_daily_sessions_bump_enrollment_activity
  AFTER INSERT OR UPDATE OF completed_at ON public.daily_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_enrollment_last_active();

-- 4. Also bump on any authenticated activity via RPC (called from session_start)
CREATE OR REPLACE FUNCTION public.touch_enrollment_activity(p_enrollment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.program_enrollments
     SET last_active_at = now()
   WHERE id = p_enrollment_id
     AND client_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.touch_enrollment_activity(uuid) TO authenticated;
