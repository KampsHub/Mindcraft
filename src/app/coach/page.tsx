"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import PageShell from "@/components/PageShell";
import PillButton from "@/components/PillButton";
import FadeIn from "@/components/FadeIn";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import { content as c } from "@/content/site";

interface Client {
  id: string;
  email: string;
  name: string;
  package: string;
  created_at: string;
}

interface Entry {
  id: string;
  type: string;
  content: string;
  theme_tags: string[];
  date: string;
  metadata: Record<string, unknown>;
}

interface Plan {
  id: string;
  summary: string;
  current_phase: string;
  goals: { goal: string; why: string }[];
}

export default function CoachPage() {
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientEntries, setClientEntries] = useState<Entry[]>([]);
  const [clientPlan, setClientPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [enneagramType, setEnneagramType] = useState("");
  const [enneagramNotes, setEnneagramNotes] = useState("");
  const [sharedSummaries, setSharedSummaries] = useState<{ id: string; enrollment_id: string; approved_summary: { sections: { id: string; title: string; content: string }[] }; period_start: string; period_end: string; approved_at: string; programs?: { name: string } }[]>([]);
  const [savingEnneagram, setSavingEnneagram] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const fetchClients = useCallback(async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setClients(data);
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
      fetchClients();
    });
  }, [supabase.auth, router, fetchClients]);

  async function selectClient(client: Client) {
    setSelectedClient(client);
    setLoadingEntries(true);
    setClientEntries([]);
    setClientPlan(null);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: entries } = await supabase
      .from("entries")
      .select("*")
      .eq("client_id", client.id)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false })
      .limit(20);

    if (entries) {
      setClientEntries(entries);
    }

    const { data: plan } = await supabase
      .from("coaching_plans")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (plan) {
      setClientPlan(plan);
    }

    const { data: enneagram } = await supabase
      .from("client_assessments")
      .select("*")
      .eq("client_id", client.id)
      .eq("type", "enneagram")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (enneagram) {
      setEnneagramType(enneagram.data?.type || "");
      setEnneagramNotes(enneagram.data?.notes || "");
    } else {
      setEnneagramType("");
      setEnneagramNotes("");
    }

    // Fetch approved shared summaries
    const { data: summaries } = await supabase
      .from("shared_summaries")
      .select("id, enrollment_id, approved_summary, period_start, period_end, approved_at")
      .eq("client_id", client.id)
      .eq("status", "approved")
      .order("approved_at", { ascending: false });
    setSharedSummaries(summaries || []);

    setLoadingEntries(false);
  }

  async function saveEnneagram() {
    if (!selectedClient) return;
    setSavingEnneagram(true);

    await supabase
      .from("client_assessments")
      .upsert({
        client_id: selectedClient.id,
        type: "enneagram",
        data: { type: enneagramType, notes: enneagramNotes },
      }, { onConflict: "client_id,type" });

    setSavingEnneagram(false);
  }

  if (loading) {
    return (
      <PageShell maxWidth={960}>
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <p style={{ color: colors.textMuted }}>{c.coach.loadingText}</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth={960}>
      <FadeIn preset="fade" triggerOnMount delay={0}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0", color: colors.textPrimary }}>{c.coach.headline}</h1>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: 0 }}>{user?.email}</p>
        </div>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        {/* Client list */}
        <FadeIn preset="slide-up" triggerOnMount delay={0.1}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0", color: colors.textSecondary }}>
              {c.coach.clientsHeading} ({clients.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {clients.length === 0 && (
                <p style={{ fontSize: 14, color: colors.textMuted }}>{c.coach.noClients}</p>
              )}
              {clients.map((client) => (
                <motion.button
                  key={client.id}
                  onClick={() => selectClient(client)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{
                    padding: 12,
                    textAlign: "left" as const,
                    borderRadius: 14,
                    backgroundColor: selectedClient?.id === client.id ? colors.coralWash : colors.bgSurface,
                    cursor: "pointer",
                    border: selectedClient?.id === client.id ? `2px solid ${colors.coral}` : `1px solid ${colors.borderDefault}`,
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 2px 0", color: colors.textPrimary }}>
                    {client.name || client.email}
                  </p>
                  <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>
                    {client.package || "No package"} &middot; {new Date(client.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Client detail */}
        <div>
          <AnimatePresence mode="wait">
            {!selectedClient ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderRadius: 14,
                  border: `1px dashed ${colors.borderDefault}`,
                  padding: 48,
                  textAlign: "center",
                  color: colors.textMuted,
                }}
              >
                <p style={{ fontSize: 15 }}>{c.coach.selectClient}</p>
              </motion.div>
            ) : loadingEntries ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ padding: 48, textAlign: "center", color: colors.textMuted }}
              >
                <p>{c.coach.loadingClient}</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedClient.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Client header */}
                <div style={{
                  backgroundColor: colors.bgSurface,
                  borderRadius: 14,
                  border: `1px solid ${colors.borderDefault}`,
                  padding: 16,
                  marginBottom: 20,
                }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px 0", color: colors.textPrimary }}>
                    {selectedClient.name || selectedClient.email}
                  </h3>
                  <p style={{ fontSize: 13, color: colors.textMuted, margin: 0 }}>
                    {selectedClient.email} &middot; Package: {selectedClient.package || "none"}
                  </p>
                </div>

                {/* Plan summary */}
                {clientPlan && (
                  <FadeIn preset="fade" delay={0.05}>
                    <div style={{
                      backgroundColor: colors.bgSurface,
                      borderRadius: 14,
                      border: `1px solid ${colors.borderDefault}`,
                      padding: 14,
                      marginBottom: 20,
                    }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px 0", color: colors.textSecondary }}>
                        {c.coach.coachingPlan}
                      </h4>
                      <p style={{ fontSize: 14, color: colors.textSecondary, margin: "0 0 8px 0", lineHeight: 1.5 }}>
                        {clientPlan.summary}
                      </p>
                      <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>
                        Phase: {clientPlan.current_phase} &middot; {clientPlan.goals?.length || 0} goals
                      </p>
                    </div>
                  </FadeIn>
                )}

                {/* Enneagram data entry */}
                <FadeIn preset="fade" delay={0.1}>
                  <div style={{
                    backgroundColor: colors.bgSurface,
                    borderRadius: 14,
                    border: `1px solid ${colors.borderDefault}`,
                    padding: 14,
                    marginBottom: 20,
                  }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px 0", color: colors.textSecondary }}>
                      {c.coach.enneagram.heading}
                    </h4>
                    <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      <div>
                        <label style={{ fontSize: 12, color: colors.textMuted, display: "block", marginBottom: 4 }}>{c.coach.enneagram.typeLabel}</label>
                        <select
                          value={enneagramType}
                          onChange={(e) => setEnneagramType(e.target.value)}
                          style={{
                            padding: "8px 12px", fontSize: 14,
                            border: `1px solid ${colors.borderDefault}`,
                            borderRadius: 6, width: 120,
                            backgroundColor: colors.bgInput,
                            color: colors.textPrimary,
                          }}
                        >
                          <option value="">—</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                            <option key={n} value={String(n)}>Type {n}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 12, color: colors.textMuted, display: "block", marginBottom: 4 }}>{c.coach.enneagram.notesLabel}</label>
                        <input
                          type="text"
                          value={enneagramNotes}
                          onChange={(e) => setEnneagramNotes(e.target.value)}
                          placeholder={c.coach.enneagram.notesPlaceholder}
                          style={{
                            width: "100%", padding: "8px 12px", fontSize: 14,
                            border: `1px solid ${colors.borderDefault}`,
                            borderRadius: 6, boxSizing: "border-box",
                            backgroundColor: colors.bgInput,
                            color: colors.textPrimary,
                          }}
                        />
                      </div>
                    </div>
                    <PillButton onClick={saveEnneagram} disabled={savingEnneagram} size="sm">
                      {savingEnneagram ? c.coach.enneagram.savingButton : c.coach.enneagram.saveButton}
                    </PillButton>
                  </div>
                </FadeIn>

                {/* Shared summaries */}
                {sharedSummaries.length > 0 && (
                  <FadeIn preset="fade" delay={0.15}>
                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px 0", color: colors.textSecondary }}>
                        Shared Summaries ({sharedSummaries.length})
                      </h4>
                      {sharedSummaries.map((s) => (
                        <div key={s.id} style={{
                          backgroundColor: colors.bgSurface,
                          borderRadius: 14,
                          border: `1px solid ${colors.borderDefault}`,
                          padding: 16,
                          marginBottom: 10,
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: colors.textMuted }}>
                              {s.period_start} — {s.period_end}
                            </span>
                            <span style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 10,
                              backgroundColor: colors.coralWash, color: colors.coral,
                            }}>
                              approved
                            </span>
                          </div>
                          {s.approved_summary?.sections?.map((sec: { id: string; title: string; content: string }) => (
                            <div key={sec.id} style={{ marginBottom: 10 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: colors.textBody, margin: "0 0 3px 0" }}>
                                {sec.title}
                              </p>
                              <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
                                {sec.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </FadeIn>
                )}

                {/* Recent entries */}
                <FadeIn preset="fade" delay={0.2}>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px 0", color: colors.textSecondary }}>
                      {c.coach.recentEntries} ({clientEntries.length})
                    </h4>
                    {clientEntries.length === 0 && (
                      <p style={{ fontSize: 14, color: colors.textMuted }}>{c.coach.noEntries}</p>
                    )}
                    {clientEntries.map((entry) => (
                      <div key={entry.id} style={{
                        backgroundColor: colors.bgSurface,
                        borderRadius: 14,
                        border: `1px solid ${colors.borderDefault}`,
                        padding: 12,
                        marginBottom: 8,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{
                              fontSize: 12, padding: "2px 8px", borderRadius: 10,
                              backgroundColor: entry.type === "one_liner" ? "rgba(245,158,11,0.12)" : colors.coralWash,
                              color: entry.type === "one_liner" ? "#fbbf24" : colors.coral,
                            }}>
                              {entry.type === "one_liner" ? "thought" : "journal"}
                            </span>
                            <span style={{ fontSize: 12, color: colors.textMuted }}>{entry.date}</span>
                          </div>
                        </div>
                        <p style={{
                          fontSize: 14, color: colors.textBody, margin: "0 0 6px 0", lineHeight: 1.5,
                          whiteSpace: "pre-wrap",
                        }}>
                          {entry.content}
                        </p>
                        {entry.theme_tags?.length > 0 && (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {entry.theme_tags.map((tag) => (
                              <span key={tag} style={{
                                padding: "2px 8px", fontSize: 11,
                                backgroundColor: colors.bgElevated, color: colors.textSecondary, borderRadius: 10,
                              }}>
                                {tag.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </FadeIn>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageShell>
  );
}
