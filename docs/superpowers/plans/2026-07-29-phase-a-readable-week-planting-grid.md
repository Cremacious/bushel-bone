# Phase A — The Readable Week & the Planting Grid — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the "blind and repetitive" core of the weekly loop — give the player an information layer to plan against (per-field projections + warnings), pre-fill Reuben's recommended plan so a week is adjust-not-build, and rebuild the planting screen as a smooth field grid where picking a crop updates one cell (no full-panel flash) and Sow is always in view.

**Architecture:** Extends prototype2's pure `(state, action) => state` core and its stateless render layer. New pure selectors (`fieldProjection`, `suggestPlan`) compute the information and the recommendation; a reducer helper pre-fills each week's tasks from the recommendation; the render layer gains a shared field-card component and reworked planting/weekly screens. The "flash on every pick" is fixed by only playing the `Turn` motion on a real beat change (phase/screen), not on every render.

**Tech Stack:** Same as prototype2 — vanilla ES modules, `vitest`/`jsdom`, the V0.3 shell/tokens/`el()`. No new dependencies.

**Design source:** `docs/superpowers/specs/2026-07-29-minute-to-minute-gameplay-design.md` (§3 season shape, §4 information layer, §5 weekly loop, §8 planting redesign). Weather variety + the multi-week forecast + the storm are Phase B; this plan shows the *current* single weather and the projections/warnings that do not depend on weather variety.

**Balance note:** projection math uses the existing `BALANCE`/`CROPS` values (base growth `0.2`/week). Numbers are the balance model's to tune (Q-003); get the *reads* correct and legible.

---

## File Structure

```
prototype2/src/core/
  selectors.js   # MODIFY — add fieldProjection() and suggestPlan() (pure reads)
  reducer.js     # MODIFY — apply the suggested plan when a week begins (SOW + week-advance)
prototype2/src/render/
  components.js   # MODIFY — add fieldCard() (shared by planting + the weekly board)
  screens.js      # MODIFY — rebuild the `planting` and `week` renderers
  shell.js        # MODIFY — renderShell takes { animate } so Turn plays only on beat change
  main.js         # MODIFY — track the view key; animate only when it changes
prototype2/src/styles/
  screens.css     # MODIFY — field-grid + field-card + weekly-board styles
prototype2/tests/
  projection.test.mjs  # NEW — fieldProjection + suggestPlan
  planting.test.mjs    # MODIFY — grid behaviour (pick updates a cell, sow commits)
  screens.test.mjs     # MODIFY — the readable week shows projections + pre-filled plan
  motion.test.mjs      # NEW — Turn plays on beat change, not on same-view re-render
```

Boundaries: `selectors.js` stays pure (no DOM, no mutation). `reducer.js` owns the pre-fill. `components.js` owns the reusable field card. `screens.js` reads state + dispatches, never mutates.

---

## Task 1: Play the "Turn" motion only on a beat change

The planting flash (and the general "every click re-animates the screen") is `.m-turn` replaying on every render because `renderShell` always stamps `m-turn` on a fresh `<main>`. Make the motion semantic: it plays when the *beat* changes (a new phase/screen), not on an in-screen interaction. This is what makes per-pick planting feel smooth.

**Files:** Modify `prototype2/src/render/shell.js`, `prototype2/src/main.js`; create `prototype2/tests/motion.test.mjs`

- [ ] **Step 1: Write the failing test `prototype2/tests/motion.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { boot } from "../src/main.js";

describe("Turn motion", () => {
  it("plays on the first render and on a beat change, not on a same-view re-render", () => {
    const root = document.createElement("div");
    const app = boot(root, { seed: 1, lineageName: "Mackall" });
    // first paint is a beat change (null -> brief): animated
    expect(root.querySelector(".stage").classList.contains("m-turn")).toBe(true);
    // a same-view re-render (toggle theme; still the brief) must NOT re-animate
    app.dispatch({ type: "SET_THEME", theme: "day" });
    expect(root.querySelector(".stage").classList.contains("m-turn")).toBe(false);
    // a real beat change (into planting) animates again
    app.dispatch({ type: "BEGIN_SEASON" });
    expect(root.querySelector(".stage").classList.contains("m-turn")).toBe(true);
  });
});
```

- [ ] **Step 2: Run it, expect failure** — `cd prototype2 && npm test tests/motion.test.mjs` → FAIL (theme toggle still shows `m-turn`).

- [ ] **Step 3: Modify `prototype2/src/render/shell.js`** — accept an `animate` option and gate the class. Change the signature line and the stage line:

```javascript
export function renderShell(root, state, dispatch, { animate = true } = {}) {
```

and

```javascript
  // A fresh <main> each render; .m-turn (the "Turn" beat motion) is added only when the
  // beat actually changed (see main.js), so in-screen interactions do not re-animate.
  const stage = el("main", { class: "stage" + (animate ? " m-turn" : ""), id: "stage" });
```

- [ ] **Step 4: Modify `prototype2/src/main.js`** — track the last view key and pass `animate`. Replace the `render` function and add a `viewKey` helper:

```javascript
export function boot(root, opts = {}) {
  let state = initialState(opts.seed ?? ((Math.random() * 1e9) >>> 0), opts.lineageName ?? "Crane");
  let lastView = null; // the beat currently on screen; a change replays the Turn motion
  function dispatch(action) {
    state = reduce(state, action);
    const tip = pendingTip(state);
    if (tip) state = { ...state, overlay: { type: "reuben-tip", tipId: tip.id, pages: tip.pages, page: 0 } };
    render();
  }
  function render() {
    const view = viewKey(state);
    const animate = view !== lastView;
    lastView = view;
    const stage = renderShell(root, state, dispatch, { animate });
    renderScreen(stage, state, dispatch);
    renderOverlay(root, state, dispatch);
  }
  if (opts.tutorialPrompt) state = { ...state, overlay: tutorialOptIn() };
  render();
  return { getState: () => state, dispatch };
}

// The "beat" on screen: the active tab, or the phase when on Home. Overlays and in-screen
// interactions (planting picks, week adjustments) keep the same key, so they do not re-animate.
function viewKey(s) { return s.screen === "home" ? s.phase : s.screen; }
```

- [ ] **Step 5: Run the test** → `cd prototype2 && npm test tests/motion.test.mjs` — PASS. Run the full suite; existing shell/screen tests call `renderShell` directly (default `animate:true`), so `.m-turn` is still present there.

- [ ] **Step 6: Commit**

```bash
git add prototype2/src/render/shell.js prototype2/src/main.js prototype2/tests/motion.test.mjs
git commit -m "feat(proto2): play the Turn motion only on a beat change, not every render"
```

---

## Task 2: Per-field projection selector

The read that makes planning possible: for a planted field, when it ripens (in plain language) and what it will yield. Pure, so the render layer and tests share it.

**Files:** Modify `prototype2/src/core/selectors.js`; create `prototype2/tests/projection.test.mjs`

- [ ] **Step 1: Write the failing test `prototype2/tests/projection.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { fieldProjection } from "../src/core/selectors.js";

function planted(crop, progress, fert = 3) {
  const s = reduce(initialState(1), { type: "BEGIN_SEASON" }); // spring, phase planting
  s.fields[0] = { ...s.fields[0], crop, progress, fert, tended: false };
  return { s, f: s.fields[0] };
}

describe("fieldProjection", () => {
  it("an empty field projects nothing", () => {
    const s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    expect(fieldProjection(s, s.fields[0]).crop).toBe(null);
  });
  it("a fresh 1-season crop ripens within the season and projects a food yield", () => {
    const { s, f } = planted("potato", 0);
    const p = fieldProjection(s, f);
    expect(p.ripe).toBe(false);
    expect(p.weeksToRipe).toBe(5);      // 1 season / 0.2 per week
    expect(p.when).toBe("ripens wk 5");
    expect(p.yield).toEqual({ amount: 20, kind: "food" }); // 10 units * 2 food at fert 3
  });
  it("a 2-season crop reads as ripening next season and projects a coin yield", () => {
    const { s, f } = planted("corn", 0);
    const p = fieldProjection(s, f);
    expect(p.when).toBe("ripens next season");
    expect(p.yield.kind).toBe("coin");
    expect(p.needsTwo).toBe(false);
  });
  it("a ripe field reads as ripe", () => {
    const { s, f } = planted("potato", 1);
    const p = fieldProjection(s, f);
    expect(p.ripe).toBe(true);
    expect(p.when).toBe("ripe");
  });
});
```

- [ ] **Step 2: Run it, expect failure** — `cd prototype2 && npm test tests/projection.test.mjs` → FAIL (not exported).

- [ ] **Step 3: Modify `prototype2/src/core/selectors.js`** — add the import and the selector. The file already imports `CROPS, ripe` from crops and `BALANCE` is available via `./balance.js`; add `BALANCE` and `WEEKS_PER_SEASON` imports if not present. At the top it currently has `import { BALANCE } from "./balance.js";` and `import { CROPS, ripe } from "./crops.js";` — confirm both exist, then add:

```javascript
// A plain-language read of a planted field: when it ripens and what it will yield, at the
// base growth rate (ignoring tend/weather, which only ever help). Pure. Weeks are counted
// from the current playing week (or the season's start during planting).
export function fieldProjection(state, field) {
  const c = field.crop && CROPS[field.crop];
  if (!c) return { crop: null };
  const remaining = Math.max(0, c.seasons - field.progress);
  const weeksToRipe = remaining <= 1e-9 ? 0 : Math.ceil(remaining / BALANCE.growthPerWeek);
  const base = state.phase === "week" ? state.week : 0;   // planting: from week 0
  const ripenWeek = base + weeksToRipe;
  const units = Math.round(c.yield * (field.fert / 3));
  const y = c.food > 0 ? { amount: Math.round(units * c.food), kind: "food" }
                       : { amount: units * c.sale, kind: "coin" };
  let when;
  if (weeksToRipe === 0) when = "ripe";
  else if (ripenWeek <= BALANCE.weeksPerSeason) when = `ripens wk ${ripenWeek}`;
  else if (c.seasons > 1) when = "ripens next season";
  else when = "won't ripen in time";
  return { crop: field.crop, name: c.name, tier: c.tier, ripe: weeksToRipe === 0,
    weeksToRipe, when, yield: y, needsTwo: !!c.needsTwo };
}
```

- [ ] **Step 4: Run the test** → PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/selectors.js prototype2/tests/projection.test.mjs
git commit -m "feat(proto2): fieldProjection selector (ripen timing + projected yield)"
```

---

## Task 3: Reuben's suggested plan

A pure recommendation: for the current week, what each living hand should do and how the player should spend their week. This is what pre-fills the weekly screen so it is adjust-not-build.

**Files:** Modify `prototype2/src/core/selectors.js`; add tests to `prototype2/tests/projection.test.mjs`

- [ ] **Step 1: Add the failing test to `prototype2/tests/projection.test.mjs`**

```javascript
import { suggestPlan } from "../src/core/selectors.js";

describe("suggestPlan", () => {
  function week(seed = 1) {
    let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
    return reduce(s, { type: "SOW" }); // phase week, nothing planted
  }
  it("recommends harvesting a ripe field first", () => {
    let s = week();
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 1, fert: 3 };
    const plan = suggestPlan(s);
    expect(plan.hands.reuben).toEqual({ task: "harvest", targetFieldId: 0 });
  });
  it("recommends tending a growing crop when nothing is ripe", () => {
    let s = week();
    s.fields[1] = { ...s.fields[1], crop: "potato", progress: 0.2, fert: 3 };
    const plan = suggestPlan(s);
    expect(plan.hands.reuben).toEqual({ task: "tend", targetFieldId: 1 });
  });
  it("recommends resting when there is no field work to do", () => {
    const s = week(); // nothing planted
    expect(suggestPlan(s).hands.reuben.task).toBe("rest");
  });
});
```

- [ ] **Step 2: Run it, expect failure** — FAIL (not exported).

- [ ] **Step 3: Modify `prototype2/src/core/selectors.js`** — add `suggestPlan`. It uses `livingHands` (already imported) and `ripeFields`/`burnsFuel`/`mouths` (in this file). Add:

```javascript
// Reuben's recommended plan for the current week: a task per living hand and the player's
// own week. A sane default a newcomer can accept, and the baseline the player adjusts from.
// Heuristic: bring in what is ripe, then chop when the cold is coming and fuel is short,
// then tend the least-grown planted field, else rest. One ripe field is worked by one hand.
export function suggestPlan(state) {
  const living = livingHands(state);
  const ripe = ripeFields(state).map((f) => f.id);
  const growing = state.fields.filter((f) => f.crop && !ripe.includes(f.id))
    .sort((a, b) => a.progress - b.progress).map((f) => f.id);
  const cold = burnsFuel(state);
  const fuelShort = cold && state.fuel < mouths(state) * BALANCE.fuelPerMouthPerWeek;
  const hands = {};
  const ripeQueue = [...ripe];
  for (const h of living) {
    if (ripeQueue.length) hands[h.id] = { task: "harvest", targetFieldId: ripeQueue.shift() };
    else if (fuelShort) hands[h.id] = { task: "chop", targetFieldId: undefined };
    else if (growing.length) hands[h.id] = { task: "tend", targetFieldId: growing[0] };
    else hands[h.id] = { task: "rest", targetFieldId: undefined };
  }
  // The player's own week: lend a hand on a growing field, else rest (see spec §5 — early
  // it is an optional bonus, never a slot the player is punished for spending).
  const player = growing.length ? { kind: "work", target: growing[0] } : { kind: "rest", target: undefined };
  return { hands, player };
}
```

- [ ] **Step 4: Run the test** → PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/selectors.js prototype2/tests/projection.test.mjs
git commit -m "feat(proto2): suggestPlan — Reuben's recommended weekly plan"
```

---

## Task 4: Pre-fill the suggested plan when a week begins

So the weekly screen opens already showing Reuben's plan, apply `suggestPlan` to the hands' tasks and the player action whenever a fresh week starts: on `SOW` (into week 1) and each time `resolveWeek` advances to the next week. `ASSIGN`/`SET_PLAYER_ACTION` then override.

**Files:** Modify `prototype2/src/core/reducer.js`; create/modify `prototype2/tests/prefill.test.mjs`

- [ ] **Step 1: Write the failing test `prototype2/tests/prefill.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

describe("weekly pre-fill", () => {
  it("SOW pre-fills each hand's task from Reuben's plan", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });      // planting
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });   // one growing field
    s = reduce(s, { type: "SOW" });                                  // -> week 1
    const reuben = s.hands.find((h) => h.id === "reuben");
    expect(reuben.task).toBe("tend");
    expect(reuben.targetFieldId).toBe(0);
    expect(s.playerAction).toEqual({ kind: "work", target: 0 });
  });
  it("advancing to the next week re-fills from the new board", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    s = reduce(s, { type: "SOW" });
    s = reduce(s, { type: "RESOLVE_WEEK" }); // -> week 2, re-filled
    expect(s.hands.find((h) => h.id === "reuben").task).toBe("tend");
  });
});
```

- [ ] **Step 2: Run it, expect failure** — FAIL (`SOW` leaves the default `rest`).

- [ ] **Step 3: Modify `prototype2/src/core/reducer.js`** — import `suggestPlan` and add a helper that applies it; call it from `SOW` and from `resolveWeek`'s week-advance. Add to the imports at the top (the file already imports from `./selectors.js`): change that import to include `suggestPlan`:

```javascript
import { burnsFuel, fieldLabel, suggestPlan } from "./selectors.js";
```

Add the helper near `beginSeason`:

```javascript
// Pre-fill the crew's tasks and the player's own week from Reuben's recommendation for the
// board as it stands. Called whenever a fresh week starts; the player overrides via ASSIGN.
function withSuggestedPlan(s) {
  const plan = suggestPlan(s);
  const hands = s.hands.map((h) => (h.alive && plan.hands[h.id])
    ? { ...h, task: plan.hands[h.id].task, targetFieldId: plan.hands[h.id].targetFieldId } : h);
  return { ...s, hands, playerAction: plan.player };
}
```

Change the `SOW` case to pre-fill:

```javascript
    case "SOW":
      return withSuggestedPlan({ ...state, phase: "week", week: 1 });
```

In `resolveWeek`, find the week-advance tail:

```javascript
  // 6) Advance the week / into Dusk.
  let week = s.week + 1, phase = s.phase;
  if (week > BALANCE.weeksPerSeason) { week = BALANCE.weeksPerSeason; phase = "dusk"; }

  return { ...s, hands, fields, larder, fuel, coin, seed, week, phase, log: [...s.log, ...log] };
```

Replace the `return` so that when the week advances (not into dusk) the next week is pre-filled:

```javascript
  const next = { ...s, hands, fields, larder, fuel, coin, seed, week, phase, log: [...s.log, ...log] };
  return phase === "week" ? withSuggestedPlan(next) : next;
```

- [ ] **Step 4: Run the tests** → `cd prototype2 && npm test tests/prefill.test.mjs` — PASS. Run the full suite: `resolve-week.test.mjs` and `screens.test.mjs` may assert hands start on `rest` at week start — update those assertions to the pre-filled value (do not weaken them; the hands now start on Reuben's suggestion). The two-hand cotton test assigns explicitly, so it is unaffected.

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/reducer.js prototype2/tests/prefill.test.mjs prototype2/tests/resolve-week.test.mjs prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): pre-fill each week from Reuben's suggested plan"
```

---

## Task 5: A shared field-card component

One card renders a field's read — name, crop, a growth bar, the projection, and fertility — used by both the planting grid and the weekly board.

**Files:** Modify `prototype2/src/render/components.js`; add a test to `prototype2/tests/components.test.mjs`

- [ ] **Step 1: Add the failing test to `prototype2/tests/components.test.mjs`**

```javascript
import { fieldCard } from "../src/render/components.js";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { fieldProjection } from "../src/core/selectors.js";

describe("fieldCard", () => {
  it("shows the field name, the crop, and the projection", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 0, fert: 3 };
    const card = fieldCard(s.fields[0], fieldProjection(s, s.fields[0]));
    expect(card.querySelector(".fc-name").textContent).toContain("East Field");
    expect(card.textContent).toContain("Potato");
    expect(card.textContent).toContain("ripens wk 5");
    expect(card.textContent).toContain("20 food");
  });
  it("an empty field reads as fallow", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    const card = fieldCard(s.fields[0], fieldProjection(s, s.fields[0]));
    expect(card.textContent.toLowerCase()).toContain("fallow");
  });
});
```

- [ ] **Step 2: Run it, expect failure** — FAIL (not exported).

- [ ] **Step 3: Modify `prototype2/src/render/components.js`** — add the import and the component. Add near the top: `import { fieldLabel } from "../core/selectors.js";` (only if not already imported — check; if `components.js` has no selectors import, add it). Then:

```javascript
// A field's read: name + fertility, and either its crop with a growth bar and projection,
// or "fallow". `proj` is fieldProjection(state, field). `extra` (optional) appends controls
// (a crop picker on the planting grid, a task chip on the weekly board).
export function fieldCard(field, proj, extra) {
  const fert = el("span", { class: "fc-fert", text: "●".repeat(field.fert) + "○".repeat(3 - field.fert) });
  const head = el("div", { class: "fc-head" }, [
    el("span", { class: "fc-name t-choice", text: fieldLabel(field) }), fert,
  ]);
  const body = el("div", { class: "fc-body" });
  if (proj.crop) {
    const pct = Math.max(4, Math.min(100, Math.round((field.progress / (proj.weeksToRipe + field.progress || 1)) * 0 + (field.progress / cropSeasons(proj)) * 100)));
    body.append(
      el("div", { class: "fc-crop t-sub", text: proj.name + (proj.needsTwo ? " · two hands" : "") }),
      el("div", { class: "fc-bar" }, [el("div", { class: "fc-fill" + (proj.ripe ? " ripe" : ""), style: `width:${pct}%` })]),
      el("div", { class: "fc-proj" }, [
        el("span", { class: "t-sub" + (proj.ripe ? " good" : ""), text: proj.when }),
        el("span", { class: "fc-yield t-sub", text: `${proj.yield.amount} ${proj.yield.kind}` }),
      ]),
    );
  } else {
    body.append(el("div", { class: "fc-crop t-sub", text: "fallow" }));
  }
  return el("div", { class: "fieldcard" + (proj.ripe ? " ripe" : "") }, [head, body, ...(extra ? [extra] : [])]);
}

// progress is measured in "seasons"; the bar fills toward the crop's season count.
function cropSeasons(proj) { return proj.crop ? Math.max(1, proj.weeksToRipe > 0 ? undefined : 1) : 1; }
```

Note: replace the fiddly `pct`/`cropSeasons` above with the simple, correct version — the growth bar fills `field.progress / totalSeasons`. Use this instead (delete the `cropSeasons` helper and the complex `pct` line):

```javascript
  if (proj.crop) {
    const total = proj.ripe ? field.progress : field.progress + proj.weeksToRipe * 0.2; // approx seasons to full
    const pct = Math.max(4, Math.min(100, Math.round((field.progress / (total || 1)) * 100)));
```

- [ ] **Step 4: Run the test** → PASS. (If the bar math reads awkwardly, it is cosmetic — the test only checks text, so keep the width formula simple and clamped.)

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/render/components.js prototype2/tests/components.test.mjs
git commit -m "feat(proto2): fieldCard component (crop, growth bar, projection, fertility)"
```

---

## Task 6: The planting grid

Rebuild the `planting` renderer as a 2×2 field grid. Each empty field shows a crop picker; picking a crop dispatches `PLANT` (which, with Task 1, updates that cell smoothly with no flash) and the cell then shows the crop + live projection with a "clear" control. A running spend and "Sow it so" stay on screen above the grid.

**Files:** Modify `prototype2/src/render/screens.js`; modify `prototype2/tests/planting.test.mjs`; modify `prototype2/src/styles/screens.css`

- [ ] **Step 1: Update the planting test in `prototype2/tests/planting.test.mjs`** — the mechanics (PLANT spends seed-then-coin, FALLOW clears) are unchanged and their tests stay. Add a render test to `prototype2/tests/screens.test.mjs` instead (Step 4). Here just confirm the existing reducer tests still pass after the render change — no edit needed unless a test asserted the old `.fieldrow`/`.croppick` DOM (it does not; those are in screens.test).

- [ ] **Step 2: Replace the `planting` renderer in `prototype2/src/render/screens.js`** — add imports `fieldCard` (from components) and `fieldProjection` (from selectors) at the top of the file (extend the existing import lines), then:

```javascript
  planting: (stage, s, dispatch) => {
    const spent = s.fields.reduce((n, f) => n + (f.crop ? CROPS[f.crop].seed : 0), 0);
    stage.append(
      el("div", { class: "eyebrow t-label", text: "Dawn · Planting" }),
      el("h2", { class: "t-title", text: "Set the fields" }),
      el("div", { class: "plant-bar" }, [
        el("span", { class: "t-sub", text: `Seed ${s.seed} · Coin ${s.coin} · this planting costs ${spent}` }),
        choiceCard({ text: "Sow it so", sub: "put the season in the ground", primary: true }, () => dispatch({ type: "SOW" })),
      ]),
      el("div", { class: "fieldgrid" }, s.fields.map((f) => plantingCell(s, f, dispatch))),
    );
  },
```

Add the cell + picker helpers near the bottom of `screens.js`:

```javascript
// One field on the planting grid: its read (fieldCard), plus a crop picker while empty or a
// "clear" while planted. Picking dispatches PLANT; with the beat-only Turn motion, only this
// cell repaints, so the grid does not flash.
function plantingCell(s, f, dispatch) {
  const proj = fieldProjection(s, f);
  let extra;
  if (f.crop) {
    extra = el("button", { class: "linkbtn t-sub", text: "clear", onClick: () => dispatch({ type: "FALLOW", fieldId: f.id }) });
  } else {
    extra = el("div", { class: "croppick" }, Object.entries(CROPS).map(([key, c]) => {
      const afford = s.seed + s.coin >= c.seed;
      const note = c.needsTwo ? " · two" : "";
      return el("button", { class: "cropchip t-sub" + (afford ? "" : " disabled"), ...(afford ? {} : { disabled: true }),
        text: `${c.name} · ${c.seed}${note}`, onClick: afford ? () => dispatch({ type: "PLANT", fieldId: f.id, crop: key }) : undefined });
    }));
  }
  return fieldCard(f, proj, extra);
}
```

- [ ] **Step 3: Add planting-grid styles to `prototype2/src/styles/screens.css`**

```css
/* --- planting grid + shared field card --- */
.plant-bar { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 14px; }
.plant-bar .choicecard { width: auto; min-width: 200px; margin: 0; }
.fieldgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.fieldcard { border: 1px solid var(--rule-fine); padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.fieldcard.ripe { border-color: var(--good); }
.fc-head { display: flex; justify-content: space-between; align-items: baseline; }
.fc-fert { color: var(--ink-faint); font-size: 0.82rem; }
.fc-bar { height: 6px; background: var(--paper); border: 1px solid var(--rule-fine); }
.fc-fill { height: 100%; background: var(--accent); }
.fc-fill.ripe { background: var(--good); }
.fc-proj { display: flex; justify-content: space-between; }
.fc-proj .good { color: var(--good); }
.croppick { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
@media (max-width: 700px) { .fieldgrid { grid-template-columns: 1fr; } }
```

- [ ] **Step 4: Add a planting-grid render test to `prototype2/tests/screens.test.mjs`**

```javascript
describe("planting grid", () => {
  it("shows four field cards and Sow is present before scrolling; a pick fills the cell", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" });
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelectorAll(".fieldgrid .fieldcard").length).toBe(4);
    expect([...root.querySelectorAll(".plant-bar .choicecard")].some((b) => /Sow/.test(b.textContent))).toBe(true);
    root.querySelector(".fieldcard .cropchip:not(.disabled)").click();
    expect(state.fields[0].crop).toBeTruthy();
    expect(root.querySelector(".fieldcard").textContent).toContain("ripens");
  });
});
```

- [ ] **Step 5: Run** → `cd prototype2 && npm test tests/screens.test.mjs tests/planting.test.mjs` — PASS. Run the full suite.

- [ ] **Step 6: Commit**

```bash
git add prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): planting grid — field cards, live projections, Sow always in view"
```

---

## Task 7: The readable weekly screen

Rework the `week` renderer to lead with the board (a read-only field grid with projections), then the crew with Reuben's plan already filled (each hand's suggested task highlighted, still adjustable), then the player's own week, then "Put them to work". The warnings ride in the shell already.

**Files:** Modify `prototype2/src/render/screens.js`; modify `prototype2/tests/screens.test.mjs`

- [ ] **Step 1: Add the failing test to `prototype2/tests/screens.test.mjs`**

```javascript
describe("readable weekly plan", () => {
  it("shows the field board with a projection and the pre-filled crew task", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" });
    state = reduce(state, { type: "PLANT", fieldId: 0, crop: "potato" });
    state = reduce(state, { type: "SOW" }); // week, pre-filled to tend field 0
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    expect(root.querySelector(".weekboard .fieldcard")).toBeTruthy();
    expect(root.textContent).toContain("ripens wk 5");
    // Reuben's row shows Tend selected (the pre-filled suggestion)
    const reubenRow = root.querySelector(".handrow");
    expect(reubenRow.querySelector(".taskbtn.sel").textContent).toBe("Tend");
  });
});
```

- [ ] **Step 2: Run it, expect failure** — FAIL (no `.weekboard`).

- [ ] **Step 3: Modify the `week` renderer in `prototype2/src/render/screens.js`** — prepend the field board before the crew rows. Keep the existing crew/player/CTA blocks (they already reflect `h.task`, which is now pre-filled). Insert at the start of the `week` renderer, right after the header `stage.append(...)`:

```javascript
    // The board first: read the fields before setting the crew.
    const planted = s.fields.filter((f) => f.crop);
    if (planted.length) {
      stage.append(el("div", { class: "weekboard fieldgrid" },
        planted.map((f) => fieldCard(f, fieldProjection(s, f)))));
    }
```

(The rest of the `week` renderer — the `TASKS`/`why` crew rows and the player's own week and "Put them to work" — is unchanged. Because Task 4 pre-fills `h.task`, the `h.task === task ? " sel"` logic now highlights Reuben's suggestion automatically.)

- [ ] **Step 4: Add board styling to `prototype2/src/styles/screens.css`**

```css
.weekboard { margin-bottom: 16px; }
```

- [ ] **Step 5: Run** → `cd prototype2 && npm test tests/screens.test.mjs` — PASS. Run the full suite.

- [ ] **Step 6: Commit**

```bash
git add prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): readable weekly plan — field board + pre-filled crew tasks"
```

---

## Task 8: Whole-Phase verification

Prove the loop still plays a full year and browser-verify the new reads.

**Files:** none new (uses `prototype2/tests/playthrough.test.mjs`)

- [ ] **Step 1: Run the full suite** — `cd prototype2 && npm test` — all green. The auto-player in `playthrough.test.mjs` assigns explicitly, so the pre-fill does not change its outcome; if any assertion there depended on the old default `rest`, update it to the assigned value (do not weaken).

- [ ] **Step 2: Browser-verify** — start the `prototype2` preview and walk New Game → letter → the opening → Ridley → planting → a couple of weeks. Confirm: the planting grid shows four field cards with live "ripens/yield" as you pick (no flash on each pick); the weekly screen leads with the field board and opens with Reuben's task pre-selected; "Sow it so" and "Put them to work" are visible without scrolling; the ledger warnings still show when short.

- [ ] **Step 3: Commit** (if any test assertions were updated in Step 1)

```bash
git add prototype2/tests
git commit -m "test(proto2): keep the full-year playthrough green under the pre-filled plan"
```

---

## Self-Review

**Spec coverage (Phase A = spec §12 Phase A):**
- Information layer → Task 2 (`fieldProjection`) surfaced on both screens (Tasks 6, 7); warnings already exist in the shell. The multi-week *forecast* and weather variety are Phase B, deliberately not built here (a forecast of one fixed weather is meaningless) — noted in the plan header.
- Reuben's pre-filled plan → Tasks 3 (`suggestPlan`) + 4 (applied on week start) + 7 (shown pre-selected).
- Planting redesign (grid, live per-field info, Sow always visible, per-cell updates) → Tasks 1 (no-flash), 5 (`fieldCard`), 6 (grid).

**Placeholder scan:** Task 5's growth-bar width formula is given twice — the second, simple, clamped version replaces the first; the engineer uses the simple one (the test only asserts text, so the exact fill width is cosmetic). No "TBD"/"implement later" in any logic step. Projection/suggestion numbers are real values from `BALANCE`/`CROPS`, flagged as model-owned.

**Type consistency:** `fieldProjection(state, field) -> { crop, name, tier, ripe, weeksToRipe, when, yield:{amount,kind}, needsTwo }`, `suggestPlan(state) -> { hands: {id:{task,targetFieldId}}, player:{kind,target} }`, `fieldCard(field, proj, extra?)`, `withSuggestedPlan(state)`, and `renderShell(root, state, dispatch, {animate})` are used identically across tasks and tests. The `week` renderer's existing `h.task === task` selection logic consumes the pre-filled `task` from Task 4 without change.

---

## Next plans

Phase B — weather variety + the multi-week forecast + the storm/ripe-crop mechanic + fair events. Phase C — the Year-1 on-ramp (per-season crop/task gating, Reuben's training-wheels framing, the optional-early player week). Phase D — crop expansion + situational value (season fit, market swings) + a balance pass. Each is its own plan against this same spec.
