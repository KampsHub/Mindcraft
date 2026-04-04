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
1. **No spaced retrieval** — Concepts taught on Day 4 are never tested again. The RetrievalCheck primitive exists but isn't integrated into the program arc yet.
2. **No progress visualization for the learner** — Users can't see their own growth. "On Day 4 you wrote X, today you wrote Y" would be powerful but doesn't exist.
3. **The 30-day arc has no explicit skill progression** — The weekly themes exist (LAND → STEADY → BUILD → ORIENT) but the daily exercises don't explicitly signal "this is harder than yesterday because you're ready."
4. **Assessment without action** — Several exercises rate/assess but don't guide the user to their next step. The WheelChart rates disruptions but doesn't say "your lowest area is X — here's what to do."
5. **No follow-up on commitments** — When users commit to actions (Day 6 anchors, Day 19 boundaries), the system doesn't check back.
6. **Learn-recognize-practice arc often incomplete** — Many exercises stop at "recognize" (naming the pattern) without reaching "practice" (rehearsing the alternative behavior). Saboteur identification names the pattern but doesn't rehearse what to do when it fires. (EXERCISE-DESIGN-LEARNINGS #Part 2, Lens 1)
7. **Scaffolding doesn't decrease across the arc** — Day 1 and Day 25 exercises have similar levels of pre-filled content. Early exercises should scaffold heavily; later exercises should require independent application. (EXERCISE-DESIGN-LEARNINGS #Part 2, Lens 1)
8. **Cognitive load of whyThis sections** — Users must hold 3-4 framework concepts in working memory before interacting. NVC = 4 steps, Four Horsemen = 8 concepts. The teaching should be chunked into the interaction, not front-loaded. (EXERCISE-DESIGN-LEARNINGS #Part 2, Lens 2)
9. **No Bloom's Taxonomy alignment** — Exercises don't explicitly target cognitive levels. Sorting cards = understanding, writing dialogue = applying, comparing versions = analyzing. The primitive should match the cognitive level required. (EXERCISE-DESIGN-LEARNINGS #Part 2, Lens 1)

---

## UX Designer

### What works
- Dark theme is calming and feels intentional
- Exercise primitives are interactive and well-designed
- Animations are purposeful (spring on card drop, pulse on current day)
- The brand is warm without being condescending

### Issues
1. **Grey text on dark background** — Fixed many instances but some remain in edge cases (loading states, error boundaries, placeholder text).
2. **Long whyThis blocks are walls of text** — No progressive disclosure. Users see a paragraph of 200+ words before the exercise. Should be collapsible or staged.
3. **No estimated time per exercise** — Users don't know if an exercise takes 2 minutes or 20 minutes before starting.
4. **Mobile experience needs testing** — Touch targets on exercise primitives (especially WheelChart, StakeholderMap) may be too small on phones.
5. **No onboarding tour** — First-time users land on the dashboard with no guidance on what to do first.
6. **Exercise completion has no celebration** — The AnimatedCheckmark exists but the moment feels flat. No confetti, no "well done" message, no micro-interaction that rewards the effort.
7. **Navigation between exercises is unclear** — After completing one exercise, is there a clear path to the next?
8. **The catalog (sandbox) has no relevance to the production experience** — 362 exercises in a catalog is a developer tool, not a user feature.

---

## UX Researcher

### What works
- Quality flagging lets users report bad AI output
- Day ratings (1-5) collect satisfaction data
- Exercise ratings collect per-exercise feedback

### Issues
1. **No NPS or satisfaction survey** — No way to measure overall product satisfaction beyond day ratings.
2. **No funnel tracking** — Can't see where users drop off (signup → intake → Day 1 → Day 7 → Day 30).
3. **No session recording** — Can't observe how users interact with exercises (Hotjar, FullStory, etc.).
4. **No A/B testing** — Can't test whether exercise A or exercise B produces better outcomes.
5. **No outcome measurement** — The 7 disruptions are rated on Day 1 and Day 24, but there's no automated "here's how much you improved" insight.
6. **No qualitative feedback collection** — Quality flags capture "this was bad" but not "what would make this better?"
7. **Exit survey missing** — When a user stops using the product, there's no way to learn why.

---

## Customer Service Agent

### What works
- Contact form exists
- Crisis banner with 988 Lifeline resources
- Email system for re-engagement

### Issues
1. **No in-app support chat** — Users have to use a contact form, not live chat.
2. **No FAQ page** — Common questions ("Can I restart my program?" "How do I change my email?") have no self-service answers.
3. **No status page** — If the AI is slow or down, users have no way to know.
4. **No way to pause and resume** — The enrollment has a "paused" status but there's no UI to pause.
5. **Account deletion is immediate** — No cooling-off period. No "are you sure?" with data export reminder.
6. **No refund flow** — No self-service refund. Would need to handle via Stripe dashboard.
7. **Error messages are generic** — "Something went wrong" doesn't help users fix the issue.

---

## AI Engineer

### What works
- Claude integration is clean (single client, cached system prompts, rate limiting)
- Coaching voice is consistent across all endpoints
- Quality audit system scores AI outputs on 6 dimensions
- Memory retrieval via pgvector for context-aware coaching

### Issues
1. **No fallback model** — If Claude is down or rate-limited, the entire product stops working.
2. **No response quality monitoring in production** — Quality audits exist but aren't triggered automatically.
3. **Exercise selection may repeat** — 3-day dedup window may not be enough for users who do multiple sessions per day.
4. **No fine-tuning or evaluation pipeline** — Prompts are improved manually, not through systematic evaluation.
5. **No streaming for exercise insights** — Journal processing streams, but insight generation blocks the UI.
6. **Token costs aren't tracked per user** — API logs capture tokens but there's no per-user cost dashboard.
7. **The AI Simulation primitive uses hardcoded demo responses** — In production it needs a real API endpoint.

---

## Software Engineer

### What works
- TypeScript throughout, strict mode
- Clean component architecture (server/client separation)
- RLS on all tables
- Zod validation on all API inputs
- Theme system prevents styling inconsistency

### Issues
1. **No tests** — Zero unit tests, zero integration tests. Only a manual TEST-PLAN.md.
2. **In-memory rate limiting** — Won't work with multiple Vercel instances at scale.
3. **No error tracking** — console.error is the only error handling. Sentry needed.
4. **No CI/CD pipeline** — Push to main auto-deploys. No staging environment, no review apps.
5. **No database migrations versioning** — Schema changes are SQL files run manually.
6. **Sandbox shares production primitives** — Changes to exercise primitives affect both sandbox catalog and production app.
7. **No monitoring dashboard** — API latency, error rates, active users — all invisible.
8. **Package security** — 4 npm vulnerabilities flagged (2 moderate, 2 high).

---

## Product Manager

### What works
- Clear value proposition (30-day structured coaching for career crisis)
- Three distinct programs with specific positioning
- Revenue model (subscription per program)
- Coach referral system (Stripe promo codes)

### Issues
1. **No analytics dashboard** — Can't see key metrics (DAU, retention, completion rate, conversion).
2. **No cohort analysis** — Can't compare Jan cohort vs Feb cohort outcomes.
3. **No pricing experimentation** — Fixed $29.95, no ability to test $19 vs $39 vs $49.
4. **Completion rate unknown** — Don't know what % of users finish all 30 days.
5. **No re-enrollment path** — After completing one program, can a user start another? The flow isn't clear.
6. **No trial/freemium option** — All-or-nothing purchase. No way to try Day 1 free.
7. **No waitlist** — For programs not yet launched, there's no waitlist capture.
8. **Content updates require code deploy** — Can't update exercise text, program copy, or email templates without engineering.

---

## Product Marketing Manager

### What works
- Strong landing pages with clear messaging per program
- Program-specific messaging (layoff ≠ PIP ≠ new role)
- Testimonials section (placeholder or real?)
- SEO basics (sitemap, robots.txt)

### Issues
1. **No referral program for users** — Only coach referral codes. No "invite a friend" for users.
2. **No social proof** — No user count, no outcome statistics, no case studies on landing pages.
3. **No content marketing** — No blog, no resources section, no thought leadership.
4. **No email nurture sequence** — Only welcome + daily reminder. No educational drip campaign for non-customers.
5. **No retargeting** — No Facebook Pixel, no Google Ads tag, no LinkedIn Insight Tag.
6. **No testimonial collection** — No automated flow to ask happy users for reviews.
7. **SEO could be stronger** — Program pages exist but meta descriptions, OG tags, structured data may be thin.
8. **No comparison page** — "Mindcraft vs therapy" or "Mindcraft vs coaching" would help position.
9. **No pricing page** — Pricing is embedded in landing pages, not a standalone page.
10. **No free resources** — No lead magnet (free assessment, PDF guide, webinar) to capture emails before purchase.
