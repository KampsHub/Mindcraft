"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors } from "@/lib/theme";
import { content as c } from "@/content/site";

export default function InteractiveDemo() {
  const [entry, setEntry] = useState("");
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [typedText, setTypedText] = useState("");
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  // Pick a random reflection and type it out letter by letter
  function handleReflect() {
    if (!entry.trim()) return;
    setLoading(true);
    setReflection("");
    setTypedText("");

    // Simulate a brief delay like a real API call
    setTimeout(() => {
      const reflections = c.interactiveDemo.sampleReflections;
      const chosen = reflections[Math.floor(Math.random() * reflections.length)];
      setReflection(chosen);
      setLoading(false);
    }, 1500);
  }

  // Typing animation for the reflection
  useEffect(() => {
    if (!reflection) return;

    let i = 0;
    setTypedText("");
    typingRef.current = setInterval(() => {
      i++;
      setTypedText(reflection.slice(0, i));
      if (i >= reflection.length) {
        clearInterval(typingRef.current!);
      }
    }, 18);

    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, [reflection]);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {/* Input area */}
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder={c.interactiveDemo.placeholder}
        rows={3}
        style={{
          width: "100%",
          padding: 16,
          fontSize: 16,
          lineHeight: 1.6,
          border: `1px solid ${colors.gray200}`,
          borderRadius: 10,
          resize: "none",
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          backgroundColor: colors.white,
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = colors.primary)}
        onBlur={(e) => (e.target.style.borderColor = colors.gray200)}
        disabled={loading}
      />

      <button
        onClick={handleReflect}
        disabled={loading || !entry.trim()}
        style={{
          marginTop: 12,
          padding: "12px 32px",
          fontSize: 15,
          fontWeight: 600,
          color: colors.white,
          backgroundColor:
            loading || !entry.trim() ? colors.gray400 : colors.primary,
          border: "none",
          borderRadius: 8,
          cursor: loading || !entry.trim() ? "not-allowed" : "pointer",
          transition: "background-color 0.15s",
        }}
      >
        {loading ? c.interactiveDemo.loadingText : c.interactiveDemo.buttonText}
      </button>

      {/* Reflection output */}
      <AnimatePresence>
        {(loading || typedText) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            style={{
              marginTop: 24,
              padding: 20,
              backgroundColor: colors.primaryLight,
              borderRadius: 10,
              borderLeft: `3px solid ${colors.primary}`,
            }}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: colors.gray500,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    border: `2px solid ${colors.gray200}`,
                    borderTopColor: colors.primary,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span style={{ fontSize: 14 }}>
                  {c.interactiveDemo.loadingText}
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            ) : (
              <>
                <p
                  style={{
                    fontSize: 14,
                    color: colors.gray400,
                    margin: "0 0 8px 0",
                    fontStyle: "italic",
                  }}
                >
                  {c.preview.reflectionLabel}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    color: colors.dark,
                    margin: 0,
                    lineHeight: 1.7,
                  }}
                >
                  {typedText}
                  {typedText.length < reflection.length && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 16,
                        backgroundColor: colors.primary,
                        marginLeft: 2,
                        verticalAlign: "text-bottom",
                        animation: "blink 1s step-end infinite",
                      }}
                    />
                  )}
                  <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
