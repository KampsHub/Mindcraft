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

### ✅ Completed This Session (April 4-5)
- ~~Stripe live keys~~ — verified and set
- ~~Sentry error monitoring~~ — activated, DSN in Vercel
- ~~Inactive user reminders~~ — 2-day gap, max 3, then exit survey
- ~~Coach dashboard~~ — invite/accept/revoke, client cards, goals/insights/enneagram, coach notes → daily thread
- ~~Commitment follow-through~~ — daily thread check-in, exercise selection awareness, weekly aggregation
- ~~Streak tracking~~ — current_streak, best_streak on dashboard
- ~~Calendar view~~ — 30-day grid on /goals
- ~~Notification preferences~~ — toggles in /my-account
- ~~Unit tests~~ — Vitest setup, 48 tests passing (parse-ai-response, api-validation, rate-limit)
- ~~Search~~ — /search page with exercises (+ framework instructions), journal entries, insights
- ~~Progress metrics in weekly insights~~ — pattern shifts, language shifts, mood trend, exercise engagement, narrative
- ~~Spaced retrieval~~ — curated in weekly insights coaching questions
- ~~Bloom level audit~~ — quality audit flags >50% Awareness exercises after Day 14
- ~~Cross-week shift detection~~ — weekly insights compares themes across weeks
- ~~GDPR deletion gaps~~ — /api/account now covers all 26 tables
- ~~Memory retrieval optimization~~ — database index (preserves cross-program memories)
- ~~API logs async~~ — fire-and-forget, no response delay
- ~~Background image flash~~ — computed synchronously on render
- ~~Mobile nav fix~~ — parachute page nav overlap fixed
- ~~Assessment redesign~~ — inverted scale, renamed labels, Next button, merged email step
- ~~Homepage copy~~ — "Built different" visual grid, trimmed copy throughout, pill labels
- ~~Token cost tracking~~ — top users table in admin dashboard
- ~~Daily reminder cron removed~~ — replaced by inactive reminders
- ~~Docs created~~ — email-audit.md, analytics-tracking.md, customer-data-storage.md
- ~~PRD updated~~ — reflects all April 5 builds

### Known Technical Debt

8. **In-memory rate limiting** — needs Redis (Upstash) at scale. Not urgent until 100+ concurrent users.

12. **Email templates hardcoded** — all HTML inline in route handlers. Fix: React Email migration (~1 day).

### MEDIUM — Still Open

10. **Search enhancement** — current search uses ILIKE. Could add full-text search indexes for better performance at scale. Currently fine for <100 users.

### LOW — Parked
- Dark/light mode (~2-3 days)
- i18n (backburner)
- A/B testing for pricing (needs Statsig, ~2-3 hrs)
- CMS (Sanity recommended, ~2-3 days, not needed yet)
- Mobile app (web-only, audit mobile responsiveness as needed)

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
