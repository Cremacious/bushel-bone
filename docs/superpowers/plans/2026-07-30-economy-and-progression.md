# Economy & Progression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the economic skeleton the prototype lacks: continuous multi-year play, the debt squeeze (D-045), hiring hands as the mouth/capacity lever, and a **balance simulation on the real game core** that validates the unlock curve with math. Plus three cheap town fixes.

**Architecture:** Pure-core first. New state (`mortgage`, `upgrades`), new `balance.js` tables (debt/upkeep schedules, hire costs), reducer transitions (year-end settlement, turn-the-year, foreclosure, hire), and pure selectors. The sim is a JS harness that drives the **actual `reduce()`** with scripted policies, so it can't drift from the game and doubles as a regression test. Data-driven throughout (sinks/costs are tables) so later levers plug in.

**Tech Stack:** unchanged (vanilla ES modules, vitest/jsdom). The sim is node/vitest, no new deps.

**Design reference:** `docs/superpowers/specs/2026-07-30-economy-and-progression-design.md`. Four phases.

**Balance note:** every number here is a **first pass; the sim (Phase 4) owns the finals.** Get the mechanisms right; tune values against the sim.

---

# PHASE 1 — Town fixes (quick, independent)

## Task 1: Delete the wasted player "Rest" action

**Files:** Modify `prototype2/src/render/screens.js`, `prototype2/tests/screens.test.mjs`.

- [ ] **Step 1:** In `screens.js` `personalActions`, REMOVE the `{ kind: "rest", label: "Rest", desc: ... }` entry from the `opts` array (it costs an action and does nothing). Add a one-line reassurance under the action grid: `el("p", { class: "t-sub actionsfree", text: "Unspent time is fine. Turn in whenever you are ready." })`.
- [ ] **Step 2:** Add CSS `screens.css`: `.actionsfree { color: var(--ink-faint); font-style: italic; margin: 8px 0 0; }`.
- [ ] **Step 3:** In `tests/screens.test.mjs`, if a test asserts a Rest `.pa-action`, update it — assert the personal actions no longer include a "Rest" option (`[...root.querySelectorAll('.pa-action')].some(b=>/^Rest/.test(b.textContent))` is false) and the reassurance text is present.
- [ ] **Step 4:** Run `cd prototype2 && npx vitest run tests/screens.test.mjs` → PASS; full suite green. Commit.
```bash
git add prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): delete the wasted player Rest action; reassure unspent time is fine (economy task 1)"
```

## Task 2: Free-if-dry talks

**Files:** Modify `prototype2/src/core/reducer.js`, `prototype2/src/core/selectors.js`, `prototype2/tests/town.test.mjs`.

- [ ] **Step 1:** A talk that resolves to the small-talk filler should NOT cost an action or grant standing (you learned there is nothing new — free). In `selectors.js`, add a helper so the reducer and render agree on what "dry" means:
```javascript
// True when the NPC has no fresh content left (their next talk would be small-talk filler).
export function talkIsDry(state, npc) {
  return nextTownScene(state, npc) === (SMALLTALK[npc] || null);
}
```
(`nextTownScene` and `SMALLTALK` are already in this file / imported.)
- [ ] **Step 2:** In `reducer.js` `visit(s, npc)`, make a dry talk free: resolve the scene id; if it is the small-talk filler, open the scene but do NOT decrement `playerActionsLeft` and do NOT grant standing. Rework:
```javascript
function visit(s, npc) {
  if (s.phase !== "day") return s;
  const sceneId = nextTownScene(s, npc);
  if (!sceneId) return s;
  const dry = sceneId === (SMALLTALK[npc] || null);
  if (!dry && s.playerActionsLeft <= 0) return s; // real talks still need an action
  const seen = s.talksSeen || [];
  return { ...s,
    playerActionsLeft: dry ? s.playerActionsLeft : s.playerActionsLeft - 1,
    standing: dry ? s.standing : { ...(s.standing || {}), [npc]: ((s.standing || {})[npc] || 0) + BALANCE.standing.perTalk },
    talksSeen: seen.includes(sceneId) ? seen : [...seen, sceneId],
    phase: "scene", scene: { id: sceneId, result: null }, screen: "home" };
}
```
Import `SMALLTALK` in reducer.js if not already. (Keeps the `nextTownScene` import.)
- [ ] **Step 3:** In `screens.js` town place view, when `talkIsDry(s, l.npc)` the talk choice's cost tag should read "free" instead of "-1 action" (import `talkIsDry`): `tag: canTalk ? (talkIsDry(s, l.npc) ? "free" : "-1 action") : null, tagValence: talkIsDry(s, l.npc) ? "" : "bad"`.
- [ ] **Step 4:** Tests in `tests/town.test.mjs`: a fresh NPC's first talk spends an action (existing); once their deck is exhausted (set `talksSeen` to all their non-filler ids), `VISIT` opens the filler, spends NO action, and standing is unchanged.
- [ ] **Step 5:** Run `cd prototype2 && npx vitest run tests/town.test.mjs` → PASS; full suite green. Commit.
```bash
git add prototype2/src/core/reducer.js prototype2/src/core/selectors.js prototype2/src/render/screens.js prototype2/tests/town.test.mjs
git commit -m "feat(proto2): free-if-dry talks — a 'nothing new' visit costs no action (economy task 2)"
```

## Task 3: The dialogue highlight system

**Files:** Modify `prototype2/src/styles/screens.css`, `content/script.yaml` (+ regenerate), and add a convention note.

- [ ] **Step 1:** Add the highlight CSS to `screens.css` (colors picked to read in both themes; keep them token-adjacent):
```css
/* Dialogue intel highlights: one hue per category so useful info catches the eye. */
.prose .hl { font-style: normal; font-weight: 600; }
.prose .hl.mkt  { color: #b8863b; } /* market intel: what will sell */
.prose .hl.wx   { color: #5b83a6; } /* weather / season warning */
.prose .hl.omen { color: var(--bad); } /* the reckoning, an omen */
.prose .hl.ppl  { color: var(--good); } /* person / story thread */
.prose .hl.off  { color: var(--lamp); } /* an opportunity / offer */
```
- [ ] **Step 2:** The prose is rendered as HTML (`htmlProse`/innerHTML), so the convention is a `<span class="hl mkt">…</span>` around the keyword in `content/script.yaml`. Apply it to the existing INTEL-bearing lines: e.g. in `meredith_rumor` wrap the market words (`<span class="hl mkt">grain</span>`, `<span class="hl wx">frost</span>` etc.), and any other rumor/beat lines that carry actionable intel. Keep it light (1-3 highlights per line); do not over-color. No em dashes.
- [ ] **Step 3:** Add a short convention note at the top of `content/script.yaml` (a comment) documenting the five `.hl` classes so future content uses them consistently.
- [ ] **Step 4:** `cd prototype2 && npm run gen:data`; confirm the spans survive into `generated/script.js`. Add a test (`tests/screens.test.mjs` or `tests/content.test.mjs`): rendering a scene with a highlighted body produces a `.hl.mkt` element in the DOM. Run the suite green. Commit.
```bash
git add prototype2/src/styles/screens.css content/script.yaml prototype2/src/generated/script.js prototype2/tests/
git commit -m "feat(proto2): dialogue highlight system for intel (market/weather/omen/people/offer) (economy task 3)"
```

---

# PHASE 2 — Multi-year continuity + the mortgage squeeze

## Task 4: State, balance, and the settlement reducer

**Files:** Modify `prototype2/src/core/state.js`, `balance.js`, `selectors.js`, `reducer.js`; create `tests/mortgage.test.mjs`.

- [ ] **Step 1: `balance.js`** — add the debt tables:
```javascript
  debtStart: 600,                                  // the inherited mortgage balance (m)
  mortgageSchedule: { 1: 0, 2: 50, 3: 150, 4: 150 }, // payment due at each year-end; 150 default for 5+
  upkeepSchedule:   { 1: 0, 2: 0, 3: 20, 4: 40 },   // flat yearly upkeep, rising; 40 default for 5+
```
- [ ] **Step 2: `state.js`** — add to `initialState`:
```javascript
    mortgage: { balance: BALANCE.debtStart, arrears: 0, warned: false },
    upgrades: [],              // owned tool/building ids (later phases)
```
Keep `ended: false` (now set true only on foreclosure).
- [ ] **Step 3: `selectors.js`** — add:
```javascript
// The mortgage due at this year's settlement: the scheduled payment + upkeep (with sensible
// defaults past the authored years). Pure.
export function mortgageDue(state) {
  const y = state.year;
  const payment = BALANCE.mortgageSchedule[y] ?? 150;
  const upkeep = BALANCE.upkeepSchedule[y] ?? 40;
  return { payment, upkeep, total: payment + upkeep };
}
```
- [ ] **Step 4: Failing tests `tests/mortgage.test.mjs`:**
```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { mortgageDue } from "../src/core/selectors.js";

// Drive a state to winter's dusk so END_SEASON reaches settlement.
function atWinterDusk(seed = 1, mutate) {
  let s = initialState(seed); s.seasonIndex = 3; // winter
  s = reduce(s, { type: "BEGIN_SEASON" });
  for (let i = 0; i < 10; i++) s = reduce(s, { type: "TURN_IN" });
  return mutate ? mutate(s) : s;
}

describe("year-end settlement", () => {
  it("winter's END_SEASON goes to the settlement phase, not game-over", () => {
    let s = atWinterDusk();
    s = reduce(s, { type: "END_SEASON" });
    expect(s.phase).toBe("settlement");
    expect(s.ended).toBe(false);
  });
  it("Year 1 has no payment; TURN_YEAR advances to Year 2 Spring carrying state", () => {
    let s = reduce(atWinterDusk(1, (s) => ({ ...s, coin: 100 })), { type: "END_SEASON" });
    expect(mortgageDue(s).total).toBe(0); // year 1 grace
    s = reduce(s, { type: "TURN_YEAR" });
    expect(s.year).toBe(2);
    expect(s.seasonIndex).toBe(0);
    expect(s.phase).toBe("brief");
    expect(s.coin).toBe(100); // nothing deducted in the grace year
  });
  it("a payment is deducted; a shortfall becomes arrears and a warning", () => {
    let s = atWinterDusk(1, (s) => ({ ...s, year: 3, coin: 10 })); // owes 150+20, has 10
    s = reduce(s, { type: "END_SEASON" });
    s = reduce(s, { type: "TURN_YEAR" });
    expect(s.coin).toBe(0);
    expect(s.mortgage.arrears).toBeGreaterThan(0);
    expect(s.mortgage.warned).toBe(true);
    expect(s.ended).toBe(false); // one bad year is survivable
  });
  it("a second consecutive miss forecloses", () => {
    let s = atWinterDusk(1, (s) => ({ ...s, year: 4, coin: 0, mortgage: { balance: 600, arrears: 170, warned: true } }));
    s = reduce(s, { type: "END_SEASON" });
    s = reduce(s, { type: "TURN_YEAR" });
    expect(s.phase).toBe("foreclosed");
    expect(s.ended).toBe(true);
  });
});
```
- [ ] **Step 5: `reducer.js`** — change `endSeason` and add settlement/turn-year. Replace `endSeason`:
```javascript
function endSeason(s) {
  if (season(s) === "winter") return { ...s, phase: "settlement" }; // year-end accounts, not game-over
  return { ...s, seasonIndex: s.seasonIndex + 1, day: 1, phase: "brief" };
}
```
Add a `TURN_YEAR` case and helper (settlement math + foreclosure, then advance):
```javascript
    case "TURN_YEAR":
      return turnYear(state);
```
```javascript
// Settle the year's mortgage and either roll into the next Spring or foreclose. Payment +
// upkeep come out of coin; a shortfall accrues as arrears and a warning. A second consecutive
// short year (already warned, still short) loses the land.
function turnYear(s) {
  const due = mortgageDue(s);
  let coin = s.coin, arrears = s.mortgage.arrears, warned = s.mortgage.warned, balance = s.mortgage.balance;
  const owed = due.total + arrears;
  if (coin >= owed) {
    coin -= owed; arrears = 0; warned = false; balance = Math.max(0, balance - due.payment);
  } else {
    const short = owed - coin; coin = 0; arrears = short; balance = Math.max(0, balance - Math.max(0, due.payment - short));
    if (warned) return { ...s, phase: "foreclosed", ended: true, coin, mortgage: { balance, arrears, warned: true } };
    warned = true;
  }
  return { ...s, coin, mortgage: { balance, arrears, warned },
    year: s.year + 1, seasonIndex: 0, day: 1, phase: "brief" };
}
```
(`mortgageDue` and `season` are imported in reducer.js — add `mortgageDue` to the selectors import.)
- [ ] **Step 6:** Run `cd prototype2 && npx vitest run tests/mortgage.test.mjs` → PASS. The old playthrough/year-end tests that expected `phase: "yearend"`/`ended` at winter will break — update them: winter END_SEASON now yields `settlement`, and `TURN_YEAR` advances the year (Year-1 grace deducts nothing). Update `tests/playthrough.test.mjs` to assert reaching `settlement` (and optionally turning into Year 2). Full suite green; report changes. Commit.
```bash
git add prototype2/src/core/ prototype2/tests/
git commit -m "feat(proto2): multi-year continuity + the mortgage year-end settlement & foreclosure (economy task 4)"
```

## Task 5: The settlement & foreclosed screens

**Files:** Modify `prototype2/src/render/screens.js`, `content/script.yaml` (+ regen), `prototype2/tests/screens.test.mjs`.

- [ ] **Step 1: Failing test** (append to `tests/screens.test.mjs`):
```javascript
describe("the year-end settlement screen", () => {
  it("shows the mortgage due and turns the year", () => {
    const root = document.createElement("div");
    let s = { ...initialState(1), year: 2, phase: "settlement", coin: 200 };
    const dispatch = (a) => { s = reduce(s, a); };
    renderShell(root, s, dispatch); renderScreen(root.querySelector("#stage"), s, dispatch);
    expect(root.textContent).toMatch(/mortgage|the bank|owe/i);
    const turn = [...root.querySelectorAll(".choicecard")].find((b) => /Turn the year/i.test(b.textContent));
    expect(turn).toBeTruthy();
    turn.click();
    expect(s.year).toBe(3);
  });
});
```
- [ ] **Step 2:** Replace the `yearend:` renderer in `screens.js` with a **`settlement:`** renderer: an eyebrow (`Year ${YEAR_WORD} · the accounts`), a title, the year's figures (coin, larder/fuel carried), and the **mortgage line** from `mortgageDue(s)` (e.g. "The bank wants `payment`m, and `upkeep`m in upkeep." or, in Year 1, "The bank asks nothing yet. Next year the notes come due."), the arrears/warning if any, and a `choiceCard({ text: "Turn the year", sub: "into the next Spring", primary: true }, () => dispatch({ type: "TURN_YEAR" }))`. Import `mortgageDue`. Add a **`foreclosed:`** renderer: the run-end (years survived, "the bank has taken the land"), and a `choiceCard({ text: "Begin a new line", ... }, reloadFn)`.
- [ ] **Step 3:** Prose for the settlement/foreclosure copy can be inline strings (or `content/script.yaml` if you prefer the round-trip; inline is fine for these system screens). No em dashes.
- [ ] **Step 4:** Also update the **Morning Brief** for Year 2+ to name the coming debt (a short line "The bank's notes come due this winter." when `mortgageDue({...s}).total > 0` for the current year). Keep it light.
- [ ] **Step 5:** Run `cd prototype2 && npx vitest run tests/screens.test.mjs` → PASS; full suite green. Browser-sanity later (Task 8). Commit.
```bash
git add prototype2/src/render/screens.js prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): the year-end settlement + foreclosed run-end screens (economy task 5)"
```

---

# PHASE 3 — Hiring hands

## Task 6: HIRE (the mouth/capacity lever)

**Files:** Modify `prototype2/src/core/balance.js`, `state.js`, `selectors.js`, `reducer.js`, `prototype2/src/render/screens.js`; tests.

- [ ] **Step 1: `balance.js`** — `hireCosts: [60, 110, 300],` (cost to hire the 2nd, 3rd, 4th hand; 300 default past that).
- [ ] **Step 2: `state.js`** — add a small name pool for generated hands: `export const HAND_NAMES = ["Sal", "Enoch", "Del", "Mara", "Gideon", "Tabitha", "Amos", "Lettie"];` (or similar, alt-1800s). `makeHand(id, name)` already exists.
- [ ] **Step 3: `selectors.js`** — add:
```javascript
export const hireCost = (s) => { const n = s.hands.length - 1; return BALANCE.hireCosts[n] ?? BALANCE.hireCosts[BALANCE.hireCosts.length - 1]; };
export const canHire = (s) => s.coin >= hireCost(s);
```
(hands start at 1 = Reuben; `n = hands.length - 1` indexes the cost of the *next* hire.)
- [ ] **Step 4: Failing test `tests/hire.test.mjs`:**
```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { hireCost } from "../src/core/selectors.js";

describe("hiring a hand", () => {
  it("HIRE adds a hand for coin", () => {
    let s = { ...initialState(1), coin: 200 };
    const cost = hireCost(s);
    const n0 = s.hands.length;
    s = reduce(s, { type: "HIRE" });
    expect(s.hands.length).toBe(n0 + 1);
    expect(s.coin).toBe(200 - cost);
    expect(s.hands[s.hands.length - 1].alive).toBe(true);
  });
  it("HIRE is a no-op when it cannot be afforded", () => {
    let s = { ...initialState(1), coin: 0 };
    expect(reduce(s, { type: "HIRE" })).toEqual(s);
  });
});
```
- [ ] **Step 5: `reducer.js`** — add the case + helper (import `hireCost` from selectors, `makeHand`/`HAND_NAMES` from state, and use the PRNG for the name so it is deterministic):
```javascript
    case "HIRE":
      return hire(state);
```
```javascript
function hire(s) {
  const cost = hireCost(s);
  if (s.coin < cost) return s;
  const used = new Set(s.hands.map((h) => h.name));
  const name = HAND_NAMES.find((n) => !used.has(n)) || `Hand ${s.hands.length + 1}`;
  const id = "hand" + s.hands.length;
  return { ...s, coin: s.coin - cost, hands: [...s.hands, makeHand(id, name)] };
}
```
(Import `hireCost` from `./selectors.js`, `makeHand`/`HAND_NAMES` from `./state.js`.)
- [ ] **Step 6: Render — the hire affordance at Vane's wagon.** In the `town:` place view, when the place's `npc === "ambrose"` (Dr. Vane), show a hire choice card in addition to the talk: `choiceCard({ text: "Hire a hand", sub: `a clone from the wagon`, tag: `${hireCost(s)}m`, tagValence: "", disabled: !canHire(s), why: "not enough coin" }, () => dispatch({ type: "HIRE" }))`. (Hiring is a capital purchase — coin only, no action-point cost, consistent with clearing a field.) Ensure a Vane/wagon location exists in `LOCATIONS` and is walkable; if `ambrose` is not already a walkable place, add a `wagon` location entry (npc `ambrose`, loc `wagon`) to `town.js` `LOCATIONS`.
- [ ] **Step 7:** Run `cd prototype2 && npx vitest run tests/hire.test.mjs tests/screens.test.mjs` → PASS; full suite green. Commit.
```bash
git add prototype2/src/core/ prototype2/src/render/screens.js prototype2/tests/hire.test.mjs
git commit -m "feat(proto2): hire hands at Vane's wagon — the mouth/capacity lever (economy task 6)"
```

---

# PHASE 4 — The balance sim + the tuning pass

## Task 7: The simulation harness on the real core

**Files:** Create `prototype2/sim/policies.js`, `prototype2/sim/run.js`, `prototype2/tests/sim.test.mjs`.

- [ ] **Step 1: `sim/policies.js` — the player policies.** A policy is `policy(state) => action` that returns the next action to dispatch for the CURRENT phase. The harness handles structural phases; the policy makes the decisions. Provide three: `optimal`, `normal`, `sloppy`. Each is a function over state that returns an action object. Cover every phase:
  - `brief` → `{ type: "BEGIN_SEASON" }` (or open+close the opening scene: on `phase:"scene"` return `{ type: "CLOSE_SCENE" }`).
  - `planting` → choose crops per policy (optimal: corn/cotton where affordable + one food field; normal: mixed; sloppy: all potato), issue `PLANT` for each cleared empty field, then `{ type: "SOW" }` when all set. (Return one action per call; the harness loops.)
  - `day` → assign each hand a sensible task per policy (optimal: harvest ripe, else chop when cold+short, else tend; sloppy: always tend/rest), spend personal actions (optimal: forage/jobs; sloppy: none), then `{ type: "TURN_IN" }` or `{ type: "RUN_DAYS" }`. Expansion decisions here too (optimal: `CLEAR_FIELD`/`HIRE` when safely affordable).
  - `dusk` → `{ type: "END_SEASON" }`.
  - `settlement` → `{ type: "TURN_YEAR" }`.
  Keep each policy a readable decision tree. Determinism: no `Math.random` (use state, or the seed).
- [ ] **Step 2: `sim/run.js` — the harness.**
```javascript
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

// Drive the real reducer with a policy until the run ends or maxYears elapses. Records a
// per-year metric row and the unlock timeline. Returns { survivedYears, foreclosed, rows, unlocks }.
export function simulate(policy, { seed = 1, maxYears = 4 } = {}) {
  let s = initialState(seed, "Sim");
  const rows = [], unlocks = [];
  let guard = 0, lastYear = 0, lastFields = 1, lastHands = 1;
  while (!s.ended && s.year <= maxYears && guard++ < 20000) {
    if (s.fields.filter((f) => f.cleared).length > lastFields) { unlocks.push({ what: "field", year: s.year, day: s.day }); lastFields++; }
    if (s.hands.length > lastHands) { unlocks.push({ what: "hire", year: s.year, day: s.day }); lastHands++; }
    if (s.year !== lastYear) { rows.push({ year: s.year, coin: s.coin, fields: s.fields.filter((f) => f.cleared).length, hands: s.hands.length, arrears: s.mortgage.arrears }); lastYear = s.year; }
    const action = policy(s);
    if (!action) break;
    const ns = reduce(s, action);
    if (ns === s) break; // policy returned a no-op — avoid an infinite loop
    s = ns;
  }
  return { survivedYears: s.year - (s.ended ? 1 : 0), foreclosed: s.phase === "foreclosed", rows, unlocks, coin: s.coin };
}
```
- [ ] **Step 3: `tests/sim.test.mjs` — assert the target curve** (loose bands; the tuning pass tightens `balance.js` to satisfy them):
```javascript
import { describe, it, expect } from "vitest";
import { simulate } from "../sim/run.js";
import { optimal, normal, sloppy } from "../sim/policies.js";

describe("the economy curve (sim on the real core)", () => {
  it("optimal play survives four years without foreclosing", () => {
    const r = simulate(optimal, { maxYears: 4 });
    expect(r.foreclosed).toBe(false);
    expect(r.unlocks.some((u) => u.what === "field")).toBe(true); // expands
  });
  it("normal play survives four years but is tighter", () => {
    const r = simulate(normal, { maxYears: 4 });
    expect(r.foreclosed).toBe(false);
  });
  it("sloppy play is caught by the debt (forecloses by year 4)", () => {
    const r = simulate(sloppy, { maxYears: 5 });
    expect(r.foreclosed).toBe(true);
    expect(r.survivedYears).toBeLessThanOrEqual(4);
  });
});
```
- [ ] **Step 4:** Build the policies and harness until the harness runs without wedging (the `ns === s` guard catches no-op loops). Run `cd prototype2 && npx vitest run tests/sim.test.mjs`. It is EXPECTED that the assertions may not all pass yet — that is the tuning pass (Task 8). Get the harness itself working (it runs, produces a report) and at least `optimal` surviving; commit the harness even if the sloppy/normal bands need Task-8 tuning (note which pass).
```bash
git add prototype2/sim/ prototype2/tests/sim.test.mjs
git commit -m "feat(proto2): balance sim harness + policies on the real core (economy task 7)"
```

## Task 8: The tuning pass + multi-year browser verify

**Files:** Modify `prototype2/src/core/balance.js` (iteratively); browser verify.

- [ ] **Step 1: Tune.** Run the sim (`npx vitest run tests/sim.test.mjs`, and/or a `node` script printing `simulate(...).rows`). Read the report. Adjust `balance.js` — the mortgage/upkeep schedules, `hireCosts`, `clearCosts`, crop `sale`/`yield`, and job pay — and re-run, until all three `sim.test.mjs` bands pass: **optimal thrives, normal survives (tight by Y4), sloppy forecloses by Y4.** Add a comment block in `balance.js` recording the final curve (when each unlock lands for normal play, from the sim's `unlocks`).
- [ ] **Step 2: Guard against a single dominant crop (stretch).** Optionally add a 4th policy `cashRush` (all cash crops) and assert it also survives 4y, confirming more than one style is viable. If it trivially dominates, nudge crop values so staples-vs-cash is a real tradeoff. Note the result.
- [ ] **Step 3: Full suite green.** `cd prototype2 && npx vitest run` → all pass; report counts.
- [ ] **Step 4: Browser verify (multi-year).** Dev server on 4321. Play/skip through: reach winter → the **settlement screen** shows the mortgage due → **Turn the year** → Year 2 Spring, state carried; the **Morning Brief** names the coming debt; visit **Vane's wagon** and **Hire a hand** (coin drops, the crew grows, the roster shows the new hand); a **free-if-dry** talk (exhaust an NPC) costs no action; **highlighted intel** shows colored keywords; the **Rest** personal action is gone. Drive a deliberately sloppy line to see a **foreclosure**. Screenshot the settlement screen. Fix console errors.
- [ ] **Step 5: Commit.**
```bash
git add prototype2/src/core/balance.js
git commit -m "feat(proto2): tune the economy curve against the sim; multi-year verified (economy task 8)"
```

---

## Self-Review notes (author)
- **Spec coverage:** §1 multi-year → Task 4-5; §2 sinks → Task 4; §3 ladder → Task 6 (hands) + existing (fields); §4 hiring → Task 6; §5 sim → Task 7; §6 tuning → Task 8; §7 town fixes → Tasks 1-3.
- **Type/name consistency:** `mortgage: {balance, arrears, warned}`, `mortgageDue(state)→{payment,upkeep,total}`, `TURN_YEAR`, `phase: "settlement"|"foreclosed"`, `hireCost`/`canHire`/`HIRE`, `talkIsDry`, `simulate(policy, opts)`. Consistent across tasks.
- **Determinism:** the sim drives the real reducer; policies are pure over state; no `Math.random`. The harness has a no-op guard and a hard iteration cap.
- **Sim can't drift:** it imports the actual `initialState`/`reduce`, so a rules change that breaks the curve fails `sim.test.mjs` — the balance model is a live regression test.
