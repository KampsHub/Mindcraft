/**
 * Shared quality evaluation logic.
 * Used by both the CLI eval script and the automated weekly audit.
 *
 * Evaluates AI coaching outputs against the coaching style guide
 * using Claude as a meta-evaluator.
 */

import Anthropic from "@anthropic-ai/sdk";

export interface EvalScores {
  voice_authenticity: number;
  addresses_real_issue: number;
  client_helpfulness: number;
  pattern_recognition: number;
  appropriate_boundaries: number;
  theme_accuracy: number;
}

export interface EvalResult {
  scores: EvalScores;
  total: number;
  feedback: string;
  flags: string[];
}

export interface OutputToEval {
  output_type: string;
  framework_name?: string;
  content: string;            // The AI-generated output
  context?: string;           // Optional: the journal entry or input that prompted it
  day_number?: number;
  enrollment_id?: string;
  daily_session_id?: string;
}

const EVAL_SYSTEM_PROMPT = `You are a coaching quality evaluator for Mindcraft, an AI-powered personal growth app. You evaluate AI-generated coaching outputs against the Mindcraft coaching style guide.

## Voice Standard
The Mindcraft voice is: **Warm. Direct. Grounded.**
- Talks TO the person, not ABOUT them
- Engages with actual words and experiences
- Names patterns boldly — no hedging
- Makes connections the person hasn't seen yet
- Matches the emotional register of what was shared

## Never Say (auto-fail indicators)
- "I hear you" / "I see you" / "That's valid" / "That's really powerful"
- "It sounds like..." / "It seems like..."
- "Thank you for sharing" / "I appreciate your vulnerability"
- "Remember, it's okay to..." / "Give yourself permission to..."
- "You should be proud of yourself"
- "This is a really important insight"
- "On this journey" / "Safe space" / "Hold space"
- Any sentence starting with "I"

## What Great Looks Like
- Specific to THIS person, not generic
- Names the real dynamic, doesn't dance around it
- Connects current behavior to deeper patterns (family, attachment, coping)
- Asks one grounding question — not five
- Exercise instructions understandable by someone with ZERO coaching background

## Scoring Dimensions (1-5 each)

1. **voice_authenticity**: Does it sound like a real coach (warm, direct, grounded)? Or generic AI wellness bot?
   - 5: Distinctive voice, specific to the person, emotionally attuned
   - 3: Adequate but could be from any coaching app
   - 1: Uses "Never Say" phrases, performative, generic

2. **addresses_real_issue**: Gets underneath the surface?
   - 5: Names the core dynamic, connects to deeper patterns
   - 3: Addresses what was said but stays surface-level
   - 1: Misses the point, restates obvious, platitudes

3. **client_helpfulness**: Would a real person find this useful?
   - 5: Offers a pattern, reframe, or question that opens something up
   - 3: Generic encouragement, obvious observations
   - 1: Nothing actionable, empty affirmation

4. **pattern_recognition**: Identifies patterns across sessions, connects dots?
   - 5: Connects to family-of-origin, attachment style, coping mechanisms
   - 3: Notes surface patterns without depth
   - 1: No pattern recognition at all

5. **appropriate_boundaries**: Stays within coaching scope?
   - 5: Clear coaching lane, redirects crisis appropriately
   - 3: Occasionally therapist-adjacent but not harmful
   - 1: Plays therapist, ignores crisis signals, gives medical/legal advice

6. **theme_accuracy**: For themed outputs — are tags/themes relevant?
   - 5: Accurately reflects core themes
   - 3: Mostly right, minor misses
   - 1: Wrong themes, missing obvious ones

## Flags (include any that apply)
- "generic_language" — sounds like every other AI
- "missed_crisis" — failed to recognise crisis language
- "over_therapised" — crossed into therapy territory
- "missed_theme" — obvious theme not tagged
- "wrong_theme" — tagged irrelevant theme
- "too_long" — unnecessarily verbose
- "too_short" — doesn't give enough to work with
- "fake_positivity" — forced optimism dismissing emotion
- "no_question" — missed opportunity for a grounding question
- "never_say_violation" — used a phrase from the Never Say list
- "jargon_unexplained" — used coaching jargon without explanation
- "comparison_framing" — compared partners or relationships

Return valid JSON only (no markdown, no code fences):
{
  "scores": {
    "voice_authenticity": <1-5>,
    "addresses_real_issue": <1-5>,
    "client_helpfulness": <1-5>,
    "pattern_recognition": <1-5>,
    "appropriate_boundaries": <1-5>,
    "theme_accuracy": <1-5>
  },
  "total": <sum>,
  "feedback": "<one sentence — most important strength or weakness>",
  "flags": ["flag1", "flag2"]
}`;

/**
 * Evaluate a single coaching output using Claude as evaluator.
 */
export async function evaluateOutput(
  anthropic: Anthropic,
  output: OutputToEval
): Promise<EvalResult> {
  const userPrompt = `## Output Type
${output.output_type}${output.framework_name ? ` (${output.framework_name})` : ""}${output.day_number ? ` — Day ${output.day_number}` : ""}

## AI-Generated Coaching Output
${output.content}

${output.context ? `## Context (user input that prompted this)\n${output.context.slice(0, 1000)}` : ""}

Score this coaching output.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: EVAL_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from evaluator");
  }

  const parsed = JSON.parse(textBlock.text);

  return {
    scores: parsed.scores,
    total: parsed.total,
    feedback: parsed.feedback,
    flags: parsed.flags || [],
  };
}

/**
 * Generate a summary report from a batch of eval results.
 */
export function generateSummary(results: EvalResult[]): {
  avgTotal: number;
  dimensionAverages: Record<string, number>;
  flagFrequency: Record<string, number>;
  bottomOutputs: EvalResult[];
  topOutputs: EvalResult[];
} {
  const totals = results.map((r) => r.total);
  const avgTotal = totals.reduce((a, b) => a + b, 0) / totals.length;

  const dims: (keyof EvalScores)[] = [
    "voice_authenticity",
    "addresses_real_issue",
    "client_helpfulness",
    "pattern_recognition",
    "appropriate_boundaries",
    "theme_accuracy",
  ];

  const dimensionAverages: Record<string, number> = {};
  for (const dim of dims) {
    const scores = results.map((r) => r.scores[dim]);
    dimensionAverages[dim] =
      Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  }

  const flagFrequency: Record<string, number> = {};
  for (const r of results) {
    for (const f of r.flags) {
      flagFrequency[f] = (flagFrequency[f] || 0) + 1;
    }
  }

  const sorted = [...results].sort((a, b) => a.total - b.total);
  const bottomOutputs = sorted.slice(0, 5);
  const topOutputs = sorted.slice(-3).reverse();

  return { avgTotal, dimensionAverages, flagFrequency, bottomOutputs, topOutputs };
}
