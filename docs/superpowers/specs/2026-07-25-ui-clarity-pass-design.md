# UI Clarity Pass Design (#19)

**Status:** approved, ready for implementation planning.
**Governs:** `prototype/year1.html` only. Does not touch `content/events/*.yaml` (that library isn't wired into the prototype yet) or the guided-tutorial system built in #20.

## Problem

Playtest feedback: "the game is confusing to play... I'm unsure what each button does." The prototype speaks entirely in the almanac voice (Sow it so, Lay it in, Close the day-book), which sets tone but hides function. The ledger stats (Larder, Fuel, Seed, Regard) are unexplained, and it isn't always obvious what a choice costs or why a button is disabled. `docs/gameplay-flow.md` §8 catalogues the exact gaps this design closes.

**Non-goal:** this is a legibility layer, not a visual redesign. The Illustrated Almanac look and voice stay as they are.

## Relationship to the existing tutorial (#20)

The prototype already has a first-use `tip()` system from the guided tutorial, but it only fires for players who opt into "guided mode" — a player who declines gets zero legibility help today. Everything in this design is **always available, on-demand, independent of guided-mode status.** The existing `tip()` proactive-hint system is untouched and stays as an additional, separate layer for opted-in players.

## 1. Ledger stat explanations

The four ledger cells (Coin, Larder, Fuel, Seed) become tappable. Tapping one opens a small popover with its plain-English meaning, sourced from `gameplay-flow.md` §2.2:

- **Coin (marks):** money. Buys seed, coal, farmhands, fences.
- **Larder (food):** stored food. The household eats it every season; run out in winter and someone dies.
- **Fuel:** wood/coal laid by. Only spent in winter; too little and the frailest freezes.
- **Seed:** seed stock. Spent first when planting, before coin.

Implementation: reuse the existing lightweight overlay/popover pattern already used for the roster and Ask Reuben panels (`openOverlay`), not the guided-only `tip()` mechanism. Available regardless of `tutGuided()`.

## 2. Contextual masthead help toggle

A small "?" affordance sits next to the existing theme toggle (`☾ night` / `☀ day`) in the masthead. Tapping it opens the same popover pattern, showing a short explanation of the **current screen type only**, sourced from `gameplay-flow.md` §4's screen catalogue:

- Brief/scene card, Event/beat card, Planting, Assignment, Market, Winter provisioning, Dusk report, Year-end.

Each screen-render function (`plantStep`, `assignStep`, `marketStep`, `provisionStep`, `duskStep`, the generic `card()` for briefs/events, the year-end screen) is tagged with a `screenType` key at render time. A `SCREEN_HELP` lookup table maps each key to its one-line explanation. The toggle reads whatever `screenType` is currently active and shows the matching text.

## 3. Choice buttons: dual-label, cost/benefit tag, disabled reason

The choice-rendering helper (currently ~line 710, the code that turns a `{t, sub, disabled, go}` object into a `<button>`) gains two new optional fields:

- **`tag`** — a short structured string (e.g. `−15m`, `+8 seed`, `−2 morale`) rendered as a small monospace badge alongside the existing prose `sub` line. For choices with a clear resource cost or gain.
- **`why`** — shown in place of (or appended to) the `sub` line specifically when the choice is `disabled` (e.g. "needs 15m, have 8"). Replaces today's silent grey-out.

Then an authoring pass touches all ~45-54 existing choice definitions across the file (scripted beats, the systemic event pool, planting, market, assignment, provisioning):

- Every choice gets a `sub` (plain-language effect) if it doesn't already have one.
- Every choice with a resource cost/gain gets a `tag`.
- Every choice that can be `disabled` gets a `why`.
- **Primary advance buttons** (Sow it so, Close the day-book, Lay it in, Turn the season →, Toward winter →, Go on, Begin, Face it, etc.) all get a permanent plain-language `sub`, even the self-evident ones, per the issue's "use it everywhere" instruction. E.g.:
  - "Sow it so" → *confirm the planting; pay seed then coin*
  - "Close the day-book" → *apply every larder/sell choice*
  - "Lay it in" → *confirm the winter provisioning purchase*

## 4. Interactive-element polish (planting, market, provisioning)

These screens already have decent affordances: crop chips grey out and show seed cost when unaffordable; market larder/sell toggles highlight the active choice and show live projected gain; provisioning steppers show live cost per unit. This section is a light pass, not new interaction patterns:

- Apply the same `tag`/`why` treatment for consistency (e.g. a disabled crop chip explains "needs 6m, have 3" instead of just greying out).
- Confirm no genuinely-interactive element lacks a visible selected/unselected/disabled state (spot-check during implementation; no redesign expected).

## Out of scope

- The `content/events/*.yaml` library (117 cards) — not loaded by this prototype.
- The guided-tutorial `tip()` system (#20) — left as-is, runs alongside this work.
- Any visual/layout redesign of the almanac look.

## Cross-references

- Operational spec this design implements against: `docs/gameplay-flow.md` (especially §2.2, §4, §7, §8).
- Voice rules to preserve in all new copy: `docs/style-guide.md` (including D-037, no dash punctuation).
- Source issue: GitHub #19, milestone "Prototype v0.2: Onboarding & Imagery."
