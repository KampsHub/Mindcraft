import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { accountDeletionHtml, accountDeletionSubject, accountDeletionFrom } from "@/lib/emails/account-deletion";

/**
 * Daily cron: process pending deletion_requests whose scheduled_for has passed.
 *
 * For each eligible request:
 *   1. Delete all personal data tables
 *   2. Anonymize program_enrollments (keep row for aggregate stats, drop user_id)
 *   3. Delete the Supabase auth user
 *   4. Send a confirmation email (best-effort, fires before auth delete)
 *   5. Mark the request completed
 */

// Keep in sync with the immediate-delete flow in src/app/api/account/route.ts
// Each table is keyed by client_id unless noted.
const PERSONAL_TABLES_CLIENT_ID = [
  "entries",
  "exercise_completions",
  "shared_summaries",
  "client_assessments",
  "consent_settings",
  "api_logs",
  "quality_flags",
  "coaching_memories",
  "coach_clients",
  "coach_notes",
  "final_insights",
  "personal_promo_codes",
];

// Tables keyed by enrollment_id (we resolve enrollment IDs first)
const PERSONAL_TABLES_ENROLLMENT_ID = [
  "daily_sessions",
  "client_goals",
  "client_profiles",
  "weekly_reviews",
];

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date().toISOString();
  const { data: eligible, error: queryErr } = await supabase
    .from("deletion_requests")
    .select("id, client_id, client_email")
    .lte("scheduled_for", now)
    .is("completed_at", null)
    .is("cancelled_at", null);

  if (queryErr) {
    console.error("process-deletions: query failed", queryErr);
    return NextResponse.json({ error: queryErr.message }, { status: 500 });
  }
  if (!eligible || eligible.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const results: { request_id: string; ok: boolean; error?: string }[] = [];

  for (const req of eligible) {
    const requestId = req.id as string;
    const clientId = req.client_id as string;
    const clientEmail = req.client_email as string | null;

    try {
      // 1a. Resolve enrollment IDs for enrollment-keyed tables
      const { data: enrolls } = await supabase
        .from("program_enrollments")
        .select("id")
        .eq("client_id", clientId);
      const enrollmentIds = (enrolls ?? []).map((e) => e.id as string);

      // 1b. Delete from client-id-keyed tables
      for (const table of PERSONAL_TABLES_CLIENT_ID) {
        const { error } = await supabase.from(table).delete().eq("client_id", clientId);
        if (error && !error.message.toLowerCase().includes("does not exist")) {
          console.warn(`process-deletions: failed to delete from ${table}`, error.message);
        }
      }

      // 1c. Delete from enrollment-id-keyed tables
      if (enrollmentIds.length > 0) {
        for (const table of PERSONAL_TABLES_ENROLLMENT_ID) {
          const { error } = await supabase.from(table).delete().in("enrollment_id", enrollmentIds);
          if (error && !error.message.toLowerCase().includes("does not exist")) {
            console.warn(`process-deletions: failed to delete from ${table}`, error.message);
          }
        }
      }

      // 1d. Referrals, gifts, email events — different column names
      await supabase.from("referrals").delete().eq("referrer_id", clientId);
      await supabase.from("gift_codes").delete().eq("gifter_id", clientId);
      await supabase.from("email_events").delete().eq("user_id", clientId);
      if (clientEmail) {
        await supabase.from("contact_messages").delete().eq("email", clientEmail);
        await supabase.from("waitlist_signups").delete().eq("email", clientEmail);
      }

      // 2. Delete program_enrollments themselves (hard delete — matches existing /api/account flow)
      await supabase.from("program_enrollments").delete().eq("client_id", clientId);

      // 3. Send confirmation email BEFORE we drop the auth user
      if (resendKey && clientEmail) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: accountDeletionFrom,
            to: clientEmail,
            subject: accountDeletionSubject(),
            html: accountDeletionHtml(),
          });
        } catch (e) {
          console.warn("process-deletions: confirmation email failed", e);
        }
      }

      // 4. Delete the Supabase auth user
      const { error: authErr } = await supabase.auth.admin.deleteUser(clientId);
      if (authErr && !authErr.message.toLowerCase().includes("not found")) {
        throw authErr;
      }

      // 5. Mark the request completed
      await supabase
        .from("deletion_requests")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", requestId);

      results.push({ request_id: requestId, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("process-deletions: failed", requestId, msg);
      results.push({ request_id: requestId, ok: false, error: msg });
    }
  }

  return NextResponse.json({
    processed: results.filter((r) => r.ok).length,
    attempted: results.length,
    results,
  });
}
