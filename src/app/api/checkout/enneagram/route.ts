import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { sendServerEvent, syntheticClientId } from "@/lib/ga-measurement-protocol";

const AMOUNT_CENTS = 30000; // $300

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey);
    const body = await req.json().catch(() => ({}));
    const gaClientId: string | undefined = body?.ga_client_id;
    const selectedSlotId: string | undefined = body?.selected_slot_id;
    const selectedSlotLabel: string | undefined = body?.selected_slot_label;
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const baseUrl = origin.replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "IEQ9 Enneagram Assessment + 1-hour debrief",
              description: "Scientifically validated Enneagram assessment plus a 1-hour live debrief with a certified professional coach.",
            },
            unit_amount: AMOUNT_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        tier: "enneagram_standalone",
        amount_cents: String(AMOUNT_CENTS),
        program: "enneagram",
        ...(gaClientId ? { ga_client_id: String(gaClientId) } : {}),
        ...(selectedSlotId ? { selected_slot_id: String(selectedSlotId) } : {}),
        ...(selectedSlotLabel ? { selected_slot_label: String(selectedSlotLabel) } : {}),
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
      success_url: `${baseUrl}/enneagram/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Error in /api/checkout/enneagram:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    try {
      await sendServerEvent(
        syntheticClientId("enneagram_checkout_error"),
        "enneagram_checkout_error",
        { error_message: message },
      );
    } catch { /* no-op */ }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
