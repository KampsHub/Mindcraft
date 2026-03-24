import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/create-enrollment
 *
 * Creates a client row + program enrollment for the authenticated user.
 * Uses service role to bypass RLS.
 */
export async function POST(req: NextRequest) {
  try {
    const { program: programSlug } = await req.json();

    if (!programSlug) {
      return NextResponse.json({ error: "Missing program" }, { status: 400 });
    }

    // Get authenticated user
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
              // Server Component context
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      // Fallback: try with anon key (may fail if RLS blocks)
      return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    // Ensure client row exists
    const { data: existingClient } = await admin
      .from("clients")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingClient) {
      await admin.from("clients").insert({
        id: user.id,
        email: user.email,
        name: user.email.split("@")[0],
        subscription_status: "active",
      });
    }

    // Look up program
    const { data: program } = await admin
      .from("programs")
      .select("id")
      .eq("slug", programSlug)
      .single();

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Check if enrollment exists
    const { data: existing } = await admin
      .from("program_enrollments")
      .select("id")
      .eq("client_id", user.id)
      .eq("program_id", program.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ created: false, existing: true });
    }

    // Create enrollment
    const { error: enrollError } = await admin
      .from("program_enrollments")
      .insert({
        client_id: user.id,
        program_id: program.id,
        status: "pre_start",
        current_day: 1,
        started_at: new Date().toISOString(),
      });

    if (enrollError) {
      console.error("Failed to create enrollment via API:", enrollError);
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    return NextResponse.json({ created: true });
  } catch (error) {
    console.error("Error in /api/create-enrollment:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
