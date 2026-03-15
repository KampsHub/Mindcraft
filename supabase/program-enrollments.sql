-- ============================================================
-- PROGRAM_ENROLLMENTS TABLE
-- Links a user to a program with status, intake data, and progress
-- ============================================================

CREATE TABLE IF NOT EXISTS public.program_enrollments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL DEFAULT auth.uid(),
  program_id        uuid NOT NULL REFERENCES public.programs(id),
  current_day       int DEFAULT 0,
  status            text DEFAULT 'pre_start'
                    CHECK (status IN ('pre_start', 'onboarding', 'awaiting_goals', 'active', 'completed', 'paused')),
  pre_start_data    jsonb DEFAULT '{}',           -- minimal intake responses
  onboarding_data   jsonb DEFAULT '{}',           -- accumulated from Days 1-3 exercises
  assessment_data   jsonb DEFAULT '{}',           -- optional: Enneagram, LCP, Saboteur results
  goals_approved    boolean DEFAULT false,
  started_at        timestamptz,
  completed_at      timestamptz,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(client_id, program_id)
);

ALTER TABLE public.program_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can read their own enrollments
CREATE POLICY "Users can read own enrollments"
  ON public.program_enrollments FOR SELECT
  USING (client_id = auth.uid());

-- Users can insert their own enrollments
CREATE POLICY "Users can insert own enrollments"
  ON public.program_enrollments FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Users can update their own enrollments
CREATE POLICY "Users can update own enrollments"
  ON public.program_enrollments FOR UPDATE
  USING (client_id = auth.uid());

CREATE INDEX idx_enrollments_client ON public.program_enrollments(client_id);
CREATE INDEX idx_enrollments_program ON public.program_enrollments(program_id);
CREATE INDEX idx_enrollments_status ON public.program_enrollments(status);
