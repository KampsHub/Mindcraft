import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const ALLOWED_TAGS = ["clarity", "confidence", "hard_conversations", "starting_new"];

function isValidSocialUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const allowed = [
      "linkedin.com",
      "www.linkedin.com",
      "x.com",
      "twitter.com",
      "www.twitter.com",
      "instagram.com",
      "www.instagram.com",
    ];
    return allowed.some((host) => u.hostname === host || u.hostname.endsWith("." + host));
  } catch {
    return false;
  }
}

async function fetchTwitterEmbed(url: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`,
      { headers: { "user-agent": "Mindcraft/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.html === "string" ? data.html : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const socialUrl: string = (payload?.socialUrl ?? "").toString().trim();
    const body: string = (payload?.body ?? "").toString().trim();
    const submitterName: string | null = payload?.submitterName?.toString().trim() || null;
    const submitterEmail: string | null = payload?.submitterEmail?.toString().trim() || null;
    const attribution: string | null = payload?.attribution?.toString().trim() || null;
    const showLinkedinLink: boolean = Boolean(payload?.showLinkedinLink);
    const consentGiven: boolean = Boolean(payload?.consentGiven);
    const rawTags: unknown = payload?.outcomeTags;
    const outcomeTags: string[] = Array.isArray(rawTags)
      ? rawTags.filter((t): t is string => typeof t === "string" && ALLOWED_TAGS.includes(t))
      : [];

    if (!isValidSocialUrl(socialUrl)) {
      return NextResponse.json({ error: "Paste a LinkedIn, X, or Instagram URL." }, { status: 400 });
    }
    if (body.length < 30) {
      return NextResponse.json({ error: "Please also paste the text of the post (30+ characters) so we have a fallback if the embed breaks." }, { status: 400 });
    }
    if (!consentGiven) {
      return NextResponse.json({ error: "Consent is required to publish a testimonial." }, { status: 400 });
    }

    const isTwitter = /twitter\.com|x\.com/.test(socialUrl);
    const embedHtml = isTwitter ? await fetchTwitterEmbed(socialUrl) : null;

    const supabase = await createServerSupabaseClient();
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase.from("testimonials").insert({
      user_id: user?.user?.id ?? null,
      submitter_name: submitterName,
      submitter_email: submitterEmail,
      attribution,
      kind: "social_url",
      body,
      social_url: socialUrl,
      social_embed_html: embedHtml,
      social_snapshot_text: body,
      show_linkedin_link: showLinkedinLink,
      outcome_tags: outcomeTags,
      status: "pending",
      consent_given_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[testimonials/social] insert failed", error);
      return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[testimonials/social] unexpected", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
