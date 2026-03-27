"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import FadeIn from "@/components/FadeIn";
import PillButton from "@/components/PillButton";
import { colors, fonts } from "@/lib/theme";
import { content as c } from "@/content/site";

/* ── Design tokens ── */
const display = fonts.display;
const body = fonts.bodyAlt;

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [reflection, setReflection] = useState("");
  const [themeTags, setThemeTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entry.trim() || !user) return;

    setLoading(true);
    setError("");
    setReflection("");
    setThemeTags([]);

    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const data = await res.json();
      setReflection(data.reflection);
      setThemeTags(data.theme_tags || []);

      const { data: insertedEntry, error: insertError } = await supabase
        .from("entries")
        .insert({
          client_id: user.id,
          coach_id: user.id,
          type: "journal",
          content: entry,
          theme_tags: data.theme_tags || [],
          date: new Date().toISOString().split("T")[0],
          metadata: { reflection: data.reflection },
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Failed to save entry:", insertError);
      } else if (insertedEntry) {
        try {
          await fetch("/api/embed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entryId: insertedEntry.id }),
          });
        } catch {
          // Embedding is non-blocking
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get reflection";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const wordCount = entry.split(/\s+/).filter(Boolean).length;

  return (
    <PageShell blobVariant="journal">
      <FadeIn preset="fade" triggerOnMount>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 6px 0",
          }}>
            {c.journal.headline}
          </h1>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, fontFamily: body }}>
            {c.journal.subheadline}
          </p>
        </div>
      </FadeIn>

      <FadeIn preset="slide-up" delay={0.1} triggerOnMount>
        <form onSubmit={handleSubmit}>
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder={c.journal.placeholder}
            rows={8}
            style={{
              width: "100%", padding: 18, fontSize: 15, lineHeight: 1.7,
              border: `1px solid ${colors.borderDefault}`, borderRadius: 14,
              resize: "vertical", outline: "none", boxSizing: "border-box",
              fontFamily: body, backgroundColor: colors.bgInput,
              color: colors.textPrimary,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
            onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
            disabled={loading}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: body }}>
              {entry.length > 0 ? `${wordCount} words` : ""}
            </span>

            <PillButton type="submit" disabled={loading || !entry.trim()}>
              {loading ? c.journal.submitLoading : c.journal.submitButton}
            </PillButton>
          </div>
        </form>
      </FadeIn>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 32, display: "flex", alignItems: "center", gap: 14,
              color: colors.textMuted, fontFamily: body,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `2px solid ${colors.borderDefault}`,
                borderTopColor: colors.coral, flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 14 }}>{c.journal.loadingText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 24, padding: 18,
              backgroundColor: colors.errorWash,
              border: `1px solid ${colors.error}`,
              borderRadius: 12, color: colors.error, fontSize: 14,
              fontFamily: body, lineHeight: 1.5,
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reflection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            style={{ marginTop: 32 }}
          >
            <motion.div
              whileHover={{ y: -2, borderColor: "rgba(224, 149, 133, 0.2)" }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: 24,
                transition: "border-color 0.2s",
              }}
            >
              <p style={{
                fontSize: 11, fontWeight: 700, color: colors.textMuted,
                margin: "0 0 14px 0", textTransform: "uppercase",
                letterSpacing: "0.08em", fontFamily: display,
              }}>
                {c.journal.reflectionHeading}
              </p>
              <p style={{
                fontSize: 15, lineHeight: 1.7, color: colors.textBody,
                margin: 0, whiteSpace: "pre-wrap", fontFamily: body,
              }}>
                {reflection}
              </p>
            </motion.div>

            {themeTags.length > 0 && (
              <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {themeTags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20, delay: i * 0.06 }}
                    style={{
                      padding: "4px 12px", fontSize: 12, fontWeight: 600,
                      backgroundColor: "rgba(224, 149, 133, 0.12)", color: colors.coral,
                      borderRadius: 100, fontFamily: display,
                    }}
                  >
                    {tag.replace(/_/g, " ")}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
