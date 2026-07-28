# Prototype Rebuild — Plan 2: The Weekly Loop & the Hands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make **one full Year 1 (Spring → Winter) playable** in `prototype2/`: plant your fields, assign each hand a job each week and spend your own week, watch crops grow and the larder drain, keep your people fed and warm — and lose one to a bad winter if you fail. This is the fun engine (the season time-economy of spec §10, D-043/D-048) rendered in the V0.3 design.

**Architecture:** Extends Plan 1. The pure core (`src/core/`) gains crop data, first-pass balance constants, a **season/week phase machine**, and the reducer actions that drive the weekly loop — all `(state, action) => state`, DOM-free, unit-tested. The render layer (`src/render/`) gains a **phase router** and one screen per phase (Morning Brief, Planting, the Weekly Plan, Dusk), plus read-only status views for the Fields/Hands/Ledger tabs — built against the V0.3 design screens, reusing the Plan-1 shell/tokens/`el()`. A full-year headless playthrough test proves it is survivable and never wedges.

**Tech Stack:** Same as Plan 1 — vanilla ES modules, `vitest`/`jsdom`, the `content/*.yaml` pipeline. No new dependencies.

**Design references** (read from `design/version-1/Bushel and Bone UI.dc.html`; extract exact copy/spacing/classes as you build each screen): Screen 03 Morning Brief, Screen 04 A play scene (the dual-label choice-card grammar, warnings under the ledger, the omen footer), Screen 05 Planting, Screen 06 The Dusk Report, Screen 07 The roster.

**Balance note:** every number in `src/core/balance.js` and `src/core/crops.js` is a **first pass, owned by the balance model (Q-003)**. Get the *loop* correct and legible; the values are tuned later. Do not invent extra systems to "balance" it — that is Plans 3–5.

**Scope guard (defer, do NOT build here):** events/weather variety, the reckoning *biting* (taint spread, walkers), death **ritual**/burial/traits/cruelty morality, forage/hunt/preserve, the Weird crop tier, the Town tab, multiple years/the mortgage/legacy ledger, the Almanac/journals, and final art/fonts. Winter can kill a hand by simple starvation/cold here; the moral weight comes in Plan 3.

---

## File Structure

```
prototype2/src/core/
  balance.js       # NEW — first-pass tuning constants (one place)
  crops.js         # NEW — CROP data + ripe()/growth helpers
  selectors.js     # NEW — derived reads: condition(h), fieldLabel, warnings, winterNeed, mouths...
  state.js         # MODIFY — hand.strain, field.tended, state.phase, plan scaffolding
  reducer.js       # MODIFY — BEGIN_SEASON, PLANT, FALLOW, SOW, ASSIGN, SET_PLAYER_ACTION, RESOLVE_WEEK, END_SEASON
prototype2/src/render/
  components.js     # NEW — shared bits: choiceCard(), warnLines(), statTag()
  screens.js        # NEW — renderScreen(stage,state,dispatch) → per-phase + per-tab renderers
  shell.js          # MODIFY — tab clicks dispatch SET_SCREEN; ledger warnings
prototype2/src/
  main.js           # MODIFY — render the active screen instead of the placeholder
prototype2/tests/
  crops.test.mjs · flow.test.mjs · planting.test.mjs · assign.test.mjs
  resolve-week.test.mjs · season.test.mjs · screens.test.mjs · playthrough.test.mjs
```

Boundaries: `crops.js`/`balance.js` are pure data. `selectors.js` is pure derived reads (no mutation). `reducer.js` owns all transitions. `screens.js` reads state + dispatches, never mutates. Keep `reducer.js` from ballooning — `RESOLVE_WEEK`'s helpers live in the same file but as small named functions.

---

## Task 1: Crop data & balance constants

**Files:** Create `prototype2/src/core/crops.js`, `prototype2/src/core/balance.js`, `prototype2/tests/crops.test.mjs`

- [ ] **Step 1: Write the failing test `prototype2/tests/crops.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { CROPS, ripe, weeklyGrowth } from "../src/core/crops.js";

describe("crops", () => {
  it("defines staple and cash tiers with the fields the loop needs", () => {
    expect(CROPS.potato).toMatchObject({ tier: "staple", seasons: 1, food: expect.any(Number) });
    expect(CROPS.cotton).toMatchObject({ tier: "cash", food: 0, sale: expect.any(Number) });
  });
  it("ripe() is true once progress reaches the crop's season count", () => {
    expect(ripe({ crop: "potato", progress: 1.0 })).toBe(true);
    expect(ripe({ crop: "wheat", progress: 1.0 })).toBe(false); // wheat is 2 seasons
    expect(ripe({ crop: null, progress: 5 })).toBe(false);
  });
  it("weeklyGrowth adds a base step, a tended bonus, and the weather modifier", () => {
    const base = weeklyGrowth({ crop: "potato", tended: false }, { grow: 0 });
    const tended = weeklyGrowth({ crop: "potato", tended: true }, { grow: 0 });
    const rainy = weeklyGrowth({ crop: "potato", tended: false }, { grow: 0.1 });
    expect(tended).toBeGreaterThan(base);
    expect(rainy).toBeGreaterThan(base);
    expect(weeklyGrowth({ crop: null, tended: false }, { grow: 0 })).toBe(0);
  });
});
```

- [ ] **Step 2: Run it, expect failure** — `cd prototype2 && npm test tests/crops.test.mjs` → FAIL (module not found).

- [ ] **Step 3: Create `prototype2/src/core/balance.js`**

```javascript
// First-pass tuning constants — ALL owned by the balance model (Q-003). One place
// so tuning is a single-file edit and the loop code reads as intent, not magic numbers.
export const BALANCE = {
  weeksPerSeason: 5,
  foodPerMouthPerWeek: 3,        // farmer + each living hand
  fuelPerMouthPerWeek: 2,        // burned in fall & winter only
  fuelPerChopWeek: 5,            // one hand chopping adds this much fuel per week
  growthPerWeek: 0.2,            // a crop advances 0.2 "seasons" a week (1.0 over a 5-week season)
  tendGrowthBonus: 0.1,          // an assigned tend adds this to that field's growth this week
  strain: {
    hardLabor: 6,               // tend/chop/harvest cost this much strain per week
    restRecovery: 18,           // resting removes this much
    careRecovery: 12,           // the player spending their week caring for one hand
    hungerPerWeek: 12,          // added to a hand short of food
    coldPerWeek: 12,            // added to a hand short of fuel (fall/winter)
    lostAt: 100,                // strain >= this → the hand is lost
  },
};
```

- [ ] **Step 4: Create `prototype2/src/core/crops.js`**

```javascript
import { BALANCE } from "./balance.js";

// tier: "staple" (food floor) | "cash" (coin, no food). Weird tier is deferred (Plan 3).
// seed: seed cost to plant. seasons: how many seasons to ripen. yield: base units at fert 3.
// food: food per unit into the larder. sale: coin per unit sold.
export const CROPS = {
  turnip: { name: "Turnip", tier: "staple", seed: 3, seasons: 1, yield: 7, food: 1.5, sale: 2 },
  potato: { name: "Potato", tier: "staple", seed: 6, seasons: 1, yield: 10, food: 2, sale: 2 },
  wheat:  { name: "Wheat", tier: "staple", seed: 4, seasons: 2, yield: 8, food: 1.5, sale: 3 },
  corn:   { name: "Corn", tier: "staple", seed: 5, seasons: 2, yield: 9, food: 2, sale: 4 },
  cotton: { name: "Cotton", tier: "cash", seed: 10, seasons: 2, yield: 5, food: 0, sale: 12 },
};

export function ripe(field) {
  const c = field.crop && CROPS[field.crop];
  return !!c && field.progress >= c.seasons;
}

export function weeklyGrowth(field, weather) {
  if (!field.crop) return 0;
  return BALANCE.growthPerWeek + (field.tended ? BALANCE.tendGrowthBonus : 0) + (weather?.grow || 0);
}
```

- [ ] **Step 5: Run the test** → PASS.

- [ ] **Step 6: Commit**

```bash
git add prototype2/src/core/crops.js prototype2/src/core/balance.js prototype2/tests/crops.test.mjs
git commit -m "feat(proto2): crop data + first-pass balance constants"
```

---

## Task 2: Extend the state model (strain, tended, phase, plan) & selectors

**Files:** Modify `prototype2/src/core/state.js`; create `prototype2/src/core/selectors.js`, `prototype2/tests/planting.test.mjs` (used from Task 3 — created here only if a state test lands first; otherwise create in Task 3). Create `prototype2/tests/selectors.test.mjs`.

- [ ] **Step 1: Modify `prototype2/src/core/state.js`** — add `strain` to hands, `tended` to fields, and the loop scaffolding (`phase`, `playerAction`). Replace the file's `makeHand` and the returned object's field/hand lines and add `phase`:

```javascript
export function makeHand(id, name, { body = "average", mind = "average" } = {}) {
  // strain 0..100 drives the condition track (Steady→Worn→Failing→Lost); see selectors.condition.
  return { id, name, body, mind, task: "rest", strain: 0, morale: 4, alive: true, traits: [] };
}
```

In `initialState`, change the fields map to include `tended`, and add `phase`/`playerAction` (leave `screen` as the tab, defaulting to "home"):

```javascript
    fields: [0, 1, 2, 3].map((i) => ({ id: i, crop: null, progress: 0, fert: 3, taint: 0, tended: false })),
    hands: [makeHand("reuben", "Reuben")],
    foremanId: "reuben",
    log: [],
    phase: "brief",            // brief → planting → week → dusk → (next season) ; yearend at the end
    playerAction: { kind: "rest" }, // the player's own week: {kind:"rest"|"work"|"care", target?}
    screen: "home",            // the active tab (home shows the current phase)
    ended: false,
```

(Remove the old `condition: "steady"` from makeHand and the old `screen: "morning-brief"`; condition is now derived.)

- [ ] **Step 2: Create `prototype2/src/core/selectors.js`**

```javascript
import { BALANCE } from "./balance.js";
import { CROPS, ripe } from "./crops.js";
import { livingHands, season } from "./state.js";

// The one legible condition track (spec §10.4), derived from strain. No stored field:
// steady <25, worn 25..49, failing 50..99, lost at 100 (or !alive).
export function conditionOf(hand) {
  if (!hand.alive || hand.strain >= BALANCE.strain.lostAt) return "lost";
  if (hand.strain >= 50) return "failing";
  if (hand.strain >= 25) return "worn";
  return "steady";
}

export const mouths = (s) => 1 + livingHands(s).length; // the farmer + living hands
export const fieldLabel = (f) => ["The East Field", "The River Strip", "The Near Acre", "The Stone Lot"][f.id] || `Field ${f.id + 1}`;
export const isWinter = (s) => season(s) === "winter";
export const burnsFuel = (s) => season(s) === "fall" || season(s) === "winter";
export const ripeFields = (s) => s.fields.filter(ripe);
export const emptyFields = (s) => s.fields.filter((f) => !f.crop);

// Ledger warning lines the V0.3 design shows under the ledger (Screen 04). Strings only.
export function warnings(s) {
  const out = [];
  if (burnsFuel(s)) {
    const need = mouths(s) * BALANCE.fuelPerMouthPerWeek * (BALANCE.weeksPerSeason - s.week + 1);
    if (s.fuel < need) out.push(`Fuel is ${need - s.fuel} short of what the cold wants`);
  }
  const foodNeed = mouths(s) * BALANCE.foodPerMouthPerWeek * (BALANCE.weeksPerSeason - s.week + 1);
  if (s.larder < foodNeed) out.push(`The larder will not carry ${mouths(s)} mouths to the season's end`);
  return out;
}
export { CROPS };
```

- [ ] **Step 3: Create `prototype2/tests/selectors.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState, makeHand } from "../src/core/state.js";
import { conditionOf, mouths, warnings } from "../src/core/selectors.js";

describe("selectors", () => {
  it("condition track bands on strain", () => {
    expect(conditionOf({ alive: true, strain: 0 })).toBe("steady");
    expect(conditionOf({ alive: true, strain: 30 })).toBe("worn");
    expect(conditionOf({ alive: true, strain: 60 })).toBe("failing");
    expect(conditionOf({ alive: false, strain: 100 })).toBe("lost");
  });
  it("mouths counts the farmer plus living hands", () => {
    const s = initialState(1);
    expect(mouths(s)).toBe(2); // you + Reuben
    s.hands.push(makeHand("h2", "Del"));
    expect(mouths(s)).toBe(3);
  });
  it("warnings flag a short larder", () => {
    const s = initialState(1);
    s.larder = 1;
    expect(warnings(s).some((w) => w.includes("larder"))).toBe(true);
  });
});
```

- [ ] **Step 4: Run tests** → `cd prototype2 && npm test tests/selectors.test.mjs tests/core-state.test.mjs` — PASS. (Update `core-state.test.mjs` if it asserted the removed `condition`/`screen:"morning-brief"` fields: the state now has `phase:"brief"`, `screen:"home"`, and hands have `strain:0` and no `condition`. Adjust those assertions to match; do not weaken them.)

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/state.js prototype2/src/core/selectors.js prototype2/tests/selectors.test.mjs prototype2/tests/core-state.test.mjs
git commit -m "feat(proto2): hand strain/condition track, field tended, loop phase + selectors"
```

---

## Task 3: The phase machine & planting (BEGIN_SEASON, PLANT, FALLOW, SOW)

**Files:** Modify `prototype2/src/core/reducer.js`; create `prototype2/tests/flow.test.mjs`, `prototype2/tests/planting.test.mjs`

- [ ] **Step 1: Write `prototype2/tests/flow.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

describe("phase flow", () => {
  it("brief → planting in a growing season, brief → week in winter", () => {
    const spring = reduce(initialState(1), { type: "BEGIN_SEASON" });
    expect(spring.phase).toBe("planting");
    const w = initialState(1); w.seasonIndex = 3; // winter
    expect(reduce(w, { type: "BEGIN_SEASON" }).phase).toBe("week");
  });
  it("SOW moves planting → week", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "SOW" });
    expect(s.phase).toBe("week");
    expect(s.week).toBe(1);
  });
});
```

- [ ] **Step 2: Write `prototype2/tests/planting.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { CROPS } from "../src/core/crops.js";

describe("planting", () => {
  it("PLANT sets a crop and spends seed first, then coin", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" }); // phase planting, seed 20
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" }); // potato seed cost 6
    expect(s.fields[0].crop).toBe("potato");
    expect(s.seed).toBe(20 - CROPS.potato.seed);
  });
  it("PLANT is a no-op if the field is taken or you cannot afford the seed", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s.seed = 2; // less than any crop
    const before = s.fields[0].crop;
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    expect(s.fields[0].crop).toBe(before); // unchanged
    expect(s.seed).toBe(2);
  });
  it("FALLOW clears a field's crop back to null", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "PLANT", fieldId: 1, crop: "turnip" });
    s = reduce(s, { type: "FALLOW", fieldId: 1 });
    expect(s.fields[1].crop).toBe(null);
  });
});
```

- [ ] **Step 3: Extend `prototype2/src/core/reducer.js`** — add the cases (keep the existing SET_THEME; ADVANCE_WEEK can stay for now but is superseded by RESOLVE_WEEK in Task 5). Add imports and cases:

```javascript
import { SEASONS, WEEKS_PER_SEASON, season } from "./state.js";
import { CROPS } from "./crops.js";

// ... inside reduce()'s switch, add:
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "BEGIN_SEASON":
      return { ...state, phase: season(state) === "winter" ? "week" : "planting", week: 1 };
    case "PLANT":
      return plant(state, action.fieldId, action.crop);
    case "FALLOW":
      return mapField(state, action.fieldId, (f) => ({ ...f, crop: null, progress: 0 }));
    case "SOW":
      return { ...state, phase: "week", week: 1 };
```

Add these pure helpers to the same file:

```javascript
function mapField(s, id, fn) {
  return { ...s, fields: s.fields.map((f) => (f.id === id ? fn(f) : f)) };
}
function plant(s, id, cropKey) {
  const field = s.fields.find((f) => f.id === id);
  const crop = CROPS[cropKey];
  if (!field || field.crop || !crop) return s;           // taken or unknown crop
  const seedSpent = Math.min(s.seed, crop.seed);
  const coinSpent = crop.seed - seedSpent;               // seed first, then coin
  if (coinSpent > s.coin) return s;                      // cannot afford
  return {
    ...mapField(s, id, (f) => ({ ...f, crop: cropKey, progress: 0, tended: false })),
    seed: s.seed - seedSpent,
    coin: s.coin - coinSpent,
  };
}
```

- [ ] **Step 4: Run tests** → `cd prototype2 && npm test tests/flow.test.mjs tests/planting.test.mjs` — PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/reducer.js prototype2/tests/flow.test.mjs prototype2/tests/planting.test.mjs
git commit -m "feat(proto2): season phase machine + planting (BEGIN_SEASON/PLANT/FALLOW/SOW)"
```

---

## Task 4: Crew assignment & the player's own action (ASSIGN, SET_PLAYER_ACTION)

**Files:** Modify `prototype2/src/core/reducer.js`; create `prototype2/tests/assign.test.mjs`

- [ ] **Step 1: Write `prototype2/tests/assign.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

describe("assignment", () => {
  it("ASSIGN sets a living hand's weekly task (with an optional field target)", () => {
    let s = initialState(1);
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "tend", targetFieldId: 0 });
    const h = s.hands.find((x) => x.id === "reuben");
    expect(h.task).toBe("tend");
    expect(h.targetFieldId).toBe(0);
  });
  it("ASSIGN ignores an unknown or dead hand", () => {
    const s = initialState(1);
    expect(reduce(s, { type: "ASSIGN", handId: "ghost", task: "chop" })).toBe(s);
  });
  it("SET_PLAYER_ACTION records the player's own week", () => {
    let s = reduce(initialState(1), { type: "SET_PLAYER_ACTION", kind: "work", target: 0 });
    expect(s.playerAction).toEqual({ kind: "work", target: 0 });
  });
});
```

- [ ] **Step 2: Extend `prototype2/src/core/reducer.js`** — add cases:

```javascript
    case "ASSIGN":
      return mapHand(state, action.handId, (h) => ({ ...h, task: action.task, targetFieldId: action.targetFieldId }));
    case "SET_PLAYER_ACTION":
      return { ...state, playerAction: { kind: action.kind, target: action.target } };
```

Add the helper:

```javascript
function mapHand(s, id, fn) {
  const h = s.hands.find((x) => x.id === id && x.alive);
  if (!h) return s;
  return { ...s, hands: s.hands.map((x) => (x.id === id ? fn(x) : x)) };
}
```

- [ ] **Step 3: Run tests** → `cd prototype2 && npm test tests/assign.test.mjs` — PASS.

- [ ] **Step 4: Commit**

```bash
git add prototype2/src/core/reducer.js prototype2/tests/assign.test.mjs
git commit -m "feat(proto2): crew assignment + player weekly action (ASSIGN/SET_PLAYER_ACTION)"
```

---

## Task 5: Resolve the week (RESOLVE_WEEK) — the heart of the loop

**Files:** Modify `prototype2/src/core/reducer.js`; create `prototype2/tests/resolve-week.test.mjs`

This applies one week: labor (tend/chop/harvest + the player's action), crop growth, eating, winter fuel burn, strain/condition, and loss — then advances the week or moves to Dusk.

- [ ] **Step 1: Write `prototype2/tests/resolve-week.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";

function inWeek(seed = 1) {
  let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return reduce(s, { type: "SOW" }); // phase week, week 1
}

describe("resolve week", () => {
  it("eating drains the larder by mouths × food/week", () => {
    let s = inWeek();
    const before = s.larder;
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.larder).toBe(before - 2 * BALANCE.foodPerMouthPerWeek); // 2 mouths
    expect(s.week).toBe(2);
  });
  it("a tended crop grows more than an untended one", () => {
    let s = inWeek();
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" }); // note: PLANT allowed pre-week too; here just seeds a field
    // field 0 planted, field 1 planted untended:
    s = reduce(s, { type: "PLANT", fieldId: 1, crop: "potato" });
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "tend", targetFieldId: 0 });
    s = reduce(s, { type: "RESOLVE_WEEK" });
    const f0 = s.fields.find((f) => f.id === 0), f1 = s.fields.find((f) => f.id === 1);
    expect(f0.progress).toBeGreaterThan(f1.progress);
    expect(f0.tended).toBe(false); // reset after the week
  });
  it("harvest of a ripe field adds food to the larder and clears the field", () => {
    let s = inWeek();
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 1.0, fert: 3 }; // ripe
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "harvest", targetFieldId: 0 });
    const before = s.larder;
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.larder).toBeGreaterThan(before - 2 * BALANCE.foodPerMouthPerWeek); // gained > it ate
    expect(s.fields.find((f) => f.id === 0).crop).toBe(null);
  });
  it("a starving hand accrues strain and can be lost", () => {
    let s = inWeek();
    s.larder = 0;
    for (let i = 0; i < 12 && s.hands[0].alive; i++) s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.hands[0].alive).toBe(false); // Reuben starved
    expect(s.log.some((l) => /Reuben/.test(l))).toBe(true);
  });
  it("resting recovers strain", () => {
    let s = inWeek();
    s.hands[0] = { ...s.hands[0], strain: 40, task: "rest" };
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.hands[0].strain).toBeLessThan(40);
  });
  it("after week 5 the phase becomes dusk", () => {
    let s = inWeek();
    for (let i = 0; i < 5; i++) s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.phase).toBe("dusk");
  });
});
```

- [ ] **Step 2: Extend `prototype2/src/core/reducer.js`** — add the case and helpers. Add imports at top: `import { BALANCE } from "./balance.js";` and `import { CROPS, ripe, weeklyGrowth } from "./crops.js";` and `import { livingHands } from "./state.js";` and the selectors you need (`import { mouths, burnsFuel } from "./selectors.js";`).

```javascript
    case "RESOLVE_WEEK":
      return resolveWeek(state);
```

```javascript
function resolveWeek(s) {
  let hands = s.hands.map((h) => ({ ...h }));       // work on copies
  let fields = s.fields.map((f) => ({ ...f }));
  let { larder, fuel, coin, seed } = s;
  const log = [];
  const St = BALANCE.strain;
  const byId = (id) => fields.find((f) => f.id === id);

  // 1) Labor: each living hand does its task; the player does theirs.
  const doLabor = (task, targetFieldId, isPlayer) => {
    if (task === "tend" && targetFieldId != null) { const f = byId(targetFieldId); if (f && f.crop) f.tended = true; }
    else if (task === "chop") { fuel += BALANCE.fuelPerChopWeek; }
    else if (task === "harvest" && targetFieldId != null) {
      const f = byId(targetFieldId);
      if (f && ripe(f)) {
        const c = CROPS[f.crop];
        const units = Math.round(c.yield * (f.fert / 3));
        if (c.food > 0) larder += units * c.food; else coin += units * c.sale;
        log.push(`Brought in ${f.crop === "cotton" ? "cotton" : c.name.toLowerCase()} from ${["the east field","the river strip","the near acre","the stone lot"][f.id]}.`);
        f.crop = null; f.progress = 0; f.fert = Math.max(0, f.fert - 1);
      }
    }
    return task === "tend" || task === "chop" || task === "harvest";
  };
  for (const h of hands) if (h.alive) { const hard = doLabor(h.task, h.targetFieldId, false); h.strain += hard ? St.hardLabor : (h.task === "rest" ? -St.restRecovery : 0); }
  // The player's own week:
  const pa = s.playerAction || { kind: "rest" };
  if (pa.kind === "work") doLabor("tend", pa.target, true);
  if (pa.kind === "care") { const h = hands.find((x) => x.id === pa.target && x.alive); if (h) h.strain -= St.careRecovery; }

  // 2) Crop growth (uses the tended flags set above), then reset tended.
  for (const f of fields) { if (f.crop) f.progress += weeklyGrowth(f, s.weather); f.tended = false; }

  // 3) Eating: the household eats; a shortfall strains the frailest first.
  const eaters = 1 + hands.filter((h) => h.alive).length;
  const foodWant = eaters * BALANCE.foodPerMouthPerWeek;
  if (larder >= foodWant) { larder -= foodWant; }
  else { larder = 0; strainFrailestFirst(hands, St.hungerPerWeek); }

  // 4) Winter/fall cold: fuel burns; a shortfall strains everyone.
  if (burnsFuel(s)) {
    const fuelWant = eaters * BALANCE.fuelPerMouthPerWeek;
    if (fuel >= fuelWant) fuel -= fuelWant;
    else { fuel = 0; for (const h of hands) if (h.alive) h.strain += St.coldPerWeek; }
  }

  // 5) Loss: clamp strain, and lose anyone past the threshold.
  for (const h of hands) {
    h.strain = Math.max(0, Math.min(St.lostAt, h.strain));
    if (h.alive && h.strain >= St.lostAt) { h.alive = false; log.push(`${h.name} did not last the week.`); }
  }

  // 6) Advance the week / into Dusk.
  let week = s.week + 1, phase = s.phase;
  if (week > BALANCE.weeksPerSeason) { week = BALANCE.weeksPerSeason; phase = "dusk"; }

  return { ...s, hands, fields, larder, fuel, coin, seed, week, phase, log: [...s.log, ...log] };
}

function strainFrailestFirst(hands, amount) {
  const living = hands.filter((h) => h.alive).sort((a, b) => b.strain - a.strain); // worst first
  for (const h of living) h.strain += amount; // a shared bite; the already-worst tip over first
}
```

- [ ] **Step 3: Run tests** → `cd prototype2 && npm test tests/resolve-week.test.mjs` — PASS. (If the "after week 5 → dusk" ordering surprises: `week` caps at 5 and phase flips to `dusk`; Task 6 leaves `dusk` for the report and `END_SEASON` to advance.)

- [ ] **Step 4: Commit**

```bash
git add prototype2/src/core/reducer.js prototype2/tests/resolve-week.test.mjs
git commit -m "feat(proto2): resolveWeek — labor, growth, eating, cold, strain, loss"
```

---

## Task 6: Season transition, Dusk data & the year's end (END_SEASON)

**Files:** Modify `prototype2/src/core/reducer.js`; create `prototype2/src/core/selectors.js` dusk helper; create `prototype2/tests/season.test.mjs`

- [ ] **Step 1: Add a `duskSummary` selector to `prototype2/src/core/selectors.js`**

```javascript
// The season's closing figures for the Dusk Report (Screen 06). Pure read.
export function duskSummary(s) {
  return {
    season: season(s),
    coin: s.coin,
    larder: Math.floor(s.larder),
    fuel: s.fuel,
    crew: livingHands(s).map((h) => h.name),
    lostThisSeason: s.log.filter((l) => /did not last/.test(l)),
    warnings: warnings(s),
  };
}
```

- [ ] **Step 2: Write `prototype2/tests/season.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState, season } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

function toDusk(s) {
  s = reduce(s, { type: "BEGIN_SEASON" });
  if (s.phase === "planting") s = reduce(s, { type: "SOW" });
  for (let i = 0; i < 5; i++) s = reduce(s, { type: "RESOLVE_WEEK" });
  return s; // phase dusk
}

describe("season transition", () => {
  it("END_SEASON from spring's dusk begins summer at the brief", () => {
    let s = toDusk(initialState(1));
    expect(s.phase).toBe("dusk");
    s = reduce(s, { type: "END_SEASON" });
    expect(season(s)).toBe("summer");
    expect(s.phase).toBe("brief");
  });
  it("END_SEASON from winter's dusk ends Year 1 (phase yearend)", () => {
    let s = initialState(1); s.seasonIndex = 3; // winter
    s = toDusk(s);
    s = reduce(s, { type: "END_SEASON" });
    expect(s.phase).toBe("yearend");
    expect(s.ended).toBe(true);
  });
});
```

- [ ] **Step 3: Add the `END_SEASON` case to `prototype2/src/core/reducer.js`**

```javascript
    case "END_SEASON":
      return endSeason(state);
```

```javascript
function endSeason(s) {
  if (season(s) === "winter") return { ...s, phase: "yearend", ended: true }; // Year-1 slice ends here (multi-year = Plan 5)
  let seasonIndex = s.seasonIndex + 1;
  return { ...s, seasonIndex, week: 1, phase: "brief" };
}
```

- [ ] **Step 4: Run tests** → `cd prototype2 && npm test tests/season.test.mjs` — PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/reducer.js prototype2/src/core/selectors.js prototype2/tests/season.test.mjs
git commit -m "feat(proto2): season transition, dusk summary, and the Year-1 end"
```

---

## Task 7: The phase router & the render entry point

**Files:** Create `prototype2/src/render/screens.js`, `prototype2/src/render/components.js`; modify `prototype2/src/main.js`, `prototype2/src/render/shell.js`; create `prototype2/tests/screens.test.mjs`

- [ ] **Step 1: Create `prototype2/src/render/components.js`** — the shared V0.3 choice card (Screen 04 grammar).

```javascript
import { el } from "./dom.js";
import { tok } from "../content/names.js";

// A dual-label choice card: title line + optional mechanical tag (Courier, valence-colored)
// + optional sub line; disabled shows the arithmetic instead of a hover. Matches Screen 04.
export function choiceCard(choice, onPick) {
  const disabled = !!choice.disabled;
  const tag = choice.tag ? el("span", { class: "ctag", text: choice.tag }) : null;
  const title = el("span", { class: "ctitle t-choice", text: tok(choice.text) }, tag ? [tag] : []);
  const sub = (disabled && choice.why) || choice.sub
    ? el("span", { class: "csub t-sub", text: tok((disabled && choice.why) || choice.sub) })
    : null;
  return el("button", {
    class: "choicecard" + (choice.primary ? " primary" : "") + (disabled ? " disabled" : ""),
    ...(disabled ? { disabled: true } : {}),
    onClick: disabled ? undefined : onPick,
  }, [title, sub]);
}

export function warnLines(list) {
  return list.length ? el("div", { class: "warnlines" }, list.map((w) => el("div", { class: "warnline t-sub", text: w }))) : null;
}
```

- [ ] **Step 2: Create `prototype2/src/render/screens.js`** — the router (per-phase renderers filled in Tasks 8–11; tab views in Task 12). Start with the router + a stub so the app runs:

```javascript
import { el } from "./dom.js";

// Fleshed out across Tasks 8-12. Renders the active screen into the shell's stage.
export function renderScreen(stage, state, dispatch) {
  const view = state.screen === "home" ? state.phase : state.screen;
  const fn = SCREENS[view] || SCREENS.unknown;
  fn(stage, state, dispatch);
}

const SCREENS = {
  unknown: (stage, s) => stage.append(el("p", { class: "t-prose", text: `(${s.screen}/${s.phase})` })),
  // brief, planting, week, dusk, yearend, fields, hands, ledger, almanac added in later tasks
};
export { SCREENS };
```

- [ ] **Step 3: Modify `prototype2/src/main.js`** — render the active screen instead of the placeholder:

```javascript
import { initialState } from "./core/state.js";
import { reduce } from "./core/reducer.js";
import { renderShell } from "./render/shell.js";
import { renderScreen } from "./render/screens.js";

export function boot(root, opts = {}) {
  let state = initialState(opts.seed ?? ((Math.random() * 1e9) >>> 0), opts.lineageName ?? "Crane");
  function dispatch(action) { state = reduce(state, action); render(); }
  function render() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
  render();
  return { getState: () => state, dispatch };
}

if (typeof document !== "undefined" && document.getElementById("app")) {
  window.__BB__ = boot(document.getElementById("app"));
}
export const __BOOTED__ = true;
```

- [ ] **Step 4: Modify `prototype2/src/render/shell.js`** — tabs dispatch `SET_SCREEN`, and show the ledger warning lines. In `renderShell`, change the nav tab buttons to add an `onClick`, and append `warnLines` under the ledger. Add `import { warnings } from "../core/selectors.js";` and `import { warnLines } from "./components.js";`. Change the tab map to:

```javascript
  const nav = el("nav", { class: "tabbar" }, TABS.map((t) => {
    const key = t.toLowerCase();
    const active = (state.screen === "home" ? "home" : state.screen) === key;
    return el("button", { class: "tab" + (active ? " sel" : ""), "data-tab": key,
      onClick: () => dispatch({ type: "SET_SCREEN", screen: key }), text: t });
  }));
```

And after building `ledger`, append the warnings: `const warns = warnLines(warnings(state));` then include `warns` in the `root.append(...)` (guard for null — `el`'s null-child skipping handles it, but append it only if present).

- [ ] **Step 5: Create `prototype2/tests/screens.test.mjs`** (grows in later tasks; start with the router + tab nav)

```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { renderShell } from "../src/render/shell.js";
import { renderScreen } from "../src/render/screens.js";

function mount(state) {
  const root = document.createElement("div");
  const dispatch = () => {};
  const stage = renderShell(root, state, dispatch);
  renderScreen(stage, state, dispatch);
  return root;
}

describe("shell + router", () => {
  it("clicking a tab dispatches SET_SCREEN", () => {
    const root = document.createElement("div");
    let state = initialState(1);
    const dispatch = (a) => { state = reduce(state, a); };
    renderShell(root, state, dispatch);
    root.querySelector('.tab[data-tab="hands"]').click();
    expect(state.screen).toBe("hands");
  });
  it("renders a ledger warning line when the larder is short", () => {
    const s = initialState(1); s.larder = 0;
    const root = mount(s);
    expect(root.querySelector(".warnline")).toBeTruthy();
  });
});
```

- [ ] **Step 6: Run tests** → `cd prototype2 && npm test tests/screens.test.mjs` — PASS. Run the full suite too.

- [ ] **Step 7: Commit**

```bash
git add prototype2/src/render/screens.js prototype2/src/render/components.js prototype2/src/main.js prototype2/src/render/shell.js prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): phase router, choice-card component, tab nav + ledger warnings"
```

---

## Task 8: The Morning Brief screen (design Screen 03)

**Files:** Modify `prototype2/src/render/screens.js`; add a test to `prototype2/tests/screens.test.mjs`

The season-open read. For the first Spring it pulls the existing script (`L("spring_open.*")`, tokenized); its choice "Begin" dispatches `BEGIN_SEASON`. Match design Screen 03's leaf (eyebrow, title, dropcap prose, choice cards).

- [ ] **Step 1: Add the `brief` renderer to `SCREENS` in `screens.js`.** Add `import { L } from "../content/script.js";` and `import { tok } from "../content/names.js";` and `import { choiceCard } from "./components.js";`.

```javascript
  brief: (stage, s, dispatch) => {
    const isFirst = s.year === 1 && s.seasonIndex === 0;
    const eyebrow = isFirst ? tok(L("spring_open.eyebrow")) : `${cap(s)} · a new season`;
    const title = isFirst ? tok(L("spring_open.title")) : "The season turns";
    const body = isFirst ? tok(L("spring_open.body")) : `<p>The work of ${cap(s)} is on you now.</p>`;
    stage.append(
      el("div", { class: "eyebrow t-label", text: eyebrow }),
      el("h2", { class: "t-title", text: title }),
      htmlProse(body),
      choiceCard({ text: "Begin", sub: "set the season to its work", primary: true }, () => dispatch({ type: "BEGIN_SEASON" })),
    );
  },
```

Add small helpers at the bottom of `screens.js`:

```javascript
import { season } from "../core/state.js";
function cap(s) { return { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" }[season(s)]; }
// The script bodies are HTML (from #46). Render them as real nodes.
function htmlProse(html) { const d = el("div", { class: "prose t-prose" }); d.innerHTML = html; return d; }
```

- [ ] **Step 2: Add a test to `screens.test.mjs`**

```javascript
import { renderScreen as _r } from "../src/render/screens.js"; // already imported above; ensure single import
describe("morning brief", () => {
  it("year-1 spring shows the uncle's-ground brief and Begin advances to planting", () => {
    const root = document.createElement("div");
    let state = initialState(1, "Mackall");
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch);
    renderScreen(stage, state, dispatch);
    expect(root.textContent).toContain("Your uncle's ground");
    expect(root.textContent).toContain("Malachi"); // {{npc.malachi}} resolved
    root.querySelector(".choicecard").click();
    expect(state.phase).toBe("planting");
  });
});
```

- [ ] **Step 3: Run** → PASS. **Step 4: Commit** `feat(proto2): Morning Brief screen (season open, script-driven)`.

---

## Task 9: The Planting screen (design Screen 05)

**Files:** Modify `prototype2/src/render/screens.js`; add tests to `screens.test.mjs`

The four fields; for each empty field a crop picker (staple + cash tiers) with seed/cost + fertility; a running spend; planted fields show "in the ground"; a fallow option; "Sow it so" dispatches `SOW`. Match Screen 05.

- [ ] **Step 1: Add the `planting` renderer.** Add `import { CROPS } from "../core/crops.js";` and `import { fieldLabel } from "../core/selectors.js";`.

```javascript
  planting: (stage, s, dispatch) => {
    stage.append(el("div", { class: "eyebrow t-label", text: "Dawn · Planting" }), el("h2", { class: "t-title", text: "Set the fields" }));
    for (const f of s.fields) {
      const row = el("div", { class: "fieldrow" }, [
        el("div", { class: "fieldname t-choice", text: fieldLabel(f) }),
        el("div", { class: "fert", text: "fert " + "●".repeat(f.fert) + "○".repeat(3 - f.fert) }),
      ]);
      if (f.crop) row.append(el("div", { class: "t-sub", text: `${CROPS[f.crop].name}, in the ground` }),
        el("button", { class: "linkbtn t-sub", text: "clear", onClick: () => dispatch({ type: "FALLOW", fieldId: f.id }) }));
      else {
        const picker = el("div", { class: "croppick" }, Object.entries(CROPS).map(([key, c]) => {
          const cost = c.seed, afford = s.seed + s.coin >= cost;
          return el("button", { class: "cropchip t-sub" + (afford ? "" : " disabled"), ...(afford ? {} : { disabled: true }),
            text: `${c.name} · ${c.seed} seed`, onClick: afford ? () => dispatch({ type: "PLANT", fieldId: f.id, crop: key }) : undefined });
        }));
        row.append(picker);
      }
      stage.append(row);
    }
    stage.append(choiceCard({ text: "Sow it so", sub: "put the season in the ground", primary: true }, () => dispatch({ type: "SOW" })));
  },
```

- [ ] **Step 2: Add tests** — planting screen shows four field rows; clicking a crop chip plants it and re-renders it as "in the ground"; "Sow it so" advances to `week`.

```javascript
describe("planting screen", () => {
  it("plants a crop from the picker and sows into the week", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelectorAll(".fieldrow").length).toBe(4);
    root.querySelector(".cropchip:not(.disabled)").click(); // plant field 0
    expect(state.fields[0].crop).toBeTruthy();
    [...root.querySelectorAll(".choicecard")].find((b) => /Sow/.test(b.textContent)).click();
    expect(state.phase).toBe("week");
  });
});
```

- [ ] **Step 3: Run** → PASS. **Step 4: Commit** `feat(proto2): Planting screen (fields, crop picker, sow)`.

---

## Task 10: The Weekly Plan screen (the two-economy beat — designed in V0.3 language)

**Files:** Modify `prototype2/src/render/screens.js`; add tests to `screens.test.mjs`

The heart. Shows the week's read (weather, warnings ride in the shell); each living hand gets a task selector (Rest · Tend a field · Harvest · Chop); the player picks their own action (Work a field · Rest · Care for a hand); "Put them to work" dispatches `RESOLVE_WEEK`. This screen is *newer than the mockups* — build it in the V0.3 grammar (leaf, `t-choice`/`t-sub`, the choice-card look) and flag anything that fights the design for the user.

- [ ] **Step 1: Add the `week` renderer.** Add `import { conditionOf, ripeFields } from "../core/selectors.js";`.

```javascript
  week: (stage, s, dispatch) => {
    stage.append(el("div", { class: "eyebrow t-label", text: `Week ${s.week} of ${5}` }), el("h2", { class: "t-title", text: "Set the crew to work" }));
    const TASKS = [["rest", "Rest"], ["tend", "Tend"], ["harvest", "Harvest"], ["chop", "Chop wood"]];
    const plantedFields = s.fields.filter((f) => f.crop);
    for (const h of s.hands.filter((x) => x.alive)) {
      const row = el("div", { class: "handrow" }, [
        el("span", { class: "hname t-choice", text: h.name }),
        el("span", { class: "hcond t-sub", text: conditionOf(h) }),
      ]);
      const sel = el("div", { class: "taskpick" }, TASKS.map(([task, label]) =>
        el("button", { class: "taskbtn t-sub" + (h.task === task ? " sel" : ""), text: label,
          onClick: () => dispatch({ type: "ASSIGN", handId: h.id, task,
            targetFieldId: task === "tend" ? (plantedFields[0]?.id) : task === "harvest" ? (ripeFields(s)[0]?.id) : undefined }) })));
      row.append(sel);
      stage.append(row);
    }
    // The player's own week
    stage.append(el("div", { class: "eyebrow t-label", text: "Your own week" }));
    const P = [["rest", "Rest"], ["work", "Work a field"], ["care", "Sit with a hand"]];
    stage.append(el("div", { class: "taskpick" }, P.map(([kind, label]) =>
      el("button", { class: "taskbtn t-sub" + (s.playerAction?.kind === kind ? " sel" : ""), text: label,
        onClick: () => dispatch({ type: "SET_PLAYER_ACTION", kind,
          target: kind === "work" ? (plantedFields[0]?.id) : kind === "care" ? (s.hands.find((x) => x.alive)?.id) : undefined }) }))));
    stage.append(choiceCard({ text: "Put them to work", sub: "let the week play out", primary: true }, () => dispatch({ type: "RESOLVE_WEEK" })));
  },
```

*(Targeting is simplified for Plan 2: tend/harvest/work default to the first sensible field. Per-field target selection is a Plan-3 refinement; note it if it feels limiting when you build it.)*

- [ ] **Step 2: Add a test** — the week screen lists a task row per living hand; assigning + "Put them to work" advances the week.

```javascript
describe("weekly plan screen", () => {
  it("assigns a hand and resolves the week", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" }); // phase week
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelectorAll(".handrow").length).toBe(1); // Reuben
    root.querySelector('.handrow .taskbtn').click(); // pick a task
    [...root.querySelectorAll(".choicecard")].find((b) => /Put them/.test(b.textContent)).click();
    expect(state.week).toBe(2);
  });
});
```

- [ ] **Step 3: Run** → PASS. **Step 4: Commit** `feat(proto2): Weekly Plan screen (crew tasks + player action → resolve)`.

---

## Task 11: The Dusk Report & the Year-1 end (design Screen 06)

**Files:** Modify `prototype2/src/render/screens.js`; add tests to `screens.test.mjs`

Dusk shows the season's accounts (from `duskSummary`) with the day-book feel; "Turn the page" dispatches `END_SEASON`. Winter's dusk names anyone lost. `yearend` shows the survival verdict + "Play another first year" (re-boot).

- [ ] **Step 1: Add the `dusk` and `yearend` renderers.** Add `import { duskSummary } from "../core/selectors.js";`.

```javascript
  dusk: (stage, s, dispatch) => {
    const d = duskSummary(s);
    stage.append(el("div", { class: "eyebrow t-label", text: `Dusk · ${cap(s)}` }), el("h2", { class: "t-title", text: "The day-book, closed" }));
    const book = el("div", { class: "daybook" }, [
      line("Coin in hand", `${d.coin} m`), line("Larder into next season", `${d.larder} food`),
      line("Fuel laid by", `${d.fuel}`), line("The crew that stands", d.crew.join(", ") || "only you"),
    ]);
    stage.append(book);
    for (const l of d.lostThisSeason) stage.append(el("p", { class: "omen t-sub", text: l }));
    for (const w of d.warnings) stage.append(el("p", { class: "warnline t-sub", text: w }));
    stage.append(choiceCard({ text: "Turn the page", sub: "on to what comes next", primary: true }, () => dispatch({ type: "END_SEASON" })));
  },
  yearend: (stage, s, dispatch) => {
    stage.append(el("div", { class: "verdict t-label", text: "Year One · closed" }),
      el("h2", { class: "t-title", text: "“I survived another year.”" }),
      el("p", { class: "prose t-prose", text: `The ${cap({ seasonIndex: 3 })} broke, and the household woke to the thaw. You made it. Not everyone does.` }),
      choiceCard({ text: "Play another first year", sub: "a new seed, a new weather", primary: true }, () => { location.reload && location.reload(); }));
  },
```

Add the `line` helper:

```javascript
function line(label, value) {
  return el("div", { class: "bookline" }, [el("span", { class: "t-sub", text: label }), el("span", { class: "t-choice", text: value })]);
}
```

- [ ] **Step 2: Add a test** — after 5 resolved weeks, `dusk` shows the day-book; "Turn the page" → next season's brief; from winter it reaches `yearend`.

```javascript
describe("dusk + year end", () => {
  it("shows the day-book at dusk and turns the page to the next season", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    for (let i = 0; i < 5; i++) state = reduce(state, { type: "RESOLVE_WEEK" });
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    expect(root.querySelector(".daybook")).toBeTruthy();
    [...root.querySelectorAll(".choicecard")].find((b) => /Turn the page/.test(b.textContent)).click();
    expect(state.phase).toBe("brief");
  });
});
```

- [ ] **Step 3: Run** → PASS. **Step 4: Commit** `feat(proto2): Dusk Report + Year-1 verdict screens`.

---

## Task 12: Read-only tab views (Fields · Hands · Ledger) + minimal styles

**Files:** Modify `prototype2/src/render/screens.js`; create `prototype2/src/styles/screens.css`; link it in `index.html`; add tests

The Fields/Hands/Ledger/Almanac tabs are status views you can open anytime. For Plan 2: Fields lists each field's crop/progress/fert; Hands lists each hand + condition (design Screen 07 roster); Ledger explains the four figures; Almanac is a "not yet" stub. Add just enough CSS for the new screen elements to read cleanly in the V0.3 language.

- [ ] **Step 1: Add `fields`, `hands`, `ledger`, `almanac` renderers to `SCREENS`.** (Concrete code, mirroring the patterns above: iterate `s.fields` / `livingHands(s)`; use `conditionOf`, `fieldLabel`, `CROPS`, `ripe`; `t-*` classes. Keep each ~10 lines.)

- [ ] **Step 2: Create `prototype2/src/styles/screens.css`** — layout for `.eyebrow`, `.prose`, `.choicecard` (+ `.primary`/`.disabled`), `.ctag` (Courier, valence via `--good`/`--bad`/`--accent`), `.fieldrow`/`.croppick`/`.cropchip`, `.handrow`/`.taskpick`/`.taskbtn` (+ `.sel` using `--lamp`), `.daybook`/`.bookline`, `.warnlines`/`.warnline` (use `--bad`), `.omen` (use `--omen`). Use only token vars, no hardcoded colors. Reference design Screens 04/05/06/07 for spacing and hierarchy; extract exact values from `design/version-1`.

- [ ] **Step 3: Link it** — add `<link rel="stylesheet" href="src/styles/screens.css" />` to `prototype2/index.html` (after `shell.css`).

- [ ] **Step 4: Add tests** — the Hands tab lists each living hand with a condition; the Fields tab lists four fields.

- [ ] **Step 5: Run** the full suite → all green. **Step 6: Commit** `feat(proto2): Fields/Hands/Ledger tab views + screen styles`.

---

## Task 13: The full Year-1 headless playthrough

**Files:** Create `prototype2/tests/playthrough.test.mjs`

Prove the loop never wedges and a sensible strategy survives to `yearend`.

- [ ] **Step 1: Write `prototype2/tests/playthrough.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState, season } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { ripeFields, emptyFields } from "../src/core/selectors.js";

// A cautious auto-player: plant potatoes, harvest what's ripe, chop in fall/winter, else tend.
function autoPlay(seed) {
  let s = initialState(seed, "Mackall");
  let guard = 0;
  while (!s.ended && guard++ < 500) {
    if (s.phase === "brief") s = reduce(s, { type: "BEGIN_SEASON" });
    else if (s.phase === "planting") {
      for (const f of emptyFields(s)) s = reduce(s, { type: "PLANT", fieldId: f.id, crop: "potato" });
      s = reduce(s, { type: "SOW" });
    } else if (s.phase === "week") {
      const ripe = ripeFields(s)[0];
      const cold = season(s) === "fall" || season(s) === "winter";
      s = reduce(s, { type: "ASSIGN", handId: "reuben",
        task: ripe ? "harvest" : cold ? "chop" : "tend",
        targetFieldId: ripe ? ripe.id : s.fields.find((f) => f.crop)?.id });
      s = reduce(s, { type: "SET_PLAYER_ACTION", kind: cold ? "rest" : "work", target: s.fields.find((f) => f.crop)?.id });
      s = reduce(s, { type: "RESOLVE_WEEK" });
    } else if (s.phase === "dusk") s = reduce(s, { type: "END_SEASON" });
  }
  return s;
}

describe("year 1 playthrough", () => {
  it("reaches the year's end without wedging, for several seeds", () => {
    for (const seed of [1, 7, 42, 99]) {
      const s = autoPlay(seed);
      expect(s.ended).toBe(true);
      expect(s.phase).toBe("yearend");
      expect(s.year).toBe(1);
    }
  });
  it("a fed, well-managed cautious line keeps Reuben alive to spring", () => {
    const s = autoPlay(7);
    expect(s.hands.find((h) => h.id === "reuben").alive).toBe(true);
  });
});
```

- [ ] **Step 2: Run it** → `cd prototype2 && npm test tests/playthrough.test.mjs`. If a seed wedges or starves the cautious line, the loop or the first-pass balance needs a look — fix the loop bug, or nudge `balance.js` (and note the change), then re-run. The *loop* must be robust; the exact survival margin is the balance model's to tune later.

- [ ] **Step 3: Run the whole suite** → `cd prototype2 && npm test` — all green.

- [ ] **Step 4: Verify in the browser** — start the `prototype2` preview and play a full Year 1 by hand: plant, assign, resolve five weeks, read the Dusk report, carry through to winter and the verdict. Confirm the six-tab views open and the ledger warnings appear when short.

- [ ] **Step 5: Commit** `test(proto2): full Year-1 headless playthrough + balance sanity`.

---

## Self-Review

**Spec coverage (Plan 2 = spec §10's playable core, minus the deferred drama):**
- Two economies (crew + your week) → Tasks 4, 10. Weekly beat (read→assign→act→resolve) → Tasks 5, 10. Crew tasks (tend/harvest/chop/rest) → Tasks 4/5/10. Crops → Tasks 1/3/9. Hands as mortal individuals via the condition track + loss → Tasks 2/5 (burial ritual/traits/cruelty **deferred to Plan 3**, as scoped). The four live resources (eating, winter fuel) → Task 5; spoilage/forage/preserve **deferred**. Season transition + winter survival + verdict → Tasks 6/11. V0.3 screens (Morning Brief/Planting/play/Dusk/roster) → Tasks 8–12.
- **Explicitly deferred (not gaps):** events, the reckoning biting, town, multi-year/mortgage/legacy, Almanac/journals, art/fonts — Plans 3–6.

**Placeholder scan:** Task 12 Steps 1/2 describe the tab renderers and `screens.css` at the pattern level rather than pasting every line — this is deliberate (they mechanically mirror Tasks 8–11's fully-shown patterns and must match design Screens 04–07, whose exact values live in `design/version-1`); the engineer has complete analogous code and the design file. No "TBD"/"implement later" in the logic tasks. Balance numbers are real values in `balance.js`, flagged as model-owned — not placeholders.

**Type consistency:** action types (`SET_THEME`, `SET_SCREEN`, `BEGIN_SEASON`, `PLANT`, `FALLOW`, `SOW`, `ASSIGN`, `SET_PLAYER_ACTION`, `RESOLVE_WEEK`, `END_SEASON`), `initialState`/`reduce`, `conditionOf`, `mouths`, `warnings`, `duskSummary`, `ripe`/`weeklyGrowth`, `fieldLabel`, `choiceCard`, `renderScreen`/`SCREENS`, and the state fields (`phase`, `screen`, `playerAction`, `hand.strain`, `field.tended`) are used identically across tasks and tests.

---

## Next plans

Plan 3 — Depth & drama (events with lasting consequences, the reckoning biting, death's burial ritual + traits + the moral weight, forage/hunt/preserve, spoilage). Plan 4 — The town. Plan 5 — The year & the squeeze. Plan 6 — Polish & the Almanac.
