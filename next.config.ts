import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default withSentryConfig(nextConfig, {
  // Silences the "Sentry CLI not authenticated" warning in dev
  silent: !process.env.CI,
  // Upload a larger set of source maps for prettier stack traces
  // (only runs when SENTRY_AUTH_TOKEN is set in CI)
  widenClientFileUpload: true,
  // Tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});
