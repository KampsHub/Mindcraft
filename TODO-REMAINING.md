# Remaining Todo Items
**As of:** April 4, 2026 (end of session)

## Quick Fixes (~1 hr each)
- [ ] Exercise completion micro-animation (motion.dev scale+glow, no confetti)
- [ ] Exercise-to-exercise navigation ("Next: [Name] →" + progress dots ● ○ ○)
- [ ] Mobile touch targets 44px minimum + pulse signaling on WheelChart, StakeholderMap, BodyMap
- [ ] Add missing FAQs: "Can I pause?", "Export data?", "Journal private?", "Share with therapist?", "After 30 days?"
- [ ] Specific error messages: journal processing, exercise save, payment, auth session
- [ ] Re-enrollment CTA after program completion ("Explore other programs")
- [ ] 7-day money-back guarantee copy in Stripe checkouts (Stefanie's exact copy provided in MULTI-LENS-REVIEW.md)
- [ ] Verify sandbox/production separation (test prePopulated doesn't leak)

## Medium Effort (~2-3 hrs each)
- [ ] Spaced retrieval: RetrievalCheck exercises on Days 7, 14, 21 (seed data update)
- [ ] Progress visualization: "Then vs Now" card on weekly review page
- [ ] Skill progression badges on exercise cards (Awareness/Practice/Application/Integration by week)
- [ ] Assessment→action: update process-journal prompt to weight low-scoring domains
- [ ] whyThis chunking: shorten 5-6 longest, move framework steps into primitive prompts
- [ ] Exit survey email: 7 days inactive + not finished → email with survey link
- [ ] AI graceful degradation: try/catch → "temporarily unavailable" + queue retry
- [ ] Async insight generation: don't block UI, show "Generating..." state
- [ ] Token cost tracking: aggregate api_logs by user → weekly report email
- [ ] Staging environment: develop branch exists, needs separate Supabase for full isolation
- [ ] GA4 funnel setup: build visualization in GA4 Explore (Stefanie asked for this)
- [ ] SEO audit: meta descriptions, OG tags, structured data across all pages
- [ ] Coming Soon waitlist on homepage: "First-Time Manager" + "International Move" (no landing pages)
- [ ] Email nurture signup: "Get weekly insights" on blog + homepage, Resend audience list

## Larger Effort (~3-4+ hrs each)
- [ ] Learn-recognize-practice arc audit: ALL 362 exercises, add practice steps (Stefanie: audit all, not just 90)
- [ ] Scaffolding decrease: Days 11-20 reduce pre-fill, Days 21-30 minimal. Mention in Days 1-10 why heavier.
- [ ] Bloom's labels + individual concept arcs: label deep-learning exercises, track repeated concepts per user
- [ ] AI Simulation real API: `/api/exercises/simulate` endpoint with Claude in-character responses
- [ ] Quality monitoring: Vercel Cron weekly audit + dashboard to view results (Stefanie wants dashboard)
- [ ] Monitoring dashboard: admin page querying api_logs for latency, errors, tokens, active users
- [ ] Playwright tests: 3-5 critical paths (login, journal, exercise, weekly review)
- [ ] Blog infrastructure at `/blog`: Next.js pages, 9 topic suggestions ready
- [ ] Free lead magnet: "7 Disruptions Self-Assessment" standalone page with email capture
- [ ] Testimonial collection: post-Day-30 email → Typeform (2 questions + permission)

## Documents to Write
- [ ] GDPR rights implementation doc: how each right (access, correction, deletion, portability, restriction, objection, withdraw consent) is executed in product, gaps, what to build
- [ ] Review CoachBot privacy policy (https://coachbot.ai/legal/privacy-policy) for ideas to adopt
- [ ] Privacy policy warm summary: human-language section at top before legal text
- [ ] Rate limiting threshold answer: what traffic level requires Redis
- [ ] Update PRD with all remaining feature data storage once built

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
