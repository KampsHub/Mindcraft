# Quick Fixes — Can Be Done Without Product Decisions

Items I can implement without needing your input on product direction.

---

## Priority 1: Critical for Launch

### 1. Switch Stripe to live mode
- Replace test keys with live keys in Vercel env vars
- Verify webhook endpoint URL is correct for production
- **Effort:** 15 min (env var swap)

### 2. Add Sentry error monitoring
- `npm install @sentry/nextjs`, run `npx @sentry/wizard`
- Captures all production errors with stack traces
- **Effort:** 30 min

### 3. Set up daily email cron
- Add Vercel Cron Job to trigger `/api/email/daily-reminder` at 8am
- Create `vercel.json` with cron config
- **Effort:** 20 min

### 4. Add Stripe billing portal link
- One API call: `stripe.billingPortal.sessions.create()`
- Add "Manage Subscription" button on /my-account
- Users can cancel, update payment, view invoices themselves
- **Effort:** 1 hr

---

## Priority 2: Quality Improvements

### 5. Add exercise time estimates
- Add `estimatedMinutes` to exercise card header
- Parse from existing exercise data (some already have `duration_min`)
- **Effort:** 1 hr

### 6. Add "well done" celebration on exercise completion
- Use existing confetti utility + AnimatedCheckmark
- Fire on every exercise submission, not just day completion
- **Effort:** 30 min

### 7. Fix remaining grey text
- Sweep all post-login pages for any remaining `rgba(255,255,255,0.X)` text
- Replace with theme tokens
- **Effort:** 30 min

### 8. Add estimated reading time to whyThis
- Calculate word count / 200 wpm
- Show "2 min read" badge on exercise card
- **Effort:** 30 min

### 9. Fix npm security vulnerabilities
- Run `npm audit fix` to resolve the 4 flagged vulnerabilities
- **Effort:** 15 min

---

## Priority 3: User Experience

### 10. Add FAQ page
- Common questions: restart program, change email, pause, data export, cancel
- Static page, no backend needed
- **Effort:** 1 hr

### 11. Add "Pause Program" button
- Enrollment already supports "paused" status
- Add button on /my-account that sets status to paused
- Add "Resume" button that sets back to active
- **Effort:** 1 hr

### 12. Add progressive disclosure to whyThis
- Make whyThis collapsible (show first 2 lines, "Read more" expander)
- Uses existing Radix accordion
- **Effort:** 1 hr

### 13. Make exercise completion feel rewarding
- After each exercise: confetti + insight preview + "1 of 3 complete" progress
- After all exercises: bigger celebration + session summary prompt
- **Effort:** 2 hrs

### 14. Add exercise-to-exercise navigation
- "Next Exercise →" button after completing one
- Progress indicator: "Exercise 1 of 3"
- **Effort:** 1 hr

---

## Priority 4: Technical Hygiene

### 15. Add basic analytics events
- Track: page views, exercise starts, exercise completions, day completions
- Use Vercel Analytics (free) or PostHog (free tier)
- **Effort:** 2 hrs

### 16. Add staging environment
- Create Vercel preview branch for `develop`
- Separate Supabase project for staging
- **Effort:** 2 hrs

### 17. Add basic smoke tests
- Playwright: login, navigate to dashboard, start day, complete exercise
- Run on every PR
- **Effort:** 3 hrs

---

**Total for Priority 1:** ~2 hours
**Total for Priority 2:** ~3 hours
**Total for Priority 3:** ~6 hours
**Total for Priority 4:** ~7 hours

---

## Priority 5: Exercise Quality (from EXERCISE-DESIGN-LEARNINGS)

### 18. Add "now what?" to all assessment exercises
- Every WheelChart/rating exercise should end with: "Your lowest area is [X]. One action this week:"
- Affects: Seven Disruptions (3 versions), BRAVING, SCARF, 8 C's, Psychological Safety, Wheel of Life
- **Effort:** 2 hrs (update instruction + add journaling prompt per exercise)

### 19. Complete the learn-recognize-practice arc
- Exercises that stop at "recognize" need a practice step appended
- Example: Saboteur ID → add "Next time this fires, I will try ___"
- Affects: ~15 recognition-only exercises
- **Effort:** 3 hrs

### 20. Add safe exit to deep emotional exercises
- Grief Ritual, The Path Exercise, 3-2-1 Process need an "I need to pause" button
- Button saves progress + shows grounding resources (breathing exercise link, crisis line)
- **Effort:** 2 hrs (shared component + integration into 5-6 exercises)

### 21. Decrease scaffolding across the 30-day arc
- Days 1-7: 80% pre-filled, narrow choices
- Days 8-14: 50% pre-filled, wider choices
- Days 15-21: 30% pre-filled, open-ended
- Days 22-30: minimal pre-fill, independent application
- **Effort:** 4 hrs (adjust prePopulated data density per day range)

### 22. Move framework teaching into the interaction
- For exercises with 4+ concepts (NVC, Gottman, IFS 6 F's), use DialogueSequence to reveal one step at a time instead of teaching all steps in whyThis
- **Effort:** 4 hrs (redesign 5-6 key exercises)

**Total for Priority 5:** ~15 hours
**Grand total:** ~33 hours
