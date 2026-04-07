/**
 * Shared email shell — white background, black copy, ochre buttons.
 *
 * Every Mindcraft email imports helpers from this file so the visual
 * system stays consistent. Change a token here, every email picks it up.
 *
 * Design tokens:
 *   bg outer:      #F5F1E8  (warm off-white, matches site)
 *   bg card:       #FFFFFF
 *   text primary:  #18181C  (near-black)
 *   text body:     #3A3A40  (charcoal)
 *   text muted:    #6B6B72
 *   text dim:      #A0A0A8
 *   ochre primary: #C4943A  (CTA buttons, accents)
 *   ochre wash:    #FAF3E2
 *   plum:          #7B9AAD  (secondary accent)
 *   border subtle: #EAE5D9
 *   border default:#D8D2C5
 *
 * Typography:
 *   Headlines:  Georgia serif (editorial, warm)
 *   Eyebrows:   Display sans (small caps, ochre, letter-spaced)
 *   Body:       System sans
 */

export const EMAIL_COLORS = {
  bgOuter: "#F5F1E8",
  bgCard: "#FFFFFF",
  textPrimary: "#18181C",
  textBody: "#3A3A40",
  textMuted: "#6B6B72",
  textDim: "#A0A0A8",
  ochre: "#C4943A",
  ochreWash: "#FAF3E2",
  plum: "#7B9AAD",
  borderSubtle: "#EAE5D9",
  borderDefault: "#D8D2C5",
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SCRIPT = "'Snell Roundhand', 'Apple Chancery', 'Lucida Handwriting', Georgia, cursive";

// ─────────────────────────────────────────────────────────────────────────
// Inline SVG icons — Feather/Lucide style, 22px, 1.7px stroke, ochre
// ─────────────────────────────────────────────────────────────────────────

export const ICONS = {
  reflection: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  gift: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
  ask: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  coach: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.plum}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  welcome: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
  door: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><line x1="3" y1="21" x2="21" y2="21"/><circle cx="15" cy="13" r="0.5" fill="${EMAIL_COLORS.ochre}"/></svg>`,
  pause: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><circle cx="12" cy="12" r="10"/><line x1="10" y1="9" x2="10" y2="15"/><line x1="14" y1="9" x2="14" y2="15"/></svg>`,
  question: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  reward: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  inbox: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  application: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  list: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  chart: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  trash: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  shopping: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${EMAIL_COLORS.ochre}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
};

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] as string));
}

// ─────────────────────────────────────────────────────────────────────────
// Building blocks
// ─────────────────────────────────────────────────────────────────────────

/** Primary CTA button — ochre fill, black text, rounded rectangle */
export function primaryButton({ href, label }: { href: string; label: string }): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 28px;background-color:${EMAIL_COLORS.ochre};color:#18181C;font-family:${SANS};font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;letter-spacing:0.01em;">${label}</a>`;
}

/** Secondary CTA button — outlined, plum or ochre */
export function secondaryButton({ href, label, color = EMAIL_COLORS.plum }: { href: string; label: string; color?: string }): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background-color:transparent;border:1.5px solid ${color};color:${color};font-family:${SANS};font-weight:700;font-size:13px;text-decoration:none;border-radius:10px;letter-spacing:0.01em;">${label}</a>`;
}

/** Eyebrow tag — small ochre uppercase label with bullet dot */
export function eyebrow(label: string, color: string = EMAIL_COLORS.ochre): string {
  return `<p style="color:${color};font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 12px 0;">
    <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background-color:${color};vertical-align:middle;margin-right:8px;margin-top:-2px;"></span>${label}
  </p>`;
}

/** Centered ornament divider with dot */
export function divider(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:36px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="height:1px;width:60px;background:linear-gradient(90deg,transparent,${EMAIL_COLORS.borderDefault});font-size:0;line-height:0;">&nbsp;</td>
            <td style="padding:0 14px;">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${EMAIL_COLORS.ochre};"></span>
            </td>
            <td style="height:1px;width:60px;background:linear-gradient(90deg,${EMAIL_COLORS.borderDefault},transparent);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

/**
 * Section block — icon + eyebrow + headline + body + optional CTA
 * The icon sits to the left of the text in a 30px column.
 */
export function section({
  icon,
  tag,
  headline,
  body,
  cta,
}: {
  icon: string;
  tag: string;
  headline: string;
  body: string;
  cta?: { href: string; label: string };
}): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="vertical-align:top;padding-right:14px;width:30px;">
        ${icon}
      </td>
      <td style="vertical-align:top;">
        ${eyebrow(tag)}
        <h2 style="color:${EMAIL_COLORS.textPrimary};font-family:${SERIF};font-size:21px;font-weight:700;line-height:1.3;margin:0 0 12px 0;letter-spacing:-0.015em;">
          ${headline}
        </h2>
        <div style="color:${EMAIL_COLORS.textBody};font-family:${SANS};font-size:14px;line-height:1.7;margin:0 0 ${cta ? "20" : "0"}px 0;">
          ${body}
        </div>
        ${cta ? primaryButton(cta) : ""}
      </td>
    </tr>
  </table>`;
}

/**
 * Hero block at the top of the email.
 * - Eyebrow tag (centered, ochre)
 * - Headline in serif (centered)
 * - Optional intro paragraph (centered, max 440px)
 * - Optional hero stat (large serif number above the headline)
 */
export function hero({
  tag,
  headline,
  intro,
  stat,
  statLabel,
}: {
  tag: string;
  headline: string;
  intro?: string;
  stat?: string;
  statLabel?: string;
}): string {
  return `<div style="text-align:center;padding:48px 36px 36px;background:linear-gradient(180deg,${EMAIL_COLORS.ochreWash} 0%,#FFFFFF 100%);border-bottom:1px solid ${EMAIL_COLORS.borderSubtle};">
    ${stat ? `
      <div style="font-family:${SERIF};font-size:64px;font-weight:800;color:${EMAIL_COLORS.ochre};line-height:1;letter-spacing:-0.04em;margin:0 0 4px 0;">
        ${stat}
      </div>
      ${statLabel ? `<p style="color:${EMAIL_COLORS.textMuted};font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 24px 0;">${statLabel}</p>` : ""}
    ` : ""}
    <p style="color:${EMAIL_COLORS.ochre};font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;margin:0 0 14px 0;">
      ${tag}
    </p>
    <h1 style="color:${EMAIL_COLORS.textPrimary};font-family:${SERIF};font-size:32px;line-height:1.1;font-weight:800;margin:0 0 ${intro ? "18" : "0"}px 0;letter-spacing:-0.025em;">
      ${headline}
    </h1>
    ${intro ? `<p style="color:${EMAIL_COLORS.textBody};font-family:${SANS};font-size:16px;line-height:1.7;margin:0 auto;max-width:460px;">${intro}</p>` : ""}
  </div>`;
}

/**
 * Personal sign-off block — script "Stefanie" + role + optional reply note
 */
export function signoff({
  name = "Stefanie",
  role = "Founder, Mindcraft",
  replyNote = "Hit reply. This lands in my actual inbox.",
}: {
  name?: string;
  role?: string;
  replyNote?: string;
} = {}): string {
  return `<div style="margin-top:40px;">
    <p style="color:${EMAIL_COLORS.ochre};font-family:${SCRIPT};font-size:36px;font-weight:400;font-style:italic;line-height:1;margin:0 0 6px 0;letter-spacing:-0.01em;">
      ${name}
    </p>
    <p style="color:${EMAIL_COLORS.textMuted};font-family:${SANS};font-size:11px;margin:0;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">
      ${role}
    </p>
    ${replyNote ? `<p style="color:${EMAIL_COLORS.textMuted};font-family:${SERIF};font-size:13px;font-style:italic;line-height:1.55;margin:22px 0 0 0;">${replyNote}</p>` : ""}
  </div>`;
}

/**
 * Sign-off variant for "team" voice (re-engage exit, etc.)
 */
export function teamSignoff({ replyNote }: { replyNote?: string } = {}): string {
  return `<div style="margin-top:36px;">
    <p style="color:${EMAIL_COLORS.ochre};font-family:${SCRIPT};font-size:30px;font-weight:400;font-style:italic;line-height:1.1;margin:0 0 6px 0;letter-spacing:-0.01em;">
      Stefanie &amp; the Mindcraft team
    </p>
    ${replyNote ? `<p style="color:${EMAIL_COLORS.textMuted};font-family:${SERIF};font-size:13px;font-style:italic;line-height:1.55;margin:18px 0 0 0;">${replyNote}</p>` : ""}
  </div>`;
}

/**
 * Data privacy footer — used at the bottom of all user-facing emails
 */
export function dataFooter(deleteUrl: string): string {
  return `<div style="border-top:1px solid ${EMAIL_COLORS.borderSubtle};margin-top:40px;padding-top:24px;">
    <p style="color:${EMAIL_COLORS.textMuted};font-family:${SANS};font-size:12px;line-height:1.7;margin:0 0 10px 0;">
      <strong style="color:${EMAIL_COLORS.textBody};">Your data is yours.</strong> We keep your journal entries, exercise responses, and reflection so you can come back to them anytime. If you&rsquo;d rather we didn&rsquo;t, you can request deletion from your account settings &mdash; we purge everything within 30 days.
    </p>
    <a href="${deleteUrl}" style="color:${EMAIL_COLORS.textMuted};font-family:${SANS};font-size:12px;text-decoration:underline;">
      Delete my account and data &rarr;
    </a>
  </div>`;
}

/**
 * STOP-out footer (for re-engage emails — no data section, just a STOP line)
 */
export function stopFooter(): string {
  return `<p style="color:${EMAIL_COLORS.textMuted};font-family:${SERIF};font-size:11px;font-style:italic;line-height:1.55;margin:24px 0 0 0;">
    Reply STOP to opt out of these check-ins.
  </p>`;
}

// ─────────────────────────────────────────────────────────────────────────
// Outer shell — wraps every email
// ─────────────────────────────────────────────────────────────────────────

export type EmailShellOpts = {
  /** Used as <title> and surfaces in some clients */
  title: string;
  /** Inner HTML — typically hero + sections + signoff */
  body: string;
  /** Padding for the body section. Default 48/40. */
  bodyPadding?: string;
  /** Skip the brand mark above the card. Default false. */
  hideBrandMark?: boolean;
};

/**
 * Wraps the inner email body in the standard outer shell:
 * - Warm off-white outer background
 * - Optional brand wordmark above the card
 * - White card with subtle shadow + rounded corners
 * - "Mindcraft by All Minds on Deck LLC" plain footer below the card
 */
export function emailShell({ title, body, bodyPadding, hideBrandMark }: EmailShellOpts): string {
  const padding = bodyPadding || "48px 40px 40px";
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="background-color:${EMAIL_COLORS.bgOuter};margin:0;padding:40px 20px;font-family:${SANS};">

  ${hideBrandMark ? "" : `
  <div style="max-width:600px;margin:0 auto 16px;text-align:center;">
    <span style="font-family:${SERIF};font-size:13px;font-weight:600;color:${EMAIL_COLORS.textMuted};letter-spacing:0.04em;">
      mindcraft
    </span>
  </div>
  `}

  <div style="max-width:600px;margin:0 auto;background-color:${EMAIL_COLORS.bgCard};border-radius:20px;padding:0;color:${EMAIL_COLORS.textPrimary};box-shadow:0 12px 40px rgba(24,24,28,0.08),0 2px 6px rgba(24,24,28,0.04);overflow:hidden;border:1px solid ${EMAIL_COLORS.borderSubtle};">
    ${body.includes("<!--HERO_PRE_PADDING-->") ? body : `<div style="padding:${padding};">${body}</div>`}
  </div>

  <p style="color:${EMAIL_COLORS.textDim};font-family:${SANS};font-size:11px;text-align:center;margin:24px 0 0 0;">
    Mindcraft by All Minds on Deck LLC
  </p>
</body>
</html>`;
}

/**
 * Convenience: when an email starts with a hero block (which has its own
 * full-width padding), the body padding shouldn't apply to the whole card.
 * Use this to compose a hero + padded body content.
 */
export function heroWithBody({ heroHtml, bodyHtml, bodyPadding }: { heroHtml: string; bodyHtml: string; bodyPadding?: string }): string {
  const padding = bodyPadding || "48px 40px 40px";
  return `<!--HERO_PRE_PADDING-->${heroHtml}<div style="padding:${padding};">${bodyHtml}</div>`;
}
