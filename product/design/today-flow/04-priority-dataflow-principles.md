# Today Flow Design — Section 4: Priority, Data Flow, Principles

> Split from `docs/today-flow-design.md`. Sections 8 + 9 + 10 + 11.

## 8. Implementation Priority

### Phase 1: Thread + Continuity (highest impact, moderate effort)
1. Extend `daily-themes/route.ts` to produce Thread, personal_prompt, follow_up
2. Extend `daily-summary/route.ts` to produce `for_tomorrow` and `thread_seed`
3. Update Step 1 UI to display Thread as primary content
4. Update Step 2 UI to show personal prompt and follow-up section

### Phase 2: Richer /process Output (high impact, low effort)
1. Add coaching_questions, reframe, pattern_challenge, sequence_suggestion to `process-journal/route.ts`
2. Add zero-coaching-background rule and voice integrity to system prompts
3. Cap exercises at 4
4. Update Step 3 UI for coaching questions and reframe
5. Update Step 4 UI for sequence suggestion

### Phase 3: Meditation + Parts (moderate impact, moderate effort)
1. Create meditation_library table and seed with 20-30 meditations
2. Add meditation field to daily-themes output
3. Add parts_check_in system to client_profiles
4. Surface parts prompts in Step 2 UI
5. Display meditation recommendation in Step 1

### Phase 4: Pattern Challenge Persistence (moderate impact, moderate effort)
1. Implement storage for pattern challenges (either in JSONB or new table)
2. Add carry-forward logic for active challenges
3. Build UI for active challenges in Step 1 and Step 2
4. Add check-in mechanism (did they try it?)

### Phase 5: Voice Refinement (ongoing)
1. Add "teach something" instruction to state_analysis prompt
2. Add "name the cost" instruction to pattern naming
3. Test coaching question quality and iterate on prompt
4. Test reframe quality and iterate on prompt
5. Test Thread quality across 7+ day sequences

---

## 9. Data Flow Diagram

```
Day N-2 session ──┐
Day N-1 session ──┤
  (full journals, │
   exercise resp., ├──► daily-themes/route.ts ──► Thread (2-3 paragraphs)
   summaries,      │                              personal_prompt
   thread_seed,    │                              follow_up (commitments,
   for_tomorrow,   │                                coaching Qs, highlight)
   coaching Qs)    │                              meditation
                   │                              parts_check_in
Day N program ─────┘                              themes, patterns
client_profiles ───┘                              carry_forward

                         ▼

                    Step 1: Thread
                    Step 1: Meditation recommendation
                    Step 1: Carrying forward (commitments, questions)

                         ▼

                    Step 2: Journal
                    (personal prompt + for_tomorrow check-in +
                     parts check-in + seed prompts)

                         ▼

Journal content ──────► process-journal/route.ts ──► reading (analysis)
                                                      4 exercises
                                                      coaching_questions (2)
                                                      reframe
                                                      pattern_challenge
                                                      sequence_suggestion

                         ▼

                    Step 3: Analysis + coaching Qs + reframe
                    Step 4: Exercises (in suggested sequence)

                         ▼

Session data ─────────► daily-summary/route.ts ──► summary
                                                    exercise_insights
                                                    goal_progress
                                                    tomorrow_preview
                                                    for_tomorrow (watch/try/sit)
                                                    thread_seed ──► feeds Day N+1
                                                    extracted_commitments

                         ▼

                    Step 5: Summary + Rating
```

---

## 10. Key Principles to Preserve

These rules should be encoded in the product's system prompts and treated as invariant:

1. **The Thread must reference specific patterns from the last 2-3 entries.** No generic threads. Ground every thread in concrete observations from recent sessions. If a thread_seed exists from yesterday, use it as the starting point.

2. **Journal prompts are backward-looking.** Journaling happens in the morning. Use "recently," "the last couple of days" -- not "today" as if the day already happened.

3. **Never conflate what the user wrote with what the system generated.** When reflecting back themes, quote only the person's actual words. Own your analysis as your analysis.

4. **All exercise instructions must be written for people with zero coaching background.** No jargon without explanation. Every concept explained from scratch with what/where/why.

5. **When naming patterns, teach something.** Explain the mechanism. Connect to neuroscience, psychology, or development in plain language. Not jargon -- plain language about what is happening in the brain or the system.

6. **Coaching questions should name the thing the person is circling.** They should feel slightly uncomfortable. They assume capability and push toward the edge.

7. **4 exercises, not more.** Quality and fit over modality coverage.

8. **Carry commitments and questions forward explicitly.** If the person said they would try something, ask about it tomorrow. If a coaching question went unanswered, carry it forward.

9. **Meditation recommendation tied to themes.** Short, specific, with a reason it fits.

10. **Continuity is the product.** The most valuable thing is not any single day's exercises -- it is the sense that someone has been reading carefully across days and sees the arc. The Thread is the product. Everything else supports it.

---

## 11. What the Existing Product Already Does Well

To be clear about what should NOT change:

- **The voice calibration in `process-journal` is strong.** "Warm but not sweet. Direct but not cold." Keep this.
- **The "name it boldly" instruction works.** Do not soften it.
- **The Avoid list is correct:** clinical labels, diagnostic language, empty validation, motivational language. Do not add "great job."
- **The safety protocol is solid:** crisis detection, helpline referral, empty exercise array on high urgency. Do not weaken this.
- **Framework attribution is careful.** Keep the exact-name-and-originator requirement.
- **The onboarding discovery prompt (Days 1-3) is well-designed.** The dual purpose of processing current emotions while building a picture of who the person is -- this is good coaching thinking.
- **The observation extraction in daily-summary (lines 225-265) is a good mechanism.** The non-blocking, supplementary observation append is architecturally sound.
- **The profile depth system in client-profile.ts is clean.** Three levels (summary/edges/full) with appropriate data for each context -- this scales well.
- **The generate-profile three-call architecture is good.** Context -> Edges -> Map, each building on the previous. The PROFILE_VOICE with its provisional framing ("seems to," "may," "could") is exactly right for 3 days of data.
