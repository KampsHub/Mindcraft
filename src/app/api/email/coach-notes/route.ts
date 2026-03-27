import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = [
  "stefanie@allmindsondeck.com",
  "stefanie.kamps@gmail.com",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enrollmentId, clientId, notePreview } = body as {
      enrollmentId: string;
      clientId: string;
      notePreview: string;
    };

    if (!enrollmentId || !clientId || !notePreview) {
      return NextResponse.json(
        { error: "enrollmentId, clientId, and notePreview are required" },
        { status: 400 }
      );
    }

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

    // Verify the requester is a coach/admin
    const {
      data: { user: coach },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !coach?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check coach/admin role — first try profiles table, fall back to hardcoded list
    let isAdmin = ADMIN_EMAILS.includes(coach.email);

    if (!isAdmin) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", coach.id)
        .single();

      isAdmin =
        profile?.role === "admin" || profile?.role === "coach";
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Fetch client email
    const { data: clientProfile } = await supabase
      .from("clients")
      .select("email")
      .eq("id", clientId)
      .single();

    if (!clientProfile?.email) {
      // Try auth.users via admin if clients table doesn't have email
      return NextResponse.json(
        { error: "Client email not found" },
        { status: 404 }
      );
    }

    // Fetch program name
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("programs(name)")
      .eq("id", enrollmentId)
      .single();

    const programName =
      (enrollment?.programs as unknown as { name: string })?.name ||
      "Mindcraft";

    // Truncate note preview to 200 chars
    const preview =
      notePreview.length > 200
        ? notePreview.slice(0, 200) + "..."
        : notePreview;

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set, skipping coach-notes email");
      return NextResponse.json({ skipped: true, reason: "no_api_key" });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "Stefanie from Mindcraft <stefanie@allmindsondeck.com>",
      to: clientProfile.email,
      subject: `A note from your coach \u2014 ${programName}`,
      html: `
        <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="max-width: 560px; margin: 0 auto; background-color: #2a2a30; border-radius: 12px; padding: 40px 32px;">
            <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 20px 0;">
              Your coach left you a note.
            </h2>
            <div style="background-color: #333339; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0; font-style: italic;">
                &ldquo;${preview}&rdquo;
              </p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://mindcraft.ing/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #e09585; color: #18181c; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 100px;">
                Read the Full Note
              </a>
            </div>
            <p style="font-size: 13px; color: #a0a0a8; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
              Your coach reviews your progress periodically and may share<br />
              observations to support your journey.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ sent: true });
  } catch (error: unknown) {
    console.error("Coach notes email error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
