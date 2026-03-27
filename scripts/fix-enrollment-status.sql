-- Fix enrollment status from pre_start to active
UPDATE program_enrollments
SET status = 'active'
WHERE client_id = (
  SELECT id FROM auth.users WHERE email = 'stefanie.kamps@gmail.com'
)
AND status = 'pre_start';
