"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import { trackEvent } from "@/components/GoogleAnalytics";
import Logo from "@/components/Logo";

const display = fonts.display;
const body = fonts.bodyAlt;

/* ── Form state ── */
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  situation: string;
  sixMonthGoal: string;
  funding: string;
  budget: string;
  referral: string;
  anythingElse: string;
}

const initial: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  location: "",
  situation: "",
  sixMonthGoal: "",
  funding: "",
  budget: "",
  referral: "",
  anythingElse: "",
};

const TOTAL_SCREENS = 9; // 0=intro, 1-8=questions

/* ── Shared styles ── */
const labelStyle: React.CSSProperties = {
  fontFamily: body,
  fontSize: 13,
  fontWeight: 600,
  color: colors.textSecondary,
  marginBottom: 8,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: body,
  fontSize: 16,
  color: colors.textPrimary,
  backgroundColor: colors.bgSurface,
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: 10,
  padding: "14px 16px",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color 0.2s",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 120,
  resize: "vertical" as const,
  lineHeight: 1.6,
};

const optionBase: React.CSSProperties = {
  width: "100%",
  fontFamily: body,
  fontSize: 15,
  fontWeight: 500,
  color: colors.textPrimary,
  backgroundColor: colors.bgSurface,
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: 10,
  padding: "14px 20px",
  cursor: "pointer",
  textAlign: "left" as const,
  transition: "all 0.2s",
};

export default function ApplyPage() {
  const [screen, setScreen] = useState(0);
  const [form, setForm] = useState<FormData>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  function set<K extends keyof FormData>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canAdvance(): boolean {
    if (screen === 1) return !!(form.firstName && form.lastName && form.email);
    if (screen === 3) return !!form.situation;
    if (screen === 4) return !!form.sixMonthGoal;
    return true;
  }

  function next() {
    if (!canAdvance()) return;
    setDirection(1);
    setScreen((s) => Math.min(s + 1, TOTAL_SCREENS));
  }

  function prev() {
    setDirection(-1);
    setScreen((s) => Math.max(s - 1, 0));
  }

  function selectAndAdvance<K extends keyof FormData>(key: K, value: string) {
    set(key, value);
    setTimeout(() => {
      setDirection(1);
      setScreen((s) => Math.min(s + 1, TOTAL_SCREENS));
    }, 250);
  }

  async function submit() {
    if (!canAdvance()) return;
    setSubmitting(true);
    setError(null);
    trackEvent("coaching_application_submit", { funding: form.funding, budget: form.budget });
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const body = await res.json().catch(() => null);
        console.error("Submit failed:", res.status, body);
        setError("Something went wrong. Please try again or email us directly at crew@allmindsondeck.com.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  /* ── Done screen ── */
  if (done) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ marginBottom: 32 }}><Logo /></div>
          <h1 style={{ fontFamily: display, fontSize: 28, fontWeight: 700, color: colors.textPrimary, marginBottom: 16 }}>
            Thank you.
          </h1>
          <p style={{ fontFamily: body, fontSize: 16, color: colors.textSecondary, lineHeight: 1.7, marginBottom: 32 }}>
            We&rsquo;ll get back to you within two business days with next steps or a recommendation from our network.
          </p>
          <a href="/" style={{ fontFamily: display, fontSize: 15, fontWeight: 600, padding: "14px 36px", borderRadius: 8, backgroundColor: colors.coral, color: "#ffffff", textDecoration: "none" }}>
            Back to Mindcraft
          </a>
        </motion.div>
      </div>
    );
  }

  /* ── Progress bar ── */
  const progress = screen === 0 ? 0 : screen / (TOTAL_SCREENS - 1);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, display: "flex", flexDirection: "column" }}>
      {/* Progress */}
      {screen > 0 && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.bgSurface, zIndex: 10 }}>
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", backgroundColor: colors.coral }}
          />
        </div>
      )}

      {/* Nav */}
      {screen > 0 && (
        <div style={{ position: "fixed", top: 16, left: 24, zIndex: 10 }}>
          <button onClick={prev} style={{ fontFamily: body, fontSize: 14, color: colors.textMuted, background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}>
            ← Back
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={screen}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {screen === 0 && <IntroScreen onStart={next} />}
              {screen === 1 && <AboutYou form={form} set={set} onNext={next} />}
              {screen === 2 && <SelectScreen question="Where are you based?" subtext="We coach during North American business hours." options={["United States", "UK", "Germany", "Other"]} value={form.location} onSelect={(v) => selectAndAdvance("location", v)} allowOtherText />}
              {screen === 3 && <TextareaScreen question="What's going on right now?" subtext="In a few sentences, tell us what you're navigating and what prompted you to look for coaching." value={form.situation} onChange={(v) => set("situation", v)} onNext={next} required />}
              {screen === 4 && <TextareaScreen question="Looking six months out, what would make this investment worth it for you?" value={form.sixMonthGoal} onChange={(v) => set("sixMonthGoal", v)} onNext={next} required />}
              {screen === 5 && <SelectScreen question="How is coaching being funded?" subtext="This helps us recommend the right structure." options={["My employer is covering it (L&D, onboarding, or ramp-off budget)", "I'm covering it myself", "Not sure yet"]} value={form.funding} onSelect={(v) => selectAndAdvance("funding", v)} />}
              {screen === 6 && <SelectScreen question="What's your monthly budget range?" subtext="If your situation is tight — particularly during a layoff or prolonged search — we have options. We'd rather talk than have cost be the reason you don't reach out." options={["$1,200+", "$900–1,200", "$600–900", "Let's talk"]} value={form.budget} onSelect={(v) => selectAndAdvance("budget", v)} />}
              {screen === 7 && <SelectScreen question="How did you find us?" options={["Client or colleague referral", "LinkedIn or Instagram", "Newsletter or blog", "Google search", "Other"]} value={form.referral} onSelect={(v) => selectAndAdvance("referral", v)} />}
              {screen === 8 && <TextareaScreen question="Anything else?" subtext="Last question." value={form.anythingElse} onChange={(v) => set("anythingElse", v)} onNext={submit} nextLabel={submitting ? "Submitting…" : "Submit"} disabled={submitting} error={error} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Keyboard hint */}
      {screen > 0 && screen < TOTAL_SCREENS && (
        <div style={{ textAlign: "center", padding: "0 24px 32px" }}>
          <p style={{ fontFamily: body, fontSize: 12, color: colors.textMuted }}>
            Press <strong>Enter ↵</strong> to continue
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ Screen Components ═══════════════ */

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: 40 }}><Logo /></div>
      <p style={{ fontFamily: body, fontSize: 17, color: colors.textSecondary, lineHeight: 1.8, marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>
        We&rsquo;re glad you&rsquo;re here. Whether you&rsquo;re navigating a layoff, a PIP, a new role, or something else entirely &mdash; we coach people through career transitions with real stakes. We work in English and German. Fill this out and we&rsquo;ll get back to you within two business days with next steps or a recommendation from our network.
      </p>
      <button
        onClick={onStart}
        style={{
          fontFamily: display, fontSize: 16, fontWeight: 600,
          padding: "16px 48px", borderRadius: 8,
          backgroundColor: colors.coral, color: "#ffffff",
          border: "none", cursor: "pointer",
        }}
      >
        Get started
      </button>
    </div>
  );
}

function AboutYou({ form, set, onNext }: { form: FormData; set: <K extends keyof FormData>(k: K, v: string) => void; onNext: () => void }) {
  const canSubmit = !!(form.firstName && form.lastName && form.email);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && canSubmit) {
      e.preventDefault();
      onNext();
    }
  }

  return (
    <div>
      <h2 style={{ fontFamily: display, fontSize: 28, fontWeight: 700, color: colors.textPrimary, marginBottom: 32 }}>About you</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>First name *</label>
          <input style={inputStyle} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} onKeyDown={handleKeyDown} autoFocus />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Last name *</label>
          <input style={inputStyle} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} onKeyDown={handleKeyDown} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Email *</label>
        <input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} onKeyDown={handleKeyDown} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Phone number</label>
        <input style={inputStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} onKeyDown={handleKeyDown} />
      </div>
      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Company <span style={{ fontWeight: 400, color: colors.textMuted }}>if applicable</span></label>
        <input style={inputStyle} value={form.company} onChange={(e) => set("company", e.target.value)} onKeyDown={handleKeyDown} />
      </div>
      <button
        onClick={onNext}
        disabled={!canSubmit}
        style={{
          fontFamily: display, fontSize: 15, fontWeight: 600,
          padding: "14px 36px", borderRadius: 8,
          backgroundColor: canSubmit ? colors.coral : colors.bgElevated,
          color: canSubmit ? "#ffffff" : colors.textMuted,
          border: "none", cursor: canSubmit ? "pointer" : "default",
          transition: "all 0.2s",
        }}
      >
        Continue
      </button>
    </div>
  );
}

function SelectScreen({ question, subtext, options, value, onSelect, allowOtherText }: {
  question: string;
  subtext?: string;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  allowOtherText?: boolean;
}) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState("");
  const isOther = allowOtherText && !options.slice(0, -1).includes(value) && value !== "";

  return (
    <div>
      <h2 style={{ fontFamily: display, fontSize: 24, fontWeight: 700, color: colors.textPrimary, marginBottom: subtext ? 8 : 28, lineHeight: 1.3 }}>
        {question}
      </h2>
      {subtext && (
        <p style={{ fontFamily: body, fontSize: 14, color: colors.textMuted, lineHeight: 1.6, marginBottom: 28 }}>{subtext}</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt) => {
          const isLastAndOther = allowOtherText && opt === options[options.length - 1];
          const selected = isLastAndOther ? (showOtherInput || isOther) : value === opt;

          if (isLastAndOther) {
            return (
              <div key={opt}>
                <button
                  onClick={() => setShowOtherInput(true)}
                  style={{
                    ...optionBase,
                    borderColor: selected ? colors.coral : colors.borderDefault,
                    backgroundColor: selected ? `${colors.coral}15` : colors.bgSurface,
                  }}
                >
                  {opt}
                </button>
                {(showOtherInput || isOther) && (
                  <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                    <input
                      autoFocus
                      placeholder="Type your country…"
                      value={otherText || (isOther ? value : "")}
                      onChange={(e) => setOtherText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otherText.trim()) {
                          onSelect(otherText.trim());
                        }
                      }}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      onClick={() => { if (otherText.trim()) onSelect(otherText.trim()); }}
                      disabled={!otherText.trim()}
                      style={{
                        fontFamily: display, fontSize: 14, fontWeight: 600,
                        padding: "14px 24px", borderRadius: 10,
                        backgroundColor: otherText.trim() ? colors.coral : colors.bgElevated,
                        color: otherText.trim() ? "#ffffff" : colors.textMuted,
                        border: "none", cursor: otherText.trim() ? "pointer" : "default",
                      }}
                    >
                      OK
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={opt}
              onClick={() => { setShowOtherInput(false); onSelect(opt); }}
              style={{
                ...optionBase,
                borderColor: selected ? colors.coral : colors.borderDefault,
                backgroundColor: selected ? `${colors.coral}15` : colors.bgSurface,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextareaScreen({ question, subtext, value, onChange, onNext, required, nextLabel, disabled, error }: {
  question: string;
  subtext?: string;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  required?: boolean;
  nextLabel?: string;
  disabled?: boolean;
  error?: string | null;
}) {
  const canSubmit = !required || !!value.trim();

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && e.metaKey && canSubmit && !disabled) {
      e.preventDefault();
      onNext();
    }
  }

  return (
    <div>
      <h2 style={{ fontFamily: display, fontSize: 24, fontWeight: 700, color: colors.textPrimary, marginBottom: subtext ? 8 : 20, lineHeight: 1.3 }}>
        {question}
      </h2>
      {subtext && (
        <p style={{ fontFamily: body, fontSize: 14, color: colors.textMuted, lineHeight: 1.6, marginBottom: 20 }}>{subtext}</p>
      )}
      <textarea
        style={textareaStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <div style={{ marginTop: 20 }}>
        <button
          onClick={onNext}
          disabled={!canSubmit || disabled}
          style={{
            fontFamily: display, fontSize: 15, fontWeight: 600,
            padding: "14px 36px", borderRadius: 8,
            backgroundColor: canSubmit && !disabled ? colors.coral : colors.bgElevated,
            color: canSubmit && !disabled ? "#ffffff" : colors.textMuted,
            border: "none", cursor: canSubmit && !disabled ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >
          {nextLabel || "Continue"}
        </button>
        {error && (
          <p style={{ fontFamily: body, fontSize: 14, color: "#e25c5c", marginTop: 12, lineHeight: 1.5 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
