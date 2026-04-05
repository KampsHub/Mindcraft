import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validateBody, getAnthropicClient, getModelForTier, buildCachedSystem } from "@/lib/api-validation";
import { COMPRESSED_VOICE } from "@/lib/coaching-voice";
import { checkRateLimit } from "@/lib/rate-limit";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const processInsightSchema = z.object({
  exerciseCompletionId: z.string().uuid(),
  frameworkName: z.string().min(1),
  responses: z.record(z.string(), z.string()),
  customFraming: z.string().optional(),
});

const INSIGHT_PROMPT = `You are generating a brief insight from a completed exercise.

The user just completed an exercise called "{frameworkName}".
{customFramingSection}

Their responses are below. Write 1-2 sentences capturing what they discovered, what shifted, or what stands out.

Rules:
- Quote their actual words where possible — put them in quotes.
- Use coach voice: "it sounds like" or "you might be noticing" — never "you are" or "the pattern is."
- No clinical labels. No praise. No motivational language.
- Be specific to THIS exercise — not generic.
- Return ONLY the insight text. No JSON, no labels, no preamble.

Their responses:
{responses}`;

export async function POST(request: Request) {
  // Auth
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit
  const limited = checkRateLimit(user.id, "ai");
  if (limited) return limited;

  // Validate body
  const rawBody = await request.json();
  const body = validateBody(processInsightSchema, rawBody);
  if (!body.success) return body.response;
  const { exerciseCompletionId, frameworkName, responses, customFraming } = body.data;

  // Get AI client
  const ai = getAnthropicClient();
  if (!ai.success) return ai.response;

  // Format responses for prompt
  const responsesText = Object.entries(responses)
    .map(([key, value]) => {
      if (key === "main") return value;
      try {
        const parsed = JSON.parse(value);
        return `${key}: ${JSON.stringify(parsed, null, 2)}`;
      } catch {
        return `${key}: ${value}`;
      }
    })
    .filter(Boolean)
    .join("\n\n");

  const customFramingSection = customFraming
    ? `Context for this exercise: ${customFraming}`
    : "";

  const prompt = INSIGHT_PROMPT
    .replace("{frameworkName}", frameworkName)
    .replace("{customFramingSection}", customFramingSection)
    .replace("{responses}", responsesText);

  try {
    const message = await ai.client.messages.create({
      model: getModelForTier("fast"),
      max_tokens: 200,
      system: buildCachedSystem(COMPRESSED_VOICE, prompt),
      messages: [{ role: "user", content: "Generate the insight." }],
    });

    const insight = (message.content[0] as { type: "text"; text: string }).text.trim();

    // Save insight to database
    const admin = getAdminSupabase();
    await admin
      .from("exercise_completions")
      .update({ insight })
      .eq("id", exerciseCompletionId);

    return NextResponse.json({ insight, success: true });
  } catch (error) {
    console.error("Error generating exercise insight:", error);
    return NextResponse.json(
      { error: "Failed to generate insight" },
      { status: 500 }
    );
  }
}

// Save edited insight
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { exerciseCompletionId, insight } = await request.json();
  if (!exerciseCompletionId || typeof insight !== "string") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const admin = getAdminSupabase();
  const { error } = await admin
    .from("exercise_completions")
    .update({ insight, insight_edited_at: new Date().toISOString() })
    .eq("id", exerciseCompletionId);

  if (error) {
    return NextResponse.json({ error: "Failed to save insight" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
