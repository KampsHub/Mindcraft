# /ship — full deploy sequence

Run the complete ship sequence for Mindcraft. Bundles the 6 manual steps that Stefanie keeps repeating so they can't be skipped.

## Sequence

### 1. Type check

```bash
cd "/Users/stefaniekamps/Documents/All Minds On Deck/Mindcraft" && \
  PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" npx tsc --noEmit > /tmp/tsc.out 2>&1; \
  echo "tsc exit=$?"; tail -30 /tmp/tsc.out
```

**Abort if exit ≠ 0.** Fix errors and re-run.

### 2. Next build

```bash
PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" npx next build > /tmp/build.out 2>&1; \
  echo "build exit=$?"; tail -10 /tmp/build.out
```

**Abort if exit ≠ 0.** Vercel will fail on the same error — fix locally first.

### 3. Status review

```bash
git status --short
git diff --stat
```

Show the user what's staged and unstaged. Confirm they want to commit.

### 4. Commit

Ask the user for a commit message, OR propose one based on the diff. Use the HEREDOC format so the body is properly quoted:

```bash
git add -A && git commit -m "$(cat <<'EOF'
<short title>

<body explaining the WHY, not just the WHAT>

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

### 5. Push

```bash
git push
```

### 6. Verify deploy (MANDATORY — never skip)

```bash
PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" \
  gh api repos/KampsHub/Mindcraft/deployments --jq '.[0] | {id, created_at}'
```

Confirm the `created_at` timestamp is newer than the push. Then check the deploy status:

```bash
PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" \
  gh api repos/KampsHub/Mindcraft/deployments --jq '.[0].id' | \
  xargs -I{} gh api repos/KampsHub/Mindcraft/deployments/{}/statuses \
  --jq '.[0] | {state, description, created_at}'
```

- `state: success` → done. Tell the user the commit SHA + "Live in `<sha>`."
- `state: error` or `failure` → investigate immediately. Don't move on to the next task.
- `state: null` → deploy still in progress, poll after 30 seconds.

## Never

- Never say "deployed" without running step 6.
- Never skip step 1 or 2 — Vercel fails silently and the old deploy stays live if the build is broken.
- Never `--no-verify` the commit.
- Never force-push to main.

## After shipping

- Update `product/plans/TODO-REMAINING.md` if the commit closed a task.
- Update `features.yaml` if the commit changed a feature's status or added new code_refs.
