import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
const CONTACT_EMAIL = "stefanie@allmindsondeck.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both formats:
    // - ContactModal (authenticated): { issueType, message }
    // - Public contact page: { name, email, message }
    let senderName = body.name || "";
    let senderEmail = body.email || "";
    const issueType = body.issueType || "General";
    const message = body.message;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // If no name/email provided, try to get from authenticated session
    if (!senderName || !senderEmail) {
      try {
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
                } catch { /* Server Component context */ }
              },
            },
          }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          senderEmail = senderEmail || user.email || "unknown";
          senderName = senderName || user.user_metadata?.name || user.email || "Logged-in user";
        }
      } catch {
        // Auth lookup is best-effort
      }
    }

    // Store in database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("contact_messages").insert({
        name: senderName,
        email: senderEmail,
        message: `[${issueType}] ${message}`,
        to_email: CONTACT_EMAIL,
        created_at: new Date().toISOString(),
      });
    }

    // Send email notification
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not set, skipping contact email");
      } else {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Mindcraft <noreply@allmindsondeck.org>",
          to: CONTACT_EMAIL,
          replyTo: senderEmail || undefined,
          subject: `Mindcraft Contact: ${issueType}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <p><strong>From:</strong> ${senderName} &lt;${senderEmail}&gt;</p>
              <p><strong>Type:</strong> ${issueType}</p>
              <hr style="border: 1px solid #eee;" />
              <p>${message.replace(/\n/g, "<br>")}</p>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error("Contact email failed:", emailErr);
      // Still return success — message is stored in database
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
