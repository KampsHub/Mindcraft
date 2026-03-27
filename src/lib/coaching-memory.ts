import { createClient } from "@supabase/supabase-js";
import { getAnthropicClient, getModelForTier } from "@/lib/api-validation";

const MEMORY_TYPES = [
  "insight", "pattern", "breakthrough", "trigger",
  "preference", "goal_progress", "relationship",
] as const;

type MemoryType = typeof MEMORY_TYPES[number];

interface CoachingMemory {
  id: string;
  memory_type: MemoryType;
  content: string;
  source_day: number;
  relevance_score: number;
  created_at: string;
}

// ── Extract memories from a journal processing session ──
// Called after process-journal or daily-summary completes.
// Uses Haiku (fast tier) to keep costs low.

export async function extractMemories(
  clientId: string,
  enrollmentId: string,
  dayNumber: number,
  journalContent: string,
  aiAnalysis: string
): Promise<void> {
  const ac = getAnthropicClient();
  if (!ac.success) return;
  const anthropic = ac.client;

  try {
    const message = await anthropic.messages.create({
      model: getModelForTier("fast"),
      max_tokens: 500,
      system: `You extract coaching memories from a journal session. A "memory" is a key insight, pattern, breakthrough, trigger, or relationship dynamic worth remembering for future sessions.

Return valid JSON (no fences):
{
  "memories": [
    {
      "type": "insight" | "pattern" | "breakthrough" | "trigger" | "preference" | "goal_progress" | "relationship",
      "content": "One clear sentence capturing the memory",
      "importance": 0.5-1.0
    }
  ]
}

Rules:
- Extract 1-3 memories MAX. Only genuine insights worth carrying forward.
- If nothing new surfaced, return {"memories": []}
- Use the person's actual words when possible
- "pattern" = something recurring. "insight" = something newly realized. "breakthrough" = a significant shift.
- Keep each memory under 50 words`,
      messages: [{
        role: "user",
        content: `## Journal Entry (Day ${dayNumber})\n${journalContent}\n\n## AI Analysis\n${aiAnalysis}`,
      }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return;

    let raw = textBlock.text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const result = JSON.parse(raw);

    if (!result.memories || result.memories.length === 0) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const inserts = result.memories.map(
      (m: { type: MemoryType; content: string; importance: number }) => ({
        client_id: clientId,
        enrollment_id: enrollmentId,
        memory_type: m.type,
        content: m.content,
        source_day: dayNumber,
        relevance_score: m.importance || 0.8,
      })
    );

    await supabase.from("coaching_memory").insert(inserts);
  } catch (err) {
    // Memory extraction is non-blocking — don't fail the main flow
    console.warn("Memory extraction failed (non-blocking):", err);
  }
}

// ── Retrieve relevant memories for a new interaction ──
// Returns top N memories sorted by relevance, optionally filtered by type.

export async function getRelevantMemories(
  clientId: string,
  limit: number = 10,
  types?: MemoryType[]
): Promise<CoachingMemory[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return [];

  const supabase = createClient(supabaseUrl, supabaseKey);

  let query = supabase
    .from("coaching_memory")
    .select("id, memory_type, content, source_day, relevance_score, created_at")
    .eq("client_id", clientId)
    .gt("relevance_score", 0.2)
    .order("relevance_score", { ascending: false })
    .limit(limit);

  if (types && types.length > 0) {
    query = query.in("memory_type", types);
  }

  const { data } = await query;
  return (data as CoachingMemory[]) || [];
}

// ── Format memories for injection into AI prompts ──

export function formatMemoriesForPrompt(memories: CoachingMemory[]): string {
  if (!memories || memories.length === 0) return "";

  const lines = memories.map(
    (m) => `- [${m.memory_type}, Day ${m.source_day}] ${m.content}`
  );

  return `\n## Coaching Memory — What We Know About This Person
These are key insights, patterns, and breakthroughs from previous sessions. Reference them naturally when relevant — don't list them back to the user.

${lines.join("\n")}\n\n`;
}

// ── Mark memories as referenced (prevents decay) ──

export async function touchMemories(memoryIds: string[]): Promise<void> {
  if (memoryIds.length === 0) return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);

  await supabase
    .from("coaching_memory")
    .update({
      last_referenced_at: new Date().toISOString(),
    })
    .in("id", memoryIds);
}
