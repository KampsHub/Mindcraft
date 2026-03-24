-- ============================================================
-- QUALITY_FLAGS TABLE
-- Stores user-submitted flags on AI-generated outputs.
-- GDPR note: output_content stores ONLY the AI-generated text,
-- never the user's personal journal content.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quality_flags (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL DEFAULT auth.uid(),
  enrollment_id     uuid REFERENCES public.program_enrollments(id) ON DELETE SET NULL,
  daily_session_id  uuid REFERENCES public.daily_sessions(id) ON DELETE SET NULL,

  -- What was flagged
  output_type       text NOT NULL CHECK (output_type IN (
    'reflection', 'exercise', 'summary', 'themes', 'plan',
    'weekly_insight', 'framework_analysis', 'reframe', 'coaching_question'
  )),
  framework_name    text,              -- For exercise flags: which exercise

  -- User feedback
  flag_reason       text NOT NULL CHECK (flag_reason IN (
    'off_tone', 'inaccurate', 'unhelpful', 'confusing', 'inappropriate', 'other'
  )),
  user_comment      text,              -- Optional free-text (max 500 chars enforced in API)

  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quality_flags ENABLE ROW LEVEL SECURITY;

-- Users can create their own flags
CREATE POLICY "Users can insert own flags"
  ON public.quality_flags FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Users can read their own flags
CREATE POLICY "Users can read own flags"
  ON public.quality_flags FOR SELECT
  USING (client_id = auth.uid());

CREATE INDEX idx_flags_client ON public.quality_flags(client_id);
CREATE INDEX idx_flags_type ON public.quality_flags(output_type);
CREATE INDEX idx_flags_created ON public.quality_flags(created_at DESC);
