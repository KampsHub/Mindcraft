-- Update Parachute day territories from jargon to plain language
-- Run in Supabase SQL Editor

-- Get the parachute program ID
DO $$
DECLARE
  prog_id uuid;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE slug = 'parachute' LIMIT 1;
  IF prog_id IS NULL THEN
    RAISE NOTICE 'Parachute program not found';
    RETURN;
  END IF;

  -- Week 1: Ground
  UPDATE program_days SET territory = 'What actually happened. Name the loss. Get the facts down.' WHERE program_id = prog_id AND day_number = 1;
  UPDATE program_days SET territory = 'The story of how you got here. Who was involved. What decisions led to this.' WHERE program_id = prog_id AND day_number = 2;
  UPDATE program_days SET territory = 'Where you feel this in your body. What your family taught you about work and failure.' WHERE program_id = prog_id AND day_number = 3;
  UPDATE program_days SET territory = 'The critical voice in your head. What it says, when it gets loud, what it''s protecting.' WHERE program_id = prog_id AND day_number = 4;
  UPDATE program_days SET territory = 'Your actual financial situation vs. the panic. Numbers, not feelings.' WHERE program_id = prog_id AND day_number = 5;
  UPDATE program_days SET territory = 'What happens when the daily structure disappears. How to build a new one.' WHERE program_id = prog_id AND day_number = 6;
  UPDATE program_days SET territory = 'Where you are with accepting what happened. Week 1 check-in.' WHERE program_id = prog_id AND day_number = 7;

  -- Week 2: Reconnect
  UPDATE program_days SET territory = 'Who you were at work vs. who you actually are. Untangling identity from job title.' WHERE program_id = prog_id AND day_number = 8;
  UPDATE program_days SET territory = 'The people you lost access to. The loneliness. How to reconnect.' WHERE program_id = prog_id AND day_number = 9;
  UPDATE program_days SET territory = 'Beliefs about work you picked up before you even started working.' WHERE program_id = prog_id AND day_number = 10;
  UPDATE program_days SET territory = 'How your family connected success to self-worth. What you inherited vs. what you chose.' WHERE program_id = prog_id AND day_number = 11;
  UPDATE program_days SET territory = 'The patterns that keep showing up. Interrupting them before they run you.' WHERE program_id = prog_id AND day_number = 12;
  UPDATE program_days SET territory = 'What you actually value — from real moments in your life, not a checklist.' WHERE program_id = prog_id AND day_number = 13;
  UPDATE program_days SET territory = 'If you had to rank what matters most, what wins? What are you willing to give up?' WHERE program_id = prog_id AND day_number = 14;

  -- Week 3: Build
  UPDATE program_days SET territory = 'Testing your values under pressure. When they conflict, which one wins?' WHERE program_id = prog_id AND day_number = 15;
  UPDATE program_days SET territory = 'The bigger picture. It''s not just you — the industry, the economy, the system.' WHERE program_id = prog_id AND day_number = 16;
  UPDATE program_days SET territory = 'What you''re actually good at. Evidence, not hope.' WHERE program_id = prog_id AND day_number = 17;
  UPDATE program_days SET territory = 'Three ways to tell this story. Which one is true? Which one is useful?' WHERE program_id = prog_id AND day_number = 18;
  UPDATE program_days SET territory = 'The context that explains what happened — without excusing it or blaming yourself.' WHERE program_id = prog_id AND day_number = 19;
  UPDATE program_days SET territory = 'The version of your story you can actually say out loud with conviction.' WHERE program_id = prog_id AND day_number = 20;
  UPDATE program_days SET territory = 'Real skills vs. imagined gaps. What you need to learn vs. what fear is telling you.' WHERE program_id = prog_id AND day_number = 21;

  -- Week 4: Launch
  UPDATE program_days SET territory = 'What''s starting to interest you. Following the 10% that feels alive.' WHERE program_id = prog_id AND day_number = 22;
  UPDATE program_days SET territory = 'Three weeks in. What shifted, what surprised you, what''s still stuck.' WHERE program_id = prog_id AND day_number = 23;
  UPDATE program_days SET territory = 'The seven disruptions from Day 1 — revisited. What moved?' WHERE program_id = prog_id AND day_number = 24;
  UPDATE program_days SET territory = 'Your patterns under pressure. What to watch for when things get hard again.' WHERE program_id = prog_id AND day_number = 25;
  UPDATE program_days SET territory = 'Using your values to make real decisions. Not theory — practice.' WHERE program_id = prog_id AND day_number = 26;
  UPDATE program_days SET territory = 'Can you tell your story when someone pushes back? Pressure-testing it.' WHERE program_id = prog_id AND day_number = 27;
  UPDATE program_days SET territory = 'What''s still open. What still hurts. What still needs attention.' WHERE program_id = prog_id AND day_number = 28;
  UPDATE program_days SET territory = 'Everything from 30 days. A letter to yourself. What it meant.' WHERE program_id = prog_id AND day_number = 29;
  UPDATE program_days SET territory = 'One sentence. Where you are now.' WHERE program_id = prog_id AND day_number = 30;

  RAISE NOTICE 'Updated % day territories for Parachute', 30;
END $$;
