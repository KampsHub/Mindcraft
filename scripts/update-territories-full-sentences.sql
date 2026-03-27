-- Update Parachute territory descriptions to full sentences
-- Run in Supabase SQL Editor

UPDATE program_days SET territory = 'Today you''ll name the seven areas of your life that got disrupted — and rate how loud each one is right now.' WHERE day_number = 1 AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute');

UPDATE program_days SET territory = 'Today you''ll map out the timeline of what happened — the key moments, the decisions, and the turning points that brought you here.' WHERE day_number = 2 AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute');

UPDATE program_days SET territory = 'Today you''ll notice where this situation lives in your body, and explore what your family taught you about work and failure.' WHERE day_number = 3 AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute');

UPDATE program_days SET territory = 'Today you''ll look at who you were before this happened — the identity you built around your role, and what feels missing now.' WHERE day_number = 4 AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute');

UPDATE program_days SET territory = 'Today you''ll separate the financial facts from the financial fear, and get clear on what''s actually true about your runway.' WHERE day_number = 5 AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute');

UPDATE program_days SET territory = 'Today you''ll look at the relationships that shifted when your job changed — who showed up, who disappeared, and what that tells you.' WHERE day_number = 6 AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute');

UPDATE program_days SET territory = 'Today is the end of Week 1. You''ll look back at what you named this week and notice what''s already different from Day 1.' WHERE day_number = 7 AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute');
