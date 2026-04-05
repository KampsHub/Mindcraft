import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAnthropicClient, getModelForTier } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { logApiCall } from "@/lib/api-logger";

const SIMULATE_SYSTEM_PROMPT = `You are playing a character in a coaching simulation exercise. The user is practicing a real conversation they need to have.

## Your role
You are {aiRole}. Stay fully in character. Respond as this person would — with their perspective, concerns, communication style, and emotional state.

## The scenario
{scenario}

## Rules
1. Stay in character at all times. Never break character to explain what you're doing.
2. Respond naturally — 1-3 sentences at a time. Keep it conversational, not monologue-length.
3. React to what the user actually says, not what a textbook would say. If they use a new technique well, let it land. If they stumble, respond realistically.
4. Do not coach the user. You are the OTHER person in the conversation, not a therapist.
5. Be realistic but not hostile. This person has their own perspective and it makes sense to them.
6. If the user uses a technique (NVC, boundaries, de-escalation), respond as the character would — maybe skeptically at first, but give ground if the user is genuinely connecting.
7. Keep your emotional register consistent with the scenario but responsive to the user's approach.

{systemPrompt}`;

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { scenario, aiRole, userRole, systemPrompt, message, history } = body as {
      scenario: string;
      aiRole: string;
      userRole?: string;
      systemPrompt?: string;
      message: string;
      history?: { role: string; content: string }[];
    };

    if (!scenario || !aiRole || !message) {
      return NextResponse.json(
        { error: "scenario, aiRole, and message are required" },
        { status: 400 }
      );
    }

    // Authenticate
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
            } catch { /* read-only in some contexts */ }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    // Rate limit
    const rateLimitResponse = checkRateLimit(user.id, "ai");
    if (rateLimitResponse) return rateLimitResponse;

    // Build system prompt
    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;

    const filledSystemPrompt = SIMULATE_SYSTEM_PROMPT
      .replace("{aiRole}", aiRole)
      .replace("{scenario}", scenario)
      .replace("{systemPrompt}", systemPrompt || "");

    // Build messages from history
    const messages: { role: "user" | "assistant"; content: string }[] = [];

    if (history && history.length > 0) {
      for (const msg of history) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const model = getModelForTier("standard");
    const response = await ac.client.messages.create({
      model,
      max_tokens: 300,
      system: filledSystemPrompt,
      messages,
    });

    const aiResponse = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    // Generate coaching nudge (optional — quick analysis of user's technique)
    let coachingNudge: string | null = null;
    try {
      const nudgeResponse = await ac.client.messages.create({
        model,
        max_tokens: 100,
        system: `You are a coaching observer watching a conversation practice simulation. The user (${userRole || "the practitioner"}) just said something to ${aiRole}. In ONE short sentence (max 15 words), note what technique they used or what they might try differently. Be specific and encouraging. If their response was strong, say what worked. Examples: "Good — you led with observation, not judgment." or "Try naming the specific need behind your request." Do not explain frameworks; just note the moment.`,
        messages: [
          {
            role: "user",
            content: `The user said: "${message}"\n\nContext: ${scenario}`,
          },
        ],
      });
      coachingNudge = nudgeResponse.content[0].type === "text"
        ? nudgeResponse.content[0].text
        : null;
    } catch {
      // Nudge is non-blocking
    }

    const latencyMs = Date.now() - startTime;

    // Log the API call
    logApiCall({
      clientId: user.id,
      endpoint: "/api/exercises/simulate",
      model,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      latencyMs,
    });

    return NextResponse.json({
      response: aiResponse,
      coachingNudge,
    });
  } catch (error) {
    console.error("Simulate error:", error);
    return NextResponse.json(
      { error: "Simulation temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
