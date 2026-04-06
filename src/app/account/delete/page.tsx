"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import PageShell from "@/components/PageShell";
import { colors, fonts, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

type PendingRequest = {
  id: string;
  requested_at: string;
  scheduled_for: string;
};

export default function DeleteAccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [pending, setPending] = useState<PendingRequest | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user?.email) { router.push("/login"); return; }
      setUser({ id: data.user.id, email: data.user.email });

      const { data: existing } = await supabase
        .from("deletion_requests")
        .select("id, requested_at, scheduled_for")
        .eq("client_id", data.user.id)
        .is("completed_at", null)
        .is("cancelled_at", null)
        .order("requested_at", { ascending: false })
        .limit(1);
      if (existing && existing.length > 0) setPending(existing[0] as PendingRequest);
    });
  }, [supabase, router]);

  async function submitDeletion() {
    if (!user) return;
    if (typed.trim().toLowerCase() !== "delete") {
      setError("Type DELETE to confirm.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { data, error: insErr } = await supabase
      .from("deletion_requests")
      .insert({ client_id: user.id, client_email: user.email })
      .select("id, requested_at, scheduled_for")
      .single();
    setSubmitting(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setPending(data as PendingRequest);
    setConfirming(false);
    setTyped("");
  }

  async function downloadAllData() {
    setDownloading(true);
    try {
      const res = await fetch("/api/account");
      if (!res.ok) throw new Error("Download failed");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindcraft-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }

  async function cancelDeletion() {
    if (!pending) return;
    setSubmitting(true);
    await supabase
      .from("deletion_requests")
      .update({ cancelled_at: new Date().toISOString() })
      .eq("id", pending.id);
    setSubmitting(false);
    setPending(null);
  }

  return (
    <PageShell maxWidth={720}>
      <h1 style={{
        fontFamily: display, fontSize: "clamp(26px, 3.5vw, 34px)",
        fontWeight: 800, color: colors.textPrimary, marginBottom: 12,
        letterSpacing: "-0.02em",
      }}>
        Delete your account
      </h1>
      <p style={{ fontFamily: body, fontSize: 15, color: colors.textSecondary, lineHeight: 1.65, marginBottom: 32 }}>
        This removes everything: journal entries, exercise responses, coaching summaries,
        intake data, goals, final insights, and referrals. We&rsquo;ll purge everything within
        30 days, per our privacy policy.
      </p>

      {pending ? (
        <div style={{
          backgroundColor: colors.bgSurface, borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`, padding: "28px 32px",
        }}>
          <p style={{
            fontFamily: display, fontSize: 11, fontWeight: 700,
            color: colors.coral, textTransform: "uppercase",
            letterSpacing: "0.12em", margin: "0 0 8px 0",
          }}>
            Deletion scheduled
          </p>
          <p style={{ fontFamily: display, fontSize: 17, fontWeight: 700, color: colors.textPrimary, margin: "0 0 8px 0" }}>
            Your data will be deleted on {new Date(pending.scheduled_for).toLocaleDateString()}.
          </p>
          <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, lineHeight: 1.6, margin: "0 0 20px 0" }}>
            You can cancel anytime before that date by clicking below. Once the deletion runs,
            it can&rsquo;t be reversed.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={cancelDeletion}
            disabled={submitting}
            style={{
              fontFamily: display, fontSize: 13, fontWeight: 600,
              padding: "10px 22px", borderRadius: radii.full,
              backgroundColor: colors.coral, color: colors.bgDeep,
              border: "none", cursor: "pointer",
            }}
          >
            {submitting ? "Cancelling…" : "Cancel deletion"}
          </motion.button>
        </div>
      ) : (
        <div style={{
          backgroundColor: colors.bgSurface, borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`, padding: "28px 32px",
        }}>
          <p style={{ fontFamily: body, fontSize: 14, color: colors.textSecondary, lineHeight: 1.65, marginBottom: 16 }}>
            Before you delete, download everything you&rsquo;ve written. You&rsquo;ll get a single
            JSON file with your journal entries, exercise responses, goals, coaching summaries,
            enrollments, and final insights.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadAllData}
            disabled={downloading}
            style={{
              fontFamily: display, fontSize: 13, fontWeight: 600,
              padding: "10px 22px", borderRadius: radii.full,
              backgroundColor: "transparent",
              color: colors.coral,
              border: `1.5px solid ${colors.coral}`,
              cursor: "pointer",
              marginBottom: 24,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloading ? "Preparing…" : "Download all my data"}
          </motion.button>

          <AnimatePresence mode="wait">
            {!confirming ? (
              <motion.button
                key="trigger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfirming(true)}
                style={{
                  fontFamily: display, fontSize: 13, fontWeight: 600,
                  padding: "12px 24px", borderRadius: radii.full,
                  backgroundColor: "transparent",
                  color: colors.error,
                  border: `1.5px solid ${colors.error}`,
                  cursor: "pointer",
                }}
              >
                Delete my account and data
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <p style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>
                  Type DELETE to confirm.
                </p>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    width: "100%", padding: "12px 14px",
                    backgroundColor: colors.bgInput,
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: 10, color: colors.textPrimary,
                    fontFamily: body, fontSize: 14, marginBottom: 12,
                  }}
                />
                {error && (
                  <p style={{ fontFamily: body, fontSize: 12, color: colors.error, marginBottom: 12 }}>
                    {error}
                  </p>
                )}
                <div style={{ display: "flex", gap: 12 }}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={submitDeletion}
                    disabled={submitting}
                    style={{
                      fontFamily: display, fontSize: 13, fontWeight: 600,
                      padding: "10px 20px", borderRadius: radii.full,
                      backgroundColor: colors.error, color: "#fff",
                      border: "none", cursor: "pointer",
                    }}
                  >
                    {submitting ? "Scheduling…" : "Confirm deletion"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setConfirming(false); setTyped(""); setError(null); }}
                    style={{
                      fontFamily: display, fontSize: 13, fontWeight: 600,
                      padding: "10px 20px", borderRadius: radii.full,
                      backgroundColor: "transparent",
                      color: colors.textSecondary,
                      border: `1px solid ${colors.borderDefault}`,
                      cursor: "pointer",
                    }}
                  >
                    Keep my account
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PageShell>
  );
}
