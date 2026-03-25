import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

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

    const row = (label: string, value: string) =>
      value ? `<tr><td style="padding:8px 16px 8px 0;font-weight:600;color:#333;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:8px 0;color:#555">${value}</td></tr>` : "";

    await resend.emails.send({
      from: "Mindcraft <stefanie@allmindsondeck.com>",
      to: "stefanie@allmindsondeck.com",
      replyTo: email,
      subject: `Coaching Application — ${firstName} ${lastName}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a">
          <p style="font-size:20px;font-weight:700;margin:0 0 24px">New Coaching Application</p>
          <table style="border-collapse:collapse;width:100%;font-size:15px;line-height:1.6">
            ${row("Name", `${firstName} ${lastName}`)}
            ${row("Email", `<a href="mailto:${email}">${email}</a>`)}
            ${row("Phone", phone)}
            ${row("Company", company)}
            ${row("Location", location)}
          </table>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0"/>
          <p style="font-size:14px;font-weight:700;color:#333;margin:0 0 8px">What's going on right now?</p>
          <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px">${situation}</p>
          <p style="font-size:14px;font-weight:700;color:#333;margin:0 0 8px">Six-month goal</p>
          <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px">${sixMonthGoal}</p>
          <table style="border-collapse:collapse;width:100%;font-size:15px;line-height:1.6">
            ${row("Funding", funding)}
            ${row("Budget", budget)}
            ${row("Referral", referral)}
          </table>
          ${anythingElse ? `<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0"/><p style="font-size:14px;font-weight:700;color:#333;margin:0 0 8px">Anything else</p><p style="font-size:15px;color:#555;line-height:1.7;margin:0">${anythingElse}</p>` : ""}
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Apply form error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
