# Content — Voice & Tone

Loaded when Claude is writing or reviewing user-facing copy, AI prompts, exercise framing, or any text that reaches the user.

## Files in this folder

- **`coaching-style-guide.md`** — full voice canon: rules, principles, "never say" list, system prompt patterns, crisis detection protocol. Single source of truth for tone.
- **`copy-review-tone-guide.md`** — UX copy strategy for users at breaking points (laid off, PIP, overwhelmed).
- **`exercise-content-rules.md`** — the full pedagogical ruleset for exercise design. Dense. Loaded only when editing exercises. Referenced by the `exercise-design` skill.

## Voice — core rules

- Warm but not sweet. Direct but not cold.
- Talk TO the person ("you"), never ABOUT them ("the client")
- Quote the user's actual words — never fabricate or paraphrase quotes
- Match their emotional register

### Coach voice, not authority voice (HARD RULE)

Don't tell the user what happened to them or why they feel what they feel. Never state interpretations as fact. Use language that invites rather than declares: "it sounds like," "maybe," "could it be that," "you might notice," "this may help you…" The user is the expert on their own experience — the coach offers a lens, not a diagnosis.

- **Wrong:** "That reaction landed so hard because what she said and what you heard got tangled together."
- **Right:** "That reaction might have landed so hard because what she said and what you heard got tangled together."
- **Wrong:** "Naming the pattern activates the prefrontal cortex and reduces the automatic response."
- **Right:** "Naming a pattern may help your prefrontal cortex get ahead of the automatic response — Matthew Lieberman's research at UCLA suggests that putting words to emotional experiences can reduce their intensity."

### Neuroscience & research claims

Users are often in crisis — overwhelmed, short on time, looking for relief. They want to understand WHY this exercise is relevant NOW and HOW it will help. Connecting to how their brain and nervous system get relief is powerful ("this may help you think more clearly," "this can give your nervous system a chance to settle"). But every claim needs backing:

- If you can name the researcher or institution, do it: "Jon Kabat-Zinn's MBSR research at UMass Medical Center suggests…"
- If you can't name the source, use hedged language: "mindfulness approaches like this one have shown in other contexts that…" or "this type of practice may help…"
- Never state neuroscience mechanisms as fact without attribution. "The prefrontal cortex gets to do its job" is a claim — back it up or soften it.

## Journal processing (`/api/process-journal`)

- Reading: 3-5 sentences MAX, not paragraphs
- Only quote words the user ACTUALLY wrote
- No clinical labels, diagnostic language, or motivational filler

## Prompts & exercises (short list — full rules in `exercise-content-rules.md`)

- Every prompt that references a concept (e.g. "seven disruptions") must include context explaining what it means
- Seed prompts support a `context` field — use it for any concept-heavy questions
- Days 1-3 are onboarding/intake — label exercises as "Today's Exercise" not "Coaching Plan"
- Day 4+ uses "From Your Coaching Plan" and "Matched to Your Journal"
- Never use jargon like "overflow" in user-facing copy

### Exercise content — the 11-item checklist

Before shipping any exercise, run these 11 checks. The full explanation of each lives in `exercise-content-rules.md`; this is the checklist:

1. What is the **specific learning point** in one sentence?
2. Does `whyThis` **teach** the framework, not just mention it?
3. Does the primitive **deliver the point**, or just create busywork?
4. Does the instruction describe the **outcome**, not just the mechanic?
5. Does `whyThis` use the user's **actual words** from the scenario?
6. Does `prePopulated` data come from the **scenario**, not a template?
7. Does the exercise **end with the user having something new** (reframe, skill, pattern, plan)?
8. If the exercise promises something, does the **primitive actually deliver it**?
9. For named frameworks (Gottman, NVC, IFS, ACT, DBT, Kegan & Lahey, Polyvagal), does it **teach the framework**?
10. Were the exercises designed **back-to-front** — payoff first, then scenario?
11. **Did you render the exercise in the preview and look at it** before writing content? Never write in isolation from the primitive's rendered state.

For the full rules (content coherence, primitive-as-pedagogy, design-from-the-screen-inward, cognitive load, primitives to watch, best practices by exercise type), see `exercise-content-rules.md`.

## Design system — "Oceanic Precision / The Nautical Monolith"

**Full source of truth**: [content/design-system.md](./design-system.md) — adopted 2026-04-08, supersedes the previous warm-SaaS aesthetic. Existing UI needs migration — tracked in `product/plans/TODO-REMAINING.md`.

### Creative north star

**The Nautical Monolith** — high-end editorial tension between the dark ocean and surgical maritime instruments. Structural permanence, extreme legibility, architectural depth. Large-scale typography as structure, not just content.

### Immutable rules (summary — full details in design-system.md)

1. **0px border-radius everywhere.** Every corner. No exceptions. Even 2px ruins the precision.
2. **No 1px dividers for sectioning.** Use background color shifts (`surface` → `surface-container-low` → `surface-container-high`) to create a "carved" look, not a "sketched" look.
3. **No grey body text.** All body copy uses `tertiary` (#FFFFFF). Only `on_surface_variant` (#d0c5af) for low-priority metadata.
4. **No standard drop shadows.** Depth comes from tonal layering (stacking `surface-container-low` hosting `surface-container-high` children). Ambient shadow only on true modals: `0px 24px 48px rgba(0,0,0,0.5)`.
5. **Glassmorphism only for floating headers/nav rails.** `surface` at 80% opacity + 20px backdrop blur.
6. **Primary CTAs use the gradient glint.** Linear gradient from `primary` (#ffe9b0) top-left to `primary_container` (#f2ca50) bottom-right.
7. **Manrope typography.** Display for hero moments, labels in all caps with +0.05em tracking for instrument-panel feel.
8. **Asymmetry is the default.** Left-align text; let imagery and data bleed off the right edge.

### Quick token reference

- Base layer: `#131313` (surface)
- Void / sunken inputs: `#0e0e0e` (surface-container-lowest)
- First card layer: `#1c1b1b` (surface-container-low)
- Elevated cards: `#2a2a2a` (surface-container-high)
- Primary CTA bg: `#f2ca50` with `#6b5500` text
- Secondary CTA bg: `#2e4d5f` with `#9dbcd3` text
- Data Rail accent: `#8FAEC4`
- All body text: `#FFFFFF`

See [design-system.md](./design-system.md) for the full token table, component specs, and the do's/don'ts.

---

Back to root: [CLAUDE.md](../CLAUDE.md)
