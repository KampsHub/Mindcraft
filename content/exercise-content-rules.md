# Exercise Content Rules

Full pedagogical ruleset for designing and auditing Mindcraft exercises. Loaded on demand by the `exercise-design` skill or when an instructional designer is actively working on exercise content.

Extracted verbatim from the pre-reorg `CLAUDE.md`. Single source of truth.

---

Every exercise must be coherent end-to-end — scenario, whyThis, instruction, and primitive data must all align. **Design exercises back-to-front**: start with what the user should walk away with, then work backward to the scenario.

## Content coherence

- **`whyThis` must reference the scenario**: For journal-matched exercises, open with a concrete reference to what the user wrote (not a generic "your journal mentioned…" — use their actual situation). For core program exercises, tie to the day's theme.
- **`instruction` must match the primitive**: If the primitive shows buckets labeled "Criticism / Contempt / Defensiveness / Stonewalling," the instruction must reference those exact categories. Generic instructions with a scenario-specific primitive = broken.
- **`prePopulated` must match the scenario**: If an exercise has a scenario, the primitive's seed data (cards, labels, prompts) must reflect that scenario — not generic placeholders like "Item A" or "Yes/No/Maybe."
- **No hallucinated facts — hard rule**: Every factual claim must name the author, researcher, or institution behind it. No vague attributions ("studies show," "research suggests," "fMRI studies indicate"). If you cannot name the specific source, either use hedged language ("this type of practice may help…," "mindfulness approaches like this one have shown in other contexts that…") or leave it out entirely. This applies to statistics, percentages, neuroscience mechanisms, and historical claims about frameworks.

## The framework gets due instruction

- Don't just name-drop a framework — teach it. If the exercise uses Gottman's Four Horsemen, the user should learn what each horseman looks like and what the antidote is. If it uses NVC's OFNR, the user should understand each step before they try it.
- `whyThis` should cover: the scenario gist → the framework and the thinking behind it → why it works → how it helps in practice. Give the concept room to breathe — explain the underlying logic, not just the label. The user should finish reading `whyThis` and already understand something new, before they even touch the primitive.
- The `whyThis` section is where the framework gets introduced. The primitive is where it gets practiced.

## `whyThis` must explain why THIS exercise at THIS stage

- Don't just explain what the exercise is about — explain why it's helpful right now in the program arc. "Day 9 looks at belonging" describes the topic. "After a week of grounding, you now have enough stability to look at what else shifted — and belonging is one of the losses that's easy to miss until loneliness sets in" explains why now.
- The user should finish reading `whyThis` and understand: what this is, why it matters at this point, and how it might help them.

## Write `whyThis` with care (internal context — never surface this to the user)

- Many users are overwhelmed, short on time, and in a heightened emotional state. Keep this in mind when writing, but NEVER reference it in the content — don't tell them they're in crisis, overwhelmed, or struggling. That's the last thing they need to hear. Just write with that awareness.
- They need to understand quickly: why is this relevant to what I'm going through RIGHT NOW, and how might it help?
- Lead with their situation, then connect to relief: how might this exercise help their thinking clear, their nervous system settle? Frame benefits in terms the user cares about ("this may help you think more clearly about the conversation," "this can give your nervous system a chance to settle") — not in clinical terms.
- Keep it concise. Every sentence must earn its place. If a sentence doesn't help the user understand why this matters now or how it might help, cut it.

## Think through the exercise front to back

- Trace the full user journey: what does the user read → what do they do → what do they learn → what changes for them?
- Every exercise must have a clear **point**. Sorting cards into categories is not the point — it's a means. The point is what the user gains from the sorting (e.g., recognizing their pattern, learning the antidote, rewriting their response).
- If the exercise promises something (e.g., "flip to see antidotes"), the primitive must actually deliver it. Don't describe outcomes the UI can't produce.
- The exercise is **unsuccessful** if the user completes it and still doesn't know what to do differently. The payoff — the new skill, reframe, or practice — must be built into the exercise, not just mentioned in the text.

## Design from the screen inward, not the content outward

- The correct order: choose the primitive → set up prePopulated data → render it in the preview → look at what the user will see → THEN write whyThis and instruction to match what's actually on screen. Not: write whyThis → write instruction → pick a primitive → hope it matches.
- Every exercise design session should start with the rendered preview, not a text editor.

## The recurring mistake — writing instructions for an imagined UI, not the actual one

- The single most repeated error in exercise design: writing an instruction that describes an action the primitive cannot support. "Write briefly about…" when there's no text field. "Think about what this voice says…" when there's no place to capture it. "Connect this sensation to a family belief…" when the body map only supports marking areas.
- **The fix is a hard process rule:** After writing ANY instruction, check each verb against what the primitive actually offers. If the instruction says "write" — is there a text input? If it says "sort" — are there buckets? If it says "drag" — are there draggable elements? If it says "reflect" — is there a journal section? If any verb has no corresponding UI element, either change the primitive, add prePopulated data to create the element, or redirect to the journal.
- This applies especially to guided (text-only) exercises — a single blank textarea cannot capture structured commitments (three anchors with times), multiple distinct items (saboteur notes), or sequential reflections. Use splitAnnotator rows, dialogueSequence prompts, or other structured primitives when the exercise asks for multiple specific things.

## One exercise = one concept

- Don't combine two different cognitive tasks into one exercise. "Notice where tension lives in your body" and "connect that to family beliefs about work" are two entirely different exercises requiring different modes of attention. The first is somatic and immediate. The second is reflective and biographical. If the primitive can only support one (body map = marking sensations), don't ask the instruction to carry the second.
- If the program arc needs both, make them separate exercises on separate days. Don't compress the curriculum into one primitive to save space.

## Use established coaching tools and content, not improvised ones

- When a well-known coaching tool exists for an exercise (e.g., a validated values list, an established assessment framework), use it instead of asking the user to generate content from scratch. The values excavation should use an actual coaching values list, not a blank word cloud. The saboteur identification should use Chamine's established saboteur patterns, not generic placeholders.
- Coaching tools have been refined over decades — they're better prompts than anything improvised. When available, use the real tool.

## Abstract rating grids are not impactful exercises

- A heatmap where you rate saboteurs 1-5 across generic situations produces a grid of numbers — not insight. Recalling a specific moment when a pattern showed up, naming what it said, and planning what to try next time — that's impactful.
- Ask: does this exercise produce a story, a reframe, or a plan? Or does it produce data points? If the output is data points, the exercise probably needs redesign.

## Never give someone overwhelmed a blank page

- When an exercise asks for personal input (beliefs, values, patterns, commitments), seed it with relatable examples the user can edit, delete, or react to. An empty text field or empty row asks someone in a stressed state to generate content from nothing — that's too much cognitive load.
- Pre-populated examples serve as prompts: "My value is what I produce" is easier to respond to than "Write a belief." The user can say "yes, that's me," "no, mine is different," or edit it — all easier than starting from zero.
- This applies to: splitAnnotator rows, cardSort cards, wordCloud starter words, dialogueSequence first prompts, dotGrid items. Any primitive where the user is expected to generate content.

## No duplicate exercises — differentiate or merge

- Before designing any exercise, check every other exercise in the program for overlap. If two exercises serve the same goal (e.g., "separate structural from personal factors"), one of them needs to go or become something fundamentally different. Reusing the same cognitive task with slightly different framing (Day 16 vs Day 19) is not differentiation — it's repetition. The user will notice.
- If two days both build toward the same insight, make them a deliberate two-day arc where Day A introduces the concept and Day B applies it in a new way. Don't just rehash.

## Exercises must produce artifacts, not just reflections

- An exercise is not a journal prompt with a primitive wrapper. Every exercise must produce something the user didn't have before: a sorted priority list, a contingency plan, a practiced script, a reframed belief, a concrete commitment. "Think back to Day 1 and notice what shifted" is a reflection — not an exercise.
- Test: if the user completes the exercise and has nothing to reference later, it's not an exercise.

## Design the interaction model before writing the framing

- The most common failure: great explanatory text with no clear interaction. The user reads a compelling "why this" but then stares at a primitive and doesn't know what to do, what order to do it in, or what "done" looks like.
- For every exercise, answer three questions before writing any text: (1) What does the user physically do first? (2) What do they do after that? (3) How do they know they're done? If you can't answer all three concretely, the exercise isn't designed yet.

## Pull forward previous exercise data — design around it

- When an exercise references earlier work (Day 25 references Day 4 saboteurs, Day 26 references Day 14 values), don't just mention "the values you surfaced." Design the exercise so the previous data IS the starting material. The saboteur contingency plan should show each named saboteur as a card to build a plan around. The values decision framework should present the user's actual ranked values as the axes of the decision.
- In sandbox: use realistic placeholder data representing a completed earlier exercise.

## Skills need dimensionality, not flat self-rating

- "Rate your confidence in [skill]" creates anxiety, not clarity — especially for abstract skills like "industry knowledge." Skills should come from established frameworks (Leadership Circle creative competencies, Enneagram gifts, the user's own evidence from previous exercises) and be explored through concrete behavioral examples, not Likert scales.
- A skill audit should help the user discover what they're good at through evidence and pattern recognition, not ask them to judge themselves on a grid.

## Vagueness creates anxiety in people who are already anxious

- Open-ended prompts like "what wants to emerge?" sound poetic but leave overwhelmed users staring at a blank space. Every exercise needs concrete scaffolding: specific categories to sort into, specific questions to answer, specific items to react to. Provide the structure; let the user provide the meaning.
- The more vulnerable the emotional territory, the more concrete the scaffolding needs to be.

## Day 15 vs Day 26 pattern — differentiate exercises across the arc

- When two exercises use the same values or saboteurs, they must do fundamentally different things with them. Day 15 tests values under pressure (abstract scenarios, emotional activation). Day 26 builds a practical decision tool (detection criteria, red flags, decision rules). One is about awareness; the other produces an artifact. If two exercises end with the same output, one of them is redundant.

## Exercises that reference previous days must pull forward the actual data

- Don't say "your values from Day 14" — show them. Don't say "the saboteurs from Day 4" — display them as pre-loaded cards. The user shouldn't have to remember or go back. The system carries the data forward and the exercise is designed around that data being present.

## The coaching voice in exercises — inviting, not declaring

- Exercise instructions should use "you might notice," "this may help you," "one way to think about this" — not "this will show you" or "you'll discover." The user is the expert on their own experience. The exercise offers a lens, not a diagnosis.
- When referencing research: always name the researcher and institution. "Peter Gollwitzer at NYU" not "studies show." If you can't name the source, hedge: "approaches like this one have shown in other contexts that…"
- Never tell the user what they're feeling or what happened to them. Offer frameworks for them to locate their own experience within.

## If the instruction asks the user to reflect, there must be a place to write

- "Think about what this voice says to you" is a lost prompt if there's no text field to capture it. Reflection that stays in the user's head doesn't become a tool they can revisit.
- Whenever an exercise asks the user to think, reflect, or consider something — the primitive must include a journal/text area for that reflection. If the primitive doesn't support it (e.g., cardSort has no text field per card), either change the primitive, add a guided text section after the sort, or reframe the instruction to something the primitive CAN capture.

## Exercises must reference previous exercise data when relevant (curriculum continuity)

- Many exercises build on earlier ones: Day 12 references Day 4's saboteurs, Day 24 references Day 1's disruption ratings, Day 14 references Day 13's values, Day 25 references Day 4 + Day 12.
- In the sandbox: use placeholder prePopulated data that represents what the user would have generated.
- In production: the system should pull previous `exercise_completions.responses` to populate later exercises. Flag these dependencies when designing exercises. The exercises that need this include any that say "On Day X you…" or "the values you surfaced yesterday."
- This means exercise responses need to be stored in a structured way that later exercises can query — not just a freeform text blob.

## If an exercise produces commitments, the system must hold accountability

- When an exercise asks the user to commit to something (daily anchors, contingency plans, requests, goals), that output needs to go somewhere — not just into a text blob that's never read again.
- At minimum: structured input so commitments are captured as discrete items, not buried in freeform text.
- Ideal: the system surfaces those commitments on later days as check-ins ("On Day 6 you committed to a morning walk, evening journaling, and a weekly call. How's that going?"). This requires production API work — flag exercises that need this when designing them.
- In the sandbox: use structured primitives (splitAnnotator with labeled rows, dialogueSequence with prompts) instead of a blank text area when the exercise asks for multiple specific items.

## Every exercise produces an insight (production feature)

- After the user completes an exercise, the system generates a "Process Insight" — a concise summary of what was discovered or learned from the exercise.
- The insight is editable by the user (they may want to refine it in their own words).
- Once saved, the insight appears in the Insights section and can be downloaded.
- This requires: API endpoint to generate insight from exercise responses, editable text component post-completion, `insights` table or field in `exercise_completions`, Insights page/section, download functionality.
- When designing exercises, consider: what would the insight be? If you can't articulate what the user would learn, the exercise may not have a clear enough learning point.

## Every exercise must have a clear ending

- The user needs to know when they're done and what they gained. "Tap areas and label sensations" has no natural end point — the user marks some things and then… what?
- The instruction should describe what "done" looks like: "When you're done, look at the overall map — where is your body holding the most?" gives a completion signal and a takeaway.
- If the primitive has no built-in completion state, the instruction must create one.

## Exercise design checklist (run on every exercise)

1. What is the **specific learning point**? State it in one sentence. Not "learn about Gottman's model" — that's a topic. "Recognize which horseman shows up in your conflicts and know the specific replacement behavior" — that's a learning point. If the learning point is vague, the exercise will be vague. The instruction should make the learning point explicit to the user.
2. Does `whyThis` **teach** the framework, not just mention it? "Gottman identified four patterns" is a mention. Describing what each pattern looks like and what to do instead is teaching.
3. Does the primitive **deliver the point**, or just create busywork? Sorting cards is a mechanic, not an outcome. The outcome is what the user gains from the sorting.
4. Does the instruction describe the **outcome**, not just the mechanic? "Sort cards into buckets" = mechanic. "Identify which pattern shows up in your conflict, then learn the antidote" = outcome.
5. Does `whyThis` use the user's **actual words** from the scenario? Not "you described a conflict" — quote their situation.
6. Does `prePopulated` data come from the **scenario**, not a template? Cards, labels, prompts, axes should reflect this person's situation.
7. Does the exercise **end with the user having something new**? A reframe, a skill practiced, a pattern named, a conversation rehearsed. If they just categorized or rated without gaining insight, the exercise is incomplete.
8. If the exercise promises something (e.g., "flip to see antidotes"), does the **primitive actually deliver it**? Don't describe outcomes the UI can't produce.
9. For exercises with named frameworks (Gottman, NVC, IFS, ACT, DBT, Kegan & Lahey, Polyvagal, etc.) — the exercise must **teach the framework**, not assume the user knows it.
10. Design exercises **back-to-front**: start with the payoff, then work backward to the scenario. Not forward from the scenario hoping a payoff emerges.
11. **Before writing any content, render the exercise in the preview and look at it.** Not imagine — actually look. Check every label, placeholder, tag, bucket, column, and interactive element. Then write instruction text that describes exactly what is on screen, including how every interactive element works. If something on screen is unclear without explanation (e.g., tags that sit below a text area with no context), either fix the prePopulated data to make it self-explanatory, or explain it in the instruction. Never write content in isolation from the primitive's rendered state.

## The primitive IS the pedagogy

- Don't retrofit a framework onto a mismatched primitive. If the framework is about parts/entities (IFS), the primitive must support naming entities and exploring their roles — not just picking emotions from a wheel. If the framework is about antidotes (Gottman), the primitive must teach the antidotes — not just sort statements.
- Internal design heuristic: consider how a skilled practitioner would use this framework, then check whether the primitive approximates that journey. **Never surface this heuristic to the user** — the tool is a toolkit, not a therapist. No therapeutic voice, no clinical framing, no "let's explore this together" language.
- If the primitive can't deliver the framework's core concept, choose a different primitive. Don't paper over the mismatch with clever instruction text.

## The primitive's visual design is part of the exercise review

- Content and visual rendering are one experience for the user. If grid lines are hard to read, labels are truncated, or interaction points aren't obviously interactive — the exercise fails regardless of how good the text is.
- **Labels must fit the space.** SVG primitives truncate long text. Always use the shortest meaningful label. "Income & Financial Security" → "Income." Every label is a design element constrained by pixels, not a content element with unlimited space. Write labels for the smallest viewport they'll render in. Test the rendered output.
- **Dark-on-dark is invisible.** On a dark UI, avoid low-contrast fills (plum-on-dark-grey). Use color with enough contrast AND semantic meaning — green tint for "action zone," red tint for "examine zone" — not just decorative fills.
- **Use transient animation to teach interaction, not persistent animation to decorate.** Pulse rings that repeat 3 times then stop say "you can touch this" without cluttering the UI. Persistent animation is noise. Transient animation is instruction.
- **Interaction must be self-evident.** If points are draggable, the user needs to know without reading the instruction — through animation (pulse), cursor (grab), size (larger targets), color (highlight). Affordances are part of the exercise design.
- **The instruction must describe the correct action.** "Rate the impact" vs "rate your satisfaction" are different exercises with the same primitive. Getting the framing wrong changes what the user does.
- **Content and primitive must name the same things.** Every concept in the text must appear in the primitive, and every label in the primitive must be referenced in the text. If whyThis mentions "job search" but the wheel doesn't have a job search category, one of them is wrong.

## Primitives to watch

- CardSort, ForceField, StakeholderMap, WheelChart — most likely to have placeholder data that contradicts the scenario
- EmotionWheel — only appropriate for affect labeling exercises, NOT for frameworks about entities/parts/roles (IFS, Voice Dialogue, Chair Work)
- Guided (text-only) — vulnerable to becoming "reflect on X" without giving a framework to reflect *with*
- Any primitive where step 1 is categorize/rate/map — check that step 2 (so what? now what?) is actually built in

## UX and content design rules for exercises

### Information architecture within `whyThis`

- `whyThis` is doing too much in a single block: scenario gist, framework teaching, science, personal connection. Break it into scannable chunks. Lead with a bold opening line connecting to the journal. Then the framework. Then the "so what." The user's eye needs places to rest.
- When a framework has multiple components (Four Horsemen = 4 patterns + 4 antidotes, OFNR = 4 steps), these want visual structure — not a run-on paragraph. Consider how this renders as a wall of text vs. structured content.

### Content-to-interaction ratio

- Most exercises currently have more reading than doing. The ratio should favor interaction. Ask: can the teaching move INTO the interaction? Instead of explaining all four steps in text then giving one text box, can the primitive guide the user through each step sequentially? Lecture → worksheet is the weakest instructional pattern. Guided interaction is stronger.

### Progressive disclosure

- Don't show everything at once when a card expands. The user sees `whyThis` + instruction + full primitive simultaneously. Consider: can the exercise reveal in stages? First the context, then the exercise? Can the teaching be integrated into the primitive's steps rather than front-loaded as a wall of text?

### Cognitive load

- Count the concepts the user must hold in working memory before they interact. OFNR = 4 steps. Four Horsemen = 8 concepts (4 patterns + 4 antidotes). Immunity to Change = 4 levels. If the user must remember more than 3-4 things before starting, the exercise needs chunking — teach one, practice one, teach next, practice next. Not: learn all, then do all.

### Primitive defaults are hostile

- Every primitive has default labels/placeholders designed for one use case (usually CBT). These defaults leak through to every framework unless overridden via prePopulated data. "Interpretation…" as a placeholder, "Distortion / Assumption" as tags, "Yes / No / Maybe" as buckets, "Voice A / Voice B" as speakers — these are all wrong for most frameworks. **Every exercise MUST have prePopulated data.** No exercise should rely on primitive defaults.

### Placeholder text IS instruction

- Every piece of text the user sees in the primitive — column headers, placeholders, empty-state messages, button labels — functions as instruction. If the placeholder says "Interpretation" but the column header says "Feeling · Need · Request," the user is getting contradictory instructions. Audit every visible text element in the primitive, not just the ones you control via prePopulated.

### Show the destination before the content

- In sort/categorize exercises, put the buckets ABOVE the cards — not below. The user needs to see where they're sorting TO before they start sorting FROM. Scrolling past 30 cards to discover the buckets defeats the purpose.

### Call to action and starting state

- "WHAT TO DO" is a section label, not a call to action. The primitive should signal where to begin — a first prompt, a highlighted empty field, a pre-filled starting row that invites continuation. The user should never have to figure out where to start.

### The learn → recognize → practice arc

- Many exercises stop at "recognize" without reaching "practice." Identifying your zone (Window of Tolerance), naming your pattern (Pattern Name), finding the assumption (Immunity to Change) are all recognition steps. The exercise must complete the arc: what do you DO with what you recognized? Without the practice step, the exercise is informational, not transformational.

### Missing affordances in primitives

- The card sort doesn't tell you to drag. The dialogue sequence doesn't tell you to type. The split annotator doesn't explain "+ Add row." When the primitive's interaction model isn't obvious, the instruction must include it, or the primitive needs micro-copy / empty-state prompts.

### Exercise scoping signals

- There's no visual signal for how long an exercise takes, how deep it goes, or what commitment is required. Consider whether the exercise card should communicate estimated time or effort level so the user can gauge commitment before starting.

### Interaction design direction (2026)

- Exercises should feel modern, fun, and easy to interact with. Not clinical worksheets.
- Use framer-motion for smooth transitions, staggered reveals, gesture-based interactions (drag, swipe, tap).
- Use Lottie animations for delightful feedback moments: completion celebrations, step transitions, empty state invitations.
- Use canvas-confetti sparingly for exercise completion — a small reward signal.
- Use @use-gesture/react for swipe between steps, drag-to-rate, mobile-native feel.
- Use Radix accordion/popover for progressive disclosure — reveal framework teaching in expandable sections rather than walls of text.
- Color should be purposeful — modality colors, state changes (selected/unselected), progress indicators. Not decorative.
- Interactions should give immediate visual feedback — a card landing in a bucket, a step completing, a response being acknowledged.

## Best practices by exercise type

### Values exercises

- Use an established coaching values list, not a blank word cloud. Present values as cards to sort ("This is me" / "Maybe" / "Not me"), not words to generate.
- Include coaching questions in the instruction: "When I align with this, am I naturally turned on — without effort?" and "If this were absent from my life, I wouldn't be me."
- A value is not a want, should, fantasy, or wish. Teach this distinction in whyThis.
- Values selection (Day 13) feeds into values ranking (Day 14) — the system must carry forward the user's selections.

### Saboteur/pattern exercises

- Use the dialogueSequence primitive for pattern work, not heatmaps. Recalling a specific moment ("when did this voice show up, what did it say, what might you try next time") is more impactful than rating intensity on a 1-5 grid.
- Pattern tracking should produce a concrete if-then plan, not data points.
- Saboteurs identified on Day 4 should be carried forward to Days 12, 25, and any future exercise that references them.

### Identity/belief exercises

- Pre-populate with relatable examples ("My value is what I produce," "I should always have a plan"). Never give a blank page for belief generation.
- Use splitAnnotator with "Belief" / "Origin · Helps or hinders?" columns — not freeform text.
- Family pattern exercises (hierarchicalBranch) need multiple entries per level with example prompts, not one blank field per level.

### Narrative exercises

- The narrativeTriptych is powerful for writing multiple versions of a story. Use it when the exercise asks the user to compare perspectives (polished vs honest vs raw, past vs present vs future).
- Always frame what the comparison reveals, not just the writing task.

### Sorting/categorizing exercises (cardSort)

- Buckets go on top, cards below — user sees the destination before the content.
- If the exercise teaches a framework (Four Horsemen → antidotes), include both the pattern cards AND the antidote cards so the learning happens during sorting.
- Use emotionally-graded bucket labels when appropriate ("This is me — loud and frequent" / "Shows up sometimes" / "Not really my pattern").

### Tracking exercises (heatmap)

- Heatmaps work for objective tracking (belonging levels, skill confidence) but NOT for subjective pattern recall. For pattern recall, use dialogueSequence instead.
- Always pre-populate rows and columns with meaningful labels, never "Pattern A" / "Mon."

### Body/somatic exercises

- Keep somatic exercises focused on one task: notice sensations. Don't combine with cognitive tasks (family beliefs, pattern analysis).
- The body map primitive works well for sensation marking — no changes needed to the primitive itself.

### Guided (text-only) exercises

- If asking for multiple structured items, use splitAnnotator with labeled rows instead of a blank textarea.
- If asking for one extended reflection, guided is fine but needs a clear prompt and word count expectation.
- Always provide a clear ending signal.

---

Back to: [content/CLAUDE.md](./CLAUDE.md) · [root CLAUDE.md](../CLAUDE.md)
