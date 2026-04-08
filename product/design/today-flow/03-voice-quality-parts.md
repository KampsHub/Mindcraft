# Today Flow Design — Section 3: Voice, Exercise Quality, Parts Check-In

> Split from `docs/today-flow-design.md`. Sections 5 + 6 + 7.

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

