import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/api-validation";

/**
 * Generate the long-form final reflection for a completed enrollment.
 *
 * Called fire-and-forget from /api/cron/check-completions. Auth'd with the
 * same CRON_SECRET. Pulls journal entries, exercise completions, and weekly
 * summaries, then asks Claude for a warm, specific 30-day reflection.
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enrollment_id, reason } = await request.json();
  if (!enrollment_id) {
    return NextResponse.json({ error: "Missing enrollment_id" }, { status: 400 });
  }
  const closedEarly = reason === "closed_early";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data: enrollment, error: enrollErr } = await supabase
      .from("program_enrollments")
      .select("id, client_id, started_at, programs(slug, name)")
      .eq("id", enrollment_id)
      .single();
    if (enrollErr || !enrollment) throw enrollErr || new Error("Enrollment not found");

    const clientId = enrollment.client_id as string;
    const program = enrollment.programs as unknown as { slug: string; name: string };

    // Pull the user's work over the 30 days. Keep this bounded — don't dump
    // 30 days of raw journals into the prompt.
    const [{ data: journals }, { data: exercises }, { data: weekly }] = await Promise.all([
      // Journal-ish content lives in `entries`, not `journal_entries`
      supabase.from("entries")
        .select("date, type, content")
        .eq("client_id", clientId)
        .order("date", { ascending: true })
        .limit(60),
      supabase.from("exercise_completions")
        .select("framework_name, modality, responses, completed_at")
        .eq("client_id", clientId)
        .order("completed_at", { ascending: true })
        .limit(60),
      supabase.from("weekly_reviews")
        .select("week_number, approved_summary, draft_summary, created_at")
        .eq("enrollment_id", enrollmentId)
        .order("week_number", { ascending: true })
        .limit(6),
    ]);

    const journalSnippets = (journals ?? [])
      .map((j) => `[${(j.date as string)?.slice(0, 10)} · ${j.type}] ${(j.content as string)?.slice(0, 400)}`)
      .join("\n\n");

    const exerciseSnippets = (exercises ?? [])
      .map((e) => `${e.framework_name ?? "Exercise"} (${e.modality ?? "?"}): ${JSON.stringify(e.responses).slice(0, 300)}`)
      .join("\n");

    const weeklySnippets = (weekly ?? [])
      .map((w) => `Week ${w.week_number}: ${((w.approved_summary || w.draft_summary) as string)?.slice(0, 500)}`)
      .join("\n\n");

    const dayCount = (enrollment as unknown as { current_day?: number }).current_day ?? 30;
    const contextLine = closedEarly
      ? `This person chose to close the Mindcraft ${program.name} program early, on day ${dayCount}. Honor that choice — closing early is not quitting, it's a decision about what they need next. Don't pretend it was a full 30 days, and don't project guilt. Work only with what they actually produced.`
      : `This person just finished the full 30-day Mindcraft ${program.name} program. Your job is to honor the arc of their work, name what actually shifted, and point gently toward what's next.`;

    const prompt = `You are writing a warm, specific reflection for someone. ${contextLine}

Rules:
- Write TO them, not ABOUT them. Use "you."
- Quote their actual words where possible — never fabricate quotes.
- Specific over general. "On day 12 you named the pattern of…" beats "You worked through difficult emotions."
- Warm but not sweet. No clinical labels, no motivational filler.
- 6–10 short paragraphs. Conversational tone.
- End with one concrete suggestion for the next 30 days — not a pep talk.

Structure:
1. Open with what they walked in with (from early journal entries).
2. Trace the arc — what shifted over the weeks.
3. Name 2-3 specific patterns or reframes they surfaced.
4. Acknowledge what's still hard or unresolved — don't pretend everything is fixed.
5. One concrete next step.

Here is their work:

=== JOURNAL ENTRIES (chronological) ===
${journalSnippets || "(no journal entries found)"}

=== EXERCISE RESPONSES ===
${exerciseSnippets || "(no exercises found)"}

=== WEEKLY SUMMARIES ===
${weeklySnippets || "(no weekly summaries found)"}

Now write the reflection.`;

    const anthropic = getAnthropicClient();
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = msg.content
      .filter((c): c is { type: "text"; text: string } => c.type === "text")
      .map((c) => c.text)
      .join("\n\n")
      .trim();

    await supabase
      .from("final_insights")
      .update({
        content,
        status: "ready",
        generated_at: new Date().toISOString(),
      })
      .eq("enrollment_id", enrollment_id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("final insight generation failed", msg);
    await supabase
      .from("final_insights")
      .update({ status: "failed" })
      .eq("enrollment_id", enrollment_id);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
