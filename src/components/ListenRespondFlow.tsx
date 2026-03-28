"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import VoiceResponseArea from "@/components/VoiceResponseArea";

const display = fonts.display;
const body = fonts.bodyAlt;

interface ListenRespondFlowProps {
  exerciseName: string;
  instructions: string;
  whyNow?: string;
  onComplete: (response: string) => void;
  onClose: () => void;
}

type FlowState = "playing" | "paused" | "responding" | "done";

export default function ListenRespondFlow({
  exerciseName, instructions, whyNow, onComplete, onClose,
}: ListenRespondFlowProps) {
  const [state, setState] = useState<FlowState>("playing");
  const [progress, setProgress] = useState(0); // 0–1
  const [response, setResponse] = useState("");
  const [useTTS, setUseTTS] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  // Start playing on mount
  useEffect(() => {
    playInstructions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const playInstructions = useCallback(async () => {
    setState("playing");
    setProgress(0);

    try {
      // Try ElevenLabs first
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: instructions }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.ontimeupdate = () => {
          if (audio.duration) setProgress(audio.currentTime / audio.duration);
        };
        audio.onended = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          if (mountedRef.current) setState("responding");
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          fallbackBrowserTTS();
        };

        await audio.play().catch(() => fallbackBrowserTTS());
        return;
      }
    } catch {
      // Fall through to browser TTS
    }

    fallbackBrowserTTS();
  }, [instructions]);

  const fallbackBrowserTTS = useCallback(() => {
    setUseTTS(false);
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setState("responding");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(instructions);
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Samantha") || v.name.includes("Karen")
    );
    if (preferred) utterance.voice = preferred;

    // Approximate progress
    const words = instructions.split(/\s+/).length;
    const estimatedDuration = words / 2.5; // ~2.5 words/sec at 0.85 rate
    let startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setProgress(Math.min(elapsed / estimatedDuration, 0.95));
    }, 200);

    utterance.onend = () => {
      clearInterval(progressInterval);
      setProgress(1);
      if (mountedRef.current) setState("responding");
    };
    utterance.onerror = () => {
      clearInterval(progressInterval);
      if (mountedRef.current) setState("responding");
    };

    window.speechSynthesis.speak(utterance);
  }, [instructions]);

  const togglePause = () => {
    if (audioRef.current) {
      if (state === "playing") {
        audioRef.current.pause();
        setState("paused");
      } else if (state === "paused") {
        audioRef.current.play();
        setState("playing");
      }
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      if (state === "playing") {
        window.speechSynthesis.pause();
        setState("paused");
      } else if (state === "paused") {
        window.speechSynthesis.resume();
        setState("playing");
      }
    }
  };

  const skipToRespond = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setState("responding");
  };

  const replay = () => {
    playInstructions();
  };

  const handleDone = () => {
    setState("done");
    onComplete(response);
  };

  const handleClose = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    onClose();
  }, [onClose]);

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: colors.bgDeep,
        display: "flex", flexDirection: "column",
        alignItems: "center",
        padding: "40px 24px 24px",
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: "absolute", top: 20, right: 20,
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.4)", fontSize: 24,
          zIndex: 10,
        }}
      >
        &#10005;
      </button>

      {/* Exercise name */}
      <p style={{
        fontSize: 13, fontWeight: 600, color: colors.coral,
        fontFamily: display, letterSpacing: "0.02em",
        marginBottom: 8, marginTop: 0,
      }}>
        {exerciseName}
      </p>

      {/* ── PLAYING / PAUSED ── */}
      {(state === "playing" || state === "paused") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 28, maxWidth: 480, width: "100%",
          }}
        >
          {/* Waveform visualization */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 3, height: 48,
          }}>
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                animate={state === "playing" ? {
                  height: [6, 14 + Math.random() * 20, 6],
                } : { height: 6 }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: state === "playing" ? Infinity : 0,
                  delay: i * 0.06,
                  ease: "easeInOut",
                }}
                style={{
                  width: 3, borderRadius: 2,
                  backgroundColor: colors.coral,
                  opacity: state === "playing" ? 0.6 : 0.2,
                  transition: "opacity 0.3s",
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div style={{
            width: "100%", height: 3, borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}>
            <motion.div
              style={{
                height: "100%", borderRadius: 2,
                backgroundColor: colors.coral,
              }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Play/Pause */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={togglePause}
              style={{
                width: 56, height: 56, borderRadius: "50%",
                backgroundColor: colors.coral,
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(196, 148, 58, 0.25)",
              }}
            >
              {state === "playing" ? (
                <svg width={20} height={20} viewBox="0 0 24 24" fill={colors.bgDeep}>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width={20} height={20} viewBox="0 0 24 24" fill={colors.bgDeep}>
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              )}
            </motion.button>
          </div>

          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.4)",
            fontFamily: body, textAlign: "center",
            margin: 0,
          }}>
            {state === "playing" ? "Listening to instructions..." : "Paused"}
          </p>

          {/* Skip */}
          <button
            onClick={skipToRespond}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: body,
              marginTop: 8,
            }}
          >
            Skip to respond
          </button>
        </motion.div>
      )}

      {/* ── RESPONDING ── */}
      {state === "responding" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            maxWidth: 520, width: "100%",
            paddingTop: 16,
          }}
        >
          {/* Replay button */}
          <div style={{
            display: "flex", justifyContent: "center", marginBottom: 24,
          }}>
            <button
              onClick={replay}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 100,
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "none", cursor: "pointer",
                fontSize: 12, color: "rgba(255,255,255,0.4)",
                fontFamily: display, fontWeight: 600,
              }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              Replay instructions
            </button>
          </div>

          {/* Response area */}
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.4)",
              fontFamily: display, fontWeight: 600,
              marginBottom: 10, letterSpacing: "0.02em",
            }}>
              Your response
            </p>
            <VoiceResponseArea
              value={response}
              onChange={setResponse}
            />
          </div>

          {/* Done button */}
          <div style={{
            paddingTop: 16,
            display: "flex", justifyContent: "center",
          }}>
            <motion.button
              whileHover={response.trim() ? { scale: 1.02 } : {}}
              whileTap={response.trim() ? { scale: 0.97 } : {}}
              onClick={handleDone}
              disabled={!response.trim()}
              style={{
                padding: "12px 32px", borderRadius: 100,
                backgroundColor: response.trim() ? colors.coral : colors.bgElevated,
                border: "none",
                color: response.trim() ? colors.bgDeep : colors.textMuted,
                fontSize: 14, fontWeight: 600,
                fontFamily: display, cursor: response.trim() ? "pointer" : "not-allowed",
              }}
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── DONE ── */}
      {state === "done" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              width: 56, height: 56, borderRadius: "50%",
              backgroundColor: colors.coral,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
              stroke={colors.bgDeep} strokeWidth={3}
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
          <p style={{
            fontSize: 16, color: "#ffffff",
            fontFamily: display, fontWeight: 600,
          }}>
            Response saved
          </p>
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px", borderRadius: 100,
              backgroundColor: "transparent",
              border: `1px solid ${colors.borderDefault}`,
              color: "#ffffff", fontSize: 14,
              fontFamily: display, cursor: "pointer",
              marginTop: 8,
            }}
          >
            Back to exercise
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
