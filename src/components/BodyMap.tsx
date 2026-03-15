"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

export interface BodyMarker {
  x: number;
  y: number;
  label: string;
}

interface BodyMapProps {
  markers: BodyMarker[];
  onChange: (markers: BodyMarker[]) => void;
}

const COMMON_LABELS = [
  "tension",
  "warmth",
  "heaviness",
  "tingling",
  "numbness",
  "pain",
  "energy",
];

const LABEL_COLORS: Record<string, string> = {
  tension: "#E09585",
  warmth: "#F4B5A9",
  heaviness: "#7B5278",
  tingling: "#B08DAD",
  numbness: "#99929B",
  pain: "#D25858",
  energy: "#6AB282",
};

// Simple front-view body outline SVG path
const BODY_SVG_WIDTH = 200;
const BODY_SVG_HEIGHT = 440;

function BodyOutlineSVG() {
  return (
    <g
      fill="none"
      stroke={colors.borderDefault}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.6}
    >
      {/* Head */}
      <ellipse cx={100} cy={36} rx={22} ry={28} />

      {/* Neck */}
      <line x1={92} y1={64} x2={92} y2={80} />
      <line x1={108} y1={64} x2={108} y2={80} />

      {/* Torso */}
      <path d="M 68 80 Q 60 80 56 100 L 52 180 Q 50 200 60 210 L 68 218 Q 80 226 100 228 Q 120 226 132 218 L 140 210 Q 150 200 148 180 L 144 100 Q 140 80 132 80 Z" />

      {/* Left arm */}
      <path d="M 56 100 Q 40 106 30 130 Q 22 150 18 180 Q 14 200 20 212 Q 24 218 28 216" />
      <path d="M 56 100 Q 44 108 36 130 Q 28 150 24 180 Q 22 200 26 210" />

      {/* Right arm */}
      <path d="M 144 100 Q 160 106 170 130 Q 178 150 182 180 Q 186 200 180 212 Q 176 218 172 216" />
      <path d="M 144 100 Q 156 108 164 130 Q 172 150 176 180 Q 178 200 174 210" />

      {/* Left hand */}
      <ellipse cx={24} cy={216} rx={8} ry={10} />

      {/* Right hand */}
      <ellipse cx={176} cy={216} rx={8} ry={10} />

      {/* Left leg */}
      <path d="M 68 218 Q 66 260 64 300 Q 62 340 60 370 Q 58 400 54 420 Q 52 430 48 434 L 38 436" />
      <path d="M 100 228 Q 94 260 88 300 Q 84 340 80 370 Q 78 400 74 420 Q 72 430 68 434 L 58 436" />

      {/* Right leg */}
      <path d="M 132 218 Q 134 260 136 300 Q 138 340 140 370 Q 142 400 146 420 Q 148 430 152 434 L 162 436" />
      <path d="M 100 228 Q 106 260 112 300 Q 116 340 120 370 Q 122 400 126 420 Q 128 430 132 434 L 142 436" />

      {/* Left foot */}
      <path d="M 38 436 Q 34 438 32 436 Q 30 434 34 432" />

      {/* Right foot */}
      <path d="M 162 436 Q 166 438 168 436 Q 170 434 166 432" />

      {/* Center line (subtle) */}
      <line
        x1={100}
        y1={80}
        x2={100}
        y2={228}
        stroke={colors.borderSubtle}
        strokeWidth={0.5}
        strokeDasharray="4 4"
      />
    </g>
  );
}

export default function BodyMap({ markers, onChange }: BodyMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pendingPoint, setPendingPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>("tension");
  const [customLabel, setCustomLabel] = useState("");

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = BODY_SVG_WIDTH / rect.width;
    const scaleY = BODY_SVG_HEIGHT / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    setPendingPoint({ x, y });
  }

  function confirmMarker() {
    if (!pendingPoint) return;
    const label = customLabel.trim() || selectedLabel;
    const newMarkers = [...markers, { ...pendingPoint, label }];
    onChange(newMarkers);
    setPendingPoint(null);
    setCustomLabel("");
  }

  function cancelMarker() {
    setPendingPoint(null);
    setCustomLabel("");
  }

  function removeMarker(index: number) {
    const newMarkers = markers.filter((_, i) => i !== index);
    onChange(newMarkers);
  }

  function getMarkerColor(label: string): string {
    return LABEL_COLORS[label] || colors.coral;
  }

  return (
    <div>
      {/* Instruction */}
      <p
        style={{
          fontSize: 12,
          color: colors.textMuted,
          margin: "0 0 12px 0",
          fontFamily: body,
          textAlign: "center",
        }}
      >
        Tap on the body where you notice sensations
      </p>

      {/* SVG body map */}
      <div
        style={{
          position: "relative",
          maxWidth: 240,
          margin: "0 auto",
          backgroundColor: colors.bgRecessed,
          borderRadius: 16,
          padding: "16px 20px",
          border: `1px solid ${colors.borderSubtle}`,
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${BODY_SVG_WIDTH} ${BODY_SVG_HEIGHT}`}
          style={{
            width: "100%",
            height: "auto",
            cursor: "crosshair",
            display: "block",
          }}
          onClick={handleSvgClick}
        >
          <BodyOutlineSVG />

          {/* Placed markers */}
          {markers.map((marker, i) => {
            const markerColor = getMarkerColor(marker.label);
            return (
              <g key={i}>
                {/* Glow */}
                <motion.circle
                  cx={marker.x}
                  cy={marker.y}
                  r={14}
                  fill={markerColor}
                  opacity={0.15}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                {/* Core dot */}
                <motion.circle
                  cx={marker.x}
                  cy={marker.y}
                  r={7}
                  fill={markerColor}
                  opacity={0.85}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                    delay: 0.05,
                  }}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMarker(i);
                  }}
                />
                {/* Label */}
                <motion.text
                  x={marker.x}
                  y={marker.y - 12}
                  textAnchor="middle"
                  fill={colors.textSecondary}
                  fontSize={8}
                  fontFamily={display}
                  fontWeight={600}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{ pointerEvents: "none" }}
                >
                  {marker.label}
                </motion.text>
              </g>
            );
          })}

          {/* Pending point indicator */}
          {pendingPoint && (
            <motion.circle
              cx={pendingPoint.x}
              cy={pendingPoint.y}
              r={8}
              fill={colors.coral}
              opacity={0.5}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
          )}
        </svg>
      </div>

      {/* Label selector (shown when pending point) */}
      <AnimatePresence>
        {pendingPoint && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "16px 0 0 0",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.textMuted,
                  margin: "0 0 10px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: display,
                  textAlign: "center",
                }}
              >
                What do you feel here?
              </p>

              {/* Chip grid */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                {COMMON_LABELS.map((label) => {
                  const isSelected = selectedLabel === label && !customLabel;
                  const chipColor = getMarkerColor(label);
                  return (
                    <motion.button
                      key={label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedLabel(label);
                        setCustomLabel("");
                      }}
                      style={{
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: body,
                        borderRadius: 100,
                        cursor: "pointer",
                        border: `1px solid ${
                          isSelected ? chipColor : colors.borderDefault
                        }`,
                        backgroundColor: isSelected
                          ? chipColor + "20"
                          : "transparent",
                        color: isSelected ? chipColor : colors.textSecondary,
                        transition: "all 0.15s",
                      }}
                    >
                      {label}
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom label input */}
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Or type your own..."
                style={{
                  width: "100%",
                  padding: "8px 14px",
                  fontSize: 13,
                  fontFamily: body,
                  backgroundColor: colors.bgInput,
                  border: `1px solid ${colors.borderDefault}`,
                  color: colors.textPrimary,
                  borderRadius: 10,
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 12,
                  textAlign: "center",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.coral;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.borderDefault;
                }}
              />

              {/* Confirm / Cancel */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={cancelMarker}
                  style={{
                    padding: "8px 18px",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: display,
                    borderRadius: 100,
                    cursor: "pointer",
                    border: `1px solid ${colors.borderDefault}`,
                    backgroundColor: "transparent",
                    color: colors.textSecondary,
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.04,
                    boxShadow: `0 4px 16px ${colors.coral}30`,
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmMarker}
                  style={{
                    padding: "8px 20px",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: display,
                    borderRadius: 100,
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: colors.coral,
                    color: colors.bgDeep,
                  }}
                >
                  Place Marker
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marker list summary */}
      {markers.length > 0 && !pendingPoint && (
        <div
          style={{
            marginTop: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            justifyContent: "center",
          }}
        >
          {markers.map((marker, i) => {
            const chipColor = getMarkerColor(marker.label);
            return (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: body,
                  borderRadius: 100,
                  backgroundColor: chipColor + "18",
                  color: chipColor,
                  border: `1px solid ${chipColor}30`,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: chipColor,
                    display: "inline-block",
                  }}
                />
                {marker.label}
                <button
                  onClick={() => removeMarker(i)}
                  style={{
                    background: "none",
                    border: "none",
                    color: chipColor,
                    cursor: "pointer",
                    fontSize: 12,
                    padding: "0 0 0 2px",
                    lineHeight: 1,
                    opacity: 0.6,
                  }}
                >
                  x
                </button>
              </motion.span>
            );
          })}
        </div>
      )}
    </div>
  );
}
