"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { animate } from "motion";
import { colors, fonts, space, radii } from "@/lib/theme";

interface WheelChartProps {
  categories: string[];
  values: number[];
  comparisonValues?: number[];
  onChange?: (index: number, value: number) => void;
  maxValue?: number;
}

const SIZE = 480;
const MARGIN = 100;
const RADIUS = (SIZE - MARGIN * 2) / 2;
const CENTER = SIZE / 2;

export default function WheelChart({
  categories,
  values,
  comparisonValues,
  onChange,
  maxValue = 10,
}: WheelChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const angleSlice = (Math.PI * 2) / categories.length;

  const radialScale = d3.scaleLinear().domain([0, maxValue]).range([0, RADIUS]);

  const getPoint = useCallback(
    (index: number, value: number): [number, number] => {
      const angle = angleSlice * index - Math.PI / 2;
      return [
        CENTER + radialScale(value) * Math.cos(angle),
        CENTER + radialScale(value) * Math.sin(angle),
      ];
    },
    [angleSlice, radialScale]
  );

  const buildPath = useCallback(
    (vals: number[]): string => {
      return vals
        .map((v, i) => {
          const [x, y] = getPoint(i, v);
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ") + " Z";
    },
    [getPoint]
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Concentric grid circles
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      const r = (RADIUS / levels) * level;
      g.append("circle")
        .attr("cx", CENTER)
        .attr("cy", CENTER)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.25)")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", level < levels ? 0.5 : 0.8)
        .attr("stroke-dasharray", level < levels ? "2,4" : "none");
    }

    // Axis lines from center to perimeter
    categories.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = CENTER + RADIUS * Math.cos(angle);
      const y = CENTER + RADIUS * Math.sin(angle);
      g.append("line")
        .attr("x1", CENTER)
        .attr("y1", CENTER)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "rgba(255,255,255,0.2)")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.4);
    });

    // Level labels (numbers on first axis)
    for (let level = 1; level <= levels; level++) {
      const val = Math.round((maxValue / levels) * level);
      const r = (RADIUS / levels) * level;
      g.append("text")
        .attr("x", CENTER + 4)
        .attr("y", CENTER - r - 2)
        .attr("fill", "rgba(255,255,255,0.6)")
        .attr("font-size", 10)
        .attr("font-family", fonts.body)
        .text(val);
    }

    // Comparison area (plum, drawn first so it sits behind)
    if (comparisonValues && comparisonValues.length === categories.length) {
      g.append("path")
        .attr("d", buildPath(comparisonValues))
        .attr("fill", colors.plumWash)
        .attr("stroke", colors.plum)
        .attr("stroke-width", 2);

      // Comparison dots
      comparisonValues.forEach((v, i) => {
        const [x, y] = getPoint(i, v);
        g.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 4)
          .attr("fill", colors.plum);
      });
    }

    // Current values area (coral)
    g.append("path")
      .attr("d", buildPath(values))
      .attr("fill", "rgba(196, 148, 58, 0.2)")
      .attr("stroke", "#F0EDE6")
      .attr("stroke-width", 2);

    // Current value dots
    values.forEach((v, i) => {
      const [x, y] = getPoint(i, v);

      // Pulse ring (hint that dots are interactive)
      if (onChange) {
        g.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 7)
          .attr("fill", "none")
          .attr("stroke", colors.coral)
          .attr("stroke-width", 1.5)
          .attr("stroke-opacity", 0.4)
          .append("animate")
          .attr("attributeName", "r")
          .attr("values", "7;12;7")
          .attr("dur", "2s")
          .attr("repeatCount", "3");
      }

      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 6)
        .attr("fill", colors.coral)
        .attr("stroke", colors.bgSurface)
        .attr("stroke-width", 2)
        .attr("data-dot", i)
        .style("cursor", onChange ? "grab" : "default");
    });

    // Click zones per segment (invisible wedges for interaction)
    if (onChange) {
      categories.forEach((_, i) => {
        const startAngle = angleSlice * i - angleSlice / 2 - Math.PI / 2;
        const endAngle = startAngle + angleSlice;
        const arc = d3.arc<unknown>()
          .innerRadius(0)
          .outerRadius(RADIUS)
          .startAngle(startAngle + Math.PI / 2)
          .endAngle(endAngle + Math.PI / 2);

        g.append("path")
          .attr("d", arc({} as never))
          .attr("transform", `translate(${CENTER},${CENTER})`)
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("click", (event: MouseEvent) => {
            const rect = svgRef.current!.getBoundingClientRect();
            const mx = event.clientX - rect.left - CENTER;
            const my = event.clientY - rect.top - CENTER;
            const dist = Math.sqrt(mx * mx + my * my);
            const newValue = Math.max(1, Math.min(maxValue, Math.round(radialScale.invert(dist))));
            onChange(i, newValue);
            // Spring animation on the clicked dot
            const dot = svgRef.current?.querySelector(`circle[data-dot="${i}"]`);
            if (dot) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (animate as any)(dot, { r: [8, 5, 6] }, { duration: 0.3, easing: [0.22, 1, 0.36, 1] });
            }
          });
      });
    }

    // Category labels around perimeter
    categories.forEach((cat, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const labelR = RADIUS + 24;
      const x = CENTER + labelR * Math.cos(angle);
      const y = CENTER + labelR * Math.sin(angle);

      let anchor: string = "middle";
      if (Math.cos(angle) > 0.1) anchor = "start";
      else if (Math.cos(angle) < -0.1) anchor = "end";

      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", anchor)
        .attr("dominant-baseline", "central")
        .attr("fill", "#FFFFFF")
        .attr("font-size", 14)
        .attr("font-weight", 600)
        .attr("font-family", fonts.display)
        .text(cat);
    });
  }, [categories, values, comparisonValues, maxValue, onChange, angleSlice, radialScale, getPoint, buildPath]);

  return (
    <div
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radii.md,
        padding: space[5],
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: space[3],
      }}
    >
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ maxWidth: "100%", height: "auto" }}
      />

      {comparisonValues && (
        <div
          style={{
            display: "flex",
            gap: space[5],
            fontFamily: fonts.body,
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: space[2] }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: radii.full,
                backgroundColor: colors.coral,
                display: "inline-block",
              }}
            />
            <span style={{ color: colors.textSecondary }}>Current</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: space[2] }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: radii.full,
                backgroundColor: colors.plum,
                display: "inline-block",
              }}
            />
            <span style={{ color: colors.textSecondary }}>Comparison</span>
          </div>
        </div>
      )}
    </div>
  );
}
