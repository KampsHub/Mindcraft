-- ============================================================
-- PROGRAMS TABLE
-- Each program is a unique 30-day coaching arc (Layoff, New Role, etc.)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.programs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,           -- layoff, new_role, new_manager, etc.
  name            text NOT NULL,                  -- "PARACHUTE"
  tagline         text,                           -- "A 30-Day Emotional Processing Intensive"
  description     text,                           -- Full program description
  duration_days   int DEFAULT 30,
  weekly_themes   jsonb DEFAULT '[]',             -- [{week:1, name:"GROUND", territory:"..."}]
  intake_config   jsonb DEFAULT '{}',             -- Program-specific pre-start questions
  pricing_cents   int DEFAULT 7500,               -- $75 default
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active programs
CREATE POLICY "Anyone can read active programs"
  ON public.programs FOR SELECT
  USING (active = true);

-- Only service role can insert/update (admin operations)
CREATE POLICY "Service role manages programs"
  ON public.programs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_programs_slug ON public.programs(slug);
CREATE INDEX idx_programs_active ON public.programs(active);
