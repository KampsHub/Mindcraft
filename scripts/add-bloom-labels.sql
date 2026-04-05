-- Bloom's Taxonomy Labels for Deep-Learning Exercises
-- Adds a bloom_level column to frameworks_library to classify exercises
-- by cognitive depth. Also adds concept_arc tracking for repeated concepts.
-- Run in Supabase SQL Editor.

-- ═══════════════════════════════════════════════
-- 1. Add bloom_level column to frameworks_library
-- ═══════════════════════════════════════════════

ALTER TABLE frameworks_library
ADD COLUMN IF NOT EXISTS bloom_level text CHECK (bloom_level IN (
  'remember',    -- recall facts, basic concepts (Day 1-3 intake exercises)
  'understand',  -- explain ideas, paraphrase (early framework introductions)
  'apply',       -- use information in new situations (mid-program practice)
  'analyze',     -- draw connections, identify patterns (pattern recognition exercises)
  'evaluate',    -- justify decisions, make judgments (values ranking, priority sorting)
  'create'       -- produce new work, design plans (contingency plans, scripts, integration)
));

ALTER TABLE frameworks_library
ADD COLUMN IF NOT EXISTS concept_tags text[] DEFAULT '{}';

COMMENT ON COLUMN frameworks_library.bloom_level IS 'Bloom''s Taxonomy level: remember → understand → apply → analyze → evaluate → create';
COMMENT ON COLUMN frameworks_library.concept_tags IS 'Concepts this exercise teaches or reinforces, for tracking arcs across the program (e.g., saboteurs, values, window-of-tolerance, boundaries)';

-- ═══════════════════════════════════════════════
-- 2. Label exercises by Bloom's level
-- This is a starting classification — refine as exercises are audited
-- ═══════════════════════════════════════════════

-- REMEMBER level (intake, identification)
UPDATE frameworks_library SET bloom_level = 'remember'
WHERE name ILIKE '%inventory%' OR name ILIKE '%assessment%' OR name ILIKE '%check-in%';

-- UNDERSTAND level (framework introductions)
UPDATE frameworks_library SET bloom_level = 'understand'
WHERE (name ILIKE '%map%' OR name ILIKE '%observation%' OR name ILIKE '%awareness%')
  AND bloom_level IS NULL;

-- APPLY level (practice exercises)
UPDATE frameworks_library SET bloom_level = 'apply'
WHERE (name ILIKE '%practice%' OR name ILIKE '%script%' OR name ILIKE '%rehearsal%' OR name ILIKE '%communication%')
  AND bloom_level IS NULL;

-- ANALYZE level (pattern recognition)
UPDATE frameworks_library SET bloom_level = 'analyze'
WHERE (name ILIKE '%pattern%' OR name ILIKE '%sort%' OR name ILIKE '%distortion%' OR name ILIKE '%horsemen%')
  AND bloom_level IS NULL;

-- EVALUATE level (judgment, ranking, decision)
UPDATE frameworks_library SET bloom_level = 'evaluate'
WHERE (name ILIKE '%values%' OR name ILIKE '%priority%' OR name ILIKE '%decision%' OR name ILIKE '%rank%')
  AND bloom_level IS NULL;

-- CREATE level (produce new artifacts)
UPDATE frameworks_library SET bloom_level = 'create'
WHERE (name ILIKE '%plan%' OR name ILIKE '%contingency%' OR name ILIKE '%letter%' OR name ILIKE '%narrative%' OR name ILIKE '%integration%')
  AND bloom_level IS NULL;

-- Default remaining to 'apply'
UPDATE frameworks_library SET bloom_level = 'apply' WHERE bloom_level IS NULL;

-- ═══════════════════════════════════════════════
-- 3. Tag common concepts for arc tracking
-- ═══════════════════════════════════════════════

UPDATE frameworks_library SET concept_tags = array_append(concept_tags, 'saboteurs')
WHERE name ILIKE '%saboteur%' OR name ILIKE '%inner critic%' OR name ILIKE '%voice%'
  AND NOT ('saboteurs' = ANY(concept_tags));

UPDATE frameworks_library SET concept_tags = array_append(concept_tags, 'values')
WHERE name ILIKE '%values%' OR name ILIKE '%what matters%'
  AND NOT ('values' = ANY(concept_tags));

UPDATE frameworks_library SET concept_tags = array_append(concept_tags, 'boundaries')
WHERE name ILIKE '%boundary%' OR name ILIKE '%boundaries%' OR name ILIKE '%request%'
  AND NOT ('boundaries' = ANY(concept_tags));

UPDATE frameworks_library SET concept_tags = array_append(concept_tags, 'window-of-tolerance')
WHERE name ILIKE '%window%' OR name ILIKE '%regulation%' OR name ILIKE '%grounding%'
  AND NOT ('window-of-tolerance' = ANY(concept_tags));

UPDATE frameworks_library SET concept_tags = array_append(concept_tags, 'identity')
WHERE name ILIKE '%identity%' OR name ILIKE '%who am i%' OR name ILIKE '%narrative%'
  AND NOT ('identity' = ANY(concept_tags));

UPDATE frameworks_library SET concept_tags = array_append(concept_tags, 'communication')
WHERE name ILIKE '%communication%' OR name ILIKE '%NVC%' OR name ILIKE '%horsemen%' OR name ILIKE '%feedback%'
  AND NOT ('communication' = ANY(concept_tags));

UPDATE frameworks_library SET concept_tags = array_append(concept_tags, 'grief')
WHERE name ILIKE '%grief%' OR name ILIKE '%loss%' OR name ILIKE '%belonging%'
  AND NOT ('grief' = ANY(concept_tags));

-- ═══════════════════════════════════════════════
-- 4. Verify counts
-- ═══════════════════════════════════════════════
-- SELECT bloom_level, count(*) FROM frameworks_library GROUP BY bloom_level ORDER BY bloom_level;
-- SELECT unnest(concept_tags) as concept, count(*) FROM frameworks_library GROUP BY concept ORDER BY count DESC;
