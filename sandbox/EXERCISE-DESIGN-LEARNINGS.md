# Exercise Design Learnings

Accumulated from exercise catalog development and review. Apply these to every exercise.

---

## Part 1: Core Design Principles (1-10)

### 1. Description Must Match the Exercise
**The problem:** The whyThis/instruction describes a specific interaction (e.g., "list forces for Stay vs Leave") but the rendered primitive shows generic defaults ("Motivation" / "Fear").
**The fix:** After writing ANY instruction, verify that every noun, verb, and concept in the text corresponds to something visible in the primitive. If the instruction says "sort into Valid / Political / Cannot Tell" — those exact bucket names must appear.
**Test:** Read the instruction, then look at the primitive. Can the user do exactly what the instruction says without guessing?

### 2. Every Exercise Must Offer Solutions, Not Just Diagnosis
**The problem:** Day 7 (Workday Toolkit) describes why regulation matters but only asks where your nervous system is — no tools provided.
**The fix:** If the whyThis identifies a problem, the exercise must include actionable solutions. Naming the problem without providing the tool is incomplete.
**Test:** After completing the exercise, does the user have something concrete to DO differently?

### 3. Tags Must Be Explained or Removed
**The problem:** Tags like "Catastrophizing" appear with no context for what they mean.
**The fix:** Either explain what the tag system means in the instruction text, or remove tags that don't add pedagogical value.
**Test:** Would a first-time user understand what each tag means and why they'd apply it?

### 4. PrePopulated Items Must Be Removable/Dismissable
**The problem:** Pre-filled cards can't be dismissed if they don't apply to the user.
**The fix:** Every prePopulated item should be editable AND removable. Add dismiss/remove affordance across all primitives.
**Test:** If a pre-filled card doesn't match the user's situation, can they get rid of it?

### 5. Custom Content Entry Must Be Obvious
**The problem:** It's unclear how to add your own content in exercises like "The Unsent Message."
**The fix:** Every exercise that accepts user-generated content needs: (a) visible, labeled button, (b) placeholder text, (c) empty-state prompt.
**Test:** Would a new user know where to start adding their own content?

### 6. Framework Bridges Must Be Explicit
**The problem:** NVC Part 1 shows "I said" → "What I needed to say" but doesn't explain HOW.
**The fix:** Walk through each step of the framework with enough detail that someone unfamiliar can follow. "Use the NVC framework" is not instruction — the four steps spelled out IS instruction.
**Test:** Could someone who has never heard of this framework complete the exercise correctly?

### 7. Examples Must Be Realistic and Complete
**The problem:** Pre-filled content looks generic or contradicts the instruction.
**The fix:** Every example must: (a) feel real, (b) correctly demonstrate the framework, (c) model the quality of response the user should aim for.
**Test:** Would a skilled coach approve this example as a demonstration?

### 8. Visual Elements Must Be Self-Explanatory
**The problem:** StakeholderMap shows "inner/middle/outer" without explaining what zones represent.
**The fix:** Every visual element must be labeled with descriptive text visible on-screen, or explained in the instruction.
**Test:** If you cover the instruction text, does the primitive make sense on its own?

### 9. Framework Concepts Need Behavioral Descriptions
**The problem:** Bucket labels like "Criticism" and "Contempt" are named but not described.
**The fix:** Add behavioral descriptions: "Criticism — attacking character: 'You always...' 'You never...'"
**Test:** Could the user correctly sort a new behavior into the right category based on the descriptions?

### 10. Assessment Exercises Should Include Next-Steps Interaction
**The problem:** The Optionality Audit rates domains but doesn't help the user figure out what to do about low scores.
**The fix:** Follow every assessment with a journaling prompt, chatbot conversation, or specific action suggestion.
**Test:** After seeing their scores, does the user know what to do next?

---

## Part 2: Multi-Lens Design Principles

Every exercise should pass through five professional lenses before shipping. Each lens catches different failures.

### Lens 1: Learning Facilitator
**Question:** Does this exercise create genuine learning, or just activity?

**Principles:**
- **Bloom's Taxonomy alignment:** Exercises should target the right cognitive level. Sorting cards = understanding. Writing a dialogue = applying. Comparing your saboteur version vs centered version = analyzing. Designing a regulation toolkit = creating. Match the primitive to the cognitive level the exercise requires.
- **Scaffolded difficulty:** Early exercises should have more pre-filled content and narrower choices. Later exercises should have more blank space and open-ended prompts. The arc is: guided → supported → independent.
- **Transfer design:** Every exercise should explicitly connect to the user's real life. "Now think about a time when..." bridges the gap between exercise and application. Without transfer, exercises are academic.
- **Spaced retrieval:** Reference previous exercises by name. "On Day 4, you identified your saboteur. Today we test whether you can catch it in real time." This activates prior learning and strengthens retention.
- **The learn-recognize-practice arc:** Exercises that stop at "recognize" (naming the pattern) without reaching "practice" (rehearsing the alternative) are incomplete. Every exercise should complete the full arc.

**Test:** If a learner completed only this exercise with no coaching support, would they walk away with a usable skill?

### Lens 2: UX Designer
**Question:** Does the interface teach the interaction, or does the user have to guess?

**Principles:**
- **Progressive disclosure:** Don't show everything at once. Reveal whyThis first, then instruction, then the primitive. Let the user absorb context before interacting.
- **Visual hierarchy:** The most important element (the primitive) should be visually dominant. WhyThis and instruction are supporting context, not the main event.
- **Affordance clarity:** Every interactive element must signal what it does. Draggable items need grab cursors. Clickable areas need hover states. Editable fields need placeholders. If the user has to read the instruction to know WHERE to interact, the UI has failed.
- **Feedback loops:** Every interaction should produce visible feedback. A card landing in a bucket should feel satisfying (spring animation, color change). A slider moving should show the zone name updating. A dialogue turn submitted should reveal the next prompt.
- **Error prevention over error handling:** Don't let users get into broken states. If a bucket can't accept more than 5 cards, gray out the bucket at 5 — don't show an error after they drop the 6th.
- **Mobile-first interaction:** Exercises must work on mobile. Touch targets need to be at least 44px. Drag interactions need alternatives (tap to select, tap to place). Two-column layouts need to stack on mobile.

**Test:** Could someone use this exercise correctly without reading any instruction — just by looking at the UI?

### Lens 3: AI Engineer
**Question:** Is this exercise producing structured data that the AI coaching system can use?

**Principles:**
- **Structured output:** Every exercise should produce data the system can reference later. Free-text responses are harder to use downstream than structured choices (sorted cards, rated dimensions, tagged rows).
- **Pull-forward architecture:** Exercises that reference previous exercises must have a data contract. Day 12's saboteur sort should produce structured data that Day 18's cost analysis can consume. Design the data model BEFORE the exercise.
- **AI-readable patterns:** Tag systems, bucket assignments, and ratings produce signals the AI can pattern-match across days. "This user consistently tags 'Pleaser' across 5 exercises" is a pattern the system can surface to the coach or the user.
- **Insight generation hooks:** Every completed exercise should trigger an AI-generated insight. The quality of that insight depends on the structure of the response data. Design exercises to produce the data the insight engine needs.
- **Personalization triggers:** Exercise responses should update the user's profile. High anxiety scores → offer regulation exercises. Frequent Pleaser tags → surface boundary exercises. The exercise IS the personalization input.

**Test:** After the user completes this exercise, can the AI coaching system use the response data to personalize future exercises?

### Lens 4: Product Manager
**Question:** Does this exercise earn its place in the program — or is it filler?

**Principles:**
- **Clear learning objective:** Every exercise must have a single, specific learning point that can be stated in one sentence. "Learn about Gottman" is a topic. "Recognize which horseman shows up in your conflicts and know the specific antidote" is a learning point.
- **User value per minute:** Exercises should respect the user's time. A 15-minute exercise that produces one usable insight is better than a 30-minute exercise that produces vague awareness. Cut ruthlessly.
- **Completion rates drive design:** If users aren't finishing an exercise, it's too long, too confusing, or not relevant enough. Track completion and iterate. Pre-filled examples reduce drop-off by lowering the activation energy to start.
- **Program arc fit:** Every exercise should earn its day-number slot. "Why this exercise on Day 12 and not Day 5?" If you can't answer that, the sequencing is wrong.
- **No duplicate exercises:** Before designing any exercise, check every other exercise in the program for overlap. Two exercises that produce the same insight are redundant.

**Test:** If this exercise were removed from the program, would the user's outcome meaningfully change?

### Lens 5: Effective Coach
**Question:** Does this exercise meet the user where they are — emotionally, cognitively, and motivationally?

**Principles:**
- **Coach voice, not authority voice:** Don't tell the user what they're feeling. Invite: "you might notice," "it sounds like," "could it be that." The user is the expert on their own experience.
- **Emotional calibration:** An exercise designed for someone in crisis (Day 1) looks different from one designed for someone stabilizing (Day 15). Match the emotional register to the program arc.
- **No blank pages for overwhelmed people:** Pre-populate with relatable examples. An empty textarea asks someone in crisis to generate content from nothing — that's too much cognitive load. Seed it. Let them edit.
- **Normalize the struggle:** Framework teaching should include "this is common" language. "Most people under this kind of pressure develop automatic patterns" validates the user's experience before asking them to change it.
- **Celebrate progress, don't just diagnose problems:** Include reflection prompts that surface growth: "On Day 1 you rated this a 3. Today it's a 6. What changed?" The program should feel like it's working.
- **The coaching container:** Every exercise creates a container — a safe, bounded space for exploration. The container needs walls (clear instructions, time boundaries) and a door (the user can stop anytime). Never trap the user in an exercise that escalates without an exit.

**Test:** Would you use this exercise with a real client in a real coaching session? If the answer is "I'd modify it first," modify it now.

---

## Part 3: New Exercise Types to Consider

The current 24 primitives are strong but there are interaction patterns that would significantly improve learning:

### Type 1: Scenario Simulation (AI-Powered)
**What it is:** A branching conversation where the user practices a real interaction — PIP check-in, difficult conversation, boundary-setting — and the AI plays the other person, responding dynamically.
**Why it's better:** Static dialogue sequences let you script your response in advance. Simulation tests whether you can hold your center when the other person goes off-script. The gap between scripted and live is where real skill lives.
**Framework fit:** NVC practice, Gottman repair attempts, crucial conversations, boundary-setting.
**Primitive needed:** `aiSimulation` — chat-like interface with AI responses, real-time coaching nudges, and a post-simulation debrief.

### Type 2: Spaced Retrieval Check
**What it is:** A micro-exercise that surfaces 2-3 days after a full exercise, testing whether the user can recall and apply the concept without re-reading the framework.
**Why it's better:** Research shows that retrieval practice (testing yourself) is 50-70% more effective for long-term retention than re-studying. Currently, exercises teach but don't test.
**Framework fit:** Saboteur identification (can you name yours without looking?), NVC steps (can you walk through them from memory?), regulation tools (can you describe your anchor without the guide?).
**Primitive needed:** `retrievalCheck` — flashcard-style prompt with reveal, self-assessment, and spaced repetition scheduling.

### Type 3: Before/During/After Capture
**What it is:** An exercise that spans a real-world event — the user sets an intention before (pre-meeting), captures what happened during (real-time notes), and reflects after (post-event debrief). Three touchpoints for one exercise.
**Why it's better:** Current exercises exist in a vacuum — the user completes them in the app, disconnected from the moments they matter. This type bridges the gap.
**Framework fit:** PIP check-ins, difficult conversations, boundary enforcement, regulation toolkit deployment.
**Primitive needed:** `eventCapture` — three-phase interface with pre-event intention, real-time capture (minimal UI, maybe just voice), and post-event reflection.

### Type 4: Pattern Tracker (Longitudinal)
**What it is:** A lightweight daily check-in that tracks one pattern over 7-14 days — not a full exercise, but a 30-second data point that builds into a visible trend.
**Why it's better:** Single exercises produce snapshots. Patterns only emerge over time. A 7-day tracker showing "your Pleaser activated 5 out of 7 days in check-in meetings" is more powerful than any single exercise.
**Framework fit:** Saboteur activation tracking, window of tolerance, Gottman bid recognition, belonging inventory.
**Primitive needed:** `patternTracker` — daily micro-input (slider or quick-select) with trend visualization.

### Type 5: Guided Rehearsal with Recording
**What it is:** The user writes a script (e.g., centered conversation), then records themselves saying it out loud. They can listen back and compare their delivery to the written version.
**Why it's better:** Writing a centered response and SAYING it out loud are different cognitive processes. The gap between the written version and the spoken version reveals where the saboteur still has grip. Research on motor rehearsal shows that speaking activates different circuits than writing.
**Framework fit:** NVC requests, Gottman repair attempts, boundary sentences, DEAR MAN scripts, centered conversations.
**Primitive needed:** `rehearsal` — text input + audio recording + playback with self-assessment.

### Type 6: Comparative Reflection (Then vs Now)
**What it is:** An exercise that pulls the user's own earlier responses and asks them to reflect on the difference. Not a before/after rating — a qualitative comparison of their own words across time.
**Why it's better:** Progress is often invisible to the person experiencing it. Seeing "On Day 4, you wrote 'I can't handle this.' On Day 20, you wrote 'I caught the saboteur before it ran me'" makes growth concrete and motivating.
**Framework fit:** Any exercise that repeats or references earlier work — saboteur identification, values ranking, disruption inventory, communication patterns.
**Primitive needed:** `reflectionMirror` — side-by-side display of past and present responses with guided comparison prompts.

---

## Part 4: Motion.dev Enhancement Opportunities

Current primitives use framer-motion for basic transitions. Motion.dev adds capabilities that can make exercises visually self-teaching:

### Scroll-Driven Reveals
- **Where:** Progressive disclosure in whyThis sections. Framework steps revealed one at a time as user scrolls, preventing information overload.
- **How:** `scroll()` from motion.dev binding animation progress to scroll position.

### Spring-Based Interaction Feedback
- **Where:** CardSort (card landing in bucket), WheelChart (spoke snapping to value), ForceField (arrow strength adjustment).
- **How:** `animate()` with spring physics for natural-feeling interactions. Cards should "settle" into buckets with weight.

### Timeline Sequencing
- **Where:** Multi-step exercises like NVC (observation → feeling → need → request). Each step animates in after the previous completes.
- **How:** `timeline()` from motion.dev for orchestrated sequences.

### Completion Celebrations
- **Where:** Every exercise completion. Currently no celebration moment — user finishes and nothing happens.
- **How:** SVG path draw (checkmark), confetti burst (already built in `confetti.ts`), spring-based scale animation on completion badge.

### Micro-Animations as Instruction
- **Where:** Any primitive where the interaction isn't obvious. Pulse rings on draggable items (already in WheelChart). Subtle bounce on "+ Add" buttons. Arrow animation showing drag direction.
- **How:** Transient animations (3 cycles then stop) that teach interaction without cluttering the UI.

---

## Part 5: Exercise Gaps Identified by Multi-Lens Review

### From the Learning Facilitator
These need to be built INTO the exercises, not just noted:

11. **Spaced retrieval must be woven into program arcs**
- Day 4 teaches saboteurs → Day 7 should include a 2-question retrieval check ("Name your top saboteur. What does it say?")
- Day 10 teaches NVC → Day 13 should test recall ("What are the four NVC steps?")
- **Implementation:** Add RetrievalCheck exercises at Day +3 intervals for every major concept taught

12. **Commitments need follow-through**
- Day 6 commits to daily anchors → Day 14 should pull those anchors back and ask "How's that going?"
- Day 19 sets boundaries → Day 25 should check "Did you hold the boundary? What happened?"
- **Implementation:** Exercises that reference previous commitments need prePopulated data pulled from earlier exercise_completions

13. **Every assessment needs a "now what?"**
- WheelChart exercises (Seven Disruptions, BRAVING, SCARF, 8 C's) produce ratings but no action plan
- **Implementation:** Add a follow-up section after every wheel/rating: "Your lowest area is X. One thing you could do this week to strengthen it:"

14. **Skill progression must be explicit**
- Days 1-7 should label exercises as "Awareness level" → Days 8-14 as "Practice level" → Days 15-21 as "Application level" → Days 22-30 as "Integration level"
- **Implementation:** Add a `difficultyLevel` or `arcPosition` field to exercise metadata and display it

### From the UX Designer

15. **Exercises need time estimates visible before starting**
- Show "~5 min" or "~15 min" on the exercise card header
- Users in crisis need to know if they can fit this in
- **Implementation:** Add `estimatedMinutes` badge to ExerciseCard

16. **whyThis needs progressive disclosure**
- 200-word whyThis blocks are walls of text. Show first 2 sentences, "Read more" expander
- The exercise primitive should be visible without scrolling past the explanation
- **Implementation:** Collapsible whyThis with Radix accordion

17. **Exercise completion needs a reward moment**
- Current: checkmark appears, toast says "Exercise saved ✓", disappears in 2s
- Needed: confetti burst, insight preview, progress counter ("2 of 3 done"), verbal acknowledgment
- **Implementation:** Use existing confetti.ts + AnimatedCheckmark + progress counter

18. **Clear exercise-to-exercise navigation**
- After finishing Exercise 1, the user should see "Next: Exercise 2 →"
- Progress dots: ● ○ ○ (1 of 3 complete)
- **Implementation:** Add navigation buttons and progress indicator to ExerciseCard wrapper

### From the UX Researcher

19. **Pre/post measurement per exercise**
- Before: "How clear is your thinking about this right now?" (1-5)
- After: same question. Delta = exercise impact.
- **Implementation:** Add optional pre/post slider to ExerciseCard

20. **Completion quality signal**
- Track not just "completed" but how deeply: word count of responses, time spent, rating given
- Low-engagement completions (3 words, 10 seconds) should trigger different follow-up than deep completions
- **Implementation:** Store time_spent and response_length in exercise_completions

21. **Outcome tracking across program arc**
- Day 1 vs Day 24 disruption ratings already exist but aren't surfaced as growth
- Build an automatic "Your Progress" section that shows the delta
- **Implementation:** Pull Day 1 exercise_completions data into Day 24 exercise for comparison

---

## Part 6: Primitive-Specific Notes

### WheelChart
- Margin: 100px+ for long category labels
- Labels: white (#FFFFFF), display font, 14px, weight 600
- Grid lines: rgba(255,255,255,0.25)
- Data polygon: white stroke, coral wash fill
- Level numbers: rgba(255,255,255,0.6), 10px

### ForceField
- prePopulated must include `centerLabel`, `drivingForces`, `restrainingForces`
- Demo component must accept and spread prePopulated props
- Default labels must be overridden — never show "Motivation" / "Fear"

### CardSort
- Always include bucket colors for visual distinction
- Always set `allowAdd: true`
- Pre-filled cards should be editable and removable
- Bucket descriptions should explain the category, not just name it

### SplitAnnotator
- Always provide `leftColumnLabel` and `rightColumnLabel`
- Always provide `availableTags` with descriptive labels and distinct colors
- Pre-fill rows with realistic scenario content
- Tag labels must explain what the tag means, not just name it

### DialogueSequence
- Voices need distinct, meaningful colors
- Each turn should have a `prompt` field guiding what to write
- Pre-fill first turn with a realistic example; leave later turns for user

### StakeholderMap
- Zone labels (inner/middle/outer) need contextual meaning
- No prePopulated support yet — future enhancement needed

### ZonedSpectrum
- Each zone needs a `guidance` field with specific, actionable tools
- The guidance IS the exercise — the slider is just the entry point

### EmotionalArc
- Phases need concrete prompts, not abstract labels
- Intensity values should model a realistic emotional trajectory
- The arc should feel like a journey, not a rating scale

### BodyMap
- Start with empty markers — the user's input IS the data
- Multiple passes (tension, emotion, energy) create richer maps

### HierarchicalBranch
- Pre-fill the top level to anchor the exploration
- Leave deeper levels empty for the user to discover
- Colors should deepen as levels go deeper (cool → warm)
