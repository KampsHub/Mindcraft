-- Waitlist signups table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  program text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(email, program)
);

-- RLS: only service role can read/write (admin only)
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated and anon (public form)
CREATE POLICY "Anyone can sign up for waitlist"
  ON waitlist_signups FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service role can read (admin queries)
-- No SELECT policy for anon/authenticated = they can't read others' emails
