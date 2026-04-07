"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import PageShell from "@/components/PageShell";
import FadeIn from "@/components/FadeIn";
import GiftingSection from "@/components/GiftingSection";
import { colors, fonts, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

type FinalInsight = {
  id: string;
  content: string;
  status: "generating" | "ready" | "failed";
  generated_at: string | null;
  program_slug: string;
  enrollment_id: string;
};

type PersonalPromo = {
  code: string;
  discount_percent: number;
  redeemed_at: string | null;
};

function FinalInsightsView() {
  const supabase = createClient();
  const params = useSearchParams();
  const enrollmentParam = params?.get("enrollment");

  const [insight, setInsight] = useState<FinalInsight | null>(null);
  const [promo, setPromo] = useState<PersonalPromo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      let query = supabase
        .from("final_insights")
        .select("id, content, status, generated_at, program_slug, enrollment_id")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (enrollmentParam) {
        query = supabase
          .from("final_insights")
          .select("id, content, status, generated_at, program_slug, enrollment_id")
          .eq("enrollment_id", enrollmentParam)
          .limit(1);
      }

      const { data: insights } = await query;
      if (insights && insights.length > 0) {
        setInsight(insights[0] as FinalInsight);
      }

      const { data: codes } = await supabase
        .from("personal_promo_codes")
        .select("code, discount_percent, redeemed_at")
        .eq("client_id", user.id)
        .eq("source", "program_completion")
        .order("created_at", { ascending: false })
        .limit(1);
      if (codes && codes.length > 0) setPromo(codes[0] as PersonalPromo);

      setLoading(false);
    }
    load();
  }, [supabase, enrollmentParam]);

  // Auto-poll while generating
  useEffect(() => {
    if (insight?.status !== "generating") return;
    const t = setInterval(async () => {
      const { data } = await supabase
        .from("final_insights")
        .select("id, content, status, generated_at, program_slug, enrollment_id")
        .eq("id", insight.id)
        .single();
      if (data) {
        setInsight(data as FinalInsight);
        if ((data as FinalInsight).status !== "generating") clearInterval(t);
      }
    }, 5000);
    return () => clearInterval(t);
  }, [insight?.id, insight?.status, supabase]);

  function copyPromo() {
    if (!promo?.code) return;
    navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <p style={{ fontFamily: body, color: colors.textMuted, textAlign: "center", padding: "60px 20px" }}>
        Loading your final insights…
      </p>
    );
  }

  if (!insight) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <h1 style={{ fontFamily: display, fontSize: 24, color: colors.textPrimary, marginBottom: 8 }}>
          No final insights yet
        </h1>
        <p style={{ fontFamily: body, fontSize: 14, color: colors.textMuted }}>
          Your final reflection will appear here once you&rsquo;ve completed all 30 days.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FadeIn preset="slide-up" triggerOnMount>
        <p style={{
          fontFamily: display, fontSize: 11, fontWeight: 700,
          color: colors.coral, textTransform: "uppercase",
          letterSpacing: "0.14em", margin: "0 0 12px 0",
        }}>
          Final insights · {insight.program_slug}
        </p>
        <h1 style={{
          fontFamily: display, fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 800, color: colors.textPrimary, lineHeight: 1.2,
          marginBottom: 24, letterSpacing: "-0.02em",
        }}>
          Your 30 days, in one reflection.
        </h1>
      </FadeIn>

      {insight.status === "generating" && (
        <div style={{
          backgroundColor: colors.bgSurface, borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`, padding: 32,
          textAlign: "center",
        }}>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontFamily: display, fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}
          >
            Your final insights are being prepared.
          </motion.div>
          <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, margin: 0 }}>
            This usually takes a minute. We&rsquo;ll also email you when it&rsquo;s ready.
          </p>
        </div>
      )}

      {insight.status === "failed" && (
        <div style={{
          backgroundColor: colors.errorWash, borderRadius: 14,
          border: `1px solid ${colors.error}44`, padding: 24,
        }}>
          <p style={{ fontFamily: body, fontSize: 14, color: colors.error, margin: 0 }}>
            Something went wrong generating your final insights. We&rsquo;ll retry automatically.
            If this sticks, email crew@allmindsondeck.com.
          </p>
        </div>
      )}

      {insight.status === "ready" && (
        <>
          <div style={{
            backgroundColor: colors.bgSurface, borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: "36px 40px", marginBottom: 32,
          }}>
            {insight.content.split(/\n\n+/).map((para, i) => (
              <p key={i} style={{
                fontFamily: fonts.serif, fontSize: 16, lineHeight: 1.75,
                color: colors.textPrimary, margin: "0 0 18px 0",
              }}>
                {para}
              </p>
            ))}
          </div>

          {/* Share your story CTA */}
          <div style={{
            background: `linear-gradient(135deg, ${colors.coral}28, ${colors.coral}0A)`,
            border: `1px solid ${colors.coral}55`,
            borderRadius: 14,
            padding: "28px 32px",
            marginBottom: 32,
          }}>
            <p style={{
              fontFamily: display, fontSize: 10, fontWeight: 700,
              color: colors.coral, textTransform: "uppercase",
              letterSpacing: "0.14em", margin: "0 0 8px 0",
            }}>
              One ask
            </p>
            <p style={{
              fontFamily: display, fontSize: 20, fontWeight: 700,
              color: colors.textPrimary, margin: "0 0 8px 0", letterSpacing: "-0.01em",
            }}>
              Tell us what changed.
            </p>
            <p style={{
              fontFamily: body, fontSize: 14, lineHeight: 1.65,
              color: colors.textMuted, margin: "0 0 18px 0",
            }}>
              Your words will help the next person who&rsquo;s where you were a month ago. A quote, a LinkedIn post link, or a Loom — whatever feels right.
            </p>
            <a href="/share" style={{
              display: "inline-block",
              padding: "12px 22px",
              backgroundColor: colors.coral,
              color: "#18181C",
              fontFamily: display,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              borderRadius: 999,
            }}>
              Share your story →
            </a>
            <p style={{
              fontFamily: body, fontSize: 11, lineHeight: 1.5,
              color: colors.textMuted, margin: "12px 0 0 0",
            }}>
              P.S. A $50 Amazon raffle is launching once we hit 20 alumni. Your share counts as an entry.
            </p>
          </div>

          {/* Personal promo */}
          {promo && !promo.redeemed_at && (
            <div style={{
              background: `linear-gradient(135deg, ${colors.coral}25, ${colors.coral}08)`,
              border: `1px solid ${colors.coral}44`,
              borderRadius: 14,
              padding: "28px 32px",
              marginBottom: 32,
            }}>
              <p style={{
                fontFamily: display, fontSize: 10, fontWeight: 700,
                color: colors.coral, textTransform: "uppercase",
                letterSpacing: "0.14em", margin: "0 0 8px 0",
              }}>
                A gift for you
              </p>
              <p style={{
                fontFamily: display, fontSize: 18, fontWeight: 700,
                color: colors.textPrimary, margin: "0 0 6px 0",
              }}>
                {promo.discount_percent}% off any future Mindcraft program
              </p>
              <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, margin: "0 0 16px 0" }}>
                Single-use. Works at checkout on any program page.
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 18px", backgroundColor: colors.bgDeep,
                border: `1px dashed ${colors.coral}`, borderRadius: 10,
              }}>
                <span style={{
                  flex: 1, fontFamily: "monospace", fontSize: 18, fontWeight: 700,
                  color: colors.coral, letterSpacing: "0.08em",
                }}>
                  {promo.code}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={copyPromo}
                  style={{
                    fontFamily: display, fontSize: 12, fontWeight: 600,
                    padding: "8px 16px", borderRadius: radii.full,
                    backgroundColor: copied ? "#34d399" : colors.bgElevated,
                    color: copied ? colors.bgDeep : colors.textPrimary,
                    border: `1px solid ${colors.borderDefault}`, cursor: "pointer",
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </motion.button>
              </div>
            </div>
          )}

          {/* Data rights */}
          <div style={{
            backgroundColor: colors.bgSurface, borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: "24px 28px", marginBottom: 32,
          }}>
            <p style={{
              fontFamily: display, fontSize: 14, fontWeight: 700,
              color: colors.textPrimary, margin: "0 0 8px 0",
            }}>
              Your data is yours.
            </p>
            <p style={{
              fontFamily: body, fontSize: 13, lineHeight: 1.65,
              color: colors.textMuted, margin: "0 0 14px 0",
            }}>
              We keep your journal entries, exercise responses, and insights so you can return to
              them anytime. If you&rsquo;d rather we didn&rsquo;t, you can request deletion — we purge
              everything within 30 days.
            </p>
            <a href="/account/delete" style={{
              fontFamily: display, fontSize: 13, fontWeight: 600,
              color: colors.textMuted, textDecoration: "underline",
            }}>
              Delete my account and data →
            </a>
          </div>
        </>
      )}

      {/* Gift/refer/share */}
      <GiftingSection />
    </div>
  );
}

export default function FinalInsightsPage() {
  return (
    <PageShell maxWidth={820}>
      <Suspense fallback={<p style={{ color: colors.textMuted, fontFamily: body }}>Loading…</p>}>
        <FinalInsightsView />
      </Suspense>
    </PageShell>
  );
}
