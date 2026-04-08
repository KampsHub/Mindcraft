# Ops — Testing, Deployment, Quality

Loaded when running tests, shipping code, or checking quality.

## Files in this folder

- **`TEST-PLAN.md`** — test case catalog marked 🤖 / 👤 / 🤖+👤 (automation ownership). Prerequisites, Stripe test card, key flow.
- **`QUICK-FIXES.md`** — pre-authorized improvements that don't need product decisions (live Stripe, Sentry, SMTP, copy polish). Effort estimates included.
- **`quality-gaps.md`** — gap analysis: what quality systems exist vs. missing.

## Deployment

### Vercel

- Pushes to `main` auto-deploy to production
- **ALWAYS run `npx next build` locally before pushing** — Vercel builds fail silently and the old deploy stays live
- Environment variables: `CLAUDE_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Supabase keys, Resend key
- After adding/changing env vars, trigger a redeploy (empty commit works)

### Deployment monitoring (MANDATORY — never skip)

After every `git push`, check that the Vercel build succeeds:

```bash
gh api repos/KampsHub/Mindcraft/deployments --jq '.[0].id' | \
  xargs -I{} gh api repos/KampsHub/Mindcraft/deployments/{}/statuses --jq '.[0] | {state, description, created_at}'
```

Notes:
- The `deployments` endpoint shows `state: null` — this is normal. The actual status is on the `/statuses` sub-endpoint.
- If state is `error` or `failure`, investigate immediately — don't move on to the next task.
- If build fails, fix and repush before doing anything else.
- **Never say "deployed" without running this check.**

### Single-command shortcut

The `/ship` slash command (`.claude/commands/ship.md`) bundles the full sequence: tsc → build → commit → push → deploy verification. Use it instead of running steps manually.

## Testing

- **Test plan**: `ops/TEST-PLAN.md`
- **Test card**: `4242 4242 4242 4242`
- **Key flow**: payment → signup → intake → dashboard → day 1 → process journal → exercises

---

Back to root: [CLAUDE.md](../CLAUDE.md) · Build failures + patterns: [engineering/CLAUDE.md](../engineering/CLAUDE.md)
