# Email Audit — Mindcraft

**Last updated:** April 7, 2026 — regenerated from actual code.

## Provider
**Resend** (`RESEND_API_KEY`). No external templates. All email HTML is inlined inside the API route (or lib file) that sends it. To edit copy, open the file and edit the string.

## Sender domains
- `stefanie@allmindsondeck.com` — founder voice (welcome, coach notes, applications)
- `crew@allmindsondeck.com` — team/internal + lifecycle events (gift codes, account deletion, raffle, offramp)
- `noreply@allmindsondeck.org` — transactional triggers (daily reminder, day complete, shares, contact, referral rewards, coach invite, quality audit)

## Dashboard

Log in to Resend → **Emails → Logs** for per-message delivery history, opens, clicks, bounces. There is **no Templates tab for Mindcraft** — templates are not stored on Resend. The Resend dashboard only has a Templates feature for Broadcasts (marketing lists), which Mindcraft does not use.

## How to preview / edit / send a test

- **Preview in your inbox:** visit `/admin/emails` (admin-only, allowlist in the page) and click "Send test to me" on any email row.
- **Edit:** click the file path on the admin page to open the file in VS Code, or open the route file listed in the table below.
- **Preview a past send:** Resend → Emails → Logs → click any row → "View HTML".

---

## Complete list (20 emails)

### User-facing / lifecycle

| Key | Subject | From | File | Trigger |
|---|---|---|---|---|
| `welcome` | Welcome to Mindcraft | stefanie@ | `src/app/api/welcome-email/route.ts` | First login/signup |
| `daily-reminder` | Day {N} is ready | noreply@ | `src/app/api/email/daily-reminder/route.ts` | Cron daily 2pm PT |
| `day-complete` | Day {N} Complete — {program} | noreply@ | `src/app/api/email/day-complete/route.ts` | User completes a day |
| `program-complete` | You finished {program}. | stefanie@ | `src/app/api/email/program-complete/route.ts` | User finishes 30 days (legacy path — kept in sync with `program-offramp`) |
| `program-offramp` | You finished / You closed {program}. | crew@ | `src/lib/program-offramp.ts` | Primary offramp called by `/api/cron/check-completions` + user-initiated `/api/enrollment/close-early` |
| `coach-notes` | A note from your coach — {program} | stefanie@ | `src/app/api/email/coach-notes/route.ts` | Coach leaves a note |
| `re-engage-nudge` | "Day {N} is waiting" / "Your program is still here" / "Checking in — one more nudge" (rotating) | noreply@ | `src/app/api/email/re-engage/route.ts` | Cron daily 3pm PT, up to 3 per enrollment |
| `re-engage-exit-survey` | Quick question before you go | crew@ | `src/app/api/email/re-engage/route.ts` (second code path) | After 3 nudges + 7 days inactive |

### Sharing (user-initiated)

| Key | Subject | From | File |
|---|---|---|---|
| `daily-summary-share` | {program} — {N} Day(s) of Insights | noreply@ | `src/app/api/daily-summary/share/route.ts` |
| `weekly-summary-share` | Mindcraft — Week {N} Summary | noreply@ | `src/app/api/weekly-summary/share/route.ts` |
| `weekly-insights-share` | Mindcraft — Week {N} Insights | noreply@ | `src/app/api/weekly-insights/share/route.ts` |
| `exercise-share` | Mindcraft — {framework} (Week {N}) | noreply@ | `src/app/api/exercises/share/route.ts` |

### Referrals, gifts, raffle

| Key | Subject | From | File |
|---|---|---|---|
| `referral-reward-recipient` | Your $10 Amazon gift card is on its way | noreply@ | `src/app/api/referral-rewards/route.ts` |
| `referral-reward-admin` | Referral reward sent — {email} | noreply@ | `src/app/api/referral-rewards/route.ts` (second send in same cron) |
| `gift-code` | Your Mindcraft gift code is ready | crew@ | `src/app/api/webhook/route.ts` |
| `raffle-drawing-admin` | Raffle drawn — winner {name} | crew@ | `src/app/api/cron/draw-raffle/route.ts` (dormant until 20-customer trigger) |

### Admin / team alerts

| Key | Subject | From | File |
|---|---|---|---|
| `contact-alert` | Mindcraft Contact: {type} | noreply@ | `src/app/api/contact/route.ts` |
| `coaching-application` | Coaching Application — {name} | stefanie@ | `src/app/api/apply/route.ts` |
| `waitlist-team-alert` | Waitlist signup: {program} | crew@ | `src/app/api/waitlist/route.ts` (first send) |
| `waitlist-user-confirmation` | You're on the list — {program} | crew@ | `src/app/api/waitlist/route.ts` (second send) |
| `enneagram-purchase-webhook` | 🎯 New Enneagram Purchase — {email} | crew@ | `src/app/api/webhook/route.ts` (Stripe webhook branch) |
| `enneagram-purchase-notify` | New Enneagram Purchase | crew@ | `src/app/api/enneagram-notify/route.ts` |
| `quality-audit-report` | Weekly Quality Audit — {score}/30 avg | noreply@ | `src/app/api/quality-audit/route.ts` |
| `coach-invite` | A coach wants to follow your progress | noreply@ | `src/app/api/coach/invite/route.ts` |
| `account-deletion-confirmation` | Your Mindcraft data has been deleted | crew@ | `src/app/api/cron/process-deletions/route.ts` |

**Total: 25 distinct email sends across 21 files.** Some files send multiple emails (waitlist sends two, referral rewards sends two, re-engage sends two via different branches, webhook sends two via different Stripe event types).

---

## Cron schedule (`vercel.json`)

| Cron | Schedule | Route | Emails sent |
|---|---|---|---|
| Daily reminder | `0 14 * * *` (2pm PT) | `/api/email/daily-reminder` | 1 per eligible enrollment |
| Re-engage check | `0 15 * * *` (3pm PT) | `/api/email/re-engage` | nudges + exit survey |
| Referral rewards | `0 13 * * *` (1pm PT) | `/api/referral-rewards` | reward + admin per eligible redemption |
| Check completions | `17 14 * * *` (2:17pm PT) | `/api/cron/check-completions` | calls `runOfframp()` in `program-offramp.ts` |
| Process deletions | `23 3 * * *` (3:23am PT) | `/api/cron/process-deletions` | account deletion confirmation |
| Quality audit | `0 16 * * 1` (Mon 4pm PT) | `/api/quality-audit` | weekly audit report |
| **Draw raffle (DORMANT)** | not registered | `/api/cron/draw-raffle` | admin drawing notification |

All cron endpoints require `Authorization: Bearer {CRON_SECRET}`.

## Event tracking

Resend webhooks write to `email_events` table via `/api/resend-webhook/route.ts`. Events: sent, delivered, opened, clicked, bounced, complained, delivery_delayed. The admin page reads this table to show delivery stats per email key.

## Supabase Auth emails

Signup confirmation, password reset, and magic link emails are sent by Supabase directly — not through Resend. Customize in the Supabase dashboard → Authentication → Email Templates.
