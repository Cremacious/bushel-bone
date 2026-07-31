# Per-Day Action Economy — Phase 1 Implementation Plan (the economy + per-day stepping)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax. One subagent per task; each is TDD then reviewed with a fix loop before commit. NEVER use em dashes or hyphen-as-pause in any text (hard rule): use periods, commas, "to", or "and".

**Goal:** Fix the two P0 blockers (#49 time-jumps, #50 the 5-action pool collapses to one no-thought strategy) by replacing the **season pool + auto-run-to-beat** with **per-day renewing action points + per-day stepping**. Tight & strategic (1 point/day, carry cap 2), and time advances one visible day at a time.

**Design reference:** `docs/superpowers/specs/2026-07-31-action-economy-and-yearly-progression-design.md` (sections 1-2). This Phase 1 is the action economy + the time model. Phase 2 (jobs respawn timer) and Phase 3 (the yearly ramp) follow.

**Current code (verified this session):**
- `state.js` `initialState`: `seasonActionsLeft: BALANCE.seasonActionsPerSeason` (5). `balance.js`: `seasonActionsPerSeason: 5`.
- `reducer.js`: `SOW` lands the day-1 beat and sets `seasonActionsLeft`; `beginSeason` sets it per season; `SPEND_ACTION`->`spendAction`, `VISIT`->`visit`, `acceptJob` all decrement `seasonActionsLeft` and guard `> 0`. `CONTINUE`->`continueRun(s)` = `resolveDay` once then `runDays(s)` (runs to the next beat = the time-jump). `TURN_IN`->`resolveDay(state)` exists. `resolveDay` advances one day (`day = s.day + 1`, dusk at the end) and calls `maybeEvent`.
- `screens.js` `day:` renderer: the season-pool line ("Your own time this season: N of 5 left"), the SPEND_ACTION buttons (Forage/Work/Sit), the free "Ride to Marrow's Cross", and the primary card "Let the days run on" -> `CONTINUE` (or "Bring the season to a close" on the last day).
- `sim/policies.js` drives `CONTINUE` + `SPEND_ACTION` + town, and reads `seasonActionsLeft`.

**Scope guard (defer):** jobs respawn timer (Phase 2); the yearly mortgage/upkeep ramp + telegraphed pressures (Phase 3); #51 tending and #53 outcome-regard (fold in during Phase 2/3 or separately). Do not touch the yearly schedule here.

---

## Task 1: The per-day action budget (state + balance + spend paths)

**Files:** Modify `prototype2/src/core/balance.js`, `state.js`, `reducer.js`, `selectors.js`; tests.

- [ ] **Step 1: `balance.js`** — add `actionsPerDay: 1,` and `actionsCarryCap: 2,`. Keep `seasonActionsPerSeason` for now ONLY if something still needs it; prefer to remove it and fix all references (Step 6). Comment the new fields (per-day renewing points, carry cap = the design's "bank a quiet day").
- [ ] **Step 2: `state.js`** — replace `seasonActionsLeft: BALANCE.seasonActionsPerSeason` with `actions: BALANCE.actionsPerDay` (today's available points; starts at 1). Comment it ("player action points, renew +1/day up to actionsCarryCap; see resolveDay").
- [ ] **Step 3: `reducer.js` — replenish each day.** In `resolveDay`, when advancing to the next day (the `day = s.day + 1` step), set the new day's points: `actions = Math.min(BALANCE.actionsCarryCap, s.actions + BALANCE.actionsPerDay)`. So unspent points carry, capped at 2. (Do this only when the day actually advances, not when it rolls to dusk.)
- [ ] **Step 4: `reducer.js` — spend paths.** Rename `seasonActionsLeft` -> `actions` in `spendAction`, `visit`, `acceptJob`, and their guards (`s.actions > 0` / `s.actions <= 0`). Each still costs exactly 1. Riding to town (`SET_SCREEN`/`WALK_TO`) stays free; the errand in town (VISIT/ACCEPT_JOB/HIRE) costs the point. (HIRE: decide during implementation whether it costs an action; per the design a hire is "one town errand", so YES it should cost 1 action. Add the guard/decrement to `hire` if not present, and only if the player is in town on the day phase.)
- [ ] **Step 5: `reducer.js` — season open.** In `SOW` and `beginSeason`, set `actions: BALANCE.actionsPerDay` (a fresh day-1 point; no carry from the prior season). Replace the old `seasonActionsLeft: BALANCE.seasonActionsPerSeason` there.
- [ ] **Step 6: `selectors.js` + sweep.** Update any selector/helper reading `seasonActionsLeft` (e.g. a "canAct" check). Grep the whole `src/` and `tests/` and `sim/` for `seasonActionsLeft` and `seasonActionsPerSeason` and migrate every reference to the new `actions` / `actionsPerDay` model. (Render + sim are updated in Tasks 2-3, but the pure-core references here must be consistent.)
- [ ] **Step 7: Tests** (`tests/actions.test.mjs`): a fresh season has `actions === 1`; spending (SPEND_ACTION/VISIT/ACCEPT_JOB) decrements by 1 and is refused at 0; after a day resolves, `actions` replenishes by 1 up to the cap of 2 (spend 0 one day -> next day 2; spend at 2 -> back toward 1); a new season resets to 1.
- [ ] **Step 8:** `cd prototype2 && npx vitest run` -> green (update tests that asserted `seasonActionsLeft`/the pool of 5). Report. Commit.
```bash
git add prototype2/src/core/ prototype2/tests/
git commit -m "feat(proto2): per-day renewing action points (1/day, carry cap 2), retire the season pool (per-day econ p1 t1)"
```

## Task 2: Per-day stepping (retire auto-run) + the day-screen UI

**Files:** Modify `prototype2/src/core/reducer.js` (time model), `src/render/screens.js` (day renderer), `src/styles/screens.css`; tests.

- [ ] **Step 1: The advance model.** Retire the auto-run-to-beat as the default:
  - Keep `TURN_IN` (`resolveDay` once) as the **primary one-day advance**. The beat screen's primary button becomes **"Let the day pass"** -> `{ type: "TURN_IN" }` (on the last day it is "Bring the season to a close" -> ends the season as today, via the existing dusk transition).
  - Add a **`SKIP_QUIET`** action for the opt-in convenience: advance day-by-day while `interrupts()` is empty AND no event fires AND the player has no unspent points to use (i.e. genuinely nothing to decide), stopping at the next beat/decision, and record how many days passed on state (e.g. `state.skipped = n`) so the UI can show "N days pass." Reuse the old `runDays` loop body but bounded and counted. Retire `CONTINUE`/`continueRun` (or make `CONTINUE` an alias of `TURN_IN` if the sim/tests still send it, then migrate).
- [ ] **Step 2: The day-screen UI.** In the `day:` renderer:
  - Replace the season-pool line with a per-day read: **"Your time today: N of 2"** (from `s.actions`), plus a one-line hint ("A point a day. Bank one for tomorrow.").
  - The SPEND_ACTION buttons (Forage / Work a field / Sit with a hand) and the town errand still cost 1, gated by `s.actions > 0` with a clear disabled reason ("no time left today").
  - Primary advance card: **"Let the day pass"** (TURN_IN). Show a **"Let the quiet days pass"** secondary ONLY when it is safe (no ripe crop unharvested, no failing hand, and the player has spent their points) -> `SKIP_QUIET`; after it fires, show "N days pass" (from `state.skipped`) at the top of the resulting beat.
  - Keep the beat headline (`interrupts()`), the crew roles, and the resource strip.
- [ ] **Step 3: Confirm-to-spend** stays (the 4B two-tap arm), now against the per-day budget.
- [ ] **Step 4: Tests.** Reducer: `TURN_IN` advances exactly one day (day+1) and replenishes actions; `SKIP_QUIET` advances multiple quiet days and sets `skipped`, but stops at a beat/decision and never skips a ripe-crop/failing-hand day. Render (jsdom): the day screen shows "Your time today: N of 2", "Let the day pass", and shows the quiet-skip only when safe.
- [ ] **Step 5:** `cd prototype2 && npx vitest run` -> green (migrate tests/renderer that used "Let the days run on"/the pool). Report. Commit.
```bash
git add prototype2/src/core/reducer.js prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/tests/
git commit -m "feat(proto2): per-day stepping replaces auto-run-to-beat; day screen shows the daily point (per-day econ p1 t2)"
```

## Task 3: Sim + browser verify

**Files:** `prototype2/sim/policies.js` (per-day model), verify.

- [ ] **Step 1: Sim.** Update `sim/policies.js`: read `s.actions` (not `seasonActionsLeft`); advance with `TURN_IN`/`SKIP_QUIET` (not the old CONTINUE run-to-beat); spend the per-day point on the policy's priorities (essentials first, then town/expansion). Run `node sim/run.js` + `npx vitest run tests/sim.test.mjs`. The economy shifts (a careful player now makes ~1 real decision/day and can do MORE total actions across a season than the old 5-pool). Re-tune only what the sim demands so the survive/fail band stays meaningful (careful survives, careless fails). Record any change. NOTE: deep balance for the tight feel + the yearly ramp is Phase 3; here the bar is "the loop plays and the sim does not wedge or trivially win."
- [ ] **Step 2: Full suite green.** `cd prototype2 && npx vitest run` -> report counts.
- [ ] **Step 3: Browser verify.** New Game -> after Sow, on the day-1 beat confirm **"Your time today: 1 of 2"**. Spend the point (forage / a town errand), then **"Let the day pass"** advances **exactly one day** (day 1 -> day 2), never a silent jump. Bank a day (don't spend) and confirm the next day shows **2**. Confirm the town errand costs the day's point. Confirm **no multi-day teleport** on a normal advance; the "let the quiet days pass" convenience (if a stretch is empty) shows "N days pass." Screenshot the day screen. Fix console errors.
- [ ] **Step 4:** Commit verify fixes.
```bash
git add -A && git commit -m "fix(proto2): per-day econ p1 sim + verify fixes"
```

---

## Phase roadmap (this plan is Phase 1)
- **Phase 1 (this plan):** the per-day economy (1/day, carry 2) + per-day stepping (fixes #49, #50's structure).
- **Phase 2:** jobs on a ~3-day respawn timer (a rolling town offer), and fold in **#51 (tending must matter)** so field work is a real daily choice against the point; sim rebalance.
- **Phase 3:** the yearly ramp (smooth mortgage/upkeep curve, the self-tightening expansion pressure, one telegraphed pressure/year starting with Y2's lean winter), tuned across Years 1-5 in the sim; fold in **#53 (surface outcome regard)** where scenes are touched.

## Self-Review notes (author)
- **Spec coverage:** section 1 (per-day points + carry) -> Task 1; section 2 (per-day stepping, no silent jumps) -> Task 2; validation -> Task 3.
- **Both P0s in Phase 1:** #50 is fixed structurally by per-day renewing (no front-load, a decision most days); #49 is fixed by TURN_IN advancing one visible day and SKIP_QUIET being opt-in + counted.
- **Rename discipline:** `seasonActionsLeft` -> `actions`, `seasonActionsPerSeason` -> `actionsPerDay`/`actionsCarryCap`. Sweep src + tests + sim.
- **Kept:** the day-1 opening beat (D-055), the reuben_hands nudge (4E, fires on SOW), the confirm-to-spend (4B), the resource strip (4C), the variety grammar (4D).
- **No-dash voice** in all new copy.
