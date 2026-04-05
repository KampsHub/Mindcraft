import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const ADMIN_EMAILS = [
  "stefanie@allmindsondeck.com",
  "stefanie.kamps@gmail.com",
];

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    // Check coach role
    let isCoach = ADMIN_EMAILS.includes(user.email || "");
    if (!isCoach) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      isCoach = profile?.role === "admin" || profile?.role === "coach";
    }
    if (!isCoach) {
      return NextResponse.json({ error: "Coach access required." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const { email } = parsed.data;

    // Check if already invited
    const { data: existing } = await supabase
      .from("coach_clients")
      .select("id, status")
      .eq("coach_id", user.id)
      .eq("client_email", email)
      .single();

    if (existing) {
      if (existing.status === "revoked") {
        // Re-invite
        await supabase
          .from("coach_clients")
          .update({ status: "pending", invited_at: new Date().toISOString(), accepted_at: null, client_id: null })
          .eq("id", existing.id);
        return NextResponse.json({ status: "re-invited" });
      }
      return NextResponse.json({ error: `Already ${existing.status}.` }, { status: 409 });
    }

    // Check if client exists in auth
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { users } } = await admin.auth.admin.listUsers();
    const clientUser = users?.find(u => u.email === email);

    await supabase.from("coach_clients").insert({
      coach_id: user.id,
      client_email: email,
      client_id: clientUser?.id || null,
      status: "pending",
    });

    // Send notification email if client exists
    if (clientUser) {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Mindcraft <noreply@allmindsondeck.org>",
          to: email,
          subject: "A coach wants to follow your progress",
          html: `
            <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, sans-serif;">
              <div style="max-width: 560px; margin: 0 auto; background-color: #2a2a30; border-radius: 12px; padding: 40px 32px;">
                <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                  A coach has requested access to follow your program progress on Mindcraft.
                </p>
                <p style="color: #a0a0a8; font-size: 15px; line-height: 1.7; margin: 0 0 28px 0;">
                  They&rsquo;ll be able to see your goals, program day, and any insights you choose to share. You can accept or decline from your dashboard.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://mindcraft.ing/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #e09585; color: #18181c; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 100px;">
                    Review request
                  </a>
                </div>
              </div>
            </div>
          `,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ status: "invited" });
  } catch (error) {
    console.error("Coach invite error:", error);
    return NextResponse.json({ error: "Failed to invite." }, { status: 500 });
  }
}
