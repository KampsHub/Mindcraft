-- Update Parachute coaching exercise descriptions to actual instructions
-- Run in Supabase SQL Editor

-- Day 1: Seven Disruptions Inventory
UPDATE program_days
SET coaching_exercises = jsonb_set(
  coaching_exercises,
  '{0,custom_framing}',
  '"Rate each of these seven areas on a scale of 1-10 for how disrupted they feel right now:\n\n1. Financial security — How stable does your money situation feel?\n2. Daily structure — How much of your routine survived?\n3. Identity — How much of who you are was tied to that role?\n4. Relationships — Which relationships shifted when your job changed?\n5. Purpose — How clear is your sense of direction right now?\n6. Health — How is your body handling this? Sleep, appetite, energy.\n7. Self-worth — Separate from the job, how do you feel about yourself?\n\nWrite a number for each. Then pick the one that surprised you and write one sentence about why."'
)
WHERE day_number = 1
AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute')
AND coaching_exercises IS NOT NULL;

-- Day 2: Timeline Mapping
UPDATE program_days
SET coaching_exercises = jsonb_set(
  coaching_exercises,
  '{0,custom_framing}',
  '"Draw a timeline of the last 6 months. Mark these moments:\n\n1. The first sign something was changing (even if you ignored it)\n2. The moment you knew for sure\n3. The moment other people found out\n4. Where you are right now\n\nFor each moment, write one sentence: what happened, and what you told yourself about it at the time.\n\nThen look at the gap between what actually happened and the story you built around it. Where is the biggest gap?"'
)
WHERE day_number = 2
AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute')
AND coaching_exercises IS NOT NULL;

-- Day 3: Somatic Mapping + Family Patterns
UPDATE program_days
SET coaching_exercises = jsonb_set(
  coaching_exercises,
  '{0,custom_framing}',
  '"Part 1 — Body scan (2 minutes):\nSit still. Close your eyes if comfortable. Scan from head to feet and notice:\n- Where is there tension? (jaw, shoulders, chest, stomach, hands)\n- Where is there numbness or nothing?\n- Write what you found. Physical data only — not emotions, not explanations.\n\nPart 2 — Family patterns (3 minutes):\nAnswer these quickly, one sentence each:\n- What did your family believe about people who lose their jobs?\n- What was the worst thing someone in your family could be? (lazy, dependent, unsuccessful, a burden?)\n- When something went wrong at work growing up, what did the adults around you do?\n- Which of those beliefs are you carrying right now?\n\nCircle the one that feels most active today."'
)
WHERE day_number = 3
AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute')
AND coaching_exercises IS NOT NULL;
