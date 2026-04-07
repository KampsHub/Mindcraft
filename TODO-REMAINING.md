# Mindcraft — Todo & Action Tracker
**Last updated:** April 7, 2026

---

## 📌 LAUNCH TRIGGERS (check these on a regular cadence)

| Trigger | What launches | Status |
|---|---|---|
| **20 paying customers** | $50/month Amazon gift card raffle for shared stories. Architecture is built; raffle code lives dormant. To launch: insert one row into `raffle_periods`, run one UPDATE to backfill `raffle_period_id` for accumulated entries, add one cron line to `vercel.json`, verify `TREMENDOUS_API_KEY` env var. ~5 min total. | ⏳ Waiting on customer count |

Until the trigger fires, the `/share` form copy says: *"We're running a $50 Amazon gift card raffle for shared stories — but we're still small enough that we want to wait until there are enough entries for it to feel like a real drawing. Your entry is locked in for the first one."* Entries accumulate in the DB with `raffle_period_id = null`, get backfilled at launch.



---

## ✅ SHIPPED TODAY (April 6)

### /refer page redesign
- Full rewrite: marketing header, hiker full-width section, two cards (referral + gift), 3 tips section, FAQ split into General/Referrals/Gifting with warm-white background, shared Footer. Program buttons now use "Layoff recovery / PIP navigation / New role confidence" labels with context blurbs, dynamic price from `/api/price`, and "Gift →" CTAs. Color scheme unified on ochre + navy (removed purple).

### Shared components
- `src/components/MarketingHeader.tsx` — nav for public subpages
- `src/components/Footer.tsx` — shared footer (refer page uses it, PageShell still has its own copy)
- `src/components/GiftingSection.tsx` — compact CTA with hiker bg, used on landing page + all 3 program pages + /insights/final
- `src/components/CloseEarlyCard.tsx` — full variant (progress section) + inline variant (dashboard w/ 2+ enrollments)

### Login page
- Bigger "New here? Start your journey →" CTA; "Securely hosted by Supabase" moved directly under Google button

### Webhook fix
- Gift-code email now sends from `crew@allmindsondeck.com` (was `.org` which was never verified in Resend)

### Program completion off-ramp (full stack)
- SQL: `final_insights`, `personal_promo_codes`, `deletion_requests` tables with RLS
- Shared helper: `src/lib/program-offramp.ts` — status update, Stripe promo, insight trigger, email
- Cron: `/api/cron/check-completions` — daily, finds enrollments ≥ 30 days old, runs offramp
- Cron: `/api/cron/process-deletions` — daily, purges data for deletion requests past their 30-day window
- Claude-powered final insight generator: `/api/insights/final/generate` (branches prompt for `completed` vs `closed_early`)
- In-app page: `/insights/final` (polls while generating, shows promo code, data-rights panel, GiftingSection)
- In-app page: `/account/delete` (warm red-button flow, type-to-confirm, shows scheduled date, cancellable)
- User-initiated close-early: `/api/enrollment/close-early`, wired into `/goals` progress section (always visible) and `/dashboard` (inline link, only when 2+ active enrollments)
- Webhook: now marks `personal_promo_codes.redeemed_at` on `type=personal_reward` redemption
- `vercel.json`: both new crons registered

---

## 🗂 TESTIMONIALS, RAFFLE, WALL OF LOVE, CRITICAL FEEDBACK

### ✅ Session A + minimal wall — SHIPPED April 7

**Database** (migration run in Supabase SQL Editor April 7):
- `testimonials` table — public praise, moderated, with `kind` discriminator (`text` / `social_url` / `video_url`), outcome tags, snapshot fields, RLS (anon insert + anon read approved + service role full)
- `feedback_entries` table — private critical feedback, service-role only, never public
- `raffle_periods` table — dormant, structure only
- 3 seed rows from `site.ts` socialProof inserted with `status='approved'`
- Indexes on `(status, created_at desc)`, `user_id`, `(source, created_at desc)`, `(status, ends_at)`

**API routes:**
- `POST /api/testimonials/direct` — text testimonial submission
- `POST /api/testimonials/social` — LinkedIn/X/Instagram URL + text snapshot; fetches Twitter oEmbed where possible
- `POST /api/testimonials/video` — Loom/YouTube/Vimeo URL + caption
- `GET  /api/testimonials/list` — public list of approved testimonials
- `POST /api/feedback` — private critical feedback to `feedback_entries` (service-role insert)
- `GET  /api/cron/draw-raffle` — dormant raffle drawing cron. **Not registered in `vercel.json`.** Safe to hit while dormant (no-op when no open periods). To activate: add to `vercel.json` and create an open `raffle_periods` row.

**UI:**
- `/share` page — three-tab collection UI (Write / Social / Video), outcome tag chips, name + email + consent, success state
- `<TestimonialCard>` component — discriminated rendering (text / social URL with optional "View original ↗" / video URL with YouTube/Loom/Vimeo iframe embed)
- Homepage `SocialProof()` — now fetches from DB, **hides entirely if `<4` approved testimonials**. Currently hidden (3 seeds < 4).
- `/insights/final` — "Share your story" CTA card added above the promo code block
- Completion email (`src/lib/program-offramp.ts`) — leads with share CTA + $50 raffle teaser

**Day-26 critical feedback:**
- `useStep2Journal.ts` — mirror-writes the journal content to `feedback_entries` with `source='day_26_prompt'` whenever a user saves their journal on day 26. Primary `daily_sessions` write still happens normally. Never surfaces on the public wall.

### Pre-flight / env vars

- [x] SQL migration run in Supabase SQL Editor (April 7)
- [x] `TREMENDOUS_API_KEY` set in Vercel (prod key approved April 7)
- [ ] **`TREMENDOUS_FUNDING_SOURCE_ID` still missing in Vercel** — needed for both the existing `/api/referral-rewards` cron *and* the dormant `/api/cron/draw-raffle`. Find it in the Tremendous dashboard → Funding sources → copy the ID (format `CAMPAIGN_...` or similar). Add to Vercel env (Production + Preview). Redeploy with an empty commit.

### Deferred to the next session

- **Direct video upload to Supabase Storage** — requires Supabase Pro ($25/mo). Currently on Free. Users can paste Loom / YouTube / Vimeo URLs as a workaround.
- **`/wall` dedicated page** with outcome-tag filter chips, pagination, "Submit yours" CTA
- **Featured + 2×2 grid layout** on the homepage (keeping existing 3-col for v1)
- **Auto-thumbnail generation** for hosted videos (Supabase Edge Function)
- **Register `/api/cron/draw-raffle` in `vercel.json`** when the 20-paying-customer trigger fires
- **Decide on 4–6 real seed testimonials** to ask for via direct outreach (the 3 hardcoded ones from `site.ts` live in the DB as seeds but the wall stays hidden until a 4th real submission is approved)
- **Add day-26 `program_days` seed rows** for parachute/jetstream/basecamp with a specific "What's not working for you?" prompt (the mirror-write already fires on any day 26 save, this is just content)
- **Testimonial-video deletion** in `/account/delete` flow (only matters once hosted video lands)

---

## 📋 PRODUCT DECISIONS (April 6 — locked)

Answers to the open questions M–Y. Source of truth.

| # | Question | Decision |
|---|---|---|
| M | Multiple simultaneous enrollments? | **Allowed.** Two programs can run side by side on the dashboard. The "close early" link only appears under a ProgramCard when there are 2+ active enrollments. The progress section on `/goals` always shows the close-early card. Shipped today. |
| N | Self-serve vs coach-referred GTM? | **Self-serve is primary.** Coach channel is supplementary. Marketing + product decisions should optimize for direct user acquisition. |
| O | Pricing model? | **One-off payment, not a subscription.** The $29/$49 charge is a single payment for 30 days. No auto-renewal, no "maintenance tier." Confirm the Stripe checkout session uses `mode: "payment"` (it does — verified in `/api/checkout/parachute/route.ts` line 42). |
| P | What does "completed" mean? | **All 30 days must be finished** to trigger natural completion. No certificates. The completion experience is the off-ramp we built today: final insights page + email + 20% off code + gifting/refer/share CTAs. Users who stop early can close the program manually via the "Close this program early" card — that triggers the same off-ramp with the `closed_early` branch of the Claude prompt. |
| Q | First-time user onboarding tour? | **Not building.** Stefanie will record a video instead. |
| R | AI bad advice → user feedback loop? | **Deferred — spec below.** Add a 👎 button next to AI-generated exercises/coaching responses → 1-line reason dropdown → inserts into `quality_flags` with `user_initiated=true` → immediately calls the matcher again (excluding the flagged framework) → swaps in a replacement with a toast "Got it — here's another angle." Closes the loop in-session and feeds the quality dashboard. ~2–3 hours when prioritized. |
| S | Voice vs text guidance? | **Let users discover naturally.** No one-time prompt needed. |
| T | 350+ exercises — all used? | **Query written.** Run `scripts/find-unused-frameworks.sql` in Supabase SQL Editor — returns (1) never-used frameworks, (2) rarely-used (1–3 completions), (3) usage distribution. Review results and either improve `when_to_use` triggers or retire dead frameworks. |
| U | Coaching plan vs overflow — skip exercise? | **Need "I don't want to do this exercise" control.** Add a small "skip / replace" action on every exercise card. On skip: log to `exercise_skips` (new minimal table or reuse `quality_flags`), request a replacement from the matcher, swap in. Overlaps with R — same interaction, different reason code. Build both at once. |
| V | Enneagram → exercise personalization? | **Deferred but worth doing.** Today Enneagram data goes to Claude as a freeform prompt blob. Make it explicit: multiply the matcher's relevance score by a per-type modality weight (Type 4 → somatic + narrative; Type 6 → grounding + cognitive; Type 9 → agency-naming + small-action; Type 5 → brief + low-intensity). Modalities are already tagged on `frameworks_library`. ~2 hours. Not urgent. |
| W | Trial/freemium? | **No trial.** The refund window serves the same purpose and is already in the product copy. |
| X | Re-enrollment path? | **Handled by the 20% off personal promo code** issued at off-ramp completion. No separate "try Basecamp next" email needed — the completion email already includes the code and a direct link to refer/gift/share. |
| Y | User referral program? | **Shipped today.** `/refer` page, Stripe promo codes, webhook redemption tracking, sharing history, gift code flow all live. See the `referrals-and-gifts.sql` migration + `/api/referral/*` routes. |

---

## 🟡 GAPS FROM TODAY'S WORK (need follow-up but not urgent)

### Privacy policy needs one update
`/privacy-policy` Section 8 (Data retention) should mention the `personal_promo_codes` table and the 30-day deletion queue behavior. Current copy is close enough but could be tightened.

### `/api/price` is still single-price
Dynamic price lookup works but returns one generic price (reads `STRIPE_PRICE_ID`). Fine for now since all 3 programs are $49. When you run per-program price tests, add `?program=slug` support that reads per-program product IDs from the existing PRODUCTS map in each checkout route.

### Referral gift reward fulfillment (pre-existing, not from today)
The `referral-rewards` cron already exists and uses Tremendous — confirmed working path. No action needed unless Tremendous API access is still pending.

### Gift-purchase refund → cancel issued gift code
You said you'll handle this manually in Stripe. Noting here so it's not forgotten: if this ever needs automation, add a `charge.refunded` listener in the webhook that finds the gift code via `session.id` and revokes the Stripe promo.

---

## YOUR ACTION ITEMS (Stefanie)

### Stefanie: Do These Before Launch

**1. Stripe — Verify live keys (2 min)**
Go to Vercel → Settings → Environment Variables. Check these two:
- `STRIPE_SECRET_KEY` — must start with `sk_live_`. If it starts with `sk_test_`, you're in test mode and real payments won't work. Get the live key from Stripe Dashboard → Developers → API keys.
- `STRIPE_WEBHOOK_SECRET` — must match the webhook endpoint configured for your live Stripe account (not the test one). Check Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret.

Check coach dashboard

**6. GA4 funnel (30 min)**
Go to GA4 → Explore → Create new Exploration → Funnel.
Steps: `page_view (/)` → `homescreen_program_click` → `begin_checkout` → `login_success` → `day_completed (day 1)` → `day_completed (day 7)`

**7. Tremendous API + referral system activation**
- Awaiting email response from Tremendous for API access
- Once approved: get API key (Team Settings → API) + Funding Source ID (Funding page)
- Fund through business account (same one connected to Stripe payouts)
- Add to Vercel env vars: `TREMENDOUS_API_KEY`, `TREMENDOUS_FUNDING_SOURCE_ID`
- Enable auto-reload: Funding → Auto-reload → set threshold ($50 when below $20)
- Run SQL: `supabase/referrals-and-gifts.sql` in Supabase SQL Editor

check admin site
check coach dashboard

### Stefanie: Co-Creation Decisions Needed



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

| URL                     | What                                                                | Status |
| ----------------------- | ------------------------------------------------------------------- | ------ |
| `/assessment`           | Free 7 Disruptions Self-Assessment lead magnet                      | Live   |
| `/blog`                 | Blog with 9 coming-soon topic cards + email signup                  | Live   |
| `/admin`                | Admin monitoring dashboard (restricted to admin emails)             | Live   |
| `/feedback/exit`        | Exit survey (why they stopped, what would bring them back)          | Live   |
| `/feedback/testimonial` | Testimonial survey (describe to a friend, what changed, permission) | Live   |

### Read
- [x] GDPR rights implementation doc (`GDPR-RIGHTS-IMPLEMENTATION.md`)
- [x] Legal hangups analysis — 36 risks (`LEGAL-HANGUPS.md`)
- [x] CoachBot privacy policy review
- [x] wPRD data storage map updated
- [x] Rate limiting threshold answered

---

## To Dos


### Backlog
- In-memory rate limiting → Redis (Upstash) when 100+ concurrent users
- Email templates hardcoded → React Email migration (~1 day)
- Search enhancement → full-text search indexes when >100 users
- Dark/light mode (~2-3 days)
- i18n (backburner)
- A/B testing for pricing (Statsig, ~2-3 hrs)
- CMS (Sanity, ~2-3 days, not needed yet)
- Mobile app (web-only, audit as needed)

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
