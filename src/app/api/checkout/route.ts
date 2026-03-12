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

    const stripe = new Stripe(stripeKey);

    // Try to get user if authenticated — but don't require it
    let userId: string | undefined;
    let userEmail: string | undefined;

    try {
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

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email;
      }
    } catch {
      // Auth check failed — continue without auth
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // If authenticated, look up or create Stripe customer by email
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: userId ? { supabase_user_id: userId } : {},
        });
        customerId = customer.id;
      }
    }

    // Build checkout session
    const priceId = process.env.STRIPE_PRICE_ID;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      // Authenticated users go to dashboard, new users go to signup
      success_url: userId
        ? `${baseUrl}/dashboard?checkout=success`
        : `${baseUrl}/signup?checkout=success`,
      cancel_url: `${baseUrl}/subscribe?checkout=cancelled`,
      metadata: {
        ...(userId ? { supabase_user_id: userId } : {}),
      },
    };

    // Attach customer if we have one, otherwise let Stripe collect email
    if (customerId) {
      sessionParams.customer = customerId;
    }

    if (priceId) {
      sessionParams.line_items = [{ price: priceId, quantity: 1 }];
    } else {
      // Fallback: create an inline price ($75/month)
      sessionParams.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Mindcraft — Monthly",
              description: "Your daily coaching companion. Personalised exercises, AI-powered reflections, and pattern recognition.",
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
