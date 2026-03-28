"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface VoiceCoachProps {
  /** Called with transcribed text when voice session ends */
  onTranscript?: (text: string) => void;
  /** Context for the AI (enrollment, day number, etc.) */
  context?: string;
}

type SessionState = "idle" | "connecting" | "active" | "processing" | "done";

export default function VoiceCoach({ onTranscript, context }: VoiceCoachProps) {
  const [state, setState] = useState<SessionState>("idle");
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    setState("connecting");
    setError(null);
    setTranscript("");

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start recording
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());

        setState("processing");
        const audioBlob = new Blob(chunks, { type: "audio/webm" });

        // Send to transcription endpoint
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        if (context) formData.append("context", context);

        try {
          const res = await fetch("/api/voice-transcribe", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            setTranscript(data.transcript || "");
            onTranscript?.(data.transcript || "");
            setState("done");
          } else {
            setError("Transcription failed. Your words are safe — try again.");
            setState("idle");
          }
        } catch {
          setError("Connection lost. Try again.");
          setState("idle");
        }
      };

      recorder.start(1000); // collect in 1s chunks
      setMediaRecorder(recorder);
      setState("active");

      // Start duration timer
      const id = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
      setIntervalId(id);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Microphone access needed for voice sessions. Check your browser permissions.");
      setState("idle");
    }
  }, [context, onTranscript]);

  const stopSession = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setDuration(0);
  }, [mediaRecorder, intervalId]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{
      borderRadius: 16,
      backgroundColor: "rgba(51, 51, 57, 0.5)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: `1px solid ${colors.borderDefault}`,
      padding: 24,
      textAlign: "center",
    }}>
      <AnimatePresence mode="wait">
        {/* Idle — show start button */}
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p style={{
              fontFamily: display, fontSize: 14, fontWeight: 600,
              color: colors.textPrimary, margin: "0 0 6px 0",
            }}>
              Voice Session
            </p>
            <p style={{
              fontFamily: body, fontSize: 13, color: colors.textMuted,
              margin: "0 0 20px 0", lineHeight: 1.5,
            }}>
              Talk instead of type. Your words will be transcribed and saved as today&apos;s journal entry.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
              style={{
                width: 72, height: 72, borderRadius: "50%",
                backgroundColor: colors.coral,
                border: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 24px ${colors.coralWash}`,
              }}
            >
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.bgDeep} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </motion.button>

            {error && (
              <p style={{
                fontFamily: body, fontSize: 13, color: colors.error,
                marginTop: 14,
              }}>
                {error}
              </p>
            )}
          </motion.div>
        )}

        {/* Connecting */}
        {state === "connecting" && (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p style={{ fontFamily: body, fontSize: 14, color: colors.textPrimary }}>
              Connecting microphone...
            </p>
          </motion.div>
        )}

        {/* Active — recording */}
        {state === "active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Pulsing indicator */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: 16, height: 16, borderRadius: "50%",
                  backgroundColor: colors.error,
                }}
              />
            </div>

            <p style={{
              fontFamily: display, fontSize: 28, fontWeight: 700,
              color: colors.textPrimary, margin: "0 0 4px 0",
              letterSpacing: "0.05em",
            }}>
              {formatTime(duration)}
            </p>
            <p style={{
              fontFamily: body, fontSize: 13, color: colors.textMuted,
              margin: "0 0 20px 0",
            }}>
              Listening... speak freely
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopSession}
              style={{
                width: 72, height: 72, borderRadius: "50%",
                backgroundColor: colors.errorWash,
                border: `2px solid ${colors.error}`,
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 4,
                backgroundColor: colors.error,
              }} />
            </motion.button>
          </motion.div>
        )}

        {/* Processing */}
        {state === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                border: `3px solid ${colors.borderDefault}`,
                borderTopColor: colors.coral,
                margin: "0 auto 16px",
              }}
            />
            <p style={{ fontFamily: body, fontSize: 14, color: colors.textPrimary }}>
              Transcribing your voice session...
            </p>
          </motion.div>
        )}

        {/* Done */}
        {state === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              backgroundColor: "rgba(74, 222, 128, 0.15)",
              border: "2px solid #4ade80",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 12,
            }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p style={{
              fontFamily: display, fontSize: 14, fontWeight: 600,
              color: colors.textPrimary, margin: "0 0 8px 0",
            }}>
              Voice session saved
            </p>
            {transcript && (
              <div style={{
                textAlign: "left", padding: 16, borderRadius: 12,
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${colors.borderDefault}`,
                maxHeight: 200, overflowY: "auto", marginTop: 12,
              }}>
                <p style={{
                  fontFamily: body, fontSize: 14, color: "rgba(255,255,255,0.8)",
                  margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap",
                }}>
                  {transcript}
                </p>
              </div>
            )}
            <button
              onClick={() => { setState("idle"); setTranscript(""); }}
              style={{
                fontFamily: display, fontSize: 12, fontWeight: 600,
                padding: "8px 16px", borderRadius: 100, marginTop: 16,
                backgroundColor: "transparent",
                color: colors.coral, border: `1px solid ${colors.coralWash}`,
                cursor: "pointer",
              }}
            >
              Record again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
