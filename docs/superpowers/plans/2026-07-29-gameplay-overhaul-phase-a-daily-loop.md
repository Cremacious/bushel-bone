# Gameplay Overhaul — Phase A: The Daily Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `prototype2`'s abstract five-**week** labor turn with a **day-by-day** loop and a **personal action economy**, so one season plays as: assign the crew's standing orders at dawn → spend your own 2 actions on the farm → turn in → the day resolves → repeat over a **10-day season**, with a **"Let the days run"** fast-forward that auto-stops on anything interesting. On-farm only (town, ladder, and market are Phases B–D).

**Architecture:** This is a structural refactor of the pure core plus the day screen. The `week`-based phase machine (`brief → planting → week×5 → dusk`) becomes day-based (`brief → planting → day×10 → dusk`); `resolveWeek` becomes `resolveDay` with per-day magnitudes; the pre-filled *player* action is replaced by an interactive **personal action economy** (2 actions/day, applied immediately); a new **fast-forward** loops day-resolution until an `interrupts()` selector reports something wants the player. Everything stays pure `(state, action) => state`, DOM-free, unit-tested. The crew's condition track, crops, and consumption logic are reused with recalibrated constants.

**Tech Stack:** Same as Plans 1–2 — vanilla ES modules, `vitest`/`jsdom`, no new dependencies.

**Design reference:** the V0.3 language (`design/version-1/Bushel and Bone UI.dc.html`) Screens 03/05/06 for the Morning Brief, Planting, and Dusk; the Day screen is a new screen built *in* that language (masthead "Day X of 10", brass ledger, engraved leaf, `.m-turn` on beat change only).

**Balance note:** every constant in `balance.js` is a **first pass owned by the balance model (Q-003)**. Get the daily *loop* legible and survivable; values are tuned in playtest. Do not invent extra systems to balance it — that is later phases.

**Scope guard (defer to later phases, do NOT build here):** the Town menu-map + travel + odd-jobs + the 4 new NPCs (Phase B); the build-up ladder / clearing fields / hiring / vendors / starting at 1 field (Phase C — this phase keeps the current 4 starting fields + Reuben); the crop market price model / venues / spoilage / gossip intel (Phase D); events, the reckoning biting, death ritual/traits, the Weird tier, the Almanac wave chart, multi-year mortgage/legacy, final art (later). A hand can still die of plain starvation/cold here.

---

## The overhaul roadmap (this plan is Phase A)

Per the spec (`docs/superpowers/specs/2026-07-29-gameplay-overhaul-daily-loop-economy.md`), the overhaul ships in five phases, each producing working, testable software:

- **Phase A — the daily loop (this plan).** Day-by-day phase machine, 10-day season, personal action economy, the fast-forward. On-farm only.
- **Phase B — the living town.** Town menu-map screen, ride-to-town as a Day action, location scenes, the rotating deck, odd-jobs (coin engine 2), the 4 new NPCs into `content/names.yaml` + scenes into `content/script.yaml`, Reuben's town onboarding.
- **Phase C — the build-up ladder.** Start at 1 field + 1 hand; owned upgrades with escalating costs; vendors (Crake tools/buildings, Silas land deeds, Vane hiring wired to capacity); each hire a new mouth.
- **Phase D — the crop market.** Price model (seasonal wave, telegraphed shocks, flood-depression, micro-noise), venues (local/regional/rail), spoilage, the market board screen, gossip→forecast intel, Fenwick/rail unlock.
- **Phase E — polish, onboarding, balance.** Reuben's full fading onboarding arc, the Almanac wave chart, balance recalibration to 10-day seasons, four-failure-mode validation.

Each later phase gets its own detailed plan when its turn comes.

---

## File Structure (Phase A)

```
prototype2/src/core/
  balance.js     # MODIFY — weekly constants → daily constants (daysPerSeason, per-day rates, playerActionsPerDay)
  crops.js       # MODIFY — weeklyGrowth → dailyGrowth (uses growthPerDay)
  state.js       # MODIFY — state.day (was week), phase names, playerActionsLeft; drop pre-filled playerAction
  selectors.js   # MODIFY — fieldProjection/suggestPlan → day-based; NEW interrupts(state)
  reducer.js     # MODIFY — daily phase machine: DAWN, DO_PLAYER_ACTION, TURN_IN(=resolveDay), RUN_DAYS, END_SEASON
prototype2/src/render/
  screens.js     # MODIFY — new "day" screen (dawn assign + personal actions + Turn in + Let the days run); dusk keeps
  board.js       # MODIFY — week-phase branch → day-phase branch
  shell.js       # MODIFY — "Day X of {daysPerSeason}"; pips over days; retire the *4 day math
prototype2/src/
  main.js        # MODIFY — viewKey uses state.day; interrupts drive the fast-forward button state
prototype2/tests/
  daily-loop.test.mjs   # NEW — the day phase machine + personal actions + fast-forward interrupts
  playthrough.test.mjs  # MODIFY — full year on the daily cadence, survivable, never wedges
  (crops|season|assign|resolve-week|screens|flow).test.mjs # MODIFY — week→day renames
```

Boundaries unchanged from Plan 2: `balance.js`/`crops.js` pure data; `selectors.js` pure derived reads; `reducer.js` owns transitions; `screens.js` reads + dispatches, never mutates.

---

## Task 1: Daily balance constants + daily crop growth

**Files:**
- Modify: `prototype2/src/core/balance.js`
- Modify: `prototype2/src/core/crops.js`
- Modify: `prototype2/tests/crops.test.mjs`

- [ ] **Step 1: Rewrite `prototype2/src/core/balance.js` to daily constants**

Replace the file's exported `BALANCE` with the daily model. Keep any unrelated exports intact.

```javascript
// First-pass tuning, owned by the balance model (Q-003). One place for every number.
// DAILY model (Phase A): a season is `daysPerSeason` days; growth, eating, cold, and
// strain are all per-day. The player has `playerActionsPerDay` personal actions each day.
export const BALANCE = {
  daysPerSeason: 10,          // a season is 10 days (updates the old 20; tunable in playtest)
  playerActionsPerDay: 2,     // the proprietor's own actions per day
  foodPerMouthPerDay: 1,      // larder eaten per mouth per day
  fuelPerMouthPerDay: 1,      // fuel burned per mouth per day (fall/winter only)
  fuelPerChopDay: 4,          // fuel a hand lays in per day of chopping
  forageFood: 3,              // food a hand/you gather per day of foraging
  growthPerDay: 0.1,          // a 1-season crop ripens in ~10 days
  tendGrowthBonus: 0.05,      // extra progress when a crop was tended that day
  strain: {
    hardLabor: 2,             // per day of real work
    restRecovery: 6,          // per day of rest
    careRecovery: 5,          // when you sit with a hand (a personal action)
    hungerPerDay: 5,          // per day the larder can't feed the household
    coldPerDay: 5,            // per cold day with no fuel
    wornAt: 25, failingAt: 50, lostAt: 100,
  },
};
```

- [ ] **Step 2: Update `prototype2/src/core/crops.js` — rename `weeklyGrowth` → `dailyGrowth`**

Replace the growth export (keep `CROPS` and `ripe` exactly as they are):

```javascript
// Progress a crop gains in one day: a base step, a tended bonus, and the weather modifier.
// A fallow field (no crop) grows nothing.
export function dailyGrowth(field, weather = { grow: 0 }) {
  if (!field.crop) return 0;
  const bonus = field.tended ? BALANCE.tendGrowthBonus : 0;
  return BALANCE.growthPerDay + bonus + (weather.grow || 0);
}
```

- [ ] **Step 3: Update `prototype2/tests/crops.test.mjs`**

Change the import and the growth test to the daily name/behavior. Replace the `weeklyGrowth` import and its `describe`/`it` block:

```javascript
import { CROPS, ripe, dailyGrowth } from "../src/core/crops.js";
```

```javascript
  it("dailyGrowth adds a base step, a tended bonus, and the weather modifier", () => {
    const base = dailyGrowth({ crop: "potato", tended: false }, { grow: 0 });
    const tended = dailyGrowth({ crop: "potato", tended: true }, { grow: 0 });
    const rainy = dailyGrowth({ crop: "potato", tended: false }, { grow: 0.1 });
    expect(tended).toBeGreaterThan(base);
    expect(rainy).toBeGreaterThan(base);
    expect(dailyGrowth({ crop: null, tended: false }, { grow: 0 })).toBe(0);
  });
```

- [ ] **Step 4: Run the crops test to verify it passes**

Run: `cd prototype2 && npx vitest run tests/crops.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/balance.js prototype2/src/core/crops.js prototype2/tests/crops.test.mjs
git commit -m "refactor(proto2): daily balance constants + dailyGrowth (Phase A task 1)"
```

---

## Task 2: State — day, phase names, personal action economy

**Files:**
- Modify: `prototype2/src/core/state.js`
- Modify: `prototype2/tests/*` (mechanical `week`→`day` in flow/season/assign as they surface — done in Task 5's suite pass; here only state.js changes)

- [ ] **Step 1: Write the failing test — append to `prototype2/tests/flow.test.mjs`**

Add a `describe` block asserting the new starting fields (day, playerActionsLeft) and that `WEEKS_PER_SEASON` is gone in favor of `DAYS_PER_SEASON`:

```javascript
import { initialState, DAYS_PER_SEASON } from "../src/core/state.js";

describe("daily state shape", () => {
  it("starts on day 1 with a full personal action budget", () => {
    const s = initialState(1);
    expect(s.day).toBe(1);
    expect(s.playerActionsLeft).toBe(2);
    expect(s.phase).toBe("brief");
    expect(DAYS_PER_SEASON).toBe(10);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd prototype2 && npx vitest run tests/flow.test.mjs -t "daily state shape"`
Expected: FAIL (`s.day` undefined / `DAYS_PER_SEASON` not exported).

- [ ] **Step 3: Edit `prototype2/src/core/state.js`**

In `initialState`, replace the `week: 1,` line and the `playerAction`/`phase` lines:

```javascript
    week: 1,                 // 1..5
```
becomes
```javascript
    day: 1,                  // 1..DAYS_PER_SEASON
    playerActionsLeft: BALANCE.playerActionsPerDay, // your own actions this day (reset each dawn)
```

Replace:
```javascript
    phase: "brief",            // brief → planting → week → dusk → (next season) ; yearend at the end
    playerAction: { kind: "rest" }, // the player's own week: {kind:"rest"|"work"|"care", target?}
```
with:
```javascript
    phase: "brief",            // brief → planting → day → dusk → (next season) ; yearend at the end
    daylog: [],                // what happened on the current day (shown at dusk of resolve)
```

At the bottom of the file, replace the `WEEKS_PER_SEASON` export line:

```javascript
export const WEEKS_PER_SEASON = BALANCE.weeksPerSeason; // single source of truth (balance.js)
```
with:
```javascript
export const DAYS_PER_SEASON = BALANCE.daysPerSeason; // single source of truth (balance.js)
```

- [ ] **Step 4: Run it to verify it passes**

Run: `cd prototype2 && npx vitest run tests/flow.test.mjs -t "daily state shape"`
Expected: PASS. (Other suites still reference `week`/`WEEKS_PER_SEASON` and will fail until Task 4/5 — that is expected; do not fix them here.)

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/state.js prototype2/tests/flow.test.mjs
git commit -m "refactor(proto2): state.day + personal action budget + DAYS_PER_SEASON (Phase A task 2)"
```

---

## Task 3: Selectors — day-based projection, suggestPlan, and `interrupts()`

**Files:**
- Modify: `prototype2/src/core/selectors.js`
- Test: `prototype2/tests/daily-loop.test.mjs` (created here)

- [ ] **Step 1: Write the failing test `prototype2/tests/daily-loop.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { interrupts } from "../src/core/selectors.js";

// Drive to the playing "day" phase with a ripe field to check the fast-forward stopper.
function playing(mutate) {
  let s = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
  s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
  s = reduce(s, { type: "SOW" }); // phase: day, day 1
  return mutate ? mutate(s) : s;
}

describe("interrupts()", () => {
  it("is empty on a calm early day", () => {
    expect(interrupts(playing())).toEqual([]);
  });
  it("flags a ripe crop that no one is set to harvest", () => {
    const s = playing((s) => ({ ...s, fields: s.fields.map((f) => f.id === 0 ? { ...f, progress: 1 } : f) }));
    expect(interrupts(s).some((r) => /ripe/i.test(r))).toBe(true);
  });
  it("flags a hand who has crossed Failing", () => {
    const s = playing((s) => ({ ...s, hands: s.hands.map((h) => ({ ...h, strain: 60 })) }));
    expect(interrupts(s).some((r) => /failing/i.test(r))).toBe(true);
  });
  it("flags the last day of the season", () => {
    const s = playing((s) => ({ ...s, day: 10 }));
    expect(interrupts(s).some((r) => /last day/i.test(r))).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd prototype2 && npx vitest run tests/daily-loop.test.mjs`
Expected: FAIL (`interrupts` is not exported).

- [ ] **Step 3: Edit `prototype2/src/core/selectors.js`**

(a) Update the `fieldProjection` "off-by-one" base to the day phase, and any `state.week`/`WEEKS_PER_SEASON` reference in this file, to `state.day`/`DAYS_PER_SEASON`. Find every `state.week`/`s.week` and `phase === "week"` in this file and change `week`→`day`; import `DAYS_PER_SEASON` (not `WEEKS_PER_SEASON`) from state.js if referenced. In `fieldProjection`, the line computing `base` becomes:

```javascript
  const base = state.phase === "day" ? state.day - 1 : 0;
```

(b) In `suggestPlan`, drop the returned `player` field if present (the player action is now interactive) — return just `{ hands }`. Any consumer reading `.player` is updated in Task 4. Leave the hands-assignment logic (harvest ripe first, pair on needsTwo, else forage/chop/tend/rest) unchanged.

(c) Append the new `interrupts` selector at the end of the file:

```javascript
import { DAYS_PER_SEASON } from "./state.js"; // (add to the existing state.js import if not already present)

// The fast-forward stopper. Returns human-readable reasons the "Let the days run"
// control should pause and hand the day back to the player. Empty array = a calm day
// that can be skipped. Phase A reasons only; later phases add events/callers/market.
export function interrupts(state) {
  if (state.phase !== "day") return [];
  const St = BALANCE.strain;
  const reasons = [];
  const harvesting = new Set(
    state.hands.filter((h) => h.alive && h.task === "harvest").map((h) => h.targetFieldId)
  );
  if (state.fields.some((f) => ripe(f) && !harvesting.has(f.id))) reasons.push("A crop stands ripe and no one is set to bring it in.");
  if (state.hands.some((h) => h.alive && h.strain >= St.failingAt)) reasons.push("A hand is failing and needs seeing to.");
  if (state.larder <= 0) reasons.push("The larder is empty.");
  if (state.day >= DAYS_PER_SEASON) reasons.push("It is the last day of the season.");
  return reasons;
}
```

Ensure `ripe` and `BALANCE` are already imported at the top of selectors.js (they are used elsewhere in the file). If `DAYS_PER_SEASON` is not yet imported from `./state.js`, add it to that import line rather than duplicating the import.

- [ ] **Step 4: Run it to verify it passes**

Run: `cd prototype2 && npx vitest run tests/daily-loop.test.mjs`
Expected: PASS (all four `interrupts()` cases).

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/selectors.js prototype2/tests/daily-loop.test.mjs
git commit -m "feat(proto2): day-based projection + interrupts() fast-forward stopper (Phase A task 3)"
```

---

## Task 4: Reducer — the daily phase machine

**Files:**
- Modify: `prototype2/src/core/reducer.js`
- Test: append to `prototype2/tests/daily-loop.test.mjs`

The transitions change as follows:
- `SOW` → enters `phase: "day"`, `day: 1`, standing orders pre-filled once, `playerActionsLeft` full.
- `DO_PLAYER_ACTION {kind, target}` → spends one of `playerActionsLeft`, applies the effect immediately (work a field / forage / care for a hand), no-op if none left.
- `TURN_IN` → `resolveDay` (crew labor → growth → eating → cold → strain/loss), advance the day (reset `playerActionsLeft`, keep standing orders), or into `dusk` after the last day.
- `RUN_DAYS` → fast-forward: repeatedly `resolveDay` **while** there are no `interrupts`, stopping before the day the player would want. Never crosses into `dusk` blindly — it stops on the last day.
- `ASSIGN` unchanged (free re-planning). `END_SEASON` unchanged.

- [ ] **Step 1: Write the failing tests — append to `prototype2/tests/daily-loop.test.mjs`**

```javascript
import { BALANCE } from "../src/core/balance.js";

describe("daily phase machine", () => {
  it("SOW enters the day phase on day 1 with a full action budget", () => {
    const s = playing();
    expect(s.phase).toBe("day");
    expect(s.day).toBe(1);
    expect(s.playerActionsLeft).toBe(BALANCE.playerActionsPerDay);
  });
  it("DO_PLAYER_ACTION forage adds food and spends one action", () => {
    let s = playing();
    const before = s.larder;
    s = reduce(s, { type: "DO_PLAYER_ACTION", kind: "forage" });
    expect(s.larder).toBe(before + BALANCE.forageFood);
    expect(s.playerActionsLeft).toBe(BALANCE.playerActionsPerDay - 1);
  });
  it("DO_PLAYER_ACTION is a no-op when no actions remain", () => {
    let s = playing();
    s = { ...s, playerActionsLeft: 0 };
    const r = reduce(s, { type: "DO_PLAYER_ACTION", kind: "forage" });
    expect(r).toEqual(s);
  });
  it("TURN_IN advances the day, resolves labor, and refills the action budget", () => {
    let s = playing((s) => ({ ...s, hands: s.hands.map((h) => ({ ...h, task: "chop" })) }));
    s = reduce(s, { type: "DO_PLAYER_ACTION", kind: "forage" });
    const fuelBefore = s.fuel;
    s = reduce(s, { type: "TURN_IN" });
    expect(s.day).toBe(2);
    expect(s.playerActionsLeft).toBe(BALANCE.playerActionsPerDay); // refilled
    expect(s.fuel).toBe(fuelBefore + BALANCE.fuelPerChopDay);      // Reuben chopped
  });
  it("RUN_DAYS fast-forwards calm days and stops on an interrupt", () => {
    // one potato, Reuben set to tend it; it will ripen and trip the harvest interrupt
    let s = playing((s) => ({ ...s, hands: s.hands.map((h) => ({ ...h, task: "tend", targetFieldId: 0 })) }));
    s = reduce(s, { type: "RUN_DAYS" });
    expect(s.phase).toBe("day");
    // it stopped for a reason (ripe crop, or the last day) rather than running to dusk
    expect(s.day).toBeLessThanOrEqual(BALANCE.daysPerSeason);
  });
  it("TURN_IN on the last day moves to dusk", () => {
    let s = playing((s) => ({ ...s, day: BALANCE.daysPerSeason }));
    s = reduce(s, { type: "TURN_IN" });
    expect(s.phase).toBe("dusk");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd prototype2 && npx vitest run tests/daily-loop.test.mjs -t "daily phase machine"`
Expected: FAIL (`TURN_IN`/`DO_PLAYER_ACTION`/`RUN_DAYS` unhandled → state unchanged).

- [ ] **Step 3: Edit `prototype2/src/core/reducer.js`**

(a) Update the imports on line 1–4: import `DAYS_PER_SEASON` (not `WEEKS_PER_SEASON`), `dailyGrowth` (not `weeklyGrowth`), and `interrupts`:

```javascript
import { SEASONS, DAYS_PER_SEASON, season } from "./state.js";
import { CROPS, ripe, dailyGrowth } from "./crops.js";
import { BALANCE } from "./balance.js";
import { burnsFuel, fieldLabel, suggestPlan, interrupts } from "./selectors.js";
import { SCENES } from "../content/scenes.js";
```

(b) In the `switch`, replace the `ADVANCE_WEEK`, `SOW`, `SET_PLAYER_ACTION`, and `RESOLVE_WEEK` cases. Remove `ADVANCE_WEEK`/`SET_PLAYER_ACTION`. Set the block to:

```javascript
    case "SOW":
      return { ...withStandingOrders({ ...state, phase: "day", day: 1 }),
        playerActionsLeft: BALANCE.playerActionsPerDay };
    case "ASSIGN":
      return mapHand(state, action.handId, (h) => ({ ...h, task: action.task, targetFieldId: action.targetFieldId }));
    case "DO_PLAYER_ACTION":
      return doPlayerAction(state, action);
    case "TURN_IN":
      return resolveDay(state);
    case "RUN_DAYS":
      return runDays(state);
    case "END_SEASON":
      return endSeason(state);
```

(c) Replace `withSuggestedPlan` with a hands-only `withStandingOrders` (the player action is interactive now):

```javascript
// Pre-fill the crew's standing orders from Reuben's recommendation for the board as it
// stands. Called once when the season's play begins (SOW); the player overrides via ASSIGN,
// and the orders then PERSIST day to day (no nagging re-assignment each dawn).
function withStandingOrders(s) {
  const plan = suggestPlan(s);
  const hands = s.hands.map((h) => (h.alive && plan.hands[h.id])
    ? { ...h, task: plan.hands[h.id].task, targetFieldId: plan.hands[h.id].targetFieldId } : h);
  return { ...s, hands };
}
```

(d) Add the personal action handler (applied immediately, spends one action):

```javascript
// The proprietor spends one of their day's actions on their own labor. Applied at once for
// instant feedback. work → help a field along; forage → food on the table; care → ease a hand.
function doPlayerAction(s, { kind, target }) {
  if (s.phase !== "day" || s.playerActionsLeft <= 0) return s;
  const St = BALANCE.strain;
  let ns = { ...s, playerActionsLeft: s.playerActionsLeft - 1 };
  if (kind === "forage") ns.larder = s.larder + BALANCE.forageFood;
  else if (kind === "work" && target != null) ns.fields = s.fields.map((f) => (f.id === target && f.crop) ? { ...f, tended: true } : f);
  else if (kind === "care" && target != null) ns.hands = s.hands.map((h) => (h.id === target && h.alive) ? { ...h, strain: Math.max(0, h.strain - St.careRecovery) } : h);
  // kind === "rest": spends the action, no effect (a quiet day)
  return ns;
}
```

(e) Replace `advanceWeek` and `resolveWeek` with the daily versions, and update `beginSeason` to use `"day"` and `day`:

```javascript
// Open the season into its first playable phase (planting, or straight to the days in winter).
function beginSeason(s) {
  return season(s) === "winter"
    ? { ...withStandingOrders({ ...s, phase: "day", day: 1 }), playerActionsLeft: BALANCE.playerActionsPerDay, logSeasonStart: s.log.length }
    : { ...s, phase: "planting", day: 1, logSeasonStart: s.log.length };
}
```

Replace the whole `resolveWeek` function (lines ~110–199) with `resolveDay` — the same labor/growth/eat/cold/loss pipeline at per-day magnitudes, advancing one day:

```javascript
// Resolve one day: crew labor, crop growth, the household eats, the cold bites, strain and
// loss — then advance to the next day (refilling personal actions) or into Dusk after the last.
function resolveDay(s) {
  if (s.phase !== "day") return s; // guard against a stray double-dispatch
  let hands = s.hands.map((h) => ({ ...h }));
  let fields = s.fields.map((f) => ({ ...f }));
  let { larder, fuel, coin, seed } = s;
  const daylog = [];
  const St = BALANCE.strain;
  const byId = (id) => fields.find((f) => f.id === id);

  // 1a) Harvest is a field-level job; hands on the same ripe field bring it in together.
  // A two-hand crop worked by a single hand yields only half.
  const harvestCrews = {};
  for (const h of hands) {
    if (h.alive && h.task === "harvest" && h.targetFieldId != null) {
      (harvestCrews[h.targetFieldId] = harvestCrews[h.targetFieldId] || []).push(h.id);
    }
  }
  const workedHarvest = new Set();
  for (const fid of Object.keys(harvestCrews)) {
    const crew = harvestCrews[fid];
    const f = byId(Number(fid));
    if (!f || !ripe(f)) continue;
    const c = CROPS[f.crop];
    let units = Math.round(c.yield * (f.fert / 3));
    const shorthanded = c.needsTwo && crew.length < 2;
    if (shorthanded) units = Math.floor(units / 2);
    if (c.food > 0) larder += units * c.food; else coin += units * c.sale;
    daylog.push(`Brought in ${c.name.toLowerCase()} from ${fieldLabel(f).toLowerCase()}${shorthanded ? ", but a single hand got only half of it" : ""}.`);
    f.crop = null; f.progress = 0; f.fert = Math.max(0, f.fert - 1);
    crew.forEach((id) => workedHarvest.add(id));
  }

  // 1b) Tend / chop / forage are per-hand.
  const doLabor = (task, targetFieldId) => {
    if (task === "tend" && targetFieldId != null) { const f = byId(targetFieldId); if (f && f.crop) { f.tended = true; return true; } }
    else if (task === "chop") { fuel += BALANCE.fuelPerChopDay; return true; }
    else if (task === "forage") { larder += BALANCE.forageFood; return true; }
    return false;
  };
  for (const h of hands) {
    if (!h.alive) continue;
    const hard = h.task === "harvest" ? workedHarvest.has(h.id) : doLabor(h.task, h.targetFieldId);
    h.strain += hard ? St.hardLabor : (h.task === "rest" ? -St.restRecovery : 0);
  }

  // 2) Crop growth (uses today's tended flags), then reset tended.
  for (const f of fields) { if (f.crop) f.progress += dailyGrowth(f, s.weather); f.tended = false; }

  // 3) Eating: the household eats; a shortfall strains everyone alike.
  const eaters = 1 + hands.filter((h) => h.alive).length;
  const foodWant = eaters * BALANCE.foodPerMouthPerDay;
  if (larder >= foodWant) larder -= foodWant;
  else { larder = 0; for (const h of hands) if (h.alive) h.strain += St.hungerPerDay; }

  // 4) Fall/winter cold: fuel burns; a shortfall strains everyone.
  if (burnsFuel(s)) {
    const fuelWant = eaters * BALANCE.fuelPerMouthPerDay;
    if (fuel >= fuelWant) fuel -= fuelWant;
    else { fuel = 0; for (const h of hands) if (h.alive) h.strain += St.coldPerDay; }
  }

  // 5) Loss: clamp strain, lose anyone past the threshold.
  for (const h of hands) {
    h.strain = Math.max(0, Math.min(St.lostAt, h.strain));
    if (h.alive && h.strain >= St.lostAt) { h.alive = false; daylog.push(`${h.name} did not last the night.`); }
  }

  // 6) Advance one day, or into Dusk after the last day. Standing orders persist.
  let day = s.day + 1, phase = s.phase;
  if (day > BALANCE.daysPerSeason) { day = BALANCE.daysPerSeason; phase = "dusk"; }
  return { ...s, hands, fields, larder, fuel, coin, seed, day, phase,
    playerActionsLeft: BALANCE.playerActionsPerDay, daylog,
    log: [...s.log, ...daylog] };
}

// "Let the days run": resolve day after day while nothing wants the player, stopping the
// moment interrupts() reports a reason (or the season ends). A hard cap guards against a
// logic error looping forever.
function runDays(s) {
  let cur = s;
  for (let guard = 0; guard < BALANCE.daysPerSeason + 1; guard++) {
    if (cur.phase !== "day") break;               // reached dusk
    if (interrupts(cur).length) break;            // something wants attention
    cur = resolveDay(cur);
  }
  return cur;
}
```

(f) Update `endSeason` to reset `day` (not `week`):

```javascript
function endSeason(s) {
  if (season(s) === "winter") return { ...s, phase: "yearend", ended: true };
  let seasonIndex = s.seasonIndex + 1;
  return { ...s, seasonIndex, day: 1, phase: "brief" };
}
```

(g) Update `closeScene`: its non-`BEGIN_SEASON` branch sets `phase: "brief"` (unchanged); leave as is.

- [ ] **Step 4: Run to verify it passes**

Run: `cd prototype2 && npx vitest run tests/daily-loop.test.mjs`
Expected: PASS (both describes).

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/reducer.js prototype2/tests/daily-loop.test.mjs
git commit -m "feat(proto2): daily phase machine — DAWN standing orders, personal actions, TURN_IN/RUN_DAYS (Phase A task 4)"
```

---

## Task 5: Render — the Day screen, and the week→day ripple

**Files:**
- Modify: `prototype2/src/render/screens.js`
- Modify: `prototype2/src/render/board.js`
- Modify: `prototype2/src/render/shell.js`
- Modify: `prototype2/src/main.js`
- Modify: `prototype2/tests/screens.test.mjs`

- [ ] **Step 1: Write/adjust the failing screen test in `prototype2/tests/screens.test.mjs`**

Replace the `describe("readable weekly plan", ...)` and `describe("weekly plan screen", ...)` blocks with a day-screen block. Also change the dusk test's driver from `RESOLVE_WEEK ×5` to `TURN_IN ×10`:

```javascript
describe("the day screen", () => {
  it("shows the crew's standing orders, the personal action budget, and Turn in / Let the days run", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" });
    state = reduce(state, { type: "PLANT", fieldId: 0, crop: "potato" });
    state = reduce(state, { type: "SOW" }); // phase: day
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    expect(root.querySelector(".handrow")).toBeTruthy();                  // the crew
    expect(root.textContent).toMatch(/2 (actions|left)/i);               // personal budget shown
    expect([...root.querySelectorAll(".choicecard")].some((b) => /Turn in/i.test(b.textContent))).toBe(true);
    expect([...root.querySelectorAll("button")].some((b) => /Let the days run/i.test(b.textContent))).toBe(true);
  });
  it("spending a personal action decrements the budget", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    [...root.querySelectorAll(".pa-action")].find((b) => /Forage/i.test(b.textContent)).click();
    expect(state.playerActionsLeft).toBe(1);
  });
});
```

In the existing `describe("dusk + year end", ...)`, replace every `{ type: "RESOLVE_WEEK" }` loop `for (let i = 0; i < 5; i++)` with `for (let i = 0; i < 10; i++) state = reduce(state, { type: "TURN_IN" });` and the winter driver likewise. Replace `state.seasonIndex = 3` winter setup unchanged, but its resolve loop to `TURN_IN ×10`.

- [ ] **Step 2: Run to verify it fails**

Run: `cd prototype2 && npx vitest run tests/screens.test.mjs -t "the day screen"`
Expected: FAIL (no `.pa-action`, no "Turn in" on a `day` phase — the old renderer keys on `"week"`).

- [ ] **Step 3: Edit `prototype2/src/render/screens.js`**

Rename the week renderer to the day renderer. Find the phase branch that renders on `state.phase === "week"` (the crew rows + player actions block) and change it to `state.phase === "day"`. Within it:

- Keep the crew rows (the `.handrow` list with the `TASKS` task buttons + `TASK_DESC`).
- Replace the old "player actions" section (which read `playerAction`/`PLAYER_DESC` and a single pre-filled choice) with a **personal action budget** block: a header showing `${state.playerActionsLeft} of ${BALANCE.playerActionsPerDay} actions left`, and one `.pa-action` button per option that dispatches `DO_PLAYER_ACTION`, disabled when `playerActionsLeft === 0`:

```javascript
// Your own day: spend up to playerActionsPerDay actions. Applied at once (instant feedback).
function personalActions(s, dispatch) {
  const left = s.playerActionsLeft;
  const growing = s.fields.filter((f) => f.crop && !ripe(f));
  const opts = [
    { kind: "forage", label: "Forage", desc: `gather ${BALANCE.forageFood} food from the wild` },
    ...(growing.length ? [{ kind: "work", target: growing[0].id, label: "Work a field", desc: `lend your back to ${fieldLabel(growing[0]).toLowerCase()}` }] : []),
    ...(livingHands(s).some((h) => h.strain >= BALANCE.strain.wornAt)
      ? [{ kind: "care", target: livingHands(s).find((h) => h.strain >= BALANCE.strain.wornAt).id, label: "Sit with a hand", desc: "ease the worst-worn of the crew" }] : []),
    { kind: "rest", label: "Rest", desc: "a quiet day; spend the hours on nothing" },
  ];
  return el("div", { class: "personal" }, [
    el("div", { class: "personal-h t-label", text: `Your day — ${left} of ${BALANCE.playerActionsPerDay} actions left` }),
    el("div", { class: "pa-grid" }, opts.map((o) =>
      el("button", { class: "pa-action t-sub" + (left <= 0 ? " disabled" : ""), ...(left <= 0 ? { disabled: true } : {}),
        onClick: left > 0 ? () => dispatch({ type: "DO_PLAYER_ACTION", kind: o.kind, target: o.target }) : undefined }, [
        el("span", { class: "pa-label t-choice", text: o.label }),
        el("span", { class: "pa-desc", text: o.desc }),
      ]))),
    el("div", { class: "day-cta" }, [
      choiceCard("Turn in for the night", "the day resolves — crops grow, the crew eats", () => dispatch({ type: "TURN_IN" })),
      el("button", { class: "runbtn t-label", text: "Let the days run →",
        onClick: () => dispatch({ type: "RUN_DAYS" }) }),
    ]),
  ]);
}
```

Wire `personalActions(s, dispatch)` into the day renderer's returned children (after the crew rows). Ensure `ripe`, `fieldLabel`, `livingHands`, `BALANCE`, `el`, and the existing `choiceCard` helper are imported in screens.js (they are used elsewhere in the file except confirm `ripe`/`livingHands` — add to imports if missing). Remove the now-dead `PLAYER_DESC` map and any reference to `state.playerAction`.

- [ ] **Step 4: Edit `board.js`, `shell.js`, `main.js` — the week→day ripple**

`board.js`: change `if (state.phase === "week")` to `if (state.phase === "day")` (the read-only field projection board).

`shell.js`:
- Replace the day-counter math. Delete `const dayOf20 = (state.week - 1) * 4 + 1;` and the masthead `when` text; use the real day:
```javascript
  el("span", { class: "when t-label", text: `Year ${YEAR_WORD[state.year - 1] || state.year} · Day ${state.day} of ${DAYS_PER_SEASON}` }),
```
- Update the import: `WEEKS_PER_SEASON` → `DAYS_PER_SEASON` (from `../core/state.js`).
- In `pips`, change the played-count to days and the loop bound to `DAYS_PER_SEASON`:
```javascript
  const played = state.phase === "brief" || state.phase === "planting" ? 0 : Math.min(state.day, DAYS_PER_SEASON);
  ...
  for (let i = 0; i < DAYS_PER_SEASON; i++) dots.push(...);
```
- In `brassLedger`, `burnsFuel`/`mouths` use is fine; the `fuelPerMouthPerWeek` reference becomes `fuelPerMouthPerDay`:
```javascript
  const fuelWant = burnsFuel(state) ? mouths(state) * BALANCE.fuelPerMouthPerDay : 0;
```

`main.js`: in `viewKey(s)`, the home view already keys on `s.phase`, which now yields `"day"` — no change needed, but confirm the `.m-turn` still fires on day change: since `viewKey` returns the phase string, moving day-to-day within `phase: "day"` will NOT re-animate (correct — in-screen). Good. No change required unless `viewKey` referenced `week`; it does not.

- [ ] **Step 5: Add day-screen styles to `prototype2/src/styles/screens.css`**

Append:

```css
.personal { margin-top: 14px; }
.personal-h { margin-bottom: 8px; color: var(--ink-soft); }
.pa-grid { display: grid; gap: 8px; }
.pa-action { display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
  text-align: left; padding: 10px 12px; border: 1px solid var(--rule); border-radius: 8px;
  background: var(--leaf); color: inherit; cursor: pointer; }
.pa-action:hover:not(.disabled) { border-color: var(--lamp); }
.pa-action.disabled { opacity: .45; cursor: default; }
.pa-desc { font-size: .82rem; color: var(--ink-soft); }
.day-cta { margin-top: 12px; display: grid; gap: 8px; }
.runbtn { justify-self: start; background: none; border: none; color: var(--lamp);
  cursor: pointer; padding: 4px 2px; letter-spacing: .04em; }
```

(Use existing token names from `screens.css`/`shell.css`; if `--rule`/`--leaf`/`--lamp`/`--ink-soft` differ in this project, match the names already used in those files.)

- [ ] **Step 6: Run the screen tests**

Run: `cd prototype2 && npx vitest run tests/screens.test.mjs`
Expected: PASS (the day-screen block and the updated dusk block).

- [ ] **Step 7: Commit**

```bash
git add prototype2/src/render/ prototype2/src/main.js prototype2/src/styles/screens.css prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): the Day screen — standing orders, personal action budget, Turn in / Let the days run (Phase A task 5)"
```

---

## Task 6: Green the whole suite + a full-year daily playthrough

**Files:**
- Modify: `prototype2/tests/playthrough.test.mjs`
- Modify: any remaining `tests/*.mjs` still referencing `week`/`WEEKS_PER_SEASON`/`RESOLVE_WEEK`/`weeklyGrowth` (mechanical)

- [ ] **Step 1: Sweep the remaining week→day references in tests**

Run: `cd prototype2 && npx vitest run` and read the failures. In `tests/season.test.mjs`, `tests/assign.test.mjs`, `tests/resolve-week.test.mjs`, and `tests/flow.test.mjs`, apply these mechanical replacements:
- `{ type: "RESOLVE_WEEK" }` → `{ type: "TURN_IN" }`
- `{ type: "ADVANCE_WEEK" }` (season clock test) → drive via `TURN_IN` to the last day then `END_SEASON`, or delete the ADVANCE_WEEK-specific test if it only tested the retired action (note the deletion in the commit).
- `state.week` → `state.day`; `WEEKS_PER_SEASON` → `DAYS_PER_SEASON`; loops `< 5` over weeks → `< 10` over days.
- `weeklyGrowth` → `dailyGrowth`.
Rename `tests/resolve-week.test.mjs` → `tests/resolve-day.test.mjs` (`git mv`) and update its describe text; keep its assertions but at daily magnitudes (e.g. a chopping hand adds `BALANCE.fuelPerChopDay`, not `...PerChopWeek`).

- [ ] **Step 2: Rewrite the year playthrough in `prototype2/tests/playthrough.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState, SEASONS, DAYS_PER_SEASON } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

// A cautious full-year line on the daily cadence: plant food, let the days run, harvest,
// turn the season. Proves the loop never wedges and a sensible line survives Year 1.
describe("a full Year-1 daily playthrough", () => {
  it("plays Spring→Winter without wedging and keeps Reuben alive on a cautious line", () => {
    let s = initialState(12345, "Mackall");
    // open the first scene chain into planting
    s = reduce(s, { type: "BEGIN_SEASON" });
    if (s.phase === "scene") { // Year-1 opens on Ridley; walk it closed
      const sc = s.scene.id; s = reduce(s, { type: "CLOSE_SCENE" });
    }
    for (let season = 0; season < SEASONS.length; season++) {
      if (s.phase === "brief") s = reduce(s, { type: "BEGIN_SEASON" });
      if (s.phase === "planting") {
        // plant a staple in every fallow field we can afford, then sow
        s.fields.forEach((f) => { if (!f.crop) s = reduce(s, { type: "PLANT", fieldId: f.id, crop: "potato" }); });
        s = reduce(s, { type: "SOW" });
      }
      // run the days; whenever it stops for a ripe crop, set the crew to harvest and continue
      let guard = 0;
      while (s.phase === "day" && guard++ < 50) {
        s.fields.forEach((f) => {
          if (f.crop && f.progress >= 1) {
            s.hands.filter((h) => h.alive).forEach((h) => { s = reduce(s, { type: "ASSIGN", handId: h.id, task: "harvest", targetFieldId: f.id }); });
          }
        });
        const before = s.day;
        s = reduce(s, { type: "RUN_DAYS" });
        if (s.phase === "day" && s.day === before) s = reduce(s, { type: "TURN_IN" }); // nudge past a stall
      }
      expect(s.phase).toBe("dusk");
      s = reduce(s, { type: "END_SEASON" });
    }
    expect(s.phase).toBe("yearend");
    expect(s.hands.find((h) => h.id === "reuben").alive).toBe(true);
  });
});
```

- [ ] **Step 3: Run the whole suite**

Run: `cd prototype2 && npx vitest run`
Expected: PASS — all files green. If the cautious line loses Reuben, the balance is too harsh for a first pass; adjust `BALANCE.strain` recovery/thresholds or starting `larder`/`fuel` (Q-003 first pass) until a cautious line survives, and note the change in the commit.

- [ ] **Step 4: Browser smoke-check**

Start the dev server (`preview_start` with the proto2 launch config or `npm run dev`), open the app, and walk: New Game → letter → Morning Brief → planting → the Day screen. Confirm: the masthead reads "Day 1 of 10"; assigning the crew works; the personal action budget shows "2 of 2" and decrements on Forage/Work; "Turn in" advances the day and the ledger moves; "Let the days run" fast-forwards and stops (e.g. on a ripe crop or the last day); Dusk shows the season's day-book; the year completes. Fix any console errors, then screenshot the Day screen as proof.

- [ ] **Step 5: Commit**

```bash
git add prototype2/tests/
git commit -m "test(proto2): full-year daily playthrough + week→day suite sweep (Phase A task 6)"
```

---

## Self-Review notes (author)

- **Spec coverage (Phase A slice):** the daily three-beat loop (§4) → Tasks 4–5; 10-day season (§12) → Task 1; personal action economy (§4/§5) → Tasks 4–5; "Let the days run" + interrupts (§4) → Tasks 3–4; standing orders + Reuben pre-fill (§11 baseline) → Task 4 `withStandingOrders`. Town/ladder/market (§6–§10) are explicitly deferred to Phases B–D by the scope guard.
- **Carried-over systems** (mortal hands, consumption) are reused, not rebuilt — `resolveDay` is `resolveWeek` at daily magnitudes.
- **Type/name consistency:** `state.week`→`state.day`, `WEEKS_PER_SEASON`→`DAYS_PER_SEASON`, `weeklyGrowth`→`dailyGrowth`, `RESOLVE_WEEK`→`TURN_IN`, `withSuggestedPlan`→`withStandingOrders`, removed `SET_PLAYER_ACTION`/`ADVANCE_WEEK`/`state.playerAction`. Every touch-point is listed in Tasks 2–6.
- **No dominant-strategy / balance claims** are settled here — Q-003 owns the numbers; Task 6 only requires a cautious line to survive.
```
