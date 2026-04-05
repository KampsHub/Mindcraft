-- Extend email_events to support outbound email tracking (inactive reminders, re-engage, etc.)
-- Run this in Supabase SQL Editor

-- Add columns for user/enrollment context
ALTER TABLE email_events ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE email_events ADD COLUMN IF NOT EXISTS enrollment_id uuid;

-- Make resend_email_id nullable (outbound tracking records won't have one)
ALTER TABLE email_events ALTER COLUMN resend_email_id DROP NOT NULL;

-- Expand event_type to include custom tracking events
ALTER TABLE email_events DROP CONSTRAINT IF EXISTS email_events_event_type_check;
ALTER TABLE email_events ADD CONSTRAINT email_events_event_type_check
  CHECK (event_type IN (
    'email.sent', 'email.delivered', 'email.opened',
    'email.clicked', 'email.bounced', 'email.complained',
    'email.delivery_delayed',
    're_engage', 'exit_survey', 'daily_reminder', 'inactive_reminder'
  ));

-- Index for fast lookups by user + event type
CREATE INDEX IF NOT EXISTS idx_email_events_user_type
  ON email_events (user_id, event_type);

CREATE INDEX IF NOT EXISTS idx_email_events_enrollment_type
  ON email_events (enrollment_id, event_type);
