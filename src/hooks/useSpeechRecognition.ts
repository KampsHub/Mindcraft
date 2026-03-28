"use client";

import { useState, useRef, useCallback } from "react";

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onResult?: (text: string, isFinal: boolean) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    continuous = true,
    interimResults = true,
    lang = "en-US",
    onResult,
  } = options;

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<any>(null);
  const intentRef = useRef(false); // User's intent to record

  const isSupported = typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const start = useCallback(() => {
    if (!isSupported) return false;
    if (recognitionRef.current) return true; // Already running

    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;

      let finalText = "";

      recognition.onresult = (event: any) => {
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += (finalText ? " " : "") + t;
            onResult?.(t, true);
          } else {
            interimText += t;
          }
        }
        setTranscript(finalText);
        setInterim(interimText);
      };

      recognition.onerror = (event: any) => {
        if (event.error === "aborted") return;
        if (event.error === "no-speech") {
          // Silence detected — restart if user still wants to record
          return;
        }
        console.warn("Speech recognition error:", event.error);
      };

      recognition.onend = () => {
        setInterim("");
        // Only restart if user hasn't explicitly stopped
        if (intentRef.current) {
          try {
            recognition.start();
            return;
          } catch {
            // Fall through to cleanup
          }
        }
        setListening(false);
        recognitionRef.current = null;
      };

      intentRef.current = true;
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
      return true;
    } catch {
      intentRef.current = false;
      return false;
    }
  }, [continuous, interimResults, lang, onResult, isSupported]);

  const stop = useCallback(() => {
    intentRef.current = false; // Signal intent to stop FIRST
    const ref = recognitionRef.current;
    recognitionRef.current = null;
    if (ref) {
      try { ref.stop(); } catch { /* already stopped */ }
    }
    setListening(false);
    setInterim("");
  }, []);

  const reset = useCallback(() => {
    stop();
    setTranscript("");
  }, [stop]);

  return {
    listening,
    transcript,
    interim,
    isSupported,
    start,
    stop,
    reset,
    setTranscript,
  };
}
