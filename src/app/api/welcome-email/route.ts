import { Resend } from "resend";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
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
              // setAll can fail in read-only contexts
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    // Check if welcome email was already sent
    const { data: client } = await supabase
      .from("clients")
      .select("welcome_email_sent")
      .eq("id", user.id)
      .single();

    if (client?.welcome_email_sent) {
      return NextResponse.json({ skipped: true });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set, skipping welcome email");
      return NextResponse.json({ skipped: true, reason: "no_api_key" });
    }

    const resend = new Resend(resendKey);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    await resend.emails.send({
      from: "Stefanie from Mindcraft <stefanie@allmindsondeck.com>",
      to: user.email,
      subject: "Welcome to Mindcraft",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
          <div style="margin-bottom: 32px;">
            <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">mindcraft</span>
          </div>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            Hello and Welcome.
          </p>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            I&rsquo;m glad you&rsquo;re here.
          </p>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            Mindcraft was built from real coaching experience &mdash; the kind of tools I wished existed when I needed them most. Over the next 30 days, you&rsquo;ll journal, work through exercises designed by certified coaches, and start seeing your own patterns more clearly.
          </p>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            If you have questions at any point, there&rsquo;s a <strong>Contact</strong> button right on your dashboard. I read every message personally.
          </p>

          <div style="margin: 32px 0;">
            <a href="${appUrl}/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #E09585; color: #1a1a1a; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
              Go to your dashboard
            </a>
          </div>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 4px 0;">
            Wishing you the best on this journey.
          </p>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 32px 0;">
            <strong>Stefanie Kamps</strong><br />
            <span style="color: #666; font-size: 14px;">Founder &middot; Mindcraft</span>
          </p>

          <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 20px;">
            <p style="font-size: 12px; color: #999; line-height: 1.5; margin: 0;">
              Mindcraft by All Minds on Deck LLC<br />
              <a href="${appUrl}/privacy-policy" style="color: #999;">Privacy Policy</a> &middot;
              <a href="${appUrl}/terms" style="color: #999;">Terms</a>
            </p>
          </div>
        </div>
      `,
    });

    // Mark welcome email as sent
    await supabase
      .from("clients")
      .update({ welcome_email_sent: true })
      .eq("id", user.id);

    return NextResponse.json({ sent: true });
  } catch (error: unknown) {
    console.error("Welcome email error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
