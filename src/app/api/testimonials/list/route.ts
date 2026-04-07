import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select(
        "id, kind, body, attribution, social_url, social_embed_html, video_url, show_linkedin_link, outcome_tags, created_at, approved_at"
      )
      .eq("status", "approved")
      .order("approved_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[testimonials/list] query failed", error);
      return NextResponse.json({ testimonials: [] }, { status: 200 });
    }

    return NextResponse.json({ testimonials: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error("[testimonials/list] unexpected", err);
    return NextResponse.json({ testimonials: [] }, { status: 200 });
  }
}
