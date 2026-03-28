"use client";

import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { colors, fonts, space, radii, button as btnPreset } from "@/lib/theme";

interface TimelineEvent {
  id: string;
  label: string;
  date?: string;
  emotion?: string;
  detail?: string;
}

interface TimelineRiverProps {
  events: TimelineEvent[];
  onAddEvent?: (event: TimelineEvent) => void;
  onEditEvent?: (id: string, updates: Partial<TimelineEvent>) => void;
  onRemoveEvent?: (id: string) => void;
}

const TRACK_HEIGHT = 120;
const DOT_RADIUS = 8;
const EVENT_SPACING = 160;
const PADDING_X = 60;
const PADDING_Y = 50;

export default function TimelineRiver({
  events,
  onAddEvent,
  onEditEvent,
  onRemoveEvent,
}: TimelineRiverProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<TimelineEvent>>({});

  const svgWidth = Math.max(400, events.length * EVENT_SPACING + PADDING_X * 2 + 100);
  const svgHeight = TRACK_HEIGHT + PADDING_Y * 2;
  const trackY = PADDING_Y + TRACK_HEIGHT / 2;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (events.length === 0) {
      svg
        .append("text")
        .attr("x", svgWidth / 2)
        .attr("y", trackY)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textMuted)
        .attr("font-family", fonts.body)
        .attr("font-size", 14)
        .text("Add your first event to begin");
      return;
    }

    const g = svg.append("g");

    // Connecting line
    const lineX1 = PADDING_X;
    const lineX2 = PADDING_X + (events.length - 1) * EVENT_SPACING;
    g.append("line")
      .attr("x1", lineX1)
      .attr("y1", trackY)
      .attr("x2", lineX2)
      .attr("y2", trackY)
      .attr("stroke", colors.borderDefault)
      .attr("stroke-width", 2);

    // Events
    events.forEach((evt, i) => {
      const cx = PADDING_X + i * EVENT_SPACING;
      const isActive = activeId === evt.id;

      // Dot glow
      if (isActive) {
        g.append("circle")
          .attr("cx", cx)
          .attr("cy", trackY)
          .attr("r", DOT_RADIUS + 6)
          .attr("fill", colors.coralWash);
      }

      // Dot
      g.append("circle")
        .attr("cx", cx)
        .attr("cy", trackY)
        .attr("r", DOT_RADIUS)
        .attr("fill", isActive ? colors.coralLight : colors.coral)
        .attr("stroke", colors.bgSurface)
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("click", () => {
          setActiveId(isActive ? null : evt.id);
          setEditDraft(isActive ? {} : { ...evt });
        });

      // Label above
      g.append("text")
        .attr("x", cx)
        .attr("y", trackY - 22)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textPrimary)
        .attr("font-family", fonts.body)
        .attr("font-size", 13)
        .attr("font-weight", 600)
        .text(evt.label.length > 18 ? evt.label.slice(0, 16) + "..." : evt.label)
        .style("cursor", "pointer")
        .on("click", () => {
          setActiveId(isActive ? null : evt.id);
          setEditDraft(isActive ? {} : { ...evt });
        });

      // Date below
      if (evt.date) {
        g.append("text")
          .attr("x", cx)
          .attr("y", trackY + 28)
          .attr("text-anchor", "middle")
          .attr("fill", colors.textMuted)
          .attr("font-family", fonts.body)
          .attr("font-size", 11)
          .text(evt.date);
      }

      // Emotion tag
      if (evt.emotion) {
        const tagY = trackY + (evt.date ? 46 : 28);
        const tag = g.append("g").attr("transform", `translate(${cx},${tagY})`);
        const tagText = tag
          .append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("fill", colors.plumLight)
          .attr("font-family", fonts.body)
          .attr("font-size", 10)
          .text(evt.emotion);
        const bbox = tagText.node()?.getBBox();
        if (bbox) {
          tag
            .insert("rect", "text")
            .attr("x", bbox.x - 6)
            .attr("y", bbox.y - 3)
            .attr("width", bbox.width + 12)
            .attr("height", bbox.height + 6)
            .attr("rx", 8)
            .attr("fill", colors.plumWash)
            .attr("stroke", colors.plumDeep)
            .attr("stroke-width", 1);
        }
      }
    });
  }, [events, activeId, svgWidth, trackY]);

  const activeEvent = events.find((e) => e.id === activeId);

  const handleSave = () => {
    if (activeId && onEditEvent && editDraft) {
      onEditEvent(activeId, editDraft);
    }
    setActiveId(null);
    setEditDraft({});
  };

  const handleAdd = () => {
    if (!onAddEvent) return;
    onAddEvent({ id: `evt-${Date.now()}`, label: "New Event" });
    setTimeout(() => { scrollRef.current && (scrollRef.current.scrollLeft = scrollRef.current.scrollWidth); }, 50);
  };

  const inputStyle: React.CSSProperties = { backgroundColor: colors.bgInput, color: colors.textPrimary, border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm, padding: `${space[2]}px ${space[3]}px`, fontFamily: fonts.body, fontSize: 13, width: "100%", outline: "none" };

  return (
    <div
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radii.md,
        padding: space[4],
        display: "flex",
        flexDirection: "column",
        gap: space[3],
      }}
    >
      {/* Scrollable timeline */}
      <div
        ref={scrollRef}
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        />
      </div>

      {/* Edit panel */}
      {activeEvent && (
        <div
          style={{
            backgroundColor: colors.bgRecessed,
            borderRadius: radii.sm,
            padding: space[4],
            display: "flex",
            flexDirection: "column",
            gap: space[2],
          }}
        >
          <div style={{ display: "flex", gap: space[2] }}>
            <input
              style={{ ...inputStyle, flex: 2 }}
              value={editDraft.label ?? ""}
              placeholder="Event label"
              onChange={(e) => setEditDraft({ ...editDraft, label: e.target.value })}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={editDraft.date ?? ""}
              placeholder="Date"
              onChange={(e) => setEditDraft({ ...editDraft, date: e.target.value })}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={editDraft.emotion ?? ""}
              placeholder="Emotion"
              onChange={(e) => setEditDraft({ ...editDraft, emotion: e.target.value })}
            />
          </div>
          <textarea
            style={{ ...inputStyle, minHeight: 48, resize: "vertical" }}
            value={editDraft.detail ?? ""}
            placeholder="Details..."
            onChange={(e) => setEditDraft({ ...editDraft, detail: e.target.value })}
          />
          <div style={{ display: "flex", gap: space[2], justifyContent: "flex-end" }}>
            {onRemoveEvent && (
              <button
                style={{
                  ...btnPreset.ghost,
                  color: colors.error,
                  borderColor: colors.error,
                }}
                onClick={() => {
                  onRemoveEvent(activeId!);
                  setActiveId(null);
                  setEditDraft({});
                }}
              >
                Remove
              </button>
            )}
            <button style={btnPreset.ghost} onClick={() => { setActiveId(null); setEditDraft({}); }}>
              Cancel
            </button>
            <button
              style={{
                ...btnPreset.ghost,
                color: colors.coral,
                borderColor: colors.coral,
              }}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Add event button */}
      {onAddEvent && (
        <button
          style={{
            ...btnPreset.ghost,
            alignSelf: "flex-start",
            color: colors.coral,
            borderColor: colors.borderDefault,
          }}
          onClick={handleAdd}
        >
          + Add Event
        </button>
      )}
    </div>
  );
}
