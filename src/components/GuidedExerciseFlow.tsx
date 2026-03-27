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

type FlowState = "reading" | "breathing" | "listening" | "review" | "done";

export default function GuidedExerciseFlow({
  exerciseName, instructions, whyNow, onComplete, onClose,
}: GuidedExerciseFlowProps) {
  const [state, setState] = useState<FlowState>("reading");
  const [currentSentence, setCurrentSentence] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [editedTranscript, setEditedTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Split instructions into sentences
  const sentences = instructions.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

  // Read aloud one sentence at a time
  const readNextSentence = useCallback((index: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      // No TTS support — show all text and skip to listening
      setCurrentSentence(sentences.length);
      setState("breathing");
      setTimeout(() => setState("listening"), 2000);
      return;
    }

    if (index >= sentences.length) {
      // Done reading — breathing pause then listen
      setState("breathing");
      setTimeout(() => setState("listening"), 2500);
      return;
    }

    setCurrentSentence(index + 1);
    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Samantha") || v.name.includes("Karen") ||
      v.name.includes("Google UK English Female")
    );
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => {
      // Small pause between sentences
      setTimeout(() => readNextSentence(index + 1), 400);
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [sentences]);

  // Start reading when component mounts
  useEffect(() => {
    const timer = setTimeout(() => readNextSentence(0), 800);
    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-start listening when state changes to "listening"
  useEffect(() => {
    if (state !== "listening") return;
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) text += event.results[i][0].transcript;
        }
        if (text) setTranscript(prev => prev ? prev + " " + text : text);
      };
      recognition.onend = () => { recognitionRef.current = null; };
      recognitionRef.current = recognition;
      recognition.start();
    } catch { /* no speech support */ }
  }, [state]);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setEditedTranscript(transcript);
    setState("review");
  };

  const handleDone = () => {
    const finalText = editedTranscript || transcript;
    onComplete(finalText);
    setState("done");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: colors.bgDeep,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
        overflow: "auto",
      }}
    >
      {/* Close button */}
      <button
        onClick={() => {
          if (typeof window !== "undefined") window.speechSynthesis.cancel();
          if (recognitionRef.current) recognitionRef.current.stop();
          onClose();
        }}
        style={{
          position: "absolute", top: 20, right: 20,
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.4)", fontSize: 24,
        }}
      >
        ✕
      </button>

      {/* Exercise name */}
      <p style={{
        fontSize: 12, fontWeight: 600, color: colors.coral,
        fontFamily: display, letterSpacing: "0.04em",
        marginBottom: 8,
      }}>
        {exerciseName}
      </p>

      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>

        {/* READING STATE — sentences appear one at a time */}
        {state === "reading" && (
          <motion.div
            key="reading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div style={{ minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {sentences.slice(0, currentSentence).map((s, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: i === currentSentence - 1 ? 1 : 0.4, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    fontSize: 20, color: "#ffffff", lineHeight: 1.8,
                    fontFamily: body, margin: "0 0 16px 0",
                    textAlign: "left",
                  }}
                >
                  {s}
                </motion.p>
              ))}
            </div>
            <button
              onClick={() => {
                if (typeof window !== "undefined") window.speechSynthesis.cancel();
                setCurrentSentence(sentences.length);
                setState("breathing");
                setTimeout(() => setState("listening"), 2000);
              }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: body,
                marginTop: 20,
              }}
            >
              Skip to respond →
            </button>
          </motion.div>
        )}

        {/* BREATHING STATE — pause before listening */}
        {state === "breathing" && (
          <motion.div
            key="breathing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 80, height: 80, borderRadius: "50%",
                backgroundColor: "rgba(224, 149, 133, 0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                backgroundColor: "rgba(224, 149, 133, 0.3)",
              }} />
            </motion.div>
            <p style={{
              fontSize: 16, color: "rgba(255,255,255,0.5)",
              fontFamily: body,
            }}>
              Take a moment...
            </p>
          </motion.div>
        )}

        {/* LISTENING STATE — mic active */}
        {state === "listening" && (
          <motion.div
            key="listening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
          >
            {transcript && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: "16px 20px", borderRadius: 14, width: "100%",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  textAlign: "left", marginBottom: 8,
                }}
              >
                <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontFamily: body, lineHeight: 1.7 }}>
                  {transcript}
                </p>
              </motion.div>
            )}

            <div style={{ position: "relative" }}>
              <PulseRing active={true} size={80} />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={stopListening}
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  backgroundColor: "#f87171",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 30px rgba(248, 113, 113, 0.4)",
                  position: "relative", zIndex: 1,
                }}
              >
                <svg width={28} height={28} viewBox="0 0 24 24" fill="#ffffff">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </motion.button>
            </div>

            <p style={{
              fontSize: 14, color: "rgba(255,255,255,0.5)",
              fontFamily: display, fontWeight: 600,
            }}>
              Listening — tap to stop
            </p>

            {!transcript && (
              <button
                onClick={() => { stopListening(); setState("review"); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: body,
                  marginTop: 12,
                }}
              >
                Type instead
              </button>
            )}
          </motion.div>
        )}

        {/* REVIEW STATE — edit transcript */}
        {state === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}
          >
            <p style={{
              fontSize: 14, color: "rgba(255,255,255,0.5)",
              fontFamily: display, fontWeight: 600,
            }}>
              Review your response
            </p>
            <textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              placeholder="Type or edit your response..."
              style={{
                width: "100%", minHeight: 150,
                padding: 16, fontSize: 16, lineHeight: 1.7,
                backgroundColor: colors.bgInput,
                border: `1px solid ${colors.borderDefault}`,
                color: "#ffffff", borderRadius: 14,
                resize: "vertical", outline: "none",
                fontFamily: body, boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => { setTranscript(""); setEditedTranscript(""); setState("listening"); }}
                style={{
                  padding: "12px 24px", borderRadius: 100,
                  backgroundColor: "transparent",
                  border: `1px solid ${colors.borderDefault}`,
                  color: "#ffffff", fontSize: 14, fontWeight: 600,
                  fontFamily: display, cursor: "pointer",
                }}
              >
                Redo
              </button>
              <button
                onClick={handleDone}
                style={{
                  padding: "12px 32px", borderRadius: 100,
                  backgroundColor: colors.coral,
                  border: "none",
                  color: colors.bgDeep, fontSize: 14, fontWeight: 600,
                  fontFamily: display, cursor: "pointer",
                }}
              >
                Accept
              </button>
            </div>
          </motion.div>
        )}

        {/* DONE STATE — brief confirmation */}
        {state === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
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
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.bgDeep} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
            <p style={{ fontSize: 16, color: "#ffffff", fontFamily: display, fontWeight: 600 }}>
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
      </div>
    </motion.div>
  );
}
