-- Shared summaries: AI-generated client insights that clients review/redact before sharing with coaches
CREATE TABLE IF NOT EXISTS public.shared_summaries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL DEFAULT auth.uid(),
  enrollment_id   uuid NOT NULL REFERENCES public.program_enrollments(id) ON DELETE CASCADE,

  -- AI-generated full summary (before client review)
  generated_summary   jsonb NOT NULL DEFAULT '{}',

  -- Client-approved version (after redactions)
  approved_summary    jsonb,

  -- Which sections the client removed
  redacted_sections   text[] DEFAULT '{}',

  -- Status workflow
  status          text DEFAULT 'generated'
                  CHECK (status IN ('generated', 'reviewed', 'approved', 'revoked')),

  -- Timestamps
  generated_at    timestamptz DEFAULT now(),
  reviewed_at     timestamptz,
  approved_at     timestamptz,
  revoked_at      timestamptz,

  -- Period this summary covers
  period_start    date NOT NULL,
  period_end      date NOT NULL,

  UNIQUE(client_id, enrollment_id, period_start, period_end)
);

ALTER TABLE public.shared_summaries ENABLE ROW LEVEL SECURITY;

-- Client can read/manage their own summaries
CREATE POLICY "Users can read own summaries"
  ON public.shared_summaries FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Users can insert own summaries"
  ON public.shared_summaries FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update own summaries"
  ON public.shared_summaries FOR UPDATE
  USING (client_id = auth.uid());

-- Coach can ONLY read approved summaries for their clients
CREATE POLICY "Coach can read approved summaries"
  ON public.shared_summaries FOR SELECT
  USING (
    status = 'approved'
    AND client_id IN (
      SELECT id FROM public.clients WHERE coach_id = auth.uid()
    )
  );

CREATE INDEX idx_shared_summaries_client ON public.shared_summaries(client_id);
CREATE INDEX idx_shared_summaries_enrollment ON public.shared_summaries(enrollment_id);
CREATE INDEX idx_shared_summaries_status ON public.shared_summaries(status);
