-- ============================================================
-- EMAIL_EVENTS TABLE
-- Stores Resend webhook events for email engagement tracking.
-- Tracks: sent, delivered, opened, clicked, bounced, complained.
-- No personal content stored — only event type + metadata.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_email_id   text NOT NULL,            -- Resend's email ID
  event_type        text NOT NULL CHECK (event_type IN (
    'email.sent', 'email.delivered', 'email.opened',
    'email.clicked', 'email.bounced', 'email.complained',
    'email.delivery_delayed'
  )),
  recipient_email   text,                     -- For aggregation only
  email_subject     text,                     -- e.g. "Welcome to Mindcraft"
  click_url         text,                     -- For click events: which link
  bounce_type       text,                     -- For bounces: hard/soft
  timestamp         timestamptz NOT NULL,     -- When the event occurred

  created_at        timestamptz NOT NULL DEFAULT now()
);

-- No RLS — admin/service role only
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.email_events FOR ALL
  USING (true);

CREATE INDEX idx_email_events_type ON public.email_events(event_type);
CREATE INDEX idx_email_events_time ON public.email_events(timestamp DESC);
CREATE INDEX idx_email_events_resend_id ON public.email_events(resend_email_id);
