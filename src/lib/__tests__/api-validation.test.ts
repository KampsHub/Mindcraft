import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateBody, processJournalSchema, dailyThemesSchema, getModelForTier, getAnthropicClient } from "@/lib/api-validation";

describe("validateBody", () => {
  it("returns success with valid data", () => {
    const result = validateBody(dailyThemesSchema, {
      enrollmentId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      dayNumber: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enrollmentId).toBe("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
      expect(result.data.dayNumber).toBe(5);
    }
  });

  it("returns 400 response on invalid UUID", () => {
    const result = validateBody(dailyThemesSchema, {
      enrollmentId: "not-a-uuid",
      dayNumber: 5,
    });
    expect(result.success).toBe(false);
  });

  it("returns 400 response on missing required fields", () => {
    const result = validateBody(processJournalSchema, {
      enrollmentId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      dayNumber: 1,
      // missing journalContent
    });
    expect(result.success).toBe(false);
  });

  it("returns 400 on dayNumber out of range", () => {
    const result = validateBody(dailyThemesSchema, {
      enrollmentId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      dayNumber: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts dayNumber at boundary (90)", () => {
    const result = validateBody(dailyThemesSchema, {
      enrollmentId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      dayNumber: 90,
    });
    expect(result.success).toBe(true);
  });
});

describe("getModelForTier", () => {
  it("returns Sonnet for standard tier", () => {
    expect(getModelForTier("standard")).toContain("sonnet");
  });

  it("returns Haiku for fast tier", () => {
    expect(getModelForTier("fast")).toContain("haiku");
  });

  it("returns Opus for deep tier", () => {
    expect(getModelForTier("deep")).toContain("opus");
  });

  it("defaults to standard when no tier specified", () => {
    expect(getModelForTier()).toContain("sonnet");
  });
});

describe("getAnthropicClient", () => {
  const originalEnv = process.env.CLAUDE_API_KEY;

  afterEach(() => {
    if (originalEnv) {
      process.env.CLAUDE_API_KEY = originalEnv;
    } else {
      delete process.env.CLAUDE_API_KEY;
    }
  });

  it("returns failure when CLAUDE_API_KEY is missing", () => {
    delete process.env.CLAUDE_API_KEY;
    const result = getAnthropicClient();
    expect(result.success).toBe(false);
  });

  it("returns success when CLAUDE_API_KEY is set", () => {
    process.env.CLAUDE_API_KEY = "test-key-123";
    const result = getAnthropicClient();
    expect(result.success).toBe(true);
  });
});
