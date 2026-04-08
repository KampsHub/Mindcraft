"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { colors, fonts } from "@/lib/theme";
import { trackEvent, getGaClientId } from "@/components/GoogleAnalytics";
import ScrollTracker from "@/components/ScrollTracker";

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
  // Fire upsell_state_shown once per mount so we can compare conversion rates
  // between the two rendered states.
  useEffect(() => {
    trackEvent("upsell_state_shown", {
      state: showEnneagram ? "enneagram_and_coaching" : "coaching_only",
      program: programSlug,
    });
  }, [showEnneagram, programSlug]);

  if (!showEnneagram) {
    // Enneagram purchased — show confirmation + coaching upsell
    return (
      <FadeIn preset="fade" delay={0.1}>
        <div style={{ marginTop: 36 }}>
          <div style={{ height: 1, backgroundColor: colors.borderSubtle, marginBottom: 24 }} />

          {/* Enneagram confirmation (shown in "coaching_only" state) */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 18px", borderRadius: 12,
            backgroundColor: colors.bgSurface,
            border: `1px solid ${colors.coralWash}`,
            marginBottom: 20,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              backgroundColor: colors.coralWash,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: colors.coral, fontSize: 14, fontWeight: 700 }}>✓</span>
            </div>
            <p style={{
              fontFamily: body, fontSize: 13, color: colors.textPrimary, margin: 0, lineHeight: 1.4,
            }}>
              Enneagram results available in{" "}
              <span
                onClick={() => onNavigate("/weekly-review")}
                style={{ color: colors.coral, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
              >
                Insights
              </span>
            </p>
          </div>

          <p style={{
            fontFamily: display, fontSize: 12, fontWeight: 600,
            color: colors.textPrimary, marginBottom: 14, letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            Go deeper
          </p>
          <CoachingCard onNavigate={onNavigate} program={programSlug} context="post_enneagram" />
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn preset="fade" delay={0.1}>
      <div style={{ marginTop: 36 }}>
        <div style={{ height: 1, backgroundColor: colors.borderSubtle, marginBottom: 24 }} />
        <p style={{
          fontFamily: display, fontSize: 12, fontWeight: 600,
          color: colors.textPrimary, marginBottom: 14, letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          Go deeper
        </p>
        {/* Stacked vertically — the IEQ9 card is copy-heavy and needs full width. */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}>
          <EnneagramCard program={programSlug} />
          <CoachingCard onNavigate={onNavigate} program={programSlug} context="dashboard" />
        </div>
      </div>
    </FadeIn>
  );
}

type CoachSlot = {
  id: string;
  date: string;
  time: string;
  dayLabel: string;
  timeLabel: string;
};

function EnneagramCard({ program }: { program: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<CoachSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<CoachSlot | null>(null);

  // Fetch real available debrief slots from the coach availability route.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/coach/slots")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSlots(Array.isArray(data?.slots) ? data.slots : []);
      })
      .catch(() => { if (!cancelled) setSlots([]); })
      .finally(() => { if (!cancelled) setSlotsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleCheckout() {
    if (!selectedSlot) return;
    setLoading(true);
    setError(null);
    trackEvent("enneagram_upsell_click", { program, slot_id: selectedSlot.id });
    trackEvent("enneagram_standalone_begin_checkout", { slot_id: selectedSlot.id });
    try {
      const gaClientId = await getGaClientId();
      const res = await fetch("/api/checkout/enneagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ga_client_id: gaClientId,
          selected_slot_id: selectedSlot.id,
          selected_slot_label: `${selectedSlot.dayLabel} · ${selectedSlot.timeLabel}`,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else {
        console.error("Checkout error:", data.error);
        trackEvent("enneagram_checkout_error", { error_message: data?.error ?? "unknown" });
        setError(data?.error ? `Stripe: ${data.error}` : "Payment couldn\u2019t be started. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      trackEvent("enneagram_checkout_error", { error_message: err instanceof Error ? err.message : "network" });
      setError("Connection issue. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollTracker event="enneagram_upsell_view" params={{ program }}>
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        ...cardStyle,
        border: "none",
        position: "relative" as const,
        overflow: "hidden" as const,
      }}
    >
      {/* Decorative glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.coralWash} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <span style={{
        alignSelf: "flex-start",
        fontFamily: body, fontSize: 9, fontWeight: 700,
        letterSpacing: 1.5, textTransform: "uppercase",
        padding: "5px 12px", borderRadius: 6,
        backgroundColor: colors.coralWash, color: colors.coral,
        marginBottom: 14,
      }}>
        Deep Insight
      </span>
      <p style={{
        fontFamily: display, fontSize: 18, fontWeight: 700,
        color: colors.textPrimary, margin: "0 0 10px 0",
        letterSpacing: "-0.01em",
      }}>
        Personality Deep Dive
      </p>
      <p style={{
        fontFamily: body, fontSize: 14, color: colors.textPrimary,
        lineHeight: 1.65, margin: "0 0 12px 0",
      }}>
        The Enneagram is a personality model that maps nine cognitive and emotional patterns. Where Myers-Briggs sorts you by preference, the Enneagram looks at what actually motivates you under pressure — and what your blind spots cost you when the stakes are high.
      </p>
      <p style={{
        fontFamily: body, fontSize: 14, color: colors.textPrimary,
        lineHeight: 1.65, margin: "0 0 12px 0",
      }}>
        The <strong>IEQ9</strong> is the only Enneagram assessment that meets standard psychometric validity criteria. It&rsquo;s used by ICF-credentialed coaches and Fortune 500 leadership development programs.
      </p>
      <p style={{
        fontFamily: body, fontSize: 14, color: colors.textPrimary,
        lineHeight: 1.65, margin: "0 0 8px 0",
      }}>
        You&rsquo;ll receive:
      </p>
      <ul style={{
        fontFamily: body, fontSize: 14, color: colors.textPrimary,
        lineHeight: 1.65, margin: "0 0 16px 18px", padding: 0,
      }}>
        <li>A 30-page report on your motivations, behaviors under stress and in security, ways of expression, and communication &amp; conflict style</li>
        <li>A 1-hour live debrief with a certified professional coach to translate the report into something specific to where you are right now</li>
        <li>Your results then find influence in your daily program and what you need</li>
      </ul>

      {/* Slot picker — pick your debrief time before paying */}
      <div style={{ marginBottom: 16 }}>
        <p style={{
          fontFamily: body, fontSize: 11, fontWeight: 700,
          letterSpacing: 1.2, textTransform: "uppercase",
          color: colors.coral, margin: "0 0 8px 0",
        }}>
          Pick your debrief time
        </p>
        {slotsLoading ? (
          <p style={{ fontFamily: body, fontSize: 13, color: colors.textPrimary, opacity: 0.8, margin: 0 }}>
            Loading available times…
          </p>
        ) : slots.length === 0 ? (
          <p style={{ fontFamily: body, fontSize: 13, color: colors.textPrimary, opacity: 0.8, margin: 0 }}>
            No times available right now. Please check back tomorrow.
          </p>
        ) : (
          <div
            style={{
              display: "flex", gap: 8, overflowX: "auto",
              paddingBottom: 8, scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    flex: "0 0 auto",
                    scrollSnapAlign: "start",
                    minWidth: 110,
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${isSelected ? colors.coral : "rgba(255,255,255,0.18)"}`,
                    backgroundColor: isSelected ? colors.coralWash : "transparent",
                    color: colors.textPrimary,
                    cursor: "pointer",
                    fontFamily: body,
                    textAlign: "left",
                    transition: "all 0.18s",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2, color: isSelected ? colors.coral : colors.textPrimary }}>
                    {slot.dayLabel}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    {slot.timeLabel}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span style={{
          fontFamily: display, fontSize: 15, fontWeight: 600,
          color: colors.coral,
        }}>
          $300
        </span>
        <motion.button
          whileHover={selectedSlot && !loading ? { scale: 1.04 } : {}}
          whileTap={selectedSlot && !loading ? { scale: 0.97 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={handleCheckout}
          disabled={loading || !selectedSlot}
          style={{
            fontFamily: display, fontSize: 13, fontWeight: 600,
            padding: "10px 22px", borderRadius: 100,
            backgroundColor: selectedSlot ? colors.coral : "rgba(255,255,255,0.12)",
            color: selectedSlot ? colors.bgDeep : colors.textPrimary,
            border: "none",
            cursor: loading || !selectedSlot ? "default" : "pointer",
            letterSpacing: "0.01em",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Redirecting…"
            : selectedSlot
              ? `Pay & book ${selectedSlot.dayLabel}`
              : "Pick a time first"}
        </motion.button>
        {error && (
          <p style={{ fontSize: 12, color: "#E08585", textAlign: "center", marginTop: 8, fontFamily: display, width: "100%" }}>
            {error}
          </p>
        )}
      </div>
    </motion.div>
    </ScrollTracker>
  );
}

function CoachingCard({
  onNavigate,
  program,
  context,
}: {
  onNavigate: (path: string) => void;
  program: string;
  context: "dashboard" | "post_enneagram" | "weekly_review";
}) {
  return (
    <ScrollTracker event="coaching_upsell_view" params={{ program, context }}>
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        ...cardStyle,
        border: "none",
        position: "relative" as const,
        overflow: "hidden" as const,
      }}
    >
      {/* Decorative glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.coralWash} 0%, transparent 70%)`,
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
        Dedicated Expert-Coach
      </span>
      <p style={{
        fontFamily: display, fontSize: 18, fontWeight: 700,
        color: colors.textPrimary, margin: "0 0 10px 0",
        letterSpacing: "-0.01em",
      }}>
        1:1 Coaching
      </p>
      <p style={{
        fontFamily: body, fontSize: 14, color: colors.textPrimary,
        lineHeight: 1.65, margin: "0 0 12px 0",
      }}>
        The program gives you the structure, the frameworks, and a systemic approach — including an artificial assistant that picks up patterns across everything you share. But career transitions have a way of hiding the most important things from you.
      </p>
      <p style={{
        fontFamily: body, fontSize: 14, color: colors.textPrimary,
        lineHeight: 1.65, margin: "0 0 12px 0",
      }}>
        Research in cognitive psychology shows that when your (professional) identity is under threat — like during an acutely stressful transition — your brain filters information to protect the story you already believe about yourself (Kahan, 2017; Sherman &amp; Cohen, 2006). You&rsquo;re not thinking objectively. That&rsquo;s not a character flaw. It&rsquo;s how the brain responds to identity threat.
      </p>
      <p style={{
        fontFamily: body, fontSize: 14, color: colors.textPrimary,
        lineHeight: 1.65, margin: "0 0 16px 0",
      }}>
        A professional coach is trained to see that and work with it. Every month such gap goes unnoticed may cost you more than coaching does.
      </p>
      <p style={{
        fontFamily: body, fontSize: 14, fontWeight: 600, color: colors.textPrimary,
        lineHeight: 1.65, margin: "0 0 8px 0",
      }}>
        Add a dedicated expert coach and you&rsquo;ll get:
      </p>
      <ul style={{
        fontFamily: body, fontSize: 14, color: colors.textPrimary,
        lineHeight: 1.65, margin: "0 0 20px 18px", padding: 0,
      }}>
        <li>1:1 sessions with a professionally credentialed coach — trained, examined, and not self-appointed</li>
        <li>A validated personality deep dive (Enneagram) before the first session, so your coach directly knows how you handle stress, conflict, and decisions</li>
        <li>Coaching insights fed back into your daily program, so it adjusts to what&rsquo;s real, not what you expected</li>
        <li>A second pair of eyes on the patterns you can&rsquo;t see yourself repeating</li>
        <li>A safe space to practice the hard conversations before they&rsquo;re real — severance, PIP, negotiation, asking for what you&rsquo;re worth</li>
      </ul>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => {
            trackEvent("coaching_upsell_click", { program, context });
            onNavigate("/apply");
          }}
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
    </ScrollTracker>
  );
}
