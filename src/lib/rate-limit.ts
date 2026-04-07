import { NextResponse } from "next/server";
import { sendServerEvent, syntheticClientId } from "./ga-measurement-protocol";

// ── Token-bucket rate limiter (in-memory, no Redis) ──

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

// Configuration per bucket type
const BUCKET_CONFIG = {
  ai: { maxTokens: 10, refillRatePerMs: 10 / 60_000 },       // 10 req/min
  standard: { maxTokens: 30, refillRatePerMs: 30 / 60_000 },  // 30 req/min
} as const;

type BucketType = keyof typeof BUCKET_CONFIG;

/**
 * Check rate limit for a given user + bucket combination.
 * Returns `null` if the request is allowed, or a 429 NextResponse if rate-limited.
 */
export function checkRateLimit(
  userId: string,
  bucket: BucketType
): NextResponse | null {
  const config = BUCKET_CONFIG[bucket];
  const key = `${bucket}:${userId}`;
  const now = Date.now();

  let entry = buckets.get(key);

  if (!entry) {
    // First request — initialize with max tokens minus this request
    buckets.set(key, { tokens: config.maxTokens - 1, lastRefill: now });
    return null;
  }

  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill;
  const refill = elapsed * config.refillRatePerMs;
  entry.tokens = Math.min(config.maxTokens, entry.tokens + refill);
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    // Calculate how long until 1 token is available
    const retryAfterMs = (1 - entry.tokens) / config.refillRatePerMs;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    // Fire-and-forget analytics — do not await or block the rate-limit response
    sendServerEvent(
      syntheticClientId(`user.${userId}`),
      "rate_limit_hit",
      { bucket, retry_after_sec: retryAfterSec },
    ).catch(() => { /* no-op */ });

    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      }
    );
  }

  // Consume one token
  entry.tokens -= 1;
  return null;
}

// ── Periodic cleanup of stale entries (every 5 minutes) ──
const CLEANUP_INTERVAL_MS = 5 * 60_000;
const STALE_THRESHOLD_MS = 2 * 60_000; // entries unused for 2+ min are stale

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.lastRefill > STALE_THRESHOLD_MS) {
      buckets.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);
