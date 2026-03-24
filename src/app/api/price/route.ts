import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripeKey || !priceId) {
    return NextResponse.json({ formatted: "$49", amount: 4900 });
  }

  try {
    const stripe = new Stripe(stripeKey);
    const price = await stripe.prices.retrieve(priceId);

    const amount = price.unit_amount ?? 4900;
    const formatted =
      amount % 100 === 0
        ? `$${amount / 100}`
        : `$${(amount / 100).toFixed(2)}`;

    return NextResponse.json(
      { formatted, amount },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json({ formatted: "$49", amount: 4900 });
  }
}
