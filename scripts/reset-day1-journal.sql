-- Reset Day 1 journal for Stefanie's test account
-- This clears the saved journal content and processing results so the voice toggle reappears

-- First, find the session
SELECT ds.id, ds.day_number, ds.step_2_journal, ds.step_3_analysis
FROM daily_sessions ds
JOIN program_enrollments pe ON ds.enrollment_id = pe.id
JOIN auth.users u ON pe.client_id = u.id
WHERE u.email = 'stefanie.kamps@gmail.com'
  AND ds.day_number = 1;

-- Then reset it (uncomment and run after verifying the SELECT above)
-- UPDATE daily_sessions ds
-- SET step_2_journal = NULL,
--     step_3_analysis = NULL,
--     step_4_exercises = NULL,
--     step_5_summary = NULL,
--     completed_at = NULL
-- FROM program_enrollments pe
-- JOIN auth.users u ON pe.client_id = u.id
-- WHERE ds.enrollment_id = pe.id
--   AND u.email = 'stefanie.kamps@gmail.com'
--   AND ds.day_number = 1;
