"use client";

import { useState, useEffect } from "react";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import { trackEvent } from "@/components/GoogleAnalytics";

const display = fonts.display;
const body = fonts.bodyAlt;

type Tab = "text" | "social" | "video";

const OUTCOME_TAGS = [
  { id: "clarity", label: "Clarity" },
  { id: "confidence", label: "Confidence" },
  { id: "hard_conversations", label: "Hard conversations" },
  { id: "starting_new", label: "Starting new" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: body,
  fontSize: 15,
  color: "#18181C",
  backgroundColor: "#fff",
  border: "1px solid rgba(24,24,28,0.15)",
  borderRadius: 10,
  padding: "12px 14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 160,
  resize: "vertical",
  lineHeight: 1.6,
  fontSize: 16,
};

const tabButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: "12px 22px",
  borderRadius: 100,
  border: active ? `1px solid ${colors.coral}` : "1px solid rgba(24,24,28,0.15)",
  backgroundColor: active ? colors.coral : "#fff",
  color: active ? "#fff" : "#18181C",
  fontFamily: display,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
});

export default function SharePage() {
  const [tab, setTab] = useState<Tab>("text");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("share_page_view", {});
  }, []);

  // Shared fields
  const [body_, setBody_] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [attribution, setAttribution] = useState("");
  const [consent, setConsent] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  // Tab-specific
  const [socialUrl, setSocialUrl] = useState("");
  const [showLinkedinLink, setShowLinkedinLink] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  function toggleTag(id: string) {
    setTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const endpointMap: Record<Tab, string> = {
        text: "/api/testimonials/direct",
        social: "/api/testimonials/social",
        video: "/api/testimonials/video",
      };
      const payload: Record<string, unknown> = {
        body: body_,
        submitterName,
        submitterEmail,
        attribution,
        consentGiven: consent,
        outcomeTags: tags,
      };
      if (tab === "social") {
        payload.socialUrl = socialUrl;
        payload.showLinkedinLink = showLinkedinLink;
      }
      if (tab === "video") {
        payload.videoUrl = videoUrl;
      }

      const res = await fetch(endpointMap[tab], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        trackEvent("testimonial_submission_failed", { kind: tab, status: res.status, error_message: data?.error ?? "unknown" });
        setError(data?.error || "Could not save. Please try again.");
        return;
      }
      trackEvent("testimonial_submitted", { kind: tab, has_attribution: attribution.length > 0, tag_count: tags.length });
      setDone(true);
    } catch (err) {
      trackEvent("testimonial_submission_failed", { kind: tab, error_message: err instanceof Error ? err.message : "network" });
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F0EDE6",
        padding: "64px 24px 120px",
        fontFamily: body,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <Logo />
        </div>

        {done ? (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 48,
              textAlign: "center",
              border: "1px solid rgba(24,24,28,0.08)",
            }}
          >
            <h1
              style={{
                fontFamily: display,
                fontSize: 32,
                fontWeight: 700,
                color: "#18181C",
                marginBottom: 12,
              }}
            >
              Thank you.
            </h1>
            <p style={{ fontSize: 16, color: "#4B4B52", lineHeight: 1.7 }}>
              We review each submission before it goes up on the wall. You&rsquo;ll hear back if we have questions.
            </p>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontFamily: display,
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 700,
                color: "#18181C",
                letterSpacing: "-0.02em",
                marginBottom: 16,
                lineHeight: 1.15,
              }}
            >
              Share your story.
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "#4B4B52",
                lineHeight: 1.7,
                marginBottom: 40,
                maxWidth: 560,
              }}
            >
              One month ago you were where someone else is now. Your words help them decide to start.
            </p>

            <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
              <button onClick={() => setTab("text")} style={tabButtonStyle(tab === "text")}>
                Write a quote
              </button>
              <button onClick={() => setTab("social")} style={tabButtonStyle(tab === "social")}>
                Paste a social post
              </button>
              <button onClick={() => setTab("video")} style={tabButtonStyle(tab === "video")}>
                Paste a video link
              </button>
            </div>

            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 32,
                border: "1px solid rgba(24,24,28,0.08)",
              }}
            >
              {tab === "social" && (
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>LinkedIn, X, or Instagram URL</label>
                  <input
                    type="url"
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                    placeholder="https://linkedin.com/posts/..."
                    style={inputStyle}
                  />
                </div>
              )}

              {tab === "video" && (
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Loom, YouTube, or Vimeo URL</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://loom.com/share/..."
                    style={inputStyle}
                  />
                  <p style={{ fontSize: 12, color: "#7a7a80", marginTop: 6 }}>
                    Direct upload coming soon — for now, paste a link.
                  </p>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  {tab === "text" ? "Your quote" : tab === "social" ? "Text of the post (fallback if embed breaks)" : "Short caption"}
                </label>
                <textarea
                  value={body_}
                  onChange={(e) => setBody_(e.target.value)}
                  placeholder={
                    tab === "text"
                      ? "What changed? What was it like before, and what is it like now?"
                      : "Paste the text of the post here."
                  }
                  style={textareaStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>What did this help with? (optional)</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {OUTCOME_TAGS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 100,
                        border: tags.includes(t.id)
                          ? `1px solid ${colors.coral}`
                          : "1px solid rgba(24,24,28,0.15)",
                        backgroundColor: tags.includes(t.id) ? colors.coralWash : "#fff",
                        color: tags.includes(t.id) ? colors.coral : "#4B4B52",
                        fontFamily: body,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>First name + last initial</label>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="e.g. Sarah L."
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email (private)</label>
                  <input
                    type="email"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Role / context (optional, public)</label>
                <input
                  type="text"
                  value={attribution}
                  onChange={(e) => setAttribution(e.target.value)}
                  placeholder="e.g. Product manager at big tech company"
                  style={inputStyle}
                />
              </div>

              {tab === "social" && (
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showLinkedinLink}
                    onChange={(e) => setShowLinkedinLink(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <span style={{ fontSize: 13, color: "#4B4B52", lineHeight: 1.5 }}>
                    Show a &ldquo;View original ↗&rdquo; link to the post on the public wall.
                  </span>
                </label>
              )}

              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span style={{ fontSize: 13, color: "#4B4B52", lineHeight: 1.5 }}>
                  I consent to Mindcraft publishing this on its public wall, using the name and context I entered above.
                </span>
              </label>

              {error && (
                <p style={{ fontSize: 13, color: "#B8453A", marginBottom: 16 }}>{error}</p>
              )}

              <button
                onClick={submit}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: 100,
                  border: "none",
                  backgroundColor: colors.coral,
                  color: "#18181C",
                  fontFamily: display,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Submitting..." : "Submit for review"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: display,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#4B4B52",
  marginBottom: 8,
};
