# v0.4 Phase 2 — The Tightening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Give the beats *stakes*. Kill the playtest exploits: **seed becomes a real coin sink** (buy it to plant; no free coin fallback), **jobs stop being an infinite coin printer** (scarce, once-per-offer, costing your season time), and **starting abundance is cut with a Day-1 stake** so meeting the winter food-and-fuel deadline is earned from the first season. Rebalanced against the sim.

**Architecture:** Additive on Phase 1's beat loop. Pure-core changes (seed economy, starting resources, the mortgage's Y1 stake, job scarcity) + a Tolliver "buy seed" affordance + a sim rebalance. Everything `(state, action) => state`.

**Design reference:** `docs/superpowers/specs/2026-07-30-v04-beat-driven-loop-design.md` section 5.

**Scope guard (defer to Phase 3/4):** events, the day-book ledger breakdown, button restyle, town card content.

---

## Task 1: Seed as a real coin sink

**Files:** Modify `prototype2/src/core/balance.js`, `state.js`, `reducer.js`, `selectors.js`, `render/screens.js`; create `tests/seed.test.mjs`.

- [ ] **Step 1: `balance.js`** — add `seedPrice: 2,` (coin per seed unit) and `seedBundle: 10,` (units bought per purchase).
- [ ] **Step 2: `state.js`** — cut the starting seed so the player must buy more within the first year: `seed: 8` (was 20).
- [ ] **Step 3: `reducer.js` — planting requires seed only (no coin fallback).** In `plant(s, id, cropKey)`, change the affordability so a field can only be sown if there is enough **seed** (the coin fallback is removed — coin buys seed at the store, not the ground):
```javascript
function plant(s, id, cropKey) {
  const field = s.fields.find((f) => f.id === id);
  const crop = CROPS[cropKey];
  if (!field || !field.cleared || field.crop || !crop) return s;
  if (s.seed < crop.seed) return s;               // must have the seed; buy it at the store
  return { ...mapField(s, id, (f) => ({ ...f, crop: cropKey, progress: 0, tended: false })), seed: s.seed - crop.seed };
}
```
- [ ] **Step 4: `reducer.js` — `BUY_SEED` at Tolliver.** Add a case + helper: spend coin for a seed bundle (a capital purchase, coin only, like clearing/hiring):
```javascript
    case "BUY_SEED":
      return buySeed(state);
```
```javascript
// Buy a bundle of seed from Tolliver's store. Coin -> seed, the sink that makes coin matter
// and turns planting into a budgeted choice. A no-op if the bundle can't be afforded.
function buySeed(s) {
  const cost = BALANCE.seedBundle * BALANCE.seedPrice;
  if (s.coin < cost) return s;
  return { ...s, coin: s.coin - cost, seed: s.seed + BALANCE.seedBundle };
}
```
- [ ] **Step 5: `selectors.js`** — `export const seedBundleCost = () => BALANCE.seedBundle * BALANCE.seedPrice;` and `export const canBuySeed = (s) => s.coin >= seedBundleCost();`.
- [ ] **Step 6: `screens.js` — the buy-seed affordance at Tolliver's store.** In the `town:` place view, when `l.npc === "tolliver"`, show a choice card `Buy seed (${BALANCE.seedBundle} for ${seedBundleCost()}m)` disabled when `!canBuySeed(s)`, dispatching `BUY_SEED` (coin-only, no action cost — a purchase). Import `seedBundleCost`, `canBuySeed`. (Mirror the Vane `Hire a hand` pattern already there.)
- [ ] **Step 7: Test `tests/seed.test.mjs`:**
```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { seedBundleCost } from "../src/core/selectors.js";
import { CROPS } from "../src/core/crops.js";

describe("the seed economy", () => {
  it("planting consumes seed and is refused when short (no coin fallback)", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting, seed 8
    s = { ...s, seed: 5, coin: 999 };
    const before = s.seed;
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" }); // potato seed 6 > 5
    expect(s.fields[0].crop).toBe(null);          // refused: not enough seed, coin does not help
    s = { ...s, seed: 6 };
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    expect(s.fields[0].crop).toBe("potato");
    expect(s.seed).toBe(0);                        // 6 - 6
  });
  it("BUY_SEED trades coin for a seed bundle", () => {
    let s = { ...initialState(1), coin: 100, seed: 2 };
    const cost = seedBundleCost();
    s = reduce(s, { type: "BUY_SEED" });
    expect(s.coin).toBe(100 - cost);
    expect(s.seed).toBe(2 + 10);
  });
  it("BUY_SEED is a no-op when it cannot be afforded", () => {
    let s = { ...initialState(1), coin: 0 };
    expect(reduce(s, { type: "BUY_SEED" })).toEqual(s);
  });
});
```
- [ ] **Step 8:** Run `cd prototype2 && npx vitest run tests/seed.test.mjs` → PASS. Then the FULL suite; fix any test/sim that assumed the seed->coin planting fallback (e.g. a planting test that expected coin to drop, or the sim's `plantStep` `affordable()` which checked coin — update it to check `s.seed >= crop.seed`, and have the sim BUY_SEED at Tolliver or before planting so policies can still sow). Report changes. Commit.
```bash
git add prototype2/src/core/ prototype2/src/render/screens.js prototype2/tests/seed.test.mjs prototype2/sim/
git commit -m "feat(proto2): seed is a real coin sink (buy to plant, no coin fallback) (v0.4 phase2 task 1)"
```

## Task 2: Cut abundance + a Day-1 stake

**Files:** Modify `prototype2/src/core/state.js`, `balance.js`; tests.

- [ ] **Step 1: Cut starting abundance.** In `state.js` `initialState`: `coin: 60` (was 100), `larder: 40` (was 80). Fuel stays 0. This makes the winter food-and-fuel deadline a real bar and coin genuinely tight. (Final numbers come from the sim, Task 3.)
- [ ] **Step 2: A Day-1 stake.** Year 1 is no longer pure grace: give it a small year-end payment so the debt is present from the start. In `balance.js` `mortgageSchedule`, change year 1 from `0` to `20` (a light first note). Update any test that asserted `mortgageDue({year:1}).total === 0` to `20`.
- [ ] **Step 3: Test** — add to `tests/mortgage.test.mjs` (or a new test): `mortgageDue` for year 1 is now `20` (payment) + `0` (upkeep) = `20`; a Year-1 settlement with enough coin deducts it and turns the year.
- [ ] **Step 4:** Run `cd prototype2 && npx vitest run` → green (update the couple of tests that hard-coded Year-1 grace / the old starting coin/larder). Report changes. Commit.
```bash
git add prototype2/src/core/ prototype2/tests/
git commit -m "feat(proto2): cut starting abundance + a Day-1 Year-1 stake (v0.4 phase2 task 2)"
```

## Task 3: Job scarcity + the sim rebalance + verify

**Files:** Modify `prototype2/src/core/town.js`/`selectors.js` (job scarcity), `balance.js` (final tune), `sim/policies.js`; verify.

- [ ] **Step 1: Jobs scarce.** Today `townOffers` surfaces `JOBS_PER_DAY` jobs from a deterministic daily slice, and taking one spends a season action + marks it done for the day. Make jobs a **season-scarce** resource instead of a daily refill: change `jobsDoneToday` to `jobsDoneThisSeason` (reset in `beginSeason`, not each day), and lower the offer to **1** at a time (`JOBS_PER_DAY -> JOBS_PER_SEASON = 2` total available across a season). So a player can earn from at most ~2 jobs a season, each costing a season action — not infinite coin. Update `townOffers`, the reducer's `acceptJob` (mark `jobsDoneThisSeason`), and the reset (in `beginSeason`). Update the town/standing tests to the season-scarce model.
- [ ] **Step 2: The sim rebalance.** Run `node sim/run.js` and `npx vitest run tests/sim.test.mjs`. With seed now a coin sink, jobs scarce, abundance cut, and labor bumped (Phase 1), re-tune `balance.js` (starting coin/larder, seedPrice, the mortgage schedule, strain) until: **a careful (optimal) line survives Year 1 and beyond but is genuinely tight; a careless (sloppy) line can lose a hand or foreclose early** (Year 1-2 can now hurt, per the spec's lethality decision). Update the sim policies to buy seed as needed so they can still plant. Record the tuned curve in `balance.js` comments. The sim bands may need adjusting to the new, harder reality — keep them meaningful (optimal clearly outlasts sloppy).
- [ ] **Step 3: Full suite green.** `cd prototype2 && npx vitest run` → all pass; report counts.
- [ ] **Step 4: Browser verify.** New Game → confirm: you start leaner (coin 60, larder 40); you must **buy seed at Tolliver** to keep planting; jobs are scarce (not spammable); by the beat screen you feel the food/fuel pressure (roles matter); a deliberately careless line puts a hand in danger or trends toward foreclosure. Screenshot. Fix console errors.
- [ ] **Step 5: Commit.**
```bash
git add prototype2/src/core/ prototype2/sim/ prototype2/tests/
git commit -m "feat(proto2): scarce jobs + the sim rebalance for a tense Year 1 (v0.4 phase2 task 3)"
```

---

## Self-Review notes (author)
- **Spec coverage (section 5):** seed sink -> Task 1; jobs scarce -> Task 3; cut abundance + Day-1 stake -> Task 2; sim rebalance -> Task 3.
- **Type/name consistency:** `BALANCE.seedPrice/seedBundle`, `BUY_SEED`, `seedBundleCost()`, `canBuySeed`, `jobsDoneThisSeason`, `JOBS_PER_SEASON`. `jobsDoneToday`/`JOBS_PER_DAY` retired.
- **Exploit closure:** planting requires bought seed (coin sink); jobs capped per season + cost a season action (no infinite coin); leaner start + a Day-1 note make the deadline bite.
