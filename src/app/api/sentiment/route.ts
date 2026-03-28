import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { analyzeSentiment } from "@/lib/sentiment";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, content } = body;

    if (!content || !sessionId) {
      return NextResponse.json({ error: "Missing content or sessionId" }, { status: 400 });
    }

    const scores = await analyzeSentiment(content);
    if (!scores) {
      return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }

    // Verify the session belongs to this user via enrollment
    const { data: session } = await supabase
      .from("daily_sessions")
      .select("id, enrollment_id, metadata")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Could not find your session. Please refresh the page." }, { status: 404 });
    }

    // Verify ownership through enrollment
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("id", session.enrollment_id)
      .eq("client_id", user.id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Merge sentiment into existing metadata
    const existingMeta = (session.metadata as Record<string, unknown>) || {};
    await supabase
      .from("daily_sessions")
      .update({
        metadata: {
          ...existingMeta,
          sentiment: scores,
          sentiment_analyzed_at: new Date().toISOString(),
        },
      })
      .eq("id", sessionId);

    return NextResponse.json({ sentiment: scores });
  } catch (error) {
    console.error("Sentiment API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
