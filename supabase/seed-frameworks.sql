-- Seed the frameworks_library with 10 authored coaching frameworks
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- The table should already exist from schema.sql

-- Create a default coach if none exists, and store the ID for inserts
insert into public.coaches (id, email, name)
values ('00000000-0000-0000-0000-000000000001', 'coach@allmindsondeck.com', 'All Minds on Deck')
on conflict (id) do nothing;

-- Ensure RLS policy exists for reading
drop policy if exists "Anyone authenticated can read frameworks" on public.frameworks_library;
create policy "Anyone authenticated can read frameworks"
  on public.frameworks_library for select
  using (auth.role() = 'authenticated');

-- ── 1. Values Clarification ──
insert into public.frameworks_library (coach_id, name, description, instructions, category, target_packages, difficulty_level, theme_tags) values (
  '00000000-0000-0000-0000-000000000001',
  'Values Clarification',
  'Identify and rank your core values to create a decision-making compass. When you know what matters most, choices get clearer.',
  'Step 1: Review the list of values below and circle the 10 that resonate most: Autonomy, Belonging, Achievement, Security, Growth, Impact, Creativity, Honesty, Adventure, Connection, Justice, Compassion, Excellence, Freedom, Loyalty, Courage, Wisdom, Playfulness, Service, Authenticity.

Step 2: From your 10, eliminate 5. This is where it gets hard. You''re not saying these don''t matter — you''re finding what matters *most*.

Step 3: Rank your final 5 from most to least important.

Step 4: For each of your top 3, write one sentence about a time you honoured that value and one sentence about a time you violated it. Notice what comes up.

Reflection: Where in your current life are your top values being honoured? Where are they being stepped on?',
  'self-awareness',
  '{layoff,international_move,new_manager,general_growth}',
  'beginner',
  '{identity_self_worth,purpose_alignment,autonomy}'
);

-- ── 2. Inner Critic Dialogue ──
insert into public.frameworks_library (coach_id, name, description, instructions, category, target_packages, difficulty_level, theme_tags) values (
  '00000000-0000-0000-0000-000000000001',
  'Inner Critic Dialogue',
  'Give your inner critic a name and have a structured conversation with it. The goal isn''t to silence it — it''s to stop letting it run the show.',
  'Step 1: Think about the critical voice that shows up when you''re stressed, failing, or exposed. What does it typically say? Write down its three most common lines.

Step 2: Give this voice a name. Not your name — something that creates distance. ("The Prosecutor," "The Perfectionist," "Margaret.")

Step 3: Write a short dialogue. Start with what the critic says, then respond from your grounded self. Example:
- Critic: "You''re going to embarrass yourself."
- You: "I hear you. You''re trying to protect me from rejection. But I can handle discomfort."

Step 4: Ask the critic: "What are you trying to protect me from?" Write the answer.

Reflection: What does your critic need to hear from you to quiet down — not disappear, but quiet down?',
  'self-awareness',
  '{layoff,international_move,new_manager,general_growth}',
  'intermediate',
  '{inner_critic,fear_of_failure,perfectionism}'
);

-- ── 3. Boundary Mapping ──
insert into public.frameworks_library (coach_id, name, description, instructions, category, target_packages, difficulty_level, theme_tags) values (
  '00000000-0000-0000-0000-000000000001',
  'Boundary Mapping',
  'Map where your boundaries are clear, where they''re porous, and where they''re rigid. Boundaries aren''t walls — they''re the space where you end and someone else begins.',
  'Step 1: List 5 key relationships (partner, boss, parent, friend, colleague).

Step 2: For each, rate your boundary strength on a scale:
- Rigid (I shut people out, don''t share, over-protect)
- Healthy (I can say no, share selectively, maintain my sense of self)
- Porous (I absorb their emotions, over-share, lose myself)

Step 3: Pick the most porous boundary. Write down: What am I afraid will happen if I hold this boundary?

Step 4: Write one specific boundary statement for that relationship: "I am willing to ___. I am not willing to ___."

Reflection: What pattern do you notice across your boundaries? Is there a connection to how boundaries were modelled in your family?',
  'boundaries',
  '{new_manager,general_growth,international_move}',
  'intermediate',
  '{boundary_setting,people_pleasing,autonomy}'
);

-- ── 4. Wheel of Life Check-In ──
insert into public.frameworks_library (coach_id, name, description, instructions, category, target_packages, difficulty_level, theme_tags) values (
  '00000000-0000-0000-0000-000000000001',
  'Wheel of Life Check-In',
  'A snapshot of satisfaction across 8 life areas. Not to judge — to see clearly where energy is going and where it''s missing.',
  'Rate your current satisfaction (1–10) in each area:
1. Career / Work
2. Finances
3. Health / Fitness
4. Relationships / Romance
5. Family
6. Social / Friends
7. Personal Growth / Learning
8. Fun / Recreation

Step 2: Circle the two lowest scores. These are your attention areas — not your failures.

Step 3: For each low-scoring area, write: "The reason this scores low is ___. One small thing I could do this week is ___."

Step 4: Now look at your highest score. What''s working there that you could apply to a low-scoring area?

Reflection: If you did this exercise 6 months ago, what would have been different? What does that movement tell you?',
  'self-awareness',
  '{layoff,international_move,new_manager,general_growth}',
  'beginner',
  '{purpose_alignment,self_awareness,growth_momentum}'
);

-- ── 5. Parts Work: Who''s Driving? ──
insert into public.frameworks_library (coach_id, name, description, instructions, category, target_packages, difficulty_level, theme_tags) values (
  '00000000-0000-0000-0000-000000000001',
  'Parts Work: Who''s Driving?',
  'Identify the different "parts" of yourself that show up in challenging moments. Based on Internal Family Systems — the idea that we''re not one self, but a system of parts with different needs.',
  'Step 1: Think of a recent moment where you felt conflicted — pulled in two directions. Describe the situation briefly.

Step 2: Name the parts that showed up. Give each one a role:
- The Protector (keeps you safe, avoids risk)
- The Achiever (pushes for more, never enough)
- The Pleaser (says yes, avoids conflict)
- The Exile (holds the pain you don''t want to feel)
Or create your own labels.

Step 3: For each part, write what it was saying and what it needed.

Step 4: Now write from your "Self" — the grounded, curious centre that can hold all these parts without being run by any of them. What would Self say to each part?

Reflection: Which part drives most often? Which part do you exile?',
  'self-awareness',
  '{layoff,international_move,new_manager,general_growth}',
  'advanced',
  '{identity_self_worth,vulnerability_avoidance,control}'
);

-- ── 6. Narrative Reframe ──
insert into public.frameworks_library (coach_id, name, description, instructions, category, target_packages, difficulty_level, theme_tags) values (
  '00000000-0000-0000-0000-000000000001',
  'Narrative Reframe',
  'Take a story you''re telling yourself about a situation and rewrite it — not to be positive, but to be more complete. The first story we tell is rarely the full story.',
  'Step 1: Write the story you''re currently telling yourself about a difficult situation. Write it exactly as your mind narrates it — including the villain, the victim, and the conclusion.

Step 2: Identify the assumptions. What are you treating as fact that might be interpretation? Underline every assumption.

Step 3: Write three alternative explanations for the other person''s behaviour or for what happened. Not excuses — just other possibilities you haven''t considered.

Step 4: Rewrite the story with the most complete version — including your role, the complexity, and what you don''t know.

Reflection: Which version of the story gives you more agency? Which one are you attached to, and why?',
  'cognitive',
  '{layoff,new_manager,general_growth}',
  'intermediate',
  '{inner_critic,interpersonal_conflict,self_awareness}'
);

-- ── 7. Transition Grief Inventory ──
insert into public.frameworks_library (coach_id, name, description, instructions, category, target_packages, difficulty_level, theme_tags) values (
  '00000000-0000-0000-0000-000000000001',
  'Transition Grief Inventory',
  'Name what you''re grieving in a transition — not just the obvious losses, but the invisible ones. You can''t move forward with unnamed grief weighing you down.',
  'Step 1: List everything you''ve lost or are losing in this transition. Include the obvious (job, home, routine) and the invisible (identity, status, a version of the future, daily rituals, a sense of belonging).

Step 2: For each item, mark: Have I acknowledged this loss, or have I been skipping past it?

Step 3: Pick the loss that surprises you most — the one you didn''t expect to grieve. Write about why it matters more than you thought.

Step 4: Write a brief "letter of release" to one thing you''re letting go of. Not a goodbye — a release. "I''m letting go of ___ because holding onto it is keeping me from ___."

Reflection: What does this transition make possible that wasn''t possible before?',
  'transition',
  '{layoff,international_move}',
  'intermediate',
  '{grief_loss,transition_grief,identity_self_worth}'
);

-- ── 8. Authority Relationship Map ──
insert into public.frameworks_library (coach_id, name, description, instructions, category, target_packages, difficulty_level, theme_tags) values (
  '00000000-0000-0000-0000-000000000001',
  'Authority Relationship Map',
  'Examine your relationship with authority — how you relate to people with power over you, and how you handle having power yourself. Most leadership struggles are authority struggles in disguise.',
  'Step 1: List the authority figures in your life (boss, parent, mentor, institution). For each one, write one word that describes how you feel around them.

Step 2: Notice the pattern. Do you tend to: defer and comply? rebel and resist? perform and seek approval? withdraw and disengage?

Step 3: Trace it back. How did you relate to authority growing up? What happened when you challenged your parents or teachers?

Step 4: Now consider: where are you the authority figure? (At work, in a relationship, as a parent.) How do you hold that power? Do you replicate the patterns you experienced, or swing to the opposite extreme?

Reflection: What would a healthy relationship with authority look like for you — both with people who have power over you and with your own power?',
  'leadership',
  '{new_manager,general_growth}',
  'advanced',
  '{authority_relationships,control,boundary_setting}'
);

-- ── 9. Stress Sequence Awareness (BeAbove) ──
insert into public.frameworks_library (coach_id, name, description, instructions, category, target_packages, difficulty_level, theme_tags) values (
  '00000000-0000-0000-0000-000000000001',
  'Stress Sequence Awareness',
  'Based on the BeAbove model — under stress, we move through predictable levels of consciousness. Knowing your sequence means you can catch yourself before you hit the bottom.',
  'Step 1: Think of a recent stressful event. Write a brief description.

Step 2: Map your sequence. What happened first? What did you think, feel, and do at each stage?
- First response (fight, flight, freeze, fawn?)
- What story did your mind create?
- What emotion dominated?
- What did you actually do?
- How long before you came back to baseline?

Step 3: Identify your "signal moment" — the earliest sign that you''re entering the stress sequence. Is it a body sensation? A thought? A behaviour?

Step 4: Write one intervention you could use at your signal moment — before the sequence runs its course. This doesn''t have to be profound: "I notice my jaw clenching. I take three breaths before responding."

Reflection: What would change if you could catch yourself at the signal moment consistently?',
  'self-awareness',
  '{layoff,new_manager,general_growth}',
  'intermediate',
  '{performance_anxiety,control,resilience}'
);

-- ── 10. Cultural Identity Reflection ──
insert into public.frameworks_library (coach_id, name, description, instructions, category, target_packages, difficulty_level, theme_tags) values (
  '00000000-0000-0000-0000-000000000001',
  'Cultural Identity Reflection',
  'Explore how your cultural background shapes your expectations, communication style, and sense of belonging. Especially powerful during cross-cultural transitions.',
  'Step 1: List 3 cultural contexts that shaped you (nationality, region, religion, class, profession, family culture). For each one, write one "rule" you absorbed about how to behave.

Step 2: Which of these rules serve you well in your current context? Which ones create friction?

Step 3: Think about a recent moment where you felt like an outsider. What cultural expectation was being violated — yours or theirs?

Step 4: Write about the version of yourself that exists between cultures — the one who doesn''t fully belong anywhere. What does that person know that someone who''s never been displaced doesn''t?

Reflection: What parts of your cultural identity do you want to keep, and what are you ready to renegotiate?',
  'identity',
  '{international_move,general_growth}',
  'intermediate',
  '{cultural_adjustment,belonging,identity_self_worth}'
);
