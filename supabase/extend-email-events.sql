-- Create email_events table with full support for webhook events + outbound tracking
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.email_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_email_id   text,                     -- Resend's email ID (nullable for outbound tracking)
  event_type        text NOT NULL CHECK (event_type IN (
    'email.sent', 'email.delivered', 'email.opened',
    'email.clicked', 'email.bounced', 'email.complained',
    'email.delivery_delayed',
    're_engage', 'exit_survey', 'daily_reminder', 'inactive_reminder'
  )),
  recipient_email   text,                     -- For aggregation only
  email_subject     text,
  click_url         text,                     -- For click events
  bounce_type       text,                     -- For bounces: hard/soft
  user_id           uuid,                     -- Links to auth.users for outbound tracking
  enrollment_id     uuid,                     -- Links to program_enrollments
  timestamp         timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- RLS: service role only
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_events' AND policyname = 'Service role only'
  ) THEN
    CREATE POLICY "Service role only" ON public.email_events
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_events_user_type ON email_events (user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_enrollment_type ON email_events (enrollment_id, event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events (created_at);
