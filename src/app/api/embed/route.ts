import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const { entryId } = await request.json();

    if (!entryId || typeof entryId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'entryId' field." },
        { status: 400 }
      );
    }

    // Authenticate
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
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch the entry (RLS ensures user can only access their own)
    const { data: entry, error: fetchError } = await supabase
      .from("entries")
      .select("id, content, transcript")
      .eq("id", entryId)
      .single();

    if (fetchError || !entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Use content or transcript (for voice entries)
    const textToEmbed = entry.content || entry.transcript;
    if (!textToEmbed) {
      return NextResponse.json(
        { error: "Entry has no content to embed" },
        { status: 400 }
      );
    }

    // Generate embedding via Voyage AI
    const embedding = await generateEmbedding(textToEmbed);

    // Store embedding on the entry
    const { error: updateError } = await supabase
      .from("entries")
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", entryId);

    if (updateError) {
      console.error("Failed to store embedding:", updateError);
      return NextResponse.json(
        { error: "Failed to store embedding" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, dimensions: embedding.length });
  } catch (error: unknown) {
    console.error("Error in /api/embed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
