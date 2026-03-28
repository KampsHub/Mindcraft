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
import StreakDots from "@/components/StreakDots";
import GuidedExerciseCard from "@/components/GuidedExerciseCard";
import CollapsibleChecklist from "./CollapsibleChecklist";
import {
  FEELINGS_SATISFIED,
  FEELINGS_UNSATISFIED,
  NEEDS,
  SOMATIC_SENSATIONS,
} from "./nvc-data";

/* ── Design tokens ── */
const display = fonts.display;
const body = fonts.bodyAlt;

const INK = "#E4DDE2";
const INK_DIM = "#99929B";

/** B&W inline SVG icons for the grounding exercise cards */
function GroundingIcon({ type }: { type: "somatic" | "relational" | "cognitive" }) {
  const s = 28;
  const shared = { width: s, height: s, viewBox: "0 0 28 28", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: { flexShrink: 0 } as React.CSSProperties };

  if (type === "somatic") {
    /* Lungs / breath icon */
    return (
      <svg {...shared}>
        <path d="M14 4v10" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <path d="M14 14Q10 14 8 18Q6 22 8 24L12 24Q14 24 14 20" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M14 14Q18 14 20 18Q22 22 20 24L16 24Q14 24 14 20" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="14" cy="3" r="1.5" fill={INK_DIM} />
      </svg>
    );
  }
  if (type === "relational") {
    /* Open hands / connection icon */
    return (
      <svg {...shared}>
        <path d="M7 18Q7 12 14 10Q21 12 21 18" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M5 20Q5 16 10 16" stroke={INK_DIM} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M23 20Q23 16 18 16" stroke={INK_DIM} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="14" cy="8" r="3" stroke={INK} strokeWidth="1.8" fill="none" />
        <circle cx="7" cy="22" r="2" fill={INK_DIM} />
        <circle cx="21" cy="22" r="2" fill={INK_DIM} />
      </svg>
    );
  }
  /* Compass / 5-4-3-2-1 icon */
  return (
    <svg {...shared}>
      <circle cx="14" cy="14" r="10" stroke={INK} strokeWidth="1.8" fill="none" />
      <circle cx="14" cy="14" r="2" fill={INK_DIM} />
      <line x1="14" y1="5" x2="14" y2="10" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="18" x2="14" y2="23" stroke={INK_DIM} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="14" x2="10" y2="14" stroke={INK_DIM} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="14" x2="23" y2="14" stroke={INK_DIM} strokeWidth="1.5" strokeLinecap="round" />
      <text x="12.5" y="7.5" fontSize="4" fill={INK} fontWeight="bold">N</text>
    </svg>
  );
}

export default function MindfulJournalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"writing" | "saved">("writing");
  const [savedStats, setSavedStats] = useState({ words: 0, feelings: 0, needs: 0, sensations: 0 });
  const [error, setError] = useState("");

  /* NVC checklists */
  const [checkedSatisfied, setCheckedSatisfied] = useState<Set<string>>(new Set());
  const [checkedUnsatisfied, setCheckedUnsatisfied] = useState<Set<string>>(new Set());
  const [checkedNeeds, setCheckedNeeds] = useState<Set<string>>(new Set());
  const [checkedSomatic, setCheckedSomatic] = useState<Set<string>>(new Set());

  /* Which section is open */
  const [openSection, setOpenSection] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
    });
  }, [supabase.auth, router]);

  function toggleSet(set: Set<string>, item: string): Set<string> {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entry.trim() || !user) return;
    setLoading(true);
    setError("");

    const { data: inserted, error: insertError } = await supabase
      .from("entries")
      .insert({
        client_id: user.id,
        coach_id: user.id,
        type: "journal",
        content: entry,
        theme_tags: [],
        date: new Date().toISOString().split("T")[0],
        metadata: {
          source: "mindful_journal",
          nvc_checklist: {
            feelings_satisfied: Array.from(checkedSatisfied),
            feelings_unsatisfied: Array.from(checkedUnsatisfied),
            needs: Array.from(checkedNeeds),
            somatic: Array.from(checkedSomatic),
          },
        },
      })
      .select("id")
      .single();

    if (insertError) {
      setError("Failed to save entry. Please try again.");
      setLoading(false);
      return;
    }

    /* Embed for RAG (non-blocking) */
    if (inserted) {
      fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: inserted.id }),
      }).catch(() => {});
    }

    setSavedStats({
      words: wordCount,
      feelings: checkedSatisfied.size + checkedUnsatisfied.size,
      needs: checkedNeeds.size,
      sensations: checkedSomatic.size,
    });
    setPhase("saved");
    setLoading(false);
  }

  function handleWriteAnother() {
    setEntry("");
    setCheckedSatisfied(new Set());
    setCheckedUnsatisfied(new Set());
    setCheckedNeeds(new Set());
    setCheckedSomatic(new Set());
    setOpenSection(null);
    setPhase("writing");
  }

  const wordCount = entry.split(/\s+/).filter(Boolean).length;
  const totalChecked =
    checkedSatisfied.size + checkedUnsatisfied.size + checkedNeeds.size + checkedSomatic.size;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: colors.bgDeep }}>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: colors.textMuted, fontFamily: body }}>
          Loading...
        </motion.p>
      </div>
    );
  }

  return (
    <PageShell blobVariant="journal">
      {/* ── Header ── */}
      <FadeIn preset="fade" triggerOnMount>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 6px 0",
          }}>
            Reset Journal
          </h1>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, fontFamily: body }}>
            Come back here anytime throughout the day — even after your session is done. Everything you write here gets pulled into tomorrow&apos;s themes.
          </p>
        </div>
      </FadeIn>

      {/* ── Streak Dots ── */}
      <FadeIn preset="fade" delay={0.04} triggerOnMount>
        <StreakDots userId={user.id} supabase={supabase} />
      </FadeIn>

      {/* ── "What's going on?" title with info hover ── */}
      <FadeIn preset="slide-up" delay={0.08} triggerOnMount>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, position: "relative", zIndex: 100 }}>
          <h2 style={{
            fontFamily: display, fontSize: 20, fontWeight: 600,
            color: colors.textPrimary, margin: 0,
          }}>
            What&apos;s going on?
          </h2>
          <div style={{ position: "relative", display: "inline-flex" }} className="info-tooltip-wrap">
            <span
              style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `1.5px solid ${colors.textMuted}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: colors.textMuted,
                cursor: "help", fontFamily: body, lineHeight: 1, flexShrink: 0,
              }}
            >
              i
            </span>
            <div className="info-tooltip-body" style={{
              position: "absolute", left: "50%", transform: "translateX(-50%)",
              top: "calc(100% + 8px)", width: 280, padding: "12px 14px",
              backgroundColor: colors.bgElevated, border: `1px solid ${colors.borderDefault}`,
              borderRadius: 10, fontSize: 12, lineHeight: 1.6,
              color: colors.textBody, fontFamily: body, zIndex: 50,
              pointerEvents: "none", opacity: 0, transition: "opacity 0.15s",
              boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
            }}>
              Naming your feelings, needs, and body sensations activates the prefrontal cortex and calms the amygdala — the brain&apos;s alarm system. Research shows that simply labelling an emotion reduces its intensity. Checking in with your body adds another layer of grounding.
            </div>
          </div>
          <style>{`
            .info-tooltip-wrap:hover .info-tooltip-body { opacity: 1 !important; pointer-events: auto !important; }
          `}</style>
        </div>
      </FadeIn>

      {/* ── Writing / Saved phase ── */}
      <AnimatePresence mode="wait">
        {phase === "writing" ? (
          <motion.div
            key="writing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <FadeIn preset="slide-up" delay={0.1} triggerOnMount>
              <form onSubmit={handleSubmit}>
                <div style={{ position: "relative" }}>
                  <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Write freely. What's present for you right now?"
                    rows={8}
                    style={{
                      width: "100%", padding: "18px 50px 18px 18px", fontSize: 15, lineHeight: 1.7,
                      border: `1px solid ${colors.borderDefault}`, borderRadius: 14,
                      resize: "vertical", outline: "none", boxSizing: "border-box",
                      fontFamily: body, backgroundColor: colors.bgInput,
                      color: colors.textPrimary, transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                    onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                    disabled={loading}
                  />
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                          if (!SpeechRecognition) { alert("Voice not supported in this browser"); return; }
                          const recognition = new SpeechRecognition();
                          recognition.continuous = false;
                          recognition.interimResults = false;
                          recognition.lang = "en-US";
                          recognition.onresult = (event: any) => {
                            const transcript = event.results[0][0].transcript;
                            setEntry((prev) => prev ? prev + " " + transcript : transcript);
                          };
                          recognition.start();
                        } catch { /* ignore */ }
                      }}
                      title="Use voice input"
                      style={{
                        position: "absolute", right: 12, bottom: 12,
                        width: 36, height: 36, borderRadius: "50%",
                        border: "none", backgroundColor: colors.bgElevated,
                        color: "rgba(255,255,255,0.6)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* ── Checklists ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
                  <CollapsibleChecklist
                    title="Good Feelings"
                    categories={FEELINGS_SATISFIED}
                    checkedItems={checkedSatisfied}
                    onToggle={(item) => setCheckedSatisfied((s) => toggleSet(s, item))}
                    accentColor={colors.coral}
                    accentWash={"rgba(224, 149, 133, 0.12)"}
                    isOpen={openSection === "satisfied"}
                    onToggleOpen={() => setOpenSection(openSection === "satisfied" ? null : "satisfied")}
                  />
                  <CollapsibleChecklist
                    title="Challenging Feelings"
                    categories={FEELINGS_UNSATISFIED}
                    checkedItems={checkedUnsatisfied}
                    onToggle={(item) => setCheckedUnsatisfied((s) => toggleSet(s, item))}
                    accentColor={colors.coral}
                    accentWash={colors.coralWash}
                    isOpen={openSection === "unsatisfied"}
                    onToggleOpen={() => setOpenSection(openSection === "unsatisfied" ? null : "unsatisfied")}
                  />
                  <CollapsibleChecklist
                    title="Personal Needs"
                    categories={NEEDS}
                    checkedItems={checkedNeeds}
                    onToggle={(item) => setCheckedNeeds((s) => toggleSet(s, item))}
                    accentColor={colors.coral}
                    accentWash={"rgba(224, 149, 133, 0.12)"}
                    isOpen={openSection === "needs"}
                    onToggleOpen={() => setOpenSection(openSection === "needs" ? null : "needs")}
                  />
                  <CollapsibleChecklist
                    title="Body Sensations"
                    categories={SOMATIC_SENSATIONS}
                    checkedItems={checkedSomatic}
                    onToggle={(item) => setCheckedSomatic((s) => toggleSet(s, item))}
                    accentColor={colors.warning}
                    accentWash={colors.warningWash}
                    isOpen={openSection === "somatic"}
                    onToggleOpen={() => setOpenSection(openSection === "somatic" ? null : "somatic")}
                  />
                </div>

                {/* ── Live Selection Summary ── */}
                <AnimatePresence>
                  {totalChecked > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      style={{ overflow: "hidden", marginTop: 18 }}
                    >
                      <div style={{
                        backgroundColor: colors.bgSurface,
                        borderRadius: 12,
                        border: `1px solid ${colors.borderDefault}`,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                      }}>
                        <span style={{ fontSize: 11, fontFamily: display, fontWeight: 600, color: colors.textMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                          Checked in
                        </span>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {checkedSatisfied.size > 0 && (
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              style={{
                                fontSize: 12, fontFamily: body, fontWeight: 600,
                                color: colors.coral,
                                display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.coral, display: "inline-block" }} />
                              {checkedSatisfied.size} satisfied
                            </motion.span>
                          )}
                          {checkedUnsatisfied.size > 0 && (
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              style={{
                                fontSize: 12, fontFamily: body, fontWeight: 600,
                                color: colors.coral,
                                display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.coral, display: "inline-block" }} />
                              {checkedUnsatisfied.size} unsatisfied
                            </motion.span>
                          )}
                          {checkedNeeds.size > 0 && (
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              style={{
                                fontSize: 12, fontFamily: body, fontWeight: 600,
                                color: colors.coral,
                                display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.coral, display: "inline-block" }} />
                              {checkedNeeds.size} needs
                            </motion.span>
                          )}
                          {checkedSomatic.size > 0 && (
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              style={{
                                fontSize: 12, fontFamily: body, fontWeight: 600,
                                color: colors.warning,
                                display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.warning, display: "inline-block" }} />
                              {checkedSomatic.size} sensations
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Submit row ── */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18,
                }}>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: body }}>
                    {entry.length > 0 ? `${wordCount} words` : ""}
                  </span>
                  <PillButton type="submit" disabled={loading || !entry.trim()}>
                    {loading ? "Saving..." : "Save entry"}
                  </PillButton>
                </div>
              </form>
            </FadeIn>

            {/* ── Error ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: 18, padding: "12px 18px",
                    backgroundColor: colors.errorWash,
                    border: `1px solid ${colors.error}`,
                    borderRadius: 12, color: colors.error,
                    fontSize: 14, fontFamily: body,
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "48px 24px",
              backgroundColor: colors.bgSurface,
              borderRadius: 16,
              border: `1px solid ${colors.coral}`,
            }}
          >
            {/* Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
              style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `linear-gradient(135deg, ${colors.coral}, ${colors.coral})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.bgDeep} strokeWidth={2.5} strokeLinecap="round">
                <motion.path
                  d="M20 6L9 17l-5-5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
              </svg>
            </motion.div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
              {savedStats.words > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  style={{ textAlign: "center" }}
                >
                  <p style={{ fontSize: 24, fontWeight: 700, fontFamily: display, color: colors.coral, margin: 0 }}>
                    {savedStats.words}
                  </p>
                  <p style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, margin: 0, letterSpacing: "0.04em" }}>
                    words
                  </p>
                </motion.div>
              )}
              {savedStats.feelings > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  style={{ textAlign: "center" }}
                >
                  <p style={{ fontSize: 24, fontWeight: 700, fontFamily: display, color: colors.coral, margin: 0 }}>
                    {savedStats.feelings}
                  </p>
                  <p style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, margin: 0, letterSpacing: "0.04em" }}>
                    feelings
                  </p>
                </motion.div>
              )}
              {savedStats.needs > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  style={{ textAlign: "center" }}
                >
                  <p style={{ fontSize: 24, fontWeight: 700, fontFamily: display, color: colors.coral, margin: 0 }}>
                    {savedStats.needs}
                  </p>
                  <p style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, margin: 0, letterSpacing: "0.04em" }}>
                    needs
                  </p>
                </motion.div>
              )}
              {savedStats.sensations > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  style={{ textAlign: "center" }}
                >
                  <p style={{ fontSize: 24, fontWeight: 700, fontFamily: display, color: colors.warning, margin: 0 }}>
                    {savedStats.sensations}
                  </p>
                  <p style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, margin: 0, letterSpacing: "0.04em" }}>
                    sensations
                  </p>
                </motion.div>
              )}
            </div>

            {/* Motivational line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                fontSize: 16, fontWeight: 600, fontFamily: display,
                color: colors.textPrimary, margin: "0 0 24px 0",
                letterSpacing: "-0.01em",
              }}
            >
              Noticed. Named. Grounded.
            </motion.p>

            {/* Write another */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWriteAnother}
              style={{
                padding: "10px 28px", fontSize: 13, fontWeight: 600,
                fontFamily: display, borderRadius: 100, cursor: "pointer",
                border: `1px solid ${colors.borderDefault}`,
                backgroundColor: "transparent", color: colors.textSecondary,
              }}
            >
              Write another
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grounding exercises ── */}
      <FadeIn preset="fade" delay={0.2} triggerOnMount>
        <div style={{ marginTop: 48 }}>
          <p style={{
            fontFamily: display, fontSize: 12, fontWeight: 600,
            color: colors.textMuted, margin: "0 0 14px 0",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            Need a quick reset?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FadeIn preset="slide-up" delay={0.25} triggerOnMount>
              <GuidedExerciseCard
                title="Somatic Grounding"
                icon={<GroundingIcon type="somatic" />}
                steps={[
                  { instruction: "Place both feet flat on the floor. Notice the contact between your feet and the ground.", type: "text" },
                  { instruction: "Press down gently and feel the ground pressing back. Notice the support.", type: "text" },
                  { instruction: "Follow the breathing circle. Let each exhale be longer than the inhale.", type: "breathe", duration: 12 },
                  { instruction: "Notice one sensation in your body right now — without trying to change it. Just notice.", type: "text" },
                ]}
              />
            </FadeIn>
            <FadeIn preset="slide-up" delay={0.33} triggerOnMount>
              <GuidedExerciseCard
                title="Relational Grounding"
                icon={<GroundingIcon type="relational" />}
                steps={[
                  { instruction: "Think of one person who, if they were sitting next to you right now, would help your nervous system settle.", type: "text" },
                  { instruction: "Picture their face. Notice the details — their expression, the warmth in their eyes.", type: "text" },
                  { instruction: "Imagine what they would say to you right now. Hear their voice.", type: "text" },
                  { instruction: "Let yourself feel the warmth of that connection, even though they are not here. The feeling is real.", type: "text" },
                ]}
              />
            </FadeIn>
            <FadeIn preset="slide-up" delay={0.41} triggerOnMount>
              <GuidedExerciseCard
                title="5-4-3-2-1 Grounding"
                icon={<GroundingIcon type="cognitive" />}
                steps={[
                  { instruction: "Name five things you can see. Look slowly around you and really notice each one.", type: "text" },
                  { instruction: "Name four things you can hear. Listen closely — even to the quiet sounds.", type: "text" },
                  { instruction: "Name three things you can touch from where you are. Feel their texture.", type: "text" },
                  { instruction: "Name two things you can smell. Breathe in gently.", type: "text" },
                  { instruction: "Name one thing you can taste. Notice what's present in your mouth right now. You're here.", type: "text" },
                ]}
              />
            </FadeIn>
          </div>
        </div>
      </FadeIn>

      {/* ── Attribution ── */}
      <FadeIn preset="fade" delay={0.4} triggerOnMount>
        <div style={{
          marginTop: 40, paddingTop: 32,
          borderTop: `1px solid ${colors.borderSubtle}`,
          textAlign: "center",
          maxWidth: 500, marginLeft: "auto", marginRight: "auto",
        }}>
          <p style={{
            fontSize: 12, color: colors.textMuted, fontFamily: body,
            lineHeight: 1.6, margin: 0,
          }}>
            Feelings and Needs inventories adapted from the work of Marshall B. Rosenberg and the Center for Nonviolent Communication (CNVC), as compiled by Nati Beltran and colleagues. Somatic sensations list developed collaboratively by NVC practitioners. Used with gratitude.
          </p>
        </div>
      </FadeIn>
    </PageShell>
  );
}
