# GDPR Rights Implementation Guide
**Mindcraft / All Minds on Deck LLC**
**Last updated:** April 4, 2026

## Overview
Under GDPR (and similar privacy laws), users have specific rights over their personal data. This document maps each right to how it's currently handled in the product, and identifies gaps.

---

## 1. Right of Access (Article 15)
**What it means:** Users can request a copy of all personal data you hold about them.

**Current implementation:**
- ✅ My Account page shows enrolled programs, completion status
- ✅ Journal entries are visible on the day pages
- ✅ Exercise completions are accessible through the day flow
- ✅ Goals are visible on the goals page

**Gaps:**
- ❌ No "Download my data" button for a full export (JSON/CSV)
- ❌ API logs (usage data, IP addresses) are not user-accessible
- ❌ Stripe payment data is not surfaced to user (only on Stripe dashboard)

**To build:**
- [ ] `/api/data-export` endpoint that queries all user tables and returns JSON
- [ ] "Download my data" button on My Account page
- [ ] Include: journal entries, exercise completions + responses, goals, enrollment data, profile, Enneagram results
- [ ] Exclude: API logs (internal), Stripe data (accessible via Stripe customer portal)

**Manual process (until built):** User emails crew@allmindsondeck.com → admin runs SQL export → sends encrypted file within 30 days.

---

## 2. Right to Rectification (Article 16)
**What it means:** Users can correct inaccurate personal data.

**Current implementation:**
- ✅ Users can edit their email via Supabase Auth settings
- ✅ Users can update their name (if profile field exists)
- ✅ Journal entries are editable (users can modify responses)

**Gaps:**
- ❌ Exercise completion responses cannot be edited after submission
- ❌ No UI for editing profile details (name, etc.) if not in auth metadata

**To build:**
- [ ] Profile edit page or section on My Account (name, preferred name)
- [ ] Consider: allow editing exercise responses within X days?

**Manual process:** User emails → admin updates in Supabase dashboard.

---

## 3. Right to Erasure / Right to be Forgotten (Article 17)
**What it means:** Users can request deletion of all their personal data.

**Current implementation:**
- ✅ "Delete my account" button exists on My Account page (with confirmation warning)
- ✅ Warning mentions data export before deletion

**Gaps:**
- ❌ Need to verify: does account deletion cascade to ALL tables? (journal_entries, exercise_completions, client_goals, weekly_reviews, coaching_memories, api_logs, etc.)
- ❌ Stripe customer data is NOT deleted when Supabase account is deleted — requires separate Stripe API call
- ❌ Resend contact data (email marketing) is NOT deleted — requires separate Resend API call
- ❌ Sentry error logs may contain user IDs — these expire naturally but aren't actively purged

**To build:**
- [ ] Verify Supabase cascade deletes across all tables (or add explicit cleanup)
- [ ] On account deletion: call Stripe API to delete customer (`stripe.customers.del`)
- [ ] On account deletion: remove from Resend audience lists
- [ ] Add explicit confirmation: "This will permanently delete your journal entries, exercises, goals, and all coaching data"
- [ ] 30-day grace period option? (soft delete → hard delete after 30 days)

**Manual process:** User emails → admin deletes from Supabase + Stripe + Resend within 30 days.

---

## 4. Right to Data Portability (Article 20)
**What it means:** Users can receive their data in a structured, machine-readable format (JSON, CSV) and transmit it to another service.

**Current implementation:**
- ✅ Exercise share feature exports individual exercises
- ✅ Weekly summary share exports weekly data

**Gaps:**
- ❌ No full data export in machine-readable format
- ❌ No standard format that other coaching platforms could import

**To build:**
- [ ] Same `/api/data-export` endpoint as Right of Access (serves both purposes)
- [ ] Export format: JSON with clear schema documentation
- [ ] Include: all user-generated content (journals, exercises, goals, ratings, feedback)

---

## 5. Right to Restriction of Processing (Article 18)
**What it means:** Users can request that you stop processing their data (but keep storing it).

**Current implementation:**
- ✅ Users can pause their enrollment (stops daily processing, no new AI analysis)
- ✅ Paused users don't receive daily reminder emails

**Gaps:**
- ❌ No explicit "restrict processing" flag separate from enrollment pause
- ❌ Pausing enrollment still allows login and data viewing — is this sufficient?

**Assessment:** Enrollment pause functionality effectively covers this right for the coaching product. A user who wants to restrict processing can pause their enrollment. Full restriction (no login) would require account suspension.

**Manual process:** User emails → admin sets enrollment status to "paused" or suspends auth account.

---

## 6. Right to Object (Article 21)
**What it means:** Users can object to processing based on legitimate interests or for direct marketing.

**Current implementation:**
- ✅ Cookie consent banner with opt-out for analytics
- ✅ Users can decline cookies (Google Analytics not loaded)

**Gaps:**
- ❌ No email preference center (unsubscribe from specific types: daily reminders, weekly insights, marketing)
- ❌ No in-product way to opt out of AI processing while keeping account

**To build:**
- [ ] Email preference center on My Account page
- [ ] Respect unsubscribe preferences in all email API routes
- [ ] Add `List-Unsubscribe` header to all Resend emails

---

## 7. Right to Withdraw Consent (Article 7)
**What it means:** Users can withdraw consent at any time, as easily as they gave it.

**Current implementation:**
- ✅ Cookie consent can be withdrawn (clear localStorage)
- ✅ Account can be deleted (full consent withdrawal)
- ✅ Terms & Privacy consent is recorded at signup

**Gaps:**
- ❌ No in-product way to withdraw cookie consent after initial acceptance (no "manage cookies" link in footer)
- ❌ No granular consent management (e.g., consent to AI processing but not analytics)

**To build:**
- [ ] "Manage cookies" link in footer → reopens cookie consent banner
- [ ] Consider: granular consent toggles on My Account page

---

## Priority Order for Implementation

### High Priority (before 100 users)
1. **Verify cascade deletes** — ensure account deletion removes ALL data
2. **Full data export** (`/api/data-export` + button on My Account)
3. **"Manage cookies" footer link**
4. **Email unsubscribe headers** in all Resend emails

### Medium Priority (before 500 users)
5. **Profile edit** on My Account
6. **Email preference center**
7. **Stripe customer deletion** on account delete
8. **Resend contact deletion** on account delete

### Lower Priority (before 1000 users)
9. **30-day soft delete grace period**
10. **Granular consent management**
11. **Data export format documentation**

---

## Current Manual Process
Until automated, all GDPR requests should be handled via email to crew@allmindsondeck.com with a 30-day response window:

1. **Access request:** Admin runs SQL query, exports to JSON, sends encrypted
2. **Deletion request:** Admin deletes from Supabase Auth (cascades), then Stripe, then Resend
3. **Rectification:** Admin updates in Supabase dashboard
4. **Portability:** Same as access request but in JSON format

Track all requests in a simple spreadsheet: date received, type, user email, date completed.
