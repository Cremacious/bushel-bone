# Desktop/Web Layout Split Design (#35)

**Status:** approved, ready for implementation.
**Governs:** `prototype/year1.html` only. Does not touch game logic, content, or the mobile layout.

## Problem

The prototype's layout was designed around a phone screen and used unchanged at every viewport width. On desktop/web, playtest feedback called it "long and awkwardly vertical," a stretched phone layout rather than something that uses a wider screen. Most desktop and laptop monitors are 16:9, so there is real horizontal room the current layout never uses.

**Non-goal:** this is not a visual redesign of any individual screen. The Illustrated Almanac look, the imagery layer (#21 to #23), and every screen-builder function (`plantStep`, `assignStep`, `marketStep`, etc.) are untouched. Mobile is untouched at every width below the breakpoint.

## Chosen direction

Of three candidates reviewed with Chris (a constrained centered column, a persistent sidebar, and a plate/stage side-by-side split), the **plate/stage split** was chosen: it makes direct use of a wide monitor's horizontal space rather than just capping width, and it keeps the almanac's existing stat-bar-on-top identity intact.

## Architecture

`.plate`, `.ledger`, `.household`, and `#stage` are already flat sibling elements under the same wrapper (confirmed in the current markup, `prototype/year1.html` around line 393 to 408). This means the split is achievable with **CSS only**, no JavaScript, no DOM restructuring, no changes to any render function. A CSS Grid, gated behind a `@media (min-width: 1100px)` query, reassigns each element's `grid-area` without touching source order:

```
grid-template-areas:
  "ledger    ledger"
  "household household"
  "plate     stage";
grid-template-columns: 40% 60%;
```

- **Breakpoint: 1100px.** Below it, the grid rule does not apply and today's stacked layout renders exactly as it does now. This is the standard laptop/desktop width; smaller laptops and landscape tablets keep the familiar stacked layout rather than getting a cramped split.
- **Proportions: roughly 40/60, stage favored.** The plate becomes a strong visual anchor rather than an equal partner; the stage column gets the extra width since it carries the variable-length content, body prose and choice buttons, some scripted beats and systemic events run 3 to 4 choices deep.
- **`.ledger` and `.household` span both columns**, unchanged internally. They stay exactly as built today; only their position (spanning above the split, not stacked above `.plate` alone) changes.
- **Long content:** the plate and stage grid cells grow together, row height follows whichever is taller. No independent scroll region, no sticky plate, for this pass. If a specific pairing looks bad in testing (a very short event next to a very tall plate, or vice versa), that is a follow up, not a blocker for this design.
- **The Ask Reuben bar and the footer stay full width, outside the grid**, exactly as today. Ask Reuben is a persistent global control, not tied to either column.

## Out of scope

- **Overlays** (the roster panel, Ask Reuben's panel, tutorial tip modals from #33) are unchanged: centered over the whole viewport via the existing `openOverlay()`/`.overlay-panel` mechanism, regardless of the grid split underneath. Not widened, not repositioned, not split.
- No change to any screen's internal composition (how `plantStep()`, `marketStep()`, etc. build their HTML). The grid only repositions the four top-level containers.
- No new breakpoints beyond the single 1100px threshold. A three-tier (phone/tablet/desktop) system is not part of this pass.

## Verification note

The existing Vitest + jsdom test suite (`prototype/tests/*.mjs`) does not perform real CSS layout, jsdom does not compute grid/flex geometry, so this change cannot be verified by the automated suite. Verification is manual: load `prototype/year1.html` in a real browser and resize across the 1100px breakpoint, checking the stacked-to-split transition and at least one long-choice-list screen (e.g. Crows in the Corn, or a Winter event) at desktop width.

## Cross-references

- Source issue: GitHub #35, milestone "Prototype v0.2: Onboarding & Imagery."
- Imagery layer this design repositions but does not alter: issues #21 to #23.
- Voice/content rules are unaffected; this is a layout-only change.
