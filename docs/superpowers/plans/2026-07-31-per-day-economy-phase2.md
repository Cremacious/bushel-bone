# Per-Day Action Economy — Phase 2 (jobs respawn + tending matters)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax. One subagent per task; each is TDD then reviewed with a fix loop before commit. NEVER use em dashes or hyphen-as-pause (hard rule): use periods, commas, "to", or "and".

**Goal:** Make each day's single action point (Phase 1) a real choice by (a) pacing town **jobs on a ~3-day respawn** so town is worth returning to across a season, and (b) making **tending a field genuinely raise the harvest and be visible** (#51), so "just woodcut everything" stops being optimal.

**Design reference:** `docs/superpowers/specs/2026-07-31-action-economy-and-yearly-progression-design.md` (section 1: jobs respawn; and #51). Phase 1 (per-day points + per-day stepping) is done.

**Current code (verified this session):**
- **Jobs:** `selectors.townOffers(state)` returns a season-stable slice of `JOBS_PER_SEASON` (2) jobs, marking `jobsDoneThisSeason`. `ODD_JOBS` in `town.js`; accepting opens the job card (4D). `balance.js` has no job-timing field yet.
- **Tending:** in `reducer.resolveDay`, a Field hand tends the least-grown crop by setting `f.tended = true` (line ~279); the player's `SPEND_ACTION {kind:"work"}` also sets `f.tended = true` (line ~111). The growth step (line ~286) reads `f.tended` for `dailyGrowth` (doubles that day's growth) then resets `f.tended = false`. Harvest yield (line ~266): `units = Math.round(c.yield * (f.fert / 3))`, then `f.fert = Math.max(0, f.fert - 1)` and `f.crop=null; f.progress=0`. So tending currently only affects SPEED, which rarely changes the outcome, so players ignore it.
- Fields render: `screens.js` planting/Fields views draw `.fieldcard`/`.fc-proj` (a projection line).

**Scope guard (defer):** the yearly ramp + telegraphed pressures (Phase 3); #53 outcome-regard (Phase 3). Keep balance changes minimal and sim-checked.

---

## Task 1: Jobs on a respawn timer

**Files:** Modify `prototype2/src/core/balance.js`, `selectors.js` (`townOffers`); `town.js` (retire `JOBS_PER_SEASON` if unused); tests.

- [ ] **Step 1: `balance.js`** — add `jobRespawnDays: 3,` (a fresh job every ~3 days). Remove `JOBS_PER_SEASON` (or keep only as an internal max) and fix references.
- [ ] **Step 2: `townOffers` -> a rolling window.** Replace the season-stable slice with a **day-windowed** offer: the town shows the job for the current window `w = Math.floor((state.day - 1) / BALANCE.jobRespawnDays)`, chosen deterministically from `ODD_JOBS` by `(start + w)`, where `start` is the existing season+year+seed offset. So days 1-3 show job A, days 4-6 job B, etc. Optionally show the CURRENT window's job plus a peek at the next (1-2 on offer) if it reads better, but the core is: the offer **refreshes every 3 days**, and across a 10-day season 3-4 distinct jobs cycle through, one (or a small set) at a time. Mark a job `done` if its id is in `jobsDoneThisSeason` (a taken job cannot be retaken; the window still rotates). Keep it pure (day + season + year + seed, no Math.random).
- [ ] **Step 3:** Confirm the town render (the "Work going" list) still shows the offered job(s) with the line + cost tag, and accepting opens the job card (4D flow, unchanged). Because a job now costs the day's single point (Phase 1), you can take at most a few jobs a season, and never all of them.
- [ ] **Step 4: Tests** (`tests/town.test.mjs` or a new `tests/job-respawn.test.mjs`): `townOffers` returns a different job in a later day-window than an early one (day 1 vs day 5 differ); the same day returns the same offer (deterministic); a job in `jobsDoneThisSeason` is marked `done`; across a 10-day season at least 3 distinct jobs are offered. Update the old "2 jobs, season-stable" test.
- [ ] **Step 5:** `cd prototype2 && npx vitest run` -> green. Report. Commit.
```bash
git add prototype2/src/core/ prototype2/tests/
git commit -m "feat(proto2): town jobs respawn on a ~3-day timer (rolling offer) (per-day econ p2 t1)"
```

## Task 2: Tending matters and shows (#51)

**Files:** Modify `prototype2/src/core/balance.js`, `state.js` (field shape), `crops.js` (a yield helper), `reducer.js` (accumulate care + apply at harvest), `render/screens.js` (surface it); tests.

- [ ] **Step 1: `balance.js`** — add `careCap: 6,` and `careYieldBonus: 0.06,` (each tended day adds 6% to the harvest, up to +36% at the cap). Comment: tending banks yield, so field work is a real choice, not just speed.
- [ ] **Step 2: Field shape.** In `state.js` `initialState`, add `care: 0` to each field. In `reducer.plant()`, reset `care: 0` on a fresh sowing.
- [ ] **Step 3: Accumulate care.** In `resolveDay`'s growth step (where `f.tended` is read then reset, line ~286), when `f.tended` is true also bank care: `f.care = Math.min(BALANCE.careCap, (f.care || 0) + 1)` before resetting `f.tended`. This captures BOTH the crew's Field tend and the player's `work` action.
- [ ] **Step 4: Apply at harvest + reset.** In the harvest yield calc (line ~266), fold in care: `let units = Math.round(c.yield * (f.fert / 3) * (1 + (f.care || 0) * BALANCE.careYieldBonus));`. On harvest, reset `f.care = 0` alongside `f.crop=null; f.progress=0` (line ~270). Add a `cropYield(field, crop)` helper in `crops.js` (or `selectors.js`) that returns the projected units for a field (fert + care), so the render and the reducer share one formula.
- [ ] **Step 5: Surface it (make the payoff visible).**
  - **Harvest log line:** when `f.care > 0`, append to the "Brought in ..." daylog line something like ", the richer for the tending." (no dashes).
  - **Fields / planting view:** on a growing field, show its tending state and the effect, e.g. "tended: N" and a projected-yield line that includes the care bonus (use `cropYield`). So the player sees a tended field is worth more.
  - Optional: a Dusk day-book note when a tended field came in.
- [ ] **Step 6: Tests** (`tests/tending.test.mjs`): a field tended N days has `care = min(cap, N)`; a tended field harvests MORE than an identical untended field (assert units/coin/larder delta); care resets to 0 after harvest and on replant; `cropYield` matches the reducer's harvest result. A render test that a growing tended field shows its tending state.
- [ ] **Step 7:** `cd prototype2 && npx vitest run` -> green (update any harvest test that hard-coded the old units). Report. Commit.
```bash
git add prototype2/src/core/ prototype2/src/render/screens.js prototype2/tests/
git commit -m "feat(proto2): tending banks harvest yield and shows it (#51) (per-day econ p2 t2)"
```

## Task 3: Sim + browser verify

**Files:** `prototype2/sim/policies.js`, verify.

- [ ] **Step 1: Sim.** Update `sim/policies.js` so a policy values field-tending (an engaged line tends and out-yields a lazy woodcut-only line) and takes the rolling jobs when worthwhile. Run `node sim/run.js` + `npx vitest run tests/sim.test.mjs`: the curve must stay meaningful (careful survives, careless fails) and an **engaged (tending) line should now beat a lazy (woodcut-only) line** on yield/coin. Re-tune `careYieldBonus`/`jobRespawnDays` modestly if tending is a no-op or overpowered. (Deep balance + the tight feel is Phase 3; here the bar is: tending is a real lever and jobs are paced.)
- [ ] **Step 2: Full suite green.** `cd prototype2 && npx vitest run` -> report counts.
- [ ] **Step 3: Browser verify.** New Game -> plant, set a hand to Fields (tend), and over several days confirm the field shows a rising **tending** state and a higher **projected yield**; at harvest, the day-book says it came in richer. Ride to town on different days and confirm the **job on offer changes** (respawns) across the season and each costs your day's point. Confirm woodcut-only no longer trivially wins (a tended field visibly out-yields). Screenshot a tended field's projection and two different job offers. Fix console errors.
- [ ] **Step 4:** Commit verify fixes.
```bash
git add -A && git commit -m "fix(proto2): per-day econ p2 sim + verify fixes"
```

---

## Self-Review notes (author)
- **Spec coverage:** jobs respawn -> Task 1; #51 tending matters -> Task 2; validation -> Task 3.
- **Ties to Phase 1:** with one point/day, a rotating job + a tending payoff make the daily choice real (field vs wood vs forage vs a town errand), which is the whole point of #50.
- **One yield formula:** `cropYield()` shared by render + reducer so the projection never lies.
- **Balance safety:** `careYieldBonus`/`jobRespawnDays` go through the sim; the deep tightening + yearly ramp is Phase 3.
- **No-dash voice** in all new copy; keep the alt-1800s tone in the harvest/tending lines.
