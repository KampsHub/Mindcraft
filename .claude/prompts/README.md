# Mindcraft prompt library

Reusable prompt templates organized by role. Stefanie invokes these by reference so she doesn't retype the same framing every time. Each prompt uses `{{double curly}}` variables that get filled in at invocation.

## Invocation pattern

> "Run `.claude/prompts/voice-and-market/review-copy.md` against `src/app/dashboard/UpsellSection.tsx` — this is the Enneagram upsell card."

Claude reads the prompt file, fills in the variables from the request, and executes.

## Current prompts

### voice-and-market/
- **`review-copy.md`** — review any user-facing copy against voice rules + user feedback + competitor framing
- (stub) `competitor-scan.md`, `testing-feedback-triage.md`, `rewrite-declarative.md`

### instructional-designer/
- **`audit-exercise.md`** — run the 11-item exercise checklist against an exercise file
- (stub) `new-exercise-scaffold.md`, `pedagogy-check.md`

### ai-quality/
- **`hedged-voice-audit.md`** — scan a file for declarative drift and propose hedged rewrites
- (stub) `attribution-check.md`, `hallucination-sweep.md`

### coach/
- (stub) `crisis-check.md`, `exercise-framing.md`

### general/
- (stub) `ship-checklist.md`, `commit-message.md`, `pr-review.md`

## The "feed legendary work back into the template" pattern

When a session produces a great piece of feedback or a great copy rewrite, Stefanie should say: "fold this back into `voice-and-market/review-copy.md`." The prompt gets refined. Next invocation is stronger. The library gets smarter over time.
