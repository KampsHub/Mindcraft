"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { colors, fonts, space, radii } from "@/lib/theme";

interface WordCloudBuilderProps {
  words: { text: string; weight?: number }[];
  onAddWord?: (word: string) => void;
  onRemoveWord?: (word: string) => void;
  onWeightChange?: (word: string, weight: number) => void;
  placeholder?: string;
}

const WIDTH = 500;
const HEIGHT = 400;
const MAX_WEIGHT = 5;

function weightToColor(weight: number): string {
  if (weight >= 4) return colors.coral;
  if (weight >= 3) return colors.coralLight;
  if (weight >= 2) return colors.plum;
  if (weight >= 1) return colors.plumLight;
  return colors.textMuted;
}

function weightToSize(weight: number): number {
  return 14 + (weight || 1) * 6;
}

interface NodeDatum extends d3.SimulationNodeDatum {
  text: string;
  weight: number;
  fontSize: number;
}

export default function WordCloudBuilder({
  words,
  onAddWord,
  onRemoveWord,
  onWeightChange,
  placeholder = "Type a value and press Enter…",
}: WordCloudBuilderProps) {
  const [inputValue, setInputValue] = useState("");
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NodeDatum, undefined> | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const word = inputValue.trim();
      if (!words.some((w) => w.text.toLowerCase() === word.toLowerCase())) {
        onAddWord?.(word);
      }
      setInputValue("");
    }
  };

  const handleWordClick = (word: string, currentWeight: number) => {
    if (highlightedWord === word) {
      // Second click removes
      onRemoveWord?.(word);
      setHighlightedWord(null);
    } else {
      // First click highlights and increases weight
      setHighlightedWord(word);
      if (currentWeight < MAX_WEIGHT) {
        onWeightChange?.(word, currentWeight + 1);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, word: string, currentWeight: number) => {
    e.preventDefault();
    if (currentWeight > 1) {
      onWeightChange?.(word, currentWeight - 1);
    }
  };

  // Force simulation
  const updateSimulation = useCallback(() => {
    const svg = d3.select(svgRef.current);
    if (!svgRef.current) return;

    const nodes: NodeDatum[] = words.map((w) => ({
      text: w.text,
      weight: w.weight || 1,
      fontSize: weightToSize(w.weight || 1),
    }));

    // Stop old simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const simulation = d3
      .forceSimulation<NodeDatum>(nodes)
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("charge", d3.forceManyBody().strength(-80))
      .force(
        "collision",
        d3.forceCollide<NodeDatum>().radius((d) => d.fontSize * 1.8)
      )
      .force("x", d3.forceX(WIDTH / 2).strength(0.05))
      .force("y", d3.forceY(HEIGHT / 2).strength(0.05))
      .alphaDecay(0.03);

    simulationRef.current = simulation;

    // Bind data
    const textEls = svg
      .selectAll<SVGTextElement, NodeDatum>("text.cloud-word")
      .data(nodes, (d) => d.text);

    textEls.exit().transition().duration(200).attr("opacity", 0).remove();

    const entered = textEls
      .enter()
      .append("text")
      .attr("class", "cloud-word")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("opacity", 0)
      .attr("cursor", "pointer")
      .style("user-select", "none")
      .style("font-family", fonts.display)
      .style("font-weight", "600")
      .style("transition", "fill 0.2s, opacity 0.2s");

    entered.transition().duration(300).attr("opacity", 1);

    const merged = entered.merge(textEls);

    merged
      .text((d) => d.text)
      .style("font-size", (d) => `${d.fontSize}px`)
      .style("fill", (d) =>
        highlightedWord === d.text ? colors.coral : weightToColor(d.weight)
      );

    simulation.on("tick", () => {
      merged.attr("x", (d) => d.x ?? WIDTH / 2).attr("y", (d) => d.y ?? HEIGHT / 2);
    });
  }, [words, highlightedWord]);

  useEffect(() => {
    updateSimulation();
    return () => {
      simulationRef.current?.stop();
    };
  }, [updateSimulation]);

  // Attach click/contextmenu handlers via React overlay to avoid D3 event conflicts
  const wordLookup = new Map(words.map((w) => [w.text, w.weight || 1]));

  return (
    <div
      style={{
        background: colors.bgDeep,
        borderRadius: radii.lg,
        padding: space[5],
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: space[4],
        border: `1px solid ${colors.borderDefault}`,
      }}
    >
      {/* Cloud area */}
      <svg
        ref={svgRef}
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ maxWidth: "100%", height: "auto" }}
        onClickCapture={(e) => {
          const target = e.target as SVGElement;
          if (target.tagName === "text") {
            const word = target.textContent || "";
            handleWordClick(word, wordLookup.get(word) || 1);
          }
        }}
        onContextMenuCapture={(e) => {
          const target = e.target as SVGElement;
          if (target.tagName === "text") {
            const word = target.textContent || "";
            handleContextMenu(e, word, wordLookup.get(word) || 1);
          }
        }}
      />

      {/* Word count */}
      {words.length > 0 && (
        <div
          style={{
            fontFamily: fonts.bodyAlt,
            fontSize: 13,
            color: colors.textMuted,
          }}
        >
          {words.length} word{words.length !== 1 ? "s" : ""} — click to
          highlight, click again to remove
        </div>
      )}

      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: "100%",
          maxWidth: 360,
          padding: `${space[3]}px ${space[4]}px`,
          fontFamily: fonts.bodyAlt,
          fontSize: 15,
          color: colors.textPrimary,
          backgroundColor: colors.bgInput,
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: radii.full,
          outline: "none",
        }}
      />
    </div>
  );
}
