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

    // Email notification removed — coach invite still creates the coach_clients
    // row above, but no email goes out to the client. They'll see the pending
    // invite when they next visit their dashboard.

    return NextResponse.json({ status: "invited" });
  } catch (error) {
    console.error("Coach invite error:", error);
    return NextResponse.json({ error: "Failed to invite." }, { status: 500 });
  }
}
