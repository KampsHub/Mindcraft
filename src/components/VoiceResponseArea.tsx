"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import PulseRing from "@/components/PulseRing";

const display = fonts.display;
const body = fonts.bodyAlt;

interface VoiceResponseAreaProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function VoiceResponseArea({ value, onChange, placeholder = "Tap to respond", disabled = false }: VoiceResponseAreaProps) {
  const [mode, setMode] = useState<"mic" | "text">("mic");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { setMode("text"); return; } // Fallback to text if no speech support
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) text += event.results[i][0].transcript;
        }
        if (text) onChange(value ? value + " " + text : text);
      };
      recognition.onend = () => { setListening(false); recognitionRef.current = null; };
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } catch { setMode("text"); }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  };

  if (disabled) {
    return value ? (
      <div style={{
        padding: "14px 18px", borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.04)",
      }}>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: 0, fontFamily: body, lineHeight: 1.6, fontStyle: "italic" }}>
          &ldquo;{value}&rdquo;
        </p>
      </div>
    ) : null;
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {mode === "mic" ? (
          <motion.div
            key="mic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 0" }}
          >
            {/* Transcribed text so far */}
            {value && (
              <div style={{
                padding: "12px 16px", borderRadius: 12, width: "100%",
                backgroundColor: "rgba(255,255,255,0.04)",
                marginBottom: 8,
              }}>
                <p style={{ fontSize: 15, color: "#ffffff", margin: 0, fontFamily: body, lineHeight: 1.6 }}>
                  {value}
                </p>
              </div>
            )}

            {/* Mic button with pulse */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PulseRing active={listening} size={64} />
              <motion.button
                whileHover={!listening ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={listening ? stopListening : startListening}
                style={{
                  width: 64, height: 64, borderRadius: "50%",
                  backgroundColor: listening ? "#f87171" : colors.coral,
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: listening
                    ? "0 0 24px rgba(248, 113, 113, 0.4)"
                    : "0 4px 20px rgba(196, 148, 58, 0.25)",
                  transition: "background-color 0.2s, box-shadow 0.2s",
                  position: "relative", zIndex: 1,
                }}
              >
                {listening ? (
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="#ffffff">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.bgDeep} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                )}
              </motion.button>
            </div>

            <p style={{
              fontSize: 13, color: listening ? "#f87171" : "rgba(255,255,255,0.4)",
              fontFamily: display, fontWeight: 600,
            }}>
              {listening ? "Listening — tap to stop" : placeholder}
            </p>

            {/* Type instead link */}
            <button
              onClick={() => { stopListening(); setMode("text"); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: body,
                textDecoration: "underline", padding: 0,
              }}
            >
              Type instead
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ position: "relative" }}>
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Write your response..."
                style={{
                  width: "100%", minHeight: 120,
                  padding: "16px 48px 16px 16px",
                  fontSize: 15, lineHeight: 1.65,
                  backgroundColor: colors.bgInput,
                  border: `1px solid ${colors.borderDefault}`,
                  color: "#ffffff", borderRadius: 12,
                  resize: "vertical", outline: "none",
                  fontFamily: body, boxSizing: "border-box",
                }}
              />
              {/* Small mic button in corner for quick voice add */}
              <button
                onClick={startListening}
                style={{
                  position: "absolute", right: 10, bottom: 10,
                  width: 32, height: 32, borderRadius: "50%",
                  backgroundColor: colors.coralWash, border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => setMode("mic")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: body,
                textDecoration: "underline", padding: "8px 0 0 0",
              }}
            >
              Switch to voice
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
