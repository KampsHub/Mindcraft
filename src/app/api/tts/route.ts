import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const ttsSchema = z.object({
  text: z.string().min(1).max(5000),
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

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "TTS service not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = ttsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const { text } = parsed.data;

    // Use the custom voice selected for Mindcraft coaching
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "l4Coq6695JDX9xtLqXDE";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.15,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", response.status, errorText);
      return NextResponse.json(
        { error: "TTS generation failed" },
        { status: 502 }
      );
    }

    // Stream the audio back
    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "TTS request failed" },
      { status: 500 }
    );
  }
}
