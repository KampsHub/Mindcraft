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

  const isSupported = typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const start = useCallback(() => {
    if (!isSupported) return false;

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

      recognition.onend = () => {
        setListening(false);
        setInterim("");
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
      return true;
    } catch {
      return false;
    }
  }, [continuous, interimResults, lang, onResult, isSupported]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
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
