-- ============================================================
-- One-off: advance stefanie.kamps@gmail.com to Day 7
-- ============================================================
-- Fills in days 2-6 as completed with placeholder content so the
-- user lands on Day 7 fresh. Runs in a transaction — safe to dry
-- run by changing COMMIT to ROLLBACK at the bottom.
--
-- Reversible: DELETE FROM daily_sessions WHERE enrollment_id = <id>
-- AND day_number BETWEEN 2 AND 6; UPDATE program_enrollments SET
-- current_day = 2 WHERE id = <id>;
-- ============================================================

BEGIN;

-- 1. Look up Stefanie's enrollment (most recent active one)
WITH target AS (
  SELECT pe.id AS enrollment_id, pe.client_id, pe.current_day
  FROM public.program_enrollments pe
  JOIN auth.users u ON u.id = pe.client_id
  WHERE u.email = 'stefanie.kamps@gmail.com'
    AND pe.status IN ('active', 'onboarding', 'awaiting_goals', 'pre_start')
  ORDER BY pe.created_at DESC
  LIMIT 1
),
-- 2. Generate placeholder session rows for days 2-6 (day 1 already exists)
inserted_sessions AS (
  INSERT INTO public.daily_sessions (
    enrollment_id,
    client_id,
    day_number,
    date,
    step_1_themes,
    step_2_journal,
    step_3_analysis,
    step_5_summary,
    completed_steps,
    day_rating,
    day_feedback,
    started_at,
    completed_at
  )
  SELECT
    t.enrollment_id,
    t.client_id,
    d AS day_number,
    CURRENT_DATE - (7 - d) AS date,
    jsonb_build_object(
      'thread', 'Placeholder thread for day ' || d,
      'themes', ARRAY['placeholder-theme-a', 'placeholder-theme-b'],
      'patterns', '[]'::jsonb,
      'carry_forward', 'Placeholder carry-forward for day ' || d
    ) AS step_1_themes,
    'Placeholder journal entry for day ' || d || '. This is test data.' AS step_2_journal,
    jsonb_build_object(
      'reading', 'Placeholder reading for day ' || d || '.',
      'emotional_state', 'placeholder',
      'key_themes', ARRAY['placeholder'],
      'urgency_level', 'low'
    ) AS step_3_analysis,
    jsonb_build_object(
      'title', 'Placeholder summary for day ' || d,
      'questions_to_sit_with', ARRAY['Placeholder question ' || d],
      'challenges', ARRAY['Placeholder challenge ' || d],
      'committed_actions', ARRAY['Placeholder commitment ' || d]
    ) AS step_5_summary,
    ARRAY[1, 2, 3, 4, 5] AS completed_steps,
    4 AS day_rating,
    'Placeholder feedback for day ' || d AS day_feedback,
    (CURRENT_DATE - (7 - d))::timestamptz + interval '9 hours' AS started_at,
    (CURRENT_DATE - (7 - d))::timestamptz + interval '9 hours 30 minutes' AS completed_at
  FROM target t
  CROSS JOIN generate_series(2, 6) AS d
  ON CONFLICT (enrollment_id, day_number) DO UPDATE SET
    completed_steps = ARRAY[1, 2, 3, 4, 5],
    completed_at = EXCLUDED.completed_at,
    step_2_journal = EXCLUDED.step_2_journal,
    step_5_summary = EXCLUDED.step_5_summary,
    day_rating = 4
  RETURNING enrollment_id, day_number
),
-- 3. Bump enrollment.current_day to 7
updated_enrollment AS (
  UPDATE public.program_enrollments
  SET current_day = 7,
      updated_at = NOW()
  WHERE id = (SELECT enrollment_id FROM target)
  RETURNING id, current_day, client_id
)
-- 4. Report
SELECT
  (SELECT enrollment_id FROM target) AS enrollment_id,
  (SELECT current_day FROM updated_enrollment) AS new_current_day,
  (SELECT COUNT(*) FROM inserted_sessions) AS sessions_upserted;

-- Change COMMIT to ROLLBACK to dry-run
COMMIT;
