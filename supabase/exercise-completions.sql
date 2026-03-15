-- ============================================================
-- EXERCISE_COMPLETIONS TABLE
-- Each exercise completed within a daily session.
-- Covers coaching plan (required), overflow (optional),
-- and framework analysis exercises.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exercise_completions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_session_id  uuid NOT NULL REFERENCES public.daily_sessions(id) ON DELETE CASCADE,
  enrollment_id     uuid NOT NULL REFERENCES public.program_enrollments(id) ON DELETE CASCADE,
  client_id         uuid NOT NULL DEFAULT auth.uid(),

  -- Which framework/exercise was used
  framework_name    text NOT NULL,
  framework_id      uuid REFERENCES public.frameworks_library(id),

  -- Exercise classification
  exercise_type     text NOT NULL CHECK (exercise_type IN ('coaching_plan', 'overflow', 'framework_analysis')),
  modality          text,                    -- cognitive, somatic, relational, integrative, systems

  -- How the exercise was presented to this client
  custom_framing    text,

  -- Client's written responses
  responses         jsonb DEFAULT '{}',

  -- Rating and feedback
  star_rating       int CHECK (star_rating IS NULL OR (star_rating BETWEEN 1 AND 5)),
  feedback          text,

  completed_at      timestamptz DEFAULT now()
);

ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;

-- Users can read their own completions
CREATE POLICY "Users can read own completions"
  ON public.exercise_completions FOR SELECT
  USING (client_id = auth.uid());

-- Users can insert their own completions
CREATE POLICY "Users can insert own completions"
  ON public.exercise_completions FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Users can update their own completions (add rating/feedback)
CREATE POLICY "Users can update own completions"
  ON public.exercise_completions FOR UPDATE
  USING (client_id = auth.uid());

CREATE INDEX idx_completions_session ON public.exercise_completions(daily_session_id);
CREATE INDEX idx_completions_enrollment ON public.exercise_completions(enrollment_id);
CREATE INDEX idx_completions_client ON public.exercise_completions(client_id);
CREATE INDEX idx_completions_type ON public.exercise_completions(exercise_type);
CREATE INDEX idx_completions_framework ON public.exercise_completions(framework_id);
