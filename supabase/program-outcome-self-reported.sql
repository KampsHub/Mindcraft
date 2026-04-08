-- Program outcome self-report — Day 30 gold-standard success metric.
--
-- On Day 30, the user is asked: "Did this program deliver what you
-- originally wanted?" (reference: their Day-1 goal_statement).
--
-- Values:
--   'achieved'     — Yes
--   'partially'    — Partially / in some ways
--   'not_achieved' — No
--   NULL           — Not yet answered

alter table program_enrollments
  add column if not exists program_outcome_self_reported text
  check (program_outcome_self_reported in ('achieved', 'partially', 'not_achieved'));

alter table program_enrollments
  add column if not exists program_outcome_reported_at timestamptz;

-- Index so the weekly admin can pull the success-rate funnel fast.
create index if not exists idx_program_enrollments_outcome
  on program_enrollments(program_outcome_self_reported)
  where program_outcome_self_reported is not null;
