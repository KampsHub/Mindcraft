import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SUMMARY_SYSTEM_PROMPT = `You are generating a coaching summary for a client to review before sharing with their coach. You receive: daily session summaries, theme tags, goals, exercise completions, and weekly insights for a specific period.

Produce a structured summary in valid JSON (no markdown, no code fences):

{
  "sections": [
    {
      "id": "themes",
      "title": "Key Themes",
      "content": "2-3 sentences about the dominant themes this period."
    },
    {
      "id": "goals_progress",
      "title": "Goal Progress",
      "content": "1-2 sentences per active goal about observable progress or sticking points."
    },
    {
      "id": "exercises",
      "title": "Exercise Engagement",
      "content": "Summary of exercise completion, modalities engaged, and which exercises generated the most response."
    },
    {
      "id": "patterns",
      "title": "Patterns Observed",
      "content": "Multi-day patterns, recurring themes, or shifts. Use the client's words when possible."
    },
    {
      "id": "weekly_insights",
      "title": "Weekly Insights",
      "content": "Key breakthroughs, sticking points, or connections from across the period."
    }
  ]
}

## Guidelines
1. Be factual and observation-based. No motivational language.
2. Use the client's actual words when quoting (short phrases).
3. Each section should be 2-5 sentences maximum.
4. This summary will be reviewed by the client before sharing — be honest but respectful.
5. Focus on what would be useful for a coach to know.`;

export async function POST(request: Request) {
  try {
    const { enrollmentId, periodStart, periodEnd } = await request.json();

    if (!enrollmentId) {
      return NextResponse.json({ error: "Missing enrollmentId" }, { status: 400 });
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

    // Verify enrollment belongs to user
    const { data: enrollment } = await supabase
      .from("program_enrollments")
      .select("*, programs(*)")
      .eq("id", enrollmentId)
      .eq("client_id", user.id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // Calculate period (default: last 7 days)
    const end = periodEnd || new Date().toISOString().split("T")[0];
    const start = periodStart || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d.toISOString().split("T")[0];
    })();

    // Fetch data for the period
    const [sessionsRes, entriesRes, goalsRes, exercisesRes] = await Promise.all([
      supabase
        .from("daily_sessions")
        .select("day_number, step_5_summary, day_rating, completed_at")
        .eq("enrollment_id", enrollmentId)
        .gte("created_at", start)
        .lte("created_at", end + "T23:59:59")
        .order("day_number"),
      supabase
        .from("entries")
        .select("content, theme_tags, type, date")
        .eq("client_id", user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date"),
      supabase
        .from("client_goals")
        .select("goal_text, status")
        .eq("enrollment_id", enrollmentId),
      supabase
        .from("exercise_completions")
        .select("framework_name, exercise_type, modality, responses, star_rating")
        .eq("enrollment_id", enrollmentId)
        .gte("created_at", start)
        .lte("created_at", end + "T23:59:59"),
    ]);

    // Build context for Claude
    const context = {
      program: enrollment.programs?.name,
      period: `${start} to ${end}`,
      sessions: sessionsRes.data || [],
      entries: (entriesRes.data || []).map((e: { content: string; theme_tags: string[]; type: string; date: string }) => ({
        date: e.date,
        type: e.type,
        themes: e.theme_tags,
        content: e.content.substring(0, 500),
      })),
      goals: goalsRes.data || [],
      exercises: (exercisesRes.data || []).map((e: { framework_name: string; exercise_type: string; modality: string; star_rating: number }) => ({
        framework: e.framework_name,
        type: e.exercise_type,
        modality: e.modality,
        rating: e.star_rating,
      })),
    };

    // Generate summary with Claude
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: SUMMARY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify(context) }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    let summary;
    try {
      summary = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Failed to parse summary" }, { status: 500 });
    }

    // Store in shared_summaries
    const { data: row, error: insertError } = await supabase
      .from("shared_summaries")
      .upsert({
        client_id: user.id,
        enrollment_id: enrollmentId,
        generated_summary: summary,
        status: "generated",
        period_start: start,
        period_end: end,
        generated_at: new Date().toISOString(),
      }, { onConflict: "client_id,enrollment_id,period_start,period_end" })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ summary: row });
  } catch (err) {
    console.error("Coach sharing generate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
