import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enrollmentId, dayNumber, sessionId } = body as {
      enrollmentId: string;
      dayNumber: number;
      sessionId: string;
    };

    if (!enrollmentId || !dayNumber || !sessionId) {
      return NextResponse.json(
        { error: "enrollmentId, dayNumber, and sessionId are required" },
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

    // Fetch day session data
    const { data: session } = await supabase
      .from("daily_sessions")
      .select("daily_summary, themes, exercises_completed")
      .eq("id", sessionId)
      .single();

    // Fetch enrollment + program
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, current_day, programs(name)")
      .eq("id", enrollmentId)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: "Could not find your enrollment. Please refresh the page." }, { status: 404 });
    }

    const programName =
      (enrollment.programs as unknown as { name: string })?.name || "Mindcraft";
    const themes: string[] = session?.themes || [];
    const summary: string = session?.daily_summary || "";
    const exercisesCompleted: number = session?.exercises_completed || 0;

    // Truncate summary to ~3 sentences
    const truncatedSummary = summary
      .split(/(?<=[.!?])\s+/)
      .slice(0, 3)
      .join(" ");

    // Check if there's a next day preview
    const { data: nextDay } = await supabase
      .from("program_days")
      .select("title, description")
      .eq("program_id", enrollmentId)
      .eq("day_number", dayNumber + 1)
      .single();

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set, skipping day-complete email");
      return NextResponse.json({ skipped: true, reason: "no_api_key" });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const themesHtml =
      themes.length > 0
        ? `<div style="margin: 20px 0;">
            <div style="font-size: 13px; color: #a0a0a8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Today&rsquo;s Themes</div>
            <ul style="margin: 0; padding-left: 20px;">
              ${themes.map((t) => `<li style="color: #ffffff; font-size: 15px; line-height: 1.7;">${t}</li>`).join("")}
            </ul>
          </div>`
        : "";

    const summaryHtml = truncatedSummary
      ? `<div style="margin: 20px 0;">
          <div style="font-size: 13px; color: #a0a0a8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Summary</div>
          <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0;">${truncatedSummary}</p>
        </div>`
      : "";

    const tomorrowHtml = nextDay
      ? `<div style="margin: 20px 0; padding: 16px; background-color: #333339; border-radius: 8px;">
          <div style="font-size: 13px; color: #a0a0a8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Tomorrow&rsquo;s Territory</div>
          <p style="color: #ffffff; font-size: 15px; margin: 0;">${nextDay.title || nextDay.description || ""}</p>
        </div>`
      : "";

    const nextDayUrl = `https://mindcraft.ing/day/${dayNumber + 1}?enrollment=${enrollmentId}`;

    await resend.emails.send({
      from: "Mindcraft <noreply@allmindsondeck.org>",
      to: user.email,
      subject: `Day ${dayNumber} Complete — ${programName}`,
      html: `
        <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="max-width: 560px; margin: 0 auto; background-color: #2a2a30; border-radius: 12px; padding: 40px 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 24px 0;">
              Day ${dayNumber} is done.
            </h1>
            ${themesHtml}
            ${summaryHtml}
            <div style="margin: 20px 0;">
              <div style="font-size: 13px; color: #a0a0a8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Exercises Completed</div>
              <p style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">${exercisesCompleted}</p>
            </div>
            ${tomorrowHtml}
            <div style="margin: 32px 0; text-align: center;">
              <a href="${nextDayUrl}" style="display: inline-block; padding: 14px 32px; background-color: #e09585; color: #18181c; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 100px;">
                Start Day ${dayNumber + 1}
              </a>
            </div>
            <p style="font-size: 12px; color: #a0a0a8; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
              You&rsquo;re receiving this because you&rsquo;re enrolled in ${programName}.<br />
              Manage notifications in your account settings.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ sent: true });
  } catch (error: unknown) {
    console.error("Day complete email error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
