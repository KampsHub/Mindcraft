import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { sendServerEvent, syntheticClientId } from "@/lib/ga-measurement-protocol";

export async function GET(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ paid: false, error: "Stripe not configured" }, { status: 500 });
    }

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ paid: false, error: "Missing session_id" }, { status: 400 });
    }

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === "paid";
    const tier = (session.metadata?.tier as string) || "standard";
    const program = (session.metadata?.program as string) || "parachute";
    const amountPaid = session.amount_total || 0;
    const customerEmail = session.customer_details?.email || session.customer_email || null;
    const gaClientId = (session.metadata?.ga_client_id as string) || syntheticClientId(`verify.${sessionId}`);

    if (!paid) {
      // Fire silent failure signal: welcome page received a session_id but Stripe says unpaid.
      await sendServerEvent(gaClientId, "payment_verification_failed", {
        program,
        tier,
        payment_status: session.payment_status ?? "unknown",
        session_id: sessionId,
      });
    }

    return NextResponse.json({ paid, tier, program, amountPaid, customerEmail });
  } catch (error: unknown) {
    console.error("Error verifying checkout session:", error);
    const message = error instanceof Error ? error.message : "Invalid session";
    await sendServerEvent(
      syntheticClientId(`verify_error.${Date.now()}`),
      "payment_verification_failed",
      { error_message: message, stage: "stripe_retrieve" },
    );
    return NextResponse.json({ paid: false, error: "Invalid session" }, { status: 400 });
  }
}
