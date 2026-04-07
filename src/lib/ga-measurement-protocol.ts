/**
 * Server-side GA4 Measurement Protocol wrapper.
 *
 * Used for events that can't fire from the browser:
 *   - Stripe webhook events (purchase, abandoned, error)
 *   - Nightly dropout detection cron
 *   - API-level failures (ai_generation_failed, crisis_detected, rate_limit_hit)
 *
 * Requires env vars:
 *   GA4_MEASUREMENT_ID — e.g. G-6HTGC2PZMW (same as NEXT_PUBLIC_GA_MEASUREMENT_ID)
 *   GA4_API_SECRET     — from GA4 Admin → Data Streams → Measurement Protocol API secrets
 *
 * All functions silently no-op when env vars are missing so local dev still works.
 */

const MP_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const MP_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";

type Primitive = string | number | boolean;
type EventParams = Record<string, Primitive | null | undefined>;

function cleanParams(params?: EventParams): Record<string, Primitive> {
  const out: Record<string, Primitive> = {};
  if (!params) return out;
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined) out[k] = v;
  }
  return out;
}

/**
 * Send one or more events to GA4 via Measurement Protocol.
 *
 * @param clientId GA4 client_id (stable per browser). For events that don't
 *                 have a real browser client_id (e.g. server cron), pass a
 *                 synthetic stable ID like `server.<enrollment_id>`.
 * @param events   Array of { name, params } to batch.
 * @param opts     Optional: userId for cross-device join; debug=true to use
 *                 the debug endpoint (events appear in GA4 DebugView only).
 */
export async function sendServerEvents(
  clientId: string,
  events: Array<{ name: string; params?: EventParams }>,
  opts?: { userId?: string; debug?: boolean },
): Promise<{ ok: boolean; error?: string }> {
  const measurementId = process.env.GA4_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    // Silent no-op in local dev when secrets aren't set
    return { ok: false, error: "GA4 MP env vars not set" };
  }

  const url = `${opts?.debug ? MP_DEBUG_ENDPOINT : MP_ENDPOINT}?measurement_id=${encodeURIComponent(
    measurementId,
  )}&api_secret=${encodeURIComponent(apiSecret)}`;

  const body = {
    client_id: clientId,
    ...(opts?.userId ? { user_id: opts.userId } : {}),
    timestamp_micros: Date.now() * 1000,
    non_personalized_ads: false,
    events: events.map((e) => ({
      name: e.name,
      params: cleanParams(e.params),
    })),
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      return { ok: false, error: `GA4 MP returned ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Convenience wrapper for a single server event. */
export function sendServerEvent(
  clientId: string,
  name: string,
  params?: EventParams,
  opts?: { userId?: string; debug?: boolean },
) {
  return sendServerEvents(clientId, [{ name, params }], opts);
}

/** Generate a synthetic client_id for server-only actors (crons, webhooks without browser). */
export function syntheticClientId(scope: string): string {
  return `server.${scope}`;
}
