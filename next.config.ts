import type { NextConfig } from "next";

// NOTE: We deliberately do NOT wrap with withSentryConfig.
// Next.js 16 uses Turbopack as the default builder, and Sentry's webpack
// plugin (injected by withSentryConfig) is incompatible with Turbopack
// builds. instrumentation.ts is sufficient to initialize the Sentry SDK
// on the server — we just give up on auto source-map upload, which is
// not needed for events to fire in Sentry.

const nextConfig: NextConfig = {
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default nextConfig;
