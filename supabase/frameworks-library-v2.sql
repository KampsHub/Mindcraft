-- ============================================================
-- FRAMEWORKS LIBRARY V2 — Extended Schema
-- Adds exercise scope, program linkage, modality, attribution,
-- duration, signal-based dispatch, neuroscience rationale,
-- coaching questions, and solo adaptations.
-- Run AFTER schema.sql + seed-frameworks.sql
-- ============================================================

-- New column: exercise scope (common = all programs, program_specific = one program)
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS exercise_scope text DEFAULT 'common'
    CHECK (exercise_scope IN ('common', 'program_specific'));

-- New column: which program this exercise belongs to (NULL for common)
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS program_slug text;

-- New column: source markdown file reference (e.g. "01", "02", "layoff-exercises")
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS source_file text;

-- New column: modality classification
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS modality text
    CHECK (modality IN ('cognitive', 'relational', 'somatic', 'integrative', 'systems', 'mixed'));

-- New column: originator / creator of the framework
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS originator text;

-- New column: source work (book, model, therapy system)
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS source_work text;

-- New column: estimated duration in minutes
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS duration_minutes int;

-- New column: when to use (signal-based triggers from 09-tool-quick-reference)
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS when_to_use text;

-- New column: neuroscience rationale
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS neuroscience_rationale text;

-- New column: coaching follow-up questions (JSON array)
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS coaching_questions jsonb DEFAULT '[]';

-- New column: file:line back-reference for traceability
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS file_line_ref text;

-- New column: step-by-step facilitation instructions
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS how_to_run text;

-- New column: solo adaptation notes (from File 05 index)
ALTER TABLE public.frameworks_library
  ADD COLUMN IF NOT EXISTS solo_adaptation text;

-- ============================================================
-- INDEXES for new columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_frameworks_scope
  ON public.frameworks_library(exercise_scope);

CREATE INDEX IF NOT EXISTS idx_frameworks_program
  ON public.frameworks_library(program_slug);

CREATE INDEX IF NOT EXISTS idx_frameworks_modality
  ON public.frameworks_library(modality);

CREATE INDEX IF NOT EXISTS idx_frameworks_source_file
  ON public.frameworks_library(source_file);

-- ============================================================
-- Update RLS: authenticated users can read all frameworks
-- (program-specific filtering happens in application layer)
-- ============================================================
DROP POLICY IF EXISTS "Anyone authenticated can read frameworks" ON public.frameworks_library;
CREATE POLICY "Anyone authenticated can read frameworks"
  ON public.frameworks_library FOR SELECT
  USING (auth.role() = 'authenticated');
