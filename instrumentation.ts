import * as Sentry from "@sentry/nextjs";

/**
 * Next.js instrumentation hook — loads server/edge Sentry SDKs on boot.
 * Required for @sentry/nextjs v8+.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Required by Sentry v8+ to capture request errors in app-router routes
export const onRequestError = Sentry.captureRequestError;
