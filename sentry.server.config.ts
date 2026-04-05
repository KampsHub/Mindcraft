import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: 0.1,

  // Don't send PII
  beforeSend(event) {
    if (event.request?.data) {
      event.request.data = "[REDACTED]";
    }
    return event;
  },
});
