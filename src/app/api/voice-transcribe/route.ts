import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAnthropicClient } from "@/lib/api-validation";

// Phase 1: Use Claude's audio understanding for transcription
// Phase 2: Switch to Deepgram/Whisper via LiveKit Agents for real-time

export async function POST(request: Request) {
  try {
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
            } catch { /* Server Component context */ }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Convert audio to base64 for Claude
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    // Use Claude to transcribe (supports audio input)
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Transcribe this audio recording verbatim. This is a journal/coaching session. Output ONLY the transcription text, nothing else. Preserve the speaker's natural language, pauses (as '...'), and emotional emphasis. Do not add any commentary, labels, or formatting.",
          },
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "audio/webm",
              data: base64Audio,
            },
          } as never, // TypeScript doesn't have audio type yet
        ],
      }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const transcript = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

    return NextResponse.json({
      transcript,
      duration: audioFile.size, // approximate
      usage: message.usage,
    });
  } catch (error) {
    console.error("Voice transcription error:", error);
    const msg = error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
