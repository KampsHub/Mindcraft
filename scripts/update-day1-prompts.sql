-- Update Day 1 seed prompts to include context for concept-heavy questions
-- Run in Supabase SQL Editor

-- PARACHUTE Day 1
UPDATE program_days
SET seed_prompts = '[
  {"prompt": "What is true about your situation right now? Not what might happen.", "purpose": "Ground in present reality"},
  {"prompt": "Which of the seven disruptions is loudest?", "purpose": "Identify primary disruption", "context": "The seven disruptions are: income & financial security, routine & structure, identity, social belonging, sense of competence, future uncertainty, and skill confidence. Losing a job can shake all of them at once."},
  {"prompt": "What did you lose that you have not said out loud yet?", "purpose": "Surface unspoken grief"}
]'::jsonb
WHERE day_number = 1
AND program_id = (SELECT id FROM programs WHERE slug = 'parachute');

-- JETSTREAM Day 1
UPDATE program_days
SET seed_prompts = (
  SELECT jsonb_agg(
    CASE
      WHEN elem->>'prompt' LIKE '%seven disruptions%'
      THEN elem || '{"context": "The seven disruptions are: income & financial security, routine & structure, identity, social belonging, sense of competence, future uncertainty, and skill confidence. A PIP can activate several at once — even though you still have the job."}'::jsonb
      ELSE elem
    END
  )
  FROM jsonb_array_elements(seed_prompts) AS elem
)
WHERE day_number = 1
AND program_id = (SELECT id FROM programs WHERE slug = 'jetstream')
AND seed_prompts IS NOT NULL;

-- BASECAMP Day 1
UPDATE program_days
SET seed_prompts = (
  SELECT jsonb_agg(
    CASE
      WHEN elem->>'prompt' LIKE '%seven disruptions%'
      THEN elem || '{"context": "The seven disruptions are: income & financial security, routine & structure, identity, social belonging, sense of competence, future uncertainty, and skill confidence. Starting a new role can quietly activate several — even a positive change is still a disruption."}'::jsonb
      ELSE elem
    END
  )
  FROM jsonb_array_elements(seed_prompts) AS elem
)
WHERE day_number = 1
AND program_id = (SELECT id FROM programs WHERE slug = 'basecamp')
AND seed_prompts IS NOT NULL;
