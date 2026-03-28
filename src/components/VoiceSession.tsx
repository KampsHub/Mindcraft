"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface VoiceSessionProps {
  enrollmentId: string;
  onTranscript?: (text: string) => void;
}

export default function VoiceSession({ enrollmentId, onTranscript }: VoiceSessionProps) {
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const roomRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startSession = useCallback(async () => {
    setStatus("connecting");
    try {
      const res = await fetch("/api/voice/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to connect");
      }
      const { token, url, room } = await res.json();

      // Dynamic import to avoid SSR issues
      const { Room, RoomEvent } = await import("livekit-client");
      const lkRoom = new Room();
      roomRef.current = lkRoom;

      // Listen for transcription data
      lkRoom.on(RoomEvent.TranscriptionReceived, (segments: any[]) => {
        const text = segments.map((s: any) => s.text).join(" ");
        setTranscript((prev) => prev + " " + text);
      });

      await lkRoom.connect(url, token);
      await lkRoom.localParticipant.setMicrophoneEnabled(true);

      setStatus("connected");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch (err) {
      console.error("Voice session error:", err);
      setStatus("error");
    }
  }, [enrollmentId]);

  const endSession = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (transcript.trim() && onTranscript) {
      onTranscript(transcript.trim());
    }
    setStatus("idle");
  }, [transcript, onTranscript]);

  const toggleMute = useCallback(async () => {
    if (roomRef.current) {
      const newMuted = !muted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuted);
      setMuted(newMuted);
    }
  }, [muted]);

  if (status === "idle") {
    return (
      <button
        onClick={startSession}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: display, fontSize: 14, fontWeight: 600,
          padding: "12px 24px", borderRadius: 100,
          backgroundColor: "transparent",
          color: colors.coral,
          border: `1.5px solid ${colors.coral}`,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.coralWash;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
        Talk to Your Coach Assistant
      </button>
    );
  }

  if (status === "connecting") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 20px", borderRadius: 14,
        backgroundColor: colors.bgSurface,
        border: `1px solid ${colors.borderDefault}`,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          backgroundColor: colors.coral,
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
        <span style={{ fontFamily: body, fontSize: 14, color: colors.textPrimary }}>
          Connecting to voice session...
        </span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{
        padding: "14px 20px", borderRadius: 14,
        backgroundColor: colors.bgSurface,
        border: `1px solid ${colors.errorWash}`,
      }}>
        <p style={{ fontFamily: body, fontSize: 14, color: colors.error, margin: "0 0 8px 0" }}>
          Voice connection failed. Check your microphone permissions.
        </p>
        <button
          onClick={() => setStatus("idle")}
          style={{
            fontFamily: display, fontSize: 13, fontWeight: 600,
            padding: "8px 16px", borderRadius: 100,
            backgroundColor: colors.bgElevated, color: colors.textPrimary,
            border: `1px solid ${colors.borderDefault}`, cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Connected state
  return (
    <div style={{
      padding: "20px", borderRadius: 14,
      backgroundColor: colors.bgSurface,
      border: `1.5px solid ${colors.coral}66`,
      background: `linear-gradient(135deg, ${colors.bgSurface} 0%, ${colors.coralWash} 100%)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            backgroundColor: "#4ade80",
            boxShadow: "0 0 8px rgba(74, 222, 128, 0.5)",
          }} />
          <span style={{ fontFamily: display, fontSize: 13, fontWeight: 600, color: colors.textPrimary, letterSpacing: "0.02em" }}>
            LIVE — {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Audio visualization placeholder */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 60, marginBottom: 16,
        borderRadius: 10, backgroundColor: colors.bgElevated,
      }}>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2,
              height: muted ? 4 : `${8 + Math.random() * 24}px`,
              backgroundColor: muted ? colors.textMuted : colors.coral,
              transition: "height 0.15s ease",
              animation: muted ? "none" : `audioBar 0.8s ease-in-out ${i * 0.05}s infinite alternate`,
            }} />
          ))}
        </div>
      </div>

      {/* Transcript preview */}
      {transcript && (
        <div style={{
          padding: "10px 14px", borderRadius: 10,
          backgroundColor: colors.bgElevated,
          marginBottom: 16, maxHeight: 80, overflow: "auto",
        }}>
          <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, margin: 0, lineHeight: 1.5 }}>
            {transcript.slice(-200)}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={toggleMute}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: display, fontSize: 13, fontWeight: 600,
            padding: "10px 16px", borderRadius: 100,
            backgroundColor: muted ? colors.errorWash : colors.bgElevated,
            color: muted ? colors.error : colors.textPrimary,
            border: `1px solid ${muted ? colors.errorWash : colors.borderDefault}`,
            cursor: "pointer",
          }}
        >
          {muted ? (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" x2="23" y1="1" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.5-.36 2.18" /><line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          ) : (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}
          {muted ? "Unmute" : "Mute"}
        </button>
        <button
          onClick={endSession}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: display, fontSize: 13, fontWeight: 600,
            padding: "10px 16px", borderRadius: 100,
            backgroundColor: colors.coral, color: colors.bgDeep,
            border: "none", cursor: "pointer",
          }}
        >
          End Session
        </button>
      </div>
    </div>
  );
}
