# Multi-Lens Product Review
**Date:** 2026-04-04

---

## Learning Facilitator

### What works
- The Tell → Do → Done arc is sound pedagogy: reflect → practice → consolidate
- Exercises build on each other across days (saboteurs Day 4 → cost Day 18 → contingency Day 25)
- whyThis sections teach frameworks before practicing them
- Pre-populated data lowers cognitive load for overwhelmed users

### Issues
1. **No spaced retrieval** — Concepts taught on Day 4 are never tested again.
> **Q: How can you integrate it?**
> **A:** Insert a 2-question RetrievalCheck as the first exercise on Days 7, 14, 21 — testing concepts from 3 days prior. Day 7 tests saboteurs (Day 4), Day 14 tests NVC (Day 10), Day 21 tests Gottman (Day 12). Takes 60 seconds. **Status: Can execute.**

2. **No progress visualization for the learner.**
> **Q: How would you integrate that without overwhelming the user?**
> **A:** A single "Then vs Now" card on the weekly review page — not daily. One quote from Week 1 next to one from this week. One card, two sentences. **Status: Can execute (~2 hrs).**

3. **The 30-day arc has no explicit skill progression.**
> **Q: How would you show that in the product?**
> **A:** Small badge on exercise card: "Awareness" (Week 1), "Practice" (Week 2), "Application" (Week 3), "Integration" (Week 4). Just a word, not a number. **Status: Can execute (~1 hr).**

4. **Assessment without action.**
> **Q: What's the action you then use in goals or insights?**
> **A:** AI insight says: "Your lowest-rated area was [X]. This week's exercises will focus there." process-journal API weights exercise selection toward low-scoring domains. **Status: Can execute (prompt update ~1 hr).**

5. **No follow-up on commitments.**
> **Q: The system checks the next day. Is that not the case?**
> **A:** You're right — TellTab already shows "Yesterday's takeaways." Daily check is working. Multi-day check (Day 6→Day 14) isn't, but daily is sufficient for now. **Status: No action needed.**

6. **Learn-recognize-practice arc often incomplete.**
> **Q: Can you review and implement changes?**
> **A:** Yes — audit 90 core exercises, add practice steps where missing. **Status: Can execute (~4 hrs).**
Stefanie: Also audit all other exercises of the 362.

7. **Scaffolding doesn't decrease across the arc.**
> **Q: Can you execute? (keep light touch early)**
> **A:** Days 1-10: current levels. Days 11-20: reduce to 1-2 examples. Days 21-30: empty with good placeholders. Visual weight stays same. **Status: Can execute (~4 hrs).**
Stefanie: Make sure you mention at least once or twice in the first 10 days why it may feel a little heavier.

8. **Cognitive load of whyThis sections.**
> **Q: Shorten and chunk into interaction.**
> **A:** Cut whyThis to 2-3 sentences for the 5-6 longest exercises, move framework steps into primitive prompts/labels. **Status: Can execute (~3 hrs).**

9. **No Bloom's Taxonomy alignment.**
> **Q: Is that important for the customer?**
> **A:** No — internal design guidance only, not user-facing. **Status: No action needed.**
Stefanie: You may want to add labels to the exercises and veer towards those for the tentative exercises that are a little more on the deep learning front (bring up an individual arc for each customer if a concept is mentioned multiple times)
---

## UX Designer

### Issues
1. **Grey text** — **Resolved.**

2. **Long whyThis blocks** — **Noted, won't solve now.** Addressed via chunking (#8 above).

3. **No estimated time per exercise.**
> **Q: Note on top right of exercise box.**
> **A:** Adding `estimatedMinutes` badge. **Status: Executing now.**

4. **Mobile touch targets too small.**
> **Q: Solve + make interactive via dynamic signaling.**
> **A:** 44px minimum on WheelChart, StakeholderMap, BodyMap + pulse animation (3 cycles). **Status: Can execute (~2 hrs).**

5. **No onboarding tour.** — **Your action (Loom video).**

6. **Exercise completion feels flat.**
> **Q: Motion.dev micro-interaction? No confetti/tacky stuff.**
> **A:** Subtle scale-up + glow: checkmark draws, scales 1.0→1.15→1.0, card border briefly glows coral. Like Linear's completion. **Status: Can execute (~1 hr).**

7. **Navigation between exercises unclear.**
> **Q: Make visually clearer.**
> **A:** "Next: [Exercise Name] →" button + progress dots (● ○ ○). **Status: Can execute (~2 hrs).**

8. **Sandbox vs production.**
> **A:** Already separate. Sandbox = localhost:3001 only. Production uses same components but AI-provided data. **Status: No action needed.**
Stefanie: Can you make sure and test that the separation is the case?
---

## UX Researcher

### Issues
1. **No NPS.**
> **Q: Ask at every weekly insight session?**
> **A:** Adding NPS slider (0-10) at end of weekly review. **Status: Can execute (~1 hr).**
Stefanie: Make sure you tell me where you store the data.

2. **No funnel tracking.**
> **Q: Google Analytics?**
> **A:** Adding GA events: `signup_started`, `intake_completed`, `day_1_started`, `day_7_completed`, `day_30_completed`. Use GA4 Funnel exploration. **Status: Can execute (~2 hrs).**
Stefanie: Can you set up the funnel for me?

3. **No session recording.** — **Backburner.**
4. **No A/B testing.** — **Backburner.**

5. **No outcome measurement.**
> **Q: Assessment is subjective.**
> **A:** Agreed — won't show "improved by X%." **Status: No action needed.**

6. **No qualitative feedback.**
> **Q: Star rating after exercise. ≤3 → feedback box.**
> **A:** Adding 5-star rating + conditional text field. **Status: Executing now.**

7. **Exit survey missing.**
> **Q: Email if inactive 7 days but not finished.**
> **A:** Adding to re-engage flow with survey link. **Status: Can execute (~2 hrs).**

---

## Customer Service Agent

### Issues
1. **No in-app chat.** — **Fine for now.**

2. **Missing FAQs.**
> **Q: Are FAQs missing?**
> **A:** Adding: "Can I pause?", "How to export data?", "Is journal private?", "Share with therapist?", "What after 30 days?" **Status: Can execute (~30 min).**

3. **No status page.**
> **Q: Add error message after reasonable time.**
> **A:** If AI >30 seconds: "Taking longer than usual. Still processing — please wait." **Status: Can execute (~30 min).**

4. **No pause/resume.**
> **Q: When does enrollment get paused?**
> **A:** Currently only via database. Adding "Pause Program" button on /my-account. **Status: Can execute (~1 hr).**

5. **Account deletion immediate.**
> **Q: Introduce confirmation box.**
> **A:** "Are you sure?" dialog + data export reminder + download option. **Status: Can execute (~1 hr).**

6. **No refund flow.** — **Manual via Stripe. Your action.**

7. **Error messages generic.**
> **Q: Where to integrate better messages?**
> **A:** Journal processing, exercise save, payment, auth session — each gets specific message. **Status: Can execute (~1 hr).**

---

## AI Engineer

### Issues
1. **No fallback model.**
> **Q: What can you do?**
> **A:** Graceful degradation: "Coaching assistant temporarily unavailable. Journal saved, will process shortly." Queue for retry. **Status: Can execute (~2 hrs).**

2. **No quality monitoring.**
> **Q: What can you do?**
> **A:** Vercel Cron running quality-audit weekly, 10 random sessions. **Status: Can execute (~1 hr).**
Stefanie: Do you have a dashboard to look at the monitoring?

3. **Exercise selection repeats.**
> **Q: Dedup 7 days. Mindful journal always there.**
> **A:** Changing 3→7 day window. **Status: Executing now.**

4. **No evaluation pipeline.**
> **Q: What do you need beyond voice docs?**
> **A:** Monthly sample review via quality-audit scoring. Comes with #2. **Status: Can execute with #2.**

5. **Insight generation blocks UI.**
> **Q: How does it block?**
> **A:** Synchronous API call — user waits 5-10s. Fix: async + "Generating insight..." state. **Status: Can execute (~2 hrs).**

6. **Token costs not tracked.**
> **Q: Fix — need tracking and reporting.**
> **A:** Aggregate api_logs by user → sum tokens → weekly report. **Status: Can execute (~2 hrs).**

7. **AI Simulation hardcoded.**
> **Q: Keep real with API endpoint.**
> **A:** Creating `/api/exercises/simulate`. **Status: Can execute (~3 hrs).**

---

## Software Engineer

### Issues
1. **No tests.**
> **Q: Integrate automatically?**
> **A:** Playwright for 3-5 critical paths, run on every PR. **Status: Can execute (~3 hrs).**

2. **In-memory rate limiting.**
> **Q: Explain?**
> **A:** Serverless = each request may hit different server. Current limiter is per-server, not shared. Fine at current traffic. Needs Redis at scale. **Status: Not urgent.**
Stefanie: Which traffic threshold do i need to hit to rethink this?

3. **No error tracking.**
> **Q: Implement?**
> **A:** Sentry — 30 min setup. **Status: Executing now.**

4. **No staging environment.**
> **Q: Need proper staging.**
> **A:** Creating `develop` branch. Vercel auto-creates preview deployments. **Status: Can execute (~30 min).**

5. **No migrations versioning.** — **OK with manual for now.**

6. **Sandbox shares primitives.**
> **Q: What does this mean?**
> **A:** Same component files used by both sandbox and production. This is correct — ensures consistency. Data is different (sandbox = demo, production = real). **Status: No action needed.**

7. **No monitoring dashboard.**
> **Q: I'd like one.**
> **A:** Starting with admin page querying api_logs. **Status: Can execute (~3 hrs).**

8. **npm vulnerabilities.**
> **Q: What does this mean?**
> **A:** 4 packages have known security bugs. `npm audit fix` patches them. **Status: Executing now.**

---

## Product Manager

### Issues
1. **No analytics dashboard.**
> **Q: Set up in GA?**
> **A:** Adding GA events. DAU/retention automatic. **Status: Can execute (~2 hrs).**

2. **No cohort analysis.**
> **Q: How?**
> **A:** GA4 Cohort exploration — free with funnel events. **Status: Comes with #1.**

3. **No pricing experimentation.**
> **Q: How to test? Statsig?**
> **A:** Statsig/PostHog flags + different Stripe price IDs. I set up infrastructure, you run experiments. **Status: Can set up (~2 hrs).**

4. **Completion rate unknown.**
> **Q: How to track?**
> **A:** GA event `day_completed` with day_number. Or Supabase query. **Status: Comes with GA events.**

5. **No re-enrollment path.**
> **Q: Can a user start another program?**
> **A:** Yes, already supported. DB allows one enrollment per program. Need CTA after completion: "Explore other programs." **Status: Can add (~30 min).**

6. **No trial/freemium.**
> **Q: Money-back guarantee — make clearer.**
> **A:** Adding "30-day money-back guarantee" text on landing pages + Stripe checkout. **Status: Can execute (~30 min).**
> Stefanie: Instead, integrate this copy in the live stripe checkouts: ## 7-day money-back guarantee

If the program is not working for you within the first week, request a full refund. No conditions. No forms. If it is not useful, you should not pay for it.

7. **No waitlist.**
> **Q: Where to show "First-Time Manager" and "International Move"?**
> **A:** "Coming Soon" section on homepage. Email capture per program. **Status: Can execute (~2 hrs).**
> Stefanie: OK, put under the program section on homescreen. don't yet create a landing page, however.

8. **Content updates require deploy.**
> **Q: How to change?**
> **A:** Move to Supabase tables + admin page (~20+ hrs), or Sanity CMS for marketing copy. **Status: Future project.**

---

## Product Marketing Manager

### Issues
1. **No user referral program.** — **Need to tackle. Requires product decision.**

2. **No social proof.**
> **Q: Testimonials not enough?**
> **A:** Sufficient for launch. Outcome stats stronger — generate from data once you have users. **Status: Sufficient.**

3. **No content marketing.**
> **Q: Blog + topics?**
> **A:** Blog at `mindcraft.ing/blog`. 9 topics suggested (3 per program). I set up infrastructure, you write content. **Status: Can set up (~3 hrs).**

4. **No email nurture.**
> **Q: Separate list for non-customers?**
> **A:** Yes. "Get weekly insights" signup on blog + homepage. Resend audience list. **Status: Can set up (~2 hrs).**

5. **No retargeting.** — **Your action when you start performance marketing.**

6. **No testimonial collection.**
> **Q: How to easily do this?**
> **A:** Post-completion email → Typeform (2 questions + permission toggle). **Status: Can set up (~1 hr).**

7. **SEO could be stronger.**
> **A:** Audit + enhance meta descriptions, OG tags, structured data. **Status: Can execute (~2 hrs).**

8. **No comparison page.** — **Already positioned on homescreen. No further action.**

9. **No pricing page.**
> **Q: Changes to Stripe page?**
> **A:** No Stripe changes. Standalone /pricing page optional, not urgent. **Status: Not urgent.**

10. **No free lead magnet.**
> **Q: What can be easily set up?**
> **A:** "7 Disruptions Self-Assessment" — free WheelChart page. Email capture → PDF result → program recommendation. **Status: Can execute (~3-4 hrs).**
