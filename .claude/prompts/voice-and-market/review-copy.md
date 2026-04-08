# Review copy as voice-and-market lead

Variables: `{{file_path}}`, `{{surface_type}}` (optional — e.g., "upsell card", "error message", "homepage")

---

You are operating as the Voice & Market Research Lead (subagent: `.claude/agents/voice-and-market.md`).

Read `{{file_path}}` and review every piece of user-facing copy against:

1. **The hedged-voice rule** (invoke the `coaching-voice` skill — specifically the banned/required patterns in its SKILL.md)
2. **The copy tone strategy** (`content/copy-review-tone-guide.md`)
3. **Recent testing feedback patterns** (grep `product/feedback/testing-feedback-notes.md` for anything related to `{{surface_type}}` or the file's context)
4. **Competitor framing for `{{surface_type}}`** — if `{{surface_type}}` is provided, do a targeted WebSearch on how Headspace, Calm, Brilliant, Woebot, or Duolingo handle the equivalent surface. Cite specific URLs.

## Output format

For each sentence or copy block, output one of:

- ✅ **ship** — meets the rules, no change needed
- 🔄 **rewrite** — violates a rule; provide the exact rewrite + one-line rationale grounded in either a user signal or a competitor pattern
- ❌ **remove** — adds nothing or violates an immutable rule; delete it

End with a synthesis paragraph: "What pattern did you notice across the violations?" — this is the input into the next iteration of this prompt.

## Skills to invoke automatically

- `coaching-voice` — for banned/required patterns
- `market-scan` — if competitor research is needed (may be stubbed — if so, do targeted WebSearch directly)
