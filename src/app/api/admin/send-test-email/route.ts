import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEmailPreview } from "@/lib/email-test-previews";

const ADMIN_EMAILS = [
  "stefanie@allmindsondeck.com",
  "crew@allmindsondeck.com",
  "stefanie.kamps@gmail.com",
];

export async function POST(request: Request) {
  try {
    // Admin gate (case-insensitive)
    const supabase = await createServerSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase().trim();
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const key: string = (payload?.key ?? "").toString();
    const recipient: string = (payload?.recipient ?? email).toString();

    const preview = getEmailPreview(key);
    if (!preview) {
      return NextResponse.json(
        { error: `No preview available for key "${key}". Add it to src/lib/email-test-previews.ts.` },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "Mindcraft Preview <crew@allmindsondeck.com>",
      to: recipient,
      subject: `[PREVIEW] ${preview.subject}`,
      html: preview.html,
    });

    return NextResponse.json({ ok: true, sentTo: recipient, subject: preview.subject });
  } catch (err) {
    console.error("[admin/send-test-email] failed", err);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
