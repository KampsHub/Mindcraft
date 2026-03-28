import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const exerciseVoiceSchema = z.object({
  exerciseName: z.string().min(1).max(200),
  instructions: z.string().min(1).max(5000),
  whyNow: z.string().max(1000).optional(),
  history: z.array(z.object({
    role: z.string(),
    text: z.string(),
  })).optional(),
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch { /* Server Component context */ }
          },
        },
      }
    );

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    // Rate limit (AI bucket — 10 req/min)
    const rateLimitResponse = checkRateLimit(user.id, "ai");
    if (rateLimitResponse) return rateLimitResponse;

    const result = getAnthropicClient();
    if (!result.success) return result.response;

    const body = await request.json();
    const parsed = exerciseVoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { exerciseName, instructions, whyNow, history } = parsed.data;

    // Sanitize inputs to prevent prompt injection
    const sanitize = (str: string) => str.replace(/[<>{}]/g, '').substring(0, 2000);
    const safeExerciseName = sanitize(exerciseName);
    const safeInstructions = sanitize(instructions);
    const safeWhyNow = whyNow ? sanitize(whyNow) : "";

    const systemPrompt = `You are a coaching assistant for Mindcraft. You are guiding someone through a specific exercise via spoken conversation.

Exercise: ${safeExerciseName}
Instructions: ${safeInstructions}
${safeWhyNow ? `Why this exercise now: ${safeWhyNow}` : ""}

Your job:
1. On the FIRST message (when the user says "start"), introduce the exercise warmly in 2-3 sentences. Then give the first step or prompt. Speak as if talking to someone sitting across from you.
2. After each user response, acknowledge briefly (1 sentence max), then guide to the next step.
3. Break the instructions into small, conversational steps. Don't dump everything at once.
4. When all steps are covered, summarize what came up in 2-3 sentences and close warmly.

Voice rules:
- Keep every response under 4 sentences. This is spoken, not written.
- No bullet points, headers, markdown, or formatting.
- No "I understand" or "That makes sense" — those are filler.
- Quote their actual words when reflecting back.
- Match their energy — if they give a short answer, give a short response.
- Make somatic exercises accessible: "data collection, not feelings exploration."
- Warm but direct. No motivational filler.`;

    // Build messages from history
    const messages: Array<{ role: "user" | "assistant"; content: string }> =
      (history || []).map((h: { role: string; text: string }) => ({
        role: h.role as "user" | "assistant",
        content: h.text,
      }));

    // If no history, this is the first turn
    if (messages.length === 0) {
      messages.push({ role: "user", content: "start" });
    }

    const response = await result.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 250,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Exercise voice error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
