# Design System Strategy: Oceanic Precision

**Status:** Adopted 2026-04-08. Supersedes the previous "warm Headspace/Brilliant/Linear" aesthetic. Existing UI needs migration — tracked in `product/plans/TODO-REMAINING.md`.

---

## 1. Overview & Creative North Star: "The Nautical Monolith"

This design system is built upon the tension between the vast, dark unknown of the deep ocean and the sharp, surgical precision of maritime instruments. We are moving away from the "friendly SaaS" aesthetic toward a **High-End Editorial** experience.

The Creative North Star is **The Nautical Monolith**: a philosophy that prioritizes structural permanence, extreme legibility, and architectural depth. We break the "template" look by using a strictly sharp-edged geometry (0px radius) and intentional asymmetry. Large-scale typography serves as a structural element, not just content, creating a layout that feels curated rather than generated.

## 2. Colors & Tonal Depth

The palette utilizes high-contrast accents against a deep, tiered neutral base. We do not use color for decoration; we use it for orientation and emphasis.

### The "No-Line" Rule

**Standard 1px borders are strictly prohibited for sectioning.** To define space, designers must use background color shifts. A section sitting on `surface` (#131313) should be differentiated by a transition to `surface-container-low` (#1c1b1b) or `surface-container-highest` (#353534). This creates a sophisticated, "carved" look rather than a "sketched" look.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical, stacked obsidian sheets.

- **Base Layer:** `surface` (#131313)
- **Sunken Elements (Inputs/Inactive zones):** `surface-container-lowest` (#0e0e0e)
- **Elevated Content (Cards/Modules):** `surface-container-high` (#2a2a2a)
- **High-Priority Overlays:** `surface-bright` (#3a3939)

### The "Glass & Gradient" Rule

To prevent the dark theme from feeling "flat" or "muddy," use **Glassmorphism** for floating headers or navigation rails. Apply `surface` with 80% opacity and a `backdrop-blur` of 20px.

- **Signature Texture:** Use a subtle linear gradient on Primary CTAs — transitioning from `primary` (#ffe9b0) at the top left to `primary_container` (#f2ca50) at the bottom right. This adds a "metallic" glint consistent with high-end instrumentation.

## 3. Typography: The Manrope Hierarchy

Manrope's geometric rhythm is our primary brand voice. In this system, typography *is* the UI.

- **Display (lg/md):** Reserved for hero moments. Use `tertiary` (#FFFFFF) with tight letter-spacing (-0.02em). These should feel like headlines in a premium architectural magazine.
- **Headlines:** Use for section titles. Ensure they have significant breathing room (top margin 2x bottom margin) to create an editorial flow.
- **Body (lg/md):** All body text must use `tertiary` (#FFFFFF) for maximum readability. Never use grey for body copy; if emphasis is needed, use `on_surface_variant` (#d0c5af) only for low-priority metadata.
- **Labels:** Use `label-md` in All Caps with +0.05em tracking for a technical, "instrument-panel" feel.

## 4. Elevation & Depth

We eschew traditional drop shadows for **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-low` element should host `surface-container-high` children. The contrast in hex values provides all the separation required.
- **Ambient Shadows:** If a floating state (like a Modal) is required, use an ultra-diffused shadow: `box-shadow: 0px 24px 48px rgba(0, 0, 0, 0.5)`. The shadow must feel like a natural occlusion of light, not a glow.
- **The Ghost Border:** If accessibility requires a stroke (e.g., in high-glare environments), use `outline_variant` (#4d4635) at 20% opacity. Forbid 100% opaque borders; they break the "monolith" illusion.

## 5. Components

### Buttons

- **Primary:** `primary_container` (#f2ca50) background, `on_primary_container` (#6b5500) text. 0px border-radius. Hover state: `primary` (#ffe9b0).
- **Secondary:** `secondary_container` (#2e4d5f) background, `on_secondary_container` (#9dbcd3) text. Sharp corners.
- **Tertiary (Ghost):** No background. `tertiary` (#FFFFFF) text with a 1px `outline_variant` at 20% opacity.

### Input Fields

- **Base:** `surface_container_lowest` (#0e0e0e) background.
- **Focus State:** A 2px bottom-border only of `primary` (#f2ca50). Do not wrap the entire input in a colored border.
- **Label:** `tertiary` (#FFFFFF) at 80% opacity, positioned above the field.

### Cards & Lists

- **Structure:** No dividers. Use `80px` of vertical white space to separate major list categories.
- **Interaction:** On hover, a card should shift from `surface-container-low` to `surface-container-high`.

### Signature Component: The "Data Rail"

A vertical, high-contrast sidebar or edge-element using `secondary` (#8FAEC4) to house "Precision" metadata (timestamps, coordinates, or status). This reinforces the nautical/technical theme.

## 6. Do's and Don'ts

### Do

- **Use Asymmetry:** Align text to the left but allow imagery or data visualizations to bleed off the right edge of the grid.
- **Embrace Pure Black:** Use `surface-container-lowest` (#0e0e0e) for deep "void" areas to make the `primary` yellow pop.
- **Strict Sharpness:** Every corner must be 0px. Even a 2px radius ruins the "Precision" aspect of the system.

### Don't

- **Don't use Dividers:** Never use 1px lines to separate content. Use space or tonal shifts.
- **Don't use Grey for Body Text:** Neutralizing body text to grey kills the high-contrast "Oceanic" intent. Stick to `tertiary` (#FFFFFF).
- **Don't use standard Shadows:** Avoid the "floating card" look common in Material Design. Elements should feel like they are part of a solid, carved structure.

---

## Token reference (for src/lib/theme.ts migration)

| Token | Hex | Usage |
|---|---|---|
| `surface` | #131313 | Base layer |
| `surface-container-lowest` | #0e0e0e | Sunken (inputs, inactive, void) |
| `surface-container-low` | #1c1b1b | First stacked card layer |
| `surface-container-high` | #2a2a2a | Elevated content (cards, modules) |
| `surface-container-highest` | #353534 | Highest stacked card layer |
| `surface-bright` | #3a3939 | High-priority overlays |
| `primary` | #ffe9b0 | Hover for primary CTA, CTA gradient start |
| `primary_container` | #f2ca50 | Primary CTA background, CTA gradient end |
| `on_primary_container` | #6b5500 | Text on primary CTA |
| `secondary` | #8FAEC4 | Data Rail, nautical accent |
| `secondary_container` | #2e4d5f | Secondary button background |
| `on_secondary_container` | #9dbcd3 | Text on secondary button |
| `tertiary` | #FFFFFF | All body text, display text, ghost button text |
| `on_surface_variant` | #d0c5af | Low-priority metadata ONLY (never body) |
| `outline_variant` | #4d4635 | Ghost borders at 20% opacity only |

---

Back to: [content/CLAUDE.md](./CLAUDE.md) · [root CLAUDE.md](../CLAUDE.md)
