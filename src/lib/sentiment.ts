import { getAnthropicClient, getModelForTier } from "@/lib/api-validation";

export interface SentimentScore {
  valence: number;      // -1 (negative) to 1 (positive)
  arousal: number;      // 0 (calm) to 1 (activated)
  dominant_emotions: string[];  // max 3
  identity_coherence: number;   // 0 (fragmented) to 1 (integrated)
}

export async function analyzeSentiment(journalContent: string): Promise<SentimentScore | null> {
  const ac = getAnthropicClient();
  if (!ac.success) return null;
  const anthropic = ac.client;

  try {
    const message = await anthropic.messages.create({
      model: getModelForTier("fast"),
      max_tokens: 200,
      system: `You analyze the emotional tone of journal entries. Return ONLY valid JSON (no fences):
{
  "valence": <-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive>,
  "arousal": <0 to 1, where 0 is calm/low energy, 1 is highly activated/intense>,
  "dominant_emotions": [<up to 3 emotion words like "anxiety", "hope", "grief", "anger", "relief", "confusion">],
  "identity_coherence": <0 to 1, where 0 means fragmented/lost sense of self, 1 means integrated/clear identity>
}
Be precise. Base scores on what's actually written, not assumptions.`,
      messages: [{ role: "user", content: journalContent }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    let raw = textBlock.text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    return JSON.parse(raw) as SentimentScore;
  } catch (err) {
    console.warn("Sentiment analysis failed (non-blocking):", err);
    return null;
  }
}
