-- ============================================================
-- DAILY_SESSIONS TABLE
-- Tracks each daily session through the 5-step flow.
-- One session per enrollment per day.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   uuid NOT NULL REFERENCES public.program_enrollments(id) ON DELETE CASCADE,
  client_id       uuid NOT NULL DEFAULT auth.uid(),
  day_number      int NOT NULL,
  date            date NOT NULL DEFAULT CURRENT_DATE,

  -- Step 1: Yesterday's themes (read-only output)
  step_1_themes   jsonb DEFAULT '{}',

  -- Step 2: Free-flow journal content
  step_2_journal  text DEFAULT '',

  -- Step 3: System processing output (state analysis, selected overflow exercises)
  step_3_analysis jsonb DEFAULT '{}',

  -- Step 5: Daily summary + patterns
  step_5_summary  jsonb DEFAULT '{}',

  -- Track which steps are completed
  completed_steps int[] DEFAULT '{}',

  -- Star rating for the day (1-5)
  day_rating      int CHECK (day_rating IS NULL OR (day_rating BETWEEN 1 AND 5)),

  -- Free-text feedback
  day_feedback    text,

  started_at      timestamptz DEFAULT now(),
  completed_at    timestamptz,

  UNIQUE(enrollment_id, day_number)
);

ALTER TABLE public.daily_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own sessions
CREATE POLICY "Users can read own sessions"
  ON public.daily_sessions FOR SELECT
  USING (client_id = auth.uid());

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON public.daily_sessions FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON public.daily_sessions FOR UPDATE
  USING (client_id = auth.uid());

CREATE INDEX idx_sessions_enrollment ON public.daily_sessions(enrollment_id);
CREATE INDEX idx_sessions_client ON public.daily_sessions(client_id);
CREATE INDEX idx_sessions_date ON public.daily_sessions(date);
