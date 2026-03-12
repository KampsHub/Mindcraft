"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

/* ── Animated counter ───────────────────────────────────────
 *  Counts from 0 up to a target number when scrolled into view.
 *  Supports prefix (e.g. "$"), suffix (e.g. "+"), and decimal places.
 */

interface CountUpProps {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;      // seconds
  delay?: number;         // seconds
  style?: React.CSSProperties;
  className?: string;
}

export default function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.8,
  delay = 0,
  style,
  className,
}: CountUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    const start = performance.now() + delay * 1000;
    const durationMs = duration * 1000;

    function animate(now: number) {
      const elapsed = now - start;
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic for a snappy feel
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * to);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setValue(to);
      }
    }

    requestAnimationFrame(animate);
  }, [isInView, to, duration, delay]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
