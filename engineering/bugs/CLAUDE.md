# Bug investigations

Historical bug investigation logs. One file per significant bug, named `YYYY-MM-DD-<short-slug>.md`.

## Purpose

When the same or a similar bug recurs, grep this folder first. An old investigation often contains the root cause and the fix — saves hours of re-investigation.

## File format

Each bug investigation log should include:

- **Symptom** — what the user saw, error message, reproduction steps
- **Scope** — which component/route/table is involved
- **Infrastructure touched** — files, API routes, DB tables, env vars
- **Root cause** — the real reason, not the symptom
- **Fix** — what got changed, with the commit sha
- **Prevention** — what rule (if any) was added to the relevant CLAUDE.md / skill to prevent recurrence

## Examples of bugs worth logging here

- Module-scope env var instantiation crashing Vercel builds (recurring pattern)
- Supabase trigger function blocking Google OAuth signup
- Stripe webhook signature verification mismatches
- Hook/useState hooks order violations
- Enrollment status filter regressions
- LiveKit / audio surface removals that keep needing follow-up

Currently empty. Fill as investigations happen.
