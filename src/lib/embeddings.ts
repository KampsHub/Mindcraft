const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";

interface VoyageEmbeddingResponse {
  data: Array<{ embedding: number[] }>;
  usage: { total_tokens: number };
}

async function callVoyageAPI(
  input: string | string[],
  inputType: "document" | "query"
): Promise<VoyageEmbeddingResponse> {
  const res = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: Array.isArray(input) ? input : [input],
      model: "voyage-3-lite",
      input_type: inputType,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Voyage AI API error (${res.status}): ${error}`);
  }

  return res.json();
}

/**
 * Generate an embedding for a single text (for storing documents).
 * Uses voyage-3-lite (512 dimensions).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await callVoyageAPI(text, "document");
  const embedding = result.data?.[0]?.embedding;
  if (!embedding) {
    throw new Error("No embedding returned from Voyage AI");
  }
  return embedding;
}

/**
 * Generate an embedding optimized for search queries.
 * Voyage AI uses asymmetric embeddings: "query" for searching, "document" for storing.
 */
export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const result = await callVoyageAPI(text, "query");
  const embedding = result.data?.[0]?.embedding;
  if (!embedding) {
    throw new Error("No embedding returned from Voyage AI");
  }
  return embedding;
}

/**
 * Batch-generate embeddings for multiple texts.
 * Used by the backfill script.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const result = await callVoyageAPI(texts, "document");
  return (result.data || []).map((item) => item.embedding);
}
