-- Coach-client relationship table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.coach_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  client_id uuid,
  client_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(coach_id, client_email)
);

ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;

-- Coaches can see their own invitations
CREATE POLICY "Coaches see own invitations"
  ON public.coach_clients FOR SELECT
  USING (coach_id = auth.uid());

-- Coaches can insert invitations
CREATE POLICY "Coaches can invite"
  ON public.coach_clients FOR INSERT
  WITH CHECK (coach_id = auth.uid());

-- Coaches can update their own invitations
CREATE POLICY "Coaches can update own"
  ON public.coach_clients FOR UPDATE
  USING (coach_id = auth.uid());

-- Clients can see invitations sent to them
CREATE POLICY "Clients see own invitations"
  ON public.coach_clients FOR SELECT
  USING (client_id = auth.uid());

-- Clients can update invitations sent to them (accept/revoke)
CREATE POLICY "Clients can respond"
  ON public.coach_clients FOR UPDATE
  USING (client_id = auth.uid() OR client_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Service role can do everything
CREATE POLICY "Service role full access"
  ON public.coach_clients FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coach_clients_coach ON coach_clients (coach_id, status);
CREATE INDEX IF NOT EXISTS idx_coach_clients_email ON coach_clients (client_email);
CREATE INDEX IF NOT EXISTS idx_coach_clients_client ON coach_clients (client_id, status);
