import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateBody, enneagramAnalyzeSchema, getAnthropicClient, getModelForTier } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";

const ANALYZE_PROMPT = `You are an expert Enneagram analyst. You will receive one or two IEQ9 Enneagram assessment documents (PDF or images). Extract the following structured data:

1. **Type**: The core Enneagram type (1-9)
2. **Wing**: The dominant wing (the adjacent type number)
3. **Tritype**: The three-fix tritype (e.g., "469", "358")
4. **Centers of Intelligence**: Percentages for Action (Body/Gut), Feeling (Heart), and Thinking (Head) centers. These should sum to 100.
5. **Key Development Areas**: Extract 4-6 specific, actionable development areas based on the assessment results. Reference the person's specific scores, patterns, and growth edges — not generic Enneagram descriptions.
6. **Integration Plan**: Write a 3-4 paragraph personalized integration plan that:
   - Names their dominant center and how it shows up under stress
   - Identifies their blind spots based on their lowest center
   - Connects their type + wing + tritype to specific growth patterns
   - Suggests concrete daily practices aligned with their development areas

Return ONLY valid JSON (no markdown, no code fences):
{
  "type": "4",
  "wing": "5",
  "tritype": "469",
  "centers": { "action": 25, "feeling": 45, "thinking": 30 },
  "key_development_areas": ["Area 1...", "Area 2...", "Area 3...", "Area 4..."],
  "integration_plan": "Full integration plan text..."
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateBody(enneagramAnalyzeSchema, body);
    if (!validation.success) return validation.response;
    const { clientId, fileUrls } = validation.data;

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

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    // If clientId provided, verify caller is the coach
    const targetClientId = clientId || user.id;
    if (clientId && clientId !== user.id) {
      const coachEmail = process.env.COACH_EMAIL || "";
      if (user.email !== coachEmail) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
    }

    // Rate limit
    const rateLimitResponse = checkRateLimit(user.id, "ai");
    if (rateLimitResponse) return rateLimitResponse;

    // Download files and prepare for Claude
    const contentBlocks: Array<{ type: string; source: { type: string; media_type: string; data: string } }> = [];

    // Use admin client to read storage (bypasses RLS for coach uploads)
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    for (const url of fileUrls) {
      // Extract path from public URL
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/enneagram-docs\/(.+)/);
      if (!pathMatch) continue;

      const filePath = decodeURIComponent(pathMatch[1]);
      const { data: fileData, error: downloadErr } = await adminSupabase.storage
        .from("enneagram-docs")
        .download(filePath);

      if (downloadErr || !fileData) {
        console.error("File download error:", downloadErr);
        continue;
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      const base64 = buffer.toString("base64");
      const isPdf = filePath.toLowerCase().endsWith(".pdf");

      contentBlocks.push({
        type: isPdf ? "document" : "image",
        source: {
          type: "base64",
          media_type: isPdf ? "application/pdf" : (filePath.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg"),
          data: base64,
        },
      });
    }

    if (contentBlocks.length === 0) {
      return NextResponse.json({ error: "No valid files to analyze" }, { status: 400 });
    }

    // Call Claude
    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    const message = await anthropic.messages.create({
      model: getModelForTier("deep"),
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: [
          ...contentBlocks as Parameters<typeof anthropic.messages.create>[0]["messages"][0]["content"] extends string ? never : any,
          { type: "text", text: ANALYZE_PROMPT },
        ],
      }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from analysis" }, { status: 500 });
    }

    const analysis = JSON.parse(textBlock.text);

    // Build document metadata
    const documents = fileUrls.map((url) => {
      const filename = decodeURIComponent(url.split("/").pop() || "document");
      // Strip timestamp prefix
      const cleanName = filename.replace(/^\d+-/, "");
      return { url, filename: cleanName, uploaded_at: new Date().toISOString() };
    });

    const fullData = {
      ...analysis,
      documents,
      analyzed_at: new Date().toISOString(),
    };

    // Upsert to client_assessments
    const { error: saveError } = await adminSupabase
      .from("client_assessments")
      .upsert({
        client_id: targetClientId,
        type: "enneagram",
        data: fullData,
        updated_at: new Date().toISOString(),
      }, { onConflict: "client_id,type" });

    if (saveError) {
      console.error("Failed to save enneagram analysis:", saveError);
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
    }

    return NextResponse.json({
      analysis: fullData,
      usage: message.usage,
    });
  } catch (error: unknown) {
    console.error("Error in /api/enneagram-analyze:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
