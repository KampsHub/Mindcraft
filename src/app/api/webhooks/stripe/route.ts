import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendServerEvent,
  syntheticClientId,
} from "@/lib/ga-measurement-protocol";

/**
 * Stripe webhook handler.
 *
 * Listens for:
 *   - checkout.session.completed              → `{program}_purchase` (server backup)
 *   - checkout.session.expired                → `{program}_checkout_abandoned`
 *   - checkout.session.async_payment_failed   → `{program}_checkout_failed`
 *
 * Stripe signature verification uses STRIPE_WEBHOOK_SECRET.
 * Configure the webhook endpoint in Stripe dashboard:
 *   https://YOUR_DOMAIN/api/webhooks/stripe
 *
 * Notes on ga_client_id:
 *   Checkout sessions carry a ga_client_id in metadata (set by the client when
 *   creating the session). We use that to fire MP events against the right
 *   GA4 user. If missing (e.g. session was created before this change), we
 *   fall back to a synthetic client id so the event still lands in GA4.
 */

// Stripe requires the raw body for signature verification — disable Next.js
// body parsing.
export const runtime = "nodejs";

function eventNameFor(program: string, kind: "purchase" | "abandoned" | "failed"): string {
  // Match existing client-side event naming:
  //   parachute → layoff_*, jetstream → pip_*, basecamp → new_role_*, enneagram → enneagram_*
  if (program === "parachute") {
    if (kind === "purchase") return "layoff_purchase_webhook"; // server backup — client already fires layoff_{tier}_purchase
    if (kind === "abandoned") return "layoff_checkout_abandoned";
    return "layoff_checkout_failed";
  }
  if (program === "jetstream") {
    if (kind === "purchase") return "pip_purchase_webhook";
    if (kind === "abandoned") return "pip_checkout_abandoned";
    return "pip_checkout_failed";
  }
  if (program === "basecamp") {
    if (kind === "purchase") return "new_role_purchase_webhook";
    if (kind === "abandoned") return "new_role_checkout_abandoned";
    return "new_role_checkout_failed";
  }
  if (program === "enneagram") {
    if (kind === "purchase") return "enneagram_purchase_webhook";
    if (kind === "abandoned") return "enneagram_checkout_abandoned";
    return "enneagram_checkout_failed";
  }
  if (kind === "purchase") return "purchase_webhook";
  if (kind === "abandoned") return "checkout_abandoned_generic";
  return "checkout_failed_generic";
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeKey);

  let event: Stripe.Event;
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "no signature" }, { status: 400 });
    }
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    // Fire stripe_webhook_error
    await sendServerEvent(
      syntheticClientId("stripe_webhook_error"),
      "stripe_webhook_error",
      { stage: "verification", error_message: message },
    );
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const metadata = session.metadata ?? {};
        const program = (metadata.program as string) ?? "unknown";
        const tier = (metadata.tier as string) ?? "unknown";
        const isGift = metadata.is_gift === "true";
        const gaClientId = (metadata.ga_client_id as string) || syntheticClientId(`session.${session.id}`);
        await sendServerEvent(gaClientId, eventNameFor(program, "purchase"), {
          program,
          tier,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? "usd",
          session_id: session.id,
          is_gift: isGift,
        });
        if (isGift) {
          await sendServerEvent(gaClientId, "gift_purchased", {
            program,
            tier,
            amount: (session.amount_total ?? 0) / 100,
            session_id: session.id,
          });
        }

        // second_program_started detection: if the purchaser's email already has a
        // completed enrollment in a DIFFERENT program, fire second_program_started.
        try {
          const email = session.customer_details?.email ?? session.customer_email;
          if (email && program !== "enneagram") {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (supabaseUrl && serviceKey) {
              const db = createClient(supabaseUrl, serviceKey);
              const { data: authList } = await db.auth.admin.listUsers();
              const matchedUser = authList?.users?.find(
                (u) => u.email?.toLowerCase() === email.toLowerCase(),
              );
              if (matchedUser) {
                const { data: priorEnrollments } = await db
                  .from("program_enrollments")
                  .select("started_at, completed_at, programs(slug)")
                  .eq("client_id", matchedUser.id)
                  .eq("status", "completed")
                  .order("completed_at", { ascending: false });
                const priorDifferent = (priorEnrollments ?? []).find((r) => {
                  const s = Array.isArray(r.programs)
                    ? r.programs[0]?.slug
                    : (r.programs as { slug?: string } | null)?.slug;
                  return s && s !== program;
                });
                if (priorDifferent) {
                  const priorSlug = Array.isArray(priorDifferent.programs)
                    ? priorDifferent.programs[0]?.slug
                    : (priorDifferent.programs as { slug?: string } | null)?.slug;
                  const daysBetween = priorDifferent.completed_at
                    ? Math.floor(
                        (Date.now() -
                          new Date(priorDifferent.completed_at as string).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : 0;
                  await sendServerEvent(gaClientId, "second_program_started", {
                    first_program: priorSlug ?? "unknown",
                    second_program: program,
                    days_between: daysBetween,
                  });
                }
              }
            }
          }
        } catch (err) {
          console.error("second_program_started detection failed:", err);
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object;
        const metadata = session.metadata ?? {};
        const program = (metadata.program as string) ?? "unknown";
        const tier = (metadata.tier as string) ?? "unknown";
        const gaClientId = (metadata.ga_client_id as string) || syntheticClientId(`session.${session.id}`);
        await sendServerEvent(gaClientId, eventNameFor(program, "abandoned"), {
          program,
          tier,
          amount: (session.amount_total ?? 0) / 100,
          session_id: session.id,
        });
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        const metadata = session.metadata ?? {};
        const program = (metadata.program as string) ?? "unknown";
        const tier = (metadata.tier as string) ?? "unknown";
        const gaClientId = (metadata.ga_client_id as string) || syntheticClientId(`session.${session.id}`);
        await sendServerEvent(gaClientId, eventNameFor(program, "failed"), {
          program,
          tier,
          session_id: session.id,
        });
        break;
      }
      default:
        // Ignore other event types
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "handler error";
    await sendServerEvent(
      syntheticClientId("stripe_webhook_error"),
      "stripe_webhook_error",
      { stage: "handler", event_type: event.type, error_message: message },
    );
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
