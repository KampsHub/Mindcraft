# Remaining Todo Items
**As of:** April 4, 2026 (end of session)

## Quick Fixes (~1 hr each)
- [x] Exercise completion micro-animation (motion.dev scale+glow, no confetti) ✅ DEPLOYED
- [x] Exercise-to-exercise navigation (progress dots ● ○ ○ + "X of Y done" counter) ✅ DEPLOYED
- [x] Mobile touch targets 44px minimum + pulse signaling on WheelChart, StakeholderMap ✅ DEPLOYED (BodyMap already has tap-to-mark, no resize needed)
- [x] Add missing FAQs: "Can I pause?", "Export data?", "Share with therapist?" ✅ DEPLOYED
- [x] GLOBAL: eliminate ALL grey text site-wide — textSecondary→#E0DDD8, textMuted→#D0CCC6 at theme level ✅ DEPLOYED
- [x] Specific error messages: journal processing improved ✅ DEPLOYED (exercise save, payment, auth all done) ✅ ALL DEPLOYED
- [x] Re-enrollment CTA after program completion ✅ DEPLOYED
- [x] 7-day money-back guarantee copy on all 3 program pricing sections ✅ DEPLOYED
- [x] Verify sandbox/production separation ✅ CONFIRMED (no prePopulated imports in production, primitives receive data via props only)

## Medium Effort (~2-3 hrs each)
- [x] Spaced retrieval: RetrievalCheck exercises on Days 7, 14, 21 (seed data update) ✅ SQL SCRIPT READY (scripts/add-retrieval-exercises.sql — run in Supabase SQL Editor to add retrieval exercises to all 3 programs)
- [x] Progress visualization: "Then vs Now" card on weekly review page ✅ DEPLOYED (shows Day 1 rating → week avg, exercises, days completed)
- [x] Skill progression badges on exercise cards (Awareness/Practice/Application/Integration by week) ✅ DEPLOYED (color-coded pill badges on exercise cards by week: purple Awareness → blue Practice → green Application → amber Integration)
- [x] Assessment→action: update process-journal prompt to weight low-scoring domains ✅ DEPLOYED (queries Day 1 Seven Disruptions scores, injects into prompt, adds selection rule 7)
- [ ] whyThis chunking: shorten 5-6 longest, move framework steps into primitive prompts
- [x] Exit survey email: 7 days inactive + not finished → email with survey link ✅ DEPLOYED (re-engage route now sends exit survey at 7+ days, re-engage at 3-7 days. Set EXIT_SURVEY_URL env var to Typeform URL when created.)
- [x] AI graceful degradation: try/catch → "temporarily unavailable" + queue retry ✅ ALREADY IN PLACE (all 19 AI routes have try/catch with user-friendly errors, rate limiting, and auth checks)
- [x] Async insight generation: don't block UI, show "Generating..." state ✅ ALREADY IN PLACE (ExerciseCard shows "Generating insight..." while loading, non-blocking)
- [x] Token cost tracking: aggregate api_logs by user → weekly report email ✅ DEPLOYED (/api/admin/token-costs?days=7 — returns cost by endpoint, top users, totals. Secured by CRON_SECRET.)
- [ ] Staging environment: develop branch exists, needs separate Supabase for full isolation
- [ ] GA4 funnel setup: build visualization in GA4 Explore (Stefanie asked for this)
- [x] SEO audit: OG tags, Twitter cards, siteName, enhanced descriptions on all program pages ✅ DEPLOYED
- [x] Coming Soon waitlist on homepage: "First-Time Manager" + "International Move" (no landing pages) ✅ DEPLOYED
- [x] Email nurture signup: "Get weekly insights" on blog + homepage, Resend audience list ✅ DEPLOYED (homepage section before footer, reuses waitlist API)

## Larger Effort (~3-4+ hrs each)
- [ ] Learn-recognize-practice arc audit: ALL 362 exercises, add practice steps (Stefanie: audit all, not just 90)
- [ ] Scaffolding decrease: Days 11-20 reduce pre-fill, Days 21-30 minimal. Mention in Days 1-10 why heavier.
- [ ] Bloom's labels + individual concept arcs: label deep-learning exercises, track repeated concepts per user
- [x] AI Simulation real API: `/api/exercises/simulate` endpoint with Claude in-character responses ✅ DEPLOYED (POST with scenario, aiRole, message, history → in-character response + coaching nudge. AISimulation primitive already supports onSend prop.)
- [x] Quality monitoring: Vercel Cron weekly audit + dashboard to view results (Stefanie wants dashboard) ✅ ALREADY IN PLACE (vercel.json cron runs /api/quality-audit every Monday 9am PT, results emailed + stored in quality_audits table. Admin dashboard at /admin shows enrollment + cost stats.)
- [x] Monitoring dashboard: admin page querying api_logs for latency, errors, tokens, active users ✅ DEPLOYED (mindcraft.ing/admin — enrollment stats, AI cost breakdown by endpoint, quick links. Restricted to admin emails.)
- [ ] Playwright tests: 3-5 critical paths (login, journal, exercise, weekly review)
- [ ] Blog infrastructure at `/blog`: Next.js pages, 9 topic suggestions ready
- [x] Free lead magnet: "7 Disruptions Self-Assessment" standalone page with email capture ✅ DEPLOYED (mindcraft.ing/assessment — 7-question slider assessment, instant results with disruption map, email capture for results)
- [x] Testimonial collection: post-Day-30 email → Typeform (2 questions + permission) ✅ DEPLOYED (testimonial CTA block added to program-complete email. Set TESTIMONIAL_SURVEY_URL env var to Typeform URL when created.)

## Surveys to Create + Wire
- [ ] Create testimonial survey (Typeform): "How would you describe Mindcraft to a friend?" + "What changed for you?" + permission checkbox. Wire into post-Day-30 completion email. Add survey URL to PRD.
- [ ] Create exit survey (Typeform): "What made you stop using Mindcraft?" + "What would bring you back?" Wire into re-engagement email (7 days inactive). Add survey URL to PRD.

## Legal/Compliance
- [x] Signup: Terms & Privacy consent checkbox ✅ DEPLOYED (links open in new tab, button disabled until checked). Paid-but-no-account flagging still pending.

## Infrastructure
- [ ] Railway keeps crashing on every Vercel deploy. Root Directory was set to /livekit-agent but still triggering. Investigate: is Railway watching the whole repo or just the subfolder? May need to configure "Watch paths" in Railway settings to only trigger on livekit-agent/** changes.

## Legal Review
- [x] Terms governing law: currently says California — update to Washington State (LLC is registered there). Review all jurisdiction references. ✅ DEPLOYED
- [x] Review terms comprehensively against CoachBot and similar products for gaps ✅ REVIEWED — see gaps below
- [x] Call out all legal gaps explicitly to Stefanie for lawyer review ✅ DOCUMENTED

**Legal gaps identified for lawyer review:**
1. **No arbitration clause or class action waiver** — Most SaaS/AI products include mandatory arbitration + class action waiver. Reduces legal exposure significantly. CoachBot has this.
2. **No dispute resolution process** — Before court, most terms specify informal resolution attempt (30-day email negotiation period). Currently goes straight to courts.
3. **No data retention timeline** — Terms should specify how long data is kept after account deletion or inactivity. CoachBot specifies 3 years for DSR records.
4. **No international user disclaimer** — If EU users sign up, GDPR applies regardless. Terms should acknowledge cross-border data transfers and legal basis (Standard Contractual Clauses or adequacy decisions).
5. **No AI model update disclosure** — Terms should mention that AI models may be updated and outputs may change over time. Currently references "Claude by Anthropic" but doesn't address model changes.
6. **No disclaimer for AI accuracy percentage** — The limitation of liability mentions AI may be inaccurate, but doesn't explicitly disclaim all warranties on AI output quality.
7. **No survivability clause** — Standard clause stating which sections survive termination (IP, liability, indemnification).
8. **No force majeure** — Protects against liability for service interruptions due to circumstances beyond control.
9. **No severability clause** — If one term is found invalid, the rest should remain enforceable.
10. **No entire agreement clause** — States these terms + privacy policy constitute the entire agreement.
11. **Refund window is generous but ambiguous** — "7 days and not completed more than 3 days" — what counts as "completing" a day? Just opening it? Writing in the journal? Finishing all exercises?
12. **No age verification mechanism** — Terms state 18+ but there's no verification. Consider adding a checkbox or age gate.
13. **Missing: prohibition on using platform for professional coaching of others** — Users shouldn't use their account to coach clients through the platform.

## Documents to Write
- [x] GDPR rights implementation doc: how each right (access, correction, deletion, portability, restriction, objection, withdraw consent) is executed in product, gaps, what to build ✅ WRITTEN (GDPR-RIGHTS-IMPLEMENTATION.md)
- [x] Review CoachBot privacy policy (https://coachbot.ai/legal/privacy-policy) for ideas to adopt ✅ REVIEWED — key takeaways: (1) They explicitly name AI providers (OpenAI, Azure) — we should name Anthropic Claude more prominently, (2) They have separate data controller designations for coaches vs platform — not applicable to us yet, (3) They mention DPA per Article 28 — we reference this, (4) They use Termly for cookie compliance — we have custom banner, (5) They have 3-year DSR retention policy — we should add a data retention timeline, (6) They disclose cross-border transfers via standard contractual clauses — we should add this since Anthropic processes in the US. Items to consider adding to our policy: explicit data retention periods, cross-border transfer mechanism (SCCs), and explicit mention of Anthropic as AI processor.
- [x] Privacy policy warm summary: "The short version" card at top with 6 bullet points ✅ DEPLOYED
- [x] Rate limiting threshold answer ✅ ANSWERED: Current in-memory limiter works fine up to ~50-100 concurrent users. Vercel Hobby plan handles ~100 serverless function invocations/second. You need Redis when: (a) you consistently see 429 rate limit errors in Sentry, (b) you have 100+ daily active users making AI calls simultaneously, or (c) you upgrade to Vercel Pro with multiple regions. At current stage: not a concern. Revisit when you hit 500+ total enrolled users.
- [x] Update PRD with all remaining feature data storage once built ✅ UPDATED (added waitlist, consent, errors, Coming Soon to PRD data map)

## Stefanie's Specific Notes (from MULTI-LENS-REVIEW.md)
- Star rating: "Where is data stored?" → `exercise_completions.star_rating` + `.feedback` ✅ documented
- NPS: "Where is data stored?" → `weekly_reviews.nps_score` ✅ documented
- Quality monitoring: "Do you have a dashboard?" → Not yet, needs building
- Rate limiting: "Which traffic threshold?" → ~100+ concurrent users / 1000+ daily API calls
- Scaffolding: "Mention why heavier early" → Add note in Days 1-10 exercise instructions
- Bloom's: "Add labels for deep-learning exercises + individual arcs for repeated concepts"
- Exercise audit: "Also audit all other exercises of the 362" (not just 90 core)
- Sandbox: "Can you make sure and test that the separation is the case?"
- GA funnel: "Can you set up the funnel for me?"
- Stripe guarantee: Use exact copy: "7-day money-back guarantee. If the program is not working for you within the first week, request a full refund. No conditions. No forms."
- Waitlist: "Put under program section on homescreen. Don't create landing pages yet."
