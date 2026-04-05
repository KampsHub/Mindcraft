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

    // Use service role to verify and update
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: invitation } = await admin
      .from("coach_clients")
      .select("id, client_email, client_id")
      .eq("id", coachClientId)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    // Only the client can revoke
    if (invitation.client_id !== user.id && invitation.client_email !== user.email) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    await admin
      .from("coach_clients")
      .update({ status: "revoked" })
      .eq("id", coachClientId);

    return NextResponse.json({ status: "revoked" });
  } catch (error) {
    console.error("Coach revoke error:", error);
    return NextResponse.json({ error: "Failed to revoke." }, { status: 500 });
  }
}
