# Mindcraft — Todo & Action Tracker
**Last updated:** April 4, 2026

---

## YOUR ACTION ITEMS (Stefanie)

### Set These Env Variables in Vercel (5 min)
| Variable      | Value                                                  | Purpose                       |
| ------------- | ------------------------------------------------------ | ----------------------------- |
| `CRON_SECRET` | Any random string (e.g., generate at randomkeygen.com) | Secures cron jobs + admin API |

### Run These SQL Scripts in Supabase (5 min total)
Go to Supabase → SQL Editor → paste contents of each file → Run

| Script | Path | What it does |
|--------|------|-------------|
| Retrieval exercises | `scripts/add-retrieval-exercises.sql` | Adds spaced retrieval quiz exercises on Days 7, 14, 21 for all 3 programs |
| Scaffolding notes | `scripts/update-scaffolding-notes.sql` | Adds AI instructions to reduce scaffolding in Days 11-30 |
| Bloom's labels | `scripts/add-bloom-labels.sql` | Adds cognitive depth labels + concept tags to all exercises |

### Railway Fix ✅ CODE FIX PUSHED
- The crash was `llm.LLMOptions` not existing in the installed livekit-agents version — **fixed in code** (removed type reference)
- Check Railway logs after next deploy to confirm it starts cleanly
- If still crashing: also set "Watch paths" to `livekit-agent/**` in Railway dashboard → Settings

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
| `/feedback/exit` | Exit survey (why they stopped, what would bring them back) | Live |
| `/feedback/testimonial` | Testimonial survey (describe to a friend, what changed, permission) | Live |

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
- [x] **whyThis chunking** — shortened 6 longest exercises (Stress Responses, NVC, Older Pattern, Performance Culture, Cultural Observation, Belonging Sources). Avg reduced from ~1,150 to ~550 chars. Framework teaching stays in instruction/primitive.
- [ ] **362 exercise arc audit** — add practice steps to ALL exercises (massive content project, Stefanie asked for full audit not just 90)
- [x] **Scaffolding decrease** — SQL script ready (`scripts/update-scaffolding-notes.sql`). Adds system_notes to all program_days: Days 1-10 explain why heavier, Days 11-20 instruct AI to reduce pre-fill by 50%, Days 21-30 minimal scaffolding. Run in Supabase SQL Editor.
- [x] **Bloom's labels** — SQL script ready (`scripts/add-bloom-labels.sql`). Adds bloom_level column (remember/understand/apply/analyze/evaluate/create) + concept_tags array to frameworks_library. Auto-labels exercises by name pattern. Run in Supabase SQL Editor.

### Infrastructure (needs separate resources)
- [ ] **Staging environment** — develop branch exists with Vercel preview URLs. Needs separate Supabase project for full data isolation.

### Milestones to Watch
| Milestone | Trigger | What to do |
|-----------|---------|------------|
| 500+ enrolled users | Check admin dashboard | Revisit rate limiting → add Redis |
| 100+ daily active users | Sentry 429 errors | Upgrade to Vercel Pro + Redis rate limiter |
| First EU user | Check signups | Implement SCCs or verify DPF certification |
| First complaint/legal issue | Email from user | Reference LEGAL-HANGUPS.md for prepared responses |
