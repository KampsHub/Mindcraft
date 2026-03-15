import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { summaryId, approvedSections, redactedSections } = await request.json();

    if (!summaryId || !approvedSections) {
      return NextResponse.json({ error: "Missing summaryId or approvedSections" }, { status: 400 });
    }

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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the summary to build approved version
    const { data: existing } = await supabase
      .from("shared_summaries")
      .select("*")
      .eq("id", summaryId)
      .eq("client_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    // Build approved summary by filtering sections
    const generated = existing.generated_summary as { sections: Array<{ id: string; title: string; content: string }> };
    const approvedSummary = {
      ...generated,
      sections: generated.sections.filter((s: { id: string }) => approvedSections.includes(s.id)),
    };

    const { data: updated, error: updateError } = await supabase
      .from("shared_summaries")
      .update({
        approved_summary: approvedSummary,
        redacted_sections: redactedSections || [],
        status: "approved",
        reviewed_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      })
      .eq("id", summaryId)
      .eq("client_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ summary: updated });
  } catch (err) {
    console.error("Coach sharing approve error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: revoke a previously approved summary
export async function PATCH(request: Request) {
  try {
    const { summaryId } = await request.json();

    if (!summaryId) {
      return NextResponse.json({ error: "Missing summaryId" }, { status: 400 });
    }

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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: updated, error } = await supabase
      .from("shared_summaries")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
      })
      .eq("id", summaryId)
      .eq("client_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ summary: updated });
  } catch (err) {
    console.error("Coach sharing revoke error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
