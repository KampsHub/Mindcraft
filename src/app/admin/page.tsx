"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

// Admin emails that can access this page
const ADMIN_EMAILS = ["stefanie@allmindsondeck.com", "crew@allmindsondeck.com"];

interface TokenCostData {
  period: string;
  summary: {
    totalCalls: number;
    uniqueUsers: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    avgCostPerCall: number;
    avgCostPerUser: number;
  };
  byEndpoint: Record<string, {
    calls: number;
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
    avgLatencyMs: number;
  }>;
  topUsers: Array<{
    userId: string;
    calls: number;
    totalCost: number;
  }>;
}

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [data, setData] = useState<TokenCostData | null>(null);
  const [enrollmentStats, setEnrollmentStats] = useState<{
    total: number;
    active: number;
    completed: number;
    paused: number;
  } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
        router.push("/dashboard");
        return;
      }
      setAuthorized(true);
      setLoading(false);
    }
    checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    if (!authorized) return;

    async function loadData() {
      // Enrollment stats
      const { data: enrollments } = await supabase
        .from("program_enrollments")
        .select("status");

      if (enrollments) {
        setEnrollmentStats({
          total: enrollments.length,
          active: enrollments.filter((e) => e.status === "active").length,
          completed: enrollments.filter((e) => e.status === "completed").length,
          paused: enrollments.filter((e) => e.status === "paused").length,
        });
      }

      // Token costs (via admin API)
      try {
        const res = await fetch(`/api/admin/token-costs?days=${days}`, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ""}` },
        });
        if (res.ok) {
          const costData = await res.json();
          setData(costData);
        }
      } catch {
        // Non-blocking
      }
    }

    loadData();
  }, [authorized, days, supabase]);

  if (loading || !authorized) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: colors.textMuted, fontFamily: body }}>Loading...</p>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.bgSurface,
    borderRadius: 14,
    border: `1px solid ${colors.borderDefault}`,
    padding: 20,
  };

  const statStyle: React.CSSProperties = {
    fontFamily: display,
    fontSize: 28,
    fontWeight: 700,
    color: colors.textPrimary,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: body,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary, padding: "40px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h1 style={{ fontFamily: display, fontSize: 24, fontWeight: 700 }}>Admin Dashboard</h1>
          <a href="/dashboard" style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, textDecoration: "none" }}>&larr; Back to app</a>
        </div>

        {/* ── Enrollment Stats ── */}
        {enrollmentStats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            <div style={cardStyle}>
              <p style={labelStyle}>Total Enrollments</p>
              <p style={statStyle}>{enrollmentStats.total}</p>
            </div>
            <div style={cardStyle}>
              <p style={labelStyle}>Active</p>
              <p style={{ ...statStyle, color: "#34d399" }}>{enrollmentStats.active}</p>
            </div>
            <div style={cardStyle}>
              <p style={labelStyle}>Completed</p>
              <p style={{ ...statStyle, color: "#60a5fa" }}>{enrollmentStats.completed}</p>
            </div>
            <div style={cardStyle}>
              <p style={labelStyle}>Paused</p>
              <p style={{ ...statStyle, color: "#fbbf24" }}>{enrollmentStats.paused}</p>
            </div>
          </div>
        )}

        {/* ── Token Costs ── */}
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: display, fontSize: 16, fontWeight: 600, margin: 0 }}>AI Costs</h2>
            <div style={{ display: "flex", gap: 8 }}>
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  style={{
                    fontFamily: body,
                    fontSize: 12,
                    padding: "4px 12px",
                    borderRadius: 20,
                    border: `1px solid ${days === d ? colors.coral : colors.borderDefault}`,
                    backgroundColor: days === d ? `${colors.coral}20` : "transparent",
                    color: days === d ? colors.coral : colors.textMuted,
                    cursor: "pointer",
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {data ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                <div>
                  <p style={labelStyle}>Total Cost</p>
                  <p style={{ ...statStyle, fontSize: 22 }}>${data.summary.totalCost}</p>
                </div>
                <div>
                  <p style={labelStyle}>API Calls</p>
                  <p style={{ ...statStyle, fontSize: 22 }}>{data.summary.totalCalls}</p>
                </div>
                <div>
                  <p style={labelStyle}>Unique Users</p>
                  <p style={{ ...statStyle, fontSize: 22 }}>{data.summary.uniqueUsers}</p>
                </div>
                <div>
                  <p style={labelStyle}>Avg / Call</p>
                  <p style={{ ...statStyle, fontSize: 22 }}>${data.summary.avgCostPerCall}</p>
                </div>
              </div>

              {/* By Endpoint */}
              <h3 style={{ fontFamily: display, fontSize: 13, fontWeight: 600, marginBottom: 8, color: colors.textMuted }}>By Endpoint</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.borderDefault}` }}>
                      <th style={{ textAlign: "left", padding: "8px 12px", color: colors.textMuted, fontWeight: 500 }}>Endpoint</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", color: colors.textMuted, fontWeight: 500 }}>Calls</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", color: colors.textMuted, fontWeight: 500 }}>Cost</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", color: colors.textMuted, fontWeight: 500 }}>Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.byEndpoint)
                      .sort(([, a], [, b]) => b.totalCost - a.totalCost)
                      .map(([ep, stats]) => (
                        <tr key={ep} style={{ borderBottom: `1px solid ${colors.borderSubtle}` }}>
                          <td style={{ padding: "8px 12px", color: colors.textPrimary }}>{ep.replace("/api/", "")}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: colors.textSecondary }}>{stats.calls}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: colors.textPrimary }}>${stats.totalCost}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: colors.textMuted }}>{stats.avgLatencyMs}ms</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p style={{ fontFamily: body, fontSize: 14, color: colors.textMuted }}>
              Token cost data requires CRON_SECRET to be set as NEXT_PUBLIC_CRON_SECRET for client-side access, or use the API directly.
            </p>
          )}
        </div>

        {/* ── Top Users by Cost ── */}
        {data && data.topUsers && data.topUsers.length > 0 && (
          <div style={cardStyle}>
            <h2 style={{ fontFamily: display, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Top Users by Cost</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderDefault}` }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: colors.textMuted, fontWeight: 500 }}>User ID</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", color: colors.textMuted, fontWeight: 500 }}>Calls</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", color: colors.textMuted, fontWeight: 500 }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topUsers.map((u: { userId: string; calls: number; totalCost: number }) => (
                    <tr key={u.userId} style={{ borderBottom: `1px solid ${colors.borderSubtle}` }}>
                      <td style={{ padding: "8px 12px", color: colors.textSecondary, fontFamily: "monospace", fontSize: 11 }}>{u.userId.slice(0, 8)}...</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: colors.textSecondary }}>{u.calls}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: colors.textPrimary }}>${u.totalCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Quick Links ── */}
        <div style={cardStyle}>
          <h2 style={{ fontFamily: display, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Quick Links</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Supabase", url: "https://supabase.com/dashboard" },
              { label: "Vercel", url: "https://vercel.com/dashboard" },
              { label: "Stripe", url: "https://dashboard.stripe.com" },
              { label: "Sentry", url: "https://sentry.io" },
              { label: "Resend", url: "https://resend.com" },
              { label: "GA4", url: "https://analytics.google.com" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: body,
                  fontSize: 13,
                  color: colors.coral,
                  textDecoration: "none",
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: `1px solid ${colors.borderDefault}`,
                }}
              >
                {link.label} &rarr;
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
