import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enrollmentId } = body as { enrollmentId: string };

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "enrollmentId is required" },
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    // Fetch enrollment + program
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, user_id, programs(name)")
      .eq("id", enrollmentId)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: "Could not find your enrollment. Please refresh the page." },
        { status: 404 }
      );
    }

    const programName =
      (enrollment.programs as unknown as { name: string })?.name || "Mindcraft";

    // Fetch stats
    const { count: journalCount } = await supabase
      .from("daily_sessions")
      .select("id", { count: "exact", head: true })
      .eq("enrollment_id", enrollmentId);

    const { count: exerciseCount } = await supabase
      .from("exercise_completions")
      .select("id", { count: "exact", head: true })
      .eq("enrollment_id", enrollmentId);

    const { count: coachingCount } = await supabase
      .from("coaching_questions")
      .select("id", { count: "exact", head: true })
      .eq("enrollment_id", enrollmentId);

    // Fetch active goals
    const { data: goals } = await supabase
      .from("goals")
      .select("title")
      .eq("enrollment_id", enrollmentId)
      .eq("status", "active");

    const totalJournals = journalCount || 0;
    const totalExercises = exerciseCount || 0;
    const totalCoaching = coachingCount || 0;

    const goalsHtml =
      goals && goals.length > 0
        ? `<div style="margin: 24px 0;">
            <div style="font-size: 13px; color: #a0a0a8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Your Active Goals</div>
            <ul style="margin: 0; padding-left: 20px;">
              ${goals.map((g) => `<li style="color: #ffffff; font-size: 15px; line-height: 1.7;">${g.title}</li>`).join("")}
            </ul>
          </div>`
        : "";

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://mindcraft.ing";

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set, skipping program-complete email");
      return NextResponse.json({ skipped: true, reason: "no_api_key" });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "Stefanie from Mindcraft <stefanie@allmindsondeck.com>",
      to: user.email,
      subject: `You finished ${programName}.`,
      html: `
        <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="max-width: 560px; margin: 0 auto; background-color: #2a2a30; border-radius: 12px; padding: 40px 32px;">
            <h1 style="font-size: 28px; font-weight: 700; color: #ffffff; margin: 0 0 28px 0;">
              30 days. Done.
            </h1>
            <div style="display: flex; gap: 24px; margin: 24px 0;">
              <div>
                <div style="font-size: 28px; font-weight: 700; color: #e09585;">${totalJournals}</div>
                <div style="font-size: 12px; color: #a0a0a8; text-transform: uppercase; letter-spacing: 0.05em;">Journal Entries</div>
              </div>
              <div>
                <div style="font-size: 28px; font-weight: 700; color: #e09585;">${totalExercises}</div>
                <div style="font-size: 12px; color: #a0a0a8; text-transform: uppercase; letter-spacing: 0.05em;">Exercises</div>
              </div>
              <div>
                <div style="font-size: 28px; font-weight: 700; color: #e09585;">${totalCoaching}</div>
                <div style="font-size: 12px; color: #a0a0a8; text-transform: uppercase; letter-spacing: 0.05em;">Coaching Questions</div>
              </div>
            </div>
            ${goalsHtml}
            <div style="margin: 28px 0;">
              <div style="font-size: 13px; color: #a0a0a8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">What You Can Do Next</div>
              <div style="margin-bottom: 8px;">
                <a href="${appUrl}/dashboard" style="color: #e09585; font-size: 15px; text-decoration: none;">Download your exercise guide &rarr;</a>
              </div>
              <div style="margin-bottom: 8px;">
                <a href="${appUrl}/dashboard" style="color: #e09585; font-size: 15px; text-decoration: none;">Share your insights &rarr;</a>
              </div>
              <div style="margin-bottom: 8px;">
                <a href="${appUrl}/apply" style="color: #e09585; font-size: 15px; text-decoration: none;">Book a 1:1 coaching session &rarr;</a>
              </div>
            </div>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #333339;">
              <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0; font-style: italic;">
                This program was designed to end. The tools are yours now.
              </p>
              <p style="color: #a0a0a8; font-size: 14px; margin: 12px 0 0 0;">
                &mdash; Stefanie
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ sent: true });
  } catch (error: unknown) {
    console.error("Program complete email error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
