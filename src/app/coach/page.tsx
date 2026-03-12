"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

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
    // For now, fetch all clients (in production, filter by coach_id)
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

    // Fetch client entries (last 30 days)
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

    // Fetch client plan
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

    // Fetch enneagram data if exists
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

  const container: React.CSSProperties = {
    maxWidth: 960,
    margin: "0 auto",
    padding: "48px 24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  if (loading) {
    return (
      <div style={{ ...container, textAlign: "center", paddingTop: 120 }}>
        <p style={{ color: "#888" }}>Loading coach view...</p>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 4px 0" }}>Coach View</h1>
          <p style={{ fontSize: 14, color: "#888", margin: 0 }}>{user?.email}</p>
        </div>
        <button onClick={() => router.push("/dashboard")} style={{
          padding: "8px 16px", fontSize: 13, color: "#666",
          backgroundColor: "transparent", border: "1px solid #ddd",
          borderRadius: 6, cursor: "pointer",
        }}>
          Dashboard
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        {/* Client list */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0", color: "#475569" }}>
            Clients ({clients.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {clients.length === 0 && (
              <p style={{ fontSize: 14, color: "#888" }}>No clients yet</p>
            )}
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => selectClient(client)}
                style={{
                  padding: 12, textAlign: "left",
                  border: selectedClient?.id === client.id ? "2px solid #2563eb" : "1px solid #e2e8f0",
                  borderRadius: 8,
                  backgroundColor: selectedClient?.id === client.id ? "#eff6ff" : "#fff",
                  cursor: "pointer",
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 2px 0" }}>
                  {client.name || client.email}
                </p>
                <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
                  {client.package || "No package"} &middot; {new Date(client.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Client detail */}
        <div>
          {!selectedClient ? (
            <div style={{ padding: 48, textAlign: "center", color: "#888", border: "1px dashed #ddd", borderRadius: 12 }}>
              <p style={{ fontSize: 15 }}>Select a client to view their details</p>
            </div>
          ) : loadingEntries ? (
            <div style={{ padding: 48, textAlign: "center", color: "#888" }}>
              <p>Loading client data...</p>
            </div>
          ) : (
            <div>
              {/* Client header */}
              <div style={{
                padding: 16, backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0", borderRadius: 10, marginBottom: 20,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px 0" }}>
                  {selectedClient.name || selectedClient.email}
                </h3>
                <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                  {selectedClient.email} &middot; Package: {selectedClient.package || "none"}
                </p>
              </div>

              {/* Plan summary */}
              {clientPlan && (
                <div style={{
                  padding: 14, border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 20,
                }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px 0", color: "#475569" }}>
                    Coaching Plan
                  </h4>
                  <p style={{ fontSize: 14, color: "#555", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                    {clientPlan.summary}
                  </p>
                  <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
                    Phase: {clientPlan.current_phase} &middot; {clientPlan.goals?.length || 0} goals
                  </p>
                </div>
              )}

              {/* Enneagram data entry */}
              <div style={{
                padding: 14, border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 20,
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px 0", color: "#475569" }}>
                  Enneagram Data
                </h4>
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Type</label>
                    <select
                      value={enneagramType}
                      onChange={(e) => setEnneagramType(e.target.value)}
                      style={{
                        padding: "8px 12px", fontSize: 14, border: "1px solid #ddd",
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
                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Notes</label>
                    <input
                      type="text"
                      value={enneagramNotes}
                      onChange={(e) => setEnneagramNotes(e.target.value)}
                      placeholder="Wing, instinct, observations..."
                      style={{
                        width: "100%", padding: "8px 12px", fontSize: 14,
                        border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
                <button onClick={saveEnneagram} disabled={savingEnneagram} style={{
                  padding: "6px 16px", fontSize: 13, color: "#fff",
                  backgroundColor: "#2563eb", border: "none", borderRadius: 6, cursor: "pointer",
                }}>
                  {savingEnneagram ? "Saving..." : "Save"}
                </button>
              </div>

              {/* Recent entries */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px 0", color: "#475569" }}>
                  Recent Entries ({clientEntries.length})
                </h4>
                {clientEntries.length === 0 && (
                  <p style={{ fontSize: 14, color: "#888" }}>No entries in the last 30 days</p>
                )}
                {clientEntries.map((entry) => (
                  <div key={entry.id} style={{
                    padding: 12, border: "1px solid #f0f0f0", borderRadius: 8,
                    marginBottom: 8, backgroundColor: "#fafafa",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{
                          fontSize: 12, padding: "2px 8px", borderRadius: 10,
                          backgroundColor: entry.type === "one_liner" ? "#fef3c7" : "#eff6ff",
                          color: entry.type === "one_liner" ? "#92400e" : "#2563eb",
                          border: `1px solid ${entry.type === "one_liner" ? "#fde68a" : "#bfdbfe"}`,
                        }}>
                          {entry.type === "one_liner" ? "thought" : "journal"}
                        </span>
                        <span style={{ fontSize: 12, color: "#aaa" }}>{entry.date}</span>
                      </div>
                    </div>
                    <p style={{
                      fontSize: 14, color: "#333", margin: "0 0 6px 0", lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}>
                      {entry.content}
                    </p>
                    {entry.theme_tags?.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {entry.theme_tags.map((tag) => (
                          <span key={tag} style={{
                            padding: "2px 8px", fontSize: 11,
                            backgroundColor: "#f1f5f9", color: "#64748b", borderRadius: 10,
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
  );
}
