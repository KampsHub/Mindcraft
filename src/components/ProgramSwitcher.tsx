"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface Enrollment {
  id: string;
  program_id: string;
  status: string;
  programs: { name: string; slug: string };
}

interface ProgramSwitcherProps {
  currentEnrollmentId?: string;
  onSwitch: (enrollmentId: string) => void;
}

export default function ProgramSwitcher({ currentEnrollmentId, onSwitch }: ProgramSwitcherProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("program_enrollments")
        .select("id, program_id, status, programs(name, slug)")
        .eq("client_id", user.id)
        .in("status", ["active", "onboarding", "awaiting_goals", "pre_start", "completed", "paused"])
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 1) {
            setEnrollments(data as Enrollment[]);
          }
        });
    });
  }, [supabase]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Don't render if user has 0 or 1 enrollment
  if (enrollments.length < 2) return null;

  const current = enrollments.find((e) => e.id === currentEnrollmentId) || enrollments[0];

  const slugColor: Record<string, string> = {
    jetstream: colors.coral,
    parachute: colors.plumLight,
    basecamp: colors.success,
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 14px", fontSize: 13, fontWeight: 600,
          fontFamily: display, color: colors.textSecondary,
          backgroundColor: colors.bgRecessed,
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: 100, cursor: "pointer",
          transition: "border-color 0.15s",
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: slugColor[current.programs.slug] || colors.coral,
          flexShrink: 0,
        }} />
        {current.programs.name}
        <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>
          {open ? "\u25B2" : "\u25BC"}
        </span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 40,
          backgroundColor: colors.bgSurface, borderRadius: 10,
          border: `1px solid ${colors.borderDefault}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          overflow: "hidden", minWidth: 200,
        }}>
          {enrollments.map((enr) => (
            <button
              key={enr.id}
              onClick={() => { onSwitch(enr.id); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 16px", fontSize: 13,
                fontFamily: body, fontWeight: enr.id === current.id ? 600 : 400,
                color: enr.id === current.id ? colors.textPrimary : colors.textSecondary,
                backgroundColor: enr.id === current.id ? colors.bgElevated : "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                transition: "background-color 0.1s",
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: slugColor[enr.programs.slug] || colors.coral,
                flexShrink: 0,
              }} />
              {enr.programs.name}
              {enr.id === current.id && (
                <span style={{ fontSize: 11, color: colors.textMuted, marginLeft: "auto" }}>
                  current
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
