# v0.4 Phase 3 — Events (the drama) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fill the beats with drama. A seeded, non-repeating **event deck** across the seven families (weather, pests, wildlife, opportunity, town, personal, reckoning) fires as the season runs — each a choice-card with real consequences, good and bad, threats telegraphed where fair. This is what makes each season *different* and the beats worth playing.

**Architecture:** Reuses the **scene engine** (an event IS a scene with choices + fx) and the **PRNG** (`mulberry32`/`rngState`) and the no-repeat idea (`eventsSeen`). `resolveDay` rolls a seeded chance for an event each day; when one fires it pauses the run at the event scene (the scene renderer already exists); resolving it applies the fx and returns to the running day. Pure `(state, action) => state`.

**Design reference:** `docs/superpowers/specs/2026-07-30-v04-beat-driven-loop-design.md` section 6.

**Scope guard (defer to Phase 4):** the day-book ledger breakdown, button restyle, deeper town card content. Reckoning-family events here only *nudge* the hidden `reckoning` value (the reckoning *biting* is a later layer).

---

## Task 1: The event fx grammar + the deck data

**Files:** Modify `prototype2/src/core/reducer.js` (`chooseScene` fx), create `prototype2/src/core/events.js`, modify `prototype2/src/content/scenes.js`; tests.

- [ ] **Step 1: Extend `chooseScene`'s fx** to cover event consequences (resources, labor, a hand). Add handling after the existing regard/coin/reckoning:
```javascript
  if (fx.larder != null) ns.larder = Math.max(0, ns.larder + fx.larder);
  if (fx.fuel != null) ns.fuel = Math.max(0, ns.fuel + fx.fuel);
  if (fx.seed != null) ns.seed = Math.max(0, ns.seed + fx.seed);
  if (fx.strainAll != null) ns.hands = ns.hands.map((h) => h.alive ? { ...h, strain: Math.max(0, Math.min(BALANCE.strain.lostAt, h.strain + fx.strainAll)) } : h);
  if (fx.strainOne != null) { const w = ns.hands.find((h) => h.alive); if (w) ns.hands = ns.hands.map((h) => h.id === w.id ? { ...h, strain: Math.max(0, Math.min(BALANCE.strain.lostAt, h.strain + fx.strainOne)) } : h); }
  if (fx.loseHand) { const v = [...ns.hands].reverse().find((h) => h.alive && h.id !== "reuben") || ns.hands.find((h) => h.alive && h.id !== "reuben"); if (v) ns.hands = ns.hands.map((h) => h.id === v.id ? { ...h, alive: false } : h); }
```
(`BALANCE` is imported in reducer.js.) `loseHand` never kills Reuben (the foreman anchors the run); it takes the newest hired hand.

- [ ] **Step 2: Create `prototype2/src/core/events.js` — the deck.** Each event references a scene id (mechanics in scenes.js, prose in script.yaml) and carries a family + an optional gate:
```javascript
// The event deck: each is a scripted scene (choices + fx) tagged with a family and an
// optional gate. Drawn seeded + non-repeating within a run (see reducer.rollEvent). Prose in
// content/script.yaml; mechanics (choices/fx) in content/scenes.js with `event: true`.
export const EVENTS = [
  { id: "ev_fox",         family: "wildlife" },
  { id: "ev_early_frost", family: "weather", gate: { season: ["fall", "winter"] } },
  { id: "ev_good_rain",   family: "weather", gate: { season: ["spring", "summer"] } },
  { id: "ev_peddler",     family: "opportunity" },
  { id: "ev_sick_hand",   family: "personal", gate: { minHands: 1 } },
  { id: "ev_foundling",   family: "personal" },
  { id: "ev_blight",      family: "pests", gate: { season: ["summer", "fall"] } },
  { id: "ev_omen_field",  family: "reckoning" },
];
export const EVENT_CHANCE = 0.28; // per-day probability a fresh, eligible event fires
```

- [ ] **Step 3: `scenes.js`** — add a mechanics entry for each event id: `{ event: true, returnTo: "run", choices: [...], fx: { <choice>: {...} } }`. (Content prose is Task 3; here define the choices + fx numbers so the mechanics exist.) Example:
```javascript
  ev_fox: { event: true, returnTo: "run", choices: ["chase", "ignore"],
    fx: { chase: { strainOne: 12 }, ignore: { larder: -8 } } },
```
Author the fx for all 8 events (each 2-3 choices; a mix of costs — larder/fuel/coin/strain/reckoning — and a benefit choice; e.g. `ev_good_rain` is a pure boon, `ev_early_frost` telegraphs a fuel hit, `ev_peddler` trades coin for seed, `ev_sick_hand` trades coin for a hand's strain, `ev_foundling` a mouth vs a hand, `ev_omen_field` nudges reckoning). Keep magnitudes modest (the sim, Task 4, checks they don't wreck the curve).

- [ ] **Step 4: Failing tests `tests/events.test.mjs`** for the fx grammar:
```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { EVENTS } from "../src/core/events.js";

describe("event fx grammar", () => {
  it("a choice applies larder/fuel/strain deltas", () => {
    let s = { ...initialState(1), phase: "scene", scene: { id: "ev_fox", result: null }, larder: 20 };
    s = reduce(s, { type: "CHOOSE_SCENE", choiceId: "ignore" });
    expect(s.larder).toBe(12); // -8
  });
  it("every event in the deck has a scenes.js mechanics entry with choices", async () => {
    const { SCENES } = await import("../src/content/scenes.js");
    for (const e of EVENTS) { expect(SCENES[e.id]).toBeTruthy(); expect(SCENES[e.id].choices.length).toBeGreaterThan(0); }
  });
});
```

- [ ] **Step 5:** Run `cd prototype2 && npx vitest run tests/events.test.mjs` → PASS; full suite green. Commit.
```bash
git add prototype2/src/core/ prototype2/src/content/scenes.js prototype2/tests/events.test.mjs
git commit -m "feat(proto2): event fx grammar + the event deck data (v0.4 phase3 task 1)"
```

## Task 2: The event trigger (fire during the run)

**Files:** Modify `prototype2/src/core/state.js` (`eventsSeen`), `reducer.js` (`resolveDay` rolls an event; `closeScene` returns to the run); tests.

- [ ] **Step 1: `state.js`** — add `eventsSeen: []` to `initialState`.
- [ ] **Step 2: `reducer.js` — roll an event in `resolveDay`.** After the day's resolution but before returning (and only when the season is still running, i.e. not the last day), roll a seeded chance for a fresh, eligible event; if one fires, pause the run at its scene. Add a helper and call it at the end of `resolveDay`:
```javascript
// After a day resolves, maybe an event stirs: a seeded roll; if it fires, pick a fresh,
// eligible event and pause the run at its scene (the scene is the beat). Consumes rngState.
function maybeEvent(s) {
  if (s.phase !== "day" || s.day >= BALANCE.daysPerSeason) return s;
  const rng = mulberry32(s.rngState);
  const roll = rng();
  let rngState = rng.getState();
  if (roll >= EVENT_CHANCE) return { ...s, rngState };
  const eligible = EVENTS.filter((e) => !(s.eventsSeen || []).includes(e.id) && eventEligible(s, e));
  if (!eligible.length) return { ...s, rngState };
  const rng2 = mulberry32(rngState); const pick = eligible[Math.floor(rng2() * eligible.length)]; rngState = rng2.getState();
  return { ...s, rngState, eventsSeen: [...(s.eventsSeen || []), pick.id], phase: "scene", scene: { id: pick.id, result: null } };
}
function eventEligible(s, e) {
  const g = e.gate; if (!g) return true;
  if (g.season && !g.season.includes(season(s))) return false;
  if (g.minHands && livingHands(s).length < g.minHands + 0) return false; // hands beyond Reuben
  return true;
}
```
Import `mulberry32` from `./rng.js`, `EVENTS`/`EVENT_CHANCE` from `./events.js`, and ensure `season`/`livingHands` are imported. In `resolveDay`, change the final `return { ...s, hands, ... };` to compute the next state then `return maybeEvent(next);` (so an event can fire on the day just resolved). Make sure `maybeEvent` runs on the post-resolve state (phase "day", the advanced day).
- [ ] **Step 3: `closeScene`** — an event scene resumes the run. Add before the `returnTo` branch (or handle `returnTo: "run"`):
```javascript
  if (sc && sc.returnTo === "run") return { ...base, phase: "day" }; // resume the season at the beat screen
```
(So after an event, the player is back on the beat screen and CONTINUEs.)
- [ ] **Step 4: Tests** — append to `tests/events.test.mjs`: with a seed that fires an event, running a season (`SOW` then `CONTINUE`s) reaches a `phase: "scene"` whose id is in `EVENTS` at least once across a few seasons; `eventsSeen` grows and no event repeats within the run; closing an event scene returns to `phase: "day"`. (Use a loop over `CONTINUE`/`CHOOSE_SCENE`/`CLOSE_SCENE`; assert an event was seen.)
- [ ] **Step 5:** Run `cd prototype2 && npx vitest run tests/events.test.mjs` → PASS; full suite green. Commit.
```bash
git add prototype2/src/core/ prototype2/tests/events.test.mjs
git commit -m "feat(proto2): events fire as beats during the run (seeded, no-repeat) (v0.4 phase3 task 2)"
```

## Task 3: Event content (the writing)

**Files:** Modify `content/script.yaml` (+ regenerate); confirm scenes.js.

- [ ] **Step 1:** Write prose for all 8 event scenes in `content/script.yaml` (matching the scene shape: `eyebrow`, `title`, block-scalar `body`, and per-choice `text`/`sub`/`result`), tokenized, **no em dashes**, alt-1800s voice. Use the **highlight system** (`<span class="hl wx">`, `hl mkt`, `hl omen`, etc.) on the telegraphing keywords. Each event's choices must match the scenes.js choice ids + convey the fx cost/benefit in the sub line (so the player sees the tradeoff). Examples of the intended beats: `ev_fox` (a fox in the coop: chase it, losing a hand's day to strain, or leave it and lose food), `ev_early_frost` (telegraphed: chop hard or lose fuel), `ev_good_rain` (a boon), `ev_peddler` (coin for seed), `ev_sick_hand` (pay Doc / rest them / work them through it), `ev_foundling` (a mouth or a hand), `ev_blight` (lose a crop or spend to save it), `ev_omen_field` (an omen; a choice that eases or feeds the reckoning).
- [ ] **Step 2:** `cd prototype2 && npm run gen:data`; confirm the event bodies resolve. Add a coverage test (extend `tests/events.test.mjs`): every event id resolves `L(id + ".body")` prose and each choice id resolves `.text`.
- [ ] **Step 3:** Suite green; commit.
```bash
git add content/script.yaml prototype2/src/generated/script.js prototype2/tests/events.test.mjs
git commit -m "feat(proto2): write the starter event deck across the seven families (v0.4 phase3 task 3)"
```

## Task 4: The sim + browser verify

**Files:** `sim/policies.js` (handle event scenes), `balance.js` (tune if events destabilize), verify.

- [ ] **Step 1: The sim.** The sim's `structural(s)` already resolves `scene` phases (CHOOSE first choice, then CLOSE), so events fire and resolve deterministically (seeded). Run `node sim/run.js` + `npx vitest run tests/sim.test.mjs`. If events shift the curve (they add modest random costs/boons), re-check the bands hold (optimal survives, sloppy fails); nudge `EVENT_CHANCE` or event fx magnitudes if they wreck it. Keep `sim.test.mjs` green; note any tuning.
- [ ] **Step 2: Full suite green.** `cd prototype2 && npx vitest run` → all pass; report counts.
- [ ] **Step 3: Browser verify.** New Game → play a season or two → confirm **events fire as beats** (a fox, a frost, a peddler...), each shows a choice with a legible tradeoff (highlighted telegraph), the choice applies its consequence (watch the ledger/hand strain move), and no event repeats within the run. Confirm the run resumes after an event (CONTINUE). Screenshot an event beat. Fix console errors.
- [ ] **Step 4: Commit.**
```bash
git add prototype2/sim prototype2/src/core/balance.js
git commit -m "feat(proto2): events verified in the sim + browser; tuned (v0.4 phase3 task 4)"
```

---

## Self-Review notes (author)
- **Spec coverage (section 6):** the 7-family seeded no-repeat deck -> Tasks 1-3; choice-grammar with consequences -> Task 1 fx + Task 3 prose; fires as beats -> Task 2; telegraphed via the highlight system -> Task 3.
- **Reuse:** events are scenes (existing engine) + the PRNG + the highlight system; minimal new machinery (`maybeEvent`, `eventsSeen`, `returnTo: "run"`).
- **Determinism:** the event roll consumes `rngState`, so a seed replays identically (the sim stays deterministic).
- **Consistency:** `EVENTS`/`EVENT_CHANCE`, `eventsSeen`, `returnTo: "run"`, fx keys `larder/fuel/seed/strainAll/strainOne/loseHand` (plus existing regard/coin/reckoning). Reuben is never the lost hand.
