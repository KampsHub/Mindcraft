import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const ALLOWED_TAGS = ["clarity", "confidence", "hard_conversations", "starting_new"];

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const body: string = (payload?.body ?? "").toString().trim();
    const submitterName: string | null = payload?.submitterName?.toString().trim() || null;
    const submitterEmail: string | null = payload?.submitterEmail?.toString().trim() || null;
    const attribution: string | null = payload?.attribution?.toString().trim() || null;
    const consentGiven: boolean = Boolean(payload?.consentGiven);
    const rawTags: unknown = payload?.outcomeTags;
    const outcomeTags: string[] = Array.isArray(rawTags)
      ? rawTags.filter((t): t is string => typeof t === "string" && ALLOWED_TAGS.includes(t))
      : [];

    if (body.length < 30) {
      return NextResponse.json({ error: "Please share at least a couple of sentences (30+ characters)." }, { status: 400 });
    }
    if (!consentGiven) {
      return NextResponse.json({ error: "Consent is required to publish a testimonial." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase.from("testimonials").insert({
      user_id: user?.user?.id ?? null,
      submitter_name: submitterName,
      submitter_email: submitterEmail,
      attribution,
      kind: "text",
      body,
      outcome_tags: outcomeTags,
      status: "pending",
      consent_given_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[testimonials/direct] insert failed", error);
      return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[testimonials/direct] unexpected", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
