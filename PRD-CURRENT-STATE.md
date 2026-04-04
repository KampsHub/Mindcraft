# Mindcraft Product Requirements Document — Current State
**Last Updated:** 2026-04-04
**Status:** Production (mindcraft.ing)

---

## 1. Product Overview

Mindcraft is a 30-day AI-powered coaching platform for professionals navigating career disruptions. Three programs serve different crisis contexts, each delivering daily journaling + exercise-based coaching through a Tell → Do → Done flow.

### Programs
| Program | Slug | Context | Duration |
|---------|------|---------|----------|
| Parachute | `parachute` | Layoff recovery | 30 days |
| Jetstream | `jetstream` | PIP navigation | 30 days |
| Basecamp | `basecamp` | New role confidence | 30 days |
| Enneagram | `enneagram` | Self-assessment add-on | One-time |

---

## 2. Architecture

### Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Vercel (Hobby plan)
- **Database:** Supabase (PostgreSQL + Auth + RLS + pgvector)
- **AI:** Anthropic Claude 3.5 Sonnet via `@anthropic-ai/sdk`
- **Payments:** Stripe (test mode)
- **Email:** Resend from `allmindsondeck.com`
- **Voice:** LiveKit + Deepgram/Speechmatics
- **Animation:** framer-motion v12, motion.dev (additive), canvas-confetti, lottie-react
- **Styling:** Inline styles with shared theme tokens (`src/lib/theme.ts`)

### Database (22 tables)
Core: `clients`, `programs`, `program_enrollments`, `program_days`, `daily_sessions`
Content: `frameworks_library` (350+ exercises), `free_flow_entries`
Progress: `exercise_completions`, `client_goals`, `weekly_reviews`, `client_profiles`
Assessment: `client_assessments`, `intake_responses`
Sharing: `shared_summaries`, `consent_settings`
Monitoring: `quality_flags`, `quality_audits`, `api_logs`, `email_events`
Auth: Supabase Auth (email/password, magic link, Google OAuth)

### API (53 routes)
- Daily flow: process-journal, daily-themes, daily-summary, daily-exercise, reflect
- Exercises: process-insight, share, download
- Goals: generate-goals, generate-plan, generate-profile, expand-prompts
- Weekly: weekly-insights, weekly-insights/share
- Assessment: enneagram-analyze, framework-analysis, emotional-mirror, sentiment
- Quality: quality-flag, quality-audit
- Payment: checkout (4 program-specific + generic), checkout/verify, webhook, link-subscription, price
- Email: welcome, daily-reminder, day-complete, program-complete, coach-notes, re-engage
- Voice: token, transcribe, eval, exercise-voice, tts
- Account: data export, deletion, contact, apply

---

## 3. User Flow (Implemented)

```
Landing Page → Program Selection → Stripe Checkout → Signup (magic link/Google/password)
    ↓
Welcome Page (program-specific) → Intake Questionnaire (7 disruptions, values, beliefs)
    ↓
Dashboard → Day 1
    ↓
Daily Flow (Tell → Do → Done):
  Tell: Free-flow journal + voice input + emotion chips
  Do:  AI processes journal → selects 2-3 exercises → coaching questions + pattern challenge
  Done: Session summary + pattern note + tomorrow preview + committed actions
    ↓
Goals (generated after Day 3 from journal + intake) → Weekly Review → Monthly Summary
    ↓
Program Completion (Day 30) → Graduation email
```

---

## 4. What's Implemented (Complete)

### Pages (40+)
- 4 landing pages (home + 3 programs) ✅
- 4 auth pages (login, signup, forgot-password, reset-password) ✅
- 4 welcome/onboarding pages ✅
- Dashboard, Day flow (Tell/Do/Done tabs), Goals, Weekly Review, Monthly Summary ✅
- Mindful Journal, Account, Coach demo, Intake ✅
- Privacy Policy, Terms, Contact, Apply ✅

### Exercise System (27 primitives)
CardSort, DialogueSequence, SplitAnnotator, WheelChart, EmotionalArc, NarrativeTriptych, ForceField, HeatmapTracker, BodyMap, SpectrumSlider, ZonedSpectrum, MultiSpectrum, VennOverlap, HierarchicalBranch, BubbleSort, ForcedChoice, DotGrid, StakeholderMap, TimelineRiver, ProgressRiver, WordCloud, EmotionWheel, SaboteurCard, BeforeAfter, PatternTracker, RetrievalCheck, AISimulation

### Content (90 days)
- 30 days × 3 programs of seeded curriculum
- 350+ exercises in frameworks library
- 362 exercises with prePopulated data in sandbox catalog

### Features
- AI journal processing + exercise selection ✅
- Voice input (journal + exercises) ✅
- Exercise insight generation ✅
- Goals workflow (AI-generate → approve → track) ✅
- Weekly reviews with AI insights ✅
- Quality flagging ✅
- Coach sharing (approved summaries) ✅
- Crisis detection + resources banner ✅
- GDPR compliance (export, delete, consent) ✅
- Responsive design (mobile-first) ✅
- Magic link + Google OAuth + password auth ✅
- Email system (6+ templates) ✅

---

## 5. What's Missing / Needs Decision

### CRITICAL — Blocks Launch
1. **Stripe in test mode** — Need to switch to live keys before accepting real payments
2. **Email scheduling** — Daily reminder emails exist but no cron job triggers them
3. **Subscription lifecycle** — No cancellation flow, no billing portal, no renewal webhooks

### HIGH — Needed for Quality Launch
4. **Error monitoring** — No Sentry or equivalent. Production errors are invisible.
5. **Coach dashboard** — Coaches can't see student progress in-app (API exists, no UI)
6. **Referral dashboard** — Coach referral codes work but coaches can't view/manage them
7. **Admin panel** — All admin work is manual via Supabase console

### MEDIUM — Important for Retention
8. **User-facing analytics** — Users see no progress metrics beyond day count
9. **Notification preferences** — Users can't control email frequency
10. **Search** — Can't search past journal entries or exercises
11. **Streak persistence** — Day completion streaks not persisted in database

### LOW — Nice to Have
12. **Dark/light mode toggle** — Currently dark-only
13. **Calendar view** — Month-level view of program progress
14. **Mobile app** — Web-only
15. **Internationalization** — English only
16. **A/B testing** — No experiment infrastructure
17. **Content management** — All content hardcoded, no CMS

---

## 6. Exercise System Gaps (Needs Your Thinking)

### A. Spaced retrieval integration
- Should RetrievalCheck exercises be auto-inserted at Day+3 intervals?
- Or should they be manually designed per concept?
- **Decision needed:** Automatic vs curated retrieval schedule

### B. Commitment follow-through system
- When a user commits to "morning walk" on Day 6, should Day 14 automatically ask "how's that going?"
- Requires pulling exercise_completions data forward into future exercises
- **Decision needed:** How persistent should commitments be? What happens if they fail?

### C. Progress visualization
- Day 1 vs Day 24 ratings exist but aren't surfaced as "you improved by X"
- Should there be a "Your Progress" dashboard section?
- **Decision needed:** What does progress look like? Numbers? Graphs? Narrative?

### D. Exercise difficulty labeling
- Should exercises show "Awareness → Practice → Application → Integration" labels?
- **Decision needed:** Is explicit difficulty labeling helpful or anxiety-inducing for users in crisis?

### E. Pre/post exercise measurement
- Should exercises ask "How clear is your thinking?" before and after?
- **Decision needed:** Is this valuable data or friction for overwhelmed users?

### F. AI Simulation API endpoint
- The AISimulation primitive has demo mode but needs a real API for production
- Need to decide: What system prompt establishes the AI character? What guardrails?
- **Decision needed:** How authentic vs safe should the simulated manager be?

### G. Learn-Recognize-Practice arc completion
- Many exercises stop at "recognize" (naming the pattern) without reaching "practice" (rehearsing the alternative)
- From EXERCISE-DESIGN-LEARNINGS Part 2, Lens 1: "Every exercise should complete the full arc"
- **Decision needed:** Should exercises that currently stop at recognition (e.g., saboteur identification, cognitive distortion naming) be extended with a practice step? Or should the practice come in a separate exercise the next day?

### H. Scaffolded difficulty across the 30-day arc
- From EXERCISE-DESIGN-LEARNINGS Part 2, Lens 1: "Early exercises should have more pre-filled content and narrower choices. Later exercises should have more blank space."
- Currently all exercises have similar levels of pre-population regardless of day
- **Decision needed:** Should Days 1-7 exercises have 80% pre-filled content with the user editing, while Days 22-30 have mostly blank space requiring independent application?

### I. Structured data for AI personalization
- From EXERCISE-DESIGN-LEARNINGS Part 2, Lens 3: "Exercise responses should update the user's profile. High anxiety scores → offer regulation exercises."
- Currently exercises produce freeform JSON — the AI reads everything but doesn't systematically act on patterns
- **Decision needed:** Should tag frequency, rating patterns, and bucket assignments automatically adjust which exercises are selected? This is a feedback loop that could make the product significantly smarter.

### J. The coaching container — exit affordance
- From EXERCISE-DESIGN-LEARNINGS Part 2, Lens 5: "Never trap the user in an exercise that escalates without an exit"
- Some exercises (Grief Ritual, The Path Exercise, 3-2-1 Process) go into deep emotional territory
- **Decision needed:** Should these exercises have an explicit "I need to stop" button that saves progress and offers grounding resources? What does a safe exit look like?

### K. Content-to-interaction ratio
- From EXERCISE-DESIGN-LEARNINGS Part 2, Lens 2: "Most exercises currently have more reading than doing. The ratio should favor interaction."
- whyThis sections average 150-200 words, instructions 80-120 words — that's 250-320 words of reading before any interaction
- **Decision needed:** Should framework teaching move INTO the interaction (guided steps that reveal one concept at a time) rather than front-loading as a wall of text?

---

## 7. Open Questions — Things I'm Unclear On

### Product Model
L. **What happens after Day 30?** The program ends but the user's career crisis may not. Is there a post-program offering? A maintenance mode? Re-enrollment in a different program? Currently: graduation email, nothing after.

M. **Can users enroll in multiple programs simultaneously?** The DB supports it (unique constraint is client_id + program_id) but the UX doesn't address it. What happens on the dashboard if someone is in Parachute Day 15 AND Basecamp Day 3?

N. **Is Mindcraft a self-serve product or does it require a coach?** The coach referral system, coach sharing, and coach analytics suggest a B2B2C model (coaches refer clients). But the entire product works without a coach. Which is the primary go-to-market?

O. **What's the pricing model?** Currently $29.95/month but: is it per-program? Per-month until cancelled? One-time for 30 days? The Stripe integration creates a subscription but the program is finite (30 days). Does the subscription auto-cancel at Day 30?

P. **What does "completed" mean?** Does the user need to finish all 30 days to complete? All exercises? Just journal entries? Can they skip days? Currently: `completed_at` is set when they click "Complete Day" on all 30 days, but there's no enforcement.

### User Experience
Q. **First-time user experience** — A new user lands on the dashboard after signup. What should they see? Currently: a ProgramCard with "Continue to Day 1." But there's no tour, no welcome moment beyond the welcome page, no "here's what to expect today."

R. **What if the AI gives bad advice?** The crisis banner handles acute risk, but what about subtle bad coaching — an exercise recommendation that doesn't fit, or a reframe that misses the point? Quality flagging exists but there's no feedback loop to the user ("we heard you, here's a better exercise").

S. **Voice vs text — which is primary?** The TellTab supports both, but the UX doesn't guide the user on which to use when. Is voice for some people and text for others? Or is voice for certain emotional states?

### Content & Coaching
T. **Are the 350+ exercises in frameworks_library all used?** The process-journal API selects from this library, but are there exercises that never get selected? Should there be a curation pass?

U. **How does the coaching plan work in production?** The seed scripts define coaching_exercises per day, but the process-journal API also selects overflow exercises from the full library. What's the relationship? Are coaching_plan exercises mandatory and overflow optional?

V. **Enneagram integration** — The Enneagram assessment is a paid add-on that produces a type analysis. But how does it feed into the daily exercises? Is the Enneagram type used for exercise personalization?

### From Multi-Lens Review (not yet in PRD)

W. **Onboarding tour** — New users get no guidance on what to do. Should there be a 3-step onboarding tour? ("Here's your dashboard. Start your day here. Your exercises appear after you journal.") (UX Designer #5)

X. **Trial/freemium** — No way to try before buying. Should Day 1 be free? A sample exercise? A free assessment? This is a significant conversion barrier for a $30/month product targeting people who just lost their income. (PM #6)

Y. **Re-enrollment path** — After completing Parachute, can you start Jetstream? The flow isn't designed. (PM #5)

Z. **User referral program** — Coaches can refer, but users can't. "Share with a friend going through a layoff" could be the strongest growth channel for this product. (PMM #1)

AA. **Exit survey** — When users stop using the product, there's no way to learn why. This is critical data for a new product. (UX Researcher #7)

BB. **Outcome measurement and social proof** — Day 1 vs Day 24 disruption ratings exist but aren't aggregated into "87% of users improved" stats. This data could power the landing page. (UX Researcher #5, PMM #2)

CC. **Free lead magnet** — No way to capture emails from people who aren't ready to buy. A free disruption assessment, a PDF guide ("5 things to do in your first week after a layoff"), or a sample exercise could build a nurture list. (PMM #10)

DD. **Email nurture for non-customers** — Only welcome + daily reminder emails exist. No educational drip sequence for people who visited but didn't buy. (PMM #4)

---

## 8. Known Technical Debt
- In-memory rate limiting won't scale across multiple Vercel instances (needs Redis)
- API logs write synchronously to Supabase (needs async queue at scale)
- Memory embeddings retrieval may slow as database grows
- No unit/integration tests (manual TEST-PLAN.md only)
- 283 exercises still use old whyNow/science format in exerciseDataCore.ts
- Email templates hardcoded in route handlers (no template system)
