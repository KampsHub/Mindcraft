import { Resend } from "resend";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ISSUE_TYPES = [
  "Technical problem",
  "Feedback on an exercise",
  "Feedback on insights and summaries",
  "Question for a Coach",
] as const;

export async function POST(request: NextRequest) {
  try {
    const { issueType, message } = await request.json();

    if (!issueType || !ISSUE_TYPES.includes(issueType)) {
      return NextResponse.json({ error: "Invalid issue type." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch { /* read-only context */ }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set — contact message logged but not emailed");
      console.log(`[Contact] ${issueType} from ${user.email}: ${message.trim()}`);
      return NextResponse.json({ success: true });
    }

    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "Mindcraft <noreply@allmindsondeck.org>",
      to: "stefanie@allmindsondeck.org",
      subject: `[Mindcraft] ${issueType} from ${user.email}`,
      text: [
        `Issue type: ${issueType}`,
        `From: ${user.email}`,
        `User ID: ${user.id}`,
        "",
        "Message:",
        message.trim(),
      ].join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
