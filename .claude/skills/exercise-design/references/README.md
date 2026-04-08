# Exercise design — detailed references

Loaded only when the `exercise-design` skill is actively engaged.

## Full source docs

- [Exercise Content Rules (240 lines)](../../../../content/exercise-content-rules.md) — the full pedagogical ruleset extracted from root CLAUDE.md during the Team OS reorg. Authoritative source for content coherence, framework teaching, design-from-the-screen-inward, cognitive load rules, primitive-as-pedagogy, and all 20+ best practices by exercise type.
- [Coaching Style Guide](../../../../content/coaching-style-guide.md) — voice rules that apply to exercise copy.
- [EXERCISE-AUDIT-PLAN.md](../../../../product/plans/EXERCISE-AUDIT-PLAN.md) — the plan to audit all 362 existing exercises against the ruleset.
- [content/CLAUDE.md](../../../../content/CLAUDE.md) — condensed exercise checklist (11 items) + visual standards that apply to exercise rendering.

## Seed scripts (source of truth for program content)

- `scripts/seed-parachute-program.ts` — Parachute (layoff) exercise definitions
- `scripts/seed-jetstream-program.ts` — Jetstream (PIP) exercise definitions
- `scripts/seed-basecamp-program.ts` — Basecamp (new role) exercise definitions
- `scripts/seed-*-exercises.ts` — program-specific exercise library

## Primitive source code (for verification that the primitive supports the instruction)

- `src/components/exercises/primitives/` — 24 interactive primitive components
