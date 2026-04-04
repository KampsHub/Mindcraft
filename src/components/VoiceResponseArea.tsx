"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, space, text as textScale, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface VoiceResponseAreaProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function VoiceResponseArea({
  value,
  onChange,
  placeholder = "Share your response...",
  disabled = false,
}: VoiceResponseAreaProps) {
  const [mode, setMode] = useState<"idle" | "voice" | "text">("idle");
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && mode === "text") {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [value, mode]);

  // Switch to text mode if speech recognition not supported
  const hasSpeechSupport = typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const startListening = () => {
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { setMode("text"); return; }

      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalText = "";
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += t;
          } else {
            interimText += t;
          }
        }
        if (finalText) {
          onChange(value ? value + " " + finalText : finalText);
          setInterim("");
        } else {
          setInterim(interimText);
        }
      };

      recognition.onend = () => {
        setListening(false);
        setInterim("");
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
      setMode("voice");
    } catch {
      setMode("text");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterim("");
  };

  const switchToText = () => {
    stopListening();
    setMode("text");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const switchToVoice = () => {
    setMode("voice");
    startListening();
  };

  // Disabled / completed state
  if (disabled) {
    return value ? (
      <div style={{
        padding: `${space[3]}px ${space[4]}px`, borderRadius: radii.md,
        backgroundColor: "rgba(255,255,255,0.04)",
      }}>
        <p style={{
          ...textScale.body, color: "rgba(255,255,255,0.7)",
          margin: 0, lineHeight: 1.6, fontStyle: "italic",
        }}>
          &ldquo;{value}&rdquo;
        </p>
      </div>
    ) : null;
  }

  // Already has content — show it with ability to edit
  const hasContent = value.trim().length > 0;

  return (
    <div>
      {/* Show existing response if any */}
      {hasContent && mode !== "text" && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: `${space[3]}px ${space[4]}px`, borderRadius: radii.md,
            backgroundColor: "rgba(255,255,255,0.04)",
            marginBottom: space[3],
          }}
        >
          <p style={{
            ...textScale.body, color: "rgba(255,255,255,0.85)",
            margin: 0,
          }}>
            {value}
          </p>
        </motion.div>
      )}

      {/* Interim voice text */}
      <div aria-live="polite" aria-atomic="false">
        {listening && interim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: `${space[3]}px ${space[4]}px`, borderRadius: radii.md,
              marginBottom: space[3],
            }}
          >
            <p style={{
              ...textScale.body, color: "rgba(255,255,255,0.35)",
              margin: 0, lineHeight: 1.6, fontStyle: "italic",
            }}>
              {interim}
            </p>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ── IDLE: Compact inline pills ── */}
        {mode === "idle" && !hasContent && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              display: "flex", gap: space[2],
            }}
          >
            {hasSpeechSupport && (
              <button
                onClick={switchToVoice}
                aria-label="Start voice recording"
                style={{
                  flex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: space[2],
                  padding: `${space[3]}px ${space[3]}px`,
                  borderRadius: radii.md,
                  backgroundColor: colors.coralWash,
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.coralWash; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.coralWash; }}
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
                  stroke={colors.coral} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                <span style={{
                  ...textScale.secondary, fontWeight: 600, color: colors.coral,
                }}>
                  Speak
                </span>
              </button>
            )}

            <button
              onClick={switchToText}
              aria-label="Type your response"
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: space[2],
                padding: `${space[3]}px ${space[3]}px`,
                borderRadius: radii.md,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.09)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"; }}
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
                stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              <span style={{
                ...textScale.secondary, fontWeight: 600, color: "rgba(255,255,255,0.55)",
              }}>
                Write
              </span>
            </button>
          </motion.div>
        )}

        {/* ── VOICE MODE ── */}
        {(mode === "voice" || (mode === "idle" && hasContent && !listening)) && (
          <motion.div
            key="voice-active"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex", alignItems: "center", gap: space[3],
              padding: `${space[3]}px ${space[3]}px`,
              borderRadius: radii.md,
              backgroundColor: listening ? colors.coralWash : colors.bgInput,
              border: `1px solid ${listening ? colors.coralWash : colors.borderDefault}`,
              transition: "border-color 0.3s, background-color 0.3s",
            }}
          >
            {/* Mic button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              animate={listening ? {
                boxShadow: [
                  `0 0 12px ${colors.errorWash}`,
                  `0 0 24px ${colors.errorWash}`,
                  `0 0 12px ${colors.errorWash}`,
                ],
              } : {}}
              transition={listening ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
              onClick={listening ? stopListening : startListening}
              aria-label={listening ? "Stop recording" : "Start voice recording"}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                backgroundColor: listening ? colors.error : colors.coral,
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: listening
                  ? `0 0 20px ${colors.errorWash}`
                  : `0 2px 8px ${colors.coralWash}`,
                transition: "background-color 0.2s",
              }}
            >
              {listening ? (
                <svg width={18} height={18} viewBox="0 0 24 24" fill={colors.textPrimary}>
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                  stroke={colors.bgDeep} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              )}
            </motion.button>

            {/* Status text + waveform area */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {listening ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Simple waveform bars */}
                  <div style={{ display: "flex", gap: 2, alignItems: "center", height: 24 }}>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [4, 12 + Math.random() * 10, 4],
                        }}
                        transition={{
                          duration: 0.6 + Math.random() * 0.4,
                          repeat: Infinity,
                          delay: i * 0.08,
                          ease: "easeInOut",
                        }}
                        style={{
                          width: 2.5, borderRadius: 2,
                          backgroundColor: colors.error,
                          opacity: 1.0,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{
                    ...textScale.secondary, color: colors.error, fontWeight: 600,
                  }}>
                    Recording... tap to stop
                  </span>
                </div>
              ) : (
                <span style={{
                  ...textScale.secondary, color: colors.coral,
                }}>
                  {hasContent ? "Tap to add more" : "Tap to speak"}
                </span>
              )}
            </div>

            {/* Switch to text button */}
            <button
              onClick={switchToText}
              aria-label="Switch to typing"
              style={{
                width: 36, height: 36, borderRadius: radii.sm,
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
              title="Switch to typing"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* ── TEXT MODE ── */}
        {mode === "text" && (
          <motion.div
            key="text-active"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              position: "relative",
              borderRadius: radii.md,
              backgroundColor: colors.bgInput,
              border: `1px solid ${colors.borderDefault}`,
              overflow: "hidden",
            }}>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                style={{
                  width: "100%",
                  padding: `${space[3]}px 50px ${space[3]}px ${space[4]}px`,
                  fontSize: textScale.body.fontSize, lineHeight: 1.65,
                  backgroundColor: "transparent",
                  border: "none",
                  color: colors.textPrimary,
                  resize: "none", outline: "none",
                  fontFamily: body, boxSizing: "border-box",
                  minHeight: 80,
                }}
              />
              {/* Mic button inside textarea */}
              {hasSpeechSupport && (
                <button
                  onClick={switchToVoice}
                  aria-label="Switch to voice"
                  style={{
                    position: "absolute", right: 10, bottom: 10,
                    width: 34, height: 34, borderRadius: radii.sm,
                    backgroundColor: colors.coralWash,
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.coralWash; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.coralWash; }}
                  title="Switch to voice"
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                    stroke={colors.coral} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
