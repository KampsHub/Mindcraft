"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface Message {
  id: string;
  role: "coach" | "user";
  content: string;
  timestamp: Date;
}

interface ChatCoachProps {
  /** Initial coach message to start the conversation */
  initialMessage: string;
  /** Called when user sends a message — returns coach response */
  onSend: (message: string, history: Message[]) => Promise<string>;
  /** Called when user wants to exit chat and continue */
  onComplete?: (messages: Message[]) => void;
  /** Placeholder text for input */
  placeholder?: string;
  /** Whether to show the complete/continue button */
  showComplete?: boolean;
  completeLabel?: string;
}

export default function ChatCoach({
  initialMessage,
  onSend,
  onComplete,
  placeholder = "Type your response...",
  showComplete = true,
  completeLabel = "Continue →",
}: ChatCoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "coach",
      content: initialMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await onSend(text, [...messages, userMsg]);
      const coachMsg: Message = {
        id: `coach-${Date.now()}`,
        role: "coach",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "coach",
        content: "I'm having trouble responding right now. Try again?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setIsTyping(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      borderRadius: 16,
      backgroundColor: "rgba(51, 51, 57, 0.5)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: `1px solid ${colors.borderDefault}`,
      overflow: "hidden",
    }}>
      {/* Messages */}
      <div style={{
        flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 16,
        maxHeight: 400, overflowY: "auto",
      }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                backgroundColor: msg.role === "user"
                  ? "rgba(224, 149, 133, 0.15)"
                  : "rgba(255, 255, 255, 0.06)",
                border: msg.role === "user"
                  ? `1px solid rgba(224, 149, 133, 0.25)`
                  : `1px solid rgba(255, 255, 255, 0.08)`,
              }}>
                {msg.role === "coach" && (
                  <p style={{
                    fontFamily: display, fontSize: 10, fontWeight: 700,
                    color: colors.coral, margin: "0 0 6px 0",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>
                    Coach Assistant
                  </p>
                )}
                <p style={{
                  fontFamily: body, fontSize: 15, color: "#ffffff",
                  margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}
          >
            <div style={{
              display: "flex", gap: 4, padding: "8px 16px",
              borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.06)",
            }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    backgroundColor: colors.coral, opacity: 0.6,
                  }}
                />
              ))}
            </div>
            <span style={{ fontFamily: body, fontSize: 12, color: colors.textMuted }}>
              Your coaching assistant is thinking...
            </span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: "12px 16px",
        borderTop: `1px solid ${colors.borderDefault}`,
        display: "flex", gap: 10, alignItems: "flex-end",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          style={{
            flex: 1, fontFamily: body, fontSize: 15,
            padding: "10px 14px", borderRadius: 12,
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            border: `1px solid ${colors.borderDefault}`,
            color: "#ffffff", resize: "none",
            outline: "none", minHeight: 44,
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          style={{
            fontFamily: display, fontSize: 13, fontWeight: 600,
            padding: "10px 18px", borderRadius: 100,
            backgroundColor: input.trim() && !isTyping ? colors.coral : colors.bgElevated,
            color: input.trim() && !isTyping ? colors.bgDeep : colors.textMuted,
            border: "none", cursor: input.trim() && !isTyping ? "pointer" : "default",
            minHeight: 44, whiteSpace: "nowrap",
          }}
        >
          Send
        </motion.button>
      </div>

      {/* Complete button */}
      {showComplete && (
        <div style={{
          padding: "14px 16px",
          borderTop: `1px solid rgba(255, 255, 255, 0.06)`,
          display: "flex", justifyContent: "center",
        }}>
          <button
            onClick={() => onComplete?.(messages)}
            style={{
              fontFamily: display, fontSize: 14, fontWeight: 600,
              padding: "12px 28px", borderRadius: 100,
              backgroundColor: colors.coral,
              color: colors.bgDeep, border: "none",
              cursor: "pointer", letterSpacing: "0.01em",
              boxShadow: "0 2px 12px rgba(196, 148, 58, 0.25)",
              transition: "transform 0.15s, box-shadow 0.15s",
              width: "100%", maxWidth: 320,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(196, 148, 58, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(196, 148, 58, 0.25)";
            }}
          >
            {completeLabel}
          </button>
        </div>
      )}
    </div>
  );
}
