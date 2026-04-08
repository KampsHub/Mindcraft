---
name: hedged-voice-audit
description: Use when auditing AI-generated output, system prompts, or copy files for declarative drift, missing research attribution, or banned authority-voice patterns. Returns a line-by-line report of violations with proposed hedged rewrites. Invoke before shipping any change to process-journal, any new AI endpoint, or any generated copy that will be seen by users.
---

# Hedged-voice audit

The auditing methodology that applies the `coaching-voice` rules to generated output. Where `coaching-voice` is the rulebook, this is the inspector.

## How to audit

### Step 1: Identify the scope

What are you auditing?
- A system prompt in `src/app/api/*/route.ts`?
- A generated JSON response from running a test against process-journal?
- A copy file (exercise custom_framing, journal prompts, error messages)?
- A post-processor regex list?

### Step 2: Grep for banned phrases

Run these patterns against the scope. Any match is a violation:

```bash
# Declarative pattern claims
grep -E '^(The pattern is|Your pattern is|What'"'"'s really happening)' <file>

# Neuroscience without attribution
grep -E '(activates the prefrontal cortex|rewires|trains your brain|your amygdala)' <file>

# Vague research claims
grep -iE '(research shows|studies prove|science has shown|studies indicate|fmri studies)' <file>

# Declarative "you are"
grep -iE '^(You are|You're) (feeling|doing|experiencing|stuck|avoiding)' <file>
```

### Step 3: Check attribution

For any sentence mentioning a mechanism (brain, nervous system, behavior change, habit formation), verify a researcher AND institution is named. If not, it's a violation.

### Step 4: Report format

For every violation:

```
File: <path>
Line: <number>
Banned pattern: <which rule>
Original: "<exact text>"
Proposed rewrite: "<hedged version with attribution if research claim>"
```

### Step 5: Check the post-processor guard

`src/app/api/process-journal/route.ts` has a deterministic post-processor that rewrites drifted phrases. Verify your banned pattern is in its regex list. If not, add it.

## References

- [`.claude/skills/coaching-voice/SKILL.md`](../../coaching-voice/SKILL.md) — the banned/required pattern canon
- [content/coaching-style-guide.md](../../../../content/coaching-style-guide.md) — full voice canon
- `src/app/api/process-journal/route.ts` — the post-processor guard (`hedgePhrase` function)
