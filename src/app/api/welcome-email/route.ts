import { Resend } from "resend";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { welcomeEmailHtml, welcomeEmailSubject, welcomeEmailFrom } from "@/lib/emails/welcome";

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
      from: welcomeEmailFrom,
      to: user.email,
      subject: welcomeEmailSubject,
      html: welcomeEmailHtml({ appUrl }),
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
