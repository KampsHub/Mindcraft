"use client";

import Script from "next/script";

/**
 * Google Analytics 4 — drop-in component.
 *
 * Set your Measurement ID in .env.local:
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 *
 * Usage: Add <GoogleAnalytics /> to your root layout.
 *
 * Fire events via the trackEvent / setUserId / setUserProperties helpers below.
 * The full event catalog lives in docs/analytics-events.md.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Respect cookie consent — only enable analytics if user accepted
          var consent = localStorage.getItem('cookie-consent');
          if (consent === 'declined') {
            window['ga-disable-${GA_ID}'] = true;
          }

          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            send_page_view: consent !== 'declined',
          });
          window.gtag = gtag;
        `}
      </Script>
    </>
  );
}

/** Fire a custom GA event from any component */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | null | undefined>,
) {
  if (typeof window === "undefined") return;
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof g !== "function") return;
  // Strip null/undefined params — GA4 doesn't accept them
  const clean: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== null && v !== undefined) clean[k] = v;
    }
  }
  g("event", eventName, clean);
}

/** Set the GA4 user_id so events across devices tie to one user. */
export function setUserId(userId: string | null) {
  if (typeof window === "undefined" || !GA_ID) return;
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof g !== "function") return;
  g("config", GA_ID, { user_id: userId ?? undefined });
}

/** Set GA4 user properties — used for cohort segmentation in Explorations. */
export function setUserProperties(
  props: Record<string, string | number | boolean | null | undefined>,
) {
  if (typeof window === "undefined") return;
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof g !== "function") return;
  const clean: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v !== null && v !== undefined) clean[k] = v;
  }
  g("set", "user_properties", clean);
}

/** Read the GA4 client_id for the current browser (for server-side events). */
export function getGaClientId(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !GA_ID) return resolve(null);
    const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof g !== "function") return resolve(null);
    try {
      g("get", GA_ID, "client_id", (cid: string) => resolve(cid || null));
      // Safety timeout — gtag callback is normally sync once GA loads
      setTimeout(() => resolve(null), 2000);
    } catch {
      resolve(null);
    }
  });
}
