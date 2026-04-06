# Email Audit — Mindcraft

## Email Provider
**Resend** (v6.9.3) via `RESEND_API_KEY`

### Domains
- `stefanie@allmindsondeck.com` — founder/personal emails
- `crew@allmindsondeck.com` — team alerts
- `noreply@allmindsondeck.org` — transactional/automated

---

## User-Facing Emails

| Email                | File                                  | Trigger               | From      |
| -------------------- | ------------------------------------- | --------------------- | --------- |
| **Welcome**          | `api/welcome-email/route.ts`          | First login/signup    | stefanie@ |
| **Daily Reminder**   | `api/email/daily-reminder/route.ts`   | Cron daily 2 PM PT    | noreply@  |
| **Day Complete**     | `api/email/day-complete/route.ts`     | User completes a day  | noreply@  |
| **Program Complete** | `api/email/program-complete/route.ts` | User finishes 30 days | stefanie@ |
| **Coach Notes**      | `api/email/coach-notes/route.ts`      | Coach leaves a note   | stefanie@ |

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

---

## Where the copy lives

All email templates are **inline HTML inside each API route file**. There is no external email template service, no CMS, no Resend template editor. To change email copy, edit the route file directly.

---

## Email Copy (all user-facing emails)

### Welcome Email
**Subject:** Welcome to Mindcraft
**From:** stefanie@

> Hello and Welcome.
>
> I'm glad you're here.
>
> Mindcraft was built from real coaching experience — the kind of tools I wished existed when I needed them most. Over the next 30 days, you'll journal, work through exercises designed by certified coaches, and start seeing your own patterns more clearly.
>
> If you have questions at any point, there's a Contact button right on your dashboard. I read every message personally.
>
> Wishing you the best on this journey.
>
> **Stefanie Kamps**

---

### Daily Reminder
**Subject:** Day [X] is ready
**From:** noreply@

> Your Day [X] session is ready.
>
> [Button: Start session]
>
> Reply STOP to opt out of reminders.

---

### Day Complete
**Subject:** Day [X] Complete — [program name]
**From:** noreply@

> Day [X] is done.
>
> Today's Themes: [list]
> Summary: [first 3 sentences]
> Exercises Completed: [count]
>
> Tomorrow's Territory: [next day title]
>
> [Button: Start Day [X+1]]

---

### Program Complete
**Subject:** You finished [program name].
**From:** stefanie@

> 30 days. Done.
>
> [Stats: Journal Entries | Exercises | Coaching Questions]
>
> Your Active Goals: [list]
>
> What You Can Do Next:
> - Download your exercise guide
> - Share your insights
> - Book a 1:1 coaching session
>
> Would you share your experience? Two quick questions. Takes 30 seconds.
>
> [Button: Share feedback]
>
> This program was designed to end. The tools are yours now.
>
> — Stefanie

---

### Coach Notes
**Subject:** A note from your coach — [program name]
**From:** stefanie@

> Your coach left you a note.
>
> "[note preview, max 200 chars]"
>
> [Button: Read the Full Note]
>
> Your coach reviews your progress periodically and may share observations to support your journey.

---

### Inactive Reminder (sent up to 3 times)
**Subjects rotate:**
1. "Day [X] is waiting"
2. "Your program is still here"
3. "Checking in — one more nudge"

**From:** noreply@

> You were on Day [X]. [Your last entry touched on [theme]. / You were making real progress.]
>
> The program doesn't judge gaps. Pick up where you left off.
>
> [Button: Continue Day [X]]
>
> Reply STOP to opt out of check-ins.

---

### Exit Survey (after 3 reminders + 7 days)
**Subject:** Quick question before you go
**From:** crew@

> It looks like you stepped away from [program name].
>
> No judgment — life happens. But your feedback would genuinely help us make this better for the next person.
>
> Two questions, takes 30 seconds:
>
> [Button: Share quick feedback]
>
> Your program is still here if you want to come back. [Continue Day X →]
>
> Reply STOP to opt out of check-ins.

---

### Waitlist Confirmation
**Subject:** You're on the list — [program]
**From:** crew@

> You're on the waitlist.
>
> We'll let you know as soon as the [program] program is ready. No spam, just one email when it launches.
>
> — The Mindcraft team
