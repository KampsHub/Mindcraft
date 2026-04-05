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

### Read
- [x] GDPR rights implementation doc (`GDPR-RIGHTS-IMPLEMENTATION.md`)
- [x] Legal hangups analysis — 36 risks (`LEGAL-HANGUPS.md`)
- [x] CoachBot privacy policy review
- [x] PRD data storage map updated
- [x] Rate limiting threshold answered

---

## To Dos

### CRITICAL — Blocks Launch

1. **Stripe keys** — The keys connected to the current mindcraft.ing products should be live keys. Verify in Vercel env vars that `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are live (not `sk_test_`).

2. ~~**Inactive user reminder emails**~~ — ✅ Done. 2-day threshold, max 3 reminders, exit survey after 3rd + 7 days. Cron already scheduled. **Stefanie action:** Run `supabase/extend-email-events.sql` in Supabase SQL Editor.

3. ~~**Subscription lifecycle**~~ — ✅ Not needed. Not officially a subscription.

### HIGH — Needed for Quality Launch

4. **Error monitoring (Sentry)** — Sentry is set up. Activate by setting `NEXT_PUBLIC_SENTRY_DSN` in Vercel env vars. Verify errors appear in Sentry dashboard after deploy.

5. **Coach dashboard UI redesign** — API exists (`/api/coach-analytics`), page exists (`/coach`). Needs new UI showing:
   - Individual client logins and last-active dates
   - Where each client is in the program (current day, week)
   - Insights the client chooses to share
   - Coaching goals per client
   - Enneagram results (if client uploads)

6. ~~**Referral dashboard**~~ — Parked.

7. ~~**Admin panel**~~ — Accepted. Stefanie will use Supabase directly.

### Monitoring Features

| Feature | Needs | Status |
|---------|-------|--------|
| Sentry | DSN env var in Vercel | Config ready — activate |
| ~~Quality monitoring cron~~ | ~~Vercel Cron job setup~~ | ✅ Already scheduled in vercel.json: `0 16 * * 1` (Monday 4 PM UTC) |
| Token cost tracking | Admin query on `api_logs` | Table exists — build query and send to Stefanie |

### Known Technical Debt

8. **In-memory rate limiting** — Current rate limiting uses in-memory counters. On Vercel, each request can hit a different serverless instance, so counters don't share state. At scale (100+ concurrent users), limits won't be enforced consistently. **Fix:** Add Redis (e.g., Upstash) as a shared counter store. ~2 hours of work.

9. **API logs write synchronously** — Every AI call writes to `api_logs` before returning the response, adding ~50-100ms latency. **Fix:** Use `waitUntil()` (Vercel edge runtime) or a background queue (e.g., Inngest, QStash) to write logs after the response is sent. ~1-2 hours.

10. **Memory embeddings retrieval may slow** — As the `coaching_memories` table grows, similarity search queries will slow down. **Fix:** Add a PostgreSQL vector index (pgvector `ivfflat` or `hnsw` index), or limit retrieval to recent memories (last 90 days). Monitor query times in `api_logs` latency.

11. **No unit/integration tests** — Only manual `TEST-PLAN.md`. **To start:** Set up Vitest (fast, Vite-native) for unit tests + Playwright for integration tests. Start with: API route tests (process-journal, daily-exercise) and critical UI flows (login → dashboard → day 1). ~1 day for setup + first 10 tests.

12. ~~**283 exercises old format**~~ — ✅ Verified. Exercise data lives in database (not `exerciseDataCore.ts` which doesn't exist). 14 references to `whyNow`/`science` remain in rendering code as backward-compatible fallbacks — not a blocker.

13. **Email templates hardcoded** — All email HTML is inline in route handlers. **Fix:** Use React Email (`@react-email/components`) to build reusable templates as React components. Resend supports React Email natively. Create a `src/emails/` directory with shared layout + per-email templates. ~1 day to migrate existing emails.

### Data Storage Map — New Features (April 4, 2026)

All of these are tracked automatically — no action needed from Stefanie. To retrieve data:
- **Supabase tables** (`exercise_completions`, `weekly_reviews`, `program_enrollments`): Go to Supabase → Table Editor → select table → filter/export
- **Google Analytics events**: GA4 → Reports → Events → filter by event name
- **Sentry**: sentry.io dashboard (after activation)

| Feature | Where Stored | Column/Field | Type |
|---------|-------------|--------------|------|
| Star rating per exercise | `exercise_completions` | `star_rating` | integer 1-5 |
| Exercise feedback (≤3 stars) | `exercise_completions` | `feedback` | text |
| NPS score | `weekly_reviews` | `nps_score` | integer 0-10 |
| NPS score (backup) | Google Analytics | event `nps_submitted` | GA event |
| Day completed event | Google Analytics | event `day_completed` | GA event |
| Login success event | Google Analytics | event `login_success` | GA event |
| Cookie consent | `localStorage` | key `cookie-consent` | client-side |
| Pause/resume status | `program_enrollments` | `status` | enum |
| Exercise dedup window | `exercise_completions` | `completed_at >= 7 days ago` | query filter |
| Sentry errors | Sentry.io | requires `NEXT_PUBLIC_SENTRY_DSN` | external |
| Staging deploys | Vercel | `develop` branch → preview URLs | infra |

### Quick Fixes


### MEDIUM — Important for Retention

8. **User-facing analytics** — Users see no progress metrics beyond day count. Suggestion: Surface on the Insights page — patterns detected over time, exercise completion rate, mood/rating trends, most-used frameworks, streak data. Could use recharts (already installed) to show week-over-week shifts.

9. **Notification preferences** — Users can't control email frequency. Build an email opt-in UI in the `/my-account` page with toggles for: inactive reminders, daily reminders, weekly insights, program updates. Store preferences in `clients` table (new `email_preferences` jsonb column).

10. **Search past entries** — Can't search journal entries or exercises. Suggestion: Add a search page or search bar on the journal/exercises pages. Use Supabase full-text search (`to_tsvector` + `to_tsquery`) on `free_flow_entries.content` and `exercise_completions.responses`. No external search service needed at current scale.

11. **Streak persistence** — Day completion streaks not tracked in database. Add `current_streak` and `longest_streak` integer columns to `program_enrollments`. Update on each day completion (check if previous day was completed yesterday → increment, otherwise reset to 1). Surface on dashboard.

### Larger Effort


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
