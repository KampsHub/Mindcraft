import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const PRODUCT_ID = "prod_UD4pfH1qmOP8jX";
const AMOUNT_CENTS = 30000; // $300

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: PRODUCT_ID,
            unit_amount: AMOUNT_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: { tier: "enneagram_standalone", amount_cents: String(AMOUNT_CENTS), program: "enneagram" },
      success_url: `${baseUrl}/enneagram/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Error in /api/checkout/enneagram:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
