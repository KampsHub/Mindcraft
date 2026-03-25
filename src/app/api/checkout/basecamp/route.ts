import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const PRODUCTS: Record<string, { productId: string; min: number; max: number }> = {
  standard:  { productId: "prod_UD4mxe6Dg0FoNE",  min: 4900,  max: 4900  },
  enneagram: { productId: "prod_UD4mRKHdGdLIy4",  min: 34900, max: 34900 },
};

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey);
    const { tier, amount } = await req.json();

    const product = PRODUCTS[tier];
    if (!product) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const cents = tier === "standard" ? 4900 : 34900;

    if (cents < product.min || cents > product.max) {
      return NextResponse.json(
        { error: `Amount must be between $${product.min / 100} and $${product.max / 100}` },
        { status: 400 },
      );
    }

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const baseUrl = origin.replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: product.productId,
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      metadata: { tier, amount_cents: String(cents), program: "basecamp" },
      success_url: `${baseUrl}/basecamp/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/basecamp?checkout=cancelled#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Error in /api/checkout/basecamp:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
