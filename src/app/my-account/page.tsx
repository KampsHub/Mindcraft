"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import PageShell from "@/components/PageShell";
import PillButton from "@/components/PillButton";
import FadeIn from "@/components/FadeIn";
import { colors, fonts } from "@/lib/theme";
import { content as c } from "@/content/site";

const display = fonts.display;
const body = fonts.bodyAlt;

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.bgSurface,
  borderRadius: 14,
  border: `1px solid ${colors.borderDefault}`,
  padding: 24,
  marginBottom: 20,
};

interface ProgramEnrollment {
  id: string;
  status: string;
  created_at: string;
  current_day: number;
  programs: { name: string; slug: string };
}

interface ConsentSettings {
  ai_processing: boolean;
  coach_sharing: boolean;
  aggregate_analytics: boolean;
  inactive_reminders: boolean;
  program_updates: boolean;
}

export default function MyAccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [consent, setConsent] = useState<ConsentSettings>({
    ai_processing: true,
    coach_sharing: false,
    aggregate_analytics: true,
    inactive_reminders: true,
    program_updates: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const fetchData = useCallback(async (userId: string) => {
    const [consentRes, clientRes, enrollRes] = await Promise.all([
      supabase.from("consent_settings").select("*").eq("client_id", userId).single(),
      supabase.from("clients").select("name").eq("id", userId).single(),
      supabase.from("program_enrollments")
        .select("id, status, created_at, current_day, programs(name, slug)")
        .eq("client_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (consentRes.data) {
      setConsent({
        ai_processing: consentRes.data.ai_processing ?? true,
        coach_sharing: consentRes.data.coach_sharing ?? false,
        aggregate_analytics: consentRes.data.aggregate_analytics ?? true,
        inactive_reminders: consentRes.data.inactive_reminders ?? true,
        program_updates: consentRes.data.program_updates ?? true,
      });
    }

    if (clientRes.data) {
      setName(clientRes.data.name || "");
      setOriginalName(clientRes.data.name || "");
    }

    if (enrollRes.data) {
      setEnrollments(enrollRes.data.map((e: Record<string, unknown>) => ({ ...e, programs: Array.isArray(e.programs) ? (e.programs as Record<string, unknown>[])[0] : e.programs })) as ProgramEnrollment[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      fetchData(user.id);
    });
  }, [supabase.auth, router, fetchData]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    await supabase.from("consent_settings").upsert({
      client_id: user.id,
      ...consent,
      updated_at: new Date().toISOString(),
    }, { onConflict: "client_id" });

    if (name !== originalName) {
      await supabase.from("clients").update({ name }).eq("id", user.id);
    }
    setOriginalName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/account");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindcraft-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
    setDownloading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
      <button
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 48, height: 26, borderRadius: 13,
          backgroundColor: checked ? colors.coral : colors.bgElevated,
          border: "none", cursor: disabled ? "not-allowed" : "pointer",
          position: "relative", transition: "background-color 0.3s",
          opacity: disabled ? 0.5 : 1, flexShrink: 0,
        }}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: colors.textPrimary, position: "absolute",
            top: 2, left: checked ? 24 : 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </button>
    );
  }

  if (loading) {
    return (
      <PageShell maxWidth={640}>
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <p style={{ color: colors.textMuted, fontFamily: body }}>Loading...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth={640}>
      <FadeIn preset="fade" triggerOnMount>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 32, fontWeight: 700, margin: "0 0 6px 0",
            color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.03em",
          }}>
            My Account
          </h1>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, fontFamily: body }}>
            Manage your profile, preferences, and data.
          </p>
        </div>
      </FadeIn>

      {/* ── Profile ── */}
      <FadeIn preset="slide-up" delay={0.06} triggerOnMount>
        <div style={cardStyle}>
          <h2 style={{
            fontSize: 16, fontWeight: 700, margin: "0 0 16px 0",
            color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.02em",
          }}>
            Profile
          </h2>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, fontFamily: display, display: "block", marginBottom: 6 }}>
              Email
            </label>
            <p style={{
              fontSize: 14, color: colors.textSecondary, margin: 0, fontFamily: body,
              padding: "10px 14px", backgroundColor: colors.bgRecessed, borderRadius: 8,
            }}>
              {user?.email}
            </p>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, fontFamily: display, display: "block", marginBottom: 6 }}>
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{
                width: "100%", padding: "10px 14px", fontSize: 14,
                fontFamily: body, color: colors.textPrimary,
                backgroundColor: colors.bgInput, border: `1px solid ${colors.borderDefault}`,
                borderRadius: 8, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </FadeIn>

      {/* ── Programs ── */}
      <FadeIn preset="slide-up" delay={0.1} triggerOnMount>
        <div style={cardStyle}>
          <h2 style={{
            fontSize: 16, fontWeight: 700, margin: "0 0 16px 0",
            color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.02em",
          }}>
            Programs
          </h2>
          {enrollments.length === 0 ? (
            <p style={{ fontSize: 13, color: colors.textMuted, margin: 0, fontFamily: body }}>
              No programs yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {enrollments.map((enr) => {
                const statusMap: Record<string, { label: string; bg: string; color: string }> = {
                  active: { label: "Active", bg: colors.coralWash, color: colors.coral },
                  onboarding: { label: "Onboarding", bg: colors.coralWash, color: colors.coral },
                  awaiting_goals: { label: "Awaiting goals", bg: colors.warningWash, color: colors.warning },
                  pre_start: { label: "Not started", bg: colors.bgElevated, color: colors.textMuted },
                  completed: { label: "Completed", bg: colors.coralWash, color: colors.coral },
                  paused: { label: "Paused", bg: colors.bgElevated, color: colors.textMuted },
                };
                const s = statusMap[enr.status] || { label: enr.status, bg: colors.bgElevated, color: colors.textMuted };
                return (
                  <div key={enr.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", backgroundColor: colors.bgRecessed, borderRadius: 10,
                  }}>
                    <div>
                      <p style={{
                        fontSize: 14, fontWeight: 600, color: colors.textPrimary,
                        margin: "0 0 4px 0", fontFamily: display,
                      }}>
                        {enr.programs?.name || "Unknown program"}
                      </p>
                      <p style={{ fontSize: 12, color: colors.textMuted, margin: 0, fontFamily: body }}>
                        Enrolled {new Date(enr.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                        {enr.status === "active" && ` \u2022 Day ${enr.current_day}`}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100,
                        backgroundColor: s.bg, color: s.color, fontFamily: display,
                      }}>
                        {s.label}
                      </span>
                      {(enr.status === "active" || enr.status === "paused") && (
                        <button
                          onClick={async () => {
                            const newStatus = enr.status === "paused" ? "active" : "paused";
                            await supabase.from("program_enrollments").update({ status: newStatus }).eq("id", enr.id);
                            setEnrollments((prev) => prev.map((e) => e.id === enr.id ? { ...e, status: newStatus } : e));
                          }}
                          style={{
                            fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100,
                            backgroundColor: "transparent",
                            border: `1px solid ${colors.borderDefault}`,
                            color: colors.textMuted, fontFamily: display,
                            cursor: "pointer",
                          }}
                        >
                          {enr.status === "paused" ? "Resume" : "Pause"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FadeIn>

      {/* ── Consent Settings ── */}
      <FadeIn preset="slide-up" delay={0.14} triggerOnMount>
        <div style={cardStyle}>
          <h2 style={{
            fontSize: 16, fontWeight: 700, margin: "0 0 16px 0",
            color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.02em",
          }}>
            Privacy & Consent
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* AI Processing — required */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: 16, backgroundColor: colors.bgRecessed, borderRadius: 10,
            }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px 0", color: colors.textPrimary, fontFamily: display }}>
                  {c.privacy.toggles.aiProcessing.title}
                  <span style={{
                    fontSize: 11, padding: "3px 10px", marginLeft: 8,
                    backgroundColor: colors.warningWash, color: colors.warning,
                    borderRadius: 100, verticalAlign: "middle", fontWeight: 600,
                  }}>
                    {c.privacy.toggles.aiProcessing.badge}
                  </span>
                </p>
                <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0, lineHeight: 1.5, fontFamily: body }}>
                  {c.privacy.toggles.aiProcessing.description}
                </p>
              </div>
              <Toggle checked={consent.ai_processing} onChange={() => {}} disabled />
            </div>

            {/* Aggregate analytics — optional */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: 16, backgroundColor: colors.bgRecessed, borderRadius: 10,
            }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px 0", color: colors.textPrimary, fontFamily: display }}>
                  {c.privacy.toggles.aggregateAnalytics.title}
                  <span style={{
                    fontSize: 11, padding: "3px 10px", marginLeft: 8,
                    backgroundColor: colors.coralWash, color: colors.coral,
                    borderRadius: 100, verticalAlign: "middle", fontWeight: 600,
                  }}>
                    {c.privacy.toggles.aggregateAnalytics.badge}
                  </span>
                </p>
                <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0, lineHeight: 1.5, fontFamily: body }}>
                  {c.privacy.toggles.aggregateAnalytics.description}
                </p>
              </div>
              <Toggle
                checked={consent.aggregate_analytics}
                onChange={(v) => setConsent({ ...consent, aggregate_analytics: v })}
              />
            </div>
          </div>

          {/* Email Notifications */}
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "20px 0 12px 0", color: colors.textSecondary, fontFamily: display }}>
            Email Notifications
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: 16, backgroundColor: colors.bgRecessed, borderRadius: 10,
            }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px 0", color: colors.textPrimary, fontFamily: display }}>
                  Inactive reminders
                </p>
                <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0, lineHeight: 1.5, fontFamily: body }}>
                  Get a nudge if you haven&rsquo;t logged in for a couple of days.
                </p>
              </div>
              <Toggle
                checked={consent.inactive_reminders}
                onChange={(v) => setConsent({ ...consent, inactive_reminders: v })}
              />
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: 16, backgroundColor: colors.bgRecessed, borderRadius: 10,
            }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px 0", color: colors.textPrimary, fontFamily: display }}>
                  Program updates
                </p>
                <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0, lineHeight: 1.5, fontFamily: body }}>
                  New features, program launches, and product news.
                </p>
              </div>
              <Toggle
                checked={consent.program_updates}
                onChange={(v) => setConsent({ ...consent, program_updates: v })}
              />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Data Rights ── */}
      <FadeIn preset="slide-up" delay={0.18} triggerOnMount>
        <div style={cardStyle}>
          <h2 style={{
            fontSize: 16, fontWeight: 700, margin: "0 0 6px 0",
            color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.02em",
          }}>
            Your Data Rights
          </h2>
          <p style={{ fontSize: 13, color: colors.textMuted, margin: "0 0 20px 0", fontFamily: body }}>
            You own your data. Download, export, or delete at any time.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Download / Access */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 16px", backgroundColor: colors.bgRecessed, borderRadius: 10,
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: "0 0 2px 0", fontFamily: display }}>
                  Access & Export
                </p>
                <p style={{ fontSize: 12, color: colors.textMuted, margin: 0, fontFamily: body }}>
                  Download all your data as a JSON file
                </p>
              </div>
              <PillButton
                onClick={handleDownload}
                disabled={downloading}
                variant="ghost"
                size="sm"
              >
                {downloading ? "Downloading..." : "Download"}
              </PillButton>
            </div>

            {/* Rectification note */}
            <div style={{
              padding: "14px 16px", backgroundColor: colors.bgRecessed, borderRadius: 10,
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: "0 0 2px 0", fontFamily: display }}>
                Rectification
              </p>
              <p style={{ fontSize: 12, color: colors.textMuted, margin: 0, fontFamily: body }}>
                Edit your display name above, or contact crew@allmindsondeck.com for other corrections.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Save button ── */}
      <FadeIn preset="fade" delay={0.22} triggerOnMount>
        <div style={{ marginBottom: 32 }}>
          <PillButton
            onClick={handleSave}
            disabled={saving}
            variant={saved ? "success" : "coral"}
          >
            {saving ? "Saving..." : saved ? "Saved \u2713" : "Save changes"}
          </PillButton>
        </div>
      </FadeIn>

      {/* ── Sign Out ── */}
      <FadeIn preset="fade" delay={0.26} triggerOnMount>
        <div style={{ marginBottom: 20 }}>
          <PillButton onClick={handleSignOut} variant="ghost">
            Sign out
          </PillButton>
        </div>
      </FadeIn>

      {/* ── Delete account (links to /account/delete) ── */}
      <FadeIn preset="fade" delay={0.26} triggerOnMount>
        <div style={cardStyle}>
          <h2 style={{
            fontSize: 16, fontWeight: 700, margin: "0 0 6px 0",
            color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.02em",
          }}>
            Delete account
          </h2>
          <p style={{ fontSize: 13, color: colors.textMuted, margin: "0 0 16px 0", fontFamily: body, lineHeight: 1.5 }}>
            Request account deletion. We purge everything within 30 days — you can cancel anytime during that window.
          </p>
          <PillButton
            onClick={() => router.push("/account/delete")}
            variant="ghost"
            size="sm"
          >
            Delete my account
          </PillButton>
        </div>
      </FadeIn>
    </PageShell>
  );
}
