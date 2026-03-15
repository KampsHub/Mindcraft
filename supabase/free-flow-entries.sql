-- ============================================================
-- FREE_FLOW_ENTRIES TABLE
-- Anytime capture — timestamped thoughts throughout the day.
-- Feeds into next day's Step 1 and pattern detection.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.free_flow_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id     uuid NOT NULL REFERENCES public.program_enrollments(id) ON DELETE CASCADE,
  client_id         uuid NOT NULL DEFAULT auth.uid(),
  daily_session_id  uuid REFERENCES public.daily_sessions(id),

  content           text NOT NULL,
  theme_tags        text[] DEFAULT '{}',

  created_at        timestamptz DEFAULT now(),
  processed         boolean DEFAULT false
);

ALTER TABLE public.free_flow_entries ENABLE ROW LEVEL SECURITY;

-- Users can read their own entries
CREATE POLICY "Users can read own free_flow"
  ON public.free_flow_entries FOR SELECT
  USING (client_id = auth.uid());

-- Users can insert their own entries
CREATE POLICY "Users can insert own free_flow"
  ON public.free_flow_entries FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Users can update their own entries
CREATE POLICY "Users can update own free_flow"
  ON public.free_flow_entries FOR UPDATE
  USING (client_id = auth.uid());

CREATE INDEX idx_freeflow_enrollment ON public.free_flow_entries(enrollment_id);
CREATE INDEX idx_freeflow_client ON public.free_flow_entries(client_id);
CREATE INDEX idx_freeflow_session ON public.free_flow_entries(daily_session_id);
CREATE INDEX idx_freeflow_created ON public.free_flow_entries(created_at);
