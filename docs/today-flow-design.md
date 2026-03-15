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

## 2. Specific Product Changes Needed

### 2.1 Add a Thread to the Daily Session (Step 1)

**API route:** `src/app/api/daily-themes/route.ts`

**Data to fetch (changes to current queries):**

Current (line 78-113): fetches yesterday's session, yesterday's exercises, recent free-flow (2 days), theme history (7 days), active goals.

Needed additions:
- Fetch last 2-3 sessions with FULL `step_2_journal`, `step_3_analysis`, AND `step_5_summary` (currently only fetches `step_1_themes`, `step_2_journal`, `step_5_summary` from recent sessions at line 109)
- Fetch `exercise_completions.responses` for last 2-3 sessions (currently only fetches yesterday's exercises)
- Fetch today's `program_days.title` and `territory` (not currently fetched)
- Fetch the `thread_seed` from yesterday's `step_5_summary` (new field -- see Section 2.5)
- Fetch any active `pattern_challenges` (new -- see Section 4)
- Fetch `client_profiles.growth_edges` for edge naming

**Prompt modification:** Replace the current `THEMES_SYSTEM_PROMPT` (lines 7-40) output schema with:

```
## What you produce

Return valid JSON (no markdown, no code fences):

{
  "thread": "2-3 paragraphs of narrative prose. Re-read the last 2-3 journal entries
    AND exercise responses. Quote the person's actual words. Trace the movement:
    where did they go deeper? Where did they push back? Where did a pattern show up
    again? Connect the arc to today's program territory. This should feel like someone
    who has been reading carefully says: 'Here is the line I see across the last few
    days, and here is why today matters.'

    If a thread_seed was provided from yesterday's summary, use it as your starting
    point -- it was written to seed exactly this narrative.

    VOICE INTEGRITY: Only attribute words to the person that they actually wrote in
    their journal or exercise responses. Never attribute your analysis, reframes, or
    interpretations to them. If you name a pattern, own it: 'I see X' not 'You said X'
    unless they literally said X.",

  "themes": ["theme 1", "theme 2", "theme 3"],
  "summary": "Brief 2-sentence summary for metadata.",

  "personal_prompt": {
    "prompt": "A personally grounded journaling prompt. Use backward-looking framing:
      'recently', 'the last couple of days'. Never reference 'today' as if the day has
      already happened. Connect to what the person wrote recently.",
    "context": "Why this prompt fits right now -- reference their recent writing."
  },

  "follow_up": {
    "commitments": ["Things they explicitly said they would do in exercise responses
      or journal. Only include things they actually said -- not things you suggested."],
    "coaching_questions": ["Unanswered coaching questions from prior sessions. Only
      carry forward questions that the person did not respond to."],
    "highlight": "A specific exercise response worth revisiting -- something they
      wrote that opened something up or that they left unfinished."
  },

  "patterns": [
    {
      "observation": "A pattern across multiple days with evidence.",
      "days_observed": 3,
      "connection": "How this connects to their edges."
    }
  ],

  "carry_forward": "A living question or observation to carry into today."
}
```

**Token budget:** Increase `max_tokens` from 1024 to 2048.

**UI rendering in Step 1:** The Thread should be the primary content -- 2-3 paragraphs of flowing prose rendered in a readable serif font. Below it: the follow-up section (commitments, coaching questions, highlight) rendered as a distinct "Carrying forward" card. Themes and patterns appear as secondary metadata below.

### 2.2 Enrich the Journal Prompt (Step 2)

**API route:** No new route needed. The `personal_prompt` from `daily-themes` feeds into Step 2.

**UI change in Step 2 (`page.tsx`):** Currently (around line 500-600 of `page.tsx`), Step 2 shows seed prompts from `programDay.seed_prompts`. Add above the seed prompts:

1. The `personal_prompt` from Step 1 output, rendered as the primary prompt with context
2. The `follow_up.commitments` and `follow_up.coaching_questions` as a "Before you write" card with check-in questions: "You said you would [commitment]. Did you? What happened?" and "From last time: [coaching question]"

The seed prompts remain as secondary prompts below, labeled "Today's territory prompts."

### 2.3 Add Coaching Questions, Reframe, Pattern Challenge to Step 3

**API route:** `src/app/api/process-journal/route.ts`

**Prompt modifications to `PROCESS_SYSTEM_PROMPT` (line 7-64):**

Add to the output schema (after `overflow_exercises`):

```json
"coaching_questions": [
  "A genuinely probing question that names the thing the person is circling around
    but has not said directly. It should feel slightly uncomfortable to sit with.
    It assumes the person is capable and pushes toward the edge. Not a therapy
    question -- a coaching question.",
  "Another question that connects to a different thread from today's journal."
],

"reframe": {
  "old_thought": "A direct quote or close paraphrase from their journal -- the
    specific thought pattern being addressed.",
  "new_thought": "A reframe that the person has not said yet but that connects to
    their own language. Not the opposite of the old thought -- the fuller picture.",
  "source_quote": "The exact words from their journal this reframe responds to."
},

"pattern_challenge": {
  "pattern": "The recurring pattern being named -- described concretely with examples
    from the journal.",
  "challenge": "A specific behavioral experiment for the next few days. Not an exercise
    -- a real-world action to try when the pattern shows up.",
  "counter_move": "What to do in the moment when the pattern activates. One sentence.
    Verb first."
},

"sequence_suggestion": "Recommended order for the exercises with brief rationale.
  Start with grounding/somatic, then cognitive, then relational or integrative.
  Include approximate total time."
```

**Add zero-coaching-background rule (insert after line 63 in the system prompt):**

```
## Exercise Description Quality -- ABSOLUTE RULE

All exercise instructions in custom_framing MUST be written for people with ZERO
coaching background. No jargon without explanation.

If an exercise references ANY concept (saboteur, parts work, somatic mapping, defusion,
window of tolerance, inner child, shadow work, cognitive distortion, ventral vagal,
polyvagal), you MUST explain:
1. What the concept is -- in one plain sentence
2. Where it comes from -- the framework or researcher
3. Why it matters right now -- connected to their specific situation

A prompt like "Identify your top saboteur patterns" is NOT acceptable. It needs:
"A saboteur is a term from Positive Intelligence (Shirzad Chamine) for the automatic
thought patterns that hijack your mind under stress -- like a harsh inner critic or
a controller that needs everything perfect before moving forward. Think of them as
mental habits, not character flaws."

Test every exercise description: would someone who has never been to therapy or
coaching understand every word?
```

**Add voice integrity instruction:**

```
## Voice Integrity

When you reference what this person wrote, only quote text that appeared in their
journal entry. Never attribute your own analysis, reframes, or interpretations to
them. Own your observations: "I see a pattern where..." not "You said..." unless
they literally said it.

When quoting exercise responses from previous sessions, clearly distinguish:
- What the person typed (their words)
- What the exercise instruction said (system words)
- What your analysis concluded (your words)
```

**Cap exercises at 4:** Update selection rule 1 (line 55):

```
1. Select exactly 4 exercises total. Prioritize relevance over modality coverage.
   If the person needs three somatic exercises today, select three somatic and one
   from another modality. Quality and fit over balance.
```

**Token budget:** Increase `max_tokens` from 2048 to 3000.

**UI rendering:** Add new cards in Step 3/4:
- Coaching Questions card: two questions rendered as standalone prompts to sit with
- Reframe card: old thought crossed out, new thought below, source quote in italics
- Pattern Challenge card: persistent across days (see Section 4)
- Sequence Suggestion: show as a numbered list above the exercise cards

### 2.4 Add Meditation Recommendation

**Approach:** Add a `meditation` field to the `daily-themes` output rather than a separate route.

**Add to the daily-themes output schema:**

```json
"meditation": {
  "title": "Name of the guided meditation",
  "teacher": "Teacher name",
  "url": "Direct link to the meditation",
  "duration_minutes": 10,
  "reason": "One sentence connecting this meditation to recent themes. Not generic --
    reference what showed up in the Thread."
}
```

**Data source:** Create a `meditation_library` table in Supabase:

```sql
CREATE TABLE meditation_library (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  teacher TEXT NOT NULL,
  url TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  themes TEXT[] NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Seed with 20-30 meditations from Tara Brach, Jack Kornfield, Jon Kabat-Zinn, and others, tagged by theme (overwhelm, anger, self-criticism, grief, fear, boundaries, self-worth, body-disconnection, relationship-repair, letting-go, trust, identity).

The daily-themes route fetches the full meditation library (or a filtered subset by theme) and includes it in the prompt. Claude selects one based on the Thread themes.

**UI rendering in Step 1:** Show meditation recommendation as an optional "Before you write" card between the Thread and the journal. Include title, teacher, duration, direct link, and the one-sentence reason.

### 2.5 Extend Daily Summary for Thread Seeding (Step 5)

**API route:** `src/app/api/daily-summary/route.ts`

**Add to the `SUMMARY_SYSTEM_PROMPT` output schema (after `pattern_note`):**

```json
"for_tomorrow": {
  "watch_for": "A specific moment or pattern to notice tomorrow -- connected to
    what surfaced today. Concrete enough to catch in real life.",
  "try_this": "A small behavioral experiment to carry into tomorrow. One action,
    under 2 minutes, verb-first.",
  "sit_with": "A question to hold without answering. A living question that needs
    holding, not resolving."
},

"thread_seed": "2-3 sentences that explicitly seed tomorrow's Thread. Name what was
  discovered today and the open question going forward. This should be specific enough
  that tomorrow's Thread can build directly on it. Reference the person's words.
  Name the edge they are approaching. Do not give instructions -- name what happened
  and what is emerging."
```

**Add voice integrity instruction to the summary prompt:**

```
When generating the thread_seed and for_tomorrow:
- Only reference what the person actually wrote or said during exercises
- Do not attribute your exercise instructions, reframes, or analysis to them
- The thread_seed should be built from their discoveries, not from your suggestions
```

**Token budget:** Increase `max_tokens` from 1500 to 2000.

**Storage:** The `thread_seed` and `for_tomorrow` are stored as part of the `step_5_summary` JSONB field in `daily_sessions`. The `daily-themes` route fetches them from yesterday's session.

---

## 3. The "Thread" Implementation -- Full Specification

### 3.1 Data Pipeline

```
Day N-1 daily_sessions.step_5_summary.thread_seed
  +
Day N-2 daily_sessions.step_2_journal (full text)
Day N-1 daily_sessions.step_2_journal (full text)
  +
Day N-2 exercise_completions.responses
Day N-1 exercise_completions.responses
  +
Day N-1 daily_sessions.step_5_summary.for_tomorrow
  +
Day N program_days.title, .territory
  +
client_profiles.growth_edges (edge names)
  +
Active pattern_challenges (if stored -- see Section 4)

  ═══► daily-themes/route.ts ═══► Thread (2-3 paragraphs)
```

### 3.2 Query Changes in `daily-themes/route.ts`

**Replace the recent sessions query (current lines 107-113):**

```typescript
// Fetch last 3 sessions with full journal and summary data
const { data: recentSessions } = await supabase
  .from("daily_sessions")
  .select("day_number, step_2_journal, step_3_analysis, step_5_summary")
  .eq("enrollment_id", enrollmentId)
  .lt("day_number", dayNumber)
  .order("day_number", { ascending: false })
  .limit(3);
```

**Add exercise responses query:**

```typescript
// Fetch exercise responses from last 3 sessions
const recentSessionIds = (recentSessions || []).map(s => s.id);
const { data: recentExerciseResponses } = await supabase
  .from("exercise_completions")
  .select("daily_session_id, framework_name, responses, star_rating")
  .in("daily_session_id", recentSessionIds)
  .order("completed_at", { ascending: true });
```

**Add today's program day query:**

```typescript
// Fetch today's program day for territory context
const { data: enrollment } = await supabase
  .from("program_enrollments")
  .select("program_id")
  .eq("id", enrollmentId)
  .single();

let todayContext = { title: "", territory: "" };
if (enrollment) {
  const { data: todayDay } = await supabase
    .from("program_days")
    .select("title, territory")
    .eq("program_id", enrollment.program_id)
    .eq("day_number", dayNumber)
    .single();
  if (todayDay) todayContext = todayDay;
}
```

### 3.3 Prompt Construction

Replace the current `promptData` (lines 133-164) with:

```typescript
// Extract thread_seed from yesterday's summary
const yesterdaySummary = recentSessions?.[0]?.step_5_summary as Record<string, unknown>;
const threadSeed = yesterdaySummary?.thread_seed || null;
const forTomorrow = yesterdaySummary?.for_tomorrow as Record<string, unknown> || null;

// Extract coaching questions from yesterday's process analysis
const yesterdayAnalysis = recentSessions?.[0]?.step_3_analysis as Record<string, unknown>;
const prevCoachingQuestions = (yesterdayAnalysis as Record<string, unknown>)?.coaching_questions || [];

// Build exercise responses text
const exerciseResponsesText = (recentExerciseResponses || [])
  .map(e => `- ${e.framework_name}: ${JSON.stringify(e.responses).substring(0, 400)}`)
  .join("\n");

const promptData = `
## Thread Seed from Yesterday's Summary
${threadSeed || "No thread seed available."}

## For Tomorrow (from yesterday's summary)
${forTomorrow ? `Watch for: ${forTomorrow.watch_for}\nTry this: ${forTomorrow.try_this}\nSit with: ${forTomorrow.sit_with}` : "None."}

## Recent Journal Entries (last 2-3 sessions)
${recentSessions && recentSessions.length > 0
  ? recentSessions.map(s => {
      return `### Day ${s.day_number}\n**Journal:**\n${s.step_2_journal || "(no entry)"}\n\n**Summary:** ${(s.step_5_summary as Record<string, unknown>)?.summary || "(no summary)"}`;
    }).join("\n\n---\n\n")
  : "No prior sessions."}

## Recent Exercise Responses (what the person wrote during exercises)
${exerciseResponsesText || "No exercise responses yet."}

## Previous Coaching Questions (may need carrying forward)
${Array.isArray(prevCoachingQuestions) && prevCoachingQuestions.length > 0
  ? (prevCoachingQuestions as string[]).map(q => `- ${q}`).join("\n")
  : "None."}

## Today's Program Context
Day ${dayNumber}: ${todayContext.title}
Territory: ${todayContext.territory}

## Active Goals
${activeGoals && activeGoals.length > 0
  ? activeGoals.map(g => `- ${g.goal_text}`).join("\n")
  : "No active goals yet."}

Generate the Thread and today's themes for Day ${dayNumber}.`;
```

### 3.4 How the Thread Renders in the UI

**Step 1 card redesign:**

The current Step 1 displays themes as tags and a summary paragraph. Replace with:

1. **Thread** -- the primary content. 2-3 paragraphs of flowing prose. Rendered in a clean reading font. No tags, no labels, no metadata around it. Just the narrative.

2. **Carrying Forward** (collapsible card below the Thread):
   - Commitments: "You said you would: [list]. Did you?"
   - Coaching questions: "From last time: [question]"
   - Highlight: "Something you wrote that might be worth sitting with: [quote]"

3. **Meditation** (optional card):
   - Title, teacher, duration, link, one-sentence reason

4. **Themes** (secondary, below everything): small tag chips for metadata purposes

---

## 4. Coaching Question and Commitment Carry-Forward

### 4.1 Where Commitments and Questions Come From

**Coaching questions** are generated by the `process-journal` route (new field -- see Section 2.3). Two questions per session.

**Commitments** are extracted from:
- The user's exercise responses (`exercise_completions.responses`) -- when they write "I will do X" or "Tomorrow I want to try Y"
- The user's journal entry (`step_2_journal`) -- when they name a specific intention
- The pattern challenge's behavioral experiment

### 4.2 Storage Options

**Option A: Store in existing JSONB fields (recommended for v1)**

Store coaching questions and commitments inside the existing `step_3_analysis` and `step_5_summary` JSONB fields:

- `step_3_analysis.coaching_questions`: string[] -- the 2 questions generated
- `step_3_analysis.pattern_challenge`: object -- the pattern/challenge/counter_move
- `step_3_analysis.reframe`: object -- old/new/source_quote
- `step_5_summary.for_tomorrow`: object -- watch_for/try_this/sit_with
- `step_5_summary.thread_seed`: string
- `step_5_summary.extracted_commitments`: string[] -- commitments identified from exercise responses

The daily-themes route already fetches `step_3_analysis` and `step_5_summary` from recent sessions. No schema change needed.

**Option B: New database table (for v2)**

```sql
CREATE TABLE session_carry_forward (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES program_enrollments(id),
  source_session_id UUID NOT NULL REFERENCES daily_sessions(id),
  source_day_number INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('coaching_question', 'commitment', 'pattern_challenge', 'for_tomorrow')),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'addressed', 'dropped')),
  addressed_on_day INTEGER,
  addressed_response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

This table would allow tracking whether each item was addressed and what the person said about it. The daily-themes route would query active items and the UI could show them as a checklist.

### 4.3 How They Surface in the Next Day's Flow

In the `daily-themes` route, after fetching yesterday's session:

1. Extract `coaching_questions` from `step_3_analysis` -- check if the person responded to them (look for the questions in the next day's journal text or exercise responses). If not addressed, carry forward.

2. Extract `extracted_commitments` from `step_5_summary` -- these are things the person said they would do. Include in the `follow_up.commitments` field.

3. Extract `pattern_challenge` from `step_3_analysis` -- if this is still within its time window (e.g., "this week"), include as an active challenge.

4. Extract `for_tomorrow` from `step_5_summary` -- include as part of the journal follow-up section.

### 4.4 How They Render in the UI

**Step 1 (Carrying Forward card):**

```
Carrying forward from yesterday

You said you would:
- [ ] "Refine the model, bring in the coaching plans, release it"
- [ ] "Buy the domain"

From last time (unanswered):
  "If earning stopped working tomorrow, what would you do with
   all that freed-up energy?"

Pattern to watch for this week:
  Earning disguised as generosity. Before doing something for
  someone, pause: earning or giving?
```

**Step 2 (before the journal textarea):**

Show the `for_tomorrow` prompts as lightweight check-in prompts:
- "Yesterday we suggested watching for: [watch_for]. Did you notice it?"
- "Try this: [try_this]"
- "Sit with: [sit_with]"

---

## 5. Voice Integrity Rules for the Product

### 5.1 The Core Rule

**Add to EVERY AI route system prompt that generates reflective content** (`daily-themes`, `process-journal`, `daily-summary`):

```
## VOICE INTEGRITY -- MANDATORY

When you reference what this person wrote, you must only quote text that they
actually typed in their journal entry or exercise responses.

Never attribute your own analysis, reframes, coaching questions, exercise
instructions, or interpretations to them. These are YOUR words:
- Exercise descriptions and instructions
- "Reading your journal" analysis paragraphs
- Reframes (old thought -> new thought)
- Pattern names and descriptions
- Coaching questions
- Concept explanations

These are THEIR words:
- Text typed in the journal entry
- Text typed in exercise response fields
- Text typed in free-flow captures

The test: if the text appeared in a field that was pre-populated by the system
before the person wrote anything, it is system words. If it appeared in a field
where the person typed their response, it is their words.

When you are unsure whether a phrase is theirs or yours, describe the pattern
you see rather than quoting. Say "there seems to be a pattern of X" rather
than "you said X."

Own your observations: "I see..." or "What I notice is..." -- not "You said..."
unless they literally said it.
```

### 5.2 UI-Level Voice Integrity

In the product UI, distinguish system-generated content from user content visually:

- **User's words:** Render in a distinct style (e.g., slightly different background, italic, or with a small "your words" indicator)
- **System analysis:** Render without quotes, clearly as the system's voice
- **Quoted user words within system analysis:** Use quotation marks and a visual distinction (different color, indented block)

In the Step 1 Thread, when the system quotes the user, use consistent formatting: either literal quotation marks or a visually distinct inline quote style.

### 5.3 Route-Specific Additions

**`daily-themes/route.ts`:** Add the full VOICE INTEGRITY block to `THEMES_SYSTEM_PROMPT` (after the current Guidelines section).

**`process-journal/route.ts`:** Add the block to `PROCESS_SYSTEM_PROMPT` (after the current Avoid list, before the output schema). Also add: "In the coaching_questions field, the questions come from YOU, not from them. Do not phrase questions as if the person asked them. They are your questions TO the person."

**`daily-summary/route.ts`:** Add the block to `SUMMARY_SYSTEM_PROMPT`. Also add: "In the thread_seed, reference what the person discovered through their own exercise responses. Do not reference what the exercises suggested -- reference what the person found when they did the exercise."

---

## 6. Exercise Description Quality

### 6.1 The "Zero Coaching Background" Rule

**Add to `process-journal/route.ts` system prompt (insert after the Selection Rules section, before the Response format):**

```
## Exercise Description Quality -- ABSOLUTE RULE

All exercise instructions in custom_framing MUST be written for people with ZERO
coaching background. No jargon without explanation.

If an exercise references ANY concept -- whether from psychology, coaching, somatic
work, or any framework -- you MUST explain:

1. WHAT the concept is, in one plain sentence
2. WHERE it comes from (the framework, researcher, or tradition)
3. WHY it matters right now, connected to this specific person's situation

### Examples of BAD exercise descriptions:

BAD: "Identify your top 2-3 saboteur patterns. What each says, when it gets loud,
what it protects you from."
WHY IT'S BAD: Assumes the person knows what a "saboteur" is, how to identify one,
and what "protects you from" means in this context.

BAD: "Do a somatic check-in. Notice where the activation is sitting in your body."
WHY IT'S BAD: "Somatic check-in" and "activation" are jargon. "Where it's sitting"
assumes familiarity with body-awareness practices.

BAD: "Practice cognitive defusion with the thought."
WHY IT'S BAD: "Cognitive defusion" is an ACT term. Most people have never heard it.

### Examples of GOOD exercise descriptions:

GOOD: "A 'saboteur' is a term from Positive Intelligence (Shirzad Chamine) for the
automatic thought patterns that hijack your mind under stress -- like a harsh inner
critic that says you're not good enough, or a controller that needs everything perfect
before you can move forward. Think of them as mental habits, not character flaws.
Everyone has them.

Right now, think of a moment this week when your mind took over and made things
harder than they needed to be. What was the voice saying? When does it get loudest?
And what might it be trying to protect you from -- even if its method is costly?"

GOOD: "This exercise comes from ACT (Acceptance and Commitment Therapy, developed
by Steven Hayes). The idea is simple: instead of fighting a difficult thought or
trying to make it go away, you add a small phrase in front of it that creates
distance between you and the thought.

Say out loud: 'I need to earn my place.'
Now say: 'I'm having the thought that I need to earn my place.'
Now say: 'I notice I'm having the thought that I need to earn my place.'

Feel the shift. Each layer puts a little more space between you and the thought.
You're not the thought. You're the one noticing it."

### The test

Before finalizing any exercise description, ask: "Would someone who has never been
to therapy, never read a self-help book, and has no coaching vocabulary understand
every word in this description?" If the answer is no, rewrite.
```

### 6.2 Enforcement in the Prompt

The rule must be in the system prompt, not in a separate instruction set, because Claude's system prompt has the highest attention weight. Place it between the Selection Rules and the Response format in `PROCESS_SYSTEM_PROMPT`.

### 6.3 Adding why_this_works Quality Standard

The `process-journal` route already includes a `why_this_works` field in the exercise schema. Add to the system prompt:

```
The why_this_works field must explain the mechanism in plain language. Not jargon.
Not citations. What happens in the brain, body, or relational system when someone
does this exercise?

BAD: "This exercise activates the prefrontal cortex and reduces amygdala reactivity
through affect labeling mechanisms."

GOOD: "Naming what you're feeling out loud -- even just one word -- activates the
thinking part of your brain and turns down the alarm system. It's called affect
labeling, and brain imaging shows it literally reduces the intensity of what you're
feeling within seconds. That's why 'I'm angry' feels different from just being angry."
```

---

## 7. Parts Check-In System

### 7.1 What the Personal Flow Does

The personal flow maintains 2-3 named protector parts with:
- **A name and reframed role:** "The Critic -> Accountability Partner"
- **A daily focus prompt:** "Am I putting out the energy I'm expecting back? Did the Critic judge today, or did it hold me accountable?"
- **Consistent language across sessions:** The same part names and prompts appear daily

These parts are identified through the weekly-insights process and refined weekly. During the week, their language stays stable.

### 7.2 How to Implement in the Product

**Store parts in `client_profiles`:** Add a `parts_check_in` field to the client profile (or within the existing JSONB):

```json
{
  "active_parts": [
    {
      "old_name": "The Critic",
      "new_role": "Accountability Partner",
      "daily_prompt": "Am I putting out the energy I'm expecting back?",
      "added_on_day": 5,
      "last_updated": "2026-03-10"
    },
    {
      "old_name": "The Endurer",
      "new_role": null,
      "daily_prompt": "Is this acceptance -- or is it the Endurer calling deprivation wisdom? Check the body: spacious = Self. Flat = the Endurer.",
      "added_on_day": 8,
      "last_updated": "2026-03-10"
    }
  ]
}
```

**When parts are created:** During the profile generation process (after Day 3) or when the `process-journal` route identifies a protector part in the journal analysis. The `generate-profile` route could include a parts identification step, or parts could be added incrementally via the observation mechanism in `daily-summary`.

**How they surface daily:** The `daily-themes` route fetches `client_profiles.parts_check_in` and includes the active parts prompts in its output:

```json
"parts_check_in": [
  {
    "part": "The Critic -> Accountability Partner",
    "prompt": "Am I putting out the energy I'm expecting back?"
  }
]
```

**UI rendering:** Show as a dedicated "Parts Check-In" section in Step 2 (before the journal textarea), with each part's prompt as a reflective question.

---

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
