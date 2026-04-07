"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import FadeIn from "@/components/FadeIn";
import { colors, fonts } from "@/lib/theme";
import { trackEvent } from "@/components/GoogleAnalytics";

/* ── Design tokens ── */
const display = fonts.display;
const body = fonts.bodyAlt;

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.bgSurface,
  borderRadius: 16,
  border: `1px solid ${colors.borderDefault}`,
  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
};

/* ── Attribution sources ── */
const attributionSources = [
  { id: "google", label: "Google", icon: "" },
  { id: "linkedin", label: "LinkedIn", icon: "" },
  { id: "reddit", label: "Reddit", icon: "" },
  { id: "tiktok", label: "TikTok", icon: "" },
  { id: "friend", label: "Friend", icon: "" },
  { id: "facebook", label: "Facebook", icon: "" },
  { id: "instagram", label: "Instagram", icon: "" },
  { id: "youtube", label: "YouTube", icon: "" },
  { id: "x_twitter", label: "X (Twitter)", icon: "" },
  { id: "podcast", label: "Podcast", icon: "" },
];

/* ── Types ── */

type Step = "attribution" | "program" | "intake" | "consent" | "complete";

interface Program {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  duration_days: number;
  weekly_themes: { week: number; name: string; title: string; territory: string }[];
  intake_config: {
    pre_start_questions: {
      id: string;
      question: string;
      type: string;
      options?: string[];
      items?: string[];
    }[];
    consent_toggles: {
      id: string;
      label: string;
      required: boolean;
      default?: boolean;
    }[];
  };
  pricing_cents: number;
}

/* ── Shell ── */
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div style={{ backgroundColor: colors.bgDeep, color: colors.textPrimary, minHeight: "100vh", fontFamily: body }}>
    <Nav />
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
      {children}
    </div>
  </div>
);

/* ── Component ── */

export default function IntakePage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("attribution");
  // Analytics: intake_start fires once on mount, intake_step_complete on every step transition.
  useEffect(() => {
    trackEvent("intake_start", {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wrappedSetStep = (next: Step) => {
    trackEvent("intake_step_complete", { from: step, to: next });
    setStep(next);
  };
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [attribution, setAttribution] = useState<string>("");
  const [attributionOther, setAttributionOther] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [disruptions, setDisruptions] = useState<Record<string, number>>({});
  const [consent, setConsent] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Load programs + auth — redirect to login if not authenticated
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not authenticated — redirect to login with a return URL
        const programSlug = searchParams.get("program");
        const returnUrl = programSlug ? `/intake?program=${programSlug}` : "/intake";
        window.location.href = `/login?next=${encodeURIComponent(returnUrl)}`;
        return;
      }

      setUser(user);

      const { data: progs } = await supabase
        .from("programs")
        .select("*")
        .eq("active", true)
        .order("created_at");

      if (progs) {
        setPrograms(progs);
        // Auto-select program from URL param (e.g. /intake?program=parachute)
        const programSlug = searchParams.get("program");
        if (programSlug) {
          const match = progs.find((p: Program) => p.slug === programSlug);
          if (match) {
            setSelectedProgram(match);
          }
        }
      }
      setLoading(false);
    }
    init();
  }, [supabase, searchParams]);

  // Initialize consent defaults when program is selected
  useEffect(() => {
    if (selectedProgram?.intake_config?.consent_toggles) {
      const defaults: Record<string, boolean> = {};
      selectedProgram.intake_config.consent_toggles.forEach((toggle) => {
        defaults[toggle.id] = toggle.required || toggle.default || false;
      });
      setConsent(defaults);
    }
  }, [selectedProgram]);

  function handleAnswer(id: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleDisruption(item: string, value: number) {
    setDisruptions((prev) => ({ ...prev, [item]: value }));
  }

  async function handleComplete() {
    if (!user) {
      alert("Please sign in first. Your session may have expired.");
      return;
    }
    if (!selectedProgram) {
      alert("No program selected. Please go back and select a program.");
      return;
    }
    setSaving(true);

    const preStartData = {
      ...answers,
      disruptions_quick: disruptions,
      attribution: attribution === "other" ? attributionOther : attribution,
    };

    // Try to update an existing pre_start enrollment first
    const { data: existing } = await supabase
      .from("program_enrollments")
      .select("id")
      .eq("client_id", user.id)
      .eq("program_id", selectedProgram.id)
      .in("status", ["pre_start", "onboarding"])
      .maybeSingle();

    let error;
    if (existing) {
      // Update the existing enrollment created at welcome
      const result = await supabase
        .from("program_enrollments")
        .update({
          status: "onboarding",
          pre_start_data: preStartData,
        })
        .eq("id", existing.id);
      error = result.error;
    } else {
      // No existing enrollment - create one
      const result = await supabase
        .from("program_enrollments")
        .insert({
          client_id: user.id,
          program_id: selectedProgram.id,
          status: "onboarding",
          current_day: 1,
          pre_start_data: preStartData,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      error = result.error;
    }

    if (error) {
      console.error("Failed to save enrollment:", error);
      if (error.code === "23505") {
        alert("You are already enrolled in this program. Redirecting to your dashboard.");
        router.push("/dashboard");
      } else {
        alert("Failed to save. Check the console for details.");
      }
      setSaving(false);
      return;
    }

    // Also save to legacy intake_responses for backward compatibility
    await supabase.from("intake_responses").insert({
      client_id: user.id,
      package: selectedProgram.slug,
      universal: {},
      package_specific: preStartData,
      completed: true,
    });

    trackEvent("intake_complete", { program: selectedProgram.slug, program_name: selectedProgram.name });
    wrappedSetStep("complete");
    setSaving(false);
  }

  /* ── Progress indicator ── */
  const hasProgramParam = !!searchParams.get("program");
  const steps = hasProgramParam ? ["Source", "Intake", "Consent", "Start"] : ["Source", "Program", "Intake", "Consent", "Start"];
  const stepIndex = hasProgramParam
    ? (step === "attribution" ? 0 : step === "intake" ? 1 : step === "consent" ? 2 : 3)
    : (step === "attribution" ? 0 : step === "program" ? 1 : step === "intake" ? 2 : step === "consent" ? 3 : 4);

  /* ── Loading ── */
  if (loading) {
    return (
      <Shell>
        <p style={{ color: colors.textMuted, fontFamily: body }}>Loading programs...</p>
      </Shell>
    );
  }

  /* ── Step 0: Attribution ── */
  if (step === "attribution") {
    return (
      <Shell>
        <FadeIn preset="fade" triggerOnMount>
          {/* Progress */}
          <div style={{ display: "flex", gap: 5, marginBottom: 32 }}>
            {steps.map((s, i) => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 100,
                backgroundColor: i <= stepIndex ? colors.coral : colors.borderSubtle,
                transition: "background-color 0.3s",
              }} />
            ))}
          </div>

          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 8px 0",
          }}>
            Where did you hear about us?
          </h1>
          <p style={{
            fontSize: 15, color: colors.textMuted, marginBottom: 28,
            lineHeight: 1.6, fontFamily: body,
          }}>
            Just curious — helps us know what&apos;s working.
          </p>
        </FadeIn>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 24,
        }}>
          {attributionSources.map((src, i) => {
            const isSelected = attribution === src.id;
            return (
              <FadeIn key={src.id} preset="slide-up" delay={i * 0.03} triggerOnMount>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setAttribution(src.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    width: "100%",
                    padding: "16px 20px",
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: body,
                    backgroundColor: isSelected ? colors.bgElevated : colors.bgSurface,
                    color: isSelected ? colors.textPrimary : colors.textSecondary,
                    border: isSelected ? `1.5px solid ${colors.coral}` : `1px solid ${colors.borderDefault}`,
                    borderRadius: 12,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{src.icon}</span>
                  {src.label}
                </motion.button>
              </FadeIn>
            );
          })}
        </div>

        {/* Other option */}
        <FadeIn preset="fade" delay={0.3} triggerOnMount>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 0", marginBottom: 8,
            color: colors.textMuted, fontSize: 13,
            fontFamily: display, letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            <div style={{ flex: 1, height: 1, backgroundColor: colors.borderSubtle }} />
            <span>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: colors.borderSubtle }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={attributionOther}
              onChange={(e) => {
                setAttributionOther(e.target.value);
                if (e.target.value) setAttribution("other");
              }}
              placeholder="Other"
              style={{
                flex: 1,
                padding: "14px 16px",
                fontSize: 15,
                fontFamily: body,
                backgroundColor: colors.bgInput,
                color: colors.textPrimary,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: 12,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
            />
          </div>
        </FadeIn>

        <FadeIn preset="fade" delay={0.4} triggerOnMount>
          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <motion.button
              whileHover={attribution ? { scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" } : {}}
              whileTap={attribution ? { scale: 0.97 } : {}}
              onClick={() => {
                if (attribution) {
                  const source = attribution === "other" ? attributionOther : attribution;
                  const eventParams: Record<string, string> = {
                    source,
                    attribution_type: attribution === "other" ? "freeform" : "preset",
                  };
                  if (attribution === "other") eventParams.freeform_text = attributionOther;
                  trackEvent("attribution_source", eventParams);
                  // Skip program selection — we already know from the URL param or purchase
                  wrappedSetStep(selectedProgram ? "intake" : "program");
                }
              }}
              disabled={!attribution}
              style={{
                padding: "14px 36px", fontSize: 15, fontWeight: 600,
                color: !attribution ? colors.textMuted : colors.bgDeep,
                backgroundColor: !attribution ? colors.bgElevated : colors.coral,
                border: "none", borderRadius: 100,
                cursor: !attribution ? "not-allowed" : "pointer",
                fontFamily: display, letterSpacing: "0.01em",
                transition: "all 0.2s",
              }}
            >
              Continue
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => wrappedSetStep("program")}
              style={{
                padding: "14px 24px", fontSize: 14, fontWeight: 500,
                color: colors.textMuted, backgroundColor: "transparent",
                border: "none", cursor: "pointer",
                fontFamily: display,
              }}
            >
              Skip
            </motion.button>
          </div>
        </FadeIn>
      </Shell>
    );
  }

  /* ── Step 1: Program Selection ── */
  if (step === "program") {
    return (
      <Shell>
        <FadeIn preset="fade" triggerOnMount>
          {/* Progress */}
          <div style={{ display: "flex", gap: 5, marginBottom: 32 }}>
            {steps.map((s, i) => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 100,
                backgroundColor: i <= stepIndex ? colors.coral : colors.borderSubtle,
                transition: "background-color 0.3s",
              }} />
            ))}
          </div>

          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 8px 0",
          }}>
            Choose your program
          </h1>
          <p style={{
            fontSize: 15, color: colors.textMuted, marginBottom: 28,
            lineHeight: 1.6, fontFamily: body,
          }}>
            Each program is a 30-day coached container built for a specific
            situation. Pick the one that matches where you are.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {programs.map((prog, i) => {
            const isSelected = selectedProgram?.id === prog.id;
            return (
              <FadeIn key={prog.id} preset="slide-up" delay={i * 0.06} triggerOnMount>
                <motion.div
                  onClick={() => setSelectedProgram(prog)}
                  whileHover={{ y: -3, boxShadow: "0 12px 28px rgba(0,0,0,0.06)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  style={{
                    ...cardStyle,
                    padding: 24,
                    cursor: "pointer",
                    borderColor: isSelected ? colors.coral : colors.borderDefault,
                    background: isSelected
                      ? `linear-gradient(135deg, ${colors.bgSurface} 0%, ${colors.bgSurface} 100%)`
                      : colors.bgSurface,
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                >
                  <h3 style={{
                    fontSize: 17, fontWeight: 700, margin: "0 0 5px 0",
                    color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.02em",
                  }}>
                    {prog.name}
                  </h3>
                  <p style={{
                    color: colors.textMuted, margin: 0, fontSize: 14,
                    lineHeight: 1.55, fontFamily: body,
                  }}>
                    {prog.tagline}
                  </p>

                  {isSelected && prog.weekly_themes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        marginTop: 18, paddingTop: 18,
                        borderTop: `1px solid ${colors.borderSubtle}`,
                        overflow: "hidden",
                      }}
                    >
                      <p style={{
                        fontSize: 11, fontWeight: 700, color: colors.textMuted,
                        margin: "0 0 10px 0", textTransform: "uppercase",
                        letterSpacing: "0.08em", fontFamily: display,
                      }}>
                        4-week arc
                      </p>
                      {prog.weekly_themes.map((wt) => (
                        <div key={wt.week} style={{
                          fontSize: 13, color: colors.textMuted,
                          marginBottom: 6, lineHeight: 1.45, fontFamily: body,
                        }}>
                          <span style={{ fontWeight: 600, color: colors.textPrimary }}>
                            Week {wt.week}: {wt.name.charAt(0) + wt.name.slice(1).toLowerCase()}
                          </span>{" "}
                          — {wt.title}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn preset="fade" delay={0.3} triggerOnMount>
          <motion.button
            whileHover={selectedProgram ? { scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } : {}}
            whileTap={selectedProgram ? { scale: 0.97 } : {}}
            onClick={() => selectedProgram && wrappedSetStep("intake")}
            disabled={!selectedProgram}
            style={{
              marginTop: 24, padding: "14px 36px", fontSize: 15, fontWeight: 600,
              color: colors.bgDeep,
              backgroundColor: !selectedProgram ? colors.bgElevated : colors.coral,
              border: "none", borderRadius: 100,
              cursor: !selectedProgram ? "not-allowed" : "pointer",
              fontFamily: display, letterSpacing: "0.01em",
              transition: "background-color 0.2s",
            }}
          >
            Continue
          </motion.button>
        </FadeIn>
      </Shell>
    );
  }

  /* ── Step 2: Program-Specific Pre-Start Questions ── */
  if (step === "intake" && selectedProgram) {
    const questions = selectedProgram.intake_config?.pre_start_questions || [];

    return (
      <Shell>
        <FadeIn preset="fade" triggerOnMount>
          {/* Progress */}
          <div style={{ display: "flex", gap: 5, marginBottom: 32 }}>
            {steps.map((s, i) => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 100,
                backgroundColor: i <= stepIndex ? colors.coral : colors.borderSubtle,
                transition: "background-color 0.3s",
              }} />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => wrappedSetStep(searchParams.get("program") ? "attribution" : "program")}
            style={{
              padding: "6px 16px", fontSize: 13, fontWeight: 600,
              color: colors.textMuted, backgroundColor: colors.bgSurface,
              border: "none", borderRadius: 100, cursor: "pointer",
              fontFamily: display, marginBottom: 20,
            }}
          >
            ← Back
          </motion.button>

          <span style={{
            display: "inline-block", background: colors.coralWash, color: colors.coralLight,
            fontFamily: display, fontWeight: 700, fontSize: 11,
            textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "5px 14px", borderRadius: 100, marginBottom: 14,
          }}>
            {selectedProgram.name}
          </span>

          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 12px 0",
          }}>
            Pre-start intake
          </h1>
          <p style={{
            fontSize: 16, color: colors.textPrimary, marginBottom: 32,
            lineHeight: 1.65, fontFamily: body,
          }}>
            Quick context so the program can meet you where you are. 10-15 minutes.
            The deeper work happens in Days 1-3.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {questions.map((q, qi) => (
            <FadeIn key={q.id} preset="slide-up" delay={qi * 0.05} triggerOnMount>
              <div>
                <label style={{
                  display: "block", fontSize: 15, fontWeight: 600,
                  marginBottom: 10, lineHeight: 1.5, color: colors.textPrimary,
                  fontFamily: body,
                }}>
                  {q.question}
                </label>

                {q.type === "textarea" && (
                  <textarea
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    rows={3}
                    placeholder="Take your time..."
                    style={{
                      width: "100%", padding: 16, fontSize: 15, lineHeight: 1.65,
                      border: `1px solid ${colors.borderDefault}`, borderRadius: 12, backgroundColor: colors.bgInput, color: colors.textPrimary,
                      resize: "vertical", fontFamily: body, boxSizing: "border-box",
                      outline: "none", transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                    onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                  />
                )}

                {q.type === "date" && (
                  <input
                    type="date"
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    style={{
                      padding: "12px 16px", fontSize: 15,
                      border: `1px solid ${colors.borderDefault}`, borderRadius: 12, backgroundColor: colors.bgInput, color: colors.textPrimary,
                      fontFamily: body, outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                    onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                  />
                )}

                {q.type === "select" && q.options && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {q.options.map((opt) => (
                      <motion.label
                        key={opt}
                        whileHover={{ y: -1 }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          fontSize: 15, padding: "12px 16px",
                          border: answers[q.id] === opt
                            ? `1px solid ${colors.coral}`
                            : `1px solid ${colors.borderDefault}`,
                          borderRadius: 12, cursor: "pointer",
                          backgroundColor: answers[q.id] === opt
                            ? colors.bgSurface : colors.bgSurface,
                          fontFamily: body, transition: "all 0.2s",
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                          border: answers[q.id] === opt
                            ? `2px solid ${colors.coral}`
                            : `2px solid ${colors.borderDefault}`,
                          backgroundColor: answers[q.id] === opt ? colors.coral : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s",
                        }}>
                          {answers[q.id] === opt && (
                            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.bgDeep }} />
                          )}
                        </div>
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswer(q.id, opt)}
                          style={{ display: "none" }}
                        />
                        {opt}
                      </motion.label>
                    ))}
                  </div>
                )}

                {q.type === "disruptions_scale" && q.items && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{
                      fontSize: 14, color: colors.textPrimary, margin: "0 0 6px 0",
                      fontFamily: body, lineHeight: 1.5,
                    }}>
                      Rate each 1-10 (10 = most intense right now)
                    </p>
                    <p style={{
                      fontSize: 13, color: colors.textPrimary, margin: "0 0 20px 0",
                      fontFamily: body, lineHeight: 1.55, opacity: 0.85,
                    }}>
                      This helps us understand which areas need the most support so your program starts where you actually are — not where a generic program assumes you are.
                    </p>
                    {q.items.map((item) => {
                      const descriptions: Record<string, string> = {
                        "Income and Financial Security": "How stressed are you about money, bills, runway, or supporting others right now?",
                        "Routine and Structure": "How disrupted is your daily rhythm — sleep, schedule, sense of purpose in your day?",
                        "Identity": "How much has your sense of who you are shifted since this started?",
                        "Social Belonging": "How isolated or disconnected do you feel from your community, colleagues, or social circle?",
                        "Sense of Competence": "How much is your confidence in your professional abilities shaken right now?",
                        "Future Uncertainty": "How overwhelming does the unknown feel — what's next, when, and how?",
                        "Skill Confidence": "How much do you doubt whether your skills are current, transferable, or enough?",
                      };
                      return (
                      <div key={item} style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        marginBottom: 18,
                      }}>
                        <div style={{ minWidth: 200, flex: 1 }}>
                          <span style={{
                            fontSize: 15, color: colors.textPrimary,
                            fontFamily: body, fontWeight: 600,
                          }}>
                            {item}
                          </span>
                          {descriptions[item] && (
                            <p style={{
                              fontSize: 13, color: colors.textPrimary, margin: "4px 0 0 0",
                              fontFamily: body, lineHeight: 1.5, opacity: 0.85,
                            }}>
                              {descriptions[item]}
                            </p>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <motion.button
                              key={n}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDisruption(item, n)}
                              style={{
                                width: 32, height: 32, borderRadius: 8,
                                border: disruptions[item] === n
                                  ? `2px solid ${colors.coral}`
                                  : `1px solid ${colors.borderDefault}`,
                                backgroundColor: disruptions[item] === n
                                  ? colors.coral : colors.bgSurface,
                                color: disruptions[item] === n
                                  ? colors.bgDeep : colors.textMuted,
                                fontSize: 12, fontWeight: 600,
                                cursor: "pointer", transition: "all 0.15s",
                                fontFamily: display,
                              }}
                            >
                              {n}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn preset="fade" delay={0.3} triggerOnMount>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => wrappedSetStep("consent")}
            style={{
              marginTop: 28, padding: "14px 36px", fontSize: 15, fontWeight: 600,
              color: colors.bgDeep, backgroundColor: colors.coral,
              border: "none", borderRadius: 100, cursor: "pointer",
              fontFamily: display, letterSpacing: "0.01em",
            }}
          >
            Continue to Consent
          </motion.button>
        </FadeIn>
      </Shell>
    );
  }

  /* ── Step 3: Consent ── */
  if (step === "consent" && selectedProgram) {
    return (
      <Shell>
        <FadeIn preset="fade" triggerOnMount>
          {/* Progress */}
          <div style={{ display: "flex", gap: 5, marginBottom: 32 }}>
            {steps.map((s, i) => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 100,
                backgroundColor: i <= stepIndex ? colors.coral : colors.borderSubtle,
                transition: "background-color 0.3s",
              }} />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => wrappedSetStep("intake")}
            style={{
              padding: "6px 16px", fontSize: 13, fontWeight: 600,
              color: colors.textPrimary, backgroundColor: colors.bgSurface,
              border: "none", borderRadius: 100, cursor: "pointer",
              fontFamily: display, marginBottom: 20,
            }}
          >
            ← Back
          </motion.button>

          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 14px 0",
          }}>
            How your data is handled
          </h1>
          <p style={{
            fontSize: 16, color: colors.textPrimary, marginBottom: 28,
            lineHeight: 1.65, fontFamily: body, maxWidth: 580,
          }}>
            A few facts up front, so you know exactly what happens with what you write here.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
          {[
            {
              label: "Your journal stays yours.",
              body: "We never train any AI on your data. Your journal entries are processed by AI only to generate the coaching responses you see — the same way Google processes your search query.",
            },
            {
              label: "No one reads your journal unless you ask.",
              body: "If you have a 1:1 coach, you'll see a clear \u201CShare with coach\u201D button on any entry you want them to see. Until you tap that, your journal text is private.",
            },
            {
              label: "You can delete everything, anytime.",
              body: (
                <>
                  Account → Delete data. We remove everything within 30 days. This is your legal right under GDPR/CCPA — see the{" "}
                  <a href="/privacy-policy" style={{ color: colors.coral, textDecoration: "underline" }}>privacy policy</a> for details.
                </>
              ),
            },
            {
              label: "Aggregated analytics, never individual responses.",
              body: "We look at anonymized patterns across the program to improve exercises. We never look at your individual responses unless you flag something for our review.",
            },
          ].map((item, i) => (
            <FadeIn key={i} preset="slide-up" delay={i * 0.08} triggerOnMount>
              <div style={{
                padding: "18px 22px",
                borderRadius: 14,
                backgroundColor: colors.bgSurface,
                border: `1px solid ${colors.borderSubtle}`,
              }}>
                <p style={{
                  fontSize: 16, fontWeight: 700, color: colors.textPrimary,
                  margin: "0 0 6px 0", fontFamily: display,
                }}>
                  {item.label}
                </p>
                <p style={{
                  fontSize: 15, color: colors.textPrimary, margin: 0,
                  lineHeight: 1.6, fontFamily: body, opacity: 0.85,
                }}>
                  {item.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn preset="fade" delay={0.3} triggerOnMount>
          <motion.button
            whileHover={!saving ? { scale: 1.04, boxShadow: "0 8px 24px rgba(196,148,58,0.35)" } : {}}
            whileTap={!saving ? { scale: 0.97 } : {}}
            onClick={handleComplete}
            disabled={saving}
            style={{
              marginTop: 8, padding: "14px 36px", fontSize: 15, fontWeight: 700,
              color: colors.bgDeep,
              backgroundColor: saving ? colors.bgElevated : colors.coral,
              border: "none", borderRadius: 100,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: display, letterSpacing: "0.01em",
              transition: "background-color 0.2s",
            }}
          >
            {saving ? "Starting your program..." : "Begin Program"}
          </motion.button>
        </FadeIn>
      </Shell>
    );
  }

  /* ── Step 4: Complete ── */
  if (step === "complete" && selectedProgram) {
    return (
      <Shell>
        <FadeIn preset="scale" triggerOnMount>
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                width: 72, height: 72, borderRadius: "50%",
                background: `linear-gradient(135deg, ${colors.coralWash} 0%, ${colors.coralWash} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 28px", fontSize: 30, color: colors.coral,
              }}
            >
              ✓
            </motion.div>
            <h1 style={{
              fontFamily: display, fontSize: 32, fontWeight: 700,
              letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 14px 0",
            }}>
              You&apos;re in.
            </h1>
            <p style={{
              fontSize: 16, color: colors.textPrimary, lineHeight: 1.65,
              maxWidth: 460, margin: "0 auto 8px", fontFamily: body,
            }}>
              <strong style={{ color: colors.coral }}>{selectedProgram.name}</strong> starts now. Your first three
              days are onboarding — the exercises double as intake. After Day 3,
              your coaching intelligence generates your six goals.
            </p>
            <p style={{
              fontSize: 15, color: colors.textPrimary, lineHeight: 1.65,
              maxWidth: 460, margin: "0 auto 36px", fontFamily: body,
            }}>
              The deeper work starts in the daily flow. Go at your pace.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(196,148,58,0.35)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "14px 36px", fontSize: 15, fontWeight: 700,
                color: colors.bgDeep, backgroundColor: colors.coral,
                border: "none", borderRadius: 100, cursor: "pointer",
                fontFamily: display, letterSpacing: "0.01em",
              }}
            >
              Go to Dashboard
            </motion.button>
          </div>
        </FadeIn>
      </Shell>
    );
  }

  return null;
}
