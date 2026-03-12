import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /api/link-subscription
 *
 * Called on first login / dashboard load.
 * Checks if the authenticated user's email has an active Stripe subscription
 * and links it to their client record if so.
 */
export async function POST() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ linked: false });
    }

    // Get authenticated user
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
    if (!user?.email) {
      return NextResponse.json({ linked: false });
    }

    // Check if client already has an active subscription
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: client } = await adminSupabase
      .from("clients")
      .select("id, subscription_status, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (client?.subscription_status === "active") {
      return NextResponse.json({ linked: true, already: true });
    }

    // Check Stripe for a customer with this email
    const stripe = new Stripe(stripeKey);
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return NextResponse.json({ linked: false });
    }

    const stripeCustomer = customers.data[0];

    // Check if they have an active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomer.id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ linked: false });
    }

    // Active subscription found — update client record
    if (client) {
      await adminSupabase
        .from("clients")
        .update({
          subscription_status: "active",
          stripe_customer_id: stripeCustomer.id,
        })
        .eq("id", user.id);
    } else {
      // No client row yet — create one
      await adminSupabase
        .from("clients")
        .insert({
          id: user.id,
          email: user.email,
          name: user.email.split("@")[0],
          subscription_status: "active",
          stripe_customer_id: stripeCustomer.id,
        });
    }

    // Update Stripe customer metadata with the Supabase user ID
    await stripe.customers.update(stripeCustomer.id, {
      metadata: { supabase_user_id: user.id },
    });

    console.log(`Linked Stripe subscription for ${user.email} → ${user.id}`);

    return NextResponse.json({ linked: true });
  } catch (error) {
    console.error("Error in /api/link-subscription:", error);
    return NextResponse.json({ linked: false });
  }
}
