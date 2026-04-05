-- Coach notes table — coaches leave notes that surface in client's daily thread
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.coach_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  client_id uuid NOT NULL,
  enrollment_id uuid,
  note text NOT NULL,
  surfaced boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches see own notes" ON public.coach_notes FOR SELECT USING (coach_id = auth.uid());
CREATE POLICY "Coaches can insert" ON public.coach_notes FOR INSERT WITH CHECK (coach_id = auth.uid());
CREATE POLICY "Service role full access" ON public.coach_notes FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_coach_notes_client ON coach_notes (client_id, surfaced, created_at DESC);
