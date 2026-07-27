# Year One Tutorial Arc Design (#40)

**Status:** approved, ready for implementation.
**Governs:** `prototype/year1.html`'s systemic event pool (`SYSTEMIC`, `drawSystemic()`) only.

## Problem

Playtest feedback: choices in the systemic event pool can cost real resources ("a day's labor spent," "lose a share of that field") without the player understanding the actual mechanical scope of the cost, so a first-time player can't tell whether a choice is safe to experiment with. A research pass (see below) confirmed and quantified this.

## What the audit found

Every systemic event in `SYSTEMIC.spring/summer/fall` (`drawSystemic()` picks a flat, unweighted random event from the current season's pool, no repeats until the pool is exhausted) was checked choice by choice against its actual `go:` handler. Two different problems turned up, and they need different fixes:

1. **Genuinely undisclosed ordinary costs.** Three choices mutate real state with no tag, no `why`, and no indication of scope:
   - **Crows in the Corn**, "Set Reuben to scaring them": clears `tended` on *every* field, not just the one with crows, silently forfeiting the tend bonus (+0.25 growth/season, +2 harvest units) everywhere.
   - **A Foundling**, "Take them in": adds a hand with zero tag, silently raising `winterFoodNeed()`/`winterFuelNeed()` (both scale with `extraHands()`) for the rest of the run.
   - **Rats in the Stores**, "Ignore it": tagged only `−food`, no magnitude shown, actually costs a flat 10 food (12.5% of the starting 80).

2. **Deliberately undisclosed Reckoning costs.** Two choices (**A Name of His Own**'s "Refuse him," **A Foundling**'s "Turn them out") feed the hidden Reckoning track via `markCruelty()`/`S.reckoning+=1`. An in-code comment already documents that this must never be named, numbered, or hinted at in a tag, matching the locked design (D-027: Reckoning is hidden and concealment-proof). **These are not bugs.** A first playthrough stumbling into the cruelty axis unguided is intended per the existing design docs.

Also found: `SYSTEMIC.winter` ("Cabin Fever") exists but `drawSystemic("winter")` is never called anywhere, Winter currently gets no systemic event at all, relying only on its bespoke beats (Sister Ruth's Basket, The Long Vigil).

## Decisions (confirmed with Chris)

1. **No hint, of any kind, on the Reckoning-feeding choices.** Not even a values-based nudge from Reuben. Leave "Refuse him" and "Turn them out" exactly as they are, unguided discovery stays intended.
2. **Disclose all three ordinary costs found above**, using the existing `tag`/`why` mechanism from #19 (already built, currently only ever used for affordability checks, never for genuine plain-language explanation, this is the first real use of `why` as an explainer rather than a disabled-reason).
3. **Wire `SYSTEMIC.winter` into `winterFlow()`**, in the same slot the other three seasons use (right after crew assignment), so Winter gets a systemic event like every other season instead of silently having none.

## Implementation

- **Crows in the Corn**, "Set Reuben to scaring them": add `why:"Reuben spends the day at this field, so every other field goes untended today too, not just this one."` (shown via the existing choice-tag info icon from #19, no `tag` badge needed since there's no clean single number to show).
- **A Foundling**, "Take them in": add `tag:"+1 mouth"` and `why:"Another hand works the fields, but winter's food and fuel needs grow to match, for good."`
- **Rats in the Stores**, "Ignore it": change `tag:"−food"` to `tag:"−10 food"` (the mechanism already supports arbitrary tag strings; this one just needs the actual number instead of a vague direction).
- **Winter**: add `b.push(()=>drawSystemic("winter"));` in `winterFlow()`, positioned after `assignStep(["chop","rest"])` and before the Sister Ruth's Basket check, mirroring where Spring/Summer/Fall call `drawSystemic()` relative to their own crew-assignment step.

## Out of scope

- Any change to the Reckoning-feeding choices or the hidden-meter design (D-027 stands untouched).
- A general "Reuben recommends a specific choice" tip system per systemic event. This pass only fixes cost disclosure; an explicit per-event recommendation layer is a larger follow-up, not confirmed as needed once costs are legible.
- Rebalancing any numeric value (the 10 food loss, the fertility hit, coin costs). This pass makes existing numbers visible, it does not change them.
- Event weighting or anti-repeat logic changes; `drawSystemic()`'s selection mechanism is untouched.

## Cross-references

- Source issue: GitHub #40, milestone "Prototype v0.2: Onboarding & Imagery."
- Reuses the `tag`/`why` mechanism from the #19 UI clarity pass.
- Respects D-027 (Reckoning is hidden, concealment-proof) and D-039 (onboarding hand-holding fades gradually, but never overrides a locked hidden-mechanic decision).
