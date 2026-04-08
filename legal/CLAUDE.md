# Legal — Privacy, Compliance, Data

Loaded when touching PII, auth, payments, emails, user data, or anything with regulatory surface area.

## Files in this folder

- **`LEGAL-HANGUPS.md`** — legal risk audit. HIGH RISK on Washington My Health My Data Act + GDPR; medium on Stripe webhook security; specific liability claims flagged for lawyer review.
- **`GDPR-RIGHTS-IMPLEMENTATION.md`** — maps seven GDPR rights to current product state: Access ✅, Rectification ⏸️, Erasure ⏸️, Restrict ⏸️, Port ❌, Object ⏸️, Automated ❌.
- **`customer-data-storage.md`** — data retrieval + deletion reference. `DELETE /api/account` endpoint behavior, what cascades, how to export from Supabase/GA4/Sentry.
- **`email-audit.md`** — email provider audit. Resend (no external templates), three sender domains (`stefanie@`, `crew@`, `noreply@`).

## Rules (HARD)

- **Any change touching PII, auth, payments, or emails must be cross-checked against `LEGAL-HANGUPS.md` before shipping.**
- **Never instantiate SDK clients at module scope** (Stripe, Resend, Anthropic) — Vercel builds crash. Always inside the request handler.
- **Email content is user-facing copy** — run it through the `coaching-voice` skill before shipping.
- **New DB tables holding user data** need RLS policies that restrict `select/insert/update/delete` to `auth.uid() = user_id`. No exceptions.
- **Stripe webhook handlers MUST verify signature** via `STRIPE_WEBHOOK_SECRET`. Unverified webhooks are a HIGH risk flagged in `LEGAL-HANGUPS.md`.
- **`DELETE /api/account` must cascade properly** — see `customer-data-storage.md` for the authoritative list of tables that need cleanup.

## Currently open legal gaps

See `LEGAL-HANGUPS.md` for the full list. Summary:
- Washington My Health My Data Act compliance (HIGH)
- GDPR Port + Object + Automated decision-making rights (MEDIUM, partial)
- Stripe webhook signature verification audit (MEDIUM)
- Terms of service + Privacy policy review by lawyer (blocking real marketing launch)

---

Back to root: [CLAUDE.md](../CLAUDE.md)
