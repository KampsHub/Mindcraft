"use client";

import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

export type TestimonialRow = {
  id: string;
  kind: "text" | "social_url" | "video_url";
  body: string;
  attribution: string | null;
  social_url: string | null;
  social_embed_html: string | null;
  video_url: string | null;
  show_linkedin_link: boolean;
  outcome_tags: string[] | null;
};

function videoEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    // YouTube
    if (host === "youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // Loom
    if (host === "loom.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("share");
      if (idx >= 0 && parts[idx + 1]) {
        return `https://www.loom.com/embed/${parts[idx + 1]}`;
      }
    }
    // Vimeo
    if (host === "vimeo.com") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    if (host === "player.vimeo.com") {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

export default function TestimonialCard({ testimonial }: { testimonial: TestimonialRow }) {
  const tagLabel = testimonial.outcome_tags && testimonial.outcome_tags[0];

  const cardStyle = {
    padding: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid rgba(24,24,28,0.08)",
    boxShadow: "0 4px 16px rgba(24,24,28,0.05)",
    height: "100%",
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column" as const,
  };

  return (
    <motion.div
      whileHover={{ y: -4, borderColor: colors.coral, boxShadow: "0 12px 32px rgba(24,24,28,0.10)" }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={cardStyle}
    >
      {testimonial.kind === "video_url" && testimonial.video_url ? (
        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", marginBottom: 16, borderRadius: 10, overflow: "hidden", backgroundColor: "#000" }}>
          {videoEmbedSrc(testimonial.video_url) ? (
            <iframe
              src={videoEmbedSrc(testimonial.video_url)!}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video testimonial"
            />
          ) : (
            <a
              href={testimonial.video_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: body, textDecoration: "none" }}
            >
              Open video ↗
            </a>
          )}
        </div>
      ) : (
        <span
          style={{
            fontFamily: display,
            fontSize: 48,
            lineHeight: 1,
            color: colors.coral,
            opacity: 0.4,
            marginBottom: 8,
            display: "block",
          }}
        >
          &ldquo;
        </span>
      )}

      <p
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 1.7,
          fontFamily: body,
          fontStyle: "italic",
          flex: 1,
          marginBottom: 20,
        }}
      >
        {testimonial.body}
      </p>

      {testimonial.kind === "social_url" && testimonial.show_linkedin_link && testimonial.social_url && (
        <a
          href={testimonial.social_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: body,
            fontSize: 12,
            color: colors.coral,
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          View original ↗
        </a>
      )}

      <div
        style={{
          borderTop: `1px solid ${colors.borderSubtle}`,
          paddingTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: colors.textMuted,
            fontFamily: body,
          }}
        >
          {testimonial.attribution || "Mindcraft alum"}
        </span>
        {tagLabel && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              fontFamily: display,
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              color: colors.coral,
              background: colors.coralWash,
              padding: "3px 8px",
              borderRadius: 100,
              flexShrink: 0,
            }}
          >
            {tagLabel.replace(/_/g, " ")}
          </span>
        )}
      </div>
    </motion.div>
  );
}
