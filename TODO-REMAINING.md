# Mindcraft — Todo & Action Tracker
**Last updated:** April 4, 2026

---

## YOUR ACTION ITEMS (Stefanie)

### Set These Env Variables in Vercel (5 min)
| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | From sentry.io → Settings → Client Keys | Activates error tracking |
| `CRON_SECRET` | Any random string (e.g., generate at randomkeygen.com) | Secures cron jobs + admin API |
| `EXIT_SURVEY_URL` | Typeform URL (create below) | Link in 7-day inactive email |
| `TESTIMONIAL_SURVEY_URL` | Typeform URL (create below) | Link in Day 30 completion email |

### Create These Typeform Surveys (15 min each)
1. **Exit Survey** — for users who stopped using Mindcraft
   - Q1: "What made you stop using Mindcraft?" (multiple choice + other: Lost motivation / Too busy / Didn't find it helpful / Too expensive / Got what I needed / Other)
   - Q2: "What would bring you back?" (open text)
   - After creating → paste URL into `EXIT_SURVEY_URL` in Vercel

2. **Testimonial Survey** — for users who completed Day 30
   - Q1: "How would you describe Mindcraft to a friend?" (open text)
   - Q2: "What changed for you during the program?" (open text)
   - Q3: Permission checkbox: "I give permission to use my response (anonymized) on the Mindcraft website"
   - After creating → paste URL into `TESTIMONIAL_SURVEY_URL` in Vercel

### Run This SQL in Supabase (2 min)
- **`scripts/add-retrieval-exercises.sql`** — Adds spaced retrieval quiz exercises on Days 7, 14, 21 for all 3 programs
- Go to Supabase → SQL Editor → paste contents → Run

### Railway Fix (5 min)
- Go to Railway dashboard → your service → Settings → "Watch paths"
- Set to: `livekit-agent/**`
- This stops Railway from crashing on every Vercel deploy

### GA4 Funnel Setup (30 min)
- Go to GA4 → Explore → Create new Exploration → Funnel
- Steps: `page_view (/)` → `homescreen_program_click` → `begin_checkout` → `login_success` → `day_completed (day 1)` → `day_completed (day 7)`

### Lawyer Review (send these docs)
- **`LEGAL-HANGUPS.md`** — 36 specific legal risks across privacy policy + terms, with suggested draft language for arbitration, data retention, warranty disclaimer. Top 10 actions at the bottom.
- **`GDPR-RIGHTS-IMPLEMENTATION.md`** — Maps all 7 GDPR rights to product, identifies gaps, prioritizes what to build.
- Priority items for lawyer: arbitration clause, WA My Health My Data Act, GDPR legal basis, warranty disclaimer, IP address claim verification.

---

## DASHBOARDS & MONITORING (already live)

| What | Where | Details |
|------|-------|---------|
| Admin Dashboard | `mindcraft.ing/admin` | Enrollment stats, AI costs by endpoint (7/14/30d), quick links |
| Token Cost API | `GET /api/admin/token-costs?days=7` | JSON: total cost, per-endpoint, top users, avg latency |
| Quality Audit | Auto-email every Monday 9am PT | AI output quality scores, stored in `quality_audits` table |
| Sentry Errors | sentry.io (after setting DSN) | Real-time error tracking with stack traces |
| Re-engage Emails | Auto via Vercel Cron daily 3pm | 3-7 days inactive → nudge, 7+ days → exit survey |
| Daily Reminders | Auto via Vercel Cron daily 2pm | Reminds active users to journal |

---

## NEW PAGES BUILT (verify live after deploy)

| URL | What | Status |
|-----|------|--------|
| `/assessment` | Free 7 Disruptions Self-Assessment lead magnet | Live |
| `/blog` | Blog with 9 coming-soon topic cards + email signup | Live |
| `/admin` | Admin monitoring dashboard (restricted to admin emails) | Live |

---

## COMPLETED ITEMS ✅

### Quick Fixes (all deployed)
- [x] Exercise completion micro-animation (scale+glow)
- [x] Exercise-to-exercise navigation (progress dots + counter)
- [x] Mobile touch targets 44px + pulse signaling
- [x] 3 new FAQs: pause, export, share with therapist
- [x] Grey text eliminated site-wide (theme-level fix)
- [x] Specific error messages: exercise save, payment, auth, journal
- [x] Re-enrollment CTA after program completion
- [x] 7-day money-back guarantee copy on all 3 programs
- [x] Sandbox/production separation verified

### Medium Effort (all deployed)
- [x] Spaced retrieval exercises SQL for Days 7, 14, 21 (script ready, needs running)
- [x] "Then vs Now" progress card on weekly review
- [x] Skill progression badges (Awareness/Practice/Application/Integration by week)
- [x] Assessment→action: process-journal weights low-scoring disruption domains
- [x] Exit survey email at 7+ days inactive
- [x] AI graceful degradation (already in place)
- [x] Async insight generation (already in place)
- [x] Token cost tracking admin endpoint
- [x] SEO audit: OG tags, Twitter cards on all pages
- [x] Coming Soon waitlist: First-Time Manager, International Move, Next Move
- [x] Email nurture signup on homepage + blog

### Larger Effort (all deployed)
- [x] AI Simulation real API (`/api/exercises/simulate`)
- [x] Quality monitoring cron + email (already configured)
- [x] Admin monitoring dashboard (`/admin`)
- [x] Playwright test suite (5 suites, 12+ tests)
- [x] Blog infrastructure (`/blog`)
- [x] Free lead magnet (`/assessment`)
- [x] Testimonial CTA in completion email

### Legal & Compliance (all deployed)
- [x] Terms: California → Washington State
- [x] Terms: 6 new sections (severability, survivability, entire agreement, force majeure, waiver, third-party services)
- [x] Terms: AI model update disclosure
- [x] Terms: prohibition on professional use
- [x] Terms: refund definition clarified (7 days from purchase, completed = journal entry submitted)
- [x] Signup: Terms & Privacy consent checkbox
- [x] Cookie consent banner

### Documents Written
- [x] GDPR rights implementation doc (`GDPR-RIGHTS-IMPLEMENTATION.md`)
- [x] Legal hangups analysis — 36 risks (`LEGAL-HANGUPS.md`)
- [x] CoachBot privacy policy review
- [x] PRD data storage map updated
- [x] Rate limiting threshold answered

---

## REMAINING ITEMS (need content work or external access)

### Content Work (Claude can help in future sessions)
- [ ] **whyThis chunking** — shorten the 5-6 longest exercise descriptions, move framework steps into primitive prompts
- [ ] **362 exercise arc audit** — add practice steps to ALL exercises (massive content project, Stefanie asked for full audit not just 90)
- [ ] **Scaffolding decrease** — Days 11-20 reduce pre-fill, Days 21-30 minimal. Add note in Days 1-10 explaining why scaffolding is heavier early.
- [ ] **Bloom's labels** — label deep-learning exercises, track repeated concepts per user across program arc

### Infrastructure (needs separate resources)
- [ ] **Staging environment** — develop branch exists with Vercel preview URLs. Needs separate Supabase project for full data isolation.

### Milestones to Watch
| Milestone | Trigger | What to do |
|-----------|---------|------------|
| 500+ enrolled users | Check admin dashboard | Revisit rate limiting → add Redis |
| 100+ daily active users | Sentry 429 errors | Upgrade to Vercel Pro + Redis rate limiter |
| First EU user | Check signups | Implement SCCs or verify DPF certification |
| First complaint/legal issue | Email from user | Reference LEGAL-HANGUPS.md for prepared responses |
