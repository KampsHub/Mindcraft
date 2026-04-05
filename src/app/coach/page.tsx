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
import EnneagramUpload from "@/components/EnneagramUpload";
import EnneagramInsights from "@/components/EnneagramInsights";
import type { EnneagramAnalysis } from "@/components/EnneagramUpload";

const display = fonts.display;
const body = fonts.bodyAlt;

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

interface AnalyticsData {
  quality: {
    flagsThisWeek: number;
    flagsThisMonth: number;
    flagReasonCounts: Record<string, number>;
    flagTypeCounts: Record<string, number>;
  };
  ratings: {
    avgExerciseRating: number | null;
    avgDayRating: number | null;
    ratingDistribution: Record<number, number>;
    lowRatedExercises: { name: string; count: number }[];
    weeklyTrend: { week: string; avg: number; count: number }[];
    totalRated: number;
  };
  engagement: {
    totalClients: number;
    activeEnrollments: number;
    sessionsThisWeek: number;
    sessionsThisMonth: number;
    exercisesCompletedMonth: number;
    dayFeedbackCount: number;
  };
  funnel: {
    subscriptionStatus: Record<string, number>;
    abandonedCheckouts: number;
    welcomeEmailsSent: number;
  };
  progression: {
    totalSessionsStarted: number;
    totalSessionsCompleted: number;
    completionRate: number;
    stepCompletionCounts: Record<number, number>;
    day1Started: number;
    day1Completed: number;
    enrollmentStatus: Record<string, number>;
    avgCurrentDay: number;
    furthestDay: number;
  };
  emailEngagement: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    topEmails: { subject: string; sent: number; opened: number; clicked: number }[];
  };
}

type Tab = "clients" | "analytics";

export default function CoachPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("clients");
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
  const [enneagramAnalysis, setEnneagramAnalysis] = useState<EnneagramAnalysis | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Coach clients (new relationship model)
  const [coachClients, setCoachClients] = useState<Array<{
    id: string;
    client_id: string | null;
    client_email: string;
    status: string;
    invited_at: string;
    accepted_at: string | null;
    enrollment: { current_day: number; status: string; current_streak: number; best_streak: number; programs: { name: string; slug: string } } | null;
    goals: { goal_text: string; status: string }[];
    enneagram: Record<string, string> | null;
    sharedInsights: { approved_summary: Record<string, unknown> | null; approved_at: string; period_start: string; period_end: string }[];
    lastActive: string | null;
  }>>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [loadingCoachClients, setLoadingCoachClients] = useState(false);
  const [noteTexts, setNoteTexts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);

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

  const fetchCoachClients = useCallback(async () => {
    setLoadingCoachClients(true);
    try {
      const res = await fetch("/api/coach/clients");
      if (res.ok) {
        const data = await res.json();
        setCoachClients(data.clients || []);
      }
    } catch (err) {
      console.error("Failed to fetch coach clients:", err);
    }
    setLoadingCoachClients(false);
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch("/api/coach/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      if (res.ok) {
        setInviteEmail("");
        fetchCoachClients();
      }
    } catch (err) {
      console.error("Failed to invite:", err);
    }
    setInviting(false);
  };

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/coach-analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
    setLoadingAnalytics(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchClients();
      fetchCoachClients();
    });
  }, [supabase.auth, router, fetchClients, fetchCoachClients]);

  useEffect(() => {
    if (activeTab === "analytics" && !analytics) {
      fetchAnalytics();
    }
  }, [activeTab, analytics, fetchAnalytics]);

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
      // Load full analysis if documents were uploaded
      if (enneagram.data?.documents) {
        setEnneagramAnalysis(enneagram.data as EnneagramAnalysis);
      } else {
        setEnneagramAnalysis(null);
      }
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

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {(["clients", "analytics"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 100,
              border: activeTab === tab ? `2px solid ${colors.coral}` : `1px solid ${colors.borderDefault}`,
              backgroundColor: activeTab === tab ? colors.coralWash : "transparent",
              color: activeTab === tab ? colors.coral : colors.textMuted,
              cursor: "pointer",
              fontFamily: display,
              transition: "all 0.15s",
            }}
          >
            {tab === "clients" ? "Clients" : "Analytics & Quality"}
          </button>
        ))}
      </div>

      {activeTab === "clients" ? (
        /* ═══════ CLIENTS TAB — New Coach Dashboard ═══════ */
        <div>
          {/* Invite client */}
          <FadeIn preset="slide-up" triggerOnMount delay={0.05}>
            <div style={{
              display: "flex", gap: 8, marginBottom: 24,
              padding: 20, backgroundColor: colors.bgSurface,
              borderRadius: 12, border: `1px solid ${colors.borderDefault}`,
            }}>
              <input
                type="email"
                placeholder="Add client by email..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
                style={{
                  flex: 1, padding: "10px 14px", fontFamily: body, fontSize: 14,
                  color: colors.textPrimary, backgroundColor: "rgba(255,255,255,0.06)",
                  border: `1px solid ${colors.borderDefault}`, borderRadius: 8, outline: "none",
                }}
              />
              <button
                onClick={handleInvite}
                disabled={inviting}
                style={{
                  padding: "10px 20px", fontFamily: display, fontSize: 13, fontWeight: 600,
                  color: colors.bgDeep, backgroundColor: colors.coral,
                  border: "none", borderRadius: 8, cursor: inviting ? "not-allowed" : "pointer",
                  opacity: inviting ? 0.6 : 1,
                }}
              >
                {inviting ? "..." : "Invite"}
              </button>
            </div>
          </FadeIn>

          {/* Client cards */}
          {loadingCoachClients ? (
            <p style={{ fontFamily: body, fontSize: 14, color: colors.textMuted }}>Loading clients...</p>
          ) : coachClients.length === 0 ? (
            <p style={{ fontFamily: body, fontSize: 14, color: colors.textMuted }}>No clients yet. Add a client email above to get started.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {coachClients.map((cc) => (
                <FadeIn key={cc.id} preset="fade" triggerOnMount>
                  <motion.div
                    whileHover={{ borderColor: colors.coral + "40" }}
                    style={{
                      backgroundColor: colors.bgSurface,
                      borderRadius: 12,
                      border: `1px solid ${colors.borderDefault}`,
                      overflow: "hidden",
                    }}
                  >
                    {/* Client header row */}
                    <button
                      onClick={() => cc.status === "active" && setExpandedClient(expandedClient === cc.id ? null : cc.id)}
                      style={{
                        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "16px 20px", background: "none", border: "none", cursor: cc.status === "active" ? "pointer" : "default",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <span style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                          {cc.client_email}
                        </span>
                        {cc.enrollment && (
                          <span style={{ fontFamily: body, fontSize: 12, color: colors.textMuted, marginLeft: 12 }}>
                            Day {cc.enrollment.current_day} · {cc.enrollment.programs?.name}
                            {(cc.enrollment.current_streak || 0) >= 2 && ` · ${cc.enrollment.current_streak}-day streak`}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {cc.lastActive && (
                          <span style={{ fontFamily: body, fontSize: 11, color: colors.textMuted }}>
                            Last active {new Date(cc.lastActive).toLocaleDateString()}
                          </span>
                        )}
                        <span style={{
                          fontSize: 10, fontWeight: 600, fontFamily: display, textTransform: "uppercase" as const,
                          letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 20,
                          backgroundColor: cc.status === "active" ? `${colors.coral}20` : cc.status === "pending" ? "rgba(255,255,255,0.06)" : "rgba(255,0,0,0.1)",
                          color: cc.status === "active" ? colors.coral : cc.status === "pending" ? colors.textMuted : "#e08585",
                        }}>
                          {cc.status}
                        </span>
                      </div>
                    </button>

                    {/* Expanded client detail */}
                    <AnimatePresence>
                      {expandedClient === cc.id && cc.status === "active" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${colors.borderSubtle}` }}>
                            {/* Goals */}
                            {cc.goals.length > 0 && (
                              <div style={{ marginTop: 16 }}>
                                <h4 style={{ fontFamily: display, fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 }}>
                                  Goals
                                </h4>
                                {cc.goals.map((g, gi) => (
                                  <p key={gi} style={{ fontFamily: body, fontSize: 13, color: colors.textSecondary, margin: "0 0 4px 0", paddingLeft: 12, borderLeft: `2px solid ${colors.coral}40` }}>
                                    {g.goal_text}
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* Shared Insights */}
                            {cc.sharedInsights.length > 0 && (
                              <div style={{ marginTop: 16 }}>
                                <h4 style={{ fontFamily: display, fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 }}>
                                  Shared Insights
                                </h4>
                                {cc.sharedInsights.map((si, sii) => (
                                  <div key={sii} style={{
                                    padding: 12, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 8,
                                    fontSize: 13, fontFamily: body, color: colors.textSecondary, lineHeight: 1.5,
                                  }}>
                                    <span style={{ fontSize: 11, color: colors.textMuted }}>
                                      {new Date(si.period_start).toLocaleDateString()} — {new Date(si.period_end).toLocaleDateString()}
                                    </span>
                                    <p style={{ margin: "6px 0 0 0" }}>
                                      {(() => {
                                        if (typeof si.approved_summary === "object" && si.approved_summary) {
                                          const sections = (si.approved_summary as { sections?: { title: string; content: string }[] }).sections || [];
                                          return sections.map(s => s.content).join(" ").substring(0, 300) + "...";
                                        }
                                        return "Summary available";
                                      })()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Enneagram */}
                            {cc.enneagram && (
                              <div style={{ marginTop: 16 }}>
                                <h4 style={{ fontFamily: display, fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 }}>
                                  Enneagram
                                </h4>
                                <p style={{ fontFamily: body, fontSize: 13, color: colors.textSecondary }}>
                                  Type {(cc.enneagram as { type?: string })?.type || "Unknown"}
                                  {(cc.enneagram as { wing?: string })?.wing && ` w${(cc.enneagram as { wing?: string }).wing}`}
                                </p>
                              </div>
                            )}

                            {/* Coach note */}
                            <div style={{ marginTop: 16 }}>
                              <h4 style={{ fontFamily: display, fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 }}>
                                Leave a note
                              </h4>
                              <div style={{ display: "flex", gap: 8 }}>
                                <input
                                  type="text"
                                  placeholder="Note for this client's next session..."
                                  value={noteTexts[cc.id] || ""}
                                  onChange={(e) => setNoteTexts(prev => ({ ...prev, [cc.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && noteTexts[cc.id]?.trim()) {
                                      setSavingNote(cc.id);
                                      supabase.from("coach_notes").insert({
                                        coach_id: user?.id,
                                        client_id: cc.client_id,
                                        enrollment_id: cc.enrollment ? (cc.enrollment as unknown as { id: string }).id : null,
                                        note: noteTexts[cc.id].trim(),
                                      }).then(() => {
                                        setNoteTexts(prev => ({ ...prev, [cc.id]: "" }));
                                        setSavingNote(null);
                                      });
                                    }
                                  }}
                                  style={{
                                    flex: 1, padding: "8px 12px", fontFamily: body, fontSize: 13,
                                    color: colors.textPrimary, backgroundColor: "rgba(255,255,255,0.06)",
                                    border: `1px solid ${colors.borderDefault}`, borderRadius: 8, outline: "none",
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    if (!noteTexts[cc.id]?.trim()) return;
                                    setSavingNote(cc.id);
                                    supabase.from("coach_notes").insert({
                                      coach_id: user?.id,
                                      client_id: cc.client_id,
                                      enrollment_id: cc.enrollment ? (cc.enrollment as unknown as { id: string }).id : null,
                                      note: noteTexts[cc.id].trim(),
                                    }).then(() => {
                                      setNoteTexts(prev => ({ ...prev, [cc.id]: "" }));
                                      setSavingNote(null);
                                    });
                                  }}
                                  disabled={savingNote === cc.id}
                                  style={{
                                    padding: "8px 16px", fontFamily: display, fontSize: 12, fontWeight: 600,
                                    color: colors.bgDeep, backgroundColor: colors.coral,
                                    border: "none", borderRadius: 8, cursor: "pointer",
                                    opacity: savingNote === cc.id ? 0.6 : 1,
                                  }}
                                >
                                  {savingNote === cc.id ? "..." : "Send"}
                                </button>
                              </div>
                              <p style={{ fontFamily: body, fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
                                This note will appear in the client&rsquo;s next daily thread.
                              </p>
                            </div>

                            {cc.goals.length === 0 && cc.sharedInsights.length === 0 && !cc.enneagram && (
                              <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, marginTop: 16 }}>
                                No shared data yet. Client hasn&rsquo;t shared insights or set goals.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          )}

          {/* Legacy client list (admin fallback) */}
          {clients.length > 0 && (
            <details style={{ marginTop: 32 }}>
              <summary style={{ fontFamily: display, fontSize: 13, fontWeight: 600, color: colors.textMuted, cursor: "pointer", marginBottom: 12 }}>
                All users ({clients.length})
              </summary>
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

                    {/* Enneagram document upload (coach) */}
                    <div style={{ marginTop: 16 }}>
                      {enneagramAnalysis ? (
                        <EnneagramInsights data={enneagramAnalysis} />
                      ) : (
                        <EnneagramUpload
                          clientId={selectedClient.id}
                          onAnalysisComplete={(data) => {
                            setEnneagramAnalysis(data);
                            if (data.type) setEnneagramType(data.type);
                          }}
                        />
                      )}
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
            </details>
          )}
        </div>
      ) : (
        /* ═══════ ANALYTICS & QUALITY TAB ═══════ */
        <div>
          {loadingAnalytics ? (
            <div style={{ textAlign: "center", padding: 48 }}>
              <p style={{ color: colors.textMuted, fontFamily: body }}>Loading analytics...</p>
            </div>
          ) : analytics ? (
            <FadeIn preset="fade" triggerOnMount>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* ── Overview Cards ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                  <MetricCard label="Total Clients" value={analytics.engagement.totalClients} />
                  <MetricCard label="Active Enrollments" value={analytics.engagement.activeEnrollments} />
                  <MetricCard label="Sessions This Week" value={analytics.engagement.sessionsThisWeek} />
                  <MetricCard label="Sessions This Month" value={analytics.engagement.sessionsThisMonth} />
                </div>

                {/* ── Payment Funnel ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{
                    backgroundColor: colors.bgSurface,
                    borderRadius: 14,
                    border: `1px solid ${colors.borderDefault}`,
                    padding: 20,
                  }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: display }}>
                      Payment Funnel
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {Object.entries(analytics.funnel.subscriptionStatus)
                        .sort(([, a], [, b]) => b - a)
                        .map(([status, count]) => (
                          <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                width: 8, height: 8, borderRadius: "50%", display: "inline-block",
                                backgroundColor: status === "active" ? colors.success
                                  : status === "cancelled" ? colors.error
                                  : status === "past_due" ? colors.warning
                                  : status === "trialing" ? colors.coral
                                  : colors.textMuted,
                              }} />
                              <span style={{ fontSize: 13, color: colors.textBody, fontFamily: body }}>
                                {status === "none" ? "no subscription" : status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, fontFamily: display }}>
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                    {analytics.funnel.abandonedCheckouts > 0 && (
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${colors.borderDefault}` }}>
                        <StatRow label="Abandoned checkouts (30d)" value={analytics.funnel.abandonedCheckouts} />
                      </div>
                    )}
                  </div>

                  <div style={{
                    backgroundColor: colors.bgSurface,
                    borderRadius: 14,
                    border: `1px solid ${colors.borderDefault}`,
                    padding: 20,
                  }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: display }}>
                      Enrollment Status
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {Object.entries(analytics.progression.enrollmentStatus)
                        .sort(([, a], [, b]) => b - a)
                        .map(([status, count]) => (
                          <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                width: 8, height: 8, borderRadius: "50%", display: "inline-block",
                                backgroundColor: status === "active" ? colors.success
                                  : status === "completed" ? colors.coral
                                  : status === "paused" ? colors.warning
                                  : status === "onboarding" ? colors.success
                                  : colors.textMuted,
                              }} />
                              <span style={{ fontSize: 13, color: colors.textBody, fontFamily: body }}>
                                {status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, fontFamily: display }}>
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${colors.borderDefault}`, display: "flex", flexDirection: "column", gap: 6 }}>
                      <StatRow label="Avg. current day" value={analytics.progression.avgCurrentDay} />
                      <StatRow label="Furthest day reached" value={analytics.progression.furthestDay} />
                      <StatRow label="Welcome emails sent" value={analytics.funnel.welcomeEmailsSent} />
                    </div>
                  </div>
                </div>

                {/* ── Day Completion Funnel ── */}
                <div style={{
                  backgroundColor: colors.bgSurface,
                  borderRadius: 14,
                  border: `1px solid ${colors.borderDefault}`,
                  padding: 20,
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: display }}>
                    Day Completion
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary, margin: "0 0 2px 0", fontFamily: display }}>
                        {analytics.progression.totalSessionsStarted}
                      </p>
                      <p style={{ fontSize: 11, color: colors.textMuted, margin: 0, fontFamily: body, textTransform: "uppercase" }}>Started</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 28, fontWeight: 700, color: colors.success, margin: "0 0 2px 0", fontFamily: display }}>
                        {analytics.progression.totalSessionsCompleted}
                      </p>
                      <p style={{ fontSize: 11, color: colors.textMuted, margin: 0, fontFamily: body, textTransform: "uppercase" }}>Completed</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 28, fontWeight: 700, color: analytics.progression.completionRate >= 70 ? colors.success : analytics.progression.completionRate >= 40 ? colors.warning : colors.error, margin: "0 0 2px 0", fontFamily: display }}>
                        {analytics.progression.completionRate}%
                      </p>
                      <p style={{ fontSize: 11, color: colors.textMuted, margin: 0, fontFamily: body, textTransform: "uppercase" }}>Completion Rate</p>
                    </div>
                  </div>

                  {/* Day 1 highlight */}
                  <div style={{ padding: "10px 14px", backgroundColor: colors.bgElevated, borderRadius: 10, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: colors.textBody, fontFamily: body }}>
                        Day 1 — {analytics.progression.day1Started} started, {analytics.progression.day1Completed} completed
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: "2px 10px",
                        borderRadius: 100,
                        backgroundColor: analytics.progression.day1Started > 0 && analytics.progression.day1Completed / analytics.progression.day1Started >= 0.7 ? colors.successWash : colors.warningWash,
                        color: analytics.progression.day1Started > 0 && analytics.progression.day1Completed / analytics.progression.day1Started >= 0.7 ? colors.success : colors.warning,
                        fontFamily: display,
                      }}>
                        {analytics.progression.day1Started > 0
                          ? `${Math.round((analytics.progression.day1Completed / analytics.progression.day1Started) * 100)}%`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Step completion funnel */}
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, margin: "0 0 10px 0", textTransform: "uppercase", fontFamily: display }}>
                    Step Drop-off
                  </h4>
                  <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 70 }}>
                    {[
                      { step: 1, label: "Themes" },
                      { step: 2, label: "Journal" },
                      { step: 3, label: "Analysis" },
                      { step: 4, label: "Exercises" },
                      { step: 5, label: "Summary" },
                    ].map(({ step, label }) => {
                      const count = analytics.progression.stepCompletionCounts[step] || 0;
                      const maxStep = Math.max(...Object.values(analytics.progression.stepCompletionCounts), 1);
                      return (
                        <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary, fontFamily: display }}>{count}</span>
                          <div style={{
                            width: "100%",
                            height: `${(count / maxStep) * 50}px`,
                            backgroundColor: colors.coralWash,
                            borderRadius: 4,
                            minHeight: 2,
                            border: `1px solid ${colors.coral}`,
                          }} />
                          <span style={{ fontSize: 9, color: colors.textMuted, fontFamily: body, textAlign: "center" }}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Ratings Overview ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{
                    backgroundColor: colors.bgSurface,
                    borderRadius: 14,
                    border: `1px solid ${colors.borderDefault}`,
                    padding: 20,
                  }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: display }}>
                      Exercise Ratings
                    </h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 36, fontWeight: 700, color: colors.textPrimary, fontFamily: display }}>
                        {analytics.ratings.avgExerciseRating ?? "—"}
                      </span>
                      <span style={{ fontSize: 14, color: colors.textMuted, fontFamily: body }}>
                        / 5 avg ({analytics.ratings.totalRated} rated)
                      </span>
                    </div>
                    {/* Rating distribution bar */}
                    <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60 }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const count = analytics.ratings.ratingDistribution[star] || 0;
                        const max = Math.max(...Object.values(analytics.ratings.ratingDistribution), 1);
                        return (
                          <div key={star} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div style={{
                              width: "100%",
                              height: `${(count / max) * 50}px`,
                              backgroundColor: star <= 2 ? colors.errorWash : star <= 3 ? colors.warningWash : colors.coralWash,
                              borderRadius: 4,
                              minHeight: 2,
                            }} />
                            <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: body }}>
                              {star}★ ({count})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: colors.bgSurface,
                    borderRadius: 14,
                    border: `1px solid ${colors.borderDefault}`,
                    padding: 20,
                  }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: display }}>
                      Day Ratings & Engagement
                    </h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 36, fontWeight: 700, color: colors.textPrimary, fontFamily: display }}>
                        {analytics.ratings.avgDayRating ?? "—"}
                      </span>
                      <span style={{ fontSize: 14, color: colors.textMuted, fontFamily: body }}>
                        / 5 avg day rating
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <StatRow label="Exercises completed (30d)" value={analytics.engagement.exercisesCompletedMonth} />
                      <StatRow label="Written day feedback" value={analytics.engagement.dayFeedbackCount} />
                    </div>
                  </div>
                </div>

                {/* ── Weekly Rating Trend ── */}
                <div style={{
                  backgroundColor: colors.bgSurface,
                  borderRadius: 14,
                  border: `1px solid ${colors.borderDefault}`,
                  padding: 20,
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: display }}>
                    Exercise Rating Trend (4 weeks)
                  </h3>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-end", height: 80 }}>
                    {analytics.ratings.weeklyTrend.map((w, i) => {
                      const barHeight = w.avg > 0 ? (w.avg / 5) * 60 : 2;
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary, fontFamily: display }}>
                            {w.avg > 0 ? w.avg : "—"}
                          </span>
                          <div style={{
                            width: "100%",
                            height: barHeight,
                            backgroundColor: w.avg >= 4 ? colors.successWash : w.avg >= 3 ? colors.coralWash : colors.errorWash,
                            borderRadius: 6,
                            border: `1px solid ${w.avg >= 4 ? colors.success : w.avg >= 3 ? colors.coral : colors.error}`,
                          }} />
                          <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: body }}>
                            {w.week} ({w.count})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Quality Flags ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{
                    backgroundColor: colors.bgSurface,
                    borderRadius: 14,
                    border: `1px solid ${colors.borderDefault}`,
                    padding: 20,
                  }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: display }}>
                      Quality Flags
                    </h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
                      <div>
                        <span style={{ fontSize: 28, fontWeight: 700, color: analytics.quality.flagsThisWeek > 0 ? colors.error : colors.textPrimary, fontFamily: display }}>
                          {analytics.quality.flagsThisWeek}
                        </span>
                        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: body, marginLeft: 4 }}>this week</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 20, fontWeight: 600, color: colors.textSecondary, fontFamily: display }}>
                          {analytics.quality.flagsThisMonth}
                        </span>
                        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: body, marginLeft: 4 }}>this month</span>
                      </div>
                    </div>
                    {Object.keys(analytics.quality.flagReasonCounts).length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {Object.entries(analytics.quality.flagReasonCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([reason, count]) => (
                            <div key={reason} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 13, color: colors.textBody, fontFamily: body }}>
                                {reason.replace(/_/g, " ")}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, fontFamily: display }}>
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: body, margin: 0 }}>
                        No flags yet
                      </p>
                    )}
                  </div>

                  <div style={{
                    backgroundColor: colors.bgSurface,
                    borderRadius: 14,
                    border: `1px solid ${colors.borderDefault}`,
                    padding: 20,
                  }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: display }}>
                      Flags by Output Type
                    </h3>
                    {Object.keys(analytics.quality.flagTypeCounts).length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {Object.entries(analytics.quality.flagTypeCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([type, count]) => (
                            <div key={type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 13, color: colors.textBody, fontFamily: body }}>
                                {type.replace(/_/g, " ")}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, fontFamily: display }}>
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: body, margin: 0 }}>
                        No flags yet
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Low-Rated Exercises ── */}
                {analytics.ratings.lowRatedExercises.length > 0 && (
                  <div style={{
                    backgroundColor: colors.bgSurface,
                    borderRadius: 14,
                    border: `1px solid ${colors.borderDefault}`,
                    padding: 20,
                  }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: display }}>
                      Low-Rated Exercises (1-2 stars)
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {analytics.ratings.lowRatedExercises.map((ex) => (
                        <div key={ex.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: colors.textBody, fontFamily: body }}>
                            {ex.name}
                          </span>
                          <span style={{
                            fontSize: 12, fontWeight: 600, padding: "2px 10px",
                            borderRadius: 100, backgroundColor: colors.errorWash, color: colors.error,
                            fontFamily: display,
                          }}>
                            {ex.count}x low rated
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Email Engagement ── */}
                {analytics.emailEngagement && (
                  <div style={{
                    backgroundColor: colors.bgSurface,
                    borderRadius: 14,
                    border: `1px solid ${colors.borderDefault}`,
                    padding: 20,
                  }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: display }}>
                      Email Engagement (30d)
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                      {[
                        { label: "Delivery", value: `${analytics.emailEngagement.deliveryRate}%`, sub: `${analytics.emailEngagement.delivered}/${analytics.emailEngagement.sent}`, color: colors.success },
                        { label: "Open Rate", value: `${analytics.emailEngagement.openRate}%`, sub: `${analytics.emailEngagement.opened} opened`, color: colors.coral },
                        { label: "Click Rate", value: `${analytics.emailEngagement.clickRate}%`, sub: `${analytics.emailEngagement.clicked} clicks`, color: colors.coral },
                        { label: "Bounce", value: `${analytics.emailEngagement.bounceRate}%`, sub: `${analytics.emailEngagement.bounced} bounced`, color: analytics.emailEngagement.bounced > 0 ? colors.error : colors.success },
                      ].map(({ label, value, sub, color }) => (
                        <div key={label} style={{ textAlign: "center" }}>
                          <p style={{ fontSize: 24, fontWeight: 700, color, fontFamily: display, margin: 0 }}>{value}</p>
                          <p style={{ fontSize: 11, color: colors.textMuted, fontFamily: body, margin: "2px 0 0 0" }}>{label}</p>
                          <p style={{ fontSize: 10, color: colors.textMuted, fontFamily: body, margin: "2px 0 0 0" }}>{sub}</p>
                        </div>
                      ))}
                    </div>
                    {analytics.emailEngagement.topEmails.length > 0 && (
                      <>
                        <h4 style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, margin: "0 0 10px 0", textTransform: "uppercase", fontFamily: display }}>
                          Top Emails
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {analytics.emailEngagement.topEmails.map((email) => (
                            <div key={email.subject} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 13, color: colors.textBody, fontFamily: body, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {email.subject}
                              </span>
                              <div style={{ display: "flex", gap: 12, marginLeft: 12, flexShrink: 0 }}>
                                <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: body }}>{email.sent} sent</span>
                                <span style={{ fontSize: 11, color: colors.coral, fontFamily: body }}>{email.opened} opened</span>
                                <span style={{ fontSize: 11, color: colors.success, fontFamily: body }}>{email.clicked} clicked</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {analytics.emailEngagement.sent === 0 && (
                      <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: body, margin: 0, textAlign: "center" }}>
                        No email events recorded yet. Configure Resend webhooks to start tracking.
                      </p>
                    )}
                  </div>
                )}

                {/* Refresh button */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={fetchAnalytics}
                    disabled={loadingAnalytics}
                    style={{
                      padding: "8px 20px", fontSize: 12, fontWeight: 500,
                      border: `1px solid ${colors.borderDefault}`,
                      borderRadius: 8, backgroundColor: "transparent",
                      color: colors.textMuted, cursor: "pointer", fontFamily: body,
                    }}
                  >
                    {loadingAnalytics ? "Refreshing..." : "Refresh data"}
                  </button>
                </div>
              </div>
            </FadeIn>
          ) : (
            <div style={{ textAlign: "center", padding: 48 }}>
              <p style={{ color: colors.textMuted, fontFamily: body }}>Could not load analytics</p>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}

/* ── Helper Components ── */

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      backgroundColor: colors.bgSurface,
      borderRadius: 14,
      border: `1px solid ${colors.borderDefault}`,
      padding: 16,
      textAlign: "center",
    }}>
      <p style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary, margin: "0 0 4px 0", fontFamily: fonts.display }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: colors.textMuted, margin: 0, fontFamily: fonts.bodyAlt, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: colors.textBody, fontFamily: fonts.bodyAlt }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, fontFamily: fonts.display }}>{value}</span>
    </div>
  );
}
