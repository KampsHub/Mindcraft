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

## NEW INLINE NOTES (found 2026-04-07 second pass through doc)

### N1 — "Remove this section." (Was this exercise useful? Yes / Not for me)

**Status:** ✅ Will fix

The "Was this exercise useful?" Yes/Not-for-me prompt that appears after exercise completion should be removed entirely. The star rating on the next screen ("How was this exercise?") is enough — the binary useful/not-useful is redundant and creates extra friction.

Code location: `src/components/ExerciseCard.tsx` or wherever the post-exercise feedback dialog is rendered.

### N2 — Star rating: where do users see their rating + can I see it aggregated?

> "Leave this section. Where does the customer see their rating? Can I see it based on exercise in an aggregated way?"

**Status:** 💬 Two-part question

**Part 1: Where does the user see their own rating?**
Currently nowhere, except in their `exercise_completions` table row which they don't see directly. Should they see it on the dashboard? In the weekly review?

Proposal: Add a small "Your rating" indicator on already-completed exercises in the ExercisesSection on dashboard. Plus surface in the weekly-review summary card.

**Part 2: Can Stefanie see ratings in an aggregated way?**
The data is in `exercise_completions.star_rating`. Today there's no admin view. Two options:
- (a) Add an admin page at `/admin/exercise-ratings` that groups by `framework_name` showing avg rating, count, distribution, and links to the lowest-rated rows for review
- (b) Add this to the existing quality-flags admin view if there is one

Recommended: option (a) — net new admin view, ~45 min.

### N3 — Inner Critic exercise: factual language instead of hedged

> "...already, are you not sticking to it? You are stating something like a fact 'which is often how the inner critic...' - 'which may be how the inner critic'... you see the difference? We talked about this before."

**Status:** 🔥 Critical voice rule violation — needs systemic AI prompt fix

Per CLAUDE.md: "Coach voice, not authority voice. Don't tell the user what happened to them or why they feel what they feel. Use language that invites rather than declares: 'it sounds like,' 'maybe,' 'could it be that,' 'you might notice,' 'this may help you...'"

The AI insight currently said: "You opened with disappointment, which is often how the inner critic shows up on Day 1 — protecting you from hoping something might help."

Should say: "You opened with disappointment, which **may be** how the inner critic shows up on Day 1 — and one way to read it is as protection against hoping something might help."

**Where to fix:**
- `src/app/api/process-journal/route.ts` — the SYSTEM prompt must enforce hedged language MORE strongly. Current rule is there but the AI is still drifting into declarative phrasing.
- The same applies to exercise `whyThis` content (seed scripts).

I'll add a stronger rule with explicit examples to the process-journal prompt and verify with a test journal entry.

### N4 — "I thought you had a dialogue tool - doing this in journaling is more confusing."

**Status:** 💬 Question — likely needs primitive selection fix on a specific exercise

Stefanie is pointing out that an exercise that should use the `dialogueSequence` primitive (multi-turn back-and-forth between voices) is currently rendering as a freeform journal text area, which is confusing because the framework requires structured dialogue.

This refers to the **Inner Critic Dialogue** exercise visible in the surrounding screenshots. Looking at the seed data, that exercise uses a "guided" type instead of `dialogueSequence`.

Fix: Update the Inner Critic Dialogue exercise to use the dialogueSequence primitive with prePopulated speaker labels (e.g., "Inner Critic" / "You"). This is a seed data change in the program day definition, plus possibly an exercise-completion handler change.

This is an **instructional design** issue, not just a UI issue — the user can't practice dialogue with a single text area. CLAUDE.md is explicit about this:
> "If the instruction asks the user to write or reflect, there must be a place to write. The primitive must include a journal/text area for that reflection."

For a dialogue exercise, that means: **the primitive must support multiple turns**, not one big textarea.

### N5 — "What would make this exercise better?" / "Where do you catch this feedback? How can I see it?"

**Status:** 💬 Question + 🔧 Likely two fixes

The per-exercise feedback field exists (`exercise_completions.feedback` column) and is captured at the end of every exercise. Stefanie is asking where it goes and how she can see it.

Today: stored in DB, not surfaced anywhere. Same gap as N2.

Proposal:
1. Add the feedback content to the same `/admin/exercise-ratings` view from N2
2. Surface a small "💭 1 piece of feedback" indicator in the weekly_reviews admin view if any feedback was left during that week

Alternative: if she wants the feedback question REMOVED entirely (because it's noise), I'll do that instead. Pending her direction.

### N6 — "These are different colors. Plus they are in italics while all other fonts are normal. Update and..."

**Status:** ✅ Will fix

The AI-generated insight text in exercises ("Your disappointment suggests you're evaluating whether this program works before you've engaged with it...") is currently rendered in:
- A different (lighter / muted) color than the rest of the body text
- Italics
- A slightly different size

Stefanie wants this normalized to the same color/style as the rest of the body content.

Code location: probably `src/components/exercises/InsightDisplay.tsx` or wherever the AI insight is rendered. I'll find it and remove the italic + bring color to textPrimary.

---

## Section 5 — Stefanie's reply on 1.a (referrer signup)

You clarified after my first 1.a proposal:
> "this is not about customers with a referral code - they can still come in by choosing a program and then redeeming the code in checkout. this is for customers who are not yet users but still want to spread the word on us. these are referrers."

**Status:** ✅ Fixed in commit `99c72ca`

Built `/signup?next=/refer` flow (option b from my proposal). `/login` and `/refer` both threaded for the `next` query param. Logged-out visitors to `/refer` now see "Create a free account to get your code" / "Already have an account? Sign in" instead of a dead-end "Sign in" button.

Then in this batch (commit pending) added a small footer-of-final-CTA link on the homepage so referrers have an entry point too.

---

## Section 6 — Stefanie's unblocking direction (full batch)

Direction received in chat (not doc):
- ✅ "add" → 1.a homepage CTA. Building.
- ✅ "Go-ahead to (a) update the final-summary AI prompt..." → 4.a #2 + #3 implementing.
- ✅ "Explicit go-ahead to touch src/app/page.tsx" → fixed 2.a hero banner via 100dvh.
- ✅ Stripe-Calendar booking link URL provided → wired into /enneagram/welcome.
- ✅ "sure" Enneagram welcome expansion → done.
