# Mindcraft — Todo & Action Tracker
**Last updated:** April 6, 2026

---

## 📌 LAUNCH TRIGGERS (check these on a regular cadence)

| Trigger | What launches | Status |
|---|---|---|
| **20 paying customers** | $50/month Amazon gift card raffle for shared stories. Architecture is built; raffle code lives dormant. To launch: insert one row into `raffle_periods`, run one UPDATE to backfill `raffle_period_id` for accumulated entries, add one cron line to `vercel.json`, verify `TREMENDOUS_API_KEY` env var. ~5 min total. | ⏳ Waiting on customer count |

Until the trigger fires, the `/share` form copy says: *"We're running a $50 Amazon gift card raffle for shared stories — but we're still small enough that we want to wait until there are enough entries for it to feel like a real drawing. Your entry is locked in for the first one."* Entries accumulate in the DB with `raffle_period_id = null`, get backfilled at launch.

---

## 🚨 YOU NEED TO RUN THESE (April 6 session)

Priority order — top ones unblock everything else.

### Supabase SQL Editor — run these two migrations
- [ ] `supabase/program-completion-offramp.sql` — creates `final_insights`, `personal_promo_codes`, `deletion_requests ---- done`
- [ ] `supabase/add-closed-early-status.sql` — allows `status = 'closed_early'` on enrollments -- done

### Vercel environment variables — verify present
- [ ] `CRON_SECRET` (any random string)
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (e.g. `https://mindcraft.allmindsondeck.com`)
-- done
### Assets
- [x] Upload hiker image as `public/hiker-bg.jpg` ✅ done

### Deploy & smoke test
- [ ] Push + confirm Vercel deploy succeeds
- [ ] Visit `/refer` — confirm marketing header, hiker section, FAQ, footer render
- [ ] Visit `/` — confirm compact `GiftingSection` renders below waitlist cards
- [ ] Visit `/login` — confirm "Securely hosted by Supabase" is under the Google button
- [ ] Manually trigger `GET /api/cron/check-completions` with `Authorization: Bearer $CRON_SECRET` on a test enrollment that's been backdated ≥ 30 days — confirm final insight generates, email lands, promo code created

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

## 🗂 NEXT SESSION — TESTIMONIALS, RAFFLE, WALL OF LOVE, CRITICAL FEEDBACK (queued)

Locked decisions from April 6 wrap-up. This is the next focused build (~12 hours, can split into 2 sessions).

### Decisions locked
- **Raffle:** $50 Amazon gift card, monthly cadence. Architecture built and dormant. **Launch trigger: 20 paying customers** (see Launch Triggers section above).
- **Critical feedback:** Built but completely separate from public testimonials. Surfaces inside the daily flow on **day 26** (gives a 4-day decompression before the off-ramp). Prompt: *"What's not working for you?"* Writes to a `feedback_entries` table that never touches the wall, raffle, or marketing.
- **Wall card name format:** First name + last initial only. No link to original post by default. Optional opt-in to show a "View on LinkedIn ↗" link if user pasted a social URL.
- **Wall filters:** Outcome-based, never program-based (no outing of layoff/PIP status). Tags: `clarity`, `confidence`, `hard_conversations`, `starting_new`. Stored as `outcome_tags text[]` on testimonials.
- **Video hosting:** Self-hosted in Supabase Storage. Requires Supabase Pro ($25/mo) — confirm before build. Direct browser → signed URL upload (bypasses Vercel's 4.5 MB function body limit). Auto-thumbnail generation. No client-side compression for v1.
- **Social embeds (LinkedIn, X):** Hybrid approach — store the live embed HTML AND a snapshot (text + thumbnail) at submission time, with explicit consent. Default to live embed for the first 90 days, can flip individual rows to snapshot mode if they go stale or hostile.
- **Wall placement on homepage:** Featured + 2x2 grid, between the differentiator strip and the gifting section. Empty state: hide entirely if `<4` approved testimonials exist.

### Build scope

**Session A — Backend + collection (~8 hours)**
- SQL migration: `feedback_entries`, `testimonials` (with hosted-video fields, outcome_tags, snapshot fields), `raffle_periods`
- `/share` page with 3 tabs: paste social URL · paste video URL · upload video / write text
- `/feedback` page (private, day-26 prompt placement separate)
- API routes: `POST /api/feedback`, `POST /api/testimonials/social`, `POST /api/testimonials/direct`, `POST /api/testimonials/upload-url` (signed URL endpoint, generic for reuse)
- `/api/cron/draw-raffle` route — full code, NOT yet registered in vercel.json
- Updated completion email to lead with the share CTA + "raffle launching soon" copy
- Updated `/insights/final` to surface the share CTAs prominently
- Day-26 prompt insertion into daily flow (need to look at `daily_sessions` / `program_days` schema for cleanest insertion point)

**Session B — Display + wall (~6 hours)**
- `<TestimonialCard>` component (handles LinkedIn embed / Twitter embed / hosted video / Loom embed / direct text via discriminator)
- Embed utilities (LinkedIn URL → iframe, Twitter oEmbed, Loom URL → iframe, YouTube URL → iframe)
- `<WallSection>` homescreen widget (featured + 2x2 grid layout)
- `/wall` dedicated page with outcome-tag filter row, pagination, "Submit yours" CTA at the bottom
- Auto-thumbnail generation for hosted videos (Supabase Edge Function)
- Empty state guards (hide if <4 approved testimonials)
- Manual seed instructions for the first 4–6 testimonials before launch
- Add testimonial-video deletion to existing `/account/delete` flow

### Pre-build checklist
- [ ] Confirm Supabase plan — upgrade to Pro ($25/mo) if currently on Free
- [ ] Verify `TREMENDOUS_API_KEY` is set in Vercel env (already needed for referral-rewards cron)
- [ ] Decide on the 4–6 seed testimonials to ask for via direct outreach before launching the wall

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

### Existing `/my-account` vs new `/account/delete` overlap
There's already a `/my-account` page with a DELETE button that hits `/api/account` and does an **immediate** wipe. The new `/account/delete` page uses the **30-day queued** flow via `deletion_requests`. Both are live — users could hit either. Pick one as canonical and redirect the other. Recommendation: keep the queued flow as the user-facing one (matches privacy policy language, gives users a cancel window) and delete the immediate-wipe path, OR keep the immediate one for admin/support cases and rename it.

### Table-name audit on the new code
During cleanup I fixed these but flag for re-verification after the SQL migration is run:
- Insight generator queries `entries` (not `journal_entries`), `exercise_completions`, `weekly_reviews` — correct per existing schema
- Process-deletions cron now uses the same table list as `/api/account/route.ts` — kept in sync by comment, but if you add new personal-data tables in future, update both places
- Neither file has been smoke-tested against real data yet

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
