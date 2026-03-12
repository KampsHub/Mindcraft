import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Use raw body for webhook signature verification
export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Create admin Supabase client for updating user records
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;

      if (userId) {
        await supabase
          .from("clients")
          .update({
            subscription_status: "active",
            stripe_customer_id: session.customer as string,
          })
          .eq("id", userId);

        console.log(`Subscription activated for user ${userId}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find the client by Stripe customer ID
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (client) {
        await supabase
          .from("clients")
          .update({ subscription_status: "cancelled" })
          .eq("id", client.id);

        console.log(`Subscription cancelled for user ${client.id}`);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (client) {
        await supabase
          .from("clients")
          .update({ subscription_status: "past_due" })
          .eq("id", client.id);

        console.log(`Payment failed for user ${client.id}`);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
