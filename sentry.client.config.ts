import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Performance monitoring — sample 10% of transactions
  tracesSampleRate: 0.1,

  // Don't send PII (journal content, exercise responses)
  beforeSend(event) {
    // Strip any request body data that might contain journal text
    if (event.request?.data) {
      event.request.data = "[REDACTED]";
    }
    return event;
  },
});
