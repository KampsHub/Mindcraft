# 362 Exercise Arc Audit — Plan

## Goal
Audit every exercise in the catalog to ensure each one completes the **learn → recognize → practice** arc. Most exercises currently stop at "recognize" (identify the pattern) without reaching "practice" (what do you do differently).

---

## What Gets Checked Per Exercise

### 1. Does it complete the arc?
| Stage | What it means | Test |
|-------|--------------|------|
| **Learn** | User understands the concept/framework | Does `whyThis` explain it in plain language? |
| **Recognize** | User identifies the pattern in their own life | Does the primitive prompt them to find their version? |
| **Practice** | User tries a new behavior or builds an artifact | Does the exercise end with something actionable? |

Most exercises currently cover Learn + Recognize. The audit adds Practice.

### 2. What "Practice" looks like per exercise type

| Primitive | Current ending | What to add |
|-----------|---------------|-------------|
| **cardSort** | Cards sorted into buckets | Add: "Pick the top card from [bucket]. Write one thing you'll do differently this week because of it." |
| **splitAnnotator** | Rows filled with observations | Add: final row labeled "My next step" or "What I'll try" |
| **dialogueSequence** | Conversation mapped | Add: final prompt "Rewrite one exchange using [framework]. What would you say instead?" |
| **wheelChart** | Areas rated | Add: "Your lowest-rated area is [X]. Write one concrete action for this week." |
| **heatmapTracker** | Grid rated | Add: "Which pattern showed up most? What's your plan when it shows up tomorrow?" |
| **hierarchicalBranch** | Family pattern mapped | Add: "Name one way this pattern still runs. What would breaking it look like this week?" |
| **narrativeTriptych** | Three versions written | Add: "Which version is closest to true? What's the one sentence you'd actually say out loud?" |
| **guided** (text) | Reflection written | Add: structured closing prompt — "One thing I'm taking from this: ___" |
| **bodyMap** | Sensations marked | Add: "Pick the area holding the most tension. What does it need? (movement, breath, rest, warmth)" |
| **emotionWheel** | Emotions selected | Add: "Your primary emotion is [X]. What does this emotion need from you right now?" |
| **dotGrid** | Items placed on axes | Add: "Look at your top-right quadrant. What's one thing you'll protect or prioritize this week?" |
| **forceField** | Forces mapped | Add: "Pick one driving force to strengthen OR one restraining force to reduce. Write your plan." |
| **stakeholderMap** | People mapped | Add: "Pick one high-influence person you haven't connected with. What's your first move?" |
| **bubbleSort** | Items ranked | Add: "Your #1 is ___. How will you honor this priority in the next 48 hours?" |

### 3. Instruction coherence check
For each exercise, verify:
- [ ] `instruction` verbs match what the primitive can do (no "write" without a text field)
- [ ] `prePopulated` data matches the scenario (no generic placeholders)
- [ ] `whyThis` references the user's situation, not just the framework abstractly
- [ ] Framework is taught, not just name-dropped
- [ ] Exercise has a clear ending signal ("when you're done, look at...")

### 4. Content quality check
- [ ] No hallucinated research claims (every stat has a named source)
- [ ] No jargon without explanation
- [ ] Coach voice, not authority voice ("you might notice" not "you will discover")
- [ ] Appropriate cognitive load (≤3-4 concepts before interaction)

---

## How to Execute

### Phase 1: Categorize (2 hrs)
Run the Bloom's labels SQL script first (`scripts/add-bloom-labels.sql`). Then pull a report:

```sql
SELECT name, bloom_level, concept_tags, modality
FROM frameworks_library
WHERE active = true
ORDER BY bloom_level, name;
```

Group exercises by bloom_level. Exercises at "remember" and "understand" are most likely to be missing the practice step.

### Phase 2: Audit in batches (by program × week)
Work through exercises in program order (Parachute → Jetstream → Basecamp), one week at a time:

| Week | Days | Focus | Est. time |
|------|------|-------|-----------|
| Week 1 | 1-7 | Intake + awareness exercises | 3 hrs |
| Week 2 | 8-14 | Framework practice exercises | 3 hrs |
| Week 3 | 15-21 | Application exercises | 3 hrs |
| Week 4 | 22-30 | Integration exercises | 3 hrs |

× 3 programs = **~36 hours total** (can be spread across multiple sessions)

### Phase 3: Update seed data
For each exercise that needs a practice step:
1. Add a practice prompt to the exercise's `instruction` field
2. If needed, add a structured closing element to `prePopulated` (e.g., final splitAnnotator row, final dialogueSequence prompt)
3. Update the seed SQL or exercise data file

### Phase 4: Verify in sandbox
Open the sandbox catalog, filter by updated exercises, and verify each one renders correctly with the new practice step.

---

## Exercises Most Likely to Need Practice Steps

Based on the current catalog, these categories are most likely incomplete:

1. **Awareness/identification exercises** — "Name your saboteur," "Map your disruptions," "Identify your values." These stop at recognition.
2. **Framework introduction exercises** — "Learn the Four Horsemen," "Understand the Window of Tolerance." These teach but don't practice.
3. **Rating/assessment exercises** — "Rate your confidence," "Score your disruptions." These produce data but no action plan.
4. **Narrative exercises** — "Write your story three ways." These produce insight but no behavior change.
5. **Body-based exercises** — "Notice where tension lives." These stop at noticing.

Exercises that likely already have practice steps:
- Contingency planning exercises
- Communication rehearsal exercises (NVC, de-escalation scripts)
- Goal-setting exercises
- "What will you do differently" exercises

---

## Output Format

For each exercise audited, the update should look like:

```
Exercise: [name]
Program: [parachute/jetstream/basecamp]
Day: [number]
Current ending: [what happens last]
Practice step added: [what was added]
Change type: instruction update / prePopulated addition / both
```

Track in a spreadsheet or append to this document as exercises are completed.

---

## Priority Order
1. **Parachute** first (layoff recovery — most emotionally urgent, highest stakes for getting the arc right)
2. **Jetstream** second (PIP navigation — users under active performance pressure)
3. **Basecamp** third (new role — least urgent, users have more agency)

Within each program, audit Week 1 and Week 4 first — Week 1 sets the foundation, Week 4 is integration. Weeks 2-3 can be batch-updated.
