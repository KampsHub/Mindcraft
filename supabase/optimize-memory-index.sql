-- Optimize coaching_memory retrieval with indexes
-- Run this in Supabase SQL Editor

CREATE INDEX IF NOT EXISTS idx_coaching_memory_client_relevance
  ON coaching_memory (client_id, relevance_score DESC);
