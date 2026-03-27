# Mindcraft Development Guide

## Architecture
- **Framework**: Next.js 16 (App Router) on Vercel (Hobby plan)
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: Anthropic Claude Sonnet via `@anthropic-ai/sdk`
- **Payments**: Stripe (test mode: `sk_test_` keys)
- **Email**: Resend from `allmindsondeck.com`
- **Styling**: Inline styles with shared theme tokens (`src/lib/theme.ts`)

## Key Patterns

### API Routes
- All AI routes use `getAnthropicClient()` from `src/lib/api-validation.ts` — never use `new Anthropic()` directly
- Validate request bodies with Zod schemas via `validateBody()`
- Rate limiting via `checkRateLimit(userId, "ai")`
- Client profile context via `getClientProfile()` + `formatProfileForPrompt()`

### Shared Components
- `PageShell` — layout wrapper for authenticated pages (Nav, footer, optional background images)
- `UpsellSection` — shared between dashboard and weekly-review (Insights)
- `DailyStep` — step wrapper for the day flow page
- `ProgramCard` — enrollment card on dashboard
- `ExercisesSection` — exercises list on dashboard

### Programs
Three programs share the same post-login pages (dashboard, day, goals, weekly-review):
- **Parachute** — layoff recovery (slug: `parachute`)
- **Jetstream** — PIP navigation (slug: `jetstream`)
- **Basecamp** — new role confidence (slug: `basecamp`)

Program differentiation happens via `enrollment.programs.slug` — used for background images, greeting rotation, accent colors.

### Background Images
- Each program has its own image pool in `public/` (shutterstock files)
- `PageShell` and dashboard select from pool based on `programSlug` prop
- Images rotate daily (stable within a session)
- No gradient overlay — raw images with transparent content panels

## Content Rules

### Voice
- Warm but not sweet. Direct but not cold.
- Talk TO the person ("you"), never ABOUT them ("the client")
- Quote their actual words — never fabricate or paraphrase quotes
- Match their emotional register

### Journal Processing (process-journal API)
- Reading: 3-5 sentences MAX, not paragraphs
- Only quote words the user ACTUALLY wrote
- No clinical labels, diagnostic language, or motivational filler

### Prompts & Exercises
- Every prompt that references a concept (e.g. "seven disruptions") must include context explaining what it means
- Seed prompts support a `context` field — use it for any concept-heavy questions
- Days 1-3 are onboarding/intake — label exercises as "Today's Exercise" not "Coaching Plan"
- Day 4+ uses "From Your Coaching Plan" and "Matched to Your Journal"
- Never use jargon like "overflow" in user-facing copy

### Visual Standards
- All text on authenticated pages: white (`#ffffff`), not grey
- Body text: minimum 15-16px
- No box shadows on cards
- Content panels: semi-transparent (`rgba(51, 51, 57, 0.5)`) with backdrop blur
- No animated blobs when background images are active
- Background images: static (no fade-in animation), cover entire page

### Enrollment Status Filtering
Always include ALL statuses when querying enrollments for display:
```
.in("status", ["active", "onboarding", "awaiting_goals", "pre_start", "completed", "paused"])
```
Missing statuses = users see "No active program" even though they're enrolled.

## Deployment

### Vercel
- Pushes to `main` auto-deploy to production
- ALWAYS run `npx next build` locally before pushing — Vercel builds fail silently and the old deploy stays live
- Environment variables: `CLAUDE_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Supabase keys, Resend key
- After adding/changing env vars, trigger a redeploy (empty commit works)

### Common Build Failures
- TypeScript: accessing `.property` on a type narrowed to `never` (e.g. `enrollment?.programs?.slug` inside `if (!enrollment)`)
- React: `useState` declared after early `return` statements — hooks must come before any returns
- Mismatched braces in large files — use `npx tsc --noEmit` to catch syntax errors
- **Module-scope env vars**: NEVER instantiate SDK clients at module scope (e.g. `const resend = new Resend(process.env.KEY)` at top of file). Vercel evaluates all modules during build — if the env var isn't available at build time, it crashes. Always create clients inside the request handler.

### Deployment Monitoring (MANDATORY)
- After every `git push`, check that the Vercel build succeeds
- Run: `gh api repos/KampsHub/Mindcraft/deployments --jq '.[0].id' | xargs -I{} gh api repos/KampsHub/Mindcraft/deployments/{}/statuses --jq '.[0] | {state, description, created_at}'`
- Note: the `deployments` endpoint shows `state: null` — this is normal. The actual status is on the `/statuses` sub-endpoint.
- If state is `error` or `failure`, investigate immediately — don't move on to the next task
- If build fails, fix and repush before doing anything else

## Database Content Updates
- Weekly themes territories: `scripts/update-weekly-territories.sql`
- Day prompt context: `scripts/update-day1-prompts.sql`
- Run these in Supabase SQL Editor when seed data needs updating
- Seed scripts are in `scripts/seed-{program}-program.ts` — source of truth for program content

## Testing
- Test plan: `TEST-PLAN.md` at project root
- Test card: `4242 4242 4242 4242`
- Key flow: payment -> signup -> intake -> dashboard -> day 1 -> process journal -> exercises
