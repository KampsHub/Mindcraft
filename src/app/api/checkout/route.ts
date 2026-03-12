import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component context
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const stripe = new Stripe(stripeKey);

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const priceId = process.env.STRIPE_PRICE_ID;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscribe?checkout=cancelled`,
      metadata: {
        supabase_user_id: user.id,
      },
    };

    if (priceId) {
      sessionParams.line_items = [{ price: priceId, quantity: 1 }];
    } else {
      // Fallback: create an inline price ($75/month)
      sessionParams.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Coaching Hub — Monthly Subscription",
              description: "Daily coaching companion with personalised exercises, journal reflections, and AI-powered insights.",
            },
            unit_amount: 7500, // $75.00
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Error in /api/checkout:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
