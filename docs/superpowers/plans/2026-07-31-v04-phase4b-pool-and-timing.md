# v0.4 Phase 4B — Season Pool & Timing Clarity (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax. One subagent per task; each is TDD then reviewed with a fix loop before commit. NEVER use em dashes or hyphen-as-pause in any text you write (hard project rule); use periods, commas, "to", or "and".

**Goal:** Make the player's own time legible and un-lose-able. Four fixes from the playtest: relabel the confusing "You have 5 of the season to spend" (B1), tell the player their crew's orders resolve as the days run (B3), confirm before an action is spent so a stray tap does not burn one (B2), and give every season a **guaranteed day-1 opening beat** so the days never run before the player has had a turn (B4, the "it's already day 4" fix).

**Design reference:** `docs/superpowers/specs/2026-07-30-v04-phase4-clarity-reward-clone-reveal-design.md` Part B (B1-B4).

**Architecture:** B4 is a small reducer change (do not auto-run on season open) plus a render title. B1/B2/B3 are the beat-screen renderer (`screens.js` `day:`). The season pool is `state.seasonActionsLeft` (starts `BALANCE.seasonActionsPerSeason`, currently 5), spent via `SPEND_ACTION {kind}`.

**Key current code (verified):**
- `reducer.js` **SOW** (line ~46): `return runDays({ ...withInitialRoles({ ...state, phase: "day", day: 1 }), seasonActionsLeft: BALANCE.seasonActionsPerSeason });` -> the `runDays(...)` wrapper is what fast-forwards past day 1.
- `reducer.js` **beginSeason** winter branch (line ~86): also wraps in `runDays(...)`. Non-winter returns `phase:"planting"` (planting -> SOW is the season open there).
- `runDays(s)` (line ~313) resolves day after day while `interrupts()` is empty; `continueRun(s)` (line ~326) steps one day then runs on (this is what CONTINUE / "Let the days run on" calls).
- `screens.js` `day:` renderer: line ~94 the `Day X of N` eyebrow; ~127 `You have ${left} of the season to spend.`; ~128-137 the SPEND_ACTION buttons (Forage / Work a field / Sit with X); ~138 "Ride to Marrow's Cross" (free nav via SET_SCREEN, NOT a SPEND_ACTION); ~142-146 the "Let the days run on" / CONTINUE card.

**Scope guard (defer):** the `.hl` CSS bug, status strip, crop grow-times (4C); the variety grammar (4D); the clone reveal (4E). Do not touch balance numbers except as the sim requires for B4.

---

## Task 1: The guaranteed day-1 opening beat (B4)

**Files:** Modify `prototype2/src/core/reducer.js`, `src/render/screens.js`; update `sim/policies.js` if needed; tests.

- [ ] **Step 1: Do not auto-run on season open.** In `reducer.js`:
  - **SOW**: drop the `runDays(...)` wrapper so planting lands the player on the day-1 beat instead of fast-forwarding:
    ```javascript
    case "SOW":
      return { ...withInitialRoles({ ...state, phase: "day", day: 1 }),
               seasonActionsLeft: BALANCE.seasonActionsPerSeason };
    ```
  - **beginSeason** (winter branch): same, land on the day-1 beat rather than `runDays(...)`:
    ```javascript
    return season(s) === "winter"
      ? { ...withInitialRoles({ ...s, phase: "day", day: 1 }), seasonActionsLeft: BALANCE.seasonActionsPerSeason, logSeasonStart: s.log.length, jobsDoneThisSeason: [] }
      : { ...s, phase: "planting", day: 1, seasonActionsLeft: BALANCE.seasonActionsPerSeason, logSeasonStart: s.log.length, jobsDoneThisSeason: [] };
    ```
  Now the player's first **"Let the days run on"** (CONTINUE -> `continueRun`, which steps day 1 then runs on) begins the auto-run. Every season opens on a real day-1 turn.
- [ ] **Step 2: A distinct opening title.** In `screens.js` `day:`, when `s.day === 1` and `interrupts(s).length === 0`, use an opening title instead of "A quiet stretch." e.g. `title = "A new season. Set your hands."` (no dashes). Keep the mid-season "A quiet stretch." for day > 1 with no interrupt. (Interrupts still take priority when present, even on day 1.)
- [ ] **Step 3: The sim.** `sim/policies.js` drives the loop; with SOW no longer auto-running, a policy must dispatch CONTINUE from the day-1 beat to start the season (it likely already sends CONTINUE at beats, so this may just work, but verify). Run `node sim/run.js` + `npx vitest run tests/sim.test.mjs`: the curve must be UNCHANGED (same survive/foreclose years) because the opening beat adds a stop, not a resource change. If a policy wedges at the day-1 beat, add a CONTINUE there. Do not retune balance.
- [ ] **Step 4: Tests.** Add/extend a reducer test: after `SOW` (or a winter `beginSeason`), `state.phase === "day"` and `state.day === 1` (NOT fast-forwarded); dispatching `CONTINUE` then advances the day and runs on. Update any existing test that asserted SOW auto-runs to a later day (there is likely a planting/playthrough test that expected SOW to land mid-season, e.g. the full-year playthrough helper that plants then reads a beat). Fix them to the new "SOW lands on day 1, CONTINUE runs" flow. Never weaken a test.
- [ ] **Step 5:** `npx vitest run` -> green; report what changed. Commit.
```bash
git add prototype2/src/core/reducer.js prototype2/src/render/screens.js prototype2/sim/ prototype2/tests/
git commit -m "feat(proto2): guaranteed day-1 opening beat, no auto-run before the player acts (v0.4 4B task 1)"
```

## Task 2: Relabel the pool, timing hint, and confirm-before-spend (B1, B3, B2)

**Files:** Modify `prototype2/src/render/screens.js` (the `day:` renderer); `src/content/tips.js` if extending a tip; tests where practical.

- [ ] **Step 1 (B1): Relabel the season pool.** Replace line ~127:
  ```javascript
  stage.append(el("p", { class: "t-sub season-h", text: `You have ${left} of the season to spend.` }));
  ```
  with a clear label + a one-line purpose hint:
  ```javascript
  stage.append(el("p", { class: "t-sub season-h", text: `Your own time this season: ${left} of ${BALANCE.seasonActionsPerSeason} left.` }));
  stage.append(el("p", { class: "t-sub season-hint", text: "Spend it foraging, on a hand, or riding to town. It refills next season." }));
  ```
  (Add a light `.season-hint` style if needed in `screens.css`, small/muted; reuse existing sub styling if simplest.) No dashes.
- [ ] **Step 2 (B3): Beat-timing hint.** Just above the "Let the days run on" card (line ~142), when it is NOT the last day, append a one-line note:
  ```javascript
  if (s.day < DAYS_PER_SEASON)
    stage.append(el("p", { class: "t-sub runhint", text: "Your crew's orders take effect as the days run on." }));
  ```
  Place it so it reads as guidance attached to the Continue card. Light/muted styling.
- [ ] **Step 3 (B2): Confirm before spending an action.** The SPEND_ACTION buttons (Forage / Work a field / Sit with X, lines ~133-137) currently dispatch immediately on one tap. Add a lightweight **two-tap confirm** implemented locally in the render (no reducer/state change, touch-friendly): first tap ARMS the button (swap its label to `Spend an action to ${label.toLowerCase()}?` and reveal an inline `Yes` / `Not yet` pair, or re-label the same button to "Tap again to spend" plus a "Not yet" escape); the confirming tap dispatches `SPEND_ACTION`; "Not yet" restores the row. Because the beat screen re-renders on any real dispatch, this transient armed state can live in the render closure / local DOM only. Keep it simple and obvious. The **"Ride to Marrow's Cross"** button is free navigation (SET_SCREEN), NOT a spent action, so it gets NO confirm. Disabled buttons (pool empty) get no confirm.
  - Follow any existing local-interaction precedent in `screens.js` (e.g. the tap-to-reveal `why` on disabled buttons, or a disabled-reason reveal) for style consistency; match how the codebase does in-place DOM interaction.
- [ ] **Step 4: Tests.** These are mostly render/DOM; add what is practical with jsdom: a `day:` render with `seasonActionsLeft` shows the new "Your own time this season: N of 5 left." label and the timing hint (not on the last day); a Forage button does NOT dispatch SPEND_ACTION on the first click (arms instead) and DOES on the confirm. If the two-tap is pure DOM and hard to unit-test cleanly, at minimum test the label/hint text via the render, and manually verify the confirm in Task 3. Explain coverage.
- [ ] **Step 5:** `npx vitest run` -> green. Commit.
```bash
git add prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/src/content/tips.js prototype2/tests/
git commit -m "feat(proto2): relabel the season pool, timing hint, confirm-before-spend (v0.4 4B task 2)"
```

## Task 3: Full suite + browser verify

- [ ] **Step 1:** `cd prototype2 && npx vitest run` -> all green; report counts.
- [ ] **Step 2: Browser verify** (dev server on http://localhost:4321, the prototype is at `/`). New Game -> through the intro -> plant -> confirm you now land on **Day 1 of 10** with the opening title ("A new season. Set your hands.") and can set roles / see the pool BEFORE any day runs. Confirm the pool reads "**Your own time this season: 5 of 5 left.**" with the purpose hint, and the "orders take effect as the days run on" line sits by the Continue card. Tap **Forage**: confirm it asks to confirm and only spends on the second tap; "Not yet" cancels. Click "Let the days run on" and confirm the days now advance from day 1. Screenshot the day-1 opening beat. Fix any console errors.
- [ ] **Step 3:** Commit any verify fixes.
```bash
git add -A && git commit -m "fix(proto2): 4B browser-verify fixes"
```

---

## Self-Review notes (author)
- **Spec coverage (Part B):** B1 relabel -> Task 2 Step 1; B2 confirm -> Task 2 Step 3; B3 timing hint -> Task 2 Step 2; B4 opening beat -> Task 1.
- **B4 is the load-bearing fix:** removing the `runDays` wrapper on SOW + winter-begin turns day 1 into a real beat; the existing `continueRun` (CONTINUE) already steps-then-runs, so "Let the days run on" starts the season with no new machinery. The sim must still pass unchanged (a stop is added, not a resource).
- **No balance drift:** Task 1 must not retune numbers; if the sim shifts, the cause is a policy not sending CONTINUE at the new day-1 beat (fix the policy, not the balance).
- **Confirm scope:** only the SPEND_ACTION buttons get the confirm; Ride (free nav) does not.
- **No-dash voice:** all new copy avoids em dashes and hyphen-as-pause.
