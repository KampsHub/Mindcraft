# Analytics — GA4 Events & Tracking

Loaded when adding GA events, reading analytics, or analyzing funnels.

## Files in this folder

- **`analytics-events.md`** — source of truth for every GA4 event: user properties, event catalog by feature (auth, onboarding, checkout, exercises, coaching, feedback). Measurement ID: `G-6HTGC2PZMW`.
- **`analytics-tracking.md`** — analytics architecture: GA4, Sentry, data residency, PII redaction, where events fire in code.

## Rules

- **`analytics-events.md` is the single source of truth.** Every new GA event must be added here with: event name, params, trigger location in code, and the question it helps answer.
- **Fire events via `trackEvent()`** (client) or `sendServerEvent()` (server, via GA4 Measurement Protocol). Never call `gtag()` directly.
- **PII never goes in event params.** Use `user_id` (Supabase auth id) for identification; nothing else.
- **Server events need a `ga_client_id`**. Look it up from `program_enrollments.ga_client_id` — persisted on enrollment creation via Stripe session metadata.

## Key events (high-use catalog)

Full catalog in `analytics-events.md`. The ones fired most often:

- `day_started`, `day_completed`, `day_1_completed`, `day_mid_abandon`
- `exercise_started`, `exercise_completed`, `exercise_star_rating`, `exercise_feedback_submitted`
- `journal_entry_started`, `journal_entry_saved`, `journal_processed`, `crisis_detected`
- `{program}_begin_checkout`, `{program}_purchase`, `{program}_checkout_abandoned`
- `enneagram_upsell_view`, `enneagram_upsell_click`, `coaching_upsell_view`, `coaching_upsell_click`
- `session_start`, `dropout_detected`, `second_program_started`

---

Back to root: [CLAUDE.md](../CLAUDE.md) · Implementation: `src/components/GoogleAnalytics.tsx`, `src/lib/ga-measurement-protocol.ts`
