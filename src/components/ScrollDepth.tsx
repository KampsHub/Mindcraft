"use client";

/**
 * Fire `{event}_scroll_depth` events at 25/50/75/100% of page scroll.
 * Mount once per page. Renders nothing.
 */

import { useEffect } from "react";
import { trackEvent } from "@/components/GoogleAnalytics";

interface Props {
  /** Event prefix — final event is `${event}_scroll_depth` */
  event: string;
  params?: Record<string, string | number | boolean>;
}

const THRESHOLDS = [25, 50, 75, 100] as const;

export default function ScrollDepth({ event, params }: Props) {
  useEffect(() => {
    const fired = new Set<number>();

    const handler = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        (document.documentElement.scrollHeight || document.body.scrollHeight) -
        window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100));

      for (const t of THRESHOLDS) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          trackEvent(`${event}_scroll_depth`, { ...params, depth: t });
        }
      }
      if (fired.size === THRESHOLDS.length) {
        window.removeEventListener("scroll", handler);
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    // Fire once to catch pages that load with content already in view
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [event, params]);

  return null;
}
