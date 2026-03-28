import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAnthropicClient, getModelForTier } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Expands terse seed prompts into full, clear questions.
 * Called once per program day — results cached in the database.
 * Uses Haiku for speed and cost (~$0.001 per call).
 */
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const rateLimitResponse = checkRateLimit(user.id, "ai");
    if (rateLimitResponse) return rateLimitResponse;

    const { programDayId, seedPrompts, territory } = await request.json();
    if (!programDayId || !seedPrompts || !Array.isArray(seedPrompts)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;

    const promptTexts = seedPrompts.map((sp: { prompt: string; purpose: string; context?: string }) =>
      `- "${sp.prompt}" (purpose: ${sp.purpose})`
    ).join("\n");

    const message = await ac.client.messages.create({
      model: getModelForTier("fast"), // Haiku — cheapest
      max_tokens: 500,
      system: `You expand terse coaching prompts into clear, full questions. Each expanded prompt should:
1. Be a complete, standalone question or instruction (not a fragment)
2. Keep the original intent and emotional direction
3. Be warm and direct — not clinical, not motivational
4. Be 1-2 sentences max
5. Use "you" — speak directly to the person

Return valid JSON array (no markdown, no fences):
["expanded prompt 1", "expanded prompt 2", ...]`,
      messages: [{
        role: "user",
        content: `Today's territory: ${territory || "general coaching"}

Expand these terse prompts into clear questions:\n${promptTexts}`,
      }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Unable to expand prompts" }, { status: 500 });
    }

    let expanded: string[];
    try {
      let raw = textBlock.text.trim();
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```[^\n]*\n?/, "").replace(/\n?```\s*$/, "");
      }
      expanded = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Failed to parse expanded prompts" }, { status: 500 });
    }

    // Build updated seed_prompts with expanded field
    const updatedPrompts = seedPrompts.map((sp: { prompt: string; purpose: string; context?: string }, i: number) => ({
      ...sp,
      expanded: expanded[i] || sp.prompt,
    }));

    // Save back to database (cache forever)
    await supabase
      .from("program_days")
      .update({ seed_prompts: updatedPrompts })
      .eq("id", programDayId);

    return NextResponse.json({ expanded: updatedPrompts });
  } catch (error) {
    console.error("Expand prompts error:", error);
    return NextResponse.json({ error: "Failed to expand prompts" }, { status: 500 });
  }
}
