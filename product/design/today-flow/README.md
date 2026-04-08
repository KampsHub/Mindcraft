# Today Flow Design — Index

Design spec for the "Today" landing page in Mindcraft. Split from the original 971-line `docs/today-flow-design.md` into sectioned files for easier navigation and progressive loading.

## Sections

- **[00-overview.md](./00-overview.md)** — Intro + Section 1: What the personal coaching flow does that the product does not (Thread mechanic, backward-looking prompts, meditation recommendation, exercise carry-forward, voice integrity, /processdone, pattern challenges, parts check-ins)
- **[01-product-changes.md](./01-product-changes.md)** — Section 2: Specific product changes needed (Thread in Step 1, enriched journal prompts, coaching questions + reframe + pattern challenge in Step 3, meditation recommendation, daily summary extension for thread seeding)
- **[02-thread-and-carry-forward.md](./02-thread-and-carry-forward.md)** — Sections 3 + 4: Thread implementation spec (data pipeline, query changes, prompt construction) + coaching question and commitment carry-forward
- **[03-voice-quality-parts.md](./03-voice-quality-parts.md)** — Sections 5 + 6 + 7: Voice integrity rules, exercise description quality, parts check-in system
- **[04-priority-dataflow-principles.md](./04-priority-dataflow-principles.md)** — Sections 8 + 9 + 10 + 11: Implementation priority, data flow diagram, key principles, what the product already does well

## How to use

When working on any change that touches the Today page or the daily session flow, load the relevant section. For the full end-to-end design, read in order 00 → 04.
