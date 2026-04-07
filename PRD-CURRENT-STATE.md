# Mindcraft Product Requirements Document — Current State
**Last Updated:** 2026-04-07
**Status:** Production (mindcraft.ing)

---

## 1. Product Overview

Mindcraft is a 30-day AI-powered coaching platform for professionals navigating career disruptions. Three programs serve different crisis contexts, each delivering daily journaling + exercise-based coaching through a Tell → Do → Done flow. A 4th product (Enneagram) is a one-time self-assessment add-on.

### Programs
| Program | Slug | Context | Duration | Price |
|---|---|---|---|---|
| Parachute | `parachute` | Layoff recovery | 30 days | $29–$69 sliding scale (default $49) |
| Jetstream | `jetstream` | PIP navigation | 30 days | $49 |
| Basecamp | `basecamp` | New role confidence | 30 days | $49 |
| Enneagram | `enneagram` | IEQ9 self-assessment + debrief | One-time | $349 |

---

## 2. Architecture

### Tech stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Vercel (Hobby plan)
- **Database:** Supabase (PostgreSQL + Auth + RLS + pgvector)
- **AI:** Anthropic Claude Sonnet via `@anthropic-ai/sdk`
- **Payments:** Stripe (live mode)
- **Email:** Resend (`allmindsondeck.com` verified domain)
- **Voice:** LiveKit + Deepgram/Speechmatics
- **Animation:** framer-motion v12, canvas-confetti, lottie-react, motion.dev (additive)
- **Styling:** Inline styles + shared theme tokens (`src/lib/theme.ts`)
- **Error monitoring:** Sentry (production, PII redacted)
- **Hosting:** Vercel (production = mindcraft.ing)

### Domains
- `mindcraft.ing` — production app
- `allmindsondeck.com` — verified Resend sender domain (DKIM/SPF/DMARC green)
- `allmindsondeck.org` — secondary sender (used by `noreply@`)

---

## 3. Database (Supabase)

### Core tables
| Table | Purpose |
|---|---|
| `clients` | User profile, subscription status, Stripe customer ID, welcome email flag |
| `programs` | Program catalog (parachute / jetstream / basecamp / enneagram) with `weekly_themes` JSONB |
| `program_enrollments` | Per-user program enrollment with `current_day`, `status` (`pre_start`/`onboarding`/`awaiting_goals`/`active`/`completed`/`paused`/`closed_early`), streak counters |
| `program_days` | Curriculum content per day per program (seed prompts, exercises, framework analysis, system notes) |
| `daily_sessions` | One row per user per day: `step_1_themes`, `step_2_journal`, `step_3_analysis`, `step_5_summary`, `completed_steps`, `day_rating`, `day_feedback` |
| `client_profiles` | Long-form persona built from intake + enneagram + behavior |
| `intake_responses` | Onboarding intake answers |
| `client_assessments` | 7 disruptions assessment results (lead magnet at `/assessment`) |

### Content + framework tables
| Table | Purpose |
|---|---|
| `frameworks_library` | 350+ exercises with `when_to_use`, modality tags, prePopulated data, Bloom level |
| `exercise_completions` | One row per exercise completion: responses, star rating, feedback, insight |
| `free_flow_entries` | Voice/text free-flow entries outside the daily flow |

### Goals + reviews
| Table | Purpose |
|---|---|
| `client_goals` | AI-generated goals per enrollment, status tracking |
| `weekly_reviews` | Per-week reflection + AI insights (pattern shifts, language shifts, mood, narrative) |
| `final_insights` | Long-form Claude reflection generated on program completion |

### Coach + sharing
| Table | Purpose |
|---|---|
| `coach_clients` | Coach → client invite/accept/revoke relationship |
| `coach_notes` | Coach-authored notes that surface in the client's daily Thread |
| `shared_summaries` | Approved-by-user summaries shared with coach |
| `consent_settings` | Per-user consent toggles (coach sharing, inactive reminders, program updates) |

### Memory + search
| Table | Purpose |
|---|---|
| `coaching_memory` | Long-term memory rows with relevance index for retrieval |
| (pgvector) | Semantic search across journals, exercises, insights |

### Quality + monitoring
| Table | Purpose |
|---|---|
| `quality_flags` | User-initiated 👎 reports + AI auto-flags |
| `quality_audits` | Weekly Claude-evaluated quality scores per output |
| `api_logs` | Async fire-and-forget log of every AI API call |
| `email_events` | Resend webhook events (sent/delivered/opened/clicked/bounced/complained) + outbound logs for cron cadence |

### Payments + referrals
| Table | Purpose |
|---|---|
| `referrals` | Per-user referral codes (Stripe coupon + promo code linked) |
| `referral_redemptions` | Redemption tracking with 7-day eligibility window for $10 reward |
| `gift_codes` | One-time 100% off gift codes from gift checkout flow |
| `personal_promo_codes` | 20% off codes issued at program completion (single-use, single user) |

### Lifecycle / deletion
| Table | Purpose |
|---|---|
| `deletion_requests` | User-initiated deletion queue with 30-day grace period |

### Testimonials + critical feedback (Apr 7)
| Table | Purpose |
|---|---|
| `testimonials` | Public wall content. Discriminated by `kind` (text / social_url / video_url). RLS: anyone can submit, anyone reads `status='approved'`, service role moderates. |
| `feedback_entries` | Private critical feedback. Service-role-only. Source = `day_26_prompt` / `share_page_feedback_tab` / `other`. Never public. |
| `raffle_periods` | Dormant. Structure for the $50 Amazon raffle launching at 20 paying customers. |

### Auth (Supabase managed)
- Email + password
- Magic link (custom SMTP via Resend recommended; not yet configured at time of writing)
- Google OAuth
- `auth.users.last_sign_in_at` is the trigger for re-engagement nudges

---

## 4. Integrations

| Integration | Purpose | Status | Config |
|---|---|---|---|
| **Stripe** | Payments (one-off, no subscription), promo codes, webhooks | Live | `STRIPE_SECRET_KEY` (sk_live_), `STRIPE_WEBHOOK_SECRET`. Account: `acct_1M3PsxDDKzXYCvXj` (All Minds On Deck) |
| **Supabase** | Postgres + Auth + Storage + RLS | Live | Free tier. Pro upgrade required for self-hosted video uploads (deferred) |
| **Anthropic Claude** | AI generation across journal processing, themes, exercise selection, weekly insights, final reflection, quality eval | Live | `CLAUDE_API_KEY`. Always wrapped via `getAnthropicClient()` from `src/lib/api-validation.ts` |
| **Resend** | All transactional email | Live | `RESEND_API_KEY`. Domain `allmindsondeck.com` fully verified. Webhooks → `email_events` table via `/api/resend-webhook` |
| **Tremendous** | Amazon gift card delivery for referral rewards + raffle | Partial | `TREMENDOUS_API_KEY` set in Vercel. **`TREMENDOUS_FUNDING_SOURCE_ID` still missing** — referral rewards cron will silently no-op without it |
| **LiveKit + Deepgram/Speechmatics** | Voice input (journal + exercise responses) | Live | `LIVEKIT_*`, `DEEPGRAM_*` env vars |
| **Sentry** | Error monitoring | Live | `SENTRY_DSN`. PII redaction active |
| **Vercel Cron** | Scheduled jobs | Live | See cron table below |
| **Google OAuth** | Sign-in | Live | Configured via Supabase Auth → Providers |

### Vercel cron schedule (`vercel.json`)

| Cron | Schedule (PT) | Route | Purpose |
|---|---|---|---|
| Quality audit | Mon 4pm | `/api/quality-audit` | Weekly Claude-evaluated audit of AI outputs → email to coach |
| Re-engage | Daily 3pm | `/api/email/re-engage` | Send next nudge (1/2/3) or exit survey based on `auth.users.last_sign_in_at` and emails sent so far |
| Referral rewards | Daily 1pm | `/api/referral-rewards` | Find redemptions ≥7 days old → send $10 Amazon via Tremendous → mark rewarded |
| Check completions | Daily 2:17pm | `/api/cron/check-completions` | Find enrollments with `started_at ≤ 30 days ago` → trigger offramp |
| Process deletions | Daily 3:23am | `/api/cron/process-deletions` | Process queued deletion requests past their 30-day window |

---

## 5. Pages (40+)

### Public / marketing
- `/` (homepage — current live version, not in current refactor branch)
- `/parachute`, `/jetstream`, `/basecamp` — program landing pages
- `/parachute/welcome`, `/jetstream/welcome`, `/basecamp/welcome` — post-payment signup
- `/refer` — referral + gift program (light-mode redesign Apr 7)
- `/share` — testimonial collection (3-tab UI: text / social URL / video URL)
- `/login` — redesigned Apr 7 (light mode, black sliver header, unified button shapes)
- `/signup`, `/forgot-password`, `/reset-password`
- `/assessment` — 7 Disruptions self-assessment lead magnet
- `/blog` — coming-soon topic cards + email signup
- `/contact`, `/apply` — contact form, coaching application
- `/privacy-policy`, `/terms`

### Authenticated app
- `/dashboard` — program cards, streak, quick-actions grid (visually upgraded Apr 7), upsells
- `/intake` — 7 disruptions / values / beliefs intake
- `/day/[dayNumber]` — Tell / Do / Done daily flow tabs
- `/goals` — AI-generated goals + 30-day calendar integrated with weekly themes (rebuilt Apr 7 — 5 rows including new "Integration Phase" for days 29–30)
- `/weekly-review` — AI insights, pattern shifts, share buttons (share endpoints deleted Apr 7; UI buttons stubbed to no-op)
- `/monthly-summary`
- `/mindful-journal` — free-form journaling
- `/insights/final` — completion reflection + share CTA (Apr 7) + 20% promo code
- `/account/delete` — type-to-confirm deletion flow with 30-day grace period
- `/my-account` — profile, enrollments, consent toggles, data export, deletion
- `/search` — semantic search across exercises, journal entries, insights

### Coach
- `/coach` — coach dashboard (invite clients, view progress, leave notes)
- `/coach/accept` — client-side invitation acceptance

### Feedback
- `/feedback/exit` — exit survey (why stopped, what would bring back)
- `/feedback/testimonial` — testimonial survey (legacy, predates `/share`)

### Admin (allowlist-gated, not in robots.txt or sitemap)
- `/admin` — token costs, enrollment stats, top users
- `/admin/emails` — every active production email with Send Test, Open in VS Code, Copy Path actions (built Apr 7)

---

## 6. API routes (~50+)

### Daily flow + AI
- `process-journal`, `daily-themes`, `daily-summary`, `daily-exercise`, `reflect`
- `process-insight`, `sentiment`, `framework-analysis`, `emotional-mirror`
- `generate-goals`, `generate-plan`, `generate-profile`, `expand-prompts`
- `weekly-insights`
- `enneagram-analyze`

### Voice
- `voice/token`, `voice-transcribe`, `voice-eval`, `tts`

### Quality
- `quality-flag`, `quality-audit` (cron)

### Payment
- `checkout/parachute`, `checkout/jetstream`, `checkout/basecamp`, `checkout` (generic)
- `checkout/verify`, `webhook` (Stripe), `link-subscription`, `price`

### Coach
- `coach/invite`, `coach/accept`, `coach/revoke`, `coach/clients`
- `coach/notes/*`

### Account + lifecycle
- `account` (data export, delete), `contact`, `apply`, `welcome-email`
- `cron/check-completions`, `cron/process-deletions`
- `enrollment/close-early`
- `insights/final/generate`

### Email cron + transactional
- `email/re-engage` (cron — 4-stage cadence rebuilt Apr 7)
- `referral-rewards` (cron — Tremendous + email)
- `referral/generate`, `referral/status`

### Testimonials + feedback (Apr 7)
- `testimonials/direct`, `testimonials/social`, `testimonials/video`, `testimonials/list`
- `feedback`

### Admin (Apr 7)
- `admin/send-test-email` — admin-gated route that sends production-fidelity preview HTML to admin inbox

### Webhooks
- `resend-webhook` — Resend delivery events
- `webhook` (Stripe) — checkout completion, gift code generation, referral redemption tracking, enneagram purchase notification

---

## 7. Email system

**All transactional email goes through Resend.** Templates live in `src/lib/emails/<name>.ts` as exported pure functions. Each route imports its template — single source of truth, no drift. The `/admin/emails` page imports the same functions for production-fidelity previews.

### Active emails (15)

| Key | Trigger | From | Template file |
|---|---|---|---|
| `welcome` | First login/signup | stefanie@ | `src/lib/emails/welcome.ts` |
| `program-offramp` | 30-day completion OR user-initiated close-early | crew@ | `src/lib/program-offramp.ts` (function: `offrampEmailHtml`) |
| `re-engage-nudge-1` | 3 days since last sign-in (once per enrollment) | noreply@ | `src/lib/emails/re-engage.ts` |
| `re-engage-nudge-2` | 6 days since last sign-in (once per enrollment) | noreply@ | `src/lib/emails/re-engage.ts` |
| `re-engage-nudge-3` | 9 days since last sign-in (once per enrollment, "we" voice, no CTA) | noreply@ | `src/lib/emails/re-engage.ts` |
| `re-engage-exit-survey` | 14 days since last sign-in (after all 3 nudges) | crew@ | `src/lib/emails/re-engage.ts` |
| `referral-reward-recipient` | Referral cron, 7+ days after redemption | noreply@ | `src/lib/emails/referral-reward.ts` |
| `referral-reward-admin` | Same cron, admin notification | noreply@ | `src/lib/emails/referral-reward.ts` |
| `gift-code` | Stripe webhook on gift purchase | crew@ | `src/lib/emails/gift-code.ts` |
| `contact-alert` | Public contact form | noreply@ | `src/lib/emails/contact-alert.ts` |
| `coaching-application` | `/apply` form submission | stefanie@ | `src/lib/emails/coaching-application.ts` |
| `waitlist-user-confirmation` | Public waitlist form (team-alert removed Apr 7) | crew@ | `src/lib/emails/waitlist.ts` |
| `enneagram-purchase-webhook` | Stripe webhook on enneagram purchase | crew@ | `src/lib/emails/enneagram-purchase-webhook.ts` |
| `quality-audit-report` | Mon 4pm cron | noreply@ | `src/lib/emails/quality-audit.ts` |
| `account-deletion-confirmation` | Process-deletions cron after 30-day window | crew@ | `src/lib/emails/account-deletion.ts` |

### Re-engagement cadence (rewritten Apr 7)
- **Trigger:** `auth.users.last_sign_in_at` (NOT `daily_sessions`)
- **Day 3+:** nudge 1 — "Just leaving the door open." (Stefanie I-voice)
- **Day 6+:** nudge 2 — "You don't have to catch up." (Stefanie I-voice)
- **Day 9+:** nudge 3 — "Going quiet — your work is safe." (we-voice, no CTA, signed by team)
- **Day 14+:** exit survey — "One short question, then we're done." (we-voice, yellow button)
- **No reset on sign-in.** Each nudge fires at most once per enrollment lifetime.

### Email design system (in progress)
The shared visual shell lives in `src/lib/emails/shell.ts` and exports `emailShell`, `hero`, `section`, `primaryButton`, `secondaryButton`, `eyebrow`, `divider`, `signoff`, `dataFooter`, `ICONS`. Refactor of all 15 templates to use it is **in progress** — `welcome.ts` converted, 14 remaining. When complete: white card on warm off-white outer bg, black copy, ochre `#C4943A` buttons, Georgia serif headlines, inline SVG section icons.

---

## 8. Features (production)

### Daily flow
- Free-flow journaling (text + voice input)
- Emotion chip tagging
- AI journal processing → theme extraction → exercise selection (2–3 per day)
- Coaching questions + pattern challenge per day
- Session summary + tomorrow preview + committed actions
- Day rating (1–5 stars)

### Exercise system
- 27 interactive exercise primitives (CardSort, DialogueSequence, SplitAnnotator, WheelChart, EmotionalArc, NarrativeTriptych, ForceField, HeatmapTracker, BodyMap, SpectrumSlider, ZonedSpectrum, MultiSpectrum, VennOverlap, HierarchicalBranch, BubbleSort, ForcedChoice, DotGrid, StakeholderMap, TimelineRiver, ProgressRiver, WordCloud, EmotionWheel, SaboteurCard, BeforeAfter, PatternTracker, RetrievalCheck, AISimulation)
- 350+ exercises in `frameworks_library`
- Process insight generation per exercise
- Star rating + qualitative feedback per exercise
- 362 exercises with prePopulated data in sandbox catalog

### Goals + reviews
- AI-generated goals from intake + journal (after Day 3)
- Approve/edit goal flow
- Weekly review with AI insights + pattern/language/mood/engagement shifts
- 30-day calendar integrated with 5-row weekly theme view (Apr 7)
- Cross-week shift detection
- Spaced retrieval via curated coaching questions

### Coach
- Coach dashboard
- Invite client by email → accept/revoke
- View client progress, goals, insights, enneagram
- Leave notes that surface in client's next daily Thread

### Lifecycle
- Welcome email + intake on first login
- Daily Tell/Do/Done flow
- Goals at Day 3
- Weekly reviews
- Streak tracking (current + best)
- Re-engagement cadence (4-stage, day 3/6/9/14, no repetition)
- Program completion: final insights + 20% off promo code + share CTA + offramp email
- Close program early: same offramp with `closed_early` Claude prompt branch
- 30-day deletion queue with confirmation email

### Payments
- Sliding scale ($29–$48), standard ($49), pay-it-forward ($50–$69)
- Enneagram add-on ($349)
- Gift purchase flow → 100% off code generation → email to gifter
- Referral codes (20% off for friend, $10 Amazon for referrer after 7 days)
- Personal completion code (20% off for self, single-use)
- Stripe `allow_promotion_codes: true` on all checkout sessions

### Testimonials + critical feedback (Apr 7)
- `/share` page with 3-tab collection (text / social URL / video URL)
- 4 outcome tags (clarity / confidence / hard_conversations / starting_new)
- Moderation: pending → approved/rejected
- Homepage wall hidden until 4+ approved testimonials exist
- Day-26 mirror-write: any journal saved on day 26 also writes to private `feedback_entries`
- Raffle dormant until 20 paying customers

### Quality + monitoring
- User 👎 quality flagging (planned, see open decisions)
- Weekly Claude quality audit (Mon 4pm cron, scores + flags + Bloom level alert)
- AI cost tracking per endpoint, per user (admin dashboard)
- Async API logging
- Sentry error tracking with PII redaction

### Privacy + compliance
- GDPR rights: data export (JSON), deletion request, consent settings
- 26-table deletion coverage including referrals, gift codes, email events
- 30-day grace period on deletion queue
- Crisis detection + resources banner

### Other
- Magic link + Google OAuth + password authentication
- Mobile responsive (mobile-first, parachute nav fixed for mobile)
- Notification preferences (`/my-account` toggles)
- Search across past exercises + journal entries + insights
- Background images per program with stable per-day rotation
- Streak display on dashboard (≥ 2 days)
- Test suite: Vitest, 48 unit tests (parse-ai-response, api-validation, rate-limit)

---

## 9. Voice + visual standards

- **Voice:** warm but not sweet, direct but not cold. First-person ("you"), never about ("the client"). Coach voice, not authority voice — invitation, not diagnosis.
- **Visual:** Anna Charity / Headspace sensibility — warm, calming, intentional. Off-white (`#F5F1E8`) primary, ochre (`#C4943A`) accent, black copy on white in cards. No box shadows on dark cards. All text on authenticated pages is white or `textPrimary`/`textSecondary`.

---

## 10. Docs

| Document | Location |
|---|---|
| Email audit | `docs/email-audit.md` (rewritten Apr 7) |
| Analytics & tracking | `docs/analytics-tracking.md` |
| Customer data + deletion | `docs/customer-data-storage.md` |
| Legal risks | `LEGAL-HANGUPS.md` |
| GDPR rights implementation | `GDPR-RIGHTS-IMPLEMENTATION.md` |
| Test plan | `TEST-PLAN.md` |
| TODO tracker | `TODO-REMAINING.md` |
| This PRD | `PRD-CURRENT-STATE.md` |

---

## 11. Backlog (deferred features)

- Email templates → React Email migration (~1 day; partially obsoleted by the shared shell helper)
- Search → full-text indexes at scale (>100 users)
- Dark/light mode toggle
- i18n
- A/B testing (Statsig)
- CMS (Sanity)
- Staging environment with separate Supabase project
- Mobile native app
- Direct video upload to Supabase Storage (requires Pro plan)
- Featured + 2×2 testimonial wall layout
- `/wall` dedicated testimonial page with outcome tag filters
- NPS survey post-completion (decision pending)
