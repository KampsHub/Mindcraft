# Technical Design RFCs

Technical design docs for non-trivial changes. One file per RFC, named `YYYY-MM-DD-<short-slug>.md`.

## Purpose

Before building a non-trivial feature, write the design. Before approving a plan that touches multiple files or introduces a new primitive, write the design. The design gets reviewed (human or Plan subagent) and becomes the source of truth for what "done" looks like.

## File format

Each RFC should include:

- **Title + date + status** (draft / approved / implemented / superseded)
- **Context** — why this change is being made
- **Goals** — what success looks like
- **Non-goals** — what this explicitly won't do
- **Proposal** — the design, with file paths and code sketches
- **Alternatives considered** — what else was on the table and why it lost
- **Open questions** — what still needs decision
- **Migration plan** — if this touches existing data or live users

## When to write an RFC vs. just ship

- **Ship directly**: small bug fixes, copy changes, single-file refactors, visual polish
- **Write an RFC first**: schema migrations, new API endpoints with complex auth, new exercise primitives, pricing changes, anything that touches more than ~3 files in non-obvious ways

## Examples of changes that deserve RFCs

- `user_memory` schema + process-journal continuity rewrite (BIG IDEA A)
- Coach inbox with shared_with_coach + coach_replies (BIG IDEA B)
- Final Insights as 4-section progress report (BIG IDEA C)
- Moving from Stripe test mode to live mode
- Replacing the fabricated Google Calendar slot generator with real OAuth integration

Currently empty. Fill as big changes come up.
