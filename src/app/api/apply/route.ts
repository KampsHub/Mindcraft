import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import {
  coachingApplicationHtml,
  coachingApplicationSubject,
  coachingApplicationFrom,
} from "@/lib/emails/coaching-application";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { firstName, lastName, email, phone, company, location, situation, sixMonthGoal, funding, budget, referral, anythingElse } = data;

    if (!firstName || !lastName || !email || !situation || !sixMonthGoal) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.log("\n=== COACHING APPLICATION ===\n", JSON.stringify(data, null, 2), "\n===========================\n");
      return NextResponse.json({ success: true, reason: "logged_no_resend" });
    }

    const resend = new Resend(resendKey);
    const applyOpts = {
      firstName, lastName, email, phone, company, location,
      situation, sixMonthGoal, funding, budget, referral, anythingElse,
    };

    await resend.emails.send({
      from: coachingApplicationFrom,
      to: "stefanie@allmindsondeck.com",
      replyTo: email,
      subject: coachingApplicationSubject(applyOpts),
      html: coachingApplicationHtml(applyOpts),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Apply form error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
