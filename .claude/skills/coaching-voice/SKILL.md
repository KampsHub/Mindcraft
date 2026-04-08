---
name: coaching-voice
description: Use when writing or reviewing any user-facing copy, journal prompts, exercise text, email copy, error messages, button labels, or AI-generated insights in Mindcraft. Enforces hedged coach voice, bans authority-voice claims, and requires research attribution. Applies to UX copy, AI prompts, system messages, and content audits. Invoke before shipping any user-visible text.
---

# Coaching voice

The hard rule that governs every piece of text users see in Mindcraft: **coach voice, not authority voice.** The user is the expert on their own experience. The coach offers a lens, not a diagnosis.

## Banned patterns — zero tolerance

Never write any of these, anywhere, in any user-facing copy, AI output, or exercise text:

- `The pattern is…` / `The pattern here is…` / `Your pattern is…`
- `You are [feeling/doing/experiencing X]` — as a declaration
- `This activates the prefrontal cortex` / `This rewires…` / `This trains your brain to…`
- `Research shows…` / `Studies prove…` / `Science has shown…`
- `What's really happening here is…` / `The truth is…`
- Any neuroscience mechanism without a named researcher AND institution
- Any statistic without attribution

## Required patterns — use these instead

- `It sounds like…` / `It looks like…` / `One way to read this is…`
- `You might be noticing…` / `It could be that…`
- `This may help…` / `This can give your nervous system a chance to…`
- `Approaches like this one have shown in other contexts that…`
- Named attribution: `Matthew Lieberman's research at UCLA suggests…` / `Peter Gollwitzer at NYU found…` / `Jon Kabat-Zinn's MBSR research at UMass Medical Center suggests…`

## Mindset

If you catch yourself writing a declarative sentence about the user's inner state, STOP and rewrite with a hedge. "You're protecting yourself" → "It sounds like there might be some protection happening here."

Users are often in crisis (laid off, PIP, overwhelmed). They want to understand WHY this matters NOW and HOW it will help. Connecting to relief is powerful ("this may help you think more clearly," "this can give your nervous system a chance to settle"). But every claim needs backing.

## Neuroscience & research rules

- If you can name the researcher or institution, do it.
- If you can't, use hedged language: "mindfulness approaches like this one have shown in other contexts that…"
- Never state mechanisms as fact without attribution.

## Scope

This rule applies to EVERY field in any AI JSON output — `reading`, `pattern_challenge.description`, `why_now`, `why_this_works`, `coaching_questions`, `reframe`, `sequence_suggestion`, `final_insights`, everything.

Also applies to: UX copy, error messages, email campaigns, exercise instructions, onboarding questions, upsell cards, homepage, program pages, welcome pages.

## Post-processor guard (deterministic backup)

`src/app/api/process-journal/route.ts` has a post-processor that rewrites declarative drift server-side as a backup when prompt enforcement fails. Any new banned pattern should also be added to that regex list.

## References

- [content/coaching-style-guide.md](../../../content/coaching-style-guide.md) — full voice canon: rules, principles, "never say" list, system prompt patterns, crisis detection protocol
- [content/copy-review-tone-guide.md](../../../content/copy-review-tone-guide.md) — UX copy strategy for users at breaking points
- [content/CLAUDE.md](../../../content/CLAUDE.md) — Voice section at the top
