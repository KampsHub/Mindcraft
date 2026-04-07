"use client";

/**
 * Wraps a section and fires a trackEvent exactly once when the section enters
 * the viewport. Reuses framer-motion's useInView so we don't roll a separate
 * IntersectionObserver.
 */

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { trackEvent } from "@/components/GoogleAnalytics";

interface Props {
  event: string;
  params?: Record<string, string | number | boolean>;
  /** viewport margin passed to useInView. Default triggers slightly before fully in-view. */
  margin?: string;
  children: React.ReactNode;
  /** Inline style on the wrapping div. Default: no styling. */
  style?: React.CSSProperties;
  as?: "div" | "section";
}

export default function ScrollTracker({
  event,
  params,
  margin = "0px 0px -10% 0px",
  children,
  style,
  as = "div",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: margin as `${number}${"px" | "%"}`,
  });
  const fired = useRef(false);

  useEffect(() => {
    if (inView && !fired.current) {
      fired.current = true;
      trackEvent(event, params);
    }
  }, [inView, event, params]);

  const Tag = as;
  return (
    <Tag ref={ref as never} style={style}>
      {children}
    </Tag>
  );
}
