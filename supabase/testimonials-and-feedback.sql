-- Testimonials (public wall), feedback_entries (private critical feedback), raffle_periods (dormant)
-- Run this in Supabase SQL Editor.

-- ── testimonials ──
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,                                    -- nullable: unauthenticated submissions allowed
  submitter_name text,                             -- "First L." format
  submitter_email text,                            -- private, moderation only
  kind text NOT NULL CHECK (kind IN ('text','social_url','video_url')),
  body text NOT NULL,                              -- quote text / caption / snapshot text
  attribution text,                                -- "Product manager at big tech company"
  social_url text,                                 -- LinkedIn / X / Instagram URL
  social_embed_html text,                          -- live embed HTML snapshot
  social_snapshot_text text,                       -- degraded text fallback
  video_url text,                                  -- Loom / YouTube / Vimeo URL
  outcome_tags text[] DEFAULT '{}',                -- subset of ('clarity','confidence','hard_conversations','starting_new')
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  show_linkedin_link boolean NOT NULL DEFAULT false,
  raffle_period_id uuid,
  consent_given_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);

-- ── feedback_entries (private, never public) ──
CREATE TABLE IF NOT EXISTS public.feedback_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  enrollment_id uuid,
  day_number int,
  source text NOT NULL CHECK (source IN ('day_26_prompt','share_page_feedback_tab','other')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── raffle_periods (dormant) ──
CREATE TABLE IF NOT EXISTS public.raffle_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','drawing','closed')),
  winner_testimonial_id uuid REFERENCES public.testimonials(id),
  drawn_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_periods ENABLE ROW LEVEL SECURITY;

-- testimonials: anyone can submit, anyone can read approved
DROP POLICY IF EXISTS "Anyone can submit testimonial" ON public.testimonials;
CREATE POLICY "Anyone can submit testimonial" ON public.testimonials
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read approved" ON public.testimonials;
CREATE POLICY "Anyone can read approved" ON public.testimonials
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Service role full testimonials" ON public.testimonials;
CREATE POLICY "Service role full testimonials" ON public.testimonials
  FOR ALL USING (auth.role() = 'service_role');

-- feedback_entries: service role only (never public read)
DROP POLICY IF EXISTS "Service role full feedback" ON public.feedback_entries;
CREATE POLICY "Service role full feedback" ON public.feedback_entries
  FOR ALL USING (auth.role() = 'service_role');

-- raffle_periods: service role only
DROP POLICY IF EXISTS "Service role full raffle" ON public.raffle_periods;
CREATE POLICY "Service role full raffle" ON public.raffle_periods
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_status_created ON public.testimonials (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_user ON public.testimonials (user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_source_created ON public.feedback_entries (source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_raffle_status ON public.raffle_periods (status, ends_at);

-- ── Seed rows from src/content/site.ts (approved) ──
INSERT INTO public.testimonials (kind, body, attribution, status, approved_at, consent_given_at)
VALUES
  (
    'text',
    'I''d spend Sunday nights rehearsing what to say in Monday''s check-in. Not because I didn''t know my stuff - because I couldn''t tell anymore if my manager wanted me to improve or wanted me gone. Everyone kept saying ''just do your best.'' That''s not helpful when your best feels like it''s never enough. The thing that clicked was realizing I was reacting to two things at once - the actual PIP and every criticism I''d ever received, all stacked on top of each other. Once I pulled those apart, the real situation was still hard but it was manageable.',
    'Product manager at big tech company',
    'approved',
    now(),
    now()
  ),
  (
    'text',
    'People kept asking what I was going to do next. I didn''t have an answer. I barely had a reason to get out of bed. The worst part wasn''t losing the job - it was realizing how much of my identity was built on having one. Without the title, the team, the daily rhythm, I didn''t know who I was. What helped was learning to separate the job from the person. Mapping out which parts of my confidence were real and which ones only existed inside that role.',
    'Senior engineer - Laid off after 6 years',
    'approved',
    now(),
    now()
  ),
  (
    'text',
    'Everyone else in the room seemed so sure of themselves. I felt like I was faking it every single day. This program helped me understand that the lack of confidence wasn''t about being new - it was something I''d carried into every role I''d ever had. Exacerbated by having been unemployed for a prolonged time before. This program helped see that more clearly.',
    'Director - New role after 1 year of unemployment',
    'approved',
    now(),
    now()
  )
ON CONFLICT DO NOTHING;
