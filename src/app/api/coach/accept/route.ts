import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

    const body = await request.json();
    const { coachClientId } = body as { coachClientId: string };
    if (!coachClientId) {
      return NextResponse.json({ error: "Missing coachClientId." }, { status: 400 });
    }

    // Use service role to bypass RLS for the update (client_id isn't set yet)
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // Verify invitation exists and is for this user's email
    const { data: invitation } = await admin
      .from("coach_clients")
      .select("id, client_email, status")
      .eq("id", coachClientId)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (invitation.client_email !== user.email) {
      return NextResponse.json({ error: "This invitation is not for you." }, { status: 403 });
    }

    if (invitation.status === "active") {
      return NextResponse.json({ status: "already_active" });
    }

    await admin
      .from("coach_clients")
      .update({
        status: "active",
        client_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", coachClientId);

    return NextResponse.json({ status: "accepted" });
  } catch (error) {
    console.error("Coach accept error:", error);
    return NextResponse.json({ error: "Failed to accept." }, { status: 500 });
  }
}
