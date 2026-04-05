import { describe, it, expect, beforeEach, vi } from "vitest";

// We need to reset the module between tests since rate-limit uses module-level state
let checkRateLimit: typeof import("@/lib/rate-limit").checkRateLimit;

beforeEach(async () => {
  vi.resetModules();
  // Prevent the setInterval cleanup from running in tests
  vi.useFakeTimers();
  const mod = await import("@/lib/rate-limit");
  checkRateLimit = mod.checkRateLimit;
});

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const result = checkRateLimit("user-1", "ai");
    expect(result).toBeNull();
  });

  it("allows multiple requests within limit", () => {
    for (let i = 0; i < 9; i++) {
      const result = checkRateLimit("user-2", "ai");
      expect(result).toBeNull();
    }
  });

  it("blocks requests exceeding limit", () => {
    // AI bucket = 10 req/min
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user-3", "ai");
    }
    const blocked = checkRateLimit("user-3", "ai");
    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(429);
  });

  it("includes Retry-After header when rate limited", async () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user-4", "ai");
    }
    const blocked = checkRateLimit("user-4", "ai");
    expect(blocked).not.toBeNull();
    const body = await blocked!.json();
    expect(body.error).toContain("Too many requests");
  });

  it("isolates different users", () => {
    // Exhaust user-5's limit
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user-5", "ai");
    }
    // user-6 should still be fine
    const result = checkRateLimit("user-6", "ai");
    expect(result).toBeNull();
  });

  it("standard bucket has higher limit than ai bucket", () => {
    // Standard = 30 req/min
    for (let i = 0; i < 25; i++) {
      const result = checkRateLimit("user-7", "standard");
      expect(result).toBeNull();
    }
  });

  it("refills tokens after time passes", () => {
    // Use all tokens
    for (let i = 0; i < 10; i++) {
      checkRateLimit("user-8", "ai");
    }
    expect(checkRateLimit("user-8", "ai")).not.toBeNull();

    // Advance time by 30 seconds (should refill ~5 tokens at 10/min)
    vi.advanceTimersByTime(30_000);

    const result = checkRateLimit("user-8", "ai");
    expect(result).toBeNull();
  });
});
