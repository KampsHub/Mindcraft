# Mindcraft Test Plan

## How to use this
Each test case has steps you follow and expected results.
- **🤖 Claude can do this** — I'll execute via browser automation or API calls
- **👤 You do this** — requires your browser, credentials, or visual judgment
- **🤖+👤 Together** — you click through, I verify the data landed correctly

Use Stripe test card `4242 4242 4242 4242` (any future expiry, any CVC/ZIP).

---

## Prerequisites

- [ ] Stripe in test mode (keys start with `sk_test_`) — **👤 verify in Stripe dashboard**
- [ ] Resend domain `allmindsondeck.com` verified ✅
- [ ] Supabase email confirmation turned OFF ✅
- [ ] Supabase site URL set to `https://mindcraft.ing` — **👤 check Supabase → Auth → URL Configuration**
- [ ] RESEND_API_KEY set in Vercel env vars ✅
- [ ] `NEXT_PUBLIC_APP_URL=https://mindcraft.ing` in Vercel env vars ✅

---

## 1. PAYMENT FLOWS

### 1.1 Parachute — Sliding Scale (Standard $49) — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Go to mindcraft.ing/parachute | Page loads, hero readable, pricing section visible |
| 2 | 👤 | Click "Start now" on sliding scale card (default $49) | Stripe checkout opens with $49 |
| 3 | 👤 | Pay with test card `4242 4242 4242 4242` | Payment succeeds |
| 4 | 👤 | Observe redirect URL | Redirects to `/parachute/welcome?session_id=...` on mindcraft.ing (NOT mindcraft.ninja) |
| 5 | 👤 | Screenshot the welcome page | Shows signup form with correct tier badge |
| 6 | 🤖 | I verify in Stripe | Payment of $49, metadata: `tier: standard`, `program: parachute` |

### 1.2 Parachute — Pay What You Can ($29-48) — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Go to mindcraft.ing/parachute, scroll to pricing | Slider visible |
| 2 | 👤 | Move slider to $35 | Price updates in real-time |
| 3 | 👤 | Click "Start now" | Stripe checkout shows $35 |
| 4 | 👤 | Complete payment | Redirects to /parachute/welcome |
| 5 | 🤖 | I verify in Stripe | Amount = $35.00, metadata: `tier: pay_what_you_can`, `amount_cents: 3500` |

### 1.3 Parachute — Pay It Forward ($50-69) — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Select pay-it-forward tier, set $60 | Price shows $60 |
| 2 | 👤 | Complete checkout | Redirects to /parachute/welcome |
| 3 | 🤖 | I verify in Stripe | Amount = $60.00, metadata: `tier: pay_it_forward` |

### 1.4 Program + Enneagram ($349) — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Click "Start now" on Enneagram card | Stripe checkout shows $349 |
| 2 | 👤 | Complete payment | Redirects to /parachute/welcome |
| 3 | 🤖 | I verify in Stripe | Amount = $349.00, metadata: `tier: enneagram` |

### 1.5 Jetstream & Basecamp ($49 each) — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Go to /jetstream, click "Get started" | Stripe shows $49 |
| 2 | 👤 | Complete payment | Redirects to /jetstream/welcome |
| 3 | 👤 | Repeat for /basecamp | Same flow → /basecamp/welcome |
| 4 | 🤖 | I verify both in Stripe | Two payments, correct program metadata |

### 1.6 Declined Card — 👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Start any checkout | Stripe opens |
| 2 | 👤 | Use card `4000 0000 0000 0002` | Declined error in Stripe UI |
| 3 | 👤 | Observe | Stays on Stripe page, can retry with different card |

### 1.7 Abandoned Checkout — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Start checkout, close the tab without paying | Nothing breaks |
| 2 | 🤖 | After ~1hr, I check `api_logs` in Supabase | `checkout.session.expired` event logged |

---

## 2. ACCOUNT CREATION (Post-Payment)

### 2.1 New User Signup — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | After payment, land on welcome page | See signup form (email + password) |
| 2 | 👤 | Enter a fresh test email + password (min 6 chars) | No errors |
| 3 | 👤 | Observe redirect | Goes to `/intake?program=parachute` |
| 4 | 🤖 | I check Supabase Auth → Users | New user row with correct email |
| 5 | 🤖 | I check `clients` table | Row: `subscription_status: active`, `stripe_customer_id` populated |
| 6 | 🤖 | I check `program_enrollments` | Row: correct `program_id`, `status: pre_start`, `tier` matches what was paid |

### 2.2 Returning User Login — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | On welcome page, click "I have an account" | Login form shown |
| 2 | 👤 | Enter existing credentials | Logs in |
| 3 | 👤 | Observe redirect | Goes to `/intake?program=parachute` |
| 4 | 🤖 | I check `program_enrollments` | NEW enrollment row added (not overwriting old one) |

### 2.3 Weak Password — 👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | On welcome page, enter email + "123" | Error: password too short |

### 2.4 Duplicate Email — 👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Try signup with already-used email | Error message, suggests logging in |

### 2.5 Welcome Page Without Payment — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Navigate to /parachute/welcome (no session_id) | Error: "We couldn't confirm your payment" with link back to /parachute |

### 2.6 Welcome Page With Expired Session — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Navigate to /parachute/welcome?session_id=cs_fake_123 | Same error state as 2.5 |

---

## 3. LOGIN & PASSWORD RESET

### 3.1 Normal Login — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Go to mindcraft.ing/login | Form loads |
| 2 | 🤖 | Enter valid test credentials | Redirects to /dashboard |
| 3 | 🤖 | Screenshot dashboard | Shows enrolled programs |

### 3.2 Wrong Password — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Enter valid email + wrong password | Error: "Invalid login credentials" |
| 2 | 🤖 | Verify still on /login | Can retry |

### 3.3 Password Reset Flow — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Go to /forgot-password | Form loads |
| 2 | 🤖 | Enter test email, submit | "Check your email" message |
| 3 | 👤 | Check email inbox | Reset link received from Supabase |
| 4 | 👤 | Click reset link | Redirects to mindcraft.ing/reset-password (NOT homepage) |
| 5 | 👤 | Enter new password | Redirects to /login with success message |
| 6 | 🤖 | Login with new password | Works |

**⚠️ Prerequisite**: Supabase → Auth → URL Configuration must have `Site URL: https://mindcraft.ing` and `https://mindcraft.ing/auth/callback` in Redirect URLs. If this is wrong, the reset link will go to the wrong domain.

### 3.4 Protected Routes (No Auth) — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | In incognito, go to /dashboard | Redirected to /login |
| 2 | 🤖 | Try /mindful-journal | Redirected to /login |
| 3 | 🤖 | Try /goals | Redirected to /login |
| 4 | 🤖 | Try /weekly-review | Redirected to /login |
| 5 | 🤖 | Try /exercise | Redirected to /login |

### 3.5 Auth Redirect (Already Logged In) — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | While logged in, go to /login | Redirected to /dashboard |
| 2 | 🤖 | While logged in, go to /signup | Redirected to /dashboard |

### 3.6 Session Persistence Across Pages — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Login, go to /dashboard | Works |
| 2 | 🤖 | Navigate to /mindful-journal | Still authenticated |
| 3 | 🤖 | Navigate to /goals | Still authenticated |
| 4 | 🤖 | Refresh the page | Still authenticated (session persists) |

---

## 4. INTAKE SURVEY

### 4.1 Full Intake Flow — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | After signup, land on /intake?program=parachute | Step 1: "Where did you hear about us?" |
| 2 | 👤 | Select "LinkedIn" | Advances to intake questions (skips program selection) |
| 3 | 👤 | Answer pre-start questions (date, how you left, free text) | Each accepts input |
| 4 | 👤 | Rate disruption scale (1-10 for each of 7 areas) | Each item has description text, numbers selectable |
| 5 | 👤 | Free text: "what do you want from this program?" | Text area works |
| 6 | 👤 | Click "Continue to Consent" | Consent toggles screen |
| 7 | 👤 | Review consent toggles | Each has description, required ones explained |
| 8 | 👤 | Click "Begin Program" | Loading → success |
| 9 | 👤 | Observe redirect | Goes to /dashboard or complete screen |
| 10 | 🤖 | I check `program_enrollments.pre_start_data` | JSONB contains: attribution, all answers, disruption ratings |
| 11 | 🤖 | I check `intake_responses` | Row with `completed: true`, data in `package_specific` |
| 12 | 🤖 | I check GA4 | `attribution_source` event with source + `intake_complete` event with program |

### 4.2 Intake Without Auth — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | In incognito, go to /intake?program=parachute | Page loads (no auth gate currently) |
| 2 | 🤖 | Fill out everything, click "Begin Program" | Alert: "Please sign in first" — does NOT save |

### 4.3 Intake Without Program Param — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Go to /intake (no ?program=) while logged in | Shows program selection step |
| 2 | 🤖 | Select a program | Continues to intake questions |

### 4.4 Intake Back Navigation — 👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Get to consent step, click "← Back" | Returns to intake questions with answers preserved |
| 2 | 👤 | Change an answer | Updates without losing other answers |

### 4.5 Intake Required Consent — 👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | On consent step, try to turn off "AI Processing" (required) | Toggle doesn't move (disabled) |
| 2 | 👤 | Toggle "Coach sharing" off | Toggle moves freely |

---

## 5. DASHBOARD

### 5.1 Dashboard After Fresh Enrollment — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Login after completing intake | Dashboard loads |
| 2 | 🤖 | Screenshot | Program card visible with name, Day 1, status |
| 3 | 🤖 | Check goals section | Empty or "Goals generated on Day 3" |
| 4 | 🤖 | Check week progress | Day 1 shown |

### 5.2 Dashboard Quick Links — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Click "Journal" | Goes to /mindful-journal |
| 2 | 🤖 | Click "Progress" | Goes to /goals |
| 3 | 🤖 | Click "Insights" | Goes to /weekly-review |

### 5.3 Dashboard Empty State — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Login with account that has no enrollments | Shows empty state or prompt to browse programs |

### 5.4 Upsell Section — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Login with standard tier | Enneagram upsell visible |
| 2 | 🤖 | Login with enneagram tier | No upsell |

### 5.5 Enneagram Post-Purchase Flow — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Purchase Enneagram add-on ($300) via dashboard "Add now" button | Stripe checkout, payment succeeds, redirect to /enneagram/welcome |
| 2 | 👤 | Return to dashboard | Enneagram upsell card is GONE. Shows "✓ Enneagram results available in Insights" with clickable link |
| 3 | 👤 | Click "Insights" link in the confirmation message | Goes to /weekly-review |
| 4 | 👤 | On Insights page, check for Enneagram section | Shows "IEQ9 Enneagram" card with "Your results are being prepared. You'll see them here once your IEQ9 debrief is complete." |
| 5 | 👤 | Verify Enneagram upsell card is hidden on Insights page | Only Coaching upsell card shows in "Go deeper" |
| 6 | 🤖 | In Supabase, add enneagram data: `client_assessments` → type: "enneagram", data: `{"type": "4", "notes": "4w5, SX/SP, core fear of being without identity"}` | Row created |
| 7 | 👤 | Refresh Insights page | Enneagram card now shows "Type 4" with notes displayed |
| 8 | 🤖 | Verify dashboard still shows confirmation message | "✓ Enneagram results available in Insights" persists |
| 9 | 🤖 | Verify `client_assessments` query returns correct data | `type: "enneagram"`, data has type + notes |

### 5.5 Multiple Enrollments — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Buy a second program with same account (e.g. jetstream after parachute) | Payment succeeds |
| 2 | 🤖 | Check dashboard | Both program cards shown |
| 3 | 🤖 | Check `program_enrollments` | Two rows for same `client_id` |

---

## 6. EMAIL

### 6.1 Welcome Email — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Create new account via welcome page | — |
| 2 | 👤 | Check inbox | Email from "Stefanie from Mindcraft" with dashboard link |
| 3 | 🤖 | Check `clients.welcome_email_sent` | `true` |
| 4 | 🤖 | Check Resend dashboard | Email visible with delivery status |
| 5 | 🤖 | Check no duplicate on re-login | `welcome_email_sent` prevents second send |

**⚠️ Note**: Welcome email sends from `stefanie@allmindsondeck.org` — verify this matches a verified Resend domain. If your verified domain is `allmindsondeck.com`, the `.org` sender will fail silently.

### 6.2 Apply Form Email — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Go to /apply, complete all steps | Thank-you screen |
| 2 | 👤 | Check stefanie@allmindsondeck.com inbox | Email with all form data |
| 3 | 🤖 | Check Resend → Emails | Delivery status visible |

### 6.3 Password Reset Email — 👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Go to /forgot-password, enter email | "Check your email" |
| 2 | 👤 | Check inbox | Reset email from Supabase (NOT Resend — this uses Supabase's built-in email) |
| 3 | 👤 | Verify link goes to mindcraft.ing | Not localhost, not mindcraft.ninja |

### 6.4 Email From Address Verification — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Check welcome-email API route | `from` address uses verified Resend domain |
| 2 | 🤖 | Check apply API route | `from` address uses verified Resend domain |
| 3 | 🤖 | Flag any `.org` vs `.com` mismatches | Report findings |

---

## 7. DATA STORAGE VERIFICATION

### 7.1 Full Flow Data Audit — 🤖
After you complete payment → signup → intake, I verify every table:

| Table | What I Check | How |
|-------|-------------|-----|
| `auth.users` | User exists with correct email | Supabase Auth dashboard |
| `clients` | `subscription_status: active`, `stripe_customer_id` populated, `welcome_email_sent` | Supabase Table Editor |
| `program_enrollments` | Correct `program_id`, `status`, `pre_start_data` has all intake answers, `tier` | Supabase Table Editor |
| `intake_responses` | `completed: true`, `package_specific` JSONB has answers | Supabase Table Editor |
| `consent_settings` | Consent flags match what user toggled | Supabase Table Editor |

### 7.2 Stripe ↔ Supabase Consistency — 🤖
| Check | Expected |
|-------|----------|
| Stripe `customer_id` matches `clients.stripe_customer_id` | Same value |
| Stripe payment amount matches the tier the user selected | $35 for pay_what_you_can at $35, etc. |
| Stripe metadata `program` matches `program_enrollments.program_id` slug | e.g. both say "parachute" |

### 7.3 Attribution Tracking End-to-End — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | During intake, select "LinkedIn" as source | — |
| 2 | 🤖 | Check GA4 → Events → attribution_source | `source: linkedin`, `attribution_type: preset` |
| 3 | 🤖 | Check `program_enrollments.pre_start_data` | `attribution: "linkedin"` in JSONB |

### 7.4 Attribution Freeform — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | During intake, type "My therapist told me" in Other field | — |
| 2 | 🤖 | Check GA4 | `source: My therapist told me`, `attribution_type: freeform`, `freeform_text: My therapist told me` |
| 3 | 🤖 | Check `program_enrollments.pre_start_data` | `attribution: "My therapist told me"` |

### 7.5 Account Data Export — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Call `GET /api/account/` with test user auth | Returns JSON with enrollments, goals, sessions, consent |
| 2 | 🤖 | Verify completeness | All tables represented |

### 7.6 Account Deletion — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Confirm you want to test deletion on a test account | — |
| 2 | 🤖 | Call `DELETE /api/account/?export=true` | Returns data, then deletes |
| 3 | 🤖 | Verify all tables | No rows remain for that user |

---

## 8. LANDING PAGES (Visual/UX)

### 8.1 Homepage — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Load mindcraft.ing | Hero text readable, frosted box visible |
| 2 | 🤖 | Click "Programs" nav | Scrolls to program cards |
| 3 | 🤖 | Click each program card "Learn more" | Goes to correct landing page |
| 4 | 🤖 | Click "Get started" CTA | Goes to a program page |

### 8.2 Program Landing Pages — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Load /parachute, /jetstream, /basecamp | All hero text readable |
| 2 | 🤖 | Scroll full page | No broken sections, no light gray backgrounds, no massive blank gaps |
| 3 | 🤖 | Check stats counter | Numbers animate (not stuck at 0) |
| 4 | 🤖 | Check pricing cards | Side by side, Enneagram + 1:1 aligned |
| 5 | 🤖 | Check "What we'll work on" tags | Readable, styled correctly |

### 8.3 Mobile Responsiveness — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Resize to mobile (375px) on each landing page | Layout adapts, no horizontal scroll |
| 2 | 🤖 | Check pricing cards | Stack vertically on mobile |
| 3 | 🤖 | Check nav | Collapses to hamburger or adapts |

### 8.4 Apply Page Flow — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Load /apply | Welcome screen with "Get started" |
| 2 | 🤖 | Click through all 9 steps with test data | Each step advances |
| 3 | 🤖 | Submit final step | Thank-you screen shown |

---

## 9. EDGE CASES

### 9.1 Direct URL Access — 🤖
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 🤖 | Go to /intake without being logged in | Should work gracefully (shows form, alerts on submit) |
| 2 | 🤖 | Go to /parachute/welcome without session_id | Error state: "couldn't confirm payment" |
| 3 | 🤖 | Go to /reset-password without recovery session | Should show error or redirect |
| 4 | 🤖 | Go to /dashboard without enrollment | Empty state |

### 9.2 Double Purchase Same Program — 🤖+👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Buy parachute, complete signup + intake | Enrolled |
| 2 | 👤 | Go back to /parachute, buy again | Payment goes through in Stripe |
| 3 | 🤖 | Check program_enrollments | Should NOT create duplicate enrollment (or should handle gracefully) |

### ⚠️ 9.5 CRITICAL GAP: Payment ↔ Enrollment Reconciliation
**Status: KNOWN BUG — no automated fix in place**

**The problem:** If ANY step between Stripe payment and `createEnrollmentIfNeeded` fails — browser closed, session bug, welcome page error, network timeout — the user has **paid but has no enrollment**. The dashboard shows "No program yet." Stripe has their money.

**How it happened in production:** Stefanie paid for parachute twice via pay-what-you-can. Both payments exist in Stripe. But `program_enrollments` has zero rows for her account because the welcome page session persistence bug (now fixed) prevented the enrollment from being created.

**What currently exists:**
- Webhook handler updates `clients.subscription_status` but does NOT create `program_enrollments`
- No background job or reconciliation script to match Stripe payments → enrollments
- No admin tool to manually link a payment to an enrollment
- No user-facing error that says "you paid but we couldn't set up your program"

**What needs to be built (in priority order):**
1. **Webhook should create enrollment** — when `checkout.session.completed` fires, if the session has `program` in metadata, create a `program_enrollments` row (don't rely solely on the welcome page)
2. **Dashboard reconciliation** — on dashboard load, if user has `subscription_status: active` but no enrollments, check Stripe for recent payments and auto-create enrollment
3. **Manual admin fix** — a way for you to link a Stripe payment to an enrollment from the Supabase dashboard

**To test:**
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Pay for a program, then close the browser before completing signup | Payment in Stripe |
| 2 | 👤 | Come back later, create account with same email, go to dashboard | Should show enrollment (currently does NOT) |
| 3 | 🤖 | Verify gap: Stripe has payment, Supabase has no enrollment | Confirms the bug |

### 9.3 Browser Back Button During Intake — 👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Get to step 3 of intake | — |
| 2 | 👤 | Press browser back button | Returns to previous step OR stays on page (should not break) |

### 9.4 Refresh During Intake — 👤
| Step | Who | Action | Expected |
|------|-----|--------|----------|
| 1 | 👤 | Get to step 3 of intake, refresh page | Returns to step 1 (answers lost) — this is expected but should be documented |

---

## Test Accounts to Create
1. **Fresh user** — new email, full flow: payment → signup → intake → dashboard
2. **Returning user** — existing account, buys second program
3. **No-enrollment user** — account with no purchases (for empty state testing)
4. **Deletion test user** — account to test data export + deletion

## Suggested Test Order
1. Prerequisites check (5 min)
2. Test 1.1 → 2.1 → 4.1 → 5.1 as one continuous flow (the happy path)
3. Test 6.1 + 6.2 (email delivery)
4. Test 3.3 (password reset — depends on Supabase URL config)
5. Test remaining payment tiers (1.2-1.5)
6. Test edge cases (section 9)
7. Test visual/UX (section 8) — 🤖 can do most of this independently
8. Data audit (section 7) — 🤖 after you've completed the happy path
