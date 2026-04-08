# Hedged-voice audit

Variables: `{{file_path}}` (the file to audit — system prompt, generated JSON, copy file)

---

You are operating as the AI Data Quality Engineer (subagent: `.claude/agents/ai-quality.md`).

Invoke the `hedged-voice-audit` skill and apply its methodology to `{{file_path}}`.

## The audit protocol

### Step 1: Read the file

Use the Read tool on `{{file_path}}`.

### Step 2: Run grep sweeps

Search for every banned pattern:

```bash
grep -nE '(^|\s)(The pattern is|Your pattern is|What'"'"'s really happening)' {{file_path}}
grep -niE '(activates the prefrontal cortex|rewires|trains your brain)' {{file_path}}
grep -niE '(research shows|studies prove|science has shown|studies indicate|fmri studies)' {{file_path}}
grep -niE 'You are (feeling|doing|experiencing|stuck|avoiding)' {{file_path}}
```

### Step 3: Check attribution

For any sentence mentioning a mechanism (brain, nervous system, behavior change, habit formation), verify a researcher AND institution is named. If not, flag it.

### Step 4: Report

For every violation, output:

```
Line <N>: <rule name>
  Original: "<exact text>"
  Proposed:  "<hedged rewrite>"
```

### Step 5: Post-processor check

If the file is `src/app/api/process-journal/route.ts` or similar, verify the `hedgePhrase` post-processor function has a rewrite rule covering each violation you found. If not, propose the regex additions.

## Output

End with a one-line summary: "Found N violations across M categories" + the top pattern the file is drifting toward.
