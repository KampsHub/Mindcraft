import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const MAX_REMINDERS = 3;

// GET handler for Vercel cron
export async function GET(request: Request) {
  return handleReEngage(request, false);
}

// POST handler for manual trigger with dryRun option
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { dryRun } = body as { dryRun?: boolean };
  return handleReEngage(request, !!dryRun);
}

async function handleReEngage(request: Request, dryRun: boolean) {
  try {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: enrollments, error: enrollError } = await supabase
      .from("program_enrollments")
      .select("id, client_id, current_day, programs(name)")
      .eq("status", "active");

    if (enrollError) {
      console.error("Error fetching enrollments:", enrollError);
      return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ emailed: [], count: 0 });
    }

    const results: Array<{
      userId: string;
      email: string;
      currentDay: number;
      programName: string;
      emailType: string;
      reminderCount: number;
    }> = [];

    for (const enrollment of enrollments) {
      // Check last session
      const { data: latestSession } = await supabase
        .from("daily_sessions")
        .select("created_at")
        .eq("enrollment_id", enrollment.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Skip if active in last 2 days
      if (latestSession && latestSession.created_at > twoDaysAgo) {
        continue;
      }

      // Count how many inactive_reminder emails we've already sent for this enrollment
      const { count: reminderCount } = await supabase
        .from("email_events")
        .select("id", { count: "exact", head: true })
        .eq("enrollment_id", enrollment.id)
        .eq("event_type", "inactive_reminder");

      const sentCount = reminderCount || 0;

      // Determine email type
      const isExitSurveyCandidate = sentCount >= MAX_REMINDERS && latestSession
        ? latestSession.created_at < sevenDaysAgo
        : false;

      // If we've sent all 3 reminders AND already sent exit survey, skip entirely
      if (sentCount >= MAX_REMINDERS) {
        // Check if exit survey already sent
        const { data: exitSent } = await supabase
          .from("email_events")
          .select("id")
          .eq("enrollment_id", enrollment.id)
          .eq("event_type", "exit_survey")
          .limit(1)
          .single();

        if (exitSent) continue; // All done for this user
        if (!isExitSurveyCandidate) continue; // Not yet 7 days, wait
      }

      // Cooldown: don't email same user within 2 days
      const cooldownCheck = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentEmail } = await supabase
        .from("email_events")
        .select("id")
        .eq("enrollment_id", enrollment.id)
        .in("event_type", ["inactive_reminder", "exit_survey"])
        .gte("created_at", cooldownCheck)
        .limit(1)
        .single();

      if (recentEmail) continue;

      // Fetch user email
      const { data: { user } } = await supabase.auth.admin.getUserById(enrollment.client_id);
      if (!user?.email) continue;

      // Get last themes for personalization
      const { data: lastThemes } = await supabase
        .from("daily_sessions")
        .select("themes")
        .eq("enrollment_id", enrollment.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const programName = (enrollment.programs as unknown as { name: string })?.name || "Mindcraft";
      const currentDay = enrollment.current_day || 1;
      const themes: string[] = lastThemes?.themes || [];
      const lastTheme = themes.length > 0 ? themes[0] : null;
      const emailType = isExitSurveyCandidate ? "exit_survey" : "inactive_reminder";

      results.push({
        userId: enrollment.client_id,
        email: user.email,
        currentDay,
        programName,
        emailType,
        reminderCount: sentCount,
      });

      if (!dryRun) {
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) {
          console.warn("RESEND_API_KEY not set, skipping emails");
          return NextResponse.json({ skipped: true, reason: "no_api_key" });
        }

        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        if (isExitSurveyCandidate) {
          // Exit survey — after 3 reminders and 7+ days inactive
          const exitSurveyUrl = process.env.EXIT_SURVEY_URL || "https://mindcraft.ing/feedback/exit";
          await resend.emails.send({
            from: "Mindcraft <crew@allmindsondeck.com>",
            to: user.email,
            subject: "Quick question before you go",
            html: `
              <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif;">
                <div style="max-width: 560px; margin: 0 auto; background-color: #2a2a30; border-radius: 12px; padding: 40px 32px;">
                  <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                    It looks like you stepped away from ${programName}.
                  </p>
                  <p style="color: #a0a0a8; font-size: 15px; line-height: 1.7; margin: 0 0 12px 0;">
                    No judgment &mdash; life happens. But your feedback would genuinely help us make this better for the next person.
                  </p>
                  <p style="color: #a0a0a8; font-size: 15px; line-height: 1.7; margin: 0 0 28px 0;">
                    Two questions, takes 30 seconds:
                  </p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${exitSurveyUrl}" style="display: inline-block; padding: 14px 32px; background-color: #e09585; color: #18181c; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 100px;">
                      Share quick feedback
                    </a>
                  </div>
                  <p style="color: #a0a0a8; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                    Your program is still here if you want to come back. <a href="https://mindcraft.ing/dashboard" style="color: #e09585; text-decoration: none;">Continue Day ${currentDay} &rarr;</a>
                  </p>
                  <p style="font-size: 12px; color: #666; line-height: 1.5; margin: 20px 0 0 0; text-align: center;">
                    Reply STOP to opt out of check-ins.
                  </p>
                </div>
              </div>
            `,
          });
        } else {
          // Inactive reminder — 2+ days, up to 3 times
          const themeReference = lastTheme
            ? `Your last entry touched on ${lastTheme}.`
            : "You were making real progress.";

          const reminderSubjects = [
            `Day ${currentDay} is waiting`,
            "Your program is still here",
            "Checking in \u2014 one more nudge",
          ];
          const subject = reminderSubjects[Math.min(sentCount, reminderSubjects.length - 1)];

          await resend.emails.send({
            from: "Mindcraft <noreply@allmindsondeck.org>",
            to: user.email,
            subject,
            html: `
              <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif;">
                <div style="max-width: 560px; margin: 0 auto; background-color: #2a2a30; border-radius: 12px; padding: 40px 32px;">
                  <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                    You were on Day ${currentDay}. ${themeReference}
                  </p>
                  <p style="color: #a0a0a8; font-size: 15px; line-height: 1.7; margin: 0 0 28px 0;">
                    The program doesn&rsquo;t judge gaps. Pick up where you left off.
                  </p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://mindcraft.ing/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #e09585; color: #18181c; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 100px;">
                      Continue Day ${currentDay}
                    </a>
                  </div>
                  <p style="font-size: 12px; color: #a0a0a8; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
                    Reply STOP to opt out of check-ins.
                  </p>
                </div>
              </div>
            `,
          });
        }

        // Log for tracking + cooldown
        await supabase.from("email_events").insert({
          user_id: enrollment.client_id,
          event_type: emailType,
          enrollment_id: enrollment.id,
          resend_email_id: `outbound_${Date.now()}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      emailed: results,
      count: results.length,
      dryRun: !!dryRun,
    });
  } catch (error: unknown) {
    console.error("Re-engage email error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
