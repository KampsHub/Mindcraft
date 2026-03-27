import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// GET handler for Vercel cron
export async function GET(request: Request) {
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

    const today = new Date().toISOString().split("T")[0];

    // Find active enrollments that don't have a session started today
    const { data: enrollments } = await supabase
      .from("program_enrollments")
      .select("id, client_id, current_day, programs(name)")
      .eq("status", "active");

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    let sentCount = 0;

    for (const enrollment of enrollments) {
      // Check if they already started today's session
      const { data: todaySession } = await supabase
        .from("daily_sessions")
        .select("id")
        .eq("enrollment_id", enrollment.id)
        .eq("day_number", enrollment.current_day)
        .gte("created_at", today)
        .limit(1)
        .maybeSingle();

      if (todaySession) continue; // Already started

      // Check cooldown — don't remind more than once per day
      const { data: recentReminder } = await supabase
        .from("email_events")
        .select("id")
        .eq("user_id", enrollment.client_id)
        .eq("event_type", "daily_reminder")
        .gte("created_at", today)
        .limit(1)
        .maybeSingle();

      if (recentReminder) continue;

      // Get user email
      const { data: { user } } = await supabase.auth.admin.getUserById(enrollment.client_id);
      if (!user?.email) continue;

      const programName = (enrollment.programs as any)?.name || "your program";

      // Send gentle reminder
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Mindcraft <noreply@allmindsondeck.org>",
        to: user.email,
        subject: `Day ${enrollment.current_day} is ready`,
        html: `
          <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="max-width: 480px; margin: 0 auto;">
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Your Day ${enrollment.current_day} session is ready.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="https://mindcraft.ing/dashboard" style="display: inline-block; padding: 12px 28px; background-color: #e09585; color: #18181c; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 100px;">
                  Start session
                </a>
              </div>
              <p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
                Reply STOP to opt out of reminders.
              </p>
            </div>
          </div>
        `,
      });

      // Log for cooldown
      await supabase.from("email_events").insert({
        user_id: enrollment.client_id,
        event_type: "daily_reminder",
        enrollment_id: enrollment.id,
      });

      sentCount++;
    }

    return NextResponse.json({ sent: sentCount });
  } catch (error) {
    console.error("Daily reminder error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
