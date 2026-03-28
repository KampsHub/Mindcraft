"use client";

import { useState, useRef, useCallback } from "react";

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string): Promise<void> => {
    setSpeaking(true);

    try {
      // Try ElevenLabs first
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        return new Promise<void>((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            setSpeaking(false);
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            speakBrowserFallback(text).then(() => { setSpeaking(false); resolve(); });
          };
          audio.play().catch(() => {
            speakBrowserFallback(text).then(() => { setSpeaking(false); resolve(); });
          });
        });
      }
    } catch {
      // Fall through to browser TTS
    }

    await speakBrowserFallback(text);
    setSpeaking(false);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { speaking, speak, stop };
}

function speakBrowserFallback(text: string): Promise<void> {
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
}
