# Analytics events catalog

Source of truth for every GA4 event fired by Mindcraft. Update this file whenever
you add, rename, or change an event. GA4 admin (custom definitions, reports,
audiences) should mirror this list.

**GA4 Measurement ID:** `G-6HTGC2PZMW`
**Server-side events:** fired via `sendServerEvent` in `src/lib/ga-measurement-protocol.ts`
**Client-side events:** fired via `trackEvent` in `src/components/GoogleAnalytics.tsx`

---

## User properties (set on every authenticated `session_start`)

Set via `setUserProperties` in `AnalyticsSessionBoundary.tsx`. Use these for
GA4 audiences and segmentation.

| Property | Type | Source |
|---|---|---|
| `user_id` (config param) | string | Supabase `auth.uid()` |
| `current_program` | string | `enrollment.programs.slug` \| `"none"` |
| `enrollment_status` | string | `pre_start` \| `onboarding` \| `awaiting_goals` \| `active` \| `completed` \| `closed_early` \| `paused` \| `lapsed` |
| `days_since_purchase` | number | `now - enrollment.started_at` |
| `days_since_last_activity` | number | `now - enrollment.last_active_at` |
| `highest_day_reached` | number | `enrollment.current_day` |
| `programs_completed_count` | number | count of enrollments with `status = completed` |
| `has_had_3d_gap` | boolean | `enrollment.had_3d_gap` |
| `has_had_7d_gap` | boolean | `enrollment.had_7d_gap` |
| `program_cohort` | string | ISO week of `started_at` (e.g. `"2026-W14"`) |

---

## Events by category

### A. Homepage & marketing pages

| Event | Source | Params |
|---|---|---|
| `homescreen_view` | `src/app/page.tsx` page mount | — |
| `homescreen_scroll_depth` | `ScrollDepth` on homepage | `depth` (25/50/75/100) |
| `homescreen_program_card_view` | Each program card enters viewport | `program` |
| `homescreen_program_click` | Click program card | `program` |
| `program_compare` | User clicks into 2+ program cards in same session | `programs`, `count` |
| `layoff_page_view` | Parachute page mount | — |
| `layoff_hero_cta_click` | Parachute hero CTA | — |
| `layoff_scroll_depth` | Parachute ScrollDepth | `depth`, `program` |
| `layoff_section_view` | Each major Parachute section enters viewport | `section`, `program` |
| `layoff_pricing_reached` | Pricing section enters viewport | `program` |
| `layoff_faq_expand` | Click FAQ item | `topic`, `question_index`, `question` |
| `layoff_pay_what_you_can_price_click` | Click PWYC tier pill | `tier`, `price` |
| `layoff_standard_price_click` | Click Standard tier pill | `tier`, `price` |
| `layoff_pay_it_forward_price_click` | Click PIF tier pill | `tier`, `price` |
| `layoff_pay_what_you_can_slider_amount` | Slider release | `amount` |
| `layoff_pay_it_forward_slider_amount` | Slider release | `amount` |
| `parachute_pay_what_you_can_begin_checkout` | Click checkout (PWYC) | `tier`, `price` |
| `parachute_standard_begin_checkout` | Click checkout (Standard) | `tier`, `price` |
| `parachute_pay_it_forward_begin_checkout` | Click checkout (PIF) | `tier`, `price` |
| `begin_checkout` | Fires alongside every parachute/jetstream/basecamp checkout | `package`, `tier`, `price` |
| `layoff_checkout_error` | Stripe session creation fails (client or server) | `tier`, `error_message` |
| `layoff_checkout_abandoned` | Stripe `checkout.session.expired` (server) | `program`, `tier`, `amount`, `session_id` |
| `layoff_checkout_failed` | Stripe async_payment_failed (server) | `program`, `tier`, `session_id` |
| `layoff_purchase_webhook` | Stripe `checkout.session.completed` (server backup) | `program`, `tier`, `amount`, `currency`, `session_id` |
| `checkout_cancelled` | Return from Stripe cancel URL | `program` |
| `layoff_pay_what_you_can_purchase` | Welcome page verified (client) | `tier`, `amount` |
| `layoff_standard_purchase` | Welcome page verified (client) | `tier`, `amount` |
| `layoff_pay_it_forward_purchase` | Welcome page verified (client) | `tier`, `amount` |

**Jetstream (pip_)** and **Basecamp (new_role_)** mirror the above with the same event shape. Replace `layoff` → `pip` / `new_role` and `parachute` → `jetstream` / `basecamp` in event and param names.

### B. Onboarding

| Event | Source | Params |
|---|---|---|
| `intake_start` | `src/app/intake/page.tsx` mount | — |
| `intake_step_complete` | Every step transition | `from`, `to` |
| `attribution_source` | Attribution answer submitted | `attribution_type`, `freeform_text` |
| `intake_complete` | Intake submitted | `program`, `program_name` |
| `welcome_page_view` | Each program welcome page mount | `program` |
| `signup_complete_post_purchase` | Account created on welcome page | `program` |
| `dashboard_first_view` | First-ever `/dashboard` load | — |

### C. Day flow

| Event | Source | Params |
|---|---|---|
| `session_start` | AnalyticsSessionBoundary | `program`, `days_since_purchase`, `days_since_last_activity` |
| `day_started` | Day page mount | `program`, `day_number` |
| `day_1_started` | Day 1 mount (once per enrollment) | `program` |
| `day_completed` | DoneTab complete button | `program`, `day_number` |
| `day_1_completed` | DoneTab complete button when day_number === 1 | `program` |
| `day_mid_abandon` | Unmount day page without completion | `program`, `day_number` |
| `journal_entry_started` | TellTab first keystroke | `day_number` |
| `journal_entry_saved` | TellTab saveJournal | `day_number`, `word_count` |
| `journal_entry_short` | Saved with `word_count < 30` | `day_number`, `word_count` |
| `journal_processed` | step_3_analysis populated | `day_number` |
| `exercise_started` | Exercise first shown | `framework_name`, `exercise_type`, `day_number`, `program` |
| `exercise_completed` | Exercise finished | `framework_name`, `exercise_type`, `modality`, `day_number`, `program`, `time_spent_sec`, `has_rating` |
| `exercise_star_rating` | Rating submitted | `framework_name`, `rating`, `day_number`, `program` |
| `exercise_feedback_submitted` | Text feedback saved | `framework_name`, `day_number`, `program` |
| `exercise_abandoned` | Day unmount with exercise started but not completed | `framework_name`, `day_number`, `program` |
| `goal_created` | Goals generated | `program`, `goal_count` |
| `goals_approved` | Goals approve button | `program`, `goal_count` |
| `weekly_review_started` | Weekly review page mount | `program`, `week_number` |
| `weekly_review_completed` | Weekly review submitted | `program`, `week_number` |

### D. Retention & dropout

| Event | Source | Params |
|---|---|---|
| `return_visit_d1` / `d3` / `d7` / `d14` | AnalyticsSessionBoundary | `program`, `days_inactive`, `last_day_number` |
| `inactivity_3d` / `inactivity_7d` / `inactivity_14d` | AnalyticsSessionBoundary | `program`, `days_inactive`, `last_day_number` |
| `dropout_detected` | `/api/cron/dropout-detection` (server, MP) | `program`, `last_day_number`, `days_inactive`, `enrollment_id` |
| `program_completed` | `runOfframp` in `src/lib/program-offramp.ts` (server, MP) | `program`, `total_days`, `days_to_complete`, `had_3d_gap`, `had_7d_gap`, `max_inactivity_days`, `enrollment_id` |
| `program_closed_early` | `runOfframp` with reason=closed_early (server, MP) | same as above |
| `second_program_started` | Stripe webhook when purchaser has prior completed enrollment (server, MP) | `first_program`, `second_program`, `days_between` |

### E. Upsells

**Enneagram path (direct checkout):**

| Event | Source | Params |
|---|---|---|
| `enneagram_upsell_view` | EnneagramCard enters viewport | `program` |
| `enneagram_upsell_click` | Click "Add now" | `program` |
| `enneagram_standalone_begin_checkout` | Before Stripe fetch | — |
| `enneagram_checkout_error` | Stripe session creation fails | `error_message` |
| `enneagram_purchase` | Welcome page verified | `tier`, `amount` |
| `enneagram_purchase_webhook` | Stripe completed webhook (server) | `program`, `tier`, `amount` |

**Coaching path (application flow):**

| Event | Source | Params |
|---|---|---|
| `coaching_upsell_view` | CoachingCard enters viewport | `program`, `context` |
| `coaching_upsell_click` | Click "Apply" | `program`, `context` |
| `upsell_state_shown` | UpsellSection mount | `state`, `program` |
| `apply_page_view` | `/apply` mount | — |
| `apply_form_start` | First field focus / set | — |
| `apply_screen_complete` | Each screen onNext | `screen_index` |
| `apply_form_abandoned` | `beforeunload` with started but not submitted | `last_screen` |
| `coaching_application_submit` | Apply form submit | `funding`, `budget`, `screen_count`, `time_on_form_sec` |

### F. Quality signals

| Event | Source | Params |
|---|---|---|
| `ai_generation_failed` | process-journal catch (server, MP) | `endpoint`, `error_message` |
| `ai_generation_slow` | process-journal elapsed > 10s (server, MP) | `endpoint`, `elapsed_sec` |
| `crisis_detected` | process-journal urgency=high (server, MP) | `enrollment_id`, `day_number` |
| `rate_limit_hit` | `checkRateLimit` returning 429 (server, MP) | `bucket`, `retry_after_sec` |
| `auth_login_failed` | Login page | `method`, `error_message` |
| `login_success` | Login page | `method` |
| `error_boundary_caught` | `/error.tsx` + `/day/[dayNumber]/error.tsx` | `page`, `error_message`, `digest` |
| `error_retry_attempted` | Error boundary "Try again" click | `page` |
| `stripe_webhook_error` | Stripe webhook verification or handler fail (server) | `stage`, `event_type?`, `error_message` |

### G. Ancillary / existing

| Event | Source | Params |
|---|---|---|
| `nps_submitted` | NPSPrompt | `score`, `week` |

### H. Auth & account creation failures (added 2026-04-07 wave 2)

| Event | Source | Params |
|---|---|---|
| `auth_login_failed` | Login page password | `method`, `error_message` |
| `auth_google_failed` | Login page Google OAuth | `error_message` |
| `auth_magic_link_failed` | Login page magic link | `error_message` |
| `auth_magic_link_sent` | Login page magic link success | — |
| `auth_callback_failed` | `/auth/callback` exchange error (server, MP) | `error_message` |
| `auth_signup_failed` | Welcome pages signup | `program`, `error_message` |
| `auth_signin_failed` | Welcome pages signin (also signup-fallback) | `program`, `source`, `error_message` |
| `enrollment_creation_failed` | Welcome pages `createEnrollmentIfNeeded` | `program`, `stage`, `error_message` |
| `payment_verification_failed` | `/api/checkout/verify` (server, MP) | `program`, `tier`, `payment_status`, `session_id`, `error_message` |
| `password_reset_request_failed` | `/forgot-password` | `error_message` |
| `password_reset_request_sent` | `/forgot-password` success | — |
| `password_reset_completion_failed` | `/reset-password` | `error_message` |
| `password_reset_completed` | `/reset-password` success | — |

### I. Referral & gifting (added 2026-04-07 wave 2)

| Event | Source | Params |
|---|---|---|
| `referral_page_view` | `/refer` mount | — |
| `referral_code_generated` | `/api/referral/generate` success | — |
| `referral_code_generation_failed` | `/api/referral/generate` error | `error_message` |
| `referral_code_copied` | Copy button click | — |
| `gift_begin_checkout` | Gift CTA on `/refer` → program page | `program` |
| `gift_purchased` | Stripe webhook completed with `is_gift=true` (server, MP) | `program`, `tier`, `amount`, `session_id` |

### J. Newsletter / waitlist (added 2026-04-07 wave 2)

| Event | Source | Params |
|---|---|---|
| `waitlist_view` | ComingSoonWaitlist enters viewport | `source` |
| `waitlist_email_focused` | First focus on waitlist email field per program | `program` |
| `waitlist_submitted` | `/api/waitlist` POST success | `program` |
| `waitlist_failed` | `/api/waitlist` POST error | `program`, `error_message` |

### K. Assessment quiz (added 2026-04-07 wave 2)

| Event | Source | Params |
|---|---|---|
| `assessment_page_view` | `/assessment` mount | — |
| `assessment_disruption_scored` | Each slider scored | `disruption_id`, `score` |
| `assessment_complete` | All sliders done, results shown | `avg_score`, `top_3_disruptions`, `total_scored` |
| `assessment_email_captured` | Optional waitlist opt-in success | `avg_score` |
| `assessment_email_capture_failed` | Waitlist opt-in error | `status`, `error_message` |

### L. Apply extension (added 2026-04-07 wave 2)

| Event | Source | Params |
|---|---|---|
| `apply_page_view` | `/apply` mount — **now includes `source`** inferred from query/referrer | `source` |
| `apply_back_clicked` | Back button on apply screen | `from_screen` |

### M. Exit / close-early (added 2026-04-07 wave 2)

| Event | Source | Params |
|---|---|---|
| `close_early_viewed` | CloseEarlyCard mount | `enrollment_id`, `variant` |
| `close_early_clicked` | "Close program early" button | `enrollment_id`, `variant` |
| `close_early_confirmed` | Confirmation submit | `enrollment_id` |
| `close_early_error` | API failure | `enrollment_id`, `status`, `error_message` |
| `exit_survey_page_view` | `/feedback/exit` mount | — |
| `exit_survey_reason_selected` | First "next" with reason chosen | `reason` |
| `exit_survey_submitted` | Survey form submit | `reason`, `has_comeback_text` |

### N. Feedback surveys (added 2026-04-07 wave 2)

| Event | Source | Params |
|---|---|---|
| `testimonial_survey_view` | `/feedback/testimonial` mount | — |
| `testimonial_survey_submitted` | Survey form submit | `has_permission`, `describe_length`, `changed_length` |
| `share_page_view` | `/share` mount | — |
| `testimonial_submitted` | `/api/testimonials/*` success | `kind` (text/social/video), `has_attribution`, `tag_count` |
| `testimonial_submission_failed` | `/api/testimonials/*` error | `kind`, `status`, `error_message` |
| `quality_flag_opened` | FlagButton clicked open | `output_type`, `framework_name` |
| `quality_flag_submitted` | Flag submitted | `output_type`, `flag_reason`, `framework_name`, `has_comment` |
| `contact_page_view` | `/contact` mount | — |
| `contact_form_submitted` | Contact form success | `message_length` |
| `contact_form_failed` | Contact form error | `status`, `error_message` |

### O. Other endpoints (added 2026-04-07 wave 2)

| Event | Source | Params |
|---|---|---|
| `final_insights_view` | `/insights/final` mount | `enrollment_id` |
| `monthly_summary_view` | `/monthly-summary` mount | — |

---

## Naming conventions

- Marketing-page events use the legacy short prefix: `layoff_` / `pip_` / `new_role_`.
- Post-payment / in-app events use the full program slug as a `program` param: `parachute` / `jetstream` / `basecamp`.
- Programmatic checkout events fire both `{program}_*_begin_checkout` AND `begin_checkout` (GA4 ecommerce reserved) — if you build a funnel on `begin_checkout`, filter by the `package` param to avoid double-counting against the program-specific event.
- Server-side events fired via Measurement Protocol use `ga_client_id` stored on `program_enrollments` when available; otherwise a synthetic client_id (`server.<scope>`) so they still land in GA4.
