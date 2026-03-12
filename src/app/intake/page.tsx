"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  packages,
  universalQuestions,
  packageQuestions,
} from "./questions";
import type { User } from "@supabase/supabase-js";
import { colors, fonts } from "@/lib/theme";

type Step = "package" | "universal" | "specific" | "complete";

export default function IntakePage() {
  const [step, setStep] = useState<Step>("package");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [universalAnswers, setUniversalAnswers] = useState<Record<string, string | string[]>>({});
  const [specificAnswers, setSpecificAnswers] = useState<Record<string, string | string[]>>({});
  const [universalPage, setUniversalPage] = useState(0);
  const [specificPage, setSpecificPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const QUESTIONS_PER_PAGE = 4;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase.auth]);

  // Split universal questions into pages
  const universalPages = [];
  for (let i = 0; i < universalQuestions.length; i += QUESTIONS_PER_PAGE) {
    universalPages.push(universalQuestions.slice(i, i + QUESTIONS_PER_PAGE));
  }

  const specificQs = packageQuestions[selectedPackage] || [];
  const specificPages = [];
  for (let i = 0; i < specificQs.length; i += QUESTIONS_PER_PAGE) {
    specificPages.push(specificQs.slice(i, i + QUESTIONS_PER_PAGE));
  }

  function handleUniversalAnswer(id: string, value: string | string[]) {
    setUniversalAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleSpecificAnswer(id: string, value: string | string[]) {
    setSpecificAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleComplete() {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from("intake_responses").insert({
      client_id: user.id,
      package: selectedPackage,
      universal: universalAnswers,
      package_specific: specificAnswers,
      completed: true,
    });

    if (error) {
      console.error("Failed to save intake:", error);
      alert("Failed to save. Check the console for details.");
      setSaving(false);
      return;
    }

    setStep("complete");
    setSaving(false);
  }

  // ── Styles ──
  const containerStyle: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    padding: "48px 24px",
    fontFamily: fonts.body,
  };

  const cardStyle: React.CSSProperties = {
    padding: 24,
    border: `1px solid ${colors.gray100}`,
    borderRadius: 12,
    marginBottom: 16,
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
    backgroundColor: colors.white,
  };

  const btnPrimary: React.CSSProperties = {
    padding: "12px 32px",
    fontSize: 15,
    fontWeight: 600,
    color: colors.white,
    backgroundColor: colors.primary,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background-color 0.15s",
  };

  const btnSecondary: React.CSSProperties = {
    ...btnPrimary,
    backgroundColor: "transparent",
    color: colors.gray500,
    border: `1px solid ${colors.gray200}`,
  };

  // ── Step 1: Package Selection ──
  if (step === "package") {
    return (
      <div style={containerStyle}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: colors.black }}>
          Let&apos;s build your plan.
        </h1>
        <p style={{ color: colors.gray500, marginBottom: 32, lineHeight: 1.6 }}>
          Tell us what brought you here. We&apos;ll match you with the right frameworks
          and build a 12-week coaching plan around your situation.
        </p>

        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            style={{
              ...cardStyle,
              borderColor: selectedPackage === pkg.id ? colors.primary : colors.gray100,
              backgroundColor: selectedPackage === pkg.id ? colors.primaryLight : colors.white,
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 600, marginTop: 0, marginBottom: 4, color: colors.black }}>
              {pkg.name}
            </h3>
            <p style={{ color: colors.gray500, margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              {pkg.description}
            </p>
          </div>
        ))}

        <button
          onClick={() => selectedPackage && setStep("universal")}
          disabled={!selectedPackage}
          style={{
            ...btnPrimary,
            marginTop: 16,
            backgroundColor: !selectedPackage ? colors.gray400 : colors.primary,
            cursor: !selectedPackage ? "not-allowed" : "pointer",
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // ── Step 2: Universal Questions (paginated) ──
  if (step === "universal") {
    const currentQuestions = universalPages[universalPage];
    const isLastPage = universalPage === universalPages.length - 1;
    const categoryLabel = currentQuestions[0]?.category || "";

    return (
      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>
            Step 2 of 3 — Getting to Know You
          </p>
          <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>
            {universalPage + 1} / {universalPages.length}
          </p>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4, color: colors.black }}>{categoryLabel}</h2>
        <div style={{
          height: 4, backgroundColor: colors.gray100, borderRadius: 2, marginBottom: 32,
        }}>
          <div style={{
            height: 4,
            backgroundColor: colors.primary,
            borderRadius: 2,
            width: `${((universalPage + 1) / universalPages.length) * 100}%`,
            transition: "width 0.3s",
          }} />
        </div>

        {currentQuestions.map((q) => (
          <div key={q.id} style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 15, fontWeight: 500, marginBottom: 8, lineHeight: 1.5, color: colors.black }}>
              {q.question}
            </label>
            {q.type === "textarea" && (
              <textarea
                value={(universalAnswers[q.id] as string) || ""}
                onChange={(e) => handleUniversalAnswer(q.id, e.target.value)}
                rows={4}
                style={{
                  width: "100%", padding: 12, fontSize: 15, border: `1px solid ${colors.gray200}`,
                  borderRadius: 8, resize: "vertical", fontFamily: "inherit",
                  lineHeight: 1.6, boxSizing: "border-box",
                }}
              />
            )}
            {q.type === "short" && (
              <input
                type="text"
                value={(universalAnswers[q.id] as string) || ""}
                onChange={(e) => handleUniversalAnswer(q.id, e.target.value)}
                style={{
                  width: "100%", padding: 12, fontSize: 15, border: `1px solid ${colors.gray200}`,
                  borderRadius: 8, boxSizing: "border-box",
                }}
              />
            )}
            {q.type === "select" && q.options && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt) => (
                  <label key={opt} style={{
                    display: "flex", alignItems: "center", gap: 8, fontSize: 15,
                    padding: "8px 12px", border: `1px solid ${colors.gray200}`, borderRadius: 8,
                    cursor: "pointer",
                    backgroundColor: universalAnswers[q.id] === opt ? colors.primaryLight : colors.white,
                    borderColor: universalAnswers[q.id] === opt ? colors.primary : colors.gray200,
                  }}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={universalAnswers[q.id] === opt}
                      onChange={() => handleUniversalAnswer(q.id, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {q.type === "ranking" && q.options && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontSize: 13, color: colors.gray400, margin: "0 0 8px 0" }}>
                  Number each item 1 (most important) to {q.options.length} (least).
                </p>
                {q.options.map((opt) => (
                  <div key={opt} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="number"
                      min={1}
                      max={q.options!.length}
                      value={
                        Array.isArray(universalAnswers[q.id])
                          ? (universalAnswers[q.id] as string[]).indexOf(opt) + 1 || ""
                          : ""
                      }
                      onChange={(e) => {
                        const current = Array.isArray(universalAnswers[q.id])
                          ? [...(universalAnswers[q.id] as string[])]
                          : new Array(q.options!.length).fill("");
                        const rank = parseInt(e.target.value) - 1;
                        // Remove opt from current position
                        const oldIdx = current.indexOf(opt);
                        if (oldIdx !== -1) current[oldIdx] = "";
                        // Place at new position
                        if (rank >= 0 && rank < q.options!.length) current[rank] = opt;
                        handleUniversalAnswer(q.id, current);
                      }}
                      style={{
                        width: 48, padding: 8, fontSize: 15, textAlign: "center",
                        border: `1px solid ${colors.gray200}`, borderRadius: 6,
                      }}
                    />
                    <span style={{ fontSize: 15, color: colors.dark }}>{opt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            onClick={() => universalPage > 0 ? setUniversalPage(universalPage - 1) : setStep("package")}
            style={btnSecondary}
          >
            Back
          </button>
          <button
            onClick={() => {
              if (isLastPage) {
                setStep("specific");
              } else {
                setUniversalPage(universalPage + 1);
              }
            }}
            style={btnPrimary}
          >
            {isLastPage ? "Continue to final questions" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: Package-Specific Questions ──
  if (step === "specific") {
    const currentQuestions = specificPages[specificPage];
    const isLastPage = specificPage === specificPages.length - 1;
    const pkgName = packages.find((p) => p.id === selectedPackage)?.name || "";

    return (
      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>
            Step 3 of 3 — {pkgName}
          </p>
          <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>
            {specificPage + 1} / {specificPages.length}
          </p>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4, color: colors.black }}>
          About Your Situation
        </h2>
        <div style={{
          height: 4, backgroundColor: colors.gray100, borderRadius: 2, marginBottom: 32,
        }}>
          <div style={{
            height: 4,
            backgroundColor: colors.primary,
            borderRadius: 2,
            width: `${((specificPage + 1) / specificPages.length) * 100}%`,
            transition: "width 0.3s",
          }} />
        </div>

        {currentQuestions?.map((q) => (
          <div key={q.id} style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 15, fontWeight: 500, marginBottom: 8, lineHeight: 1.5, color: colors.black }}>
              {q.question}
            </label>
            {q.type === "textarea" && (
              <textarea
                value={(specificAnswers[q.id] as string) || ""}
                onChange={(e) => handleSpecificAnswer(q.id, e.target.value)}
                rows={4}
                style={{
                  width: "100%", padding: 12, fontSize: 15, border: `1px solid ${colors.gray200}`,
                  borderRadius: 8, resize: "vertical", fontFamily: "inherit",
                  lineHeight: 1.6, boxSizing: "border-box",
                }}
              />
            )}
            {q.type === "short" && (
              <input
                type="text"
                value={(specificAnswers[q.id] as string) || ""}
                onChange={(e) => handleSpecificAnswer(q.id, e.target.value)}
                style={{
                  width: "100%", padding: 12, fontSize: 15, border: `1px solid ${colors.gray200}`,
                  borderRadius: 8, boxSizing: "border-box",
                }}
              />
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            onClick={() => specificPage > 0 ? setSpecificPage(specificPage - 1) : setStep("universal")}
            style={btnSecondary}
          >
            Back
          </button>
          <button
            onClick={() => {
              if (isLastPage) {
                handleComplete();
              } else {
                setSpecificPage(specificPage + 1);
              }
            }}
            disabled={saving}
            style={{
              ...btnPrimary,
              backgroundColor: saving ? colors.gray400 : colors.primary,
            }}
          >
            {saving ? "Saving..." : isLastPage ? "Complete intake" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  // ── Complete ──
  return (
    <div style={{
      ...containerStyle,
      textAlign: "center",
      paddingTop: 120,
    }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: colors.black }}>
        Got it. Let&apos;s go.
      </h1>
      <p style={{ color: colors.gray500, fontSize: 16, lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px" }}>
        Your responses are saved. Now we build your personalised 12-week coaching plan —
        frameworks matched to your themes, exercises that fit your situation.
      </p>
      <button
        onClick={() => router.push("/plan")}
        style={btnPrimary}
      >
        Generate my coaching plan
      </button>
    </div>
  );
}
