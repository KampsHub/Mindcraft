# Today Flow Design — Section 0: Overview

> Split from `docs/today-flow-design.md` during repo reorg. Sections 1 + introduction.

# Today Flow: Design Document

## Recreating the Personal Coaching Flow in the Mindcraft Product

This document analyzes the personal `/today` -> journal -> `/process` -> `/processdone` workflow that runs via Claude Code in the World-of-Steffi vault, identifies what makes it effective, and specifies how to bring those qualities into the Mindcraft product's daily session flow.

**Source files analyzed:**
- Personal: `CLAUDE.md`, `MEMORY.md`, `/process SKILL.md`, `/processdone SKILL.md`, `/today SKILL.md`, journal entries (2026-03-12 through 2026-03-14), `Integration workbook.md`, `enneagram-growth-edges.md`, `LLM Context Personal/Untitled.md`
- Product: `src/app/day/[dayNumber]/page.tsx`, `src/app/api/daily-themes/route.ts`, `src/app/api/process-journal/route.ts`, `src/app/api/daily-summary/route.ts`, `src/app/api/daily-exercise/route.ts`, `src/lib/client-profile.ts`, `src/app/api/generate-profile/route.ts`

---

## 1. What the Personal Flow Does That the Product Does Not

### 1.1 The Thread Mechanic (Narrative Continuity Across 2-3 Days)

The personal workflow opens every journal with a **Thread** section: a 6-10 sentence narrative that re-reads the last 2-3 journal entries and names what moved, what got stuck, and what is emerging. It traces a specific line of development across entries, quoting what the person actually wrote and showing the movement.

**How the Thread works in practice (from 2026-03-14):**

The Thread opens by naming two things that moved on 03-13. First, it references the pattern challenge working and the user's pushback ("I'm not sure that's always the Perfecter"). It identifies that pushback as Self differentiating from the framework -- not just from the pattern, but from the lens being projected onto them. Second, it traces the earning impulse from the user's exact words about legacy. Then it connects both signals to today's integration trait (Self-Compassion) with a specific question: "can you do it without the whip?"

**How the Thread is seeded:** The `/processdone` skill generates a "Thread for tomorrow's journal" section. Example from 2026-03-12's `/processdone`:

> "Today you traced the Perfecter past the product and into professional identity -- the fear of being 'on the sidelines' after two years out of tech, needing to prove you can still produce quality. The paradox you landed on -- that the protection itself prevents the action that would actually protect -- is the edge you're standing on. Tomorrow: did you ship? Did you buy the domain? And if you did, what happened to the Perfecter when you moved anyway?"

This explicit seed gets read by the next day's `/today` skill and woven into the Thread. The Thread is not generated from scratch -- it is built on a seed from the previous session's closing.

**What the product currently does instead:** The `daily-themes` route (line 7 of `route.ts`) generates a `summary` and `carry_forward`, drawing from yesterday's session and 7-day theme history. But:

- `carry_forward` is a single sentence observation, not a narrative seed
- The route only fetches `step_1_themes` from recent sessions (line 109), not full journal text or exercise responses
- There is no `/processdone` equivalent that explicitly generates material for the next day's opening
- The result feels like a recap of yesterday, not a narrator tracing an arc across days

**Gap:** The product has no narrative continuity mechanism and no explicit seeding from one session's close to the next session's opening.

### 1.2 Backward-Looking, Personally Grounded Journal Prompts

In the personal workflow, journal prompts never reference "today" as if the day has already happened. From `MEMORY.md`: "Journaling happens in the morning -- prompts should never reference 'today' as if the day already happened. Use backward-looking framing: 'recently,' 'the last couple of days,' 'this week.'"

The personal prompt structure includes:
- An integration trait with a specific `X -> Y` reframe from the 14-trait workbook
- A "starred" integration thought explaining why this trait matters neurologically
- A direct question that connects the trait to the person's recent writing
- A "Yesterday's /process Follow-Up" section with specific commitments and coaching questions carried from the previous day
- A Weekly Edge -- a week-long challenge with daily check-ins
- A Parts Check-In with consistent part language across sessions

**What the product currently does instead:** Seed prompts come from `program_days.seed_prompts` -- pre-authored per program day. They are not personalized to what the person wrote yesterday or recently. The product has no mechanism for carrying forward coaching questions or commitments.

**Gap:** Product prompts are program-driven, not person-driven. They do not carry yesterday's commitments or coaching questions forward, and they have no backward-looking framing instruction.

### 1.3 Meditation / Mindfulness Recommendation

The personal workflow includes a specific Tara Brach guided meditation chosen based on recent journal themes. It includes the title, direct link, duration, and a short reason it fits. It also includes a "Tara Brach on this" teaching section -- 2-3 sentences connecting a Tara Brach talk to the day's pattern.

From 2026-03-13: The meditation recommendation was "Letting Go: 9 Magic Breaths" (5:50) with the reason: "Short, grounded, action-compatible. Nine breaths to release the earning grip before your day begins."

**What the product does not have:** No meditation or mindfulness recommendation. No contemplative component. No mechanism for connecting a recommended practice to the day's themes.

### 1.4 Exercise Commitment Carry-Forward

The personal flow has a multi-layered carry-forward system:

1. **Pattern Challenge:** Named in `/process`, carried into the next day's journal, checked on explicitly ("Did you try it? What happened?"). Example from 2026-03-13 journal: "Pattern Challenge: Creative energy surges -> ideas multiply -> the Perfecter demands completeness -> paralysis. The counter-move was to trust your first instinct -- ship, then iterate. Did you try it? What happened?" The user responded: "yes it worked great."

2. **Commitments from exercises:** When the user names a specific action during a `/process` exercise (e.g., "I would refine the plan and exercises and just do it"), that commitment appears in the next day's Follow-Up section.

3. **Coaching Questions:** Two coaching questions per session. Unanswered questions carry forward explicitly. From 2026-03-14: "Coaching Questions from yesterday: 'What is that? What's the sentence you didn't finish?' 'If earning stopped working tomorrow, what would you do with all that freed-up energy?' (No /processdone was run yesterday -- these carry forward.)"

4. **/processdone "For tomorrow" prompts:** Three specific prompts (watch for, try this, sit with) that seed the next day's journal as a check-in.

**What the product currently does:** The `daily-summary/route.ts` generates a `tomorrow_preview` with title, territory, and connection. The `daily-themes/route.ts` fetches yesterday's session. But:
- No explicit commitments are extracted from exercise responses
- No coaching questions are generated or carried forward
- The `tomorrow_preview.connection` is a single sentence connecting today to tomorrow's territory, not actionable prompts
- There is no check-in mechanism that asks "did you do the thing you said you would?"

**Gap:** The product does not extract commitments from exercise responses, does not generate coaching questions, and has no carry-forward system for either.

### 1.5 Voice Integrity (Never Conflating User Words with AI Words)

The personal MEMORY.md has the most detailed voice integrity rules of any system I have seen:

- "Never conflate what the user wrote with what Claude generated."
- Each journal file contains BOTH user-written sections AND Claude-generated sections
- A specific test: "If a phrase appears in a section that was pre-generated before the user wrote anything (Thread, /process 'Reading your journal' paragraphs, exercise instructions, reframes), it's Claude's words. If it appears where the user typed their response, it's the user's words."
- "When in doubt, describe the pattern rather than quoting."

The `/processdone` skill has matching rules: "Do NOT attribute Claude's exercise descriptions, coaching questions, or reframes to the user. Only quote text the user actually typed." It includes a specific detection heuristic: "How to identify inline responses: They break the formatting pattern. User responses are plain text, often in first person, sometimes incomplete sentences."

**What the product does:** The prompts in `process-journal/route.ts` and `daily-summary/route.ts` both say "Quote their actual words" -- which is good. But there is no guardrail against the reverse: attributing the system's reframes, exercise descriptions, or analysis back to the user as if they said it.

**Gap:** The product needs an explicit instruction in every AI route that generates reflective content: "Only attribute words to this person that they actually typed in their journal or exercise responses. Never attribute your analysis, reframes, or interpretations to them."

### 1.6 The /processdone Thread-Seeding Mechanism

The personal flow has a two-phase session structure:

1. `/process` -- generates exercises, coaching questions, reframe, pattern challenge
2. `/processdone` -- runs AFTER the user completes exercises, reads their inline responses, summarizes what they discovered, and generates:
   - "What you found today" (2-3 paragraphs of their discoveries)
   - "Key insights" (3-5 bullet points from the USER's words, not Claude's)
   - "For tomorrow" (watch for, try this, sit with)
   - "Thread for tomorrow's journal" (2-3 sentences that explicitly seed the next Thread)

This two-phase structure means the Thread is built not just from journal content but from what the person discovered during exercises. The `/processdone` output captures the session's landing, not just its starting point.

**What the product has:** The `daily-summary/route.ts` (Step 5) partially covers this. It generates `exercise_insights`, `goal_progress`, and `tomorrow_preview`. But:
- It does not generate a "Thread for tomorrow" seed
- It does not produce "watch for / try this / sit with" prompts
- It does not distinguish what the user found from what the system suggested
- The `tomorrow_preview` is about the program's next territory, not about the person's open edges

**Gap:** The product needs a `thread_seed` and `for_tomorrow` output from the daily-summary route, and the daily-themes route needs to fetch and use them.

### 1.7 Pattern Challenges and Weekly Edges

The personal flow has two time-scale continuity mechanisms beyond single-session carry-forward:

1. **Pattern Challenge (multi-day, from /process):** Names ONE pattern to watch for during the coming week, with a specific behavioral experiment and a counter-move. Example: "Three times this week, before you do something for someone, pause and run the Motivation Body Check: earning or giving?"

2. **Weekly Edge (from weekly-insights):** A longer-running theme from the weekly insights document that gets checked in on daily. Example: "Next time you catch yourself calculating what you need to 'offer' to earn belonging, stop and ask: 'Who in my life loves me because of my attributes -- and who loves me because I'm me?'"

Both appear as check-in sections in each daily journal: "Did I act on this recently? What happened -- or what got in the way?"

**What the product has:** Neither. The product has `client_goals` (active goals) but these are static text strings, not behavioral experiments with check-ins. The `pattern_note` in daily-summary is optional and observational, not actionable.

**Gap:** The product needs a mechanism for named, time-bounded behavioral experiments that persist across sessions and get checked in on.

### 1.8 Parts Check-Ins with Consistent Language

The personal flow maintains named protector parts with specific reframed roles and daily focus prompts that persist across sessions:

- "The Critic -> Accountability Partner: Am I putting out the energy I'm expecting back?"
- "The Endurer: Is this acceptance -- or is it the Endurer calling deprivation wisdom?"

These appear in every journal with the same language, creating a consistent vocabulary for the person's inner landscape. The language evolves through the weekly-insights process but stays stable within a week.

**What the product has:** The `client_profiles.growth_edges` has named edges (e.g., "The Quiet Exit"), but these do not have daily focus prompts, do not appear as check-in sections in the daily session, and do not have the `old role -> new role` transformation framing.

**Gap:** The product needs a mechanism for named parts with stable daily focus prompts that appear as check-ins within the session.

---

