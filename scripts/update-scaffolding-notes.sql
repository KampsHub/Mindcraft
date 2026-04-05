-- Scaffolding Decrease Notes
-- Adds a note to Days 1-10 exercises explaining why scaffolding is heavier early,
-- and updates Days 11-30 system_notes to instruct the AI to reduce pre-fill.
-- Run in Supabase SQL Editor.

-- ═══════════════════════════════════════════════
-- Days 1-10: Add note explaining heavier scaffolding
-- ═══════════════════════════════════════════════

DO $$
DECLARE
  prog record;
BEGIN
  FOR prog IN SELECT id FROM programs WHERE slug IN ('parachute', 'jetstream', 'basecamp')
  LOOP
    -- Days 1-10: heavier scaffolding with explanation
    UPDATE program_days
    SET system_notes = COALESCE(system_notes, '') || E'\n\n[SCAFFOLDING NOTE — visible to AI, not user]: Days 1-10 use heavier scaffolding on purpose. Pre-filled examples, starter prompts, and structured choices help users engage when they are most overwhelmed. This is intentional — the cognitive load of generating content from scratch during a crisis is too high. By Day 11, the user has enough practice and self-knowledge to work with less structure. Do NOT reduce scaffolding in Days 1-10.'
    WHERE program_id = prog.id
      AND day_number BETWEEN 1 AND 10
      AND (system_notes IS NULL OR system_notes NOT LIKE '%SCAFFOLDING NOTE%');

    -- Days 11-20: moderate scaffolding
    UPDATE program_days
    SET system_notes = COALESCE(system_notes, '') || E'\n\n[SCAFFOLDING — AI INSTRUCTION]: Days 11-20 use moderate scaffolding. When generating overflow exercises:\n- Reduce pre-filled examples by ~50% compared to Days 1-10\n- Provide 1-2 starter examples instead of 3-5\n- Use more open-ended prompts: "What comes to mind?" rather than presenting a fixed list\n- Still include framework context in whyThis, but shorten it\n- Trust that the user now has vocabulary and familiarity with the exercise types\n- If an exercise builds on a previous day, reference the earlier work explicitly'
    WHERE program_id = prog.id
      AND day_number BETWEEN 11 AND 20
      AND (system_notes IS NULL OR system_notes NOT LIKE '%SCAFFOLDING — AI%');

    -- Days 21-30: minimal scaffolding
    UPDATE program_days
    SET system_notes = COALESCE(system_notes, '') || E'\n\n[SCAFFOLDING — AI INSTRUCTION]: Days 21-30 use minimal scaffolding. When generating overflow exercises:\n- Minimal or no pre-filled examples — the user generates their own content\n- Open-ended prompts that reference the user''s specific patterns and vocabulary from their journal\n- Framework context is brief: name, one-sentence purpose, then straight to the exercise\n- Pull forward data from earlier exercises (saboteurs, values, disruption scores) as starting material\n- The user should feel ownership over their process by now — exercises should feel like tools they choose to use, not worksheets they are given\n- If an exercise is about integration or future planning, ask the user to draw from everything they have built so far'
    WHERE program_id = prog.id
      AND day_number BETWEEN 21 AND 30
      AND (system_notes IS NULL OR system_notes NOT LIKE '%SCAFFOLDING — AI%');
  END LOOP;
END $$;
