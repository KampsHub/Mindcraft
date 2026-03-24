import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { evaluateOutput, generateSummary, type OutputToEval } from "@/lib/quality-eval";

/**
 * Weekly Quality Audit — triggered by Vercel Cron every Monday at 9 AM PT.
 * Can also be triggered manually via POST with ?manual=true.
 *
 * 1. Pulls up to 20 AI outputs from the past week
 * 2. Prioritizes flagged + low-rated outputs
 * 3. Evaluates each using Claude
 * 4. Saves results to quality_audits table
 * 5. Emails a summary report
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for automated runs
  const authHeader = request.headers.get("authorization");
  const isManual = request.nextUrl.searchParams.get("manual") === "true";

  if (!isManual && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    const coachEmail = process.env.COACH_EMAIL || "stefanie@allmindsondeck.org";

    if (!apiKey) {
      return NextResponse.json({ error: "CLAUDE_API_KEY not set" }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const anthropic = new Anthropic({ apiKey });

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Monday of this week (for audit_week field)
    const monday = new Date(now);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const auditWeek = monday.toISOString().split("T")[0];

    // ── 1. Collect outputs to evaluate ──
    const outputsToEval: OutputToEval[] = [];

    // 1a. Flagged outputs first (highest priority)
    const { data: flags } = await supabase
      .from("quality_flags")
      .select("daily_session_id, output_type, framework_name")
      .gte("created_at", sevenDaysAgo.toISOString())
      .limit(5);

    // 1b. Low-rated exercises
    const { data: lowRated } = await supabase
      .from("exercise_completions")
      .select("daily_session_id, framework_name, custom_framing, star_rating")
      .gte("completed_at", sevenDaysAgo.toISOString())
      .lte("star_rating", 2)
      .order("star_rating", { ascending: true })
      .limit(5);

    // 1c. Random sample of recent sessions (fill remaining slots)
    const { data: recentSessions } = await supabase
      .from("daily_sessions")
      .select("id, enrollment_id, day_number, step_1_themes, step_3_analysis, step_5_summary")
      .gte("started_at", sevenDaysAgo.toISOString())
      .not("completed_at", "is", null)
      .order("started_at", { ascending: false })
      .limit(15);

    // Collect flagged session outputs
    if (flags) {
      for (const flag of flags) {
        if (!flag.daily_session_id) continue;
        const { data: session } = await supabase
          .from("daily_sessions")
          .select("id, enrollment_id, day_number, step_1_themes, step_3_analysis, step_5_summary")
          .eq("id", flag.daily_session_id)
          .single();

        if (session) {
          const content = getOutputContent(session, flag.output_type);
          if (content) {
            outputsToEval.push({
              output_type: flag.output_type,
              framework_name: flag.framework_name || undefined,
              content,
              day_number: session.day_number,
              enrollment_id: session.enrollment_id,
              daily_session_id: session.id,
            });
          }
        }
      }
    }

    // Collect low-rated exercise outputs
    if (lowRated) {
      for (const ex of lowRated) {
        if (ex.custom_framing && outputsToEval.length < 20) {
          outputsToEval.push({
            output_type: "exercise",
            framework_name: ex.framework_name,
            content: ex.custom_framing,
            daily_session_id: ex.daily_session_id,
          });
        }
      }
    }

    // Fill remaining with session outputs
    if (recentSessions) {
      for (const session of recentSessions) {
        if (outputsToEval.length >= 20) break;

        // Evaluate themes
        if (session.step_1_themes && outputsToEval.length < 20) {
          const themes = session.step_1_themes;
          const content = typeof themes === "string" ? themes : JSON.stringify(themes);
          if (content.length > 50) {
            outputsToEval.push({
              output_type: "themes",
              content,
              day_number: session.day_number,
              enrollment_id: session.enrollment_id,
              daily_session_id: session.id,
            });
          }
        }

        // Evaluate analysis
        if (session.step_3_analysis && outputsToEval.length < 20) {
          const analysis = session.step_3_analysis;
          const content = typeof analysis === "string" ? analysis : JSON.stringify(analysis);
          if (content.length > 50) {
            outputsToEval.push({
              output_type: "reflection",
              content,
              day_number: session.day_number,
              enrollment_id: session.enrollment_id,
              daily_session_id: session.id,
            });
          }
        }

        // Evaluate summary
        if (session.step_5_summary && outputsToEval.length < 20) {
          const summary = session.step_5_summary;
          const content = typeof summary === "string" ? summary : JSON.stringify(summary);
          if (content.length > 50) {
            outputsToEval.push({
              output_type: "summary",
              content,
              day_number: session.day_number,
              enrollment_id: session.enrollment_id,
              daily_session_id: session.id,
            });
          }
        }
      }
    }

    if (outputsToEval.length === 0) {
      return NextResponse.json({ message: "No outputs to evaluate this week", count: 0 });
    }

    // ── 2. Evaluate each output ──
    const evalResults: Array<{
      output: OutputToEval;
      result: Awaited<ReturnType<typeof evaluateOutput>>;
    }> = [];

    for (const output of outputsToEval) {
      try {
        const result = await evaluateOutput(anthropic, output);
        evalResults.push({ output, result });

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Eval failed for ${output.output_type}:`, err);
      }
    }

    // ── 3. Save to quality_audits table ──
    for (const { output, result } of evalResults) {
      await supabase.from("quality_audits").insert({
        audit_week: auditWeek,
        daily_session_id: output.daily_session_id || null,
        enrollment_id: output.enrollment_id || null,
        output_type: output.output_type,
        framework_name: output.framework_name || null,
        voice_authenticity: result.scores.voice_authenticity,
        addresses_real_issue: result.scores.addresses_real_issue,
        client_helpfulness: result.scores.client_helpfulness,
        pattern_recognition: result.scores.pattern_recognition,
        appropriate_boundaries: result.scores.appropriate_boundaries,
        theme_accuracy: result.scores.theme_accuracy,
        total_score: result.total,
        feedback: result.feedback,
        flags: result.flags,
        output_snippet: output.content.slice(0, 500),
      });
    }

    // ── 4. Generate summary ──
    const allResults = evalResults.map((e) => e.result);
    const summary = generateSummary(allResults);

    // ── 5. Get user flag summary for the email ──
    const { count: userFlagsCount } = await supabase
      .from("quality_flags")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    // ── 6. Send email report ──
    if (resendKey) {
      const resend = new Resend(resendKey);

      const dimRows = Object.entries(summary.dimensionAverages)
        .map(([dim, avg]) => {
          const bar = "█".repeat(Math.round(avg));
          const empty = "░".repeat(5 - Math.round(avg));
          return `<tr><td style="padding:4px 12px;font-size:14px;color:#B5ADB6;">${dim.replace(/_/g, " ")}</td><td style="padding:4px 12px;font-size:14px;font-weight:600;color:#E4DDE2;">${avg}</td><td style="padding:4px 12px;font-family:monospace;color:#E09585;">${bar}${empty}</td></tr>`;
        })
        .join("");

      const flagRows = Object.entries(summary.flagFrequency)
        .sort(([, a], [, b]) => b - a)
        .map(([flag, count]) => `<tr><td style="padding:3px 12px;font-size:14px;color:#B5ADB6;">${flag.replace(/_/g, " ")}</td><td style="padding:3px 12px;font-size:14px;font-weight:600;color:#D25858;">${count}</td></tr>`)
        .join("");

      const worstRows = summary.bottomOutputs
        .slice(0, 3)
        .map((r) => `<li style="margin-bottom:8px;"><strong>${r.total}/30</strong> — ${r.feedback} ${r.flags.length ? `<span style="color:#D25858;">[${r.flags.join(", ")}]</span>` : ""}</li>`)
        .join("");

      const scoreColor = summary.avgTotal >= 24 ? "#6AB282" : summary.avgTotal >= 18 ? "#D6B65D" : "#D25858";

      await resend.emails.send({
        from: "Mindcraft Quality <noreply@allmindsondeck.org>",
        to: coachEmail,
        subject: `Weekly Quality Audit — ${Math.round(summary.avgTotal)}/30 avg (${evalResults.length} outputs)`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#E4DDE2;background:#18181C;">
            <h1 style="font-size:20px;font-weight:700;margin:0 0 4px 0;">Mindcraft Quality Audit</h1>
            <p style="font-size:13px;color:#99929B;margin:0 0 28px 0;">Week of ${auditWeek} &middot; ${evalResults.length} outputs evaluated</p>

            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;text-align:center;">
              <p style="font-size:48px;font-weight:700;color:${scoreColor};margin:0 0 4px 0;">${Math.round(summary.avgTotal * 10) / 10}</p>
              <p style="font-size:13px;color:#99929B;margin:0;">average score (out of 30)</p>
            </div>

            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;">
              <h2 style="font-size:13px;font-weight:700;color:#99929B;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.06em;">Dimension Breakdown</h2>
              <table style="width:100%;border-collapse:collapse;">${dimRows}</table>
            </div>

            ${Object.keys(summary.flagFrequency).length > 0 ? `
            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;">
              <h2 style="font-size:13px;font-weight:700;color:#99929B;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.06em;">Flags</h2>
              <table style="width:100%;border-collapse:collapse;">${flagRows}</table>
            </div>
            ` : ""}

            ${worstRows ? `
            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;">
              <h2 style="font-size:13px;font-weight:700;color:#99929B;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.06em;">Lowest Scoring Outputs</h2>
              <ul style="margin:0;padding:0 0 0 16px;color:#B5ADB6;font-size:14px;line-height:1.7;">${worstRows}</ul>
            </div>
            ` : ""}

            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;">
              <h2 style="font-size:13px;font-weight:700;color:#99929B;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.06em;">User Flags This Week</h2>
              <p style="font-size:28px;font-weight:700;color:${(userFlagsCount || 0) > 0 ? "#D25858" : "#6AB282"};margin:0;">${userFlagsCount || 0}</p>
            </div>

            <p style="font-size:12px;color:#99929B;text-align:center;margin-top:28px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/coach" style="color:#E09585;">View full dashboard &rarr;</a>
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      evaluated: evalResults.length,
      avgScore: Math.round(summary.avgTotal * 10) / 10,
      userFlags: userFlagsCount || 0,
      flagFrequency: summary.flagFrequency,
    });
  } catch (error: unknown) {
    console.error("Quality audit error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Extract content from a daily session based on output type.
 */
function getOutputContent(
  session: { step_1_themes: unknown; step_3_analysis: unknown; step_5_summary: unknown },
  outputType: string
): string | null {
  let raw: unknown;

  switch (outputType) {
    case "themes":
      raw = session.step_1_themes;
      break;
    case "reflection":
    case "exercise":
    case "coaching_question":
    case "reframe":
      raw = session.step_3_analysis;
      break;
    case "summary":
      raw = session.step_5_summary;
      break;
    default:
      raw = session.step_3_analysis;
  }

  if (!raw) return null;
  return typeof raw === "string" ? raw : JSON.stringify(raw);
}
