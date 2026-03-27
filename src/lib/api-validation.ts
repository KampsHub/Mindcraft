import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { NextResponse } from "next/server";

// ── Common field schemas ──
// Reusable Zod schemas for fields that appear across multiple routes.

export const enrollmentIdSchema = z.string().uuid("enrollmentId must be a valid UUID");
export const dayNumberSchema = z.number().int().min(1).max(90);
export const sessionIdSchema = z.string().uuid("sessionId must be a valid UUID");
export const journalContentSchema = z.string().min(1, "journalContent cannot be empty").max(50000, "journalContent exceeds 50,000 character limit");
export const weekNumberSchema = z.number().int().min(1).max(13);

// ── Route-specific schemas ──

export const processJournalSchema = z.object({
  enrollmentId: enrollmentIdSchema,
  dayNumber: dayNumberSchema,
  journalContent: journalContentSchema,
});

export const dailySummarySchema = z.object({
  enrollmentId: enrollmentIdSchema,
  dayNumber: dayNumberSchema,
  sessionId: sessionIdSchema,
});

export const dailyThemesSchema = z.object({
  enrollmentId: enrollmentIdSchema,
  dayNumber: dayNumberSchema,
});

export const generateProfileSchema = z.object({
  enrollmentId: enrollmentIdSchema,
});

export const generateGoalsSchema = z.object({
  enrollmentId: enrollmentIdSchema,
});

export const weeklyInsightsSchema = z.object({
  enrollmentId: enrollmentIdSchema,
  weekNumber: weekNumberSchema,
});

export const frameworkAnalysisSchema = z.object({
  enrollmentId: enrollmentIdSchema,
  dayNumber: dayNumberSchema,
});

export const reflectSchema = z.object({
  entry: z.string().min(1, "entry cannot be empty").max(50000, "entry exceeds 50,000 character limit"),
  stream: z.boolean().optional(),
});

export const qualityFlagSchema = z.object({
  outputType: z.enum([
    "reflection", "exercise", "summary", "themes", "plan",
    "weekly_insight", "framework_analysis", "reframe", "coaching_question",
  ]),
  frameworkName: z.string().max(200).optional(),
  dailySessionId: sessionIdSchema.optional(),
  flagReason: z.enum(["off_tone", "inaccurate", "unhelpful", "confusing", "inappropriate", "other"]),
  userComment: z.string().max(500).optional(),
});

export const enneagramAnalyzeSchema = z.object({
  clientId: z.string().uuid().optional(),
  fileUrls: z.array(z.string().url()).min(1).max(2),
});

// ── Validation wrapper ──
// Parses an unknown body against a Zod schema.
// Returns typed data on success, or a 400 NextResponse on failure.

export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Invalid request",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
    };
  }
  return { success: true, data: result.data };
}

// ── Model tier routing ──
// "fast" = Haiku (cheap, simple tasks), "standard" = Sonnet (default), "deep" = Opus (complex reasoning)
export type ModelTier = "fast" | "standard" | "deep";

const MODEL_MAP: Record<ModelTier, string> = {
  fast: "claude-haiku-4-5-20251001",
  standard: "claude-sonnet-4-20250514",
  deep: "claude-opus-4-6",
};

export function getModelForTier(tier: ModelTier = "standard"): string {
  return MODEL_MAP[tier];
}

// ── Anthropic client factory ──
// Returns an Anthropic client or a 500 response if the API key is missing.

export function getAnthropicClient():
  | { success: true; client: Anthropic }
  | { success: false; response: NextResponse } {
  if (!process.env.CLAUDE_API_KEY) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 500 }
      ),
    };
  }
  return {
    success: true,
    client: new Anthropic({ apiKey: process.env.CLAUDE_API_KEY }),
  };
}

// ── Prompt caching helper ──
// Wraps system prompt with cache_control to avoid re-processing
// the voice config on every call. Cuts input token costs by ~90%
// for the cached portion after the first call in a session.
//
// Usage:
//   system: buildCachedSystem(STANDARD_VOICE, routeSpecificPrompt)
//
// Hard constraints appended AFTER every route-specific prompt.
// Claude pays most attention to the beginning and end of system prompts.
// This ensures the voice rules are the last thing it reads before generating.
const VOICE_GUARDRAILS = `
## CRITICAL — READ BEFORE RESPONDING

These rules override everything above if there is a conflict:

1. You are NOT an expert on this person. You have their words on a page. That's it.
2. NEVER declare a pattern as fact. Say "I notice" or "I'm wondering" — never "The pattern is clear" or "You're doing X because Y."
3. NEVER extrapolate from journal entries to their whole life, relationships, career, or character.
4. If someone wrote very little, respond with very little. Match their energy. One word in = one question back.
5. NEVER assign meaning to brevity. You don't know why they wrote one word.
6. Every observation is a guess. Frame it as one. "This might be off, but..." or "Does this land?"
7. Keep it SHORT. Reading: 2-3 sentences max. Not paragraphs.
8. No reframes unless the person asks for one or you're explicitly instructed to include one.
`;

export function buildCachedSystem(
  voiceConfig: string,
  routePrompt: string
): Array<{ type: "text"; text: string; cache_control?: { type: "ephemeral" } }> {
  return [
    {
      type: "text" as const,
      text: voiceConfig,
      cache_control: { type: "ephemeral" as const },
    },
    {
      type: "text" as const,
      text: routePrompt,
    },
    {
      type: "text" as const,
      text: VOICE_GUARDRAILS,
    },
  ];
}
