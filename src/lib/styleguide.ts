/**
 * ═══════════════════════════════════════════════════════════════
 *  MINDCRAFT NINJA — BRAND STYLEGUIDE
 *  All Minds on Deck LLC
 * ═══════════════════════════════════════════════════════════════
 *
 *  Option E extended: Dark-first, plum + coral, warm neutral typography.
 *  This file documents every design decision in the codebase.
 *  Import design tokens from theme.ts — this file is reference only.
 *
 *  Design system: inline React.CSSProperties (no CSS modules, no Tailwind)
 *  Animation: Framer Motion on homepage, CSS transitions on app pages
 *
 * ═══════════════════════════════════════════════════════════════
 */

// ── 1. COLOR PALETTE ──
//
// Dark-first palette — plum + coral accents, warm neutral typography.
//
// Backgrounds (darkest → lightest, neutral gray):
//   bgDeep (#18181C): page background, deepest layer
//   bgRecessed (#26262C): bottom nav tiles, subtle containers
//   bgInput (#28282E): text inputs, recessed fields
//   bgSurface (#333339): cards, panels, main content areas
//   bgElevated (#3E3E46): active nav, hover states, popovers
//
// Text (brightest → dimmest, all WCAG AA on bg-deep and bg-surface):
//   textPrimary (#E4DDE2): headings, primary content
//   textSecondary (#B5ADB6): subtitles, labels, nav links
//   textBody (#D0C9CF): body text on cards (goals, content)
//   textMuted (#99929B): section labels, hints, metadata
//
// Accent — Coral (action + progress):
//   coralLight (#F4B5A9): hover highlights, light accents
//   coral (#E09585): primary buttons, active states, progress indicators
//   coralPressed (#B56E5E): pressed/active button state
//   coralOnDark (#6B3F37): coral text on dark backgrounds
//   coralWash (rgba(224,149,133,0.12)): subtle coral tint backgrounds
//
// Accent — Plum (depth + reflection):
//   plumLight (#B08DAD): secondary accents, tags
//   plum (#7B5278): secondary buttons, section accents
//   plumPressed (#5C3D5A): pressed/active secondary state
//   plumDeep (#3D2840): deep accent backgrounds
//   plumWash (rgba(123,82,120,0.15)): subtle plum tint backgrounds
//
// Borders:
//   borderSubtle (#2C2C30): nav dividers, section separators
//   borderDefault (#44444C): card dividers, input borders
//
// Semantic:
//   success (#6AB282 / wash 0.12): completed states, check marks
//   warning (#D6B65D / wash 0.12): pending states, caution indicators
//   error (#D25858 / wash 0.12): error states, destructive actions
//   Always pair with a text label or icon — never rely on colour alone.
//
// Modality colors (ExerciseCard badges):
//   cognitive: plumWash bg / plumLight text
//   somatic: coralWash bg / coralLight text
//   relational: plumDeep bg / plumLight text
//   integrative: success with opacity / success text
//   systems: bgElevated bg / textSecondary text

// ── 2. TYPOGRAPHY ──
//
// Three font families:
//   body: Space Grotesk — primary UI font
//     var(--font-space-grotesk), 'Space Grotesk', -apple-system, sans-serif
//     Used for: all app pages, forms, cards, navigation
//
//   display: Sora — display/headline font
//     var(--font-sora), 'Sora', -apple-system, sans-serif
//     Used for: homepage section headings, hero text
//
//   bodyAlt: DM Sans — secondary body font
//     var(--font-dm-sans), 'DM Sans', -apple-system, sans-serif
//     Used for: homepage body text, descriptions
//
// Type Scale:
//   Hero headline: 56px, fontWeight 800, display font, lineHeight 1.1
//   Section heading: 36-40px, fontWeight 700, display font
//   Page heading (h1): 24-26px, fontWeight 700, body font
//   Card heading: 15-16px, fontWeight 600, body font
//   Body text: 14-15px, fontWeight 400, lineHeight 1.6-1.7
//   Small text: 13px, lineHeight 1.5
//   Labels/badges: 10-12px, fontWeight 600-700, textTransform uppercase, letterSpacing 0.5-1
//   Metadata: 12-13px, color textMuted

// ── 3. SPACING ──
//
// Base unit: 4px
//   - 4px: tight gaps between inline elements
//   - 6px: badge/tag gaps, small margins
//   - 8px: input padding, small card padding
//   - 10px: compact button padding
//   - 12px: card gaps in grids, content separation
//   - 14px: internal card padding (tight cards)
//   - 16px: standard padding, section margins
//   - 20px: card padding, exercise card content
//   - 24px: page horizontal padding, section spacing
//   - 32px: large section margins
//   - 48px: page top padding
//   - 96px: homepage section padding

// ── 4. LAYOUT ──
//
// Page widths:
//   - Homepage: maxWidth 1120px (wide sections)
//   - Homepage narrow: maxWidth 700px (text-heavy sections)
//   - App pages: maxWidth 720px (journals, exercises, daily flow)
//   - Wide app: maxWidth 960px (dashboard grids, data views)
//
// All pages: margin "0 auto", padding "0 24px"
// App background: colors.bgDeep (#19171C)
// Homepage background: colors.bgDeep (#19171C)

// ── 5. COMPONENTS ──
//
// Cards:
//   padding: 24px (standard) or 20px (compact) or 14-16px (list items)
//   backgroundColor: bgSurface (#272330)
//   borderRadius: 12px
//   border: 1px solid borderDefault (#3A3442)
//   boxShadow: 0 1px 3px rgba(0,0,0,0.2)
//
// Buttons:
//   Primary:
//     padding: 12px 28px (standard) or 10px 24px (compact)
//     fontSize: 14-15px, fontWeight 600
//     color: bgSurface, backgroundColor: coral
//     borderRadius: 8px
//     transition: background-color 0.15s
//     Hover: backgroundColor coralPressed
//     Disabled: backgroundColor textDisabled, cursor not-allowed
//
//   Secondary:
//     Same sizing as primary
//     color: coral, backgroundColor: bgSurface
//     border: 2px solid coral
//
//   Ghost:
//     padding: 8px 16px
//     fontSize: 13px
//     color: textMuted, border: 1px solid borderSubtle
//     borderRadius: 6px
//
// Inputs:
//   padding: 10-14px
//   fontSize: 15px
//   color: textPrimary
//   backgroundColor: bgRecessed
//   border: 1px solid borderDefault
//   borderRadius: 8px
//   outline: none
//   fontFamily: body font
//   Focus: borderColor coral
//
// Textareas:
//   Same as inputs plus:
//   minHeight: 120-200px
//   lineHeight: 1.6-1.7
//   resize: vertical
//
// Tags/Badges:
//   padding: 4px 10-12px (tags) or 2-3px 6-8px (tiny badges)
//   fontSize: 11-12px (tiny) or 12-13px (tags)
//   borderRadius: 12-16px (pills) or 4px (status badges)
//   Background + text color pairs from palette

// ── 6. BORDERS & RADIUSES ──
//
// borderRadius:
//   4px: tiny badges, status indicators
//   6px: ghost buttons, small inputs
//   8px: buttons, inputs, textareas, inner containers
//   12px: cards, goal cards, exercise cards
//   16px: large cards (floating panel, homepage cards), pills
//   50%: circles (step indicators, avatars)
//
// Borders:
//   Default: 1px solid borderDefault (#44444C)
//   Subtle: 1px solid borderSubtle (#2C2C30)
//   Active/selected: 2px solid coral
//   Completed: 2px solid success
//   Warning: 2px solid warning
//   Left accent: 3px solid coral (blockquotes, patterns)

// ── 7. TRANSITIONS & ANIMATIONS ──
//
// Standard: transition 0.15s for colors, backgrounds, borders
// All states: transition "all 0.15s" for multi-property changes
// Opacity: transition 0.3s for step visibility
// Homepage: Framer Motion with easing [0.22, 1, 0.36, 1]
// Spinner: @keyframes spin { to { transform: rotate(360deg) } }
//   border: 3px solid borderDefault, borderTopColor: coral

// ── 8. SHADOWS ──
//
// Cards: 0 1px 3px rgba(0,0,0,0.2) — subtle dark shadow
// Floating panel: 0 8px 32px rgba(0,0,0,0.4) — prominent
// FAB button: 0 4px 12px rgba(0,0,0,0.3) — medium

// ── 9. INTERACTIVE STATES ──
//
// Hover (homepage): transform scale(1.02-1.05), boxShadow increase
// Hover (app): backgroundColor change (bgElevated), borderColor change
// Disabled: backgroundColor textDisabled, cursor not-allowed
// Active/Selected: coral border, coralWash background
// Completed: success border, success with opacity background
// Focus: no visible outline (outline: none on all inputs), borderColor coral

// ── 10. PAGE PATTERNS ──
//
// App page structure:
//   <div style={{ backgroundColor: bgDeep, minHeight: "100vh", fontFamily: body }}>
//     <Nav />
//     <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
//       {/* page content */}
//     </div>
//   </div>
//
// Loading state: centered text, color textMuted
// Empty state: heading + description + CTA button
// Error state: error color text or alert
//
// Section labels:
//   fontSize: 13px
//   fontWeight: 600
//   color: textMuted
//   textTransform: uppercase
//   letterSpacing: 0.5px
//   marginBottom: 8-10px

// ── 11. VOICE & TONE ──
//
// Direct, warm, specific. Not clinical, not motivational.
// Never: "Great job!", "You've got this!", "Amazing progress!"
// Instead: "That landed differently than you expected." / "There's something interesting in how you described that."
// Labels: action-oriented, lowercase ("Save & Continue", "Complete Exercise", "Start Session")
// Feedback: specific and factual, not evaluative

export {};
