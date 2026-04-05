# Mindcraft — Todo & Action Tracker
**Last updated:** April 5, 2026

---

## YOUR ACTION ITEMS (Stefanie)

### Stefanie: Do These Before Launch

**1. Stripe — Verify live keys (2 min)**
Go to Vercel → Settings → Environment Variables. Check these two:
- `STRIPE_SECRET_KEY` — must start with `sk_live_`. If it starts with `sk_test_`, you're in test mode and real payments won't work. Get the live key from Stripe Dashboard → Developers → API keys.
- `STRIPE_WEBHOOK_SECRET` — must match the webhook endpoint configured for your live Stripe account (not the test one). Check Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret.

Check coach dashboard

**2. Sentry — Activate error monitoring (5 min)**
Go to sentry.io → your Mindcraft project → Settings → Client Keys (DSN). Copy the DSN string. Then:
- Vercel → Settings → Environment Variables → Add `NEXT_PUBLIC_SENTRY_DSN` with the DSN value
- Push any change (or empty commit) to trigger a redeploy
- After deploy, go to sentry.io — you should see a "first event" confirmation. From then on, production errors show up automatically.

**3. Cron secret — Enable scheduled emails (2 min)**
Go to Vercel → Settings → Environment Variables. Check if `CRON_SECRET` exists.
- If missing: add it with any random string (e.g., go to randomkeygen.com, copy a 256-bit key)
- This secures the daily inactive-reminder and re-engage email cron jobs. Without it, the crons run but accept any request — a minor security gap.

**4. Run streak migration (1 min)**
Go to Supabase → SQL Editor → paste contents of `supabase/add-streak-columns.sql` → Run. Adds `current_streak`, `best_streak`, `last_completed_date` to `program_enrollments`.

**5. SQL scripts — Check if these were run (5 min)**
Go to Supabase → SQL Editor. For each script, you can check if it was already applied:
- `scripts/add-retrieval-exercises.sql` — Check: run `SELECT count(*) FROM exercises WHERE name LIKE '%Retrieval%'`. If 0, run the script.
- `scripts/update-scaffolding-notes.sql` — Check: run `SELECT scaffolding_note FROM day_content WHERE day_number = 15 LIMIT 1`. If null, run the script.
- `scripts/add-bloom-labels.sql` — Check: run `SELECT bloom_level FROM exercises LIMIT 1`. If column doesn't exist or is null, run the script.

**5. GA4 funnel (30 min)**
Go to GA4 → Explore → Create new Exploration → Funnel.
Steps: `page_view (/)` → `homescreen_program_click` → `begin_checkout` → `login_success` → `day_completed (day 1)` → `day_completed (day 7)`

check admin site

### Stefanie: Co-Creation Decisions Needed

These are questions you raised that need your input before we can build:


**Search (#10) — How deep should search go?**
You asked how to make this possible. Two levels:
- **Simple (1 day):** Search bar on the journal page. Full-text search over `free_flow_entries.content`. Returns matching entries with highlighted snippets.
- **Deep (3 days):** Search across journals + exercises + insights. Unified search page with filters (date range, type, keyword). Could also search exercise responses.
- [ ] Which level do you want first?

**Streak Persistence (#11)**
No decision needed — I can just build this. Will add `current_streak` and `longest_streak` to enrollments and surface on dashboard.

**Token Cost Tracking (Monitoring)**
The admin dashboard at `/admin` already shows token costs by endpoint. Want me to also build a weekly cost summary email sent to `crew@allmindsondeck.com`? Or is checking the dashboard enough?
- [ ] Dashboard only, or also a weekly email?


---

## DASHBOARDS & MONITORING (already live)

| What               | Where                               | Details                                                        |
| ------------------ | ----------------------------------- | -------------------------------------------------------------- |
| Admin Dashboard    | `mindcraft.ing/admin`               | Enrollment stats, AI costs by endpoint (7/14/30d), quick links |
| Token Cost API     | `GET /api/admin/token-costs?days=7` | JSON: total cost, per-endpoint, top users, avg latency         |
| Quality Audit      | Auto-email every Monday 9am PT      | AI output quality scores, stored in `quality_audits` table     |
| Sentry Errors      | sentry.io (after setting DSN)       | Real-time error tracking with stack traces                     |
| Inactive Reminders | Auto via Vercel Cron daily 3pm      | 2+ days inactive → nudge (max 3), then exit survey             |

---

## NEW PAGES BUILT (verify live after deploy)

| URL | What | Status |
|-----|------|--------|
| `/assessment` | Free 7 Disruptions Self-Assessment lead magnet | Live |
| `/blog` | Blog with 9 coming-soon topic cards + email signup | Live |
| `/admin` | Admin monitoring dashboard (restricted to admin emails) | Live |
| `/feedback/exit` | Exit survey (why they stopped, what would bring them back) | Live |
| `/feedback/testimonial` | Testimonial survey (describe to a friend, what changed, permission) | Live |

### Read
- [x] GDPR rights implementation doc (`GDPR-RIGHTS-IMPLEMENTATION.md`)
- [x] Legal hangups analysis — 36 risks (`LEGAL-HANGUPS.md`)
- [x] CoachBot privacy policy review
- [x] PRD data storage map updated
- [x] Rate limiting threshold answered

---

## To Dos

### HIGH — Needed for Quality Launch


### Known Technical Debt

8. **In-memory rate limiting** — Current rate limiting uses in-memory counters. On Vercel, each request can hit a different serverless instance, so counters don't share state. At scale (100+ concurrent users), limits won't be enforced consistently. **Fix:** Add Redis (e.g., Upstash) as a shared counter store. ~2 hours of work.

9. **No unit/integration tests** — Only manual `TEST-PLAN.md`. **To start:** Set up Vitest (fast, Vite-native) for unit tests + Playwright for integration tests. Start with: API route tests (process-journal, daily-exercise) and critical UI flows (login → dashboard → day 1). ~1 day for setup + first 10 tests.


### MEDIUM — Important for Retention

9. **Search past entries** — Can't search journal entries or exercises. Suggestion: Add a search page or search bar on the journal/exercises pages. Use Supabase full-text search (`to_tsvector` + `to_tsquery`) on `free_flow_entries.content` and `exercise_completions.responses`. No external search service needed at current scale.

### Product Design Decisions

**A. Spaced retrieval integration** — ✅ Decision made.
- Curate retrieval and insert in weekly insights (not auto-inserted daily)
- Weekly insights API should reference key concepts from the week's exercises and ask "what do you remember?"
- **To build:** Add exercise concept references to weekly-insights prompt for natural retrieval.

**Suggestion for "X":** The most meaningful progress metrics are:
- **Pattern frequency shift** — "In Week 1 you mentioned [fear of judgment] in 4/5 entries. In Week 3, it appeared once." Shows the pattern loosening.
- **Self-awareness language** — Track shift from reactive language ("they made me feel") to reflective ("I noticed I felt"). Measurable via NLP.
- **Mood/rating trend** — `day_rating` over time (already tracked). Simple line chart.
- **Exercise engagement** — Rating trend + feedback quality over time.
- **Goal progress** — Weekly goal ratings (already in `weekly_reviews`).
Best format: a mix — one narrative sentence ("Your relationship with self-doubt has shifted") backed by one small chart (rating trend). Not just numbers, not just words.

**D. Exercise difficulty labeling** — ✅ Decision made.
- Do NOT show Awareness/Practice/Application/Integration labels to users
- Use them internally to audit program balance — if too many Awareness exercises cluster in later weeks, flag it as a quality issue in the weekly audit
- **Implementation:** The `bloom_level` field on exercises (from `add-bloom-labels.sql`) already tracks this. Add a check in `/api/quality-audit` that flags programs with >50% Awareness exercises after Day 14.

---

### Infrastructure (needs separate resources)
- [ ] **Staging environment** — develop branch exists with Vercel preview URLs. Needs separate Supabase project for full data isolation.

### Milestones to Watch
| Milestone | Trigger | What to do |
|-----------|---------|------------|
| 500+ enrolled users | Check admin dashboard | Revisit rate limiting → add Redis |
| 100+ daily active users | Sentry 429 errors | Upgrade to Vercel Pro + Redis rate limiter |
| First EU user | Check signups | Implement SCCs or verify DPF certification |
| First complaint/legal issue | Email from user | Reference LEGAL-HANGUPS.md for prepared responses |
