# Customer Data Storage & Deletion — Mindcraft

## Automated Deletion: `DELETE /api/account`

**File**: `src/app/api/account/route.ts`

This endpoint deletes the authenticated user and cascades through Supabase tables + storage.

All of these are tracked automatically — no action needed from Stefanie. To retrieve data:
- **Supabase tables** (`exercise_completions`, `weekly_reviews`, `program_enrollments`): Go to Supabase → Table Editor → select table → filter/export
- **Google Analytics events**: GA4 → Reports → Events → filter by event name
- **Sentry**: sentry.io dashboard (after activation)
### What it deletes automatically:

| Data | Table/Location | Contains |
|------|---------------|----------|
| Journal entries | `entries`, `free_flow_entries` | All journal text, voice transcripts (base64) |
| Daily sessions | `daily_sessions` | Themes, journal input, AI analysis, ratings, feedback |
| Exercise responses | `exercise_completions` | Structured responses, star ratings, feedback |
| Goals | `client_goals` | 6 AI-generated goals from intake |
| Client profile | `client_profiles` | AI-generated coaching profile |
| Assessments | `client_assessments` | Enneagram, MBTI, Leadership Circle results |
| Intake responses | `intake_responses` | Intake questionnaire answers |
| Weekly reviews | `weekly_reviews` | Weekly accountability, NPS scores |
| Shared summaries | `shared_summaries` | Coach-shared summaries (redactable) |
| Enrollments | `program_enrollments` | Program status, current day, assessment data |
| Client record | `clients` | Stripe ID, subscription status, welcome email flag |
| Auth user | `auth.users` | Email, password hash, auth metadata |
| Enneagram docs | Storage: `enneagram-docs/{user_id}/` | Uploaded PDF assessments |

---

## Manual Deletion Required

These are NOT deleted by `/api/account` and must be handled manually:

### Supabase Tables

| Table | Contains | How to delete |
|-------|----------|---------------|
| `api_logs` | Full AI prompts + responses (includes journal text) | SQL: `DELETE FROM api_logs WHERE client_id = '{user_id}'` |
| `quality_flags` | User-submitted quality feedback | SQL: `DELETE FROM quality_flags WHERE client_id = '{user_id}'` |
| `quality_audits` | Weekly AI evaluations (contains enrollment_id) | SQL: `DELETE FROM quality_audits WHERE enrollment_id IN (SELECT id FROM program_enrollments WHERE client_id = '{user_id}')` |
| `email_events` | Email engagement tracking (contains email address) | SQL: `DELETE FROM email_events WHERE user_id = '{user_id}'` |
| `contact_messages` | Contact form submissions | SQL: `DELETE FROM contact_messages WHERE email = '{user_email}'` |
| `waitlist_signups` | Waitlist signups | SQL: `DELETE FROM waitlist_signups WHERE email = '{user_email}'` |

### External Services

| Service | Data stored | How to delete |
|---------|------------|---------------|
| **Stripe** | Customer record, payment history, card tokens | Stripe dashboard → Customers → search by email → Delete |
| **Resend** | Email address, send history, engagement events | Resend dashboard → Contacts → search → Delete |
| **LiveKit** | Voice session recordings | Check LiveKit retention policy; may auto-expire |

### Browser (auto-clears)

| Location | Data | How to delete |
|----------|------|---------------|
| Cookies | Supabase auth tokens (httpOnly, secure) | Browser clear or session expiry |
| localStorage | `cookie-consent` preference | Browser clear |

---

## Complete User Deletion Checklist

1. Call `DELETE /api/account` (authenticated as the user)
2. Delete from `api_logs`: `DELETE FROM api_logs WHERE client_id = '{id}'`
3. Delete from `quality_flags`: `DELETE FROM quality_flags WHERE client_id = '{id}'`
4. Delete from `email_events`: `DELETE FROM email_events WHERE user_id = '{id}'`
5. Delete Stripe customer (dashboard, search by email)
6. Delete from Resend (dashboard, search by email)
7. Check LiveKit for voice recordings

---

## GDPR Gaps to Address

- `api_logs` contains full user context (journal text, exercise responses) with no auto-purge. Consider 30-day retention policy.
- `email_events` stores recipient email addresses. Should be included in `/api/account` deletion.
- `quality_flags` and `quality_audits` should be included in `/api/account` deletion.
- External services (Stripe, Resend, LiveKit) require manual coordination.




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
