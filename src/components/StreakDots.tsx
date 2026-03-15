"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;

interface StreakDotsProps {
  userId: string;
  supabase: ReturnType<typeof import("@/lib/supabase").createClient>;
}

export default function StreakDots({ userId, supabase }: StreakDotsProps) {
  const [entryDates, setEntryDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchStreak() {
      const today = new Date();
      const sevenAgo = new Date(today);
      sevenAgo.setDate(sevenAgo.getDate() - 6);

      const { data } = await supabase
        .from("entries")
        .select("date")
        .eq("client_id", userId)
        .eq("type", "journal")
        .gte("date", sevenAgo.toISOString().split("T")[0])
        .lte("date", today.toISOString().split("T")[0]);

      if (data) {
        setEntryDates(new Set(data.map((e: { date: string }) => e.date)));
      }
    }
    fetchStreak();
  }, [userId, supabase]);

  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split("T")[0],
      label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
      isToday: i === 6,
    };
  });

  const streakCount = days.filter((d) => entryDates.has(d.date)).length;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", gap: 8 }}>
        {days.map((day, i) => {
          const hasEntry = entryDates.has(day.date);
          return (
            <motion.div
              key={day.date}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 4,
              }}
            >
              <div style={{ position: "relative" }}>
                {/* Pulsing ring for today */}
                {day.isToday && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      position: "absolute", inset: -4,
                      borderRadius: "50%",
                      border: `2px solid ${colors.coral}`,
                    }}
                  />
                )}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  backgroundColor: hasEntry ? colors.coral : "transparent",
                  border: hasEntry ? "none" : `2px solid ${colors.borderDefault}`,
                  transition: "all 0.3s",
                }} />
              </div>
              <span style={{
                fontSize: 9, fontFamily: display, fontWeight: 500,
                color: day.isToday ? colors.textSecondary : colors.textMuted,
                letterSpacing: "0.02em",
              }}>
                {day.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {streakCount > 0 && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: 12, fontFamily: display, fontWeight: 600,
            color: colors.coral,
          }}
        >
          {streakCount}/7 this week
        </motion.span>
      )}
    </div>
  );
}
