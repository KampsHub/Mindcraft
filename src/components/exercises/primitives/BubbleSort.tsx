"use client";

import React, { useState, useCallback, useMemo } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

interface BubbleSortProps {
  items: string[];
  onComplete?: (ranked: string[]) => void;
  question?: string;
}

interface Comparison { a: number; b: number }
interface SortEngine {
  getNext(): Comparison | null;
  choose(winner: "a" | "b"): void;
  getResult(): number[];
  totalEstimate: number;
}

function createMergeSortEngine(n: number): SortEngine {
  let arr = Array.from({ length: n }, (_, i) => [i]);
  let pendingMerges: Array<{ left: number[]; right: number[] }> = [];
  let currentMerge: {
    left: number[]; right: number[]; li: number; ri: number; result: number[];
  } | null = null;
  let done = false;
  const totalEstimate = n <= 1 ? 0 : Math.ceil(n * Math.log2(n));

  function setupNextPass() {
    if (arr.length <= 1) { done = true; return; }
    pendingMerges = [];
    for (let i = 0; i < arr.length; i += 2) {
      if (i + 1 < arr.length) pendingMerges.push({ left: arr[i], right: arr[i + 1] });
      else pendingMerges.push({ left: arr[i], right: [] });
    }
    arr = [];
  }

  function advanceMerge() {
    if (currentMerge) {
      const { left, right, li, ri, result } = currentMerge;
      if (li >= left.length) { result.push(...right.slice(ri)); arr.push(result); currentMerge = null; return; }
      if (ri >= right.length) { result.push(...left.slice(li)); arr.push(result); currentMerge = null; return; }
      return;
    }
    if (pendingMerges.length === 0) { setupNextPass(); if (done) return; }
    if (pendingMerges.length > 0) {
      const pair = pendingMerges.shift()!;
      if (pair.right.length === 0) { arr.push(pair.left); advanceMerge(); return; }
      currentMerge = { left: pair.left, right: pair.right, li: 0, ri: 0, result: [] };
    }
  }

  setupNextPass();
  if (!done) advanceMerge();

  return {
    totalEstimate,
    getNext(): Comparison | null {
      if (done) return null;
      if (!currentMerge) { advanceMerge(); if (done || !currentMerge) return null; }
      const { left, right, li, ri } = currentMerge!;
      if (li < left.length && ri < right.length) return { a: left[li], b: right[ri] };
      advanceMerge();
      return this.getNext();
    },
    choose(winner: "a" | "b") {
      if (!currentMerge) return;
      if (winner === "a") { currentMerge.result.push(currentMerge.left[currentMerge.li]); currentMerge.li++; }
      else { currentMerge.result.push(currentMerge.right[currentMerge.ri]); currentMerge.ri++; }
      const { left, right, li, ri, result } = currentMerge;
      if (li >= left.length || ri >= right.length) {
        if (li >= left.length) result.push(...right.slice(ri));
        else result.push(...left.slice(li));
        arr.push(result); currentMerge = null; advanceMerge();
      }
    },
    getResult: () => (done && arr.length === 1 ? arr[0] : []),
  };
}

export default function BubbleSort({
  items, onComplete, question = "Which matters more to you?",
}: BubbleSortProps) {
  const engine = useMemo(() => createMergeSortEngine(items.length), [items.length]);
  const [comparison, setComparison] = useState<Comparison | null>(() => engine.getNext());
  const [compIndex, setCompIndex] = useState(1);
  const [selected, setSelected] = useState<"a" | "b" | null>(null);
  const [ranked, setRanked] = useState<string[] | null>(null);

  const handleChoice = useCallback((choice: "a" | "b") => {
    setSelected(choice);
    setTimeout(() => {
      engine.choose(choice);
      const next = engine.getNext();
      if (next) { setComparison(next); setCompIndex((i) => i + 1); }
      else { const result = engine.getResult().map((i) => items[i]); setRanked(result); onComplete?.(result); }
      setSelected(null);
    }, 400);
  }, [engine, items, onComplete]);

  if (ranked) {
    return (
      <div style={S.container}>
        <p style={S.heading}>Your Ranking</p>
        <ol style={S.list}>
          {ranked.map((item, i) => (
            <li key={item} style={S.listItem}>
              <span style={S.rank}>{i + 1}</span>
              <span style={S.listLabel}>{item}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (!comparison) return null;
  const progress = Math.min(compIndex / Math.max(engine.totalEstimate, 1), 1);

  return (
    <div style={S.container}>
      <p style={S.question}>{question}</p>
      <p style={S.progress}>Comparison {compIndex} of ~{engine.totalEstimate}</p>
      <div style={S.progressBar}>
        <div style={{ ...S.progressFill, width: `${progress * 100}%` }} />
      </div>
      <div style={S.cards}>
        {(["a", "b"] as const).map((side) => {
          const idx = comparison[side];
          const isSelected = selected === side;
          return (
            <button
              key={side}
              onClick={() => !selected && handleChoice(side)}
              style={{
                ...S.card,
                ...(isSelected ? S.cardSelected : {}),
                transform: isSelected ? "scale(1.05)" : "scale(1)",
                opacity: selected && !isSelected ? 0.4 : 1,
              }}
            >
              <span style={S.cardText}>{items[idx]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { padding: space[5], backgroundColor: colors.bgDeep, borderRadius: radii.lg, maxWidth: 520, margin: "0 auto" },
  question: { fontFamily: fonts.display, fontSize: text.heading.fontSize, fontWeight: 700, color: colors.textPrimary, textAlign: "center", margin: `0 0 ${space[2]}px` },
  progress: { fontFamily: fonts.bodyAlt, fontSize: text.secondary.fontSize, color: colors.textMuted, textAlign: "center", margin: `0 0 ${space[3]}px` },
  progressBar: { height: 4, backgroundColor: colors.bgElevated, borderRadius: radii.full, overflow: "hidden", marginBottom: space[6] },
  progressFill: { height: "100%", backgroundColor: colors.coral, borderRadius: radii.full, transition: "width 0.3s ease" },
  cards: { display: "flex", gap: space[4], justifyContent: "center" },
  card: { flex: 1, padding: `${space[7]}px ${space[5]}px`, backgroundColor: colors.bgSurface, border: `2px solid ${colors.borderDefault}`, borderRadius: radii.md, cursor: "pointer", transition: "all 0.3s ease", outline: "none" },
  cardSelected: { backgroundColor: colors.coralOnDark, borderColor: colors.coral },
  cardText: { fontFamily: fonts.display, fontSize: text.body.fontSize, fontWeight: 600, color: colors.textPrimary, display: "block", textAlign: "center" },
  heading: { fontFamily: fonts.display, fontSize: text.heading.fontSize, fontWeight: 700, color: colors.coral, textAlign: "center", margin: `0 0 ${space[5]}px` },
  list: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: space[2] },
  listItem: { display: "flex", alignItems: "center", gap: space[3], padding: `${space[3]}px ${space[4]}px`, backgroundColor: colors.bgSurface, borderRadius: radii.sm },
  rank: { fontFamily: fonts.display, fontSize: text.body.fontSize, fontWeight: 700, color: colors.coral, minWidth: 24 },
  listLabel: { fontFamily: fonts.bodyAlt, fontSize: text.body.fontSize, color: colors.textPrimary },
};
