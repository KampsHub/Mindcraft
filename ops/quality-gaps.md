# Quality System — Gap Analysis

> What's working, what's missing, and what to build next.

---

## ✅ What You Have

### Voice & Tone (Strong)
- Detailed voice guide with 5 rules, 8 principles, and explicit "never say" list
- Consistent across all 10+ system prompts
- Voice integrity rules preventing misattribution
- Safety protocol with crisis detection

### User Feedback (Phase 1 — Live)
- FlagButton on all AI outputs (6 reasons, 9 output types)
- Star ratings on exercises and days
- Written feedback field on day completion

### Coach Dashboard (Phase 2 — Live)
- Aggregated analytics (GDPR compliant)
- Payment funnel, enrollment status, day completion rates
- Step drop-off analysis, rating distributions, quality flags
- Low-rated exercise detection

### Framework Library
- 250+ exercises with proper attribution
- Modality tagging, difficulty levels, target packages
- when_to_use signals for matching to journal content

---

## 🟡 Gaps — High Priority

### 1. No Automated Quality Monitoring
**Problem:** Quality flags only appear when a user manually reports something. Most users won't flag — they'll just disengage.
**Fix:** Phase 3 automated audit. Weekly cron job samples recent outputs, evaluates against the style guide checklist, emails you a report.
**Effort:** Medium. Eval harness (`scripts/eval-outputs.ts`) already exists as skeleton.

### 2. No Email Engagement Tracking
**Problem:** Dashboard shows "welcome emails sent: 0" but can't track opens or clicks.
**Fix:** Wire up Resend webhooks for open/click/bounce events. Store in a lightweight `email_events` table.
**Effort:** Small. Resend supports webhooks natively.

### 3. No Page View / Session Analytics
**Problem:** Can't see visitor → signup conversion, which pages people visit, or time-on-page.
**Fix:** Add Vercel Analytics (one import) or a lightweight custom event table.
**Effort:** Tiny for Vercel Analytics. Medium for custom.

### 4. No Churn/Drop-off Alerts
**Problem:** If someone stops after Day 3, nobody knows until you check the dashboard manually.
**Fix:** Scheduled check — if a user hasn't logged in for 3+ days during active enrollment, flag it. Could trigger a re-engagement email or dashboard alert.
**Effort:** Small. Data already exists in `daily_sessions`.

### 5. No A/B Testing of Exercise Effectiveness
**Problem:** "Saboteur Identification" got low-rated, but you can't tell if it's the exercise itself, the framing, or the timing.
**Fix:** Track which exercises get high ratings for which Enneagram types / themes. Over time, personalise selection based on what works for similar profiles.
**Effort:** Medium-large. Needs data accumulation first.

---

## 🟠 Gaps — Medium Priority

### 6. No Tone Drift Detection
**Problem:** System prompts define the voice, but nothing checks if the AI drifts over time (e.g., becoming more generic as context windows fill up, or hedging more on later days).
**Fix:** Automated audit (Phase 3) with specific checks: count hedging phrases, check for banned words, verify client-specific references exist.
**Effort:** Medium. Part of Phase 3.

### 7. No Framework Attribution Verification
**Problem:** The style guide requires proper attribution (especially BEabove Leadership), but nothing verifies it's happening.
**Fix:** Regex check in automated audit for framework names without attribution.
**Effort:** Small.

### 8. No Exercise Repetition Tracking on Dashboard
**Problem:** System prevents repeating exercises within 3 days, but you can't see what someone's overall exercise mix looks like across 30 days.
**Fix:** Add "exercise diversity" metric to analytics — how many unique frameworks used vs. available.
**Effort:** Small. Data exists in `exercise_completions`.

### 9. No Client Journey Visualisation
**Problem:** You know "furthest day reached = 4" but can't see the shape of the journey — did they do Days 1-4 in sequence or skip around? Where did they pause?
**Fix:** Add a simple day-by-day heatmap or timeline to the dashboard (aggregated across all clients).
**Effort:** Medium.

### 10. No Voice Integrity Violation Detection
**Problem:** Voice integrity (don't attribute AI analysis to the client) is a critical rule but is only enforced by the system prompt. If the AI violates it, nobody catches it automatically.
**Fix:** Automated check in Phase 3: scan outputs for patterns like "You said [AI-generated phrase]" where the phrase doesn't appear in the journal entry.
**Effort:** Medium-large. Needs cross-referencing journal input vs. AI output.

---

## ⚪ Gaps — Nice to Have

### 11. No Sentiment Tracking Over Time
**Problem:** You can see themes and patterns, but no quantified emotional trajectory across the 30 days.
**Note:** Could feel clinical — may conflict with voice philosophy. Consider carefully.

### 12. No Coach Override / Annotation System
**Problem:** When you spot something in the dashboard, there's no way to inject a coaching note that the AI picks up next session (e.g., "push harder on boundary work this week").
**Fix:** Add a `coach_notes` field that gets included in the system prompt context.
**Effort:** Small.

### 13. No Comparative Analytics Across Cohorts
**Problem:** With one active program, not critical. But as you scale, you'll want to compare completion rates, ratings, and patterns across different client groups.
**Effort:** Medium. Needs enough data first.

### 14. No Export / Reporting
**Problem:** Dashboard data lives only in the browser. No way to export a PDF report for your own records or business review.
**Effort:** Medium.

---

## Recommended Build Order

1. **Phase 3: Automated Weekly Audit** — biggest quality impact, eval harness already exists
2. **Email engagement tracking** — quick Resend webhook setup
3. **Churn/drop-off alerts** — data exists, just needs a scheduled check
4. **Coach override/annotation** — small effort, high coaching value
5. **Vercel Analytics** — one-line add for page views
6. Everything else as data accumulates
