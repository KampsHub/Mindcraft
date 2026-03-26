-- Update weekly_themes territories with full sentence versions from seed files
-- Run this in the Supabase SQL Editor

-- PARACHUTE
UPDATE programs
SET weekly_themes = jsonb_build_array(
  jsonb_build_object(
    'week', 1,
    'name', 'GROUND',
    'title', 'Face What Actually Happened',
    'territory', 'Process the grief, shock, and financial anxiety of job loss. Assess the seven disruptions. Identify your nervous system patterns and saboteurs. Establish a daily practice.'
  ),
  jsonb_build_object(
    'week', 2,
    'name', 'DIG',
    'title', 'Uncover the Beliefs Underneath',
    'territory', 'Examine what you believe about yourself, your worth, and where those beliefs came from. Deepen saboteur awareness. Trace family patterns around work and identity. Clarify your values.'
  ),
  jsonb_build_object(
    'week', 3,
    'name', 'BUILD',
    'title', 'Rebuild Your Story and Confidence',
    'territory', 'Construct an honest narrative about what happened. Assess your competence without the distortion of loss. Understand market and industry shifts. Notice what is emerging.'
  ),
  jsonb_build_object(
    'week', 4,
    'name', 'INTEGRATE',
    'title', 'Bring It All Together',
    'territory', 'Reassess your disruptions with fresh eyes. Pressure-test your values. Consolidate saboteur awareness into a forward practice. Name what is still unresolved.'
  )
)
WHERE slug = 'parachute';

-- JETSTREAM
UPDATE programs
SET weekly_themes = jsonb_build_array(
  jsonb_build_object(
    'week', 1,
    'name', 'LAND',
    'title', 'Get Honest About What Is Actually Happening',
    'territory', 'Process the shock, shame, and hypervigilance that come with a PIP. Honestly assess what the PIP says and what it means. Identify your saboteurs and start tracking them in real time. Stabilize your nervous system while continuing to work.'
  ),
  jsonb_build_object(
    'week', 2,
    'name', 'STEADY',
    'title', 'Communicate Clearly and Think Strategically',
    'territory', 'Learn to speak from center under evaluation pressure. Understand how stress is affecting your relationships at home and at work. Manage the manager relationship with intention. Assess your options and face the decision you may be avoiding.'
  ),
  jsonb_build_object(
    'week', 3,
    'name', 'BUILD',
    'title', 'Rebuild Competence and Set Boundaries',
    'territory', 'Test the PIP''s competence claims against reality and cognitive distortions. Define what you will and will not do to meet this PIP. Run both tracks — performing and preparing — with intention. Build self-efficacy that does not depend on one manager''s evaluation.'
  ),
  jsonb_build_object(
    'week', 4,
    'name', 'ORIENT',
    'title', 'Understand What This Activated and Choose What Comes Next',
    'territory', 'Revisit the seven disruptions with fresh perspective. Go deeper on the patterns this crisis revealed. Pressure-test your decisions under simulated conditions. Build a sustainable forward practice and name what remains unresolved.'
  )
)
WHERE slug = 'jetstream';

-- BASECAMP
UPDATE programs
SET weekly_themes = jsonb_build_array(
  jsonb_build_object(
    'week', 1,
    'name', 'ORIENT',
    'title', 'Read the Room and Know Yourself',
    'territory', 'Establish an honest baseline of how this transition is affecting you. Clarify your operational values. Identify your saboteurs and default patterns. Start reading the culture and mapping key stakeholders.'
  ),
  jsonb_build_object(
    'week', 2,
    'name', 'CONNECT',
    'title', 'Build Relationships and Map the System',
    'territory', 'Have the real conversations with people who know the history. Map power and proximity. Develop a strategy for the manager relationship. Practice deep listening and calibrate your communication style to this culture.'
  ),
  jsonb_build_object(
    'week', 3,
    'name', 'ACT',
    'title', 'Start Contributing From Alignment, Not Anxiety',
    'territory', 'Select early wins that match both your values and your manager''s priorities. Distinguish creative from reactive contributions. Calibrate how you communicate. Navigate imposter syndrome and your first real friction.'
  ),
  jsonb_build_object(
    'week', 4,
    'name', 'CALIBRATE',
    'title', 'Check What You Assumed Against What Is True',
    'territory', 'Reassess your disruptions and update your cultural and power maps with real data. Navigate the neutral zone between old and new identity. Audit your values and relationships. Design a sustainable practice for beyond Day 30.'
  )
)
WHERE slug = 'basecamp';
