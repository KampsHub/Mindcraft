-- Check Stefanie's Day 1 session state
SELECT
  ds.id,
  ds.day_number,
  ds.completed_at,
  pe.current_day,
  pe.status as enrollment_status
FROM daily_sessions ds
JOIN program_enrollments pe ON ds.enrollment_id = pe.id
JOIN auth.users u ON pe.client_id = u.id
WHERE u.email = 'stefanie.kamps@gmail.com'
ORDER BY ds.day_number;
