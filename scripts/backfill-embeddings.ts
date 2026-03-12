/**
 * Backfill embeddings for all existing entries that don't have one.
 * Run: npx tsx scripts/backfill-embeddings.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: texts,
      model: "voyage-3-lite",
      input_type: "document",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Voyage AI API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  return (data.data || []).map((item: { embedding: number[] }) => item.embedding);
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all entries without embeddings
  const { data: entries, error } = await supabase
    .from("entries")
    .select("id, content, transcript")
    .is("embedding", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch entries:", error);
    process.exit(1);
  }

  if (!entries || entries.length === 0) {
    console.log("No entries to backfill.");
    return;
  }

  console.log(`Found ${entries.length} entries to embed.`);

  const BATCH_SIZE = 32;
  let processed = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const texts = batch.map((e) => e.content || e.transcript || "");

    // Filter out entries with no text
    const validPairs = batch
      .map((entry, idx) => ({ entry, text: texts[idx] }))
      .filter((pair) => pair.text.length > 0);

    if (validPairs.length === 0) continue;

    const embeddings = await embedBatch(validPairs.map((p) => p.text));

    for (let j = 0; j < validPairs.length; j++) {
      const embedding = embeddings[j];
      if (!embedding) continue;

      const { error: updateError } = await supabase
        .from("entries")
        .update({ embedding: JSON.stringify(embedding) })
        .eq("id", validPairs[j].entry.id);

      if (updateError) {
        console.error(
          `Failed to update entry ${validPairs[j].entry.id}:`,
          updateError
        );
      } else {
        processed++;
      }
    }

    console.log(`Processed ${processed}/${entries.length} entries...`);

    // Rate limit: 200ms between batches
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`Done. Embedded ${processed} entries.`);
}

main().catch(console.error);
