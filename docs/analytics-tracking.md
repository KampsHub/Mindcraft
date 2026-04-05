# Analytics & Tracking — Mindcraft

## External Services

### Google Analytics 4
- **ID**: `G-6HTGC2PZMW`
- **File**: `src/components/GoogleAnalytics.tsx`
- **Consent**: Respects cookie consent via localStorage. Disabled if user declines.
- **Events tracked**: page views, program CTAs, checkout flow, intake completion, NPS scores, coaching applications

### Sentry
- **Config**: `sentry.client.config.ts`, `sentry.server.config.ts`
- **Production only**: Yes
- **Sample rate**: 10% of transactions
- **PII**: Request body redacted (`[REDACTED]`) to prevent journal/exercise data leakage

### Vercel Analytics
- **File**: `src/app/layout.tsx`
- **Tracks**: Web Vitals (CLS, FID, LCP, TTFB), page performance
- **PII**: None collected

---

## Internal Tracking (Supabase)

### `api_logs` — AI API Call Logging
- **File**: `src/lib/api-logger.ts`
- **Stores**: Every Claude API call — endpoint, model, prompt (10k chars), response (10k chars), tokens, latency, errors
- **Privacy note**: Contains user journal text. No auto-purge policy.

### `email_events` — Email Engagement
- **File**: `api/resend-webhook/route.ts`
- **Stores**: Resend webhook events (sent, delivered, opened, clicked, bounced, complained)

### `quality_flags` — User Quality Feedback
- **File**: `api/quality-flag/route.ts`
- **Stores**: User-submitted flags on AI outputs (reason, comment, output type)

### `quality_audits` — Weekly AI Quality Review
- **File**: `api/quality-audit/route.ts`
- **Stores**: Claude-evaluated quality scores across 6 dimensions (1-5 each)
- **Schedule**: Mondays via cron

### `weekly_reviews` — NPS Scores
- **File**: `src/components/NPSPrompt.tsx`
- **Stores**: NPS scores (0-10) per enrollment per week

---

## Dashboards

### Coach Dashboard (`/coach`)
- **File**: `src/app/coach/page.tsx`, `api/coach-analytics/route.ts`
- **Access**: Authenticated coaches only
- **Shows**: Quality metrics, exercise ratings, engagement stats, email performance, progression/completion rates
- **Privacy**: All data aggregated — no individual client details

### Admin Dashboard (`/admin`)
- **File**: `src/app/admin/page.tsx`, `api/admin/token-costs/route.ts`
- **Access**: Admin emails only (`stefanie@allmindsondeck.com`, `crew@allmindsondeck.com`)
- **Shows**: Enrollment stats, AI cost tracking (by endpoint, by user), token usage
- **Quick links**: Supabase, Vercel, Stripe, Sentry, Resend, GA4

---

## Cookie Consent
- **File**: `src/components/CookieConsent.tsx`
- **Accept all**: Enables GA4
- **Essential only**: Disables GA4 via `window['ga-disable-G-6HTGC2PZMW'] = true`
- **Storage**: `localStorage.cookie-consent`

## No Third-Party Tracking
No LogRocket, Mixpanel, PostHog, Heap, FullStory, Datadog, or Amplitude.
