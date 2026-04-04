"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, space, radii, text } from "@/lib/theme";

interface SimMessage {
  id: string;
  role: "ai" | "user" | "coach";
  content: string;
  timestamp: Date;
}

interface AISimulationProps {
  scenario: string;
  aiRole: string;
  userRole: string;
  systemPrompt?: string;
  coachingNudges?: boolean;
  initialMessage?: string;
  onComplete?: (transcript: SimMessage[]) => void;
  onSend?: (message: string, history: SimMessage[]) => Promise<string>;
}

export default function AISimulation({
  scenario,
  aiRole,
  userRole,
  systemPrompt,
  coachingNudges = true,
  initialMessage,
  onComplete,
  onSend,
}: AISimulationProps) {
  const [messages, setMessages] = useState<SimMessage[]>(() => {
    const init: SimMessage[] = [];
    if (initialMessage) {
      init.push({ id: "init", role: "ai", content: initialMessage, timestamp: new Date() });
    }
    return init;
  });
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking]);

  const generateNudge = useCallback((userMsg: string) => {
    if (!coachingNudges) return;
    const lower = userMsg.toLowerCase();
    if (lower.startsWith("sorry") || lower.includes("i apologize")) {
      setNudge("Notice: you started with an apology. Is that the Pleaser? Try leading with data instead.");
    } else if (lower.includes("whatever you think") || lower.includes("up to you")) {
      setNudge("You just deferred the decision. What do YOU need from this conversation?");
    } else if (lower.includes("that's not fair") || lower.includes("you always")) {
      setNudge("That sounded like criticism (Gottman). Try a gentle start-up: 'When X happened, I felt Y.'");
    } else if (userMsg.length < 20) {
      setNudge("Short response — are you withdrawing (stonewalling)? Try saying one more thing.");
    } else {
      setNudge(null);
    }
    if (nudge) setTimeout(() => setNudge(null), 8000);
  }, [coachingNudges, nudge]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isThinking) return;

    const userMessage: SimMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    generateNudge(msg);

    try {
      let aiResponse: string;
      if (onSend) {
        aiResponse = await onSend(msg, [...messages, userMessage]);
      } else {
        // Fallback: simulate a response for sandbox/demo mode
        await new Promise((r) => setTimeout(r, 1500));
        aiResponse = generateDemoResponse(msg, messages.length);
      }

      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: "ai", content: aiResponse, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `ai-err-${Date.now()}`, role: "ai", content: "I need a moment to think about that...", timestamp: new Date() },
      ]);
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const handleEnd = () => {
    setIsEnded(true);
    onComplete?.(messages);
  };

  if (isEnded) {
    return (
      <div style={{ backgroundColor: colors.bgDeep, borderRadius: radii.lg, padding: space[5], fontFamily: fonts.bodyAlt }}>
        <div style={{ ...text.heading, color: colors.textPrimary, marginBottom: space[4] }}>
          Conversation Debrief
        </div>
        <div style={{
          ...text.secondary, color: colors.textMuted, marginBottom: space[5],
        }}>
          {messages.filter((m) => m.role === "user").length} exchanges · Review your transcript below
        </div>

        {/* Transcript */}
        <div style={{ display: "flex", flexDirection: "column", gap: space[3], marginBottom: space[5] }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "80%", padding: `${space[2]}px ${space[3]}px`,
                borderRadius: radii.sm,
                backgroundColor: msg.role === "user" ? colors.coralWash : colors.bgSurface,
                border: `1px solid ${msg.role === "user" ? colors.coral + "44" : colors.borderSubtle}`,
              }}>
                <div style={{ ...text.caption, color: msg.role === "user" ? colors.coral : colors.plumLight, marginBottom: 2 }}>
                  {msg.role === "user" ? userRole : aiRole}
                </div>
                <div style={{ ...text.secondary, color: colors.textPrimary, lineHeight: 1.6 }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reflection prompts */}
        <div style={{
          backgroundColor: colors.bgSurface, borderRadius: radii.md,
          padding: space[4], borderLeft: `3px solid ${colors.coral}`,
        }}>
          <div style={{ ...text.caption, color: colors.coral, marginBottom: space[2] }}>REFLECT</div>
          <div style={{ ...text.body, color: colors.textSecondary, lineHeight: 1.7 }}>
            Which tools did you use? (NVC, boundary-setting, saboteur awareness, repair attempts){"\n"}
            Where did the saboteur take over?{"\n"}
            What would you do differently next time?
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.bgDeep, borderRadius: radii.lg, fontFamily: fonts.bodyAlt, overflow: "hidden" }}>
      {/* Scenario header */}
      <div style={{
        padding: `${space[3]}px ${space[4]}px`,
        backgroundColor: colors.bgSurface,
        borderBottom: `1px solid ${colors.borderSubtle}`,
      }}>
        <div style={{ ...text.caption, color: colors.coral, marginBottom: 2 }}>SIMULATION</div>
        <div style={{ ...text.secondary, color: colors.textSecondary }}>{scenario}</div>
        <div style={{ display: "flex", gap: space[3], marginTop: space[2] }}>
          <span style={{ ...text.caption, color: colors.plumLight }}>🤖 {aiRole}</span>
          <span style={{ ...text.caption, color: colors.coral }}>👤 {userRole}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        padding: space[4], minHeight: 300, maxHeight: 400, overflowY: "auto",
        display: "flex", flexDirection: "column", gap: space[3],
      }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div style={{
              maxWidth: "80%", padding: `${space[3]}px ${space[4]}px`,
              borderRadius: msg.role === "user"
                ? `${radii.md}px ${radii.md}px 4px ${radii.md}px`
                : `${radii.md}px ${radii.md}px ${radii.md}px 4px`,
              backgroundColor: msg.role === "user" ? colors.coralWash : colors.bgSurface,
              border: `1px solid ${msg.role === "user" ? colors.coral + "44" : colors.borderSubtle}`,
            }}>
              <div style={{ ...text.caption, color: msg.role === "user" ? colors.coral : colors.plumLight, marginBottom: 4 }}>
                {msg.role === "user" ? userRole : aiRole}
              </div>
              <div style={{ ...text.body, color: colors.textPrimary, lineHeight: 1.7 }}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", gap: 4, padding: space[3] }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                style={{
                  width: 8, height: 8, borderRadius: radii.full,
                  backgroundColor: colors.plumLight,
                }}
              />
            ))}
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Coaching nudge */}
      <AnimatePresence>
        {nudge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: `${space[2]}px ${space[4]}px`,
              backgroundColor: colors.warningWash,
              borderTop: `1px solid ${colors.warning}44`,
            }}
          >
            <div style={{ ...text.caption, color: colors.warning }}>💡 COACH NUDGE</div>
            <div style={{ ...text.secondary, color: colors.textSecondary, marginTop: 2 }}>{nudge}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div style={{
        padding: space[3],
        borderTop: `1px solid ${colors.borderSubtle}`,
        backgroundColor: colors.bgSurface,
        display: "flex", gap: space[2], alignItems: "flex-end",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type your response..."
          rows={2}
          disabled={isThinking}
          style={{
            flex: 1, padding: space[2], ...text.body,
            backgroundColor: colors.bgInput, color: colors.textPrimary,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radii.sm, resize: "none",
            outline: "none", boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: space[1] }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            style={{
              padding: `${space[2]}px ${space[4]}px`,
              backgroundColor: input.trim() ? colors.coral : colors.bgElevated,
              color: input.trim() ? colors.bgDeep : colors.textMuted,
              border: "none", borderRadius: radii.sm,
              fontWeight: 600, fontFamily: fonts.display, fontSize: 12,
              cursor: input.trim() ? "pointer" : "not-allowed",
            }}
          >
            Send
          </motion.button>
          <button
            onClick={handleEnd}
            style={{
              padding: `${space[1]}px ${space[3]}px`,
              backgroundColor: "transparent",
              color: colors.textMuted, fontSize: 10,
              border: `1px solid ${colors.borderSubtle}`,
              borderRadius: radii.sm, cursor: "pointer",
              fontFamily: fonts.display,
            }}
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
}

// Demo-mode response generator (used when no onSend prop is provided)
function generateDemoResponse(userMsg: string, turnCount: number): string {
  const responses = [
    "I appreciate you sharing that. Let me be direct — the metrics we discussed last time still show a gap. Can you walk me through what specific steps you've taken this week?",
    "I hear what you're saying about the timeline. But from my perspective, the expectations were clear from the start. Help me understand what's been getting in the way.",
    "That's a fair point. I want to make sure we're aligned — what does success look like to you for the remaining period?",
    "I notice you're getting defensive. I'm not trying to attack you — I genuinely want to find a path forward here. What do you need from me to make that happen?",
    "Let's pause for a moment. You've raised some valid concerns. I want to think about the timeline question and come back to you by end of week. Is there anything else urgent?",
  ];
  return responses[Math.min(turnCount, responses.length - 1)];
}
