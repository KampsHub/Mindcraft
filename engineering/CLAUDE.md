# Engineering — Architecture, Patterns, Bugs, RFCs

Loaded when working on code: API routes, components, database schema, auth, infrastructure, patterns.

## Files in this folder

- **`bugs/`** — bug investigation logs (scope, touched infra, root cause, fix). Prevents duplicate investigation on recurring issues.
- **`rfcs/`** — technical design RFCs for non-trivial changes. Both currently empty; fill as work happens.

## Architecture

- **Framework**: Next.js 16 (App Router) on Vercel (Hobby plan)
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: Anthropic Claude Sonnet via `@anthropic-ai/sdk`
- **Payments**: Stripe (test mode: `sk_test_` keys)
- **Email**: Resend from `allmindsondeck.com`
- **Styling**: Inline styles with shared theme tokens (`src/lib/theme.ts`)

### Animation & interaction toolkit

- **`framer-motion` v12** — primary animation (expand/collapse, stagger, scroll reveals, gestures, SVG path). Used in 66+ files.
- **`lottie-react`** — Lottie animations for micro-interactions (completion celebrations, transitions, empty states). JSON files go in `public/lottie/`.
- **`@dnd-kit`** — drag-and-drop (used in CardSort, BubbleSort)
- **`@use-gesture/react`** — swipe, pinch, drag for native-feeling mobile interactions
- **`d3` v7** — SVG data visualization (EmotionWheel, BodyMap, WheelChart, StakeholderMap)
- **`recharts` v3** — React charting (available, underused)
- **`canvas-confetti`** — lightweight celebration confetti on exercise completion
- **`@radix-ui/react-tooltip`, `react-accordion`, `react-popover`** — accessible UI primitives

### Exercise primitives

24 interactive components in `src/components/exercises/primitives/`. When building or modernizing exercises, prefer motion and gesture-based interactions over static forms. Use Lottie for delightful feedback moments. Use Radix for accessible progressive disclosure.

## Key patterns

### API routes

- All AI routes use `getAnthropicClient()` from `src/lib/api-validation.ts` — never `new Anthropic()` directly
- Validate request bodies with Zod schemas via `validateBody()`
- Rate limiting via `checkRateLimit(userId, "ai")`
- Client profile context via `getClientProfile()` + `formatProfileForPrompt()`

### Shared components

- `PageShell` — layout wrapper for authenticated pages (Nav, footer)
- `UpsellSection` — shared between dashboard and weekly-review
- `DailyStep` — step wrapper for the day flow page
- `ProgramCard` — enrollment card on dashboard

### Programs (all three share post-login pages)

- **Parachute** — layoff recovery (slug: `parachute`)
- **Jetstream** — PIP navigation (slug: `jetstream`)
- **Basecamp** — new role confidence (slug: `basecamp`)

Program differentiation happens via `enrollment.programs.slug` — used for background images, greeting rotation, accent colors.

### Background images

- Each program has its own image pool in `public/` (shutterstock files)
- `PageShell` and dashboard select from pool based on `programSlug` prop
- Images rotate daily (stable within a session)
- No gradient overlay — raw images with transparent content panels

## Enrollment status filtering (HARD RULE)

Always include ALL statuses when querying enrollments for display:

```ts
.in("status", ["active", "onboarding", "awaiting_goals", "pre_start", "completed", "paused"])
```

Missing statuses = users see "No active program" even though they're enrolled.

## Database content updates

- Weekly themes territories: `scripts/update-weekly-territories.sql`
- Day prompt context: `scripts/update-day1-prompts.sql`
- Run these in Supabase SQL Editor when seed data needs updating
- Seed scripts live in `scripts/seed-{program}-program.ts` — source of truth for program content

## Common build failures

- **TypeScript**: accessing `.property` on a type narrowed to `never` (e.g. `enrollment?.programs?.slug` inside `if (!enrollment)`)
- **React**: `useState` declared after early `return` statements — hooks must come before any returns
- **Mismatched braces in large files** — use `npx tsc --noEmit` to catch syntax errors early
- **Module-scope env vars**: NEVER instantiate SDK clients at module scope (e.g. `const resend = new Resend(process.env.KEY)` at top of file). Vercel evaluates all modules during build — if the env var isn't available at build time, it crashes. Always create clients inside the request handler.

---

Back to root: [CLAUDE.md](../CLAUDE.md) · Deployment rules: [ops/CLAUDE.md](../ops/CLAUDE.md)
