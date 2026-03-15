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
 * Custom events you can fire from anywhere:
 *   window.gtag("event", "begin_checkout", { package: "layoff", price: 75 });
 *   window.gtag("event", "intake_start", { program: "parachute" });
 *   window.gtag("event", "intake_complete", { program: "parachute" });
 *   window.gtag("event", "attribution_source", { source: "google" });
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
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            send_page_view: true,
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
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
}
