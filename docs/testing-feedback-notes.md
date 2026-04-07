# Testing feedback — action notes

Source: [Testing feedback Google Doc](https://docs.google.com/document/d/1kgo8uQYTWnqQ2sdspRd_V5udEUwwssxRewkEwc1xVz0/edit?tab=t.0)

For each item: code change, copy change, product question (with proposed answer), or design decision (with options).

Status legend:
- ✅ Fixed in code (commit hash linked)
- 💬 Question — answer posted as comment in the Google Doc
- ⏸️ Punted — needs Stefanie's decision (specific question listed)
- 🚫 Out of scope — homepage edits explicitly forbidden by Stefanie

---

## Section 1 — Login

### 1.a — "New here? Start journey" leads to program selection. But customers also need to create an account when they want to access referral codes. How to solve for that without making it complicated for everyone else?

**Status:** 💬 Question — answer to be posted in doc

**Proposed answer:**

The cleanest solution is to detect a referral code in the URL and route those users through an account-creation-first flow, while leaving the main "select a program" CTA untouched for everyone else.

Three concrete options, ranked:

1. **(Recommended) Detect `?ref=CODE` query param on the homepage.** When the URL has a referral code, swap the primary CTA from "Start your journey" to "Create your account to claim your referral." Pre-fill the referral code on the signup form. The main flow stays exactly as it is for everyone arriving without a code.

2. **Add a small secondary link** under the main CTA: "Have a referral code? Sign in or create an account." Routes account-only users through a dedicated `/signup?source=referral` flow without crowding the main conversion path.

3. **Backend-only**: Skip a UI change entirely. When a logged-out user with a referral code visits any page, the referral code is set in a cookie. They convert through the normal flow and the cookie is applied at checkout. Lowest friction but doesn't address the "I just want to claim my referral, not start a program right now" scenario.

My recommendation is **option 1 + option 3 combined**: query param detection drives the UI swap (option 1) AND sets a persistent cookie (option 3) so the referral applies even if they bounce around the site before signing up.

Implementation cost: ~2-3 hours. Touches the homepage (which Stefanie has flagged as off-limits to me right now) so this needs Stefanie's go-ahead before I touch `src/app/page.tsx`.

### 1.b — Whenever I login with Google, I land on /mindful-journal not /dashboard

**Status:** ✅ Fixed in commit `0361153`

Changed the default redirect in `src/app/auth/callback/route.ts` line 66 from `/mindful-journal` to `/dashboard`. The `next` query param still overrides when explicitly set (e.g. password recovery flow → `/reset-password`).

---

## Section 2 — Homescreen

### 2.a — Hero banner does not fully fill the screen

**Status:** 🚫 Out of scope (homescreen)

Stefanie explicitly said do not touch `src/app/page.tsx`. Flagging for her to address separately. The fix would likely be a `min-height: 100vh` adjustment on the hero section, but I'm not making the change.

---

## Section 3 — Payment

### 3.a — There should not be any promotion code sections in the sliding scale products

**Status:** ✅ To investigate and fix

The sliding scale products are `pay_what_you_can` and `pay_it_forward` in Parachute. Currently the Stripe checkout sessions for all parachute tiers use `allow_promotion_codes: true` (see `src/app/api/checkout/parachute/route.ts`). Need to gate this so only the `standard` tier shows the promo code field.

---

## Section 4 — Layoff program

### 4.a — How does the intake data get pulled into goal setting or context for the program? How do you memorize it and refer back to it? Especially: "What you want from this program" should be resurfaced in the final summary with a question on whether this was achieved or not — trackable! That's the success data for us.

**Status:** 💬 Question + 🔧 Partial implementation

**Proposed answer (to post in doc):**

Right now intake data lives in `program_enrollments.pre_start_data` (jsonb) and `onboarding_data` (jsonb). It's available to the system but **not surfaced anywhere the user sees** beyond initial intake. Specifically, the "What do you want from this program?" answer is captured but never echoed back.

Three concrete fixes, in priority order:

1. **Make the goal explicit at the end of intake.** After intake completes, show the user a confirmation: "Here's what you told us you want from this program: [their answer]. We'll come back to this on Day 30." This anchors the commitment.

2. **Resurface in the final summary (Day 30 / off-ramp).** The `runOfframp()` helper that runs program completion already has access to the enrollment row. Pull `pre_start_data.what_you_want_from_program` (or whatever the field is named) and add a new section to the final-insights generation prompt: "The user originally wanted: X. Reflect on whether they got there. Ask the user directly: did this program deliver X for you? Yes / Partially / No."

3. **Make it trackable as a success metric.** Add a column `program_outcome_self_reported` to `program_enrollments` (enum: achieved / partially / not_achieved / no_response). Capture the user's answer to the Day 30 question. This becomes the gold-standard success metric you can graph in GA4 alongside `program_completed`.

I can implement #1 and #3 today (touches `src/app/intake/page.tsx` for #1, schema migration + final-insights generator for #3). #2 requires a tweak to the AI prompt in `src/app/api/insights/final/generate/route.ts`.

**Recommendation:** Implement all three. Estimated 2-3 hours of work total.

---

(More items to come as I read pages 4-19 of the doc.)
