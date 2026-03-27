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
