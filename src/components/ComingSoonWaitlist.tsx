"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

const PROGRAMS = [
  {
    id: "first-time-manager",
    tag: "First-Time Manager",
    title: "You got promoted. So why does managing people feel harder than doing the work?",
    desc: "Lead without losing yourself. The skills that got you here won\u2019t get you through this.",
  },
  {
    id: "global-relocation",
    tag: "Relocation",
    title: "You moved countries for the job. But nobody warned you about the loneliness?",
    desc: "Rebuild routine, social life, and sense of home \u2014 while performing at a job that expects you to hit the ground running.",
  },
  {
    id: "next-move",
    tag: "Next Move",
    title: "You\u2019ve outgrown where you are. But should you push for more here or leave?",
    desc: "Get clarity on the right move \u2014 not just the available one. Navigate the politics, the self-doubt, and the conversations nobody prepares you for.",
  },
];

export default function ComingSoonWaitlist() {
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (programId: string, programTag: string) => {
    const email = emails[programId]?.trim();
    if (!email) {
      setErrors((prev) => ({ ...prev, [programId]: "Enter your email" }));
      return;
    }

    setLoading((prev) => ({ ...prev, [programId]: true }));
    setErrors((prev) => ({ ...prev, [programId]: "" }));

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, program: programTag }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted((prev) => ({ ...prev, [programId]: true }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [programId]: err instanceof Error ? err.message : "Something went wrong",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [programId]: false }));
    }
  };

  return (
    <div style={{ marginTop: 8 }}>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
          textAlign: "left",
        }}
      >
        {PROGRAMS.map((program) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            style={{
              padding: 32,
              backgroundColor: "rgba(24,24,28,0.5)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignSelf: "center",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.06)",
                color: colors.textSecondary,
                fontFamily: display,
                fontWeight: 700,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                padding: "6px 14px",
                borderRadius: 20,
                marginBottom: 16,
              }}
            >
              {program.tag}
            </span>

            <h3
              style={{
                fontFamily: display,
                fontSize: 20,
                fontWeight: 700,
                color: colors.textPrimary,
                lineHeight: 1.3,
                marginBottom: 12,
              }}
            >
              {program.title}
            </h3>

            <p
              style={{
                fontFamily: body,
                fontSize: 15,
                color: colors.textSecondary,
                lineHeight: 1.6,
                marginBottom: 24,
                flex: 1,
              }}
            >
              {program.desc}
            </p>

            <AnimatePresence mode="wait">
              {submitted[program.id] ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: body,
                    fontSize: 14,
                    color: "#8BC48A",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="#8BC48A" />
                    <path
                      d="M5 8L7 10L11 6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  You&apos;re on the list. We&apos;ll email you when it launches.
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  exit={{ opacity: 0, y: -8 }}
                  style={{ display: "flex", gap: 8 }}
                >
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={emails[program.id] || ""}
                    onChange={(e) =>
                      setEmails((prev) => ({ ...prev, [program.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit(program.id, program.tag);
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      fontFamily: body,
                      fontSize: 14,
                      color: colors.textPrimary,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => handleSubmit(program.id, program.tag)}
                    disabled={loading[program.id]}
                    style={{
                      padding: "10px 20px",
                      fontFamily: display,
                      fontSize: 13,
                      fontWeight: 600,
                      color: colors.textPrimary,
                      backgroundColor: "rgba(224,149,133,0.2)",
                      border: "1px solid rgba(224,149,133,0.3)",
                      borderRadius: 8,
                      cursor: loading[program.id] ? "not-allowed" : "pointer",
                      opacity: loading[program.id] ? 0.6 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {loading[program.id] ? "..." : "Notify me"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!submitted[program.id] && (
              <p
                style={{
                  fontFamily: body,
                  fontSize: 12,
                  color: colors.textMuted,
                  marginTop: 10,
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                This program has a waitlist. We&apos;ll notify you as soon as it is released.
              </p>
            )}

            {errors[program.id] && (
              <p
                style={{
                  fontFamily: body,
                  fontSize: 13,
                  color: "#E08585",
                  marginTop: 8,
                }}
              >
                {errors[program.id]}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
