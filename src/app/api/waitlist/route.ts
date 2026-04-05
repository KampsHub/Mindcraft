import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { email, program } = await req.json();

    if (!email?.trim() || !program?.trim()) {
      return NextResponse.json(
        { error: "Email and program are required" },
        { status: 400 }
      );
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Send notification to team + confirmation to user
    const resend = new Resend(process.env.RESEND_API_KEY);

    await Promise.all([
      // Notify team
      resend.emails.send({
        from: "Mindcraft <crew@allmindsondeck.com>",
        to: "crew@allmindsondeck.com",
        subject: `Waitlist signup: ${program}`,
        text: `New waitlist signup:\n\nEmail: ${email}\nProgram: ${program}\nDate: ${new Date().toISOString()}`,
      }),
      // Confirm to user
      resend.emails.send({
        from: "Mindcraft <crew@allmindsondeck.com>",
        to: email,
        subject: `You're on the list — ${program}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1a1a1a; margin-bottom: 16px;">You're on the waitlist.</h2>
            <p style="color: #333; line-height: 1.6;">
              We'll let you know as soon as the <strong>${program}</strong> program is ready.
              No spam, just one email when it launches.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 32px;">
              — The Mindcraft team
            </p>
          </div>
        `,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
