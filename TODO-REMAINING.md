# Mindcraft — Todo & Action Tracker
**Last updated:** April 7, 2026

> Three sections only: **what Stefanie needs to do**, **what Claude needs to do**, **decisions still needed**. Everything else lives in PRD-CURRENT-STATE.md or git history.

---

## 🟡 STEFANIE — DO THESE

### Critical (block production / block features)

- [ ] **Add `TREMENDOUS_FUNDING_SOURCE_ID` to Vercel env vars** — Production + Preview. Without it: the referral rewards cron silently no-ops (referrers don't get their $10 Amazon card), and the dormant raffle cron will also fail when activated. Find the ID in Tremendous dashboard → Funding sources. Redeploy with an empty commit after adding.
- [ ] **Fix the `handle_new_user` Supabase trigger** that's blocking Google OAuth signup for new users with `stefanie@allmindsondeck.com` (the Workspace account). Symptom: `/auth/callback?error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user`. Workaround active: signing in with `stefanie.kamps@gmail.com` works because that user already exists. Long-term fix: open Supabase → Database → Triggers → find the trigger on `auth.users`, read the `handle_new_user` function body, fix whatever NULL constraint is failing for new Workspace signups.
- [ ] **Configure Supabase Auth → Emails → SMTP Settings** with Resend so magic-link and password-reset emails go through your verified domain. Host: `smtp.resend.com`, port `465`, username `resend`, password = your `RESEND_API_KEY`, sender `crew@allmindsondeck.com`. Save. Verify by triggering a magic link and confirming a new entry appears in Resend → Emails (not the API Logs tab).
- [ ] **Run the testimonials migration in Supabase** if you haven't already → `supabase/testimonials-and-feedback.sql` (creates `testimonials`, `feedback_entries`, `raffle_periods`, RLS, and inserts 3 seed testimonials). Verified done on April 7 via the deploy. **No action needed unless you're spinning up a new environment.**
- [ ] **Verify the live deploy after the next push.** `gh api repos/KampsHub/Mindcraft/deployments --jq '.[0]'` — check the timestamp is newer than your last push. If the webhook didn't fire, manually redeploy from Vercel dashboard.

### Decisions blocking Claude

- [ ] **Approve the email visual refactor approach** before Claude continues the 14-template rewrite. (Decided: shared shell helper + serif Georgia + inline SVG icons. Refactor paused after `welcome.ts` + `shell.ts` were built. Resume by saying "continue the email refactor".)
- [ ] **Decide whether to refactor all emails to white background** or keep the current dark style. Login page is now redesigned to dark mode. Conflict: emails are mid-rewrite to **white** bg per earlier instruction, but the login page just went **dark**. Pick one direction and tell Claude.
- [ ] **NPS survey** — yes/no/when? Three options on the table:
   1. Build a delayed NPS email that fires 30 days after program completion (one number, branched landing pages by score) — ~2 hours
   2. Add a quick NPS question to `/insights/final` for instant signal (less accurate, faster)
   3. Skip NPS entirely, rely on existing exit survey + testimonial flow
- [ ] **Referee welcome email** — does the person who *receives* a 20% referral discount get a personalized "Jane sent you here, here's your discount" email? Currently no. Decision: build it (~30 min) yes/no. If yes: should the referrer be named explicitly, or kept anonymous?
- [ ] **Should the personal completion code be locked to a single program?** Currently it's an unrestricted Stripe coupon — a parachute alum could use their 20% on enneagram or 1:1 coaching. Lock-down requires adding `applies_to.products` to the Stripe coupon creation in `program-offramp.ts:87-92`. ~5 min.
- [ ] **Should gift codes be locked to a single program?** Same problem, same fix in `webhook/route.ts:115`. Currently a "parachute gift" could be redeemed for any program.
- [ ] **Real seed testimonials.** The 3 hardcoded testimonials from `site.ts` are in the DB as seeds, but the wall hides until a 4th real submission is approved. Decide who to ask first (4-6 real alumni for direct outreach).
- [ ] **Day-26 seed prompt content.** The day-26 mirror-write to `feedback_entries` already fires for ANY journal saved on day 26. But the actual day-26 program content for parachute/jetstream/basecamp is generic. Write a specific "What's not working for you?" prompt and add it to the `program_days` seed for each program.
- [ ] **Re-engage email tone — stay on the new copy?** Three-nudge sequence shipped today:
   - Nudge 1 (day 3): "Just leaving the door open."
   - Nudge 2 (day 6): "You don't have to catch up."
   - Nudge 3 (day 9, "we" voice, no CTA): "Going quiet — your work is safe."
   - Exit survey (day 14): "One short question, then we're done."
- [ ] **Homepage update strategy.** The live homepage at mindcraft.ing was preserved (your call on April 7). All the testimonial wall integration, light-mode redesign, and component dependency changes were reverted. Next iteration: do you want a fresh homepage redesign cycle, or keep iterating on subpages first?

### Light/easy

- [ ] **Tremendous Auto-reload** — set up in Tremendous dashboard once Funding Source ID is in Vercel: Funding → Auto-reload → threshold $20, refill to $50.
- [ ] **GA4 funnel** — Explore → Funnel → steps: page_view (/) → homescreen_program_click → begin_checkout → login_success → day_completed (day 1) → day_completed (day 7).
- [ ] **Privacy policy section 8** — mention `personal_promo_codes` table + 30-day deletion queue behavior.
- [ ] **Find unused frameworks** — `scripts/find-unused-frameworks.sql` returns frameworks never used or rarely used (1-3 completions). Review and either improve `when_to_use` triggers or retire dead ones.
- [ ] **Send test emails to yourself from `/admin/emails`** to QA each of the 15 active templates after the refactor lands. The Send Test button delivers production-fidelity HTML to your admin inbox.

---

## 🤖 CLAUDE — DO NEXT

### In progress (paused mid-work)

- [ ] **Email visual refactor — 14 templates remaining.** Shared shell helper at `src/lib/emails/shell.ts` is built (contains: `emailShell`, `hero`, `section`, `primaryButton`, `secondaryButton`, `eyebrow`, `divider`, `signoff`, `teamSignoff`, `dataFooter`, `stopFooter`, `ICONS`, `EMAIL_COLORS`). Welcome email (`welcome.ts`) is converted as the proof of concept. Still TODO: 14 more templates (re-engage 4, referral-reward 2, gift-code, contact-alert, coaching-application, waitlist-user-confirmation, enneagram-purchase-webhook, quality-audit-report, account-deletion-confirmation) + the offramp template inside `program-offramp.ts`. **Awaiting approval on white-vs-dark direction before resuming** (see open decision above).
- [ ] **Update PRD with full system summary.** Complete rewrite of `PRD-CURRENT-STATE.md` was completed on April 7 — comprehensive sections for data, databases, integrations, features, emails, pages, API routes. Verify it still matches reality before next major change.

### Next session (when Stefanie says go)

- [ ] **Resume email visual refactor** of remaining 14 templates after direction is locked
- [ ] **Build NPS survey flow** (route + cron + email + landing page + DB table) — only if Stefanie says yes
- [ ] **Build referee welcome email** — if Stefanie says yes
- [ ] **Lock gift codes + personal codes to single programs** in Stripe coupon creation — if Stefanie says yes
- [ ] **Wall of love deferred items**: `/wall` dedicated page, featured + 2×2 layout, outcome-tag filter chips
- [ ] **Direct video upload** to Supabase Storage — only after Supabase Pro upgrade
- [ ] **Strip share-button UI** from `/weekly-review` entirely (currently the buttons exist but their handlers are no-ops since the routes were deleted)

### Always-on

- [ ] **Run `npx next build` locally before any push.** Vercel builds fail silently and the old deploy stays live.
- [ ] **After every push, verify the deploy actually triggered.** `gh api repos/KampsHub/Mindcraft/deployments --jq '.[0]'` — check timestamp.
- [ ] **Never claim "deployed" without checking.**

---

## 📋 OPEN DECISIONS

Decisions Stefanie needs to make. Each one blocks at least one Claude task.

| # | Decision | Options | Owner | Blocks |
|---|---|---|---|---|
| 1 | Email background color direction | (a) White bg with black copy + ochre buttons (per April 7 morning instruction) OR (b) Dark bg matching the new login page (per April 7 evening direction) | Stefanie | Email refactor of 14 templates |
| 2 | NPS survey: build, where, when? | (a) Delayed email 30 days post-completion with branching by score, (b) Inline question on `/insights/final`, (c) Skip entirely | Stefanie | NPS infrastructure |
| 3 | Referee welcome email | Yes / No. If yes, name the referrer or stay anonymous. | Stefanie | Referee email build |
| 4 | Lock personal completion codes to single program? | Yes (more restrictive, prevents misuse) / No (more flexible) | Stefanie | Stripe coupon refactor |
| 5 | Lock gift codes to single program? | Yes / No | Stefanie | Stripe coupon refactor |
| 6 | Day-26 critical feedback prompt content | Specific copy for "What's not working?" prompt that surfaces in the daily flow on day 26 | Stefanie | program_days seed update |
| 7 | Real seed testimonials | Decide which 4-6 alumni to ask for direct testimonials so the wall can go live (currently hidden until 4+ approved exist) | Stefanie | Wall activation |
| 8 | Homepage redesign cycle | Keep iterating subpages first, OR do a fresh homepage cycle next | Stefanie | Homepage work plan |
| 9 | Strip share-button UI from /weekly-review entirely? | Current: buttons exist, handlers are no-ops. Cleaner: remove the buttons + their state. | Stefanie | UI cleanup |
| 10 | Email templates → React Email migration | Yes (proper template management with dashboard preview, ~2-3 hours) / No (keep the inline-string + shell helper approach) | Stefanie | Long-term email maintainability |
| 11 | Supabase Pro upgrade ($25/mo) | Needed for direct video uploads to Storage. Currently on Free. | Stefanie | Direct video upload feature |
| 12 | Coach invite email — restore the route's email send? | Currently the route still creates the `coach_clients` DB row but doesn't send an email to the invitee. Should they get an email when a coach adds them? | Stefanie | Coach invite UX |

---

## 🚧 April 7, 2026 — Day-flow redesign follow-through

Everything below is queued from Stefanie's "just such terrible design — fix it" session. The session ended mid-sequence; list is in priority order.

### CRITICAL — currently fabricated / broken
1. **Real Google Calendar Free/Busy integration for `/api/coach/slots`.** Currently the route hardcodes 9am / 12pm / 3pm PT × next 14 weekdays and only excludes rows in `coach_blocked_slots`. Stefanie noticed "this looks fabricated" — it is. Needs OAuth or service-account access to her Google Calendar appointment schedule so the slots reflect her real availability.

### Day-flow rebuild — continuing the redesign
2. **Do section split** — `Learn` (framework teaching) vs `Practice` (exercises). Restructure `DoTab.tsx` so the framework is taught before the exercise, not mashed together.
3. **Every day ≥2 non-journal interactive primitives** — seed-script pass across all 30 days × 3 programs (Parachute, Jetstream, Basecamp). Stefanie: "where are all the interactive exercises we have seen before? These are ALL journal related and it's no fun. Make sure that you include at least two interactive exercises."
4. **AUDIO RIP sweep beyond TellTab** — `DoTab.tsx`, `weekly-review`, `monthly-summary`, anywhere `VoiceToText` / `SpeechRecognition` / `GuidedExerciseFlow` / "talk to your coach" / "walk through these" still exists. Stefanie 3:39 PM: "REMOVE ANY FORM OF AUDIO."

### Voice + content integrity
5. **N3 — hedged-voice systemic fix.** Strengthen `src/app/api/process-journal/route.ts` system prompt with explicit wrong/right examples AND add a post-processor guard that rejects or rewrites declarative neuroscience claims. Stefanie: "we talked about this before" — prompt-only enforcement has now failed twice, needs a guard.
6. **N4 — Inner Critic Dialogue → `dialogueSequence` primitive.** Currently rendered as a `guided` single-textarea exercise. Update the seed data in `scripts/seed-parachute-program.ts` (and the jetstream/basecamp equivalents if they share the exercise).
7. **N1 — ship the parked `ExerciseCard.tsx` edit** removing the binary "Was this exercise useful? Yes / Not for me" prompt. The in-flight edit was made in an earlier session; check `git status` or re-do it.
8. **N6 — italic AI insight typography sweep beyond DoneTab.** Grep for `fontStyle: "italic"` across `src/` — anywhere AI-generated output is rendered it should be `textPrimary`, normal weight, same size as body copy.

### Bigger ideas Stefanie greenlit (schema + multi-file work)
9. **BIG IDEA A — Journal that remembers.** Turn the AI journal loop from stateless into continuity-aware.
   - New table `user_memory(user_id, type, content, source_day, source_kind, last_referenced_at, active)` — `type` is `'pattern' | 'commitment' | 'saboteur' | 'value' | 'turning_point'`.
   - Migration SQL file in `supabase/`.
   - Backfill script that walks every existing journal + exercise completion and seeds memory rows.
   - `/api/process-journal` rewrite: fetch top 8 memory rows (active + recent + type-diverse) via SQL, inject into prompt as "here's what you already know about this person," parse a `memory_update` JSON block from the Claude response, write new rows + mark resolved.
   - System prompt rewrite: continuity-first, must reference at least one memory row if genuinely relevant, hedged voice enforced.
   - Voice integration failure Stefanie called out ("the voice feels generic") is downstream of this — the AI has no memory of who it's talking to. Fixing this fixes voice.
10. **BIG IDEA B — Coach inbox (opt-in, written-only).** Give Stefanie structural presence in the product without violating data-sharing.
    - Schema: `journal_entries.shared_with_coach` boolean + new `coach_replies` table.
    - "Share this with Stefanie" button on every journal entry + insight, with consent copy. NEW written-only surface — do NOT bolt onto the existing (now-removed) voice CTA.
    - Crisis-triggered share prompt: when `urgency_level === "high"` the user sees a card offering one-tap consent to share with Stefanie, 24h reply window.
    - `/admin/coach-inbox` page that lists shared entries, lets Stefanie write a 2–3 sentence reply inline.
    - Email notification to Stefanie when a new item hits the queue.
    - Display coach reply attached to the original entry in the user app.
    - Pricing hook: bundle 2 free shares per program as the upsell path into paid coaching.
11. **BIG IDEA C — Final Insights as 4-section progress report.** Replace the current generic AI summary on Day 30 with a structured document built from the user's own data.
    - Section 1: "Saboteurs that ran me + which lost ground" — uses `user_memory` + journal frequency scan across weeks 1–4.
    - Section 2: "Values under pressure" — Day 14 ranks vs later journal decision moments, AI maps which values got honored vs compromised.
    - Section 3: "One phrase that captures what shifted" — AI picks the user's own words from the entry with most movement (first vs last journal). Editable — user can pick a different phrase.
    - Section 4: "Commitments tracking" — `living` / `drifting` / `let go` statuses pulled from `user_memory` where `type = 'commitment'`.
    - Header: 4.a #2 — "Did this program deliver what you originally wanted?" Yes / Partially / No, tied to the Day-1 goal answer.
    - PDF export via `react-pdf` or print stylesheet. This is the artifact users take to therapy / coaching / their next job.
12. **4.a #3** — Add `program_outcome_self_reported` column on `program_enrollments` (enum: `achieved` / `partially` / `not_achieved` / `no_response`). Capture the user's answer to the Day-30 question. This becomes the gold-standard success metric in GA4 alongside `program_completed`.

### Schema migrations needed (not yet written or not yet run)
- `supabase/coach-availability.sql` — **written, needs to be run in Supabase SQL Editor.** Creates `coach_blocked_slots` for Stefanie to mark dates she's unavailable.
- `supabase/user-memory.sql` — **not yet written.** For BIG IDEA A.
- `supabase/coach-inbox.sql` — **not yet written.** For BIG IDEA B (`journal_entries.shared_with_coach` column + `coach_replies` table).
- `supabase/program-outcome-self-reported.sql` — **not yet written.** For 4.a #3.

### Context notes for next Claude
- Stefanie wants speed. Don't ask clarifying questions unless truly blocked; ship, iterate, let her react.
- Audio is permanently gone. Do not re-introduce any voice / walk-through / LiveKit / SpeechRecognition surface anywhere, under any framing.
- When the AI generates text, it MUST use hedged language ("this may help," "it sounds like," "one way to read it"), not declarative ("this activates," "this is why"). See CLAUDE.md voice rule.
- Every exercise must produce an artifact the user can revisit, not just a reflection. See CLAUDE.md exercise content rules.
- Dashboard slot picker (`/api/coach/slots`) is fabricated — flag this in every conversation where it comes up until the real Google Calendar integration ships.
