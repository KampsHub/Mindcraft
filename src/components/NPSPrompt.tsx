"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { colors, fonts, space, radii } from "@/lib/theme";
import { trackEvent } from "@/components/GoogleAnalytics";

const display = fonts.display;
const body = fonts.bodyAlt;

/**
 * NPS (Net Promoter Score) prompt — shown at end of weekly review.
 * Data stored in weekly_reviews.nps_score (integer 0-10).
 */
export default function NPSPrompt({
  enrollmentId,
  weekNumber,
}: {
  enrollmentId: string;
  weekNumber: number;
}) {
  const [score, setScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [hovering, setHovering] = useState<number | null>(null);
  const supabase = createClient();

  const handleSelect = async (value: number) => {
    setScore(value);
    setSaved(true);
    trackEvent("nps_submitted", { score: value, week: weekNumber });

    try {
      // Upsert NPS score into weekly_reviews
      const { data: existing } = await supabase
        .from("weekly_reviews")
        .select("id")
        .eq("enrollment_id", enrollmentId)
        .eq("week_number", weekNumber)
        .single();

      if (existing) {
        await supabase
          .from("weekly_reviews")
          .update({ nps_score: value })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("weekly_reviews")
          .insert({
            enrollment_id: enrollmentId,
            week_number: weekNumber,
            nps_score: value,
          });
      }
    } catch {
      // Non-blocking — score is tracked via GA even if DB write fails
    }
  };

  if (saved) {
    return (
      <div style={{
        padding: `${space[5]}px`,
        backgroundColor: colors.bgSurface,
        borderRadius: radii.md,
        border: `1px solid ${colors.borderDefault}`,
        textAlign: "center",
        marginBottom: space[6],
      }}>
        <p style={{ fontSize: 15, color: colors.textPrimary, margin: 0, fontFamily: body }}>
          Thank you for your feedback.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: `${space[5]}px`,
      backgroundColor: colors.bgSurface,
      borderRadius: radii.md,
      border: `1px solid ${colors.borderDefault}`,
      marginBottom: space[6],
    }}>
      <p style={{
        fontSize: 15, fontWeight: 600, color: colors.textPrimary,
        margin: `0 0 ${space[2]}px 0`, fontFamily: display,
      }}>
        How likely are you to recommend Mindcraft to a friend?
      </p>
      <p style={{
        fontSize: 13, color: colors.textPrimary, margin: `0 0 ${space[4]}px 0`,
        fontFamily: body, opacity: 0.7,
      }}>
        0 = not at all · 10 = absolutely
      </p>

      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
        {Array.from({ length: 11 }, (_, i) => i).map((value) => {
          const isHovered = hovering !== null && value <= hovering;
          const getColor = () => {
            const v = hovering !== null ? hovering : -1;
            if (value > v) return colors.bgElevated;
            if (v <= 6) return colors.error;
            if (v <= 8) return colors.warning;
            return colors.success;
          };

          return (
            <motion.button
              key={value}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHovering(value)}
              onMouseLeave={() => setHovering(null)}
              onClick={() => handleSelect(value)}
              style={{
                width: 36, height: 36,
                borderRadius: radii.sm,
                border: `1px solid ${isHovered ? "transparent" : colors.borderDefault}`,
                backgroundColor: getColor(),
                color: isHovered ? colors.bgDeep : colors.textPrimary,
                fontSize: 13, fontWeight: 600,
                fontFamily: display,
                cursor: "pointer",
                transition: "background-color 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {value}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
