import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const ALLOWED_SOURCES = ["day_26_prompt", "share_page_feedback_tab", "other"];

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const body: string = (payload?.body ?? "").toString().trim();
    const source: string = (payload?.source ?? "").toString();
    const enrollmentId: string | null = payload?.enrollmentId ?? null;
    const dayNumber: number | null = Number.isFinite(payload?.dayNumber) ? payload.dayNumber : null;

    if (body.length < 5) {
      return NextResponse.json({ error: "Please write something." }, { status: 400 });
    }
    if (!ALLOWED_SOURCES.includes(source)) {
      return NextResponse.json({ error: "Invalid source." }, { status: 400 });
    }

    // Get the user id if authenticated
    const serverSupabase = await createServerSupabaseClient();
    const { data: userData } = await serverSupabase.auth.getUser();
    const userId = userData?.user?.id ?? null;

    // feedback_entries is service-role-only; use the service client.
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await admin.from("feedback_entries").insert({
      user_id: userId,
      enrollment_id: enrollmentId,
      day_number: dayNumber,
      source,
      body,
    });

    if (error) {
      console.error("[feedback] insert failed", error);
      return NextResponse.json({ error: "Could not save." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[feedback] unexpected", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
