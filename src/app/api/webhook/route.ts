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
      const customerEmail = session.customer_details?.email;
      const stripeCustomerId = session.customer as string;

      // Check if a promo code was used (coach referral, user referral, or gift)
      let referringCoachId: string | undefined;
      const discount = session.discounts?.[0];
      if (discount?.promotion_code) {
        try {
          const promoCodeId =
            typeof discount.promotion_code === "string"
              ? discount.promotion_code
              : discount.promotion_code.id;
          const promoCode = await stripe.promotionCodes.retrieve(promoCodeId);

          if (promoCode.metadata?.type === "coach_referral" && promoCode.metadata?.coach_id) {
            referringCoachId = promoCode.metadata.coach_id;
            console.log(`Coach referral detected — coach: ${referringCoachId}, code: ${promoCode.code}`);
          }

          // Track user referral redemption
          if (promoCode.metadata?.type === "user_referral" && promoCode.metadata?.referrer_id) {
            const { data: referral } = await supabase
              .from("referrals")
              .select("id")
              .eq("referral_code", promoCode.code)
              .single();
            if (referral) {
              await supabase.from("referral_redemptions").insert({
                referral_id: referral.id,
                referred_email: customerEmail,
                referred_user_id: userId || null,
                stripe_session_id: session.id,
                status: "redeemed",
                redeemed_at: new Date().toISOString(),
                eligible_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              });
              console.log(`User referral redeemed — referrer: ${promoCode.metadata.referrer_id}, code: ${promoCode.code}`);
            }
          }

          // Track gift code redemption
          if (promoCode.metadata?.type === "gift_code") {
            await supabase
              .from("gift_codes")
              .update({
                status: "redeemed",
                recipient_email: customerEmail,
                recipient_user_id: userId || null,
                redeemed_at: new Date().toISOString(),
              })
              .eq("gift_code", promoCode.code);
            console.log(`Gift code redeemed — code: ${promoCode.code}`);
          }

          // Track personal reward redemption (program completion 20% off)
          if (promoCode.metadata?.type === "personal_reward") {
            await supabase
              .from("personal_promo_codes")
              .update({ redeemed_at: new Date().toISOString() })
              .eq("code", promoCode.code);
            console.log(`Personal reward redeemed — code: ${promoCode.code}`);
          }
        } catch (err) {
          console.error("Failed to retrieve promotion code:", err);
        }
      }

      // Handle gift purchases — generate 100% off code for gifter to send
      if (session.metadata?.is_gift === "true") {
        try {
          const giftChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
          let giftCode = "GIFT-";
          for (let i = 0; i < 6; i++) giftCode += giftChars[Math.floor(Math.random() * giftChars.length)];

          const giftCoupon = await stripe.coupons.create({
            percent_off: 100,
            duration: "once",
            name: `Gift: ${giftCode}`,
            max_redemptions: 1,
          });
          const giftPromo = await stripe.promotionCodes.create({
            promotion: { type: "coupon", coupon: giftCoupon.id },
            code: giftCode,
            max_redemptions: 1,
            metadata: { type: "gift_code", gifter_email: customerEmail || "" },
          });

          await supabase.from("gift_codes").insert({
            gifter_id: userId || null,
            gifter_email: customerEmail || "",
            gift_code: giftCode,
            stripe_promo_id: giftPromo.id,
            stripe_session_id: session.id,
            program: session.metadata?.program || "unknown",
            status: "purchased",
          });

          // Email the gift code to the gifter
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey && customerEmail) {
            const { Resend } = await import("resend");
            const resend = new Resend(resendKey);
            await resend.emails.send({
              from: "Mindcraft <crew@allmindsondeck.com>",
              to: customerEmail,
              subject: "Your Mindcraft gift code is ready",
              html: `
                <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, sans-serif;">
                  <div style="max-width: 560px; margin: 0 auto; background-color: #2a2a30; border-radius: 12px; padding: 40px 32px;">
                    <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                      Your gift is ready.
                    </p>
                    <p style="color: #a0a0a8; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                      Send this code to the person you&rsquo;d like to gift a Mindcraft program to. They&rsquo;ll use it at checkout to enroll for free.
                    </p>
                    <div style="text-align: center; margin: 28px 0; padding: 20px; background-color: rgba(255,255,255,0.06); border-radius: 10px;">
                      <p style="font-size: 28px; font-weight: 700; color: #e09585; margin: 0; letter-spacing: 0.08em;">
                        ${giftCode}
                      </p>
                    </div>
                    <p style="color: #a0a0a8; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                      This code is single-use and works at <a href="https://mindcraft.ing" style="color: #e09585; text-decoration: none;">mindcraft.ing</a> checkout.
                    </p>
                  </div>
                </div>
              `,
            }).catch(() => {});
          }
          console.log(`Gift code generated: ${giftCode} for ${customerEmail}`);
        } catch (giftErr) {
          console.error("Failed to generate gift code:", giftErr);
        }
      }

      // Build the update payload
      const updatePayload: Record<string, string> = {
        subscription_status: "active",
        stripe_customer_id: stripeCustomerId,
      };
      if (referringCoachId) {
        updatePayload.coach_id = referringCoachId;
      }

      if (userId) {
        // User was authenticated at checkout — update by user ID
        await supabase
          .from("clients")
          .update(updatePayload)
          .eq("id", userId);

        console.log(`Subscription activated for user ${userId}`);
      } else if (customerEmail) {
        // User paid before signing up — try to find by email
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("email", customerEmail)
          .single();

        if (client) {
          await supabase
            .from("clients")
            .update(updatePayload)
            .eq("id", client.id);

          console.log(`Subscription activated for client ${client.id} (by email)`);
        } else {
          // No client row yet — will be linked when user signs up via /api/link-subscription
          console.log(`Subscription paid by ${customerEmail} — no client row yet, will link at signup`);
          // Store referral info in Stripe customer metadata for later linking
          if (referringCoachId) {
            await stripe.customers.update(stripeCustomerId, {
              metadata: { referring_coach_id: referringCoachId },
            });
          }
        }
      }

      // Send notification email if this is an Enneagram purchase
      const tier = session.metadata?.tier;
      const program = session.metadata?.program;
      if (tier === "enneagram" || tier === "enneagram_standalone") {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          try {
            const { Resend } = await import("resend");
            const resend = new Resend(resendKey);
            const amountCents = session.metadata?.amount_cents || "0";
            await resend.emails.send({
              from: "Mindcraft <crew@allmindsondeck.com>",
              to: "crew@allmindsondeck.com",
              subject: `🎯 New Enneagram Purchase — ${customerEmail || "Unknown"}`,
              html: `
                <div style="font-family: -apple-system, sans-serif; max-width: 520px; padding: 24px;">
                  <h2 style="margin: 0 0 16px;">New Enneagram Purchase</h2>
                  <table style="border-collapse: collapse; width: 100%;">
                    <tr><td style="padding: 8px 0; color: #666;">Customer</td><td style="padding: 8px 0; font-weight: 600;">${customerEmail || "Not provided"}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Tier</td><td style="padding: 8px 0; font-weight: 600;">${tier}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Program</td><td style="padding: 8px 0; font-weight: 600;">${program || "standalone"}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Amount</td><td style="padding: 8px 0; font-weight: 600;">$${(Number(amountCents) / 100).toFixed(2)}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Stripe Customer</td><td style="padding: 8px 0;">${stripeCustomerId}</td></tr>
                  </table>
                  <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
                  <p style="color: #666; font-size: 14px;">
                    <strong>Action needed:</strong> Order IEQ9 assessment for this customer and coordinate debrief scheduling.
                  </p>
                </div>
              `,
            });
            console.log(`Enneagram purchase notification sent for ${customerEmail}`);
          } catch (emailErr) {
            console.error("Failed to send Enneagram notification:", emailErr);
          }
        }
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

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email;
      const program = session.metadata?.program || "unknown";
      const tier = session.metadata?.tier || "unknown";
      const amountCents = session.metadata?.amount_cents || "0";

      console.log(
        `Checkout session expired — program: ${program}, tier: ${tier}, ` +
        `amount: $${Number(amountCents) / 100}, email: ${customerEmail || "not provided"}`
      );

      // Log to api_logs for tracking abandoned checkouts
      await supabase.from("api_logs").insert({
        endpoint: "checkout.session.expired",
        model: program,
        input_prompt: `tier=${tier}, amount_cents=${amountCents}`,
        output: customerEmail || "no email",
      });

      break;
    }
  }

  return NextResponse.json({ received: true });
}
