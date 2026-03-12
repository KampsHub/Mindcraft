"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [reflection, setReflection] = useState("");
  const [themeTags, setThemeTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entry.trim() || !user) return;

    setLoading(true);
    setError("");
    setReflection("");
    setThemeTags([]);

    try {
      // Get coaching reflection from Claude
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const data = await res.json();
      setReflection(data.reflection);
      setThemeTags(data.theme_tags || []);

      // Save entry to Supabase
      const { data: insertedEntry, error: insertError } = await supabase
        .from("entries")
        .insert({
          client_id: user.id,
          coach_id: user.id,
          type: "journal",
          content: entry,
          theme_tags: data.theme_tags || [],
          date: new Date().toISOString().split("T")[0],
          metadata: { reflection: data.reflection },
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Failed to save entry:", insertError);
      } else if (insertedEntry) {
        // Fire-and-forget: generate embedding for RAG
        fetch("/api/embed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId: insertedEntry.id }),
        }).catch((err) => console.warn("Embedding generation failed:", err));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get reflection";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: 720,
      margin: "0 auto",
      padding: "48px 24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
      }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 4 }}>
            Daily Journal
          </h1>
          <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
            {user?.email}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            color: "#666",
            backgroundColor: "transparent",
            border: "1px solid #ddd",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>

      <p style={{ fontSize: 15, color: "#666", marginBottom: 32 }}>
        Write what&apos;s on your mind. Your coaching companion will reflect back what it sees.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="What's happening for you today? What are you noticing, feeling, or working through?"
          rows={8}
          style={{
            width: "100%",
            padding: 16,
            fontSize: 16,
            lineHeight: 1.6,
            border: "1px solid #ddd",
            borderRadius: 8,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !entry.trim()}
          style={{
            marginTop: 16,
            padding: "12px 32px",
            fontSize: 15,
            fontWeight: 500,
            color: "#fff",
            backgroundColor: loading || !entry.trim() ? "#999" : "#2563eb",
            border: "none",
            borderRadius: 8,
            cursor: loading || !entry.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Reflecting..." : "Submit"}
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 12, color: "#666" }}>
          <div style={{
            width: 20, height: 20,
            border: "2px solid #ddd", borderTopColor: "#2563eb",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }} />
          <span>Your coaching companion is reading your entry...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 24, padding: 16,
          backgroundColor: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 8, color: "#dc2626", fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {reflection && (
        <div style={{ marginTop: 32 }}>
          <div style={{
            padding: 24, backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0", borderRadius: 12,
          }}>
            <h2 style={{
              fontSize: 16, fontWeight: 600, color: "#475569",
              marginBottom: 16, marginTop: 0,
            }}>
              Coaching Reflection
            </h2>
            <p style={{
              fontSize: 16, lineHeight: 1.7, color: "#1e293b",
              margin: 0, whiteSpace: "pre-wrap",
            }}>
              {reflection}
            </p>
          </div>

          {themeTags.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {themeTags.map((tag) => (
                <span key={tag} style={{
                  padding: "4px 12px", fontSize: 13,
                  backgroundColor: "#eff6ff", color: "#2563eb",
                  borderRadius: 16, border: "1px solid #bfdbfe",
                }}>
                  {tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
