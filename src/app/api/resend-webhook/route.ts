import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * Resend Webhook Handler — tracks email engagement events.
 *
 * Configure in Resend dashboard:
 *   Webhook URL: https://yourdomain.com/api/resend-webhook
 *   Events: email.sent, email.delivered, email.opened, email.clicked,
 *           email.bounced, email.complained, email.delivery_delayed
 *   Signing secret: RESEND_WEBHOOK_SECRET env var
 *
 * All events are stored in the email_events table for analytics.
 */

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    to: string[];
    subject?: string;
    click?: { url: string };
    bounce?: { type: string };
  };
}

const VALID_EVENTS = new Set([
  "email.sent",
  "email.delivered",
  "email.opened",
  "email.clicked",
  "email.bounced",
  "email.complained",
  "email.delivery_delayed",
]);

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (webhookSecret) {
      const svixId = request.headers.get("svix-id");
      const svixTimestamp = request.headers.get("svix-timestamp");
      const svixSignature = request.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: "Missing signature headers" }, { status: 401 });
      }

      // Note: For production, use the `svix` package for proper HMAC verification.
      // For now we verify headers exist. Install svix if you want cryptographic verification:
      //   npm install svix
      //   import { Webhook } from "svix";
      //   const wh = new Webhook(webhookSecret);
      //   wh.verify(body, { "svix-id": svixId, "svix-timestamp": svixTimestamp, "svix-signature": svixSignature });
    }

    const body = await request.text();
    const payload: ResendWebhookPayload = JSON.parse(body);

    if (!VALID_EVENTS.has(payload.type)) {
      return NextResponse.json({ ignored: true, reason: "unknown event type" });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("email_events").insert({
      resend_email_id: payload.data.email_id,
      event_type: payload.type,
      recipient_email: payload.data.to?.[0] || null,
      email_subject: payload.data.subject || null,
      click_url: payload.data.click?.url || null,
      bounce_type: payload.data.bounce?.type || null,
      timestamp: payload.created_at,
    });

    if (error) {
      console.error("Failed to store email event:", error);
      // Still return 200 so Resend doesn't retry
    }

    return NextResponse.json({ received: true, type: payload.type });
  } catch (error: unknown) {
    console.error("Resend webhook error:", error);
    // Return 200 to prevent Resend from retrying on parse errors
    return NextResponse.json({ error: "Failed to process" }, { status: 200 });
  }
}
