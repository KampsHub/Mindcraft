import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const ALLOWED_TAGS = ["clarity", "confidence", "hard_conversations", "starting_new"];

function isValidVideoUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const allowed = [
      "loom.com",
      "www.loom.com",
      "youtube.com",
      "www.youtube.com",
      "youtu.be",
      "vimeo.com",
      "www.vimeo.com",
      "player.vimeo.com",
    ];
    return allowed.some((host) => u.hostname === host || u.hostname.endsWith("." + host));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const videoUrl: string = (payload?.videoUrl ?? "").toString().trim();
    const body: string = (payload?.body ?? "").toString().trim();
    const submitterName: string | null = payload?.submitterName?.toString().trim() || null;
    const submitterEmail: string | null = payload?.submitterEmail?.toString().trim() || null;
    const attribution: string | null = payload?.attribution?.toString().trim() || null;
    const consentGiven: boolean = Boolean(payload?.consentGiven);
    const rawTags: unknown = payload?.outcomeTags;
    const outcomeTags: string[] = Array.isArray(rawTags)
      ? rawTags.filter((t): t is string => typeof t === "string" && ALLOWED_TAGS.includes(t))
      : [];

    if (!isValidVideoUrl(videoUrl)) {
      return NextResponse.json({ error: "Paste a Loom, YouTube, or Vimeo URL." }, { status: 400 });
    }
    if (body.length < 30) {
      return NextResponse.json({ error: "Please write a short caption (30+ characters) so we have context for the video." }, { status: 400 });
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
      kind: "video_url",
      body,
      video_url: videoUrl,
      outcome_tags: outcomeTags,
      status: "pending",
      consent_given_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[testimonials/video] insert failed", error);
      return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[testimonials/video] unexpected", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
