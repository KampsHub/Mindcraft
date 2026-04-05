-- Spaced Retrieval Exercises for Days 7, 14, 21
-- These add RetrievalCheck exercises to each program's coaching plan
-- Run in Supabase SQL Editor

-- ═══════════════════════════════════════════════
-- PARACHUTE (Layoff Recovery)
-- ═══════════════════════════════════════════════

DO $$
DECLARE
  prog_id uuid;
  day7_id uuid;
  day14_id uuid;
  day21_id uuid;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE slug = 'parachute';
  SELECT id INTO day7_id FROM program_days WHERE program_id = prog_id AND day_number = 7;
  SELECT id INTO day14_id FROM program_days WHERE program_id = prog_id AND day_number = 14;
  SELECT id INTO day21_id FROM program_days WHERE program_id = prog_id AND day_number = 21;

  -- Day 7: Week 1 retrieval
  UPDATE program_days SET coaching_exercises = coaching_exercises || jsonb_build_array(jsonb_build_object(
    'name', 'Week 1 Concept Check',
    'type', 'retrieval_check',
    'whyThis', 'You have spent a week building a foundation. Research by Henry Roediger and Jeffrey Karpicke at Washington University shows that retrieving information from memory — rather than re-reading it — strengthens long-term retention by up to 50%. This quick check helps you consolidate the key concepts from your first week before building on them.',
    'instruction', 'For each prompt, write what you remember in your own words. Then reveal the answer to check yourself. Rate your confidence honestly — "partially" is valuable data, not failure.',
    'primitive', 'retrievalCheck',
    'prePopulated', jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object('id', 'r1', 'prompt', 'What are the Seven Disruptions? Name as many as you can.', 'answer', 'Income & Financial Security, Routine & Structure, Identity, Social Belonging, Sense of Competence, Future Uncertainty, Skill Confidence. These are the seven areas most commonly disrupted by job loss.', 'hint', 'Think about what changed when the job ended — beyond just money.'),
        jsonb_build_object('id', 'r2', 'prompt', 'What is a saboteur, and what does yours typically say?', 'answer', 'A saboteur is an internal voice pattern that criticizes, judges, or shames you — often as a misguided attempt at self-protection. Common ones include the Judge, Controller, Hyper-Achiever, and Victim. Your specific saboteur pattern was identified in your Day 4 exercise.', 'hint', 'Think back to the voice that got loudest this week.'),
        jsonb_build_object('id', 'r3', 'prompt', 'What is the difference between grief and depression in the context of job loss?', 'answer', 'Grief from job loss is a normal, healthy response to a real loss — of identity, routine, belonging, and security. It comes in waves, is connected to specific losses, and typically evolves over time. Depression is more persistent, pervasive, and disconnected from specific triggers. Grief does not require clinical intervention; depression may.', 'hint', 'One is a response to a specific loss. The other is a clinical condition.'),
        jsonb_build_object('id', 'r4', 'prompt', 'Name one grounding technique you practiced this week and when to use it.', 'answer', 'Examples: 5-4-3-2-1 sensory grounding (when overwhelmed), box breathing (before difficult conversations), body scan (when tension builds). The key is using it proactively, not waiting until you are already dysregulated.', 'hint', 'Think about the somatic exercises from this week.')
      )
    )
  ))
  WHERE id = day7_id;

  -- Day 14: Week 2 retrieval
  UPDATE program_days SET coaching_exercises = coaching_exercises || jsonb_build_array(jsonb_build_object(
    'name', 'Week 2 Concept Check',
    'type', 'retrieval_check',
    'whyThis', 'Two weeks in, you have covered identity work, values clarification, and narrative reframing. Karpicke''s research shows that spaced retrieval — testing yourself at increasing intervals — is one of the most effective learning strategies known. This check helps you own these concepts rather than just recognizing them.',
    'instruction', 'Write your answer first, then reveal. Be honest with your self-assessment — the goal is to identify what has stuck and what needs reinforcing.',
    'primitive', 'retrievalCheck',
    'prePopulated', jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object('id', 'r5', 'prompt', 'What are your top 3 values, and how did you identify them?', 'answer', 'Your specific values were identified in your Day 13-14 values exercises. The key distinction: a value is not a want, should, fantasy, or wish. A value is something that when you align with it, you are naturally energized — without effort. If it were absent from your life, you would not be you.', 'hint', 'The test: "If this were absent from my life, I would not be me."'),
        jsonb_build_object('id', 'r6', 'prompt', 'What is the difference between your "polished story" and your "honest story" about what happened?', 'answer', 'The polished story is what you tell others — clean, logical, forward-looking. The honest story includes the messy parts: the shock, the anger, the self-doubt, the relief, the grief. Neither is wrong, but knowing both helps you stop performing and start processing.', 'hint', 'Think about the narrative triptych exercise.'),
        jsonb_build_object('id', 'r7', 'prompt', 'What does "window of tolerance" mean, and where is yours right now?', 'answer', 'The window of tolerance (Dan Siegel, UCLA) is the zone where you can experience emotions without being overwhelmed or shutting down. Above it: hyperarousal (anxiety, panic, reactivity). Below it: hypoarousal (numbness, dissociation, shutdown). Stress narrows the window. The goal is not to never leave it, but to notice when you do and return.', 'hint', 'It is a zone between two extremes — too activated and too shut down.')
      )
    )
  ))
  WHERE id = day14_id;

  -- Day 21: Week 3 retrieval
  UPDATE program_days SET coaching_exercises = coaching_exercises || jsonb_build_array(jsonb_build_object(
    'name', 'Week 3 Concept Check',
    'type', 'retrieval_check',
    'whyThis', 'Three weeks of daily practice. The concepts you can recall and explain in your own words are the ones that will stick beyond this program. This final retrieval check covers the full arc — from disruption through identity to forward planning.',
    'instruction', 'This is your most comprehensive check yet. Write what you remember, reveal, and be honest. Concepts you rate as "missed" are worth revisiting in the final week.',
    'primitive', 'retrievalCheck',
    'prePopulated', jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object('id', 'r8', 'prompt', 'What is Kegan and Lahey''s Immunity to Change model?', 'answer', 'Robert Kegan and Lisa Lahey at Harvard identified that we often have competing commitments that block change. The model has four columns: (1) the commitment/goal, (2) what you are doing or not doing instead, (3) the hidden competing commitment, (4) the big assumption underneath it all. Change fails not because of willpower but because of these hidden commitments.', 'hint', 'Four columns. The third one is the hidden blocker.'),
        jsonb_build_object('id', 'r9', 'prompt', 'Name your top saboteur pattern and its antidote.', 'answer', 'Your specific saboteur was identified in earlier exercises. The antidote is not fighting the saboteur but noticing it, naming it, and choosing a different response. Shirzad Chamine''s Positive Intelligence framework suggests activating "sage" powers: empathize, explore, innovate, navigate, activate.', 'hint', 'Not fighting it — noticing it and choosing differently.'),
        jsonb_build_object('id', 'r10', 'prompt', 'What is the difference between a goal and a value?', 'answer', 'A goal is something you achieve and then it is done (get a new job, finish the program). A value is a direction you move toward continuously (growth, authenticity, connection). Goals can be completed; values cannot. The best goals are ones that align with your values — so even if the goal changes, the direction remains.', 'hint', 'One ends. The other is a compass direction.'),
        jsonb_build_object('id', 'r11', 'prompt', 'What does your contingency plan look like if your top saboteur shows up this week?', 'answer', 'Your contingency plan should include: (1) a detection signal — how do you know the saboteur is active? (2) an interruption — what do you do in the first 30 seconds? (3) a redirect — what is the sage response? This was built in your Day 25 exercise. The plan only works if it is specific enough to use in the moment.', 'hint', 'Three parts: detect, interrupt, redirect.')
      )
    )
  ))
  WHERE id = day21_id;

END $$;

-- ═══════════════════════════════════════════════
-- JETSTREAM (PIP Navigation) — similar structure
-- ═══════════════════════════════════════════════

DO $$
DECLARE
  prog_id uuid;
  day7_id uuid;
  day14_id uuid;
  day21_id uuid;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE slug = 'jetstream';
  SELECT id INTO day7_id FROM program_days WHERE program_id = prog_id AND day_number = 7;
  SELECT id INTO day14_id FROM program_days WHERE program_id = prog_id AND day_number = 14;
  SELECT id INTO day21_id FROM program_days WHERE program_id = prog_id AND day_number = 21;

  -- Day 7
  UPDATE program_days SET coaching_exercises = coaching_exercises || jsonb_build_array(jsonb_build_object(
    'name', 'Week 1 Concept Check',
    'type', 'retrieval_check',
    'whyThis', 'One week of navigating a PIP while building self-awareness. Spaced retrieval — testing yourself at intervals — strengthens retention by up to 50% compared to re-reading (Roediger & Karpicke, Washington University). This quick check consolidates your Week 1 learning.',
    'instruction', 'Write what you remember, then reveal. Rate honestly — "partially" is useful data.',
    'primitive', 'retrievalCheck',
    'prePopulated', jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object('id', 'j1', 'prompt', 'What are the Seven Disruptions in the PIP context? Name as many as you can.', 'answer', 'Professional Identity Threat, Competence Confidence, Workplace Belonging, Trust in Management, Financial Security, Daily Emotional Regulation, Future Career Trajectory.', 'hint', 'Think about what changed when the PIP started — beyond just job security.'),
        jsonb_build_object('id', 'j2', 'prompt', 'What is the difference between the PIP feedback and your fear about the PIP?', 'answer', 'The feedback is the specific, documented performance issues your manager raised. The fear is everything your mind adds: catastrophizing, identity threat, shame spirals, assumptions about others'' perceptions. Separating signal from noise is the foundational skill of PIP navigation.', 'hint', 'One is documented. The other is generated by your threat system.'),
        jsonb_build_object('id', 'j3', 'prompt', 'Name one technique for managing up under threat.', 'answer', 'Examples: structured check-ins (weekly, with agenda), documentation trail (email summaries after verbal conversations), proactive progress updates, asking for specific success criteria. The key: make your manager''s job easier, not harder. Remove ambiguity about your performance.', 'hint', 'Think about reducing ambiguity for your manager.')
      )
    )
  ))
  WHERE id = day7_id;

  -- Day 14
  UPDATE program_days SET coaching_exercises = coaching_exercises || jsonb_build_array(jsonb_build_object(
    'name', 'Week 2 Concept Check',
    'type', 'retrieval_check',
    'whyThis', 'Two weeks of building skills under pressure. This retrieval check covers identity, values, and the emotional regulation tools you have been practicing.',
    'instruction', 'Write your answer first, then reveal. Be honest with your self-assessment.',
    'primitive', 'retrievalCheck',
    'prePopulated', jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object('id', 'j4', 'prompt', 'What is the window of tolerance and where is yours right now?', 'answer', 'The zone where you can experience emotions without being overwhelmed (hyperarousal: anxiety, reactivity) or shutting down (hypoarousal: numbness, dissociation). Stress from a PIP narrows this window. The goal: notice when you leave it and have a plan to return.', 'hint', 'A zone between two extremes.'),
        jsonb_build_object('id', 'j5', 'prompt', 'What are your top 3 values and how do they relate to your PIP situation?', 'answer', 'Your specific values were identified in your values exercises. The connection to PIP: are you making decisions from your values or from fear? Values-aligned decisions might mean fighting for the role, or they might mean leaving — the answer depends on whether staying aligns with what matters most to you.', 'hint', 'Are your decisions coming from values or from fear?')
      )
    )
  ))
  WHERE id = day14_id;

  -- Day 21
  UPDATE program_days SET coaching_exercises = coaching_exercises || jsonb_build_array(jsonb_build_object(
    'name', 'Week 3 Concept Check',
    'type', 'retrieval_check',
    'whyThis', 'Three weeks of PIP navigation. The concepts you can recall and apply are the ones that will serve you beyond this program — whether you stay or leave.',
    'instruction', 'Most comprehensive check yet. Concepts rated "missed" are worth revisiting in Week 4.',
    'primitive', 'retrievalCheck',
    'prePopulated', jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object('id', 'j6', 'prompt', 'What is Kegan and Lahey''s Immunity to Change and how does it apply to your PIP?', 'answer', 'Four columns: (1) your goal, (2) what you do/don''t do instead, (3) hidden competing commitment, (4) big assumption. In PIP context: you might want to "show up confidently" but find yourself over-preparing or avoiding feedback — the hidden commitment might be to never appear incompetent, driven by the assumption that one mistake means you are fundamentally inadequate.', 'hint', 'Four columns. The third one is hidden.'),
        jsonb_build_object('id', 'j7', 'prompt', 'What is your contingency plan for both PIP outcomes?', 'answer', 'Whether you pass or don''t pass the PIP, you need a plan. Pass: what changes to sustain? What support to request? Don''t pass: what is your financial runway? What is your narrative? What doors does this open? Having both plans reduces the survival-mode thinking that impairs performance during the PIP itself.', 'hint', 'Two scenarios. Both need a plan.')
      )
    )
  ))
  WHERE id = day21_id;

END $$;

-- ═══════════════════════════════════════════════
-- BASECAMP (New Role Confidence) — similar structure
-- ═══════════════════════════════════════════════

DO $$
DECLARE
  prog_id uuid;
  day7_id uuid;
  day14_id uuid;
  day21_id uuid;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE slug = 'basecamp';
  SELECT id INTO day7_id FROM program_days WHERE program_id = prog_id AND day_number = 7;
  SELECT id INTO day14_id FROM program_days WHERE program_id = prog_id AND day_number = 14;
  SELECT id INTO day21_id FROM program_days WHERE program_id = prog_id AND day_number = 21;

  -- Day 7
  UPDATE program_days SET coaching_exercises = coaching_exercises || jsonb_build_array(jsonb_build_object(
    'name', 'Week 1 Concept Check',
    'type', 'retrieval_check',
    'whyThis', 'One week in your new role while building self-awareness. Spaced retrieval strengthens retention by up to 50% (Roediger & Karpicke, Washington University). This quick check helps consolidate Week 1.',
    'instruction', 'Write what you remember, then reveal. Rate honestly.',
    'primitive', 'retrievalCheck',
    'prePopulated', jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object('id', 'b1', 'prompt', 'What are the Seven Disruptions in the new role context?', 'answer', 'Competence Confidence, Social Belonging, Cultural Fluency, Identity Continuity, Clarity of Expectations, Routine & Rhythm, Authority & Credibility.', 'hint', 'What shifted when you started the new role?'),
        jsonb_build_object('id', 'b2', 'prompt', 'What is imposter syndrome and how is it different from genuine incompetence?', 'answer', 'Imposter syndrome (Pauline Clance & Suzanne Imes, 1978) is the persistent feeling of being a fraud despite evidence of competence. The key difference: if you were genuinely incompetent, you probably would not worry about it (Dunning-Kruger effect). The anxiety itself is often evidence of awareness and high standards — not evidence of inadequacy.', 'hint', 'The worry itself is often the evidence against it.'),
        jsonb_build_object('id', 'b3', 'prompt', 'Name one technique for building credibility in a new role.', 'answer', 'Examples: ask questions that show you have done your homework, deliver one early win in your first 30 days, learn the informal power structure, find an ally/mentor, listen more than you talk in the first 2 weeks. Michael Watkins (Harvard) calls the first 90 days the "breakeven point" — where you start contributing more than you consume.', 'hint', 'Think about the first 90 days research.')
      )
    )
  ))
  WHERE id = day7_id;

  -- Day 14
  UPDATE program_days SET coaching_exercises = coaching_exercises || jsonb_build_array(jsonb_build_object(
    'name', 'Week 2 Concept Check',
    'type', 'retrieval_check',
    'whyThis', 'Two weeks of building confidence in your new role. This checks the identity and values work you have done.',
    'instruction', 'Write your answer first, then reveal.',
    'primitive', 'retrievalCheck',
    'prePopulated', jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object('id', 'b4', 'prompt', 'What are your top 3 values and how do they show up in your new role?', 'answer', 'Your specific values were identified in your values exercises. The connection: are you living these values in how you show up at work, or are you performing a version of yourself you think the new role requires? Authentic leadership starts with values alignment.', 'hint', 'Are you being yourself or performing a character?'),
        jsonb_build_object('id', 'b5', 'prompt', 'What is the difference between proving yourself and contributing?', 'answer', 'Proving yourself is driven by fear — fear of being found out, fear of not being enough. Contributing is driven by purpose — using your skills to serve the work. Proving is exhausting and unsustainable. Contributing is energizing and builds genuine credibility. The shift happens when you stop asking "am I good enough?" and start asking "what does this situation need?"', 'hint', 'One is fear-driven. The other is purpose-driven.')
      )
    )
  ))
  WHERE id = day14_id;

  -- Day 21
  UPDATE program_days SET coaching_exercises = coaching_exercises || jsonb_build_array(jsonb_build_object(
    'name', 'Week 3 Concept Check',
    'type', 'retrieval_check',
    'whyThis', 'Three weeks of building real confidence. These are the concepts that will sustain you beyond the program.',
    'instruction', 'Most comprehensive check. Concepts rated "missed" are worth revisiting in Week 4.',
    'primitive', 'retrievalCheck',
    'prePopulated', jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object('id', 'b6', 'prompt', 'What is your saboteur pattern and its antidote?', 'answer', 'Your specific saboteur was identified in earlier exercises. In a new role, the saboteur often gets louder because everything is unfamiliar. The antidote: notice it, name it, choose differently. The saboteur thrives on ambiguity — the more specific your plan, the quieter it gets.', 'hint', 'Notice, name, choose differently.'),
        jsonb_build_object('id', 'b7', 'prompt', 'What does your 90-day success plan look like?', 'answer', 'A 90-day plan should include: (1) relationships to build (who matters, who can help), (2) quick wins to deliver (visible, meaningful contributions), (3) learning priorities (what you need to understand about the business, team, culture), (4) boundaries to set (what you will and won''t do to prove yourself). The plan is a compass, not a contract.', 'hint', 'Four categories: relationships, wins, learning, boundaries.')
      )
    )
  ))
  WHERE id = day21_id;

END $$;
