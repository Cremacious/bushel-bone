# Fixed-Size Desktop Canvas Design (#47, desktop phase)

**Status:** approved, ready for implementation.
**Governs:** `prototype/year1.html`'s desktop layout (viewport width 1100px and up) only. Mobile is a separate, later phase of #47; nothing below 1100px changes in this pass.

## Problem

The prototype is a normal scrolling web page: total page height grows or shrinks depending on how much text a given card has. That is fine for a browser tab, but the target platforms are different: a Steam PC build (packaged with Electron, per Chris) running fullscreen or fullscreen-windowed should not reflow height based on content, and should look intentional on any monitor size, not just whatever happened to fit today's fluid layout.

## Chosen direction

A **fixed-size reference canvas that scales uniformly to fit the real window**, the standard approach for HTML5 games that need to look consistent across arbitrary screen sizes. Two separate reference layouts will eventually exist (desktop 16:9, mobile portrait), each scaled independently; **this pass builds the desktop one only**. Mobile stays exactly as it is today until a follow-up phase.

## Architecture

- **Reference resolution: 1920x1080** (16:9), the standard desktop/monitor target.
- **`#almanac`** (already the container `#35`'s grid lives on) becomes a fixed `width:1920px; height:1080px` at 1100px and up, replacing today's `max-width:960px` fluid sizing.
- **A JS-computed uniform scale, not a CSS media query trick.** On load and on window resize (debounced), compute `scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)`, apply it as `transform: scale(scale)` on `#almanac`, and center the scaled box within `#desk` (which already centers via flex). A window whose aspect ratio doesn't match 16:9 letterboxes (empty bars) in the excess dimension, it never distorts or crops the canvas.
- **`#stage` gets a real height instead of content-driven auto-height.** `#35`'s grid gains explicit `grid-template-rows` (`auto auto auto 1fr auto auto`, matching its six named rows): the masthead/ledger/household/askbar/footer rows size to their own content, and the platewrap+stage row absorbs all remaining canvas height as `1fr`. `#stage` gets `overflow-y:auto` and `min-height:0` (the standard CSS Grid fix needed for a flex/grid child to actually be allowed to scroll instead of forcing its container to grow past the fixed canvas). This directly implements the earlier-agreed behavior: the frame (masthead, ledger, plate, ask bar) stays fixed and fully visible, and only the card's own text/choices area scrolls when it overflows.
- **Below 1100px, none of this applies.** The existing mobile stacked layout, with normal page scrolling, is completely untouched. `#almanac` only gets `width/height/transform` when the 1100px breakpoint's desktop mode is active.

## Honest scope note on visual sizing

The existing `#35`/`#36` desktop CSS values (font sizes, padding, the ~960px-tuned proportions) were built for a fluid ~960px-wide space, not a true 1920px canvas. Doubling the canvas width without adjusting those values would make everything look sparse and small at the reference resolution, and after the scale-down transform fits a typical ~1600px browser window, the net effect would be smaller than today's design, the opposite of "make the desktop UI a bit larger" from earlier in this session.

This pass does **one reasonable proportional pass** (roughly 2x) on the desktop-specific values already established in the `#35`/`#36` media query blocks, since those are the ones with known, reasoned-about sizes. It does not promise pixel-perfect results: every other visual change this session has taken 2 to 4 rounds of feedback to land right, and sizing a canvas that can't be test-rendered without a real browser is no different. Expect a follow-up visual pass once this is checked live.

## Out of scope

- The mobile fixed-canvas phase (1080x1920 reference, its own scaling), tracked as a follow-up under the same #47 issue.
- Any change to screen-builder functions (`plantStep`, `assignStep`, `marketStep`, etc.) or game logic. This is a layout/CSS/scaling change only.
- Electron packaging itself (window creation, native fullscreen, build tooling), that's a separate, later concern once the in-page scaling behaves correctly in an ordinary browser tab.
- Overlay chrome (roster, Ask Reuben, tutorial tips): stays centered over the whole viewport via the existing mechanism, unaffected by the canvas transform (it's a `position:fixed` layer, which escapes the transformed `#almanac`'s local coordinate space, this is checked during implementation to confirm overlays still render centered and full-size, not scaled or mispositioned by `#almanac`'s transform).

## Verification note

Cannot be verified by the existing Vitest + jsdom suite (jsdom does not compute real layout, transforms, or `window.innerWidth`/`innerHeight`-driven scaling). Verification is manual: load the page in a real browser, resize the window across a range of sizes and aspect ratios, and confirm the canvas scales uniformly, letterboxes rather than distorts on mismatched ratios, and that a long card's text/choices scroll internally while the masthead/ledger/plate/ask-bar stay fixed and visible.

## Cross-references

- Source issue: GitHub #47, milestone "Prototype v0.2: Onboarding & Imagery."
- Supersedes #35's "row grows together" assumption for the plate/stage split (that design doc already flagged this).
- Builds on the `#35` grid areas and the `#36` start-screen breakpoint, both gated at the same 1100px threshold.
