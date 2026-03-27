"use client";

import { useState, useRef, useCallback } from "react";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface VoiceToTextProps {
  onTranscript: (text: string) => void;
}

export default function VoiceToText({ onTranscript }: VoiceToTextProps) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    setError(null);
    setInterimText("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Check your browser permissions.");
      } else if (event.error === "no-speech") {
        // Ignore — just means silence
      } else {
        setError(`Voice error: ${event.error}. Try again.`);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimText("");
  }, []);

  return (
    <div style={{
      marginTop: 10,
      padding: "20px",
      borderRadius: 14,
      backgroundColor: colors.bgSurface,
      border: `1px solid ${listening ? "rgba(224, 149, 133, 0.4)" : colors.borderDefault}`,
      textAlign: "center",
    }}>
      <p style={{
        fontFamily: display, fontSize: 15, fontWeight: 600,
        color: "#ffffff", margin: "0 0 6px 0",
      }}>
        {listening ? "Listening..." : "Speak your entry"}
      </p>
      <p style={{
        fontFamily: body, fontSize: 13, color: "rgba(255,255,255,0.5)",
        margin: "0 0 16px 0",
      }}>
        {listening ? "Tap the mic to stop" : "Your words will be transcribed into the journal above"}
      </p>

      <button
        onClick={listening ? stopListening : startListening}
        style={{
          width: 64, height: 64, borderRadius: "50%",
          backgroundColor: listening ? "#f87171" : colors.coral,
          border: "none", cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          boxShadow: listening ? "0 0 20px rgba(248, 113, 113, 0.4)" : "0 4px 16px rgba(224, 149, 133, 0.3)",
          transition: "all 0.2s",
        }}
      >
        {listening ? (
          <svg width={24} height={24} viewBox="0 0 24 24" fill={colors.bgDeep}>
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.bgDeep} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        )}
      </button>

      {interimText && (
        <p style={{
          fontFamily: body, fontSize: 14, color: "rgba(255,255,255,0.6)",
          marginTop: 12, fontStyle: "italic",
        }}>
          {interimText}
        </p>
      )}

      {error && (
        <p style={{
          fontFamily: body, fontSize: 13, color: "#f87171",
          marginTop: 12,
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
