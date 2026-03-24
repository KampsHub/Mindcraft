-- ============================================================
-- QUALITY_AUDITS TABLE
-- Stores weekly automated audit results from Claude evaluator.
-- Each row = one evaluated output. Aggregated weekly reports
-- are built from these rows.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quality_audits (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_week        date NOT NULL,            -- Monday of the audit week
  daily_session_id  uuid REFERENCES public.daily_sessions(id) ON DELETE SET NULL,
  enrollment_id     uuid REFERENCES public.program_enrollments(id) ON DELETE SET NULL,

  -- What was evaluated
  output_type       text NOT NULL CHECK (output_type IN (
    'reflection', 'exercise', 'summary', 'themes', 'plan',
    'weekly_insight', 'framework_analysis', 'reframe', 'coaching_question'
  )),
  framework_name    text,

  -- Scores (1-5 each)
  voice_authenticity      smallint CHECK (voice_authenticity BETWEEN 1 AND 5),
  addresses_real_issue    smallint CHECK (addresses_real_issue BETWEEN 1 AND 5),
  client_helpfulness      smallint CHECK (client_helpfulness BETWEEN 1 AND 5),
  pattern_recognition     smallint CHECK (pattern_recognition BETWEEN 1 AND 5),
  appropriate_boundaries  smallint CHECK (appropriate_boundaries BETWEEN 1 AND 5),
  theme_accuracy          smallint CHECK (theme_accuracy BETWEEN 1 AND 5),
  total_score             smallint,

  -- Evaluator output
  feedback          text,
  flags             text[],                   -- e.g. {'generic_language', 'fake_positivity'}

  -- Source context (AI-generated content only, no personal data)
  output_snippet    text,                     -- First 500 chars of the AI output (for review)

  created_at        timestamptz NOT NULL DEFAULT now()
);

-- No RLS — coach/admin only
ALTER TABLE public.quality_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.quality_audits FOR ALL
  USING (true);

CREATE INDEX idx_audits_week ON public.quality_audits(audit_week DESC);
CREATE INDEX idx_audits_type ON public.quality_audits(output_type);
CREATE INDEX idx_audits_score ON public.quality_audits(total_score);
