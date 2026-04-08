# Today Flow Design — Section 2: Thread Implementation & Carry-Forward

> Split from `docs/today-flow-design.md`. Sections 3 + 4.

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

