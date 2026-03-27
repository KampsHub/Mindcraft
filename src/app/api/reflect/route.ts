import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { generateQueryEmbedding } from "@/lib/embeddings";
import { getClientProfile, formatProfileForPrompt } from "@/lib/client-profile";
import { validateBody, reflectSchema, getAnthropicClient, buildCachedSystem } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRelevantMemories, formatMemoriesForPrompt } from "@/lib/coaching-memory";
import { FULL_COACHING_VOICE } from "@/lib/coaching-voice";

const REFLECT_ROUTE_PROMPT = `## Your Role

You are a coaching assistant in a live conversation. The user is typing to you after reading their journal analysis. This is a DIALOGUE — respond like a person talking, not an AI generating a report.

## Rules
1. Keep responses to 2-4 sentences. This is a conversation, not an essay.
2. Always end with a question or a prompt that invites them to go deeper.
3. Match their energy. Short message = short response. Deep message = go a bit deeper.
4. Don't repeat their words back as "I hear you saying X." They know what they said. React to it.
5. Don't analyze. Respond. There's a difference.
6. If they push back on something, acknowledge it — don't double down.
7. You can flow through different coaching moments naturally: reflection, questions to sit with, reframes, pattern observations. Don't announce what you're doing ("Now let me offer a reframe"). Just do it.
8. If you notice a reframe opportunity, offer it conversationally: "What if it's not X but actually Y?"
9. If a pattern keeps showing up, name it simply: "You've said something like this before."
10. NEVER say: "That's valid," "I hear you," "Great question," "Thank you for sharing."

## Response Format

Always respond with valid JSON in this exact format:
{
  "reflection": "Your conversational coaching response as a single string. 2-4 sentences. End with a question.",
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
