# Hedged-voice audit — references

Loaded only when the `hedged-voice-audit` skill is actively engaged.

## Core references

- [content/coaching-style-guide.md](../../../../content/coaching-style-guide.md) — full voice canon with every banned phrase
- [content/CLAUDE.md](../../../../content/CLAUDE.md) → Voice section — condensed banned/required patterns
- `.claude/skills/coaching-voice/SKILL.md` — the canonical pattern list
- `src/app/api/process-journal/route.ts` — the `hedgePhrase` post-processor function (lines ~400-440) that runs deterministic rewrites on parsed AI responses

## Grep patterns to run

```bash
# All banned patterns in one sweep
grep -rnE '(^|\s)(The pattern is|Your pattern is|What'"'"'s really happening|activates the prefrontal|rewires|trains your brain|research shows|studies prove|science has shown|studies indicate)' <scope>

# Declarative "you are"
grep -rnE 'You are (feeling|doing|experiencing|stuck|avoiding)' <scope>

# Unattributed neuroscience
grep -rn 'prefrontal cortex\|amygdala\|dopamine\|serotonin\|cortisol' <scope> | grep -vE '(Lieberman|UCLA|Kabat-Zinn|UMass|Gollwitzer|NYU)'
```
