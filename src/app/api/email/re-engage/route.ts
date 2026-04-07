import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  reEngageNudge1Html,
  reEngageNudge1Subject,
  reEngageNudge2Html,
  reEngageNudge2Subject,
  reEngageNudge3Html,
  reEngageNudge3Subject,
  reEngageNudgeFrom,
  reEngageExitSurveyHtml,
  reEngageExitSurveySubject,
  reEngageExitSurveyFrom,
} from "@/lib/emails/re-engage";

/**
 * Re-engagement cron — runs daily at 3pm PT.
 *
 * Trigger: auth.users.last_sign_in_at
 *
 * Cadence — each nudge fires at most ONCE per enrollment lifetime:
 *   Day 3+ since last_sign_in  → Nudge 1 (only if 0 nudges sent yet)
 *   Day 6+ since last_sign_in  → Nudge 2 (only if exactly 1 nudge sent ever)
 *   Day 9+ since last_sign_in  → Nudge 3 (only if exactly 2 nudges sent ever)
 *   Day 14+ since last_sign_in → Exit survey (only if 3 nudges sent + no exit survey yet)
 *
 * No reset on sign-in. If a user receives nudge 1, signs back in, then lapses again
 * for 3+ days, the cron will NOT re-send nudge 1 — it will wait for the next absence
 * gap that satisfies the day threshold for nudge 2 (6+ days). The progression is
 * one-way: a customer hears each message at most once.
 */

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

const NUDGE_1_DAYS = 3;
const NUDGE_2_DAYS = 6;
const NUDGE_3_DAYS = 9;
const EXIT_SURVEY_DAYS = 14;

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

    const { data: enrollments, error: enrollError } = await supabase
      .from("program_enrollments")
      .select("id, client_id, programs(name)")
      .eq("status", "active");

    if (enrollError) {
      console.error("Error fetching enrollments:", enrollError);
      return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ emailed: [], count: 0 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mindcraft.ing";
    const exitSurveyUrl = process.env.EXIT_SURVEY_URL || `${appUrl}/feedback/exit`;
    const now = Date.now();

    const results: Array<{
      userId: string;
      email: string;
      daysSinceLastLogin: number;
      programName: string;
      emailType: string;
    }> = [];

    for (const enrollment of enrollments) {
      // ── 1. Get user's auth row to read last_sign_in_at ──
      const { data: { user } } = await supabase.auth.admin.getUserById(enrollment.client_id);
      if (!user?.email || !user?.last_sign_in_at) continue;

      const lastSignInAt = new Date(user.last_sign_in_at).getTime();
      const daysSinceLastLogin = Math.floor((now - lastSignInAt) / (1000 * 60 * 60 * 24));

      // Skip if active in last 3 days
      if (daysSinceLastLogin < NUDGE_1_DAYS) continue;

      // ── 2. Email preferences ──
      const { data: prefs } = await supabase
        .from("consent_settings")
        .select("inactive_reminders")
        .eq("client_id", enrollment.client_id)
        .single();
      if (prefs && prefs.inactive_reminders === false) continue;

      // ── 3. Count nudges sent for this enrollment EVER ──
      // No reset on sign-in: each nudge fires at most once per enrollment lifetime.
      // If a user signs in and lapses again, the next nudge in the sequence fires —
      // not nudge 1 again.
      const { count: totalNudgesSent } = await supabase
        .from("email_events")
        .select("id", { count: "exact", head: true })
        .eq("enrollment_id", enrollment.id)
        .eq("event_type", "inactive_reminder");

      const { count: totalExitSurveys } = await supabase
        .from("email_events")
        .select("id", { count: "exact", head: true })
        .eq("enrollment_id", enrollment.id)
        .eq("event_type", "exit_survey");

      const sentCount = totalNudgesSent || 0;
      const exitSent = (totalExitSurveys || 0) > 0;

      // ── 4. Decide which email to send ──
      let emailType: "nudge_1" | "nudge_2" | "nudge_3" | "exit_survey" | null = null;

      if (daysSinceLastLogin >= EXIT_SURVEY_DAYS && sentCount >= 3 && !exitSent) {
        emailType = "exit_survey";
      } else if (daysSinceLastLogin >= NUDGE_3_DAYS && sentCount === 2) {
        emailType = "nudge_3";
      } else if (daysSinceLastLogin >= NUDGE_2_DAYS && sentCount === 1) {
        emailType = "nudge_2";
      } else if (daysSinceLastLogin >= NUDGE_1_DAYS && sentCount === 0) {
        emailType = "nudge_1";
      }

      if (!emailType) continue;

      const programName = (enrollment.programs as unknown as { name: string })?.name || "Mindcraft";

      results.push({
        userId: enrollment.client_id,
        email: user.email,
        daysSinceLastLogin,
        programName,
        emailType,
      });

      if (dryRun) continue;

      // ── 5. Send the email ──
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        console.warn("RESEND_API_KEY not set, skipping emails");
        continue;
      }

      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      try {
        if (emailType === "nudge_1") {
          await resend.emails.send({
            from: reEngageNudgeFrom,
            to: user.email,
            subject: reEngageNudge1Subject(),
            html: reEngageNudge1Html({ appUrl }),
          });
        } else if (emailType === "nudge_2") {
          await resend.emails.send({
            from: reEngageNudgeFrom,
            to: user.email,
            subject: reEngageNudge2Subject(),
            html: reEngageNudge2Html({ appUrl }),
          });
        } else if (emailType === "nudge_3") {
          await resend.emails.send({
            from: reEngageNudgeFrom,
            to: user.email,
            subject: reEngageNudge3Subject(),
            html: reEngageNudge3Html({ appUrl }),
          });
        } else if (emailType === "exit_survey") {
          await resend.emails.send({
            from: reEngageExitSurveyFrom,
            to: user.email,
            subject: reEngageExitSurveySubject(),
            html: reEngageExitSurveyHtml({ appUrl, exitSurveyUrl }),
          });
        }
      } catch (sendErr) {
        console.error(`[re-engage] send failed for ${user.email}:`, sendErr);
        continue;
      }

      // ── 6. Log the event for cadence tracking ──
      const eventType = emailType === "exit_survey" ? "exit_survey" : "inactive_reminder";
      await supabase.from("email_events").insert({
        user_id: enrollment.client_id,
        event_type: eventType,
        enrollment_id: enrollment.id,
        resend_email_id: `outbound_${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
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
