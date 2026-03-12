/**
 * Eval script: Score coaching outputs using Claude as evaluator
 *
 * Usage:
 *   npx tsx scripts/eval-outputs.ts
 *
 * Requires:
 *   - scripts/synthetic-results.json (from run-synthetic.ts)
 *   - CLAUDE_API_KEY in .env.local
 *
 * Outputs: scripts/eval-scores.json
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

interface SyntheticResult {
  id: number;
  label: string;
  entry: string;
  reflection: string;
  theme_tags: string[];
  error?: string;
}

interface EvalScore {
  id: number;
  label: string;
  scores: {
    voice_authenticity: number;
    addresses_real_issue: number;
    client_helpfulness: number;
    pattern_recognition: number;
    appropriate_boundaries: number;
    theme_accuracy: number;
  };
  total: number;
  feedback: string;
  flags: string[];
}

const EVAL_SYSTEM_PROMPT = `You are a coaching quality evaluator. You receive a client journal entry and the coaching response that was generated for it.

Score the coaching response on these 6 dimensions (1-5 each, where 1=poor, 3=adequate, 5=excellent):

1. **voice_authenticity** (1-5): Does this sound like a real coaching companion — warm, direct, grounded? Or does it sound like a generic AI wellness bot? High scores: specific, has personality, matches emotional register. Low scores: "I hear you", "That's valid", generic affirmations, performative enthusiasm.

2. **addresses_real_issue** (1-5): Does the response address what's actually going on in the entry, or does it dance around it? High scores: names the real dynamic, gets underneath the surface. Low scores: restates what the person said, offers platitudes, misses the point.

3. **client_helpfulness** (1-5): Would a real client find this genuinely useful? Does it give them something to think about or work with? High scores: offers a question, names a pattern, provides a reframe that opens something up. Low scores: generic encouragement, obvious observations, nothing actionable.

4. **pattern_recognition** (1-5): Does the response identify patterns, connect dots, or name dynamics the client might not see? High scores: connects the entry to deeper patterns (family-of-origin, attachment style, coping mechanisms). Low scores: surface-level observations, restating obvious facts.

5. **appropriate_boundaries** (1-5): Does the response stay within coaching boundaries? For crisis entries, does it acknowledge and redirect to professional help without trying to therapise? High scores: maintains coaching scope, doesn't overstep. Low scores: plays therapist, ignores red flags, gives medical/legal/financial advice.

6. **theme_accuracy** (1-5): Are the theme tags accurate and relevant to the entry content? High scores: tags reflect the core themes present. Low scores: irrelevant tags, missing obvious themes, over-tagging.

Also provide:
- **feedback**: One sentence of specific feedback on the biggest strength or weakness
- **flags**: An array of any concerns (empty array if none). Possible flags:
  - "generic_language" - sounds like every other AI
  - "missed_crisis" - failed to recognise crisis language
  - "over_therapised" - crossed into therapy territory
  - "missed_theme" - obvious theme not tagged
  - "wrong_theme" - tagged a theme that doesn't apply
  - "too_long" - response is unnecessarily verbose
  - "too_short" - response doesn't give the client enough to work with
  - "fake_positivity" - forced optimism that dismisses the emotion
  - "no_question" - missed an opportunity to ask a grounding question

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
  "total": <sum of all scores>,
  "feedback": "<one sentence>",
  "flags": ["flag1", "flag2"]
}`;

async function evalEntry(
  anthropic: Anthropic,
  result: SyntheticResult
): Promise<EvalScore> {
  const userPrompt = `## Client Journal Entry
${result.entry}

## Coaching Response
${result.reflection}

## Theme Tags Applied
${result.theme_tags.join(", ")}

Score this coaching response.`;

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
    id: result.id,
    label: result.label,
    scores: parsed.scores,
    total: parsed.total,
    feedback: parsed.feedback,
    flags: parsed.flags || [],
  };
}

async function main() {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error("ERROR: CLAUDE_API_KEY not found. Make sure .env.local exists with the key.");
    process.exit(1);
  }

  const resultsPath = path.join(__dirname, "synthetic-results.json");
  if (!fs.existsSync(resultsPath)) {
    console.error("ERROR: synthetic-results.json not found. Run `npx tsx scripts/run-synthetic.ts` first.");
    process.exit(1);
  }

  const results: SyntheticResult[] = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
  const validResults = results.filter((r) => !r.error && r.reflection);

  console.log(`\nEvaluating ${validResults.length} coaching outputs...\n`);

  const anthropic = new Anthropic({ apiKey });
  const evalScores: EvalScore[] = [];
  let totalCost = 0;

  for (const result of validResults) {
    process.stdout.write(`  [${result.id}/${validResults.length}] ${result.label}... `);

    try {
      const score = await evalEntry(anthropic, result);
      evalScores.push(score);
      console.log(`${score.total}/30 ${score.flags.length ? `[${score.flags.join(", ")}]` : ""}`);
    } catch (err) {
      console.log(`ERROR: ${err instanceof Error ? err.message : "Unknown"}`);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Save scores
  const outputPath = path.join(__dirname, "eval-scores.json");
  fs.writeFileSync(outputPath, JSON.stringify(evalScores, null, 2));

  // Summary statistics
  const totals = evalScores.map((s) => s.total);
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
  const min = Math.min(...totals);
  const max = Math.max(...totals);

  const dimAverages: Record<string, number> = {};
  const dims = [
    "voice_authenticity",
    "addresses_real_issue",
    "client_helpfulness",
    "pattern_recognition",
    "appropriate_boundaries",
    "theme_accuracy",
  ] as const;

  dims.forEach((dim) => {
    const scores = evalScores.map((s) => s.scores[dim]);
    dimAverages[dim] = scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  // Flag frequency
  const flagCounts: Record<string, number> = {};
  evalScores.forEach((s) => {
    s.flags.forEach((f) => {
      flagCounts[f] = (flagCounts[f] || 0) + 1;
    });
  });

  console.log(`\n${"=".repeat(60)}`);
  console.log(`EVAL SUMMARY`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Entries evaluated:  ${evalScores.length}`);
  console.log(`  Average score:      ${avg.toFixed(1)} / 30`);
  console.log(`  Range:              ${min} – ${max}`);
  console.log(`\nDIMENSION AVERAGES (out of 5):`);
  console.log(`${"=".repeat(60)}`);
  dims.forEach((dim) => {
    const val = dimAverages[dim];
    const bar = "\u2588".repeat(Math.round(val));
    const empty = "\u2591".repeat(5 - Math.round(val));
    console.log(`  ${dim.padEnd(28)} ${val.toFixed(1)}  ${bar}${empty}`);
  });

  if (Object.keys(flagCounts).length > 0) {
    console.log(`\nFLAGS:`);
    console.log(`${"=".repeat(60)}`);
    Object.entries(flagCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([flag, count]) => {
        console.log(`  ${flag.padEnd(28)} ${count}`);
      });
  }

  // Bottom 5 entries (lowest scores)
  const sorted = [...evalScores].sort((a, b) => a.total - b.total);
  console.log(`\nBOTTOM 5 (needs improvement):`);
  console.log(`${"=".repeat(60)}`);
  sorted.slice(0, 5).forEach((s) => {
    console.log(`  [${s.id}] ${s.label.padEnd(30)} ${s.total}/30  ${s.feedback}`);
  });

  // Top 5 entries
  console.log(`\nTOP 5 (strong responses):`);
  console.log(`${"=".repeat(60)}`);
  sorted.slice(-5).reverse().forEach((s) => {
    console.log(`  [${s.id}] ${s.label.padEnd(30)} ${s.total}/30  ${s.feedback}`);
  });

  console.log(`\nScores saved to: ${outputPath}\n`);
}

main().catch(console.error);
