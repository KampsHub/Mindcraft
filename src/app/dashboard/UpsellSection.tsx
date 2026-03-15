"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.bgSurface,
  borderRadius: 14,
  padding: 24,
  display: "flex",
  flexDirection: "column",
};

interface UpsellSectionProps {
  showEnneagram: boolean;
  programSlug: string;
  onNavigate: (path: string) => void;
}

export default function UpsellSection({ showEnneagram, programSlug, onNavigate }: UpsellSectionProps) {
  if (!showEnneagram) {
    // Only show 1:1 card as a single full-width card
    return (
      <FadeIn preset="fade" delay={0.1}>
        <div style={{ marginTop: 36 }}>
          <p style={{
            fontFamily: display, fontSize: 12, fontWeight: 600,
            color: colors.textMuted, marginBottom: 14, letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            Go deeper
          </p>
          <CoachingCard onNavigate={onNavigate} />
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn preset="fade" delay={0.1}>
      <div style={{ marginTop: 36 }}>
        <p style={{
          fontFamily: display, fontSize: 12, fontWeight: 600,
          color: colors.textMuted, marginBottom: 14, letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          Go deeper
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}>
          <EnneagramCard programSlug={programSlug} onNavigate={onNavigate} />
          <CoachingCard onNavigate={onNavigate} />
        </div>
      </div>
    </FadeIn>
  );
}

function EnneagramCard({ programSlug, onNavigate }: { programSlug: string; onNavigate: (path: string) => void }) {
  return (
    <motion.div
      whileHover={{ y: -6, borderColor: "rgba(176, 141, 173, 0.5)", boxShadow: "0 16px 48px rgba(123, 82, 120, 0.25)" }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        ...cardStyle,
        border: "1px solid rgba(176, 141, 173, 0.3)",
        position: "relative" as const,
        overflow: "hidden" as const,
      }}
    >
      {/* Decorative glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(176, 141, 173, 0.15) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <span style={{
        alignSelf: "flex-start",
        fontFamily: body, fontSize: 9, fontWeight: 700,
        letterSpacing: 1.5, textTransform: "uppercase",
        padding: "5px 12px", borderRadius: 6,
        backgroundColor: colors.plumWash, color: colors.plumLight,
        marginBottom: 14,
      }}>
        Deepest insight
      </span>
      <p style={{
        fontFamily: display, fontSize: 18, fontWeight: 700,
        color: colors.textPrimary, margin: "0 0 8px 0",
        letterSpacing: "-0.01em",
      }}>
        Add Enneagram
      </p>
      <p style={{
        fontFamily: body, fontSize: 13, color: colors.textSecondary,
        lineHeight: 1.6, margin: "0 0 20px 0", flex: 1,
      }}>
        The IEQ9 assessment + 1-hour debrief with a certified coach. Your results refine every exercise and goal.
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: display, fontSize: 15, fontWeight: 600,
          color: colors.plumLight,
        }}>
          $275
        </span>
        <motion.button
          whileHover={{ scale: 1.06, boxShadow: "0 8px 24px rgba(176, 141, 173, 0.4)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => onNavigate(`/${programSlug}#pricing`)}
          style={{
            fontFamily: display, fontSize: 13, fontWeight: 600,
            padding: "10px 24px", borderRadius: 100,
            backgroundColor: colors.plum, color: colors.textPrimary,
            border: "none", cursor: "pointer",
            letterSpacing: "0.01em",
          }}
        >
          Learn more
        </motion.button>
      </div>
    </motion.div>
  );
}

function CoachingCard({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <motion.div
      whileHover={{ y: -6, borderColor: "rgba(224, 149, 133, 0.35)", boxShadow: "0 16px 48px rgba(224, 149, 133, 0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        ...cardStyle,
        border: `1px solid ${colors.borderDefault}`,
        position: "relative" as const,
        overflow: "hidden" as const,
      }}
    >
      {/* Decorative glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(224, 149, 133, 0.1) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <span style={{
        alignSelf: "flex-start",
        fontFamily: body, fontSize: 9, fontWeight: 700,
        letterSpacing: 1.5, textTransform: "uppercase",
        padding: "5px 12px", borderRadius: 6,
        backgroundColor: colors.coralWash, color: colors.coralLight,
        marginBottom: 14,
      }}>
        Human support
      </span>
      <p style={{
        fontFamily: display, fontSize: 18, fontWeight: 700,
        color: colors.textPrimary, margin: "0 0 8px 0",
        letterSpacing: "-0.01em",
      }}>
        1:1 Coaching
      </p>
      <p style={{
        fontFamily: body, fontSize: 13, color: colors.textSecondary,
        lineHeight: 1.6, margin: "0 0 20px 0", flex: 1,
      }}>
        A 3-month partnership with a certified coach who already knows your patterns from the program.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <motion.button
          whileHover={{ scale: 1.06, boxShadow: "0 8px 24px rgba(224, 149, 133, 0.35)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => onNavigate("/intake")}
          style={{
            fontFamily: display, fontSize: 13, fontWeight: 600,
            padding: "10px 24px", borderRadius: 100,
            backgroundColor: colors.coral, color: colors.bgDeep,
            border: "none", cursor: "pointer",
            letterSpacing: "0.01em",
          }}
        >
          Apply
        </motion.button>
      </div>
    </motion.div>
  );
}
