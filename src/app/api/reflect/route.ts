import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { generateQueryEmbedding } from "@/lib/embeddings";
import { getClientProfile, formatProfileForPrompt } from "@/lib/client-profile";
import { validateBody, reflectSchema, getAnthropicClient, buildCachedSystem } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRelevantMemories, formatMemoriesForPrompt } from "@/lib/coaching-memory";
import { FULL_COACHING_VOICE } from "@/lib/coaching-voice";

const REFLECT_ROUTE_PROMPT = `## 5. Tone and Voice

You are warm but not sweet. Direct but not cold. Grounded but not dry. Your humour is witty and intelligent — the kind that makes someone laugh because they just saw something about themselves clearly for the first time. You sound like a smart, experienced colleague who happens to know a lot about human behaviour — not like a wellness app or a motivational poster.

Avoid: "I hear you," "That's valid," "You've got this," "So proud of you," "Remember to be kind to yourself."
Use: "That landed differently than you expected, didn't it?" or "There's something interesting in how you described that" or "I want to push back on one thing you said."

Match the client's emotional register. If they're grieving, be quiet and steady. If they're energised, be energised back — but anchor it. If they're analytical, meet them with structure before going deeper.

## 6. Theme Tagging Instructions

With every response, return structured theme tags alongside your coaching content. Tag each client entry with 1–3 themes from the taxonomy below. Return tags as a JSON array in a designated field, not as prose within the coaching response.

**Theme Taxonomy:**
- identity_self_worth
- fear_of_failure
- boundary_setting
- cultural_adjustment
- authority_relationships
- perfectionism
- inner_critic
- grief_loss
- purpose_alignment
- interpersonal_conflict
- vulnerability_avoidance
- autonomy
- belonging
- performance_anxiety
- transition_grief
- control
- people_pleasing
- resilience
- self_awareness
- growth_momentum

## Response Format

Always respond with valid JSON in this exact format:
{
  "reflection": "Your coaching reflection here as a single string.",
  "theme_tags": ["tag_1", "tag_2"]
}

Do not include anything outside the JSON object. No markdown, no code fences, just the JSON.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(reflectSchema, body);
    if (!validation.success) return validation.response;
    const { entry, stream: useStream } = validation.data;

    // --- RAG: Retrieve similar past entries ---
    let pastEntriesContext = "";
    let profileContext = "";

    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // setAll can fail in read-only contexts
              }
            },
          },
        }
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Rate limit (AI bucket — 10 req/min) when user is authenticated
      if (user) {
        const rateLimitResponse = checkRateLimit(user.id, "ai");
        if (rateLimitResponse) return rateLimitResponse;
      }

      if (user && process.env.VOYAGE_API_KEY) {
        const queryEmbedding = await generateQueryEmbedding(entry);

        const { data: similarEntries } = await supabase.rpc("match_entries", {
          query_embedding: JSON.stringify(queryEmbedding),
          match_client_id: user.id,
          match_threshold: 0.7,
          match_count: 5,
        });

        if (similarEntries && similarEntries.length > 0) {
          pastEntriesContext = `\n\n## Relevant Past Entries\nThe following are past journal entries from this client that are thematically related to what they wrote today. Use these to identify patterns, track progress, and make your reflection more personalised. Reference specific past entries when you see connections.\n\n${similarEntries
            .map(
              (e: {
                date: string;
                type: string;
                similarity: number;
                content: string;
                theme_tags: string[];
              }) =>
                `[${e.date}] (${e.type}, relevance: ${(e.similarity * 100).toFixed(0)}%)\n${e.content?.substring(0, 400)}${e.content && e.content.length > 400 ? "..." : ""}\nThemes: ${(e.theme_tags || []).join(", ")}`
            )
            .join("\n\n")}`;
        }
      }

      // Fetch client profile for personalization
      if (user) {
        const { data: activeEnrollment } = await supabase
          .from("program_enrollments")
          .select("id")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (activeEnrollment) {
          const profile = await getClientProfile(activeEnrollment.id, "edges");
          profileContext = formatProfileForPrompt(profile, "edges");
        }
      }
    } catch (ragError) {
      console.warn("RAG retrieval failed, continuing without context:", ragError);
    }

    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    // Retrieve coaching memories for continuity
    let memoryContext = "";
    try {
      const cookieStore2 = await cookies();
      const sb2 = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore2.getAll(); }, setAll() {} } }
      );
      const { data: { user: memUser } } = await sb2.auth.getUser();
      if (memUser) {
        const memories = await getRelevantMemories(memUser.id, 8);
        memoryContext = formatMemoriesForPrompt(memories);
      }
    } catch {
      // Memory retrieval is supplementary
    }

    const userContent = `${memoryContext}${profileContext}${pastEntriesContext}\n\n## Today's Entry\n${entry}`;

    // Streaming mode
    if (useStream) {
      const stream = anthropic.messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: buildCachedSystem(FULL_COACHING_VOICE, REFLECT_ROUTE_PROMPT),
        messages: [{ role: "user", content: userContent }],
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
              }
            }
            const finalMessage = await stream.finalMessage();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, usage: finalMessage.usage })}\n\n`));
            controller.close();
          } catch (err) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Stream error" })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming mode (default)
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: buildCachedSystem(FULL_COACHING_VOICE, REFLECT_ROUTE_PROMPT),
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from Claude" },
        { status: 500 }
      );
    }

    // Strip markdown code fences if Claude wraps the JSON in ```json ... ```
    let rawReflect = textBlock.text.trim();
    if (rawReflect.startsWith("```")) {
      rawReflect = rawReflect.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const parsed = JSON.parse(rawReflect);

    return NextResponse.json({
      reflection: parsed.reflection,
      theme_tags: parsed.theme_tags,
      model: message.model,
      usage: message.usage,
    });
  } catch (error: unknown) {
    console.error("Error in /api/reflect:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
