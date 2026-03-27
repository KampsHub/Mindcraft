-- Coaching Memory Table
-- Stores key insights, patterns, breakthroughs, and triggers extracted from each session.
-- Retrieved via embedding similarity before each AI interaction to provide continuity.

CREATE TABLE IF NOT EXISTS coaching_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES program_enrollments(id) ON DELETE SET NULL,

  -- Memory classification
  memory_type TEXT NOT NULL CHECK (memory_type IN (
    'insight',       -- Something the user realized ("I built my identity around being needed")
    'pattern',       -- Recurring behavior identified ("I withdraw when I feel judged")
    'breakthrough',  -- Significant shift or realization
    'trigger',       -- Emotional trigger identified
    'preference',    -- User preference for coaching style/exercises
    'goal_progress', -- Progress toward a specific goal
    'relationship'   -- Key relationship dynamic surfaced
  )),

  -- Content
  content TEXT NOT NULL,           -- The memory itself (1-2 sentences)
  source_context TEXT,             -- What prompted this memory (journal excerpt, exercise, etc.)
  source_day INT,                  -- Which program day this came from

  -- Relevance tracking
  relevance_score FLOAT DEFAULT 1.0,  -- Decays over time unless reinforced
  reinforced_count INT DEFAULT 0,      -- How many times this pattern resurfaced
  last_referenced_at TIMESTAMPTZ,      -- Last time this memory was used in a prompt

  -- Embedding for semantic retrieval
  embedding VECTOR(1536),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coaching_memory_client ON coaching_memory(client_id);
CREATE INDEX IF NOT EXISTS idx_coaching_memory_type ON coaching_memory(client_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_coaching_memory_relevance ON coaching_memory(client_id, relevance_score DESC);

-- Enable RLS
ALTER TABLE coaching_memory ENABLE ROW LEVEL SECURITY;

-- Users can only see their own memories
CREATE POLICY coaching_memory_select ON coaching_memory
  FOR SELECT USING (auth.uid() = client_id);

-- Only service role can insert/update (via API routes)
CREATE POLICY coaching_memory_insert ON coaching_memory
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Decay function: reduce relevance_score by 5% daily for memories not referenced in 7+ days
-- Run via Supabase cron or Edge Function
CREATE OR REPLACE FUNCTION decay_coaching_memories()
RETURNS void AS $$
BEGIN
  UPDATE coaching_memory
  SET relevance_score = GREATEST(relevance_score * 0.95, 0.1),
      updated_at = now()
  WHERE last_referenced_at < now() - INTERVAL '7 days'
    AND relevance_score > 0.1;
END;
$$ LANGUAGE plpgsql;
