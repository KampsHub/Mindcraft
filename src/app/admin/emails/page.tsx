"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

const ADMIN_EMAILS = [
  "stefanie@allmindsondeck.com",
  "crew@allmindsondeck.com",
  "stefanie.kamps@gmail.com",
];

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

const PROJECT_ROOT = "/Users/stefaniekamps/Documents/World-of-Steffi/Mindcraft";

type EmailRow = {
  key: string;
  category: "lifecycle" | "sharing" | "referrals" | "admin";
  subject: string;
  from: "stefanie@" | "crew@" | "noreply@";
  file: string;
  trigger: string;
  notes?: string;
};

const EMAILS: EmailRow[] = [
  // Lifecycle
  {
    key: "welcome",
    category: "lifecycle",
    subject: "Welcome to Mindcraft",
    from: "stefanie@",
    file: "src/app/api/welcome-email/route.ts",
    trigger: "First login/signup",
  },
  {
    key: "program-offramp",
    category: "lifecycle",
    subject: "You finished / closed {program}.",
    from: "crew@",
    file: "src/lib/program-offramp.ts",
    trigger: "Cron check-completions OR user close-early",
    notes: "Primary offramp. HTML in offrampEmailHtml()",
  },
  {
    key: "re-engage-nudge-1",
    category: "lifecycle",
    subject: "Just leaving the door open.",
    from: "noreply@",
    file: "src/lib/emails/re-engage.ts",
    trigger: "3 days since last sign-in",
  },
  {
    key: "re-engage-nudge-2",
    category: "lifecycle",
    subject: "You don't have to catch up.",
    from: "noreply@",
    file: "src/lib/emails/re-engage.ts",
    trigger: "6 days since last sign-in",
  },
  {
    key: "re-engage-nudge-3",
    category: "lifecycle",
    subject: "Going quiet — your work is safe.",
    from: "noreply@",
    file: "src/lib/emails/re-engage.ts",
    trigger: "9 days since last sign-in",
  },
  {
    key: "re-engage-exit-survey",
    category: "lifecycle",
    subject: "One short question, then we're done.",
    from: "crew@",
    file: "src/lib/emails/re-engage.ts",
    trigger: "14 days since last sign-in",
  },

  // Referrals / raffle
  {
    key: "referral-reward-recipient",
    category: "referrals",
    subject: "Your $10 Amazon gift card is on its way",
    from: "noreply@",
    file: "src/app/api/referral-rewards/route.ts",
    trigger: "Cron 1pm PT after 7-day eligibility",
  },
  {
    key: "referral-reward-admin",
    category: "referrals",
    subject: "Referral reward sent — {email}",
    from: "noreply@",
    file: "src/app/api/referral-rewards/route.ts",
    trigger: "Same cron, admin notification",
  },
  {
    key: "gift-code",
    category: "referrals",
    subject: "Your Mindcraft gift code is ready",
    from: "crew@",
    file: "src/app/api/webhook/route.ts",
    trigger: "Stripe webhook — gift purchase",
  },
  // Admin
  {
    key: "contact-alert",
    category: "admin",
    subject: "Mindcraft Contact: {type}",
    from: "noreply@",
    file: "src/app/api/contact/route.ts",
    trigger: "Public contact form submission",
  },
  {
    key: "coaching-application",
    category: "admin",
    subject: "Coaching Application — {name}",
    from: "stefanie@",
    file: "src/app/api/apply/route.ts",
    trigger: "Coaching application form",
  },
  {
    key: "waitlist-user-confirmation",
    category: "admin",
    subject: "You're on the list — {program}",
    from: "crew@",
    file: "src/app/api/waitlist/route.ts",
    trigger: "Public waitlist form (second send)",
  },
  {
    key: "enneagram-purchase-webhook",
    category: "admin",
    subject: "🎯 New Enneagram Purchase — {email}",
    from: "crew@",
    file: "src/app/api/webhook/route.ts",
    trigger: "Stripe webhook — enneagram branch",
  },
  {
    key: "quality-audit-report",
    category: "admin",
    subject: "Weekly Quality Audit — {score}/30 avg",
    from: "noreply@",
    file: "src/app/api/quality-audit/route.ts",
    trigger: "Cron Monday 4pm PT",
  },
  {
    key: "account-deletion-confirmation",
    category: "admin",
    subject: "Your Mindcraft data has been deleted",
    from: "crew@",
    file: "src/app/api/cron/process-deletions/route.ts",
    trigger: "Cron 3:23am PT after 30-day deletion window",
  },
];

const CATEGORIES: { key: EmailRow["category"]; label: string; color: string }[] = [
  { key: "lifecycle", label: "Lifecycle", color: "#C4943A" },
  { key: "sharing", label: "Sharing", color: "#7B9AAD" },
  { key: "referrals", label: "Referrals & raffle", color: "#8BC48A" },
  { key: "admin", label: "Admin / internal", color: "#B8453A" },
];

export default function AdminEmailsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [sentStatus, setSentStatus] = useState<{ key: string; ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isAdmin(user?.email)) {
        console.log("[admin/emails] access denied for", user?.email);
        setDeniedEmail(user?.email || "(not signed in)");
        setLoading(false);
        return;
      }
      setAuthorized(true);
      setLoading(false);
    }
    checkAuth();
  }, [supabase, router]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, padding: "80px 24px", color: colors.textPrimary, fontFamily: body }}>
        <p style={{ textAlign: "center" }}>Checking access...</p>
      </main>
    );
  }
  if (deniedEmail) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, padding: "80px 24px", color: colors.textPrimary, fontFamily: body }}>
        <div style={{ maxWidth: 560, margin: "0 auto", backgroundColor: colors.bgSurface, border: `1px solid ${colors.borderDefault}`, borderRadius: 14, padding: 32 }}>
          <h1 style={{ fontFamily: display, fontSize: 24, fontWeight: 800, margin: "0 0 12px 0", color: colors.textPrimary }}>
            Access denied
          </h1>
          <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.6, margin: "0 0 16px 0" }}>
            You&rsquo;re signed in as <code style={{ fontFamily: "ui-monospace, monospace", backgroundColor: colors.bgElevated, padding: "3px 8px", borderRadius: 6, fontSize: 13 }}>{deniedEmail}</code>, which isn&rsquo;t on the admin allowlist.
          </p>
          <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, margin: "0 0 16px 0" }}>
            Allowlist: {ADMIN_EMAILS.join(", ")}
          </p>
          <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>
            To add your email, edit <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>src/app/admin/emails/page.tsx</code> line 13.
          </p>
        </div>
      </main>
    );
  }
  if (!authorized) return null;

  const rows = filter === "all" ? EMAILS : EMAILS.filter((e) => e.category === filter);

  async function copyPath(file: string) {
    const full = `${PROJECT_ROOT}/${file}`;
    try {
      await navigator.clipboard.writeText(full);
      setCopied(file);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // fallback: prompt
      window.prompt("Copy file path:", full);
    }
  }

  function openInVSCode(file: string) {
    const full = `${PROJECT_ROOT}/${file}`;
    window.location.href = `vscode://file/${full}`;
  }

  async function sendTest(key: string) {
    setSending(key);
    setSentStatus(null);
    try {
      const res = await fetch("/api/admin/send-test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (res.ok) {
        setSentStatus({ key, ok: true, msg: `Sent to ${data.sentTo}` });
      } else {
        setSentStatus({ key, ok: false, msg: data.error || "Send failed" });
      }
    } catch {
      setSentStatus({ key, ok: false, msg: "Network error" });
    } finally {
      setSending(null);
      setTimeout(() => setSentStatus(null), 4000);
    }
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, padding: "48px 24px 120px", color: colors.textPrimary, fontFamily: body }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: display, fontSize: 11, fontWeight: 700, color: colors.coral, textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 10px 0" }}>
            Admin · Internal only
          </p>
          <h1 style={{ fontFamily: display, fontSize: 32, fontWeight: 800, color: colors.textPrimary, margin: "0 0 10px 0", letterSpacing: "-0.02em" }}>
            Email templates
          </h1>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, lineHeight: 1.6, maxWidth: 720 }}>
            Every email Mindcraft sends, with its source file. All email HTML is inlined in its route handler — click "Open in VS Code" to edit, or "Copy path" to open it any other way. Resend does not store these templates — this page IS the source of truth.
          </p>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("all")}
            style={filterChipStyle(filter === "all")}
          >
            All ({EMAILS.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              style={{
                ...filterChipStyle(filter === cat.key),
                borderColor: filter === cat.key ? cat.color : undefined,
                color: filter === cat.key ? cat.color : colors.textSecondary,
              }}
            >
              {cat.label} ({EMAILS.filter((e) => e.category === cat.key).length})
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{
          backgroundColor: colors.bgSurface,
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: 14,
          overflow: "hidden",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: colors.bgElevated, borderBottom: `1px solid ${colors.borderDefault}` }}>
                  <th style={thStyle}>Key</th>
                  <th style={thStyle}>Subject</th>
                  <th style={thStyle}>From</th>
                  <th style={thStyle}>Trigger</th>
                  <th style={thStyle}>File</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e, i) => {
                  const cat = CATEGORIES.find((c) => c.key === e.category)!;
                  return (
                    <tr key={e.key} style={{
                      borderBottom: i < rows.length - 1 ? `1px solid ${colors.borderSubtle}` : "none",
                    }}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            backgroundColor: cat.color, flexShrink: 0,
                          }} />
                          <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: colors.textPrimary }}>
                            {e.key}
                          </code>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: colors.textSecondary }}>{e.subject}</td>
                      <td style={tdStyle}>
                        <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: colors.textMuted }}>
                          {e.from}
                        </code>
                      </td>
                      <td style={{ ...tdStyle, color: colors.textMuted, fontSize: 12 }}>{e.trigger}</td>
                      <td style={tdStyle}>
                        <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: colors.textMuted }}>
                          {e.file}
                        </code>
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => sendTest(e.key)}
                          disabled={sending === e.key}
                          style={actionButtonStyle(true)}
                          title="Send a preview of this email to your inbox"
                        >
                          {sending === e.key
                            ? "Sending..."
                            : sentStatus?.key === e.key
                            ? (sentStatus.ok ? "✓ Sent" : "✗ Error")
                            : "Send test"}
                        </button>
                        <button
                          onClick={() => openInVSCode(e.file)}
                          style={actionButtonStyle(false)}
                          title="Open in VS Code"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => copyPath(e.file)}
                          style={actionButtonStyle(false)}
                          title="Copy absolute path"
                        >
                          {copied === e.file ? "Copied" : "Copy"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Helper text */}
        <div style={{
          marginTop: 24,
          padding: 20,
          backgroundColor: colors.bgElevated,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: 12,
          fontSize: 13,
          color: colors.textMuted,
          lineHeight: 1.65,
        }}>
          <p style={{ margin: "0 0 8px 0", color: colors.textSecondary, fontWeight: 600 }}>
            How preview sends work
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>Send test</strong> delivers an exact production-fidelity preview to your admin inbox. Subject is prefixed with <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>[PREVIEW]</code>.</li>
            <li>Every preview imports the <strong>real HTML function</strong> from <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>src/lib/emails/</code> &mdash; what you see in your inbox is byte-for-byte identical to what production sends. No drift.</li>
            <li>To edit copy: open the file in <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>src/lib/emails/&lt;name&gt;.ts</code> (or click <strong>Open</strong> to jump to the route file). Both the real send and the preview will pick up the change immediately.</li>
            <li>To change the sample data shown in previews (names, day numbers, scenarios), edit <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>src/lib/email-test-previews.ts</code>.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

const filterChipStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 16px",
  borderRadius: 100,
  border: `1px solid ${active ? colors.coral : colors.borderDefault}`,
  backgroundColor: active ? colors.coralWash : "transparent",
  color: active ? colors.coral : colors.textSecondary,
  fontFamily: display,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
});

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  fontFamily: display,
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: colors.textMuted,
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  verticalAlign: "top",
};

const actionButtonStyle = (primary: boolean): React.CSSProperties => ({
  padding: "6px 12px",
  marginRight: 6,
  fontSize: 12,
  fontFamily: display,
  fontWeight: 600,
  borderRadius: 6,
  border: `1px solid ${primary ? colors.coral : colors.borderDefault}`,
  backgroundColor: primary ? colors.coral : "transparent",
  color: primary ? "#18181C" : colors.textSecondary,
  cursor: "pointer",
});
