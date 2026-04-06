# Mindcraft Product Requirements Document — Current State
**Last Updated:** 2026-04-05
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
- **Payments:** Stripe (live keys)
- **Email:** Resend from `allmindsondeck.com`
- **Voice:** LiveKit + Deepgram/Speechmatics
- **Animation:** framer-motion v12, motion.dev (additive), canvas-confetti, lottie-react
- **Styling:** Inline styles with shared theme tokens (`src/lib/theme.ts`)

### Database (26 tables)
Core: `clients`, `programs`, `program_enrollments` (+ streak columns), `program_days`, `daily_sessions`
Content: `frameworks_library` (350+ exercises), `free_flow_entries`
Progress: `exercise_completions`, `client_goals`, `weekly_reviews`, `client_profiles`
Assessment: `client_assessments`, `intake_responses`
Sharing: `shared_summaries`, `consent_settings` (+ email preference columns)
Monitoring: `quality_flags`, `quality_audits`, `api_logs`, `email_events` (+ user tracking columns)
Coach: `coach_clients` (invite/accept/revoke relationship), `coach_notes` (notes → daily thread)
Memory: `coaching_memory` (with relevance index)
Auth: Supabase Auth (email/password, magic link, Google OAuth)

### API (60+ routes)
- Daily flow: process-journal, daily-themes, daily-summary, daily-exercise, reflect
- Exercises: process-insight, share, download
- Goals: generate-goals, generate-plan, generate-profile, expand-prompts
- Weekly: weekly-insights, weekly-insights/share
- Assessment: enneagram-analyze, framework-analysis, emotional-mirror, sentiment
- Quality: quality-flag, quality-audit
- Payment: checkout (4 program-specific + generic), checkout/verify, webhook, link-subscription, price
- Email: welcome, day-complete, program-complete, coach-notes, re-engage (inactive reminders × 3 + exit survey)
- Coach: coach/invite, coach/accept, coach/revoke, coach/clients
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
- Assessment (9 disruptions self-assessment lead magnet) ✅
- Blog (coming-soon topic cards + email signup) ✅
- Admin dashboard (enrollment stats, AI costs, top users) ✅
- Feedback: exit survey + testimonial survey ✅
- Search: exercises + journal entries + insights archive ✅

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
- Weekly reviews with AI insights (+ cross-week shift detection) ✅
- Quality flagging + weekly quality audit (cron, email report, Bloom level check) ✅
- Coach sharing (approved summaries) ✅
- Coach dashboard (invite clients by email, accept/revoke, view progress/goals/insights/enneagram, leave notes) ✅
- Coach notes → daily thread (notes surface in client's next session) ✅
- Crisis detection + resources banner ✅
- GDPR compliance (export, delete, consent — covers all 26 tables + storage) ✅
- Responsive design (mobile-first, parachute nav fixed for mobile) ✅
- Magic link + Google OAuth + password auth ✅
- Email system (welcome, day-complete, program-complete, coach-notes, inactive reminders × 3, exit survey) ✅
- Notification preferences (inactive reminders + program updates toggles in /my-account) ✅
- Commitment follow-through (daily thread check-in, exercise selection awareness, weekly aggregation) ✅
- Streak tracking (current_streak, best_streak, displayed on dashboard when ≥ 2) ✅
- 30-day calendar view on goals page ✅
- Assessment page (9 disruptions, inverted scale 1=neg/10=pos, data points, Next button, email capture) ✅
- Sentry error monitoring (production, PII redacted) ✅
- Async API logging (fire-and-forget, no response delay) ✅
- Background image + greeting stable on login (no flash) ✅
- Search page for past exercises, journal entries, and insights (`/search`) ✅
- Progress metrics in weekly insights (pattern shifts, language shifts, mood trend, engagement, narrative) ✅
- Spaced retrieval via curated coaching questions in weekly insights ✅
- Unit tests: Vitest + 48 tests (parse-ai-response, api-validation, rate-limit) ✅
- Admin dashboard: top users by AI cost table ✅

---

## 6. Open Product Questions

---

## 7. Growth & Monetization (Stefanie's roadmap)

1. Offramp into continued subscription at 20% off
2. Referral: $20 gift card for referrer on signup
3. Testimonial collection → social proof
4. Cross-program enrollment
5. Enneagram upsell
6. "Work with me" coaching upsell
7. Share & Tell (gifting & referring)
8. Free lead magnet ✅ (assessment at /assessment)
9. Email nurture for non-customers (not built)
10. Outcome measurement → "87% improved" landing page stats
11. Exit survey ✅ (built at /feedback/exit)

---

## 8. Backlog

- In-memory rate limiting → Redis at scale
- Email templates → React Email (~1 day)
- Search → full-text indexes at scale
- Dark/light mode (~2-3 days)
- i18n (backburner)
- A/B testing (Statsig, ~2-3 hrs)
- CMS (Sanity, ~2-3 days)
- Staging environment (separate Supabase)

---

## 9. Docs

| Document | Location |
|----------|----------|
| Email audit | `docs/email-audit.md` |
| Analytics & tracking | `docs/analytics-tracking.md` |
| Customer data & deletion | `docs/customer-data-storage.md` |
| Legal risks | `LEGAL-HANGUPS.md` |
| GDPR rights | `GDPR-RIGHTS-IMPLEMENTATION.md` |
| Test plan | `TEST-PLAN.md` |
| TODO tracker | `TODO-REMAINING.md` |