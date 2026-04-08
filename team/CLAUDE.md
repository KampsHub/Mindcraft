# Team — Working Standards & Collaboration

Loaded when Claude needs to understand how to work with Stefanie, how the team's context layers interact, or how to run parallel work.

## Who's on the team

Mindcraft is a solo operation. **Stefanie** plays every role: founder, product manager, instructional designer, coach, UX content writer, performance marketer, QA tester, ops. Claude is the force-multiplier that specializes in each role when invoked.

**Stefanie's operating profile** lives at `.claude/working-with-stefanie.md` — auto-loaded by Claude Code on every session. Key bits:
- Communication cadence: update the todo list every 3 minutes during long sessions
- Expectations: working code, trace full journeys, no half-deployments
- Explain decisions, challenge bad ideas
- **Speed over perfection** — ship MVP, iterate with real friction

## The team roster (subagents)

See root `CLAUDE.md` → Team Directory for the full table. 10 specialized subagents, each with its own isolated context window and role-specific instructions. Invoke by name ("review this as the voice-and-market lead") or let Claude match automatically via the subagent's `description` field.

## Context layers — four places context lives

1. **Root `CLAUDE.md`** (in repo) — project rules, team roster, immutable cross-cutting rules. Auto-loaded every session.
2. **Subfolder `CLAUDE.md`** (in repo) — topic-scoped rules, loaded progressively when Claude enters that folder.
3. **Agent Skills `.claude/skills/*/SKILL.md`** (in repo) — on-demand capability routers with progressive references/ subfolder.
4. **`~/.claude/projects/.../memory/MEMORY.md`** (user-scoped, OUTSIDE repo) — cross-session learnings. First 200 lines auto-load into every session. Maintained by Claude across time; not in git.
5. **`.claude/working-with-stefanie.md`** (in repo) — Stefanie's operating profile, auto-loaded.

When updating context after a correction, pick the right layer:
- **Cross-cutting rule Claude keeps violating** → root `CLAUDE.md`
- **Topic-specific rule** (voice, exercise, deploy) → the relevant subfolder `CLAUDE.md`
- **Deep methodology** (coaching pedagogy, research attribution) → the relevant `SKILL.md` + references
- **Personal preference Stefanie has made clear** → `.claude/working-with-stefanie.md`
- **Cross-session learning** → MEMORY.md (maintained automatically)

## Immutable operating rules

### Correction loop (non-negotiable)

**When Claude makes a mistake Stefanie has to correct, the correction gets added to the right context file in the same session.** Never leave a correction uncaptured — it will just repeat next session. Pick the layer above, write the rule, commit it.

### CLI tools over MCP where both exist

Prefer `gh`, `npx`, `supabase`, `vercel` CLIs over equivalent MCP servers — they're more context-efficient. Only use MCP when no CLI equivalent exists (Chrome DevTools for browser inspection, Figma for design handoff).

### `/context` hygiene

Run `/context` when Claude starts getting sluggish or making mistakes mid-session. If context window is >75% full, `/compact` or `/clear` before continuing. Better to lose the running conversation than drift into unreliable territory.

### Plan → Review pattern for high-stakes work

For schema migrations, pricing changes, voice rule rewrites, or large refactors: draft the plan as one agent, then invoke a second agent as "skeptical staff engineer" to find gaps and assumption failures before exiting plan mode.

## Parallel work via git worktrees

Run multiple Claude sessions simultaneously without collision:

```bash
git worktree add ../mindcraft-<task-name> -b <branch-name>
cd ../mindcraft-<task-name> && claude
```

Use when working on independent tasks in parallel (e.g., "refactor emails" + "audit exercises" + "wire memory pipeline") — each session gets its own working directory while sharing git history.

See https://code.claude.com/docs/en/common-workflows for the full pattern.

## Branching & commits

- All non-trivial work starts on a branch, not `main` directly
- Commits are small and logically scoped — each one a clean `git revert` target
- Commit messages explain the **why**, not just the what
- Every commit ends with: `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
- Never skip hooks (`--no-verify`) unless explicitly asked

## Deploy cadence

Every push → Vercel deploy → verified via `gh api repos/KampsHub/Mindcraft/deployments`. Rules in `ops/CLAUDE.md`. Never say "deployed" without running the verification.

---

Back to root: [CLAUDE.md](../CLAUDE.md) · Stefanie profile: [.claude/working-with-stefanie.md](../.claude/working-with-stefanie.md)
