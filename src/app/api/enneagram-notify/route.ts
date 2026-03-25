import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { customerEmail, amountPaid } = await req.json();

    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email required" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set, skipping enneagram notification");
      return NextResponse.json({ skipped: true, reason: "no_api_key" });
    }

    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "Mindcraft <stefanie@allmindsondeck.org>",
      to: "stefanie@allmindsondeck.com",
      subject: "New Enneagram Purchase",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
          <p style="font-size: 18px; font-weight: 700; margin: 0 0 24px 0;">New Enneagram Purchase</p>
          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 8px 0;">
            <strong>Customer:</strong> ${customerEmail}
          </p>
          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 8px 0;">
            <strong>Amount:</strong> $${((amountPaid || 30000) / 100).toFixed(2)}
          </p>
          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 8px 0;">
            <strong>Time:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}
          </p>
          <p style="font-size: 16px; line-height: 1.7; margin: 24px 0 0 0;">
            Send them the IEQ9 assessment link within 48 hours.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ sent: true });
  } catch (error: unknown) {
    console.error("Enneagram notify error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
