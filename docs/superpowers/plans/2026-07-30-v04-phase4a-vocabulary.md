# v0.4 Phase 4A — The Mechanical Vocabulary Overhaul (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax. One subagent per task; each task is TDD then spec- + code-quality-reviewed with a fix loop before commit.

**Goal:** Make event/scene choices *readable*. Today `fxTag` leaks raw keys (`strainOne`, `strainAll`, `larder`) and colors by a naive "any + is good" rule, so "Work them through it · **+16 strainOne**" shows **green** when it is the worst option. This phase gives every fx a human label, colors by *meaning* (tiredness/dread up = red), names the stakes when a hand is at risk, teaches that Dread is hidden on purpose, and re-tunes recovery so Rest/Care visibly move a hand's condition.

**Design reference:** `docs/superpowers/specs/2026-07-30-v04-phase4-clarity-reward-clone-reveal-design.md` Part A.

**Architecture:** `fxTag` (render/screens.js) is the one grammar for choice tags — the fix is centralized there. Recovery numbers live in `balance.js` (sim-guarded). A first-time tip reuses the existing `tipsSeen` + `SEE_TIP` machinery. Pure where logic; content untouched except one inert-fx cleanup.

**The full fx key set** (from `chooseScene`, reducer.js:139-147): `regard, coin, reckoning, larder, fuel, seed, strainAll, strainOne, loseHand`. (`morale` appears in one event's fx but the reducer ignores it — Task 1 removes that inert key.)

**Scope guard (defer to 4B-4E):** the season-pool relabel/confirm, the `.hl` CSS bug, the status strip, crop grow-times, the variety grammar, the clone reveal.

---

## Task 1: `fxTag` — human labels + correct valence

**Files:** Modify `prototype2/src/render/screens.js`; modify `content/script.yaml` (drop one inert `morale` fx) + regen; create `prototype2/tests/fxtag.test.mjs`.

- [ ] **Step 1: Replace `STAT_LABEL` with an `FX_META` table** (label + valence direction) in `screens.js`, just above `fxTag`:
```javascript
// Every fx key a choice can carry, mapped to a player-facing label and a valence direction:
// `up:true` means a positive delta is GOOD (green); `up:false` means a positive delta is BAD (red).
// Tiredness and Dread rising are bad — the fix for "+16 strainOne" reading as green (Part A2).
const FX_META = {
  regard:    { label: "regard",             up: true  },
  coin:      { label: "coin",               up: true  },
  larder:    { label: "food",               up: true  },  // events use `larder`; players read "food"
  fuel:      { label: "fuel",               up: true  },
  seed:      { label: "seed",               up: true  },
  reckoning: { label: "dread",              up: false },  // more dread is bad
  strainOne: { label: "Tiredness · a hand", up: false },  // more tiredness is bad
  strainAll: { label: "Tiredness · the crew", up: false },
};
```
- [ ] **Step 2: Rewrite `fxTag`** to use `FX_META`, color by meaning, and special-case the boolean `loseHand`:
```javascript
// Turn a choice's state deltas into player-facing stat tags, colored by MEANING (not sign):
// tiredness/dread rising is bad, everything else rising is good. `loseHand` is a boolean stake.
export function fxTag(fx = {}) {
  const parts = [];
  let good = false, bad = false;
  for (const [k, v] of Object.entries(fx)) {
    if (!v) continue;
    if (k === "loseHand") { parts.push("a hand may be lost"); bad = true; continue; }
    const meta = FX_META[k];
    if (!meta) { parts.push(`${v > 0 ? "+" : "−"}${Math.abs(v)} ${k}`); continue; } // unknown: raw, uncolored
    parts.push(`${v > 0 ? "+" : "−"}${Math.abs(v)} ${meta.label}`);
    const isGood = meta.up ? v > 0 : v < 0;
    if (isGood) good = true; else bad = true;
  }
  return { text: parts.join(" · "), valence: bad && !good ? "bad" : good && !bad ? "good" : "" };
}
```
- [ ] **Step 3: Remove the one inert `morale` fx.** In `content/script.yaml`, find the `ev_gate_child` scene's fx (the "take the child in" branch carries `morale: 1`, which the reducer never applies) and delete the `morale` key (leave `larder`). Then regen: `cd prototype2 && npm run gen:data` (or the repo's data-gen script) so `src/content/scenes.js` matches. If the gen script name differs, use the one wired in `package.json`.
- [ ] **Step 4: Test `prototype2/tests/fxtag.test.mjs`:**
```javascript
import { describe, it, expect } from "vitest";
import { fxTag } from "../src/render/screens.js";

describe("fxTag — legible, correctly-colored choice tags", () => {
  it("labels tiredness and colors a rise RED (the sick-hand bug)", () => {
    const t = fxTag({ strainOne: 16 });
    expect(t.text).toBe("+16 Tiredness · a hand");
    expect(t.valence).toBe("bad");
  });
  it("colors easing tiredness (a negative) GREEN", () => {
    expect(fxTag({ strainOne: -10 }).valence).toBe("good");
  });
  it("colors the crew's tiredness and rising dread as bad", () => {
    expect(fxTag({ strainAll: 8 }).text).toBe("+8 Tiredness · the crew");
    expect(fxTag({ strainAll: 8 }).valence).toBe("bad");
    expect(fxTag({ reckoning: 4 }).text).toBe("+4 dread");
    expect(fxTag({ reckoning: 4 }).valence).toBe("bad");
  });
  it("maps larder to 'food' and colors a gain green", () => {
    expect(fxTag({ larder: 6 }).text).toBe("+6 food");
    expect(fxTag({ larder: 6 }).valence).toBe("good");
    expect(fxTag({ larder: -8 }).valence).toBe("bad");
  });
  it("renders loseHand as a plain stake, not '+1 loseHand'", () => {
    const t = fxTag({ loseHand: true });
    expect(t.text).toBe("a hand may be lost");
    expect(t.valence).toBe("bad");
  });
  it("marks a mixed cost/benefit choice as neither pure good nor bad", () => {
    expect(fxTag({ coin: -6, larder: 6 }).valence).toBe("");
  });
});
```
- [ ] **Step 5:** Run `cd prototype2 && npx vitest run tests/fxtag.test.mjs` → PASS. Then the FULL suite; fix any test that asserted the old raw-key text (e.g. a scene test checking a tag string). Report changes. Commit.
```bash
git add prototype2/src/render/screens.js prototype2/tests/fxtag.test.mjs content/script.yaml prototype2/src/content/scenes.js
git commit -m "feat(proto2): legible, correctly-colored choice tags (fxTag overhaul) (v0.4 4A task 1)"
```

## Task 2: Stakes on the card + the silent-Dread tip

**Files:** Modify `content/script.yaml` (event choice sub-lines) + regen; modify `prototype2/src/render/screens.js` (the Dread first-time tip on the beat/scene screen); reuse `SEE_TIP`/`tipsSeen`.

- [ ] **Step 1: Name the stakes where a hand can be lost/harmed.** In `content/script.yaml`, for the hand-risk event choices (e.g. `ev_sick_hand` "work them through it", and any choice carrying `loseHand` or a large `strainOne`), ensure the choice's `sub` (or body) plainly states the danger, e.g. *"Push them, and they may not last a hard week."* Keep the no-dash voice (memory `no-dash-voice-rule`). Regen data.
- [ ] **Step 2: The silent-Dread tip.** The first time a choice tag containing dread is shown to the player, surface a one-time tip. Implement in the scene/beat renderer where `fxTag` tags are built: if any visible choice's fx has `reckoning > 0` and `!s.tipsSeen.includes("dread")`, render a dismissible tip line beneath the choices (reuse the existing tip component/pattern) reading: *"The land keeps its own ledger. You will feel the reckoning long before you ever see it counted."* Dismiss dispatches `SEE_TIP {id:"dread"}`. (Dread stays hidden — D-027 — this only explains that it is hidden by design.)
  - If the codebase already has a declarative first-time-tip registry (a TIPS map keyed by id with a trigger), add the `dread` entry there instead of hand-rolling; match the existing pattern. Inspect how the seven curated tips are wired and follow it.
- [ ] **Step 3: Test.** Add to a render test (jsdom) or a small new `tests/dread-tip.test.mjs`: rendering a scene whose fx includes `reckoning>0` with `tipsSeen:[]` produces the tip text; with `tipsSeen:["dread"]` it does not. If tips are data-driven, unit-test the trigger predicate instead.
- [ ] **Step 4:** Run `cd prototype2 && npx vitest run` → green. Report changes. Commit.
```bash
git add prototype2/src/render/screens.js content/script.yaml prototype2/src/content/scenes.js prototype2/tests/
git commit -m "feat(proto2): name hand-risk stakes + teach the silent Dread (v0.4 4A task 2)"
```

## Task 3: Make Rest & Care land (recovery tuning + a condition-change note)

**Files:** Modify `prototype2/src/core/balance.js`, `reducer.js` (record condition steps for the day-book), `render/screens.js` (dusk/beat note), `selectors.js` if needed; `sim/` re-check; tests.

- [ ] **Step 1: Re-tune recovery** in `balance.js` so one stretch of rest is a **visible** condition step (Steady 0-24 / Worn 25-49 / Failing 50-99 boundaries at `wornAt:25, failingAt:50`). Raise `restRecovery` (8 → ~14) and `careRecovery` (5 → ~10) so a rest day clears a boundary rather than nibbling. Final numbers come from the sim (Step 4) — the bar is: a Failing hand put to Rest visibly returns toward Worn/Steady within a normal rest stretch, and Sitting-with (care) is a stronger single-shot.
- [ ] **Step 2: Record condition changes for feedback.** In the day-resolution path (`resolveDay`/`resolveWeek`), after strain is applied, compare each alive hand's `conditionOf` before vs after the resolved stretch and collect a small list of transitions (e.g. `{name, from, to, better:bool}`) onto the state's day-book/summary structure that Dusk already reads (`duskSummary`). Do not surface raw strain numbers (keep the condition track, D-027-adjacent — tiredness is a word, not a bar).
- [ ] **Step 3: Show it.** In the dusk day-book (and, if cheap, the beat status), render a line per transition: *"Reuben rested — Failing → Worn"* (green when `better`, amber/red when worse). Reuse the `line(label, value, i)` day-book helper.
- [ ] **Step 4: Sim + suite.** Run `node sim/run.js` and `npx vitest run tests/sim.test.mjs`; confirm the recovery bump doesn't break the curve (careful still survives tight, careless still can lose a hand). Re-tune if a rested crew now trivially never fails — the intent is *visible* recovery, not *free* recovery. Then the full suite; update any test asserting old `restRecovery`/`careRecovery` or the dusk structure. Report changes.
- [ ] **Step 5: Commit.**
```bash
git add prototype2/src/core/ prototype2/src/render/screens.js prototype2/sim/ prototype2/tests/
git commit -m "feat(proto2): rest & care visibly move a hand's condition (v0.4 4A task 3)"
```

## Task 4: Full suite + browser verify

- [ ] **Step 1:** `cd prototype2 && npx vitest run` → all green; report file/test counts.
- [ ] **Step 2: Browser verify** (preview_start the prototype). New Game → reach an event with a hand-risk choice (or force one): confirm the sick-hand card now reads **"+16 Tiredness · a hand"** in **red**, the Doc/Rest options read sensibly, the stake sub-line shows, and the first dread tag pops the one-time tip. Rest a tired hand and confirm the day-book prints the condition step (e.g. "Failing → Worn") and the change is felt. Screenshot the sick-hand card and a rest day-book line. Fix any console errors.
- [ ] **Step 3: Commit** any verify fixes.
```bash
git add -A && git commit -m "fix(proto2): 4A browser-verify fixes"
```

---

## Self-Review notes (author)
- **Spec coverage (Part A):** A1 labels + A2 valence → Task 1; A3 stakes + A4 Dread tip → Task 2; A5 Rest/Care lands → Task 3; verify → Task 4.
- **Centralized:** the valence bug lives entirely in `fxTag`; fixing it there corrects every event/scene choice at once. Role-task tags (`selectors.js` `roleTag`/`tirednessAdvice`) already color "+Tiredness" as bad — Task 1 brings `fxTag` into line with that existing grammar.
- **Names/keys:** `FX_META`, `SEE_TIP {id:"dread"}`, `restRecovery`/`careRecovery`. `STAT_LABEL` retired.
- **No-dash voice:** all new sub-lines/tips must avoid em dashes and hyphen-as-pause (memory rule). (The "Failing → Worn" arrow is a glyph, not a dash — acceptable; if it reads as a dash in-font, use "to".)
- **Hidden reckoning (D-027):** the Dread tip explains the hidden stat without surfacing a number; the condition note uses words (Worn/Failing), not strain values.
