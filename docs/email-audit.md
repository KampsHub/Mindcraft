# Email Audit — Mindcraft

## Email Provider
**Resend** (v6.9.3) via `RESEND_API_KEY`

### Domains
- `stefanie@allmindsondeck.com` — founder/personal emails
- `crew@allmindsondeck.com` — team alerts
- `noreply@allmindsondeck.org` — transactional/automated

---

## User-Facing Emails

| Email | File | Trigger | From |
|-------|------|---------|------|
| **Welcome** | `api/welcome-email/route.ts` | First login/signup | stefanie@ |
| **Daily Reminder** | `api/email/daily-reminder/route.ts` | Cron daily 2 PM PT | noreply@ |
| **Day Complete** | `api/email/day-complete/route.ts` | User completes a day | noreply@ |
| **Program Complete** | `api/email/program-complete/route.ts` | User finishes 30 days | stefanie@ |
| **Coach Notes** | `api/email/coach-notes/route.ts` | Coach leaves a note | stefanie@ |

## Inactive Reminders & Churn

| Email | File | Trigger | From |
|-------|------|---------|------|
| **Inactive Reminder** (2+ days inactive) | `api/email/re-engage/route.ts` | Cron daily 3 PM PT | noreply@ |
| **Exit Survey** (after 3 reminders + 7+ days) | `api/email/re-engage/route.ts` | Same cron, different path | crew@ |

- **2-day threshold**: Sends after 2 days of no sessions
- **Max 3 reminders** per enrollment, then stops
- **Exit survey**: Sent once after all 3 reminders AND 7+ days inactive
- **Cooldown**: 2-day between emails per enrollment
- **Subjects rotate**: "Day X is waiting" → "Your program is still here" → "Checking in — one more nudge"
- Exit survey links to `EXIT_SURVEY_URL` env var or `/feedback/exit`
- Program complete includes testimonial survey link (`TESTIMONIAL_SURVEY_URL` or `/feedback/testimonial`)
- **Schema requirement**: Run `supabase/extend-email-events.sql` to add `user_id`, `enrollment_id` columns

## User-Initiated Sharing

| Email | File | From |
|-------|------|------|
| **Daily Summary Share** | `api/daily-summary/share/route.ts` | noreply@ |
| **Weekly Summary Share** | `api/weekly-summary/share/route.ts` | noreply@ |
| **Exercise Share** | `api/exercises/share/route.ts` | noreply@ |
| **Weekly Insights Share** | `api/weekly-insights/share/route.ts` | noreply@ |

## Admin/Internal

| Email | File | Trigger | From |
|-------|------|---------|------|
| **Contact Form Alert** | `api/contact/route.ts` | Public form submission | noreply@ |
| **Coaching Application** | `api/apply/route.ts` | Application form | stefanie@ |
| **Waitlist Signup** (to team + user) | `api/waitlist/route.ts` | Waitlist form | crew@ |
| **Enneagram Purchase** | `api/webhook/route.ts` | Stripe webhook | crew@ |
| **Quality Audit Report** | `api/quality-audit/route.ts` | Cron Monday 4 PM PT | noreply@ |

## Cron Schedule (vercel.json)

| Job | Schedule | Route |
|-----|----------|-------|
| Daily Reminder | `0 14 * * *` (2 PM PT) | `/api/email/daily-reminder` |
| Re-Engage Check | `0 15 * * *` (3 PM PT) | `/api/email/re-engage` |
| Quality Audit | `0 16 * * 1` (Mon 4 PM PT) | `/api/quality-audit` |

All cron endpoints require `Authorization: Bearer {CRON_SECRET}`.

## Email Event Tracking

Resend webhooks tracked in `email_events` table via `api/resend-webhook/route.ts`:
- sent, delivered, opened, clicked, bounced, complained, delivery_delayed

## Supabase Auth Emails

Supabase handles auth emails directly (signup confirmation, password reset, magic link). Not routed through Resend. Customize via Supabase dashboard.
