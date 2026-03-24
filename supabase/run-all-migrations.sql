-- ============================================================
-- COMBINED MIGRATION: Run this in Supabase SQL Editor
-- Creates: quality_flags, quality_audits, email_events tables
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- ── 1. QUALITY_FLAGS ──
-- Stores user-submitted flags on AI-generated outputs.
CREATE TABLE IF NOT EXISTS public.quality_flags (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL DEFAULT auth.uid(),
  enrollment_id     uuid REFERENCES public.program_enrollments(id) ON DELETE SET NULL,
  daily_session_id  uuid REFERENCES public.daily_sessions(id) ON DELETE SET NULL,

  output_type       text NOT NULL CHECK (output_type IN (
    'reflection', 'exercise', 'summary', 'themes', 'plan',
    'weekly_insight', 'framework_analysis', 'reframe', 'coaching_question'
  )),
  framework_name    text,

  flag_reason       text NOT NULL CHECK (flag_reason IN (
    'off_tone', 'inaccurate', 'unhelpful', 'confusing', 'inappropriate', 'other'
  )),
  user_comment      text,

  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quality_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own flags' AND tablename = 'quality_flags'
  ) THEN
    CREATE POLICY "Users can insert own flags"
      ON public.quality_flags FOR INSERT
      WITH CHECK (client_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own flags' AND tablename = 'quality_flags'
  ) THEN
    CREATE POLICY "Users can read own flags"
      ON public.quality_flags FOR SELECT
      USING (client_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_flags_client ON public.quality_flags(client_id);
CREATE INDEX IF NOT EXISTS idx_flags_type ON public.quality_flags(output_type);
CREATE INDEX IF NOT EXISTS idx_flags_created ON public.quality_flags(created_at DESC);


-- ── 2. QUALITY_AUDITS ──
-- Stores weekly automated audit results from Claude evaluator.
CREATE TABLE IF NOT EXISTS public.quality_audits (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_week        date NOT NULL,
  daily_session_id  uuid REFERENCES public.daily_sessions(id) ON DELETE SET NULL,
  enrollment_id     uuid REFERENCES public.program_enrollments(id) ON DELETE SET NULL,

  output_type       text NOT NULL CHECK (output_type IN (
    'reflection', 'exercise', 'summary', 'themes', 'plan',
    'weekly_insight', 'framework_analysis', 'reframe', 'coaching_question'
  )),
  framework_name    text,

  voice_authenticity      smallint CHECK (voice_authenticity BETWEEN 1 AND 5),
  addresses_real_issue    smallint CHECK (addresses_real_issue BETWEEN 1 AND 5),
  client_helpfulness      smallint CHECK (client_helpfulness BETWEEN 1 AND 5),
  pattern_recognition     smallint CHECK (pattern_recognition BETWEEN 1 AND 5),
  appropriate_boundaries  smallint CHECK (appropriate_boundaries BETWEEN 1 AND 5),
  theme_accuracy          smallint CHECK (theme_accuracy BETWEEN 1 AND 5),
  total_score             smallint,

  feedback          text,
  flags             text[],
  output_snippet    text,

  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quality_audits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Service role only' AND tablename = 'quality_audits'
  ) THEN
    CREATE POLICY "Service role only"
      ON public.quality_audits FOR ALL
      USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_audits_week ON public.quality_audits(audit_week DESC);
CREATE INDEX IF NOT EXISTS idx_audits_type ON public.quality_audits(output_type);
CREATE INDEX IF NOT EXISTS idx_audits_score ON public.quality_audits(total_score);


-- ── 3. EMAIL_EVENTS ──
-- Stores Resend webhook events for email engagement tracking.
CREATE TABLE IF NOT EXISTS public.email_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_email_id   text NOT NULL,
  event_type        text NOT NULL CHECK (event_type IN (
    'email.sent', 'email.delivered', 'email.opened',
    'email.clicked', 'email.bounced', 'email.complained',
    'email.delivery_delayed'
  )),
  recipient_email   text,
  email_subject     text,
  click_url         text,
  bounce_type       text,
  timestamp         timestamptz NOT NULL,

  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Service role only' AND tablename = 'email_events'
  ) THEN
    CREATE POLICY "Service role only"
      ON public.email_events FOR ALL
      USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_events_type ON public.email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_time ON public.email_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_resend_id ON public.email_events(resend_email_id);


-- ✅ Done! All three tables created with RLS and indexes.
