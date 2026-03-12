/**
 * Run 30 synthetic journal entries through /api/reflect
 *
 * Usage:
 *   npx tsx scripts/run-synthetic.ts
 *
 * Requires the dev server running at localhost:3000
 * Outputs results to scripts/synthetic-results.json
 */

import fs from "fs";
import path from "path";

interface SyntheticEntry {
  id: number;
  label: string;
  entry: string;
}

interface Result {
  id: number;
  label: string;
  entry: string;
  reflection: string;
  theme_tags: string[];
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  error?: string;
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runEntry(entry: SyntheticEntry): Promise<Result> {
  const start = Date.now();

  try {
    const res = await fetch(`${BASE_URL}/api/reflect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: entry.entry }),
    });

    const latency = Date.now() - start;
    const data = await res.json();

    if (!res.ok) {
      return {
        ...entry,
        reflection: "",
        theme_tags: [],
        model: "",
        input_tokens: 0,
        output_tokens: 0,
        latency_ms: latency,
        error: data.error || `HTTP ${res.status}`,
      };
    }

    return {
      id: entry.id,
      label: entry.label,
      entry: entry.entry,
      reflection: data.reflection,
      theme_tags: data.theme_tags || [],
      model: data.model || "",
      input_tokens: data.usage?.input_tokens || 0,
      output_tokens: data.usage?.output_tokens || 0,
      latency_ms: latency,
    };
  } catch (err) {
    return {
      ...entry,
      reflection: "",
      theme_tags: [],
      model: "",
      input_tokens: 0,
      output_tokens: 0,
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function main() {
  const entriesPath = path.join(__dirname, "synthetic-entries.json");
  const entries: SyntheticEntry[] = JSON.parse(fs.readFileSync(entriesPath, "utf-8"));

  console.log(`\nRunning ${entries.length} synthetic entries through /api/reflect...\n`);

  const results: Result[] = [];
  let totalTokens = 0;
  let totalLatency = 0;
  let errors = 0;

  for (const entry of entries) {
    process.stdout.write(`  [${entry.id}/${entries.length}] ${entry.label}... `);

    const result = await runEntry(entry);
    results.push(result);

    if (result.error) {
      console.log(`ERROR: ${result.error}`);
      errors++;
    } else {
      const tokens = result.input_tokens + result.output_tokens;
      totalTokens += tokens;
      totalLatency += result.latency_ms;
      console.log(`OK (${result.latency_ms}ms, ${tokens} tokens, tags: ${result.theme_tags.join(", ")})`);
    }

    // Rate limiting: wait 500ms between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Save results
  const outputPath = path.join(__dirname, "synthetic-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  // Summary
  const successful = results.filter((r) => !r.error);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`SUMMARY`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Total entries:     ${entries.length}`);
  console.log(`  Successful:        ${successful.length}`);
  console.log(`  Errors:            ${errors}`);
  console.log(`  Total tokens:      ${totalTokens.toLocaleString()}`);
  console.log(`  Avg latency:       ${successful.length ? Math.round(totalLatency / successful.length) : 0}ms`);
  console.log(`  Avg tokens/entry:  ${successful.length ? Math.round(totalTokens / successful.length) : 0}`);
  console.log(`\nResults saved to: ${outputPath}\n`);

  // Theme distribution
  const themeCounts: Record<string, number> = {};
  successful.forEach((r) => {
    r.theme_tags.forEach((tag) => {
      themeCounts[tag] = (themeCounts[tag] || 0) + 1;
    });
  });
  const sortedThemes = Object.entries(themeCounts)
    .sort(([, a], [, b]) => b - a);

  console.log(`THEME DISTRIBUTION`);
  console.log(`${"=".repeat(60)}`);
  sortedThemes.forEach(([tag, count]) => {
    const bar = "\u2588".repeat(count);
    console.log(`  ${tag.padEnd(28)} ${String(count).padStart(2)}  ${bar}`);
  });
  console.log("");
}

main().catch(console.error);
