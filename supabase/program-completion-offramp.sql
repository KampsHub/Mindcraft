-- ============================================================
-- PROGRAM COMPLETION OFF-RAMP
-- Tables that power the end-of-program experience:
--   1. final_insights         — long-form reflection generated after Day 30
--   2. personal_promo_codes   — 20% off reward codes sent at completion
--   3. deletion_requests      — user-initiated account/data deletion queue
-- ============================================================

-- ── 1. final_insights ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.final_insights (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id   uuid NOT NULL REFERENCES public.program_enrollments(id) ON DELETE CASCADE,
  program_slug    text NOT NULL,
  content         text NOT NULL,             -- the full long-form reflection
  status          text NOT NULL DEFAULT 'generating'
                  CHECK (status IN ('generating', 'ready', 'failed')),
  generated_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(enrollment_id)
);

ALTER TABLE public.final_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own final insights"
  ON public.final_insights FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Service role manages final insights"
  ON public.final_insights FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE INDEX IF NOT EXISTS idx_final_insights_client ON public.final_insights(client_id);


-- ── 2. personal_promo_codes ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.personal_promo_codes (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code                    text NOT NULL UNIQUE,
  discount_percent        int NOT NULL DEFAULT 20,
  stripe_promo_id         text,
  source                  text NOT NULL DEFAULT 'program_completion'
                          CHECK (source IN ('program_completion', 'manual', 'winback')),
  source_enrollment_id    uuid REFERENCES public.program_enrollments(id) ON DELETE SET NULL,
  redeemed_at             timestamptz,
  redeemed_enrollment_id  uuid REFERENCES public.program_enrollments(id) ON DELETE SET NULL,
  created_at              timestamptz DEFAULT now()
);

ALTER TABLE public.personal_promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own promo codes"
  ON public.personal_promo_codes FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Service role manages promo codes"
  ON public.personal_promo_codes FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE INDEX IF NOT EXISTS idx_personal_promo_client ON public.personal_promo_codes(client_id);
CREATE INDEX IF NOT EXISTS idx_personal_promo_code ON public.personal_promo_codes(code);


-- ── 3. deletion_requests ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_email    text,                       -- captured at request time in case the auth row disappears mid-flow
  requested_at    timestamptz NOT NULL DEFAULT now(),
  scheduled_for   timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  completed_at    timestamptz,
  cancelled_at    timestamptz,
  notes           text
);

ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own deletion requests"
  ON public.deletion_requests FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Users insert their own deletion requests"
  ON public.deletion_requests FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users cancel their own pending requests"
  ON public.deletion_requests FOR UPDATE
  USING (client_id = auth.uid() AND completed_at IS NULL);

CREATE POLICY "Service role manages deletion requests"
  ON public.deletion_requests FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE INDEX IF NOT EXISTS idx_deletion_requests_pending
  ON public.deletion_requests(scheduled_for)
  WHERE completed_at IS NULL AND cancelled_at IS NULL;
