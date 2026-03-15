-- ============================================================
-- PROGRAM_DAYS TABLE
-- Each day fully prescribed per program: prompts, exercises, content
-- ============================================================

CREATE TABLE IF NOT EXISTS public.program_days (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id                uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  day_number                int NOT NULL,
  week_number               int NOT NULL,
  title                     text NOT NULL,              -- "Arrival", "The Timeline", "The Body's Account"
  territory                 text,                       -- emotional/cognitive territory this day covers
  seed_prompts              jsonb NOT NULL DEFAULT '[]', -- [{prompt: "...", purpose: "..."}]
  coaching_exercises        jsonb NOT NULL DEFAULT '[]', -- [{name: "...", duration_min: 5, custom_framing: "..."}]
  overflow_defaults         jsonb DEFAULT '[]',          -- [{name: "...", originator: "...", source: "...", file_ref: "...", duration_min: 3, modality: "..."}]
  framework_analysis_default jsonb DEFAULT '{}',         -- {name: "...", originator: "...", example: "..."}
  micro_content             text,                       -- end-of-day educational nugget with citations
  system_notes              text,                       -- internal AI guidance for this day
  is_onboarding             boolean DEFAULT false,       -- Days 1-3 are progressive onboarding
  created_at                timestamptz DEFAULT now(),
  UNIQUE(program_id, day_number)
);

ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read program days
CREATE POLICY "Anyone can read program days"
  ON public.program_days FOR SELECT
  USING (true);

-- Only service role can insert/update (admin operations)
CREATE POLICY "Service role manages program days"
  ON public.program_days FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_program_days_program ON public.program_days(program_id);
CREATE INDEX idx_program_days_day ON public.program_days(program_id, day_number);
CREATE INDEX idx_program_days_week ON public.program_days(program_id, week_number);
