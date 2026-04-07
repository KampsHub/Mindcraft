-- ============================================================
-- QUALITATIVE DATA TABLES
--
-- Persists 4 sources of qualitative input that previously only
-- lived in email inboxes (or not at all):
--   1. coaching_applications     — /apply form submissions
--   2. exit_surveys              — /feedback/exit responses
--   3. testimonial_surveys       — /feedback/testimonial responses
--   4. assessment_responses      — /assessment quiz responses (with optional email capture)
--
-- All tables are append-only and admin-readable. Email is still
-- sent for human triage; the table is the structured record.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. coaching_applications
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coaching_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      text,
  last_name       text,
  email           text NOT NULL,
  phone           text,
  company         text,
  location        text,
  situation       text,
  six_month_goal  text,
  funding         text,
  budget          text,
  referral        text,
  anything_else   text,
  source          text,                     -- referrer / utm_source if available
  status          text DEFAULT 'new'        -- new | reviewing | qualified | declined | converted
                  CHECK (status IN ('new', 'reviewing', 'qualified', 'declined', 'converted')),
  reviewer_notes  text,
  created_at      timestamptz DEFAULT now(),
  reviewed_at     timestamptz
);

ALTER TABLE public.coaching_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (the form is public)
CREATE POLICY "Anyone can submit a coaching application"
  ON public.coaching_applications FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_coaching_applications_created
  ON public.coaching_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coaching_applications_status
  ON public.coaching_applications(status);
CREATE INDEX IF NOT EXISTS idx_coaching_applications_email
  ON public.coaching_applications(email);

-- ─────────────────────────────────────────────────────────────
-- 2. exit_surveys
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exit_surveys (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid,                     -- nullable: survey can be anonymous
  enrollment_id   uuid,
  program         text,                     -- parachute | jetstream | basecamp | unknown
  reason          text,                     -- canonical reason from radio buttons
  reason_other    text,                     -- free text if reason = "Other"
  comeback_text   text,                     -- "What would bring you back?"
  current_day     int,                      -- last day reached at time of exit
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.exit_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an exit survey"
  ON public.exit_surveys FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_exit_surveys_created
  ON public.exit_surveys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exit_surveys_program
  ON public.exit_surveys(program);
CREATE INDEX IF NOT EXISTS idx_exit_surveys_reason
  ON public.exit_surveys(reason);

-- ─────────────────────────────────────────────────────────────
-- 3. testimonial_surveys
-- (separate from public `testimonials` table — this is the
-- structured weekly-review survey, not the public wall)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.testimonial_surveys (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid,
  enrollment_id     uuid,
  program           text,
  describe_text     text,                   -- "How would you describe Mindcraft?"
  changed_text      text,                   -- "What changed?"
  permission_given  boolean DEFAULT false,
  promoted_to_id    uuid,                   -- if promoted to public testimonials.id
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.testimonial_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a testimonial survey"
  ON public.testimonial_surveys FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_testimonial_surveys_created
  ON public.testimonial_surveys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonial_surveys_permission
  ON public.testimonial_surveys(permission_given);

-- ─────────────────────────────────────────────────────────────
-- 4. assessment_responses
-- (the /assessment quiz — currently flattened into waitlist_signups
-- only when user opts in. This table captures EVERY quiz completion,
-- with optional email if the user opted in.)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text,                     -- nullable: anonymous quizzes are valuable too
  scores          jsonb NOT NULL,           -- { identity: 1-10, competence: 1-10, ... }
  avg_score       numeric(4,2),
  top_disruptions text[],                   -- ['identity', 'competence', 'safety']
  situation       text,                     -- optional context capture
  challenge       text,                     -- optional context capture
  source          text,                     -- referrer / utm_source if available
  user_agent      text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an assessment"
  ON public.assessment_responses FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_assessment_responses_created
  ON public.assessment_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_email
  ON public.assessment_responses(email);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_avg
  ON public.assessment_responses(avg_score);
