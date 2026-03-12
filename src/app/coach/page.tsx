"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import { colors, fonts, card } from "@/lib/theme";
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
      <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
        <Nav />
        <div style={{ textAlign: "center", paddingTop: 120 }}>
          <p style={{ color: colors.gray400 }}>{c.coach.loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
      <Nav />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0", color: colors.black }}>{c.coach.headline}</h1>
          <p style={{ fontSize: 14, color: colors.gray400, margin: 0 }}>{user?.email}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
          {/* Client list */}
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0", color: colors.gray600 }}>
              {c.coach.clientsHeading} ({clients.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {clients.length === 0 && (
                <p style={{ fontSize: 14, color: colors.gray400 }}>{c.coach.noClients}</p>
              )}
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client)}
                  style={{
                    ...card, padding: 12, textAlign: "left",
                    borderColor: selectedClient?.id === client.id ? colors.primary : colors.gray100,
                    backgroundColor: selectedClient?.id === client.id ? colors.primaryLight : colors.white,
                    cursor: "pointer",
                    border: selectedClient?.id === client.id ? `2px solid ${colors.primary}` : `1px solid ${colors.gray100}`,
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 2px 0", color: colors.black }}>
                    {client.name || client.email}
                  </p>
                  <p style={{ fontSize: 12, color: colors.gray400, margin: 0 }}>
                    {client.package || "No package"} &middot; {new Date(client.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Client detail */}
          <div>
            {!selectedClient ? (
              <div style={{ ...card, padding: 48, textAlign: "center", color: colors.gray400, border: `1px dashed ${colors.gray200}` }}>
                <p style={{ fontSize: 15 }}>{c.coach.selectClient}</p>
              </div>
            ) : loadingEntries ? (
              <div style={{ padding: 48, textAlign: "center", color: colors.gray400 }}>
                <p>{c.coach.loadingClient}</p>
              </div>
            ) : (
              <div>
                {/* Client header */}
                <div style={{ ...card, padding: 16, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px 0", color: colors.black }}>
                    {selectedClient.name || selectedClient.email}
                  </h3>
                  <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>
                    {selectedClient.email} &middot; Package: {selectedClient.package || "none"}
                  </p>
                </div>

                {/* Plan summary */}
                {clientPlan && (
                  <div style={{ ...card, padding: 14, marginBottom: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px 0", color: colors.gray600 }}>
                      {c.coach.coachingPlan}
                    </h4>
                    <p style={{ fontSize: 14, color: colors.gray500, margin: "0 0 8px 0", lineHeight: 1.5 }}>
                      {clientPlan.summary}
                    </p>
                    <p style={{ fontSize: 12, color: colors.gray400, margin: 0 }}>
                      Phase: {clientPlan.current_phase} &middot; {clientPlan.goals?.length || 0} goals
                    </p>
                  </div>
                )}

                {/* Enneagram data entry */}
                <div style={{ ...card, padding: 14, marginBottom: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px 0", color: colors.gray600 }}>
                    {c.coach.enneagram.heading}
                  </h4>
                  <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, color: colors.gray400, display: "block", marginBottom: 4 }}>{c.coach.enneagram.typeLabel}</label>
                      <select
                        value={enneagramType}
                        onChange={(e) => setEnneagramType(e.target.value)}
                        style={{
                          padding: "8px 12px", fontSize: 14, border: `1px solid ${colors.gray200}`,
                          borderRadius: 6, width: 120,
                        }}
                      >
                        <option value="">—</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <option key={n} value={String(n)}>Type {n}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: colors.gray400, display: "block", marginBottom: 4 }}>{c.coach.enneagram.notesLabel}</label>
                      <input
                        type="text"
                        value={enneagramNotes}
                        onChange={(e) => setEnneagramNotes(e.target.value)}
                        placeholder={c.coach.enneagram.notesPlaceholder}
                        style={{
                          width: "100%", padding: "8px 12px", fontSize: 14,
                          border: `1px solid ${colors.gray200}`, borderRadius: 6, boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                  <button onClick={saveEnneagram} disabled={savingEnneagram} style={{
                    padding: "6px 16px", fontSize: 13, fontWeight: 600, color: colors.white,
                    backgroundColor: colors.primary, border: "none", borderRadius: 6, cursor: "pointer",
                  }}>
                    {savingEnneagram ? c.coach.enneagram.savingButton : c.coach.enneagram.saveButton}
                  </button>
                </div>

                {/* Recent entries */}
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px 0", color: colors.gray600 }}>
                    {c.coach.recentEntries} ({clientEntries.length})
                  </h4>
                  {clientEntries.length === 0 && (
                    <p style={{ fontSize: 14, color: colors.gray400 }}>{c.coach.noEntries}</p>
                  )}
                  {clientEntries.map((entry) => (
                    <div key={entry.id} style={{ ...card, padding: 12, marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{
                            fontSize: 12, padding: "2px 8px", borderRadius: 10,
                            backgroundColor: entry.type === "one_liner" ? colors.warningLight : colors.primaryLight,
                            color: entry.type === "one_liner" ? "#92400e" : colors.primaryDark,
                            border: `1px solid ${entry.type === "one_liner" ? "#fde68a" : colors.primaryMuted}`,
                          }}>
                            {entry.type === "one_liner" ? "thought" : "journal"}
                          </span>
                          <span style={{ fontSize: 12, color: colors.gray300 }}>{entry.date}</span>
                        </div>
                      </div>
                      <p style={{
                        fontSize: 14, color: colors.dark, margin: "0 0 6px 0", lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                      }}>
                        {entry.content}
                      </p>
                      {entry.theme_tags?.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {entry.theme_tags.map((tag) => (
                            <span key={tag} style={{
                              padding: "2px 8px", fontSize: 11,
                              backgroundColor: colors.gray50, color: colors.gray600, borderRadius: 10,
                            }}>
                              {tag.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
