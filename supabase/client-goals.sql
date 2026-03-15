-- ============================================================
-- CLIENT_GOALS TABLE
-- Six goals generated after Day 3. Client approves. Adjusted weekly.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.client_goals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   uuid NOT NULL REFERENCES public.program_enrollments(id) ON DELETE CASCADE,
  client_id       uuid NOT NULL DEFAULT auth.uid(),
  goal_text       text NOT NULL,
  why_generated   text NOT NULL,                  -- system's reasoning for this goal
  status          text DEFAULT 'proposed'
                  CHECK (status IN ('proposed', 'active', 'paused', 'completed')),
  order_index     int NOT NULL,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;

-- Users can read their own goals
CREATE POLICY "Users can read own goals"
  ON public.client_goals FOR SELECT
  USING (client_id = auth.uid());

-- Users can insert their own goals
CREATE POLICY "Users can insert own goals"
  ON public.client_goals FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Users can update their own goals (approve, pause, complete)
CREATE POLICY "Users can update own goals"
  ON public.client_goals FOR UPDATE
  USING (client_id = auth.uid());

CREATE INDEX idx_goals_enrollment ON public.client_goals(enrollment_id);
CREATE INDEX idx_goals_client ON public.client_goals(client_id);
CREATE INDEX idx_goals_status ON public.client_goals(status);
