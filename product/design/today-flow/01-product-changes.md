# Today Flow Design — Section 1: Product Changes Needed

> Split from `docs/today-flow-design.md`. Section 2.

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

