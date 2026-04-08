---
name: market-scan
description: Use when researching competitors in the wellness / coaching / mental health adjacent market. Invoke when making positioning decisions, benchmarking a feature (upsell card, onboarding flow, exercise UI) against Headspace, Calm, Brilliant, Woebot, Duolingo, Cerebral, BetterHelp, or Ritual, or when Stefanie asks "how does [product] handle this?"
---

# Market scan

**Stub**: this skill is scaffolded but not yet filled. On first invocation:

1. Do the competitive research requested, using WebSearch + WebFetch.
2. Cite specific pages, screens, or features — not vibes.
3. After completing the task, append a methodology section to this file documenting:
   - The canonical list of competitors (with URLs) to scan for each question type
   - The screenshot-or-quote rule (never summarize without attribution)
   - The output format (comparison table with the Mindcraft equivalent + one insight per competitor)
   - A references/methodology.md file capturing the best-practice approach
4. Future invocations then follow the documented methodology.

## Canonical competitor list (starting point — extend as needed)

- **Headspace** — meditation, mindfulness, wellness — headspace.com
- **Calm** — meditation, sleep, relaxation — calm.com
- **Brilliant** — interactive learning, dark mode, visualizations — brilliant.org
- **Woebot** — conversational CBT, mental health chatbot — woebothealth.com
- **Duolingo** — micro-lessons, chunked learning, celebration moments — duolingo.com
- **Cerebral** — clinical mental health, medication management — cerebral.com
- **BetterHelp** — online therapy, matching to licensed therapists — betterhelp.com
- **Ritual** — daily wellness habits, supplements adjacent — ritual.com

For coaching-specific competitive research, also consider:
- **BetterUp** — corporate coaching, large client base
- **Insight Timer** — mindfulness + coach marketplace
- **Noom** — behavior change + coaching hybrid

## Output format (until methodology is written)

For any market scan request, return a comparison table:

| Competitor | What they do | Relevance to Mindcraft | Specific source (URL/screenshot) |

Plus one synthesis paragraph per scan answering: "What does Mindcraft do differently, and is that difference earned?"

## References

- Phase 2 fill: this skill will gain a `references/methodology.md` after first use.
- See [.claude/agents/voice-and-market.md](../../agents/voice-and-market.md) — the subagent that most commonly invokes this skill.
