# v0.4 Phase 1 — The Beat Loop & Crew Roles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Transform the season from 40 empty "Turn in" clicks into a short string of **beats**. Time auto-advances; the player sets crew **roles** once and then acts only when something wants a decision (a harvest, a failing hand, a scarcity threat, the season's end). Labor starts to bite. This is the load-bearing change that makes the core loop playable and un-tedious; the tightening, events, and polish are Phases 2-4.

**Architecture:** Reuses ~80% of the built machinery. `resolveDay` + `RUN_DAYS` + `interrupts()` already fast-forward and stop; this makes the run the **default flow** and renders a **beat screen** (not the day panel) at each stop. Hand `task` (per-day micro-assignment) becomes a persistent **role** that `resolveDay` reads contextually. The player's per-day actions become a **season pool**. Pure `(state, action) => state` throughout.

**Tech Stack:** unchanged (vanilla ES modules, vitest/jsdom).

**Design reference:** `docs/superpowers/specs/2026-07-30-v04-beat-driven-loop-design.md` (sections 1-4, 7).

**v0.4 phase roadmap** (this plan is Phase 1):
- **Phase 1 — the beat loop + crew roles (this plan):** auto-advance, roles, the beat screen, labor that bites, a season action pool.
- **Phase 2 — the tightening:** seed as a coin sink, scarce rotating jobs, cut abundance + a Day-1 stake, rebalanced via the sim.
- **Phase 3 — events:** the seeded 7-family deck, choice grammar, consequences, a starter content set.
- **Phase 4 — polish:** the day-book income/expense breakdown, distinct button visuals, town/NPC card content, final sim rebalance + browser verify.

**Scope guard (defer to Phases 2-4):** seed buying, job scarcity, cut abundance, the event deck, the day-book ledger breakdown, button restyle, town card content, heavy rebalance. Phase 1 keeps the current economy/resources; it changes the *loop shape and the crew model* only. Labor gets a first-pass strain bump; the sim tune is Phase 2.

---

## File Structure (Phase 1)
```
prototype2/src/core/
  state.js       # MODIFY — hand.role (was task); state.seasonActionsLeft; makeHand(role)
  balance.js     # MODIFY — seasonActionsPerSeason; a first-pass strain bump
  reducer.js     # MODIFY — SET_ROLE (was ASSIGN); resolveDay role-based labor; SOW runs to first beat; SPEND_ACTION; season-pool reset
  selectors.js   # MODIFY — interrupts() reasons for the beat screen; roleLabel/roleDesc; a beat() summary
prototype2/src/render/
  screens.js     # MODIFY — the `day:` renderer becomes the BEAT screen (beats + role toggles + season actions + continue)
  screens.css    # MODIFY — beat screen styles
prototype2/tests/
  roles.test.mjs      # NEW — role-based resolveDay, SET_ROLE
  beat-loop.test.mjs  # NEW — SOW runs to a beat; continue advances; last-day close; season pool
  (daily-loop|screens|prefill|playthrough|sim).test.mjs # MODIFY — task->role, day-screen->beat-screen
```

---

## Task 1: Crew roles (replace per-day task assignment)

**Files:** Modify `state.js`, `reducer.js`, `selectors.js`; create `tests/roles.test.mjs`.

- [ ] **Step 1: `state.js`** — `makeHand` carries a **role**, not a task. Change:
```javascript
export function makeHand(id, name, { body = "average", mind = "average", role = "field" } = {}) {
  // strain 0..100 drives the condition track (Steady->Worn->Failing->Lost).
  return { id, name, body, mind, role, strain: 0, morale: 4, alive: true, traits: [] };
}
```
Reuben starts with role `"field"`. Add `seasonActionsLeft: BALANCE.seasonActionsPerSeason` to `initialState` (drop the old `playerActionsLeft` per-day field).

- [ ] **Step 2: `balance.js`** — add `seasonActionsPerSeason: 5,` and bump strain so labor bites (first pass; Phase 2's sim tunes it): `hardLabor: 4` (was 2), `restRecovery: 8`.

- [ ] **Step 3: Failing test `tests/roles.test.mjs`:**
```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

function inDay(mutate) {
  let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
  s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
  s = reduce(s, { type: "SOW" });
  // SOW may run to a beat; force back to a controllable day-1 state for the unit checks
  s = { ...s, phase: "day", day: 1 };
  return mutate ? mutate(s) : s;
}

describe("crew roles", () => {
  it("SET_ROLE changes a hand's standing role", () => {
    let s = inDay();
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "wood" });
    expect(s.hands.find((h) => h.id === "reuben").role).toBe("wood");
  });
  it("a Field-role hand harvests a ripe field, else tends a growing one", () => {
    let s = inDay((s) => ({ ...s, fields: s.fields.map((f) => f.id === 0 ? { ...f, crop: "potato", progress: 1 } : f) }));
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "field" });
    const coinOrLarder = s.larder;
    s = reduce(s, { type: "RESOLVE_DAY_TEST" in {} ? "" : "TURN_IN" }); // one day
    // the ripe potato was brought in (larder rose)
    expect(s.larder).toBeGreaterThan(coinOrLarder);
  });
  it("a Wood-role hand chops fuel", () => {
    let s = inDay();
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "wood" });
    const f0 = s.fuel;
    s = reduce(s, { type: "TURN_IN" });
    expect(s.fuel).toBeGreaterThan(f0);
  });
});
```
(The middle test's odd `RESOLVE_DAY_TEST` guard is a typo guard; write it plainly as `s = reduce(s, { type: "TURN_IN" });`.)

- [ ] **Step 4: `reducer.js`** — (a) replace the `ASSIGN` case with `SET_ROLE`:
```javascript
    case "SET_ROLE":
      return mapHand(state, action.handId, (h) => ({ ...h, role: action.role }));
```
(b) In `resolveDay`, replace the per-task labor with **role-based contextual labor**. A hand's role decides its day's work: `field` -> harvest a ripe field if any (joining others on the same field; two-hand crops still need two), else tend the least-grown growing field; `wood` -> chop; `forage` -> forage; `rest` -> recover. Rewrite the labor section so each living hand resolves from `h.role`:
```javascript
  // 1) Labor by role. Field hands harvest what's ripe (pooling on a field, two-hand crops
  // needing two), else tend the least-grown crop. Wood/forage/rest are direct. Only real
  // work charges strain; rest recovers it.
  const ripeFieldsList = fields.filter((f) => f.crop && ripe(f)).sort((a, b) => a.id - b.id);
  const growing = fields.filter((f) => f.crop && !ripe(f)).sort((a, b) => a.progress - b.progress);
  // assign field hands to ripe fields first (pool up to needsTwo), then tending
  const fieldHands = hands.filter((h) => h.alive && h.role === "field");
  const harvestCrews = {}; let hi = 0;
  for (const f of ripeFieldsList) {
    const need = CROPS[f.crop].needsTwo ? 2 : 1;
    const crew = [];
    while (crew.length < need && hi < fieldHands.length) crew.push(fieldHands[hi++]);
    if (crew.length) harvestCrews[f.id] = crew.map((h) => h.id);
  }
  const tendHands = fieldHands.slice(hi);
  const workedHarvest = new Set();
  for (const fid of Object.keys(harvestCrews)) {
    const crew = harvestCrews[fid]; const f = byId(Number(fid)); if (!f || !ripe(f)) continue;
    const c = CROPS[f.crop];
    let units = Math.round(c.yield * (f.fert / 3));
    const shorthanded = c.needsTwo && crew.length < 2; if (shorthanded) units = Math.floor(units / 2);
    if (c.food > 0) larder += units * c.food; else coin += units * c.sale;
    daylog.push(`Brought in ${c.name.toLowerCase()} from ${fieldLabel(f).toLowerCase()}${shorthanded ? ", a single hand getting only half" : ""}.`);
    f.crop = null; f.progress = 0; f.fert = Math.max(0, f.fert - 1);
    crew.forEach((id) => workedHarvest.add(id));
  }
  let gi = 0;
  for (const h of hands) {
    if (!h.alive) continue;
    let worked = false;
    if (h.role === "field") {
      if (workedHarvest.has(h.id)) worked = true;
      else if (tendHands.includes(h) && gi < growing.length) { growing[gi++].tended = true; worked = true; }
    } else if (h.role === "wood") { fuel += BALANCE.fuelPerChopDay; worked = true; }
    else if (h.role === "forage") { larder += BALANCE.forageFood; worked = true; }
    h.strain += worked ? St.hardLabor : (h.role === "rest" ? -St.restRecovery : 0);
  }
```
Remove the old per-`task` `doLabor`/harvestCrews block that this replaces. Keep steps 2-6 of `resolveDay` (growth, eating, cold, loss, advance) intact. The player's own action is no longer applied in `resolveDay` (it becomes `SPEND_ACTION`, Task 3) — remove the `s.playerAction` handling from `resolveDay`.

- [ ] **Step 5: `selectors.js`** — `suggestPlan` returned per-hand tasks; roles need no pre-fill (a hand keeps its role), so `withStandingOrders`/`suggestPlan` can set an initial role instead. Simplest: make new hands default to `field`; drop the `suggestPlan` pre-fill call from `SOW` (roles persist). Add `roleLabel(role)` / `roleDesc(role)` helpers for the UI. Update `interrupts(state)` reasons to name a **failing hand by name** and keep the ripe/larder/last-day reasons.

- [ ] **Step 6:** Run `cd prototype2 && npx vitest run tests/roles.test.mjs` → PASS. (Other suites break here — Task 4 sweeps them.) Commit.
```bash
git add prototype2/src/core/ prototype2/tests/roles.test.mjs
git commit -m "feat(proto2): crew standing-order roles replace per-day task assignment (v0.4 phase1 task 1)"
```

## Task 2: The auto-advancing beat loop

**Files:** Modify `reducer.js`, `selectors.js`; create `tests/beat-loop.test.mjs`.

- [ ] **Step 1: Failing test `tests/beat-loop.test.mjs`:**
```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { interrupts } from "../src/core/selectors.js";

function sow(mutate) {
  let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
  s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
  if (mutate) s = mutate(s);
  return reduce(s, { type: "SOW" });
}

describe("the beat loop", () => {
  it("SOW runs forward and stops at the first beat (not day 1)", () => {
    const s = sow();
    // it auto-advanced: either it reached a beat (interrupts present) or the season's end (dusk)
    expect(s.phase === "day" ? interrupts(s).length > 0 : s.phase === "dusk").toBe(true);
    expect(s.day).toBeGreaterThan(1);
  });
  it("CONTINUE runs to the next beat or to dusk", () => {
    let s = sow();
    const d0 = s.day;
    if (s.phase === "day") s = reduce(s, { type: "CONTINUE" });
    expect(s.day >= d0).toBe(true);
    expect(["day", "dusk"]).toContain(s.phase);
  });
  it("the last-day beat closes to dusk via CONTINUE", () => {
    let s = sow();
    for (let i = 0; i < 12 && s.phase === "day"; i++) s = reduce(s, { type: "CONTINUE" });
    expect(s.phase).toBe("dusk");
  });
});
```

- [ ] **Step 2: `reducer.js`** — make `SOW` run to the first beat, and add `CONTINUE`. `runDays` (RUN_DAYS) already loops `resolveDay` while `interrupts()` is empty. Change `SOW` to run after sowing:
```javascript
    case "SOW":
      return runDays({ ...withInitialRoles({ ...state, phase: "day", day: 1 }),
        seasonActionsLeft: BALANCE.seasonActionsPerSeason });
    case "CONTINUE":
      return continueRun(state);
```
`continueRun`: if at the last day (interrupts includes the last-day reason and no other actionable beat), resolve the final day into dusk; otherwise resolve one day past the current beat and run to the next:
```javascript
// Resume the season after the player has dealt with a beat: step one day past the current
// stop, then run on to the next beat (or dusk). This guarantees progress even when the same
// interrupt (e.g. an unharvested ripe field the player chose to leave) would otherwise re-stop.
function continueRun(s) {
  if (s.phase !== "day") return s;
  const stepped = resolveDay(s);           // advance at least one day past the beat
  return stepped.phase === "day" ? runDays(stepped) : stepped;
}
```
`withInitialRoles` replaces `withStandingOrders`: leave each hand's role as-is (persisted), no per-day pre-fill. Keep `runDays` as-is (it stops on `interrupts`).

- [ ] **Step 3:** Run `cd prototype2 && npx vitest run tests/beat-loop.test.mjs` → PASS. Commit.
```bash
git add prototype2/src/core/ prototype2/tests/beat-loop.test.mjs
git commit -m "feat(proto2): auto-advancing beat loop — SOW runs to the first beat, CONTINUE to the next (v0.4 phase1 task 2)"
```

## Task 3: The beat screen + the season action pool

**Files:** Modify `state.js` (done), `reducer.js` (`SPEND_ACTION`), `screens.js`, `screens.css`; tests in `tests/screens.test.mjs`.

- [ ] **Step 1: `reducer.js`** — add `SPEND_ACTION` (the season pool; the player's own move at a beat). It spends one `seasonActionsLeft` and applies its effect immediately: `forage` (larder += forageFood), `work` (tend a growing field), `care` (ease a hand), `town` (set `screen: "town"` — free navigation, the town encounter there spends the action... for Phase 1 keep town as-is). A no-op with no actions left.
```javascript
    case "SPEND_ACTION":
      return spendAction(state, action);
```
```javascript
function spendAction(s, { kind, target }) {
  if (s.seasonActionsLeft <= 0) return s;
  let ns = { ...s, seasonActionsLeft: s.seasonActionsLeft - 1 };
  if (kind === "forage") ns.larder = s.larder + BALANCE.forageFood;
  else if (kind === "work" && target != null) ns.fields = s.fields.map((f) => (f.id === target && f.crop) ? { ...f, tended: true } : f);
  else if (kind === "care" && target != null) ns.hands = s.hands.map((h) => (h.id === target && h.alive) ? { ...h, strain: Math.max(0, h.strain - BALANCE.strain.careRecovery) } : h);
  return ns;
}
```
Reset `seasonActionsLeft` at each season's start (in `beginSeason`).

- [ ] **Step 2: `screens.js`** — rewrite the `day:` renderer as the **beat screen**. It shows: (a) the **beat** (the `interrupts(s)` reasons as a headline, e.g. "A crop stands ripe", "Sal is failing", "It is the last day of the season"); (b) a compact **crew roster** with a role toggle per hand (buttons: Field / Wood / Forage / Rest, dispatching `SET_ROLE`) and each hand's Tiredness read; (c) the **season actions** (`seasonActionsLeft` of N): Forage / Work a field / Sit with a hand / Ride to Marrow's Cross, each `SPEND_ACTION` (or SET_SCREEN for town), disabled when the pool is empty; (d) the primary **"Let the days run on ->"** = `CONTINUE`, or on the last day **"Bring the season to a close"** = `CONTINUE`. Drop the old per-day task-button wall and the big goal panel (keep a one-line food/fuel status). Keep it SHORT — this screen must not scroll much (the playtest complaint).

- [ ] **Step 3: Failing/updated tests** in `tests/screens.test.mjs`: the beat screen shows the beat headline, a role toggle (`.rolebtn`) per hand, the season-action count, and a Continue control; clicking a role button dispatches `SET_ROLE`; Continue advances the day/phase.

- [ ] **Step 4: CSS** — beat screen styles (`.beat-headline`, `.rolerow`, `.rolebtn`, `.seasonactions`), visually compact.

- [ ] **Step 5:** Run `cd prototype2 && npx vitest run tests/screens.test.mjs` → PASS. Commit.
```bash
git add prototype2/src/core/ prototype2/src/render/ prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): the beat screen + the season action pool (v0.4 phase1 task 3)"
```

## Task 4: Sweep the suite + the sim + browser verify

**Files:** Modify the remaining tests (`daily-loop`, `prefill`, `playthrough`, `sim` policies) and `sim/policies.js` for roles; verify.

- [ ] **Step 1: Sweep.** Run `cd prototype2 && npx vitest run` and update every test/policy that used the old model: `ASSIGN {task, targetFieldId}` -> `SET_ROLE {role}`; `hand.task` -> `hand.role`; the day-screen `.taskbtn`/`.handrow` assertions -> the beat screen; `DO_PLAYER_ACTION` -> `SPEND_ACTION`; `RUN_DAYS`/`TURN_IN` flows -> `CONTINUE` where the loop changed. In `sim/policies.js`, the assignment policies now set roles (e.g. optimal: 1-2 field, 1 wood, rest as needed) and drive the season via `SOW`->`CONTINUE`->`END_SEASON`->`TURN_YEAR`; the personal actions use `SPEND_ACTION`. Keep the sim GREEN (it may need its assertions relaxed; the deep rebalance is Phase 2).
- [ ] **Step 2: Full suite green.** `cd prototype2 && npx vitest run` → all pass. Report counts + every file changed.
- [ ] **Step 3: Browser verify.** Dev server on 4321. New Game -> sow -> confirm: you are NOT clicking through empty days; the **beat screen** shows a beat and you set roles + spend a season action + **Continue**; the run stops at the ripe harvest and the last day; a hand's Tiredness visibly climbs across the season (labor bites); the season closes to Dusk with far less scrolling than before. Screenshot the beat screen. Fix console errors.
- [ ] **Step 4: Commit.**
```bash
git add prototype2/tests prototype2/sim
git commit -m "test(proto2): sweep the suite + sim policies to the beat loop; Phase 1 verified (v0.4 phase1 task 4)"
```

---

## Self-Review notes (author)
- **Spec coverage (Phase 1):** beat loop (spec 1) -> Tasks 2-3; season pool (spec 2) -> Tasks 1,3; roles (spec 3) -> Task 1; labor bites (spec 4) -> Task 1 strain bump (sim-tuned in Phase 2); one-beat UI (spec 7) -> Task 3. Deferred by the scope guard: tightening (Phase 2), events (Phase 3), day-book breakdown / buttons / town content (Phase 4).
- **Type/name consistency:** `hand.role` ("field"|"wood"|"forage"|"rest"), `SET_ROLE {handId, role}`, `CONTINUE`, `SPEND_ACTION {kind, target}`, `state.seasonActionsLeft`, `BALANCE.seasonActionsPerSeason`. `hand.task`/`ASSIGN`/`DO_PLAYER_ACTION`/`playerActionsLeft` retired; swept in Task 4.
- **Progress guarantee:** `continueRun` always steps at least one day past a beat before re-running, so a beat the player chooses to ignore (a ripe field left standing) cannot infinite-loop the run.
