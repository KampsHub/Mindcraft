-- Split Day 3's combined exercise into two separate exercises with full context
-- Run in Supabase SQL Editor

UPDATE program_days
SET coaching_exercises = '[
  {
    "name": "Body Scan",
    "duration_min": 3,
    "why_now": "Your mind has been doing most of the processing since this happened. This exercise checks in with your body — tension, numbness, energy — which often carries information your thinking hasn''t caught up with yet.",
    "custom_framing": "Sit still for 30 seconds. Then scan slowly from your head to your feet.\n\nNotice:\n- Jaw: tight or loose?\n- Shoulders: up near your ears or dropped?\n- Chest: open or caved?\n- Stomach: clenched or soft?\n- Hands: fists or open?\n\nWrite one sentence about what you found. No interpretation — just the physical data. Like a weather report for your body.",
    "why_this_works": "Interoceptive awareness — the ability to read your own body signals — reduces amygdala reactivity by up to 30%. When you name a physical sensation (\"my jaw is tight\"), your prefrontal cortex activates, which shifts you from emotional flooding to observation."
  },
  {
    "name": "What Your Family Taught You About Work",
    "duration_min": 5,
    "why_now": "How you respond to a job loss — the shame, the urgency, the story you tell yourself — is shaped by what you grew up around. This exercise looks at where some of those responses came from.",
    "custom_framing": "Answer each question in one sentence. Go fast — first thought, not best thought.\n\n1. What did your family believe about people who lose their jobs?\n2. What was the worst thing you could be in your family? (lazy, dependent, unsuccessful, a burden — pick the word that lands)\n3. When something went wrong at work for someone in your family, what did they do? (push harder, pretend it was fine, blame someone, go quiet)\n4. Which of those responses are you doing right now?\n\nLook at your answers. The belief that feels most active today — that is what we will work with this week.",
    "why_this_works": "Family-of-origin work (from Bowen Systems Theory) shows that many of our stress responses are inherited behavioral patterns rather than rational choices. When you can name an inherited belief (\"people who lose their jobs are lazy\"), you create cognitive distance from it — you can see it as something you absorbed, not a fact about who you are."
  }
]'::jsonb
WHERE day_number = 3
AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute');
