---
type: dashboard
tags:
  - work
  - mindcraft
  - analytics
---
# Mindcraft — Weekly Qualitative Review

> [!info] Wired up 2026-04-07
> All links below are live for:
> - Supabase project: `rmdjglepocaswpplwgik`
> - Vercel team: `stefaniekamps-2453s-projects`

> [!warning] Prerequisites
> Run `supabase/qualitative-data-tables.sql` in Supabase SQL Editor before any of the new tables work. Until you do, `/api/exit-survey`, `/api/testimonial-survey`, and `/api/assessment` will fail and `/api/apply` will silently skip the persist step.

Companion spreadsheet: [[mindcraft_funnel_tracker.xlsx]] (see "Qualitative Sources" tab)

---

## 🟢 Each Monday — 30 minute review

Walk through the sources below in order. Skim every new row, log surprising patterns in the "This week's notes" section at the bottom, and act on anything that needs action.

### 1. Coaching applications — review and triage

[Open coaching_applications →](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/editor?table=coaching_applications&sort=created_at.desc)

- Filter `status = new`
- Read each application end-to-end
- Mark each as `reviewing` / `qualified` / `declined` / `converted` and add a brief `reviewer_notes`

### 2. Exit surveys — what's making people leave?

[Open exit_surveys →](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/editor?table=exit_surveys&sort=created_at.desc)

- Read every new row
- Tag the most common reasons (the `reason` column is canonical)
- Pay extra attention to `comeback_text` — that's where the actionable signal lives
- Cross-reference `current_day` — is there a specific day where people drop out?

### 3. Testimonial surveys — promote the good ones

[Open testimonial_surveys →](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/editor?table=testimonial_surveys&sort=created_at.desc)

- For rows where `permission_given = true`, decide which to promote to the public testimonials wall
- To promote: copy the `describe_text` or `changed_text` into the `testimonials` table with `status='approved'`
- Update the `promoted_to_id` on the survey row so you don't re-promote it

### 4. Assessment quiz — what are people scoring?

[Open assessment_responses →](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/editor?table=assessment_responses&sort=created_at.desc)

- Look at `avg_score` distribution — are scores trending lower (more disrupted users)?
- Look at `top_disruptions` — which 3 disruptions show up most often? That's your messaging signal.
- Compare anonymous quizzes (`email IS NULL`) vs email-captured ones — does the email-capture rate vary by score?

### 5. Quality flags — is the AI broken anywhere?

[Open quality_flags →](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/editor?table=quality_flags&sort=created_at.desc)

- Group by `output_type` — which types of AI output are getting flagged most?
- Group by `framework_name` — are specific exercises repeatedly flagged?
- Read every `user_comment` — those are the most actionable

### 6. Weekly review reflections + NPS

[Open weekly_reviews →](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/editor?table=weekly_reviews&sort=created_at.desc)

- Read every new `reflection` and `plan_adjustments`
- Average this week's `nps_score`
- Look for users who rated low this week — do they need outreach?

### 7. Daily journal feedback — quick skim

[Open daily_sessions →](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/editor?table=daily_sessions&sort=completed_at.desc)

- Filter to where `day_feedback IS NOT NULL`
- Read freeform feedback — patterns?
- Note: full journal text in `step_2_journal` is a lot — only dive in if a specific signal points there

### 8. Exercise quality — lowest-rated first

[Open exercise_completions →](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/editor?table=exercise_completions&sort=star_rating.asc)

- Sort by `star_rating` ascending
- Read the `feedback` column for low-rated exercises
- If the same `framework_name` keeps appearing in low ratings, that exercise needs redesign

### 9. Crisis events — safety check

In GA4: filter events to `crisis_detected` in the last 7 days. If any → open the corresponding `daily_sessions` row in Supabase to see what was written. This is rare but important to never miss.

---

## 🔴 Error dashboards (Vercel + Supabase)

### Vercel — server errors and deploys

- [All function logs (errors)](https://vercel.com/stefaniekamps-2453s-projects/mindcraft/logs?status=error) — Stripe webhook failures, AI API failures, cron failures
- [All deployments](https://vercel.com/stefaniekamps-2453s-projects/mindcraft/deployments) — verify each push deployed successfully
- [Cron jobs](https://vercel.com/stefaniekamps-2453s-projects/mindcraft/settings/cron-jobs) — confirm dropout-detection ran nightly
- ⚠️ Hobby plan retains logs for 24h only. Pro plan keeps 7 days. For longer retention, consider Sentry.

### Supabase — DB and auth errors

- [Postgres logs](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/logs/postgres-logs)
- [Auth logs](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/logs/auth-logs) — signup failures, OAuth callbacks, magic link delivery (this is the source of truth for "is Google Auth working today?")
- [PostgREST API logs](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/logs/postgrest-logs)
- [Edge function logs](https://supabase.com/dashboard/project/rmdjglepocaswpplwgik/logs/edge-functions)

### GA4 — silent failure events I instrumented

The following events fire automatically when something breaks. Filter GA4 events to any of these in the last 7 days:

| Event | Means |
|---|---|
| `auth_google_failed` | Google sign-in broken for at least one user |
| `auth_magic_link_failed` | Magic link send broken |
| `auth_signup_failed` | Account creation post-payment broken |
| `auth_signin_failed` | Login broken |
| `enrollment_creation_failed` | Paid user with no account — **critical, needs manual fix** |
| `payment_verification_failed` | Welcome page can't confirm a paid Stripe session |
| `*_checkout_error` | Stripe session creation failing |
| `stripe_webhook_error` | Webhook can't process incoming events |
| `ai_generation_failed` | Claude API failing |
| `crisis_detected` | User wrote something flagged as high-urgency |
| `error_boundary_caught` | Silent React error |
| `rate_limit_hit` | User hitting rate limit |

A weekly habit: open GA4 → Reports → Realtime, scroll to the events list, eyeball any `*_failed` or `*_error` event names. If they have non-zero counts, dig into the details.

---

## 📝 This week's notes

> Use this section to log patterns you spotted during the review. Date each entry. Roll forward to a new Notes section each week — keep the last 4 weeks visible, archive older ones below.

### Week of YYYY-MM-DD

- **Apps:**
- **Exits:**
- **Assessment trends:**
- **Quality flags:**
- **NPS this week:**
- **Errors found:**
- **Action items:**

---

## 📦 Archive

(Move old weekly notes here to keep the active section clean.)
