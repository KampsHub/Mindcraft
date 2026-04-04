"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import PulseRing from "@/components/PulseRing";

const display = fonts.display;
const body = fonts.bodyAlt;

interface GuidedExerciseFlowProps {
  exerciseName: string;
  instructions: string;
  whyNow?: string;
  onComplete: (response: string) => void;
  onClose: () => void;
}

type FlowState = "loading" | "speaking" | "listening" | "processing" | "ended" | "error";

interface Turn {
  role: "coach" | "user";
  text: string;
}

export default function GuidedExerciseFlow({
  exerciseName, instructions, whyNow, onComplete, onClose,
}: GuidedExerciseFlowProps) {
  const [state, setState] = useState<FlowState>("loading");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const historyRef = useRef<Array<{ role: string; text: string }>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, liveTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopListening();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get coach response from Claude
  const getCoachResponse = useCallback(async () => {
    const res = await fetch("/api/exercise-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseName,
        instructions,
        whyNow,
        history: historyRef.current,
      }),
    });
    if (!res.ok) throw new Error("Failed to get coach response");
    const data = await res.json();
    return data.text as string;
  }, [exerciseName, instructions, whyNow]);

  // Speak text via ElevenLabs TTS
  const speak = useCallback(async (text: string) => {
    if (!mountedRef.current) return;
    setState("speaking");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        // Fallback to browser TTS if ElevenLabs fails
        return speakBrowserFallback(text);
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      return new Promise<void>((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          // Fallback to browser TTS
          speakBrowserFallback(text).then(resolve);
        };
        audio.play().catch(() => {
          // Autoplay blocked — fallback
          speakBrowserFallback(text).then(resolve);
        });
      });
    } catch {
      return speakBrowserFallback(text);
    }
  }, []);

  // Browser TTS fallback
  const speakBrowserFallback = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes("Samantha") || v.name.includes("Karen")
      );
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Start listening via browser SpeechRecognition
  const startListening = useCallback(() => {
    if (!mountedRef.current) return;
    setState("listening");
    setLiveTranscript("");

    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return;

      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalText = "";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += (finalText ? " " : "") + t;
          } else {
            interim = t;
          }
        }
        setLiveTranscript(finalText + (interim ? " " + interim : ""));
      };

      recognition.onend = () => {
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      // Speech recognition not available
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  // Process a full conversation turn: coach speaks → user listens → send to Claude → repeat
  const doCoachTurn = useCallback(async () => {
    try {
      if (!mountedRef.current) return;
      setState("loading");

      // Get Claude's response
      const coachText = await getCoachResponse();
      if (!mountedRef.current) return;

      // Add to conversation
      historyRef.current.push({ role: "assistant", text: coachText });
      setTurns(prev => [...prev, { role: "coach", text: coachText }]);

      // Speak it
      await speak(coachText);
      if (!mountedRef.current) return;

      // Start listening for user response
      startListening();
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("Coach turn error:", err);
      setErrorMsg("Lost connection. Your progress has been saved.");
      setState("error");
    }
  }, [getCoachResponse, speak, startListening]);

  // Start the conversation on mount
  useEffect(() => {
    doCoachTurn();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // User sends their response
  const sendResponse = useCallback(async () => {
    const text = liveTranscript.trim();
    stopListening();

    if (!text) {
      // Nothing said — just go back to listening
      startListening();
      return;
    }

    // Add user turn
    setTurns(prev => [...prev, { role: "user", text }]);
    historyRef.current.push({ role: "user", text });
    setLiveTranscript("");

    // Get next coach response
    await doCoachTurn();
  }, [liveTranscript, stopListening, startListening, doCoachTurn]);

  // End the session
  const endSession = useCallback(() => {
    stopListening();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();

    // Build transcript for saving
    const fullTranscript = turns
      .map(t => `${t.role === "coach" ? "Coach Assistant" : "You"}: ${t.text}`)
      .join("\n\n");

    setState("ended");
    onComplete(fullTranscript);
  }, [turns, stopListening, onComplete]);

  const handleClose = useCallback(() => {
    stopListening();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    onClose();
  }, [stopListening, onClose]);

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
        padding: "max(40px, env(safe-area-inset-top, 40px)) 24px max(24px, env(safe-area-inset-bottom, 24px))",
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: "absolute", top: "max(20px, env(safe-area-inset-top, 20px))", right: 20,
          background: "none", border: "none", cursor: "pointer",
          color: colors.textMuted, fontSize: 24,
          zIndex: 10,
        }}
      >
        &#10005;
      </button>

      {/* Exercise name */}
      <p style={{
        fontSize: 13, fontWeight: 600, color: colors.coral,
        fontFamily: display, letterSpacing: "0.02em",
        marginBottom: 24, marginTop: 0,
      }}>
        {exerciseName}
      </p>

      {/* Central orb — shows state */}
      <div style={{
        position: "relative",
        width: 88, height: 88,
        marginBottom: 28,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <PulseRing
          active={state === "speaking"}
          size={72}
          color={colors.coral}
        />
        <PulseRing
          active={state === "listening"}
          size={72}
          color="#4ade80"
        />
        <motion.div
          animate={{
            scale: (state === "speaking" || state === "listening") ? [1, 1.06, 1] : 1,
            backgroundColor:
              state === "speaking" ? "rgba(196, 148, 58, 0.12)"
              : state === "listening" ? "rgba(74, 222, 128, 0.12)"
              : state === "loading" || state === "processing" ? "rgba(255,255,255,0.06)"
              : "rgba(255,255,255,0.04)",
          }}
          transition={{
            duration: 2, repeat: (state === "speaking" || state === "listening") ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{
            width: 64, height: 64, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 1,
          }}
        >
          {(state === "loading" || state === "processing") ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{
                width: 20, height: 20, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.1)",
                borderTopColor: colors.coral,
              }}
            />
          ) : (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
              stroke={state === "speaking" ? colors.coral : state === "listening" ? "#4ade80" : "rgba(255,255,255,0.25)"}
              strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}
        </motion.div>
      </div>

      {/* State label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            fontSize: 12, fontFamily: display, fontWeight: 600,
            color: state === "speaking" ? colors.coral
              : state === "listening" ? "#4ade80"
              : colors.textMuted,
            letterSpacing: "0.03em",
            marginBottom: 20,
          }}
        >
          {state === "loading" ? "Thinking..."
            : state === "speaking" ? "Coach assistant speaking..."
            : state === "listening" ? "Your turn \u2014 speak now"
            : state === "processing" ? "Thinking..."
            : ""}
        </motion.p>
      </AnimatePresence>

      {/* Transcript area */}
      {(state !== "ended" && state !== "error") && (
        <div
          ref={scrollRef}
          style={{
            flex: 1, width: "100%", maxWidth: 520,
            overflowY: "auto", paddingBottom: 16,
            maskImage: "linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
          }}
        >
          <div style={{ paddingTop: 16 }}>
            {turns.map((turn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  marginBottom: 20,
                  textAlign: turn.role === "coach" ? "left" : "right",
                }}
              >
                <p style={{
                  fontSize: 15, lineHeight: 1.75,
                  color: turn.role === "coach" ? "rgba(255,255,255,0.9)" : "#4ade80",
                  fontFamily: body,
                  margin: 0,
                }}>
                  {turn.text}
                </p>
              </motion.div>
            ))}

            {/* Live transcript while listening */}
            <div aria-live="polite" aria-atomic="false">
              {state === "listening" && liveTranscript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: "right", marginBottom: 16 }}
                >
                  <p style={{
                    fontSize: 15, lineHeight: 1.75,
                    color: "rgba(74, 222, 128, 0.5)",
                    fontFamily: body, fontStyle: "italic",
                    margin: 0,
                  }}>
                    {liveTranscript}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      {state === "listening" && (
        <div style={{
          paddingTop: 12,
          display: "flex", gap: 12, justifyContent: "center",
        }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            animate={liveTranscript.trim() ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={liveTranscript.trim() ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
            onClick={sendResponse}
            style={{
              padding: liveTranscript.trim() ? "14px 36px" : "12px 28px",
              borderRadius: 100,
              backgroundColor: liveTranscript.trim() ? "#4ade80" : colors.bgElevated,
              border: liveTranscript.trim() ? "none" : `1px solid ${colors.borderDefault}`,
              color: liveTranscript.trim() ? colors.bgDeep : "rgba(255,255,255,0.5)",
              fontSize: liveTranscript.trim() ? 16 : 14, fontWeight: 700,
              fontFamily: display, cursor: "pointer",
              boxShadow: liveTranscript.trim() ? "0 0 20px rgba(74, 222, 128, 0.4)" : "none",
              transition: "padding 0.2s, font-size 0.2s, box-shadow 0.2s",
            }}
          >
            {liveTranscript.trim() ? "Send" : "Skip"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={endSession}
            style={{
              padding: "12px 24px", borderRadius: 100,
              backgroundColor: "transparent",
              border: `1px solid ${colors.borderDefault}`,
              color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600,
              fontFamily: display, cursor: "pointer",
            }}
          >
            End &amp; Save
          </motion.button>
        </div>
      )}

      {state === "speaking" && (
        <div style={{ paddingTop: 12, display: "flex", justifyContent: "center" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={endSession}
            style={{
              padding: "10px 20px", borderRadius: 100,
              backgroundColor: "transparent",
              border: `1px solid rgba(255,255,255,0.15)`,
              color: "rgba(255,255,255,0.35)", fontSize: 13,
              fontFamily: display, cursor: "pointer",
            }}
          >
            End &amp; Save
          </motion.button>
        </div>
      )}

      {/* ERROR */}
      {state === "error" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
            maxWidth: 400, textAlign: "center",
          }}
        >
          <p style={{
            fontSize: 15, color: colors.error, fontFamily: body, margin: 0,
          }}>
            {errorMsg || "Something went wrong."}
          </p>
          <button
            onClick={handleClose}
            style={{
              padding: "10px 24px", borderRadius: 100,
              backgroundColor: "transparent",
              border: `1px solid ${colors.borderDefault}`,
              color: colors.textPrimary, fontSize: 14,
              fontFamily: display, fontWeight: 600,
              cursor: "pointer", marginTop: 8,
            }}
          >
            Close
          </button>
        </motion.div>
      )}

      {/* ENDED */}
      {state === "ended" && (
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
            fontSize: 16, color: colors.textPrimary,
            fontFamily: display, fontWeight: 600,
          }}>
            Session saved
          </p>
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px", borderRadius: 100,
              backgroundColor: "transparent",
              border: `1px solid ${colors.borderDefault}`,
              color: colors.textPrimary, fontSize: 14,
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
