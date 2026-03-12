"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import { colors, fonts, card } from "@/lib/theme";

interface ConsentSettings {
  ai_processing: boolean;
  coach_sharing: boolean;
  aggregate_analytics: boolean;
}

export default function PrivacyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [consent, setConsent] = useState<ConsentSettings>({
    ai_processing: true,
    coach_sharing: false,
    aggregate_analytics: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchConsent = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("consent_settings")
      .select("*")
      .eq("client_id", userId)
      .single();

    if (data) {
      setConsent({
        ai_processing: data.ai_processing ?? true,
        coach_sharing: data.coach_sharing ?? false,
        aggregate_analytics: data.aggregate_analytics ?? true,
      });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchConsent(user.id);
    });
  }, [supabase.auth, router, fetchConsent]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("consent_settings")
      .upsert({
        client_id: user.id,
        ...consent,
        updated_at: new Date().toISOString(),
      }, { onConflict: "client_id" });

    if (error) {
      console.error("Failed to save consent:", error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
      <button
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 48, height: 26, borderRadius: 13,
          backgroundColor: checked ? colors.primary : colors.gray200,
          border: "none", cursor: disabled ? "not-allowed" : "pointer",
          position: "relative", transition: "background-color 0.2s",
          opacity: disabled ? 0.5 : 1,
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 11,
          backgroundColor: colors.white, position: "absolute",
          top: 2, left: checked ? 24 : 2,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    );
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
        <Nav />
        <div style={{ textAlign: "center", paddingTop: 120 }}>
          <p style={{ color: colors.gray400 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
      <Nav />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0", color: colors.black }}>Privacy &amp; Consent</h1>
          <p style={{ fontSize: 14, color: colors.gray400, margin: 0 }}>Control how your data is used</p>
        </div>

        {/* Data usage explanation */}
        <div style={{ ...card, padding: 16, marginBottom: 28, lineHeight: 1.6 }}>
          <p style={{ fontSize: 14, color: colors.gray600, margin: 0 }}>
            Your journal entries, exercises, and coaching data belong to you. We use AI to generate
            personalised reflections and exercises. Below you can control exactly how your data is
            processed and shared.
          </p>
        </div>

        {/* Consent toggles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
          {/* AI Processing — required */}
          <div style={{
            ...card,
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            padding: 16,
          }}>
            <div style={{ flex: 1, marginRight: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 4px 0", color: colors.black }}>
                AI Processing
                <span style={{
                  fontSize: 11, padding: "2px 8px", marginLeft: 8,
                  backgroundColor: colors.warningLight, color: "#92400e",
                  borderRadius: 10, verticalAlign: "middle",
                }}>Required</span>
              </p>
              <p style={{ fontSize: 13, color: colors.gray500, margin: 0, lineHeight: 1.5 }}>
                Your entries are processed by Claude (Anthropic) to generate coaching reflections,
                theme tags, and exercise recommendations. This is required for the service to function.
                Entries are not used to train AI models.
              </p>
            </div>
            <Toggle checked={consent.ai_processing} onChange={() => {}} disabled />
          </div>

          {/* Coach sharing — optional */}
          <div style={{
            ...card,
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            padding: 16,
          }}>
            <div style={{ flex: 1, marginRight: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 4px 0", color: colors.black }}>
                Share with Coach
                <span style={{
                  fontSize: 11, padding: "2px 8px", marginLeft: 8,
                  backgroundColor: colors.primaryLight, color: colors.primaryDark,
                  borderRadius: 10, verticalAlign: "middle",
                }}>Optional</span>
              </p>
              <p style={{ fontSize: 13, color: colors.gray500, margin: 0, lineHeight: 1.5 }}>
                Allow your coach to view your journal entries, reflections, and monthly summaries.
                Your coach can use this to personalise live sessions. You can revoke access at any time.
              </p>
            </div>
            <Toggle
              checked={consent.coach_sharing}
              onChange={(v) => setConsent({ ...consent, coach_sharing: v })}
            />
          </div>

          {/* Aggregate analytics — optional */}
          <div style={{
            ...card,
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            padding: 16,
          }}>
            <div style={{ flex: 1, marginRight: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 4px 0", color: colors.black }}>
                Aggregate Analytics
                <span style={{
                  fontSize: 11, padding: "2px 8px", marginLeft: 8,
                  backgroundColor: colors.primaryLight, color: colors.primaryDark,
                  borderRadius: 10, verticalAlign: "middle",
                }}>Optional</span>
              </p>
              <p style={{ fontSize: 13, color: colors.gray500, margin: 0, lineHeight: 1.5 }}>
                Contribute anonymised, aggregated data to help improve the coaching framework library.
                No individual entries are ever shared — only theme trends and usage patterns across
                all users.
              </p>
            </div>
            <Toggle
              checked={consent.aggregate_analytics}
              onChange={(v) => setConsent({ ...consent, aggregate_analytics: v })}
            />
          </div>
        </div>

        {/* Data rights */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 12px 0", color: colors.black }}>Your Data Rights</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { right: "Access", desc: "Download all your data at any time" },
              { right: "Deletion", desc: "Request complete deletion of your account and all data" },
              { right: "Portability", desc: "Export your journal entries, plans, and assessments" },
              { right: "Rectification", desc: "Correct any inaccurate personal information" },
            ].map(({ right, desc }) => (
              <div key={right} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <span style={{ fontSize: 14, fontWeight: 500, width: 100, flexShrink: 0, color: colors.black }}>{right}</span>
                <span style={{ fontSize: 14, color: colors.gray500 }}>{desc}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: colors.gray400, marginTop: 12 }}>
            To exercise any of these rights, contact privacy@allmindsondeck.com
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "12px 32px", fontSize: 15, fontWeight: 600, color: colors.white,
            backgroundColor: saving ? colors.gray400 : saved ? colors.success : colors.primary,
            border: "none", borderRadius: 8,
            cursor: saving ? "not-allowed" : "pointer",
            transition: "background-color 0.15s",
          }}
        >
          {saving ? "Saving..." : saved ? "Saved \u2713" : "Save preferences"}
        </button>
      </div>
    </div>
  );
}
