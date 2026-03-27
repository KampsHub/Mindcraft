-- Split Day 3's combined exercise into two separate exercises with full context
-- Run in Supabase SQL Editor

UPDATE program_days
SET coaching_exercises = '[
  {
    "name": "Body Scan",
    "duration_min": 3,
    "why_now": "Your mind has been doing all the processing since this happened. Your body has been processing too — but nobody asked it. This is the first time you check in with what your body already knows.",
    "custom_framing": "Sit still for 30 seconds. Then scan slowly from your head to your feet.\n\nNotice:\n- Jaw: tight or loose?\n- Shoulders: up near your ears or dropped?\n- Chest: open or caved?\n- Stomach: clenched or soft?\n- Hands: fists or open?\n\nWrite one sentence about what you found. No interpretation — just the physical data. Like a weather report for your body.",
    "why_this_works": "Interoceptive awareness — the ability to read your own body signals — reduces amygdala reactivity by up to 30%. When you name a physical sensation (\"my jaw is tight\"), your prefrontal cortex activates, which shifts you from emotional flooding to observation. This is the fastest way to move from reacting to responding."
  },
  {
    "name": "What Your Family Taught You About Work",
    "duration_min": 5,
    "why_now": "The way you are responding to this situation right now — the shame, the urgency, the story you are telling yourself — most of it was installed before you were 12. This exercise finds where the programming came from.",
    "custom_framing": "Answer each question in one sentence. Go fast — first thought, not best thought.\n\n1. What did your family believe about people who lose their jobs?\n2. What was the worst thing you could be in your family? (lazy, dependent, unsuccessful, a burden — pick the word that lands)\n3. When something went wrong at work for someone in your family, what did they do? (push harder, pretend it was fine, blame someone, go quiet)\n4. Which of those responses are you doing right now?\n\nLook at your answers. The belief that feels most active today — that is what we will work with this week.",
    "why_this_works": "Family-of-origin work (from Bowen Systems Theory) shows that 60-80% of our stress responses are inherited behavioral patterns, not rational choices. When you can name the inherited belief (\"people who lose their jobs are lazy\"), you create cognitive distance from it — you can see it as a belief you absorbed, not a fact about who you are. This distinction is the first step to choosing a different response."
  }
]'::jsonb
WHERE day_number = 3
AND program_id IN (SELECT id FROM programs WHERE slug = 'parachute');
