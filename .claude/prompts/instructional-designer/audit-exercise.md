# Audit an exercise

Variables: `{{exercise_name_or_path}}`, `{{program}}` (parachute | jetstream | basecamp), `{{day_number}}` (optional)

---

You are operating as the Instructional Designer (subagent: `.claude/agents/instructional-designer.md`).

Read `{{exercise_name_or_path}}` (or grep the relevant seed script `scripts/seed-{{program}}-program.ts` + `scripts/seed-{{program}}-exercises.ts` to find it by name). If `{{day_number}}` is provided, focus on that day.

Invoke the `exercise-design` skill and run the 11-item checklist:

1. What is the **specific learning point**? State it in one sentence.
2. Does `whyThis` **teach** the framework, not just mention it?
3. Does the primitive **deliver the point**, or just create busywork?
4. Does the instruction describe the **outcome**, not just the mechanic?
5. Does `whyThis` use the user's **actual words** from the scenario?
6. Does `prePopulated` data come from the **scenario**, not a template?
7. Does the exercise **end with the user having something new** (reframe, skill, pattern, plan)?
8. If the exercise promises something, does the **primitive actually deliver it**?
9. For named frameworks (Gottman, NVC, IFS, ACT, DBT, Kegan & Lahey, Polyvagal), does it **teach the framework**?
10. Were exercises designed **back-to-front**?
11. **Did the designer render the exercise in the preview and look at it** before writing content?

## Output format

For each of the 11 items:

- ✅ **pass** — one-line reason
- ⚠️ **partial** — what's missing + what to add
- ❌ **fail** — specific violation + proposed fix (exact text or primitive change)

End with:

- **Overall verdict**: ship / rewrite / scrap
- **One-line summary** of the core issue (if any)
- **Check for duplicates**: grep other seed files for similar exercises. If found, propose either differentiation or merging.

## References loaded automatically

- `content/exercise-content-rules.md` — full ruleset
- `content/coaching-style-guide.md` — voice rules
- `product/plans/EXERCISE-AUDIT-PLAN.md` — audit scoring rubric
