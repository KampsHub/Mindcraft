import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  getAnthropicClient,
  buildCachedSystem,
  getModelForTier,
  validateBody,
} from "@/lib/api-validation";
import { STANDARD_VOICE } from "@/lib/coaching-voice";

const emotionalMirrorSchema = z.object({
  emotions: z.array(z.string()).min(1, "At least one emotion is required"),
  needs: z.array(z.string()).min(1, "At least one need is required"),
  bodyMarkers: z.array(
    z.object({
      zone: z.string(),
      sensation: z.string(),
      intensity: z.number().min(0).max(10),
    })
  ),
  nervousSystem: z.number().min(0).max(10),
  journalExcerpt: z.string().max(5000).optional(),
});

const MIRROR_PROMPT = `You are a compassionate coaching companion. Given a person's emotional check-in data, write ONE sentence (max 40 words) that mirrors back what you see — connecting their feelings to their unmet needs to where it lives in their body. Use 'you' language. Be warm but not sweet. Name what's real without dramatizing it. Never use clinical language.

Return ONLY the sentence. No quotes, no labels, no preamble.`;

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to continue." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = validateBody(emotionalMirrorSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const { emotions, needs, bodyMarkers, nervousSystem, journalExcerpt } =
      validation.data;

    const clientResult = getAnthropicClient();
    if (!clientResult.success) {
      return clientResult.response;
    }

    const bodyDescription = bodyMarkers
      .map((m) => `${m.sensation} in ${m.zone} (intensity ${m.intensity}/10)`)
      .join("; ");

    const userMessage = [
      `Emotions: ${emotions.join(", ")}`,
      `Unmet needs: ${needs.join(", ")}`,
      `Body sensations: ${bodyDescription || "none reported"}`,
      `Nervous system activation: ${nervousSystem}/10`,
      journalExcerpt ? `Journal excerpt: "${journalExcerpt}"` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const response = await clientResult.client.messages.create({
      model: getModelForTier("fast"),
      max_tokens: 150,
      system: buildCachedSystem(STANDARD_VOICE, MIRROR_PROMPT),
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const mirror = textBlock?.text?.trim() ?? "";

    return NextResponse.json({ mirror });
  } catch (error) {
    console.error("Emotional mirror API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
