# Action Economy & Yearly Progression (redesign) — Design Spec

**Status:** validated design (brainstormed with Chris, 2026-07-31), grounded in reference-game research and a parameterized model (`docs/balance-model/action-economy-model.mjs`, 4,000 simulated seasons/config). Addresses GitHub **#49** (time-jumps) and **#50** (the 5-action economy collapses to one no-thought strategy) — the two P0 blockers that stopped playtesters reaching Year 2. Revises the *feel* of the v0.4 beat loop (D-054) and the season action-pool (D-043); keeps the systems (mortal hands, the debt, the town, events).

**The problem (from playtest):**
- **#50:** `seasonActionsPerSeason = 5` over a 10-day season is a **pool** the player spends up front (town + 2 jobs + a hire on day 1-2), then coasts. The dominant line is "buy a hand, do both jobs, set everyone to woodcut, click 'Bring the season to a close.'" No thought, and ~5 empty days with no decision.
- **#49:** "Let the days run on" auto-resolves days until the next beat, which with few events is often the **last day**, so one click silently jumps ~7 days. Unpredictable, reads as a glitch, strips per-day agency.

**Why a pool fails (the model):** the current 5/season pool scores **must-choose 3%** (you almost never face a per-day choice, because the pool is spent early) and "misses" ~7 essentials/season (5 points can't engage a whole season). Reference games that nail "freedom but you must strategize" (Slay the Spire 3 energy/turn vs a 5-card hand; Stardew's energy+clock renewing each morning; card-timer games' cooldowns) all use a **small, frequently-renewing budget against slightly-oversubscribed demand** — never a big pool spent freely.

---

## 1. The action economy (the fix for #50)

**Per-day renewing action points.**
- **Base: 1 point per day**, granted each morning. This is the player's own time (crew standing-orders stay separate and free).
- **Carryover, cap 2.** Unspent points bank up to a maximum of 2, so a quiet day can fund a bigger errand tomorrow. (Model: **R ≈ 1.9**, **~66% of days a real triage choice**, **~0 idle**, and the **highest action diversity** of any config — tight, but you can save up for freedom.)
- **One point = one action:** forage (food), work a field alongside the crew (push a crop), sit with a hand (care), or **one town errand** (a single job *or* talk *or* hire per trip). Riding to town is free navigation; the errand you do there spends the point.
- **Tight & strategic feel** locked for Year 1 (Chris): nearly every day you must drop something worthwhile, and you occasionally have to let an essential slide (real risk), banking quiet days to splurge on town.

**Jobs respawn on a timer.** Instead of 2 jobs dumped on day 1 (season-scarce), the town shows a small rolling offer (1-2 at a time) with a **fresh job every ~3 days**. Across a season 3-4 jobs cycle through, but each costs your day's action, so you can never do them all, and town stays worth returning to.

**Why this kills the dominant line:** you cannot front-load (points don't pool); every day competes forage vs field vs care vs a town errand; jobs are paced so "do both every season for free coin" is gone; and with the tending fix (#51) and hiring as a real winter-mouth cost, "woodcut everything and skip" is no longer optimal.

## 2. The time model (the fix for #49)

**Per-day stepping replaces auto-run-to-beat.** Each day: you receive your point(s), spend or hold them, then **Turn in** advances **exactly one day** (the crew resolves its standing orders, the larder/woodpile change, a beat may interrupt). Events still interrupt as beats (a ripe crop, a failing hand, an event). Time always moves in small, visible steps.

- **No silent multi-day jumps.** The "Let the days run on" run-to-next-beat is retired.
- **Quiet days.** Because 1/day renewing makes ~two-thirds of days a real decision, per-day stepping is not busywork. For the rare day with genuinely nothing to decide, offer a **"let the quiet days pass"** that advances to the next day that wants you and **always states how many days passed** (never a silent teleport).
- The **guaranteed day-1 opening beat** (D-055) stays: each season opens on day 1 for setup.

## 3. Yearly progression (each year a little harder)

**Principle:** keep the 1/day rule **constant**; make each year harder by growing **demand and costs**, plus **one telegraphed pressure a year**. The same tight economy self-tightens as the farm and family grow. Difficulty comes from *more to do*, never *fewer points* (preserves D-039's gradual, never-abrupt ramp).

**The self-tightening loop:** yearly costs (mortgage + upkeep) rise faster than a static farm can pay, so the player **must expand** (clear a field, hire a hand) to keep up. Each new field and each new mouth adds demand on the fixed 1 action/day (more tending/harvest windows, more care, more foraging), so the action economy naturally gets tenser every year with no rule change.

**Proposed ramp (numbers to validate in the game sim, section 5):**

| Year | Mortgage payment | Upkeep | Telegraphed pressure (foreshadowed a season ahead) |
|---|---|---|---|
| 1 | 20 | 0 | none — learn the loop |
| 2 | 35 | 5 | a lean winter (raised wood/food bar) |
| 3 | 55 | 15 | a market dip *or* a sickness in the crew |
| 4 | 80 | 25 | a labor crunch / the reckoning begins to bite |
| 5+ | +30/yr | +10/yr | escalating; on the cruel path the reckoning compounds |

(Smoother than the current `mortgageSchedule {1:20,2:30,3:80,4:110}` step; final curve owned by the sim.) Each pressure is **telegraphed a season ahead** so a careful player can prepare (fair, not random).

## 4. What this supersedes / revises

- **The season action-pool** (`seasonActionsPerSeason = 5`, D-043/D-054) → **per-day renewing points** (1/day, carry 2). The pool concept is retired.
- **The auto-run-to-next-beat** ("Let the days run on", D-054's beat flow) → **per-day stepping** with an explicit "let quiet days pass." The beat *detector* (`interrupts()`, events) stays; only the advance rule changes.
- **The economic-squeeze curve** (D-046: "flat budget, one telegraphed pressure/year, Y1 easy → Y4 vise") → refined into the **smooth demand-driven yearly ramp** above (incremental each year, not a Y4 cliff).
- **Kept:** mortal hands + condition track, the mortgage/settlement/foreclose, the town + variety grammar (4D), events, the day-1 opening beat (D-055), the hidden reckoning (D-027).

## 5. How we prove it is balanced

- **The abstract model** (`docs/balance-model/action-economy-model.mjs`) gave the *direction* (per-day renewing beats a pool; 1/day+carry is the tight sweet spot). It is a design tool, not the game.
- **The game's own sim** (`prototype2/sim/run.js`, driving the real reducer) is the proof. During build: port the per-day rule into the reducer, extend the sim policies to it, and tune the yearly numbers so a **careful, engaged line survives each year on a shrinking margin** and a **careless line fails earlier**. The sim's encoded survive/fail assertions become the regression guard, plus Chris's playtest.

## Failure-mode audit
1. **Difficulty miscalibration:** the ramp is smooth (each year a little harder), telegraphed, and sim-tuned; Year 1 is tight but survivable, later years tighten via demand.
2. **Dominant strategy:** per-day renewing + oversubscribed demand + paced jobs + real tending (#51) + hiring-as-a-cost mean no single set-and-forget line wins (the model shows high action diversity; the sim will confirm no dominant policy).
3. **Cheese/exploits:** points don't pool (no front-loading), carryover is capped (no hoarding), jobs are timer-paced (no infinite coin), quiet-day auto-pass can't be used to skip a decision (it only skips genuinely empty days).
4. **Emotional flatness:** every day is a real choice under scarcity; the yearly squeeze is a mounting, legible pressure you feel building — the Oregon-Trail attrition the design promised.

## Phasing (feeds writing-plans)
- **Phase 1 — the per-day action economy:** replace the season pool with 1/day renewing + carry cap 2; one-point actions; per-day stepping + "let quiet days pass"; retire the auto-run. Reducer + render + tests, sim green.
- **Phase 2 — jobs on a respawn timer:** the rolling town offer + cooldown; sim rebalance.
- **Phase 3 — the yearly ramp:** the mortgage/upkeep curve + the self-tightening expansion pressure + one telegraphed pressure/year (starting with Y2's lean winter); sim-tune the shrinking-margin curve across Years 1-5.
- (Later) deeper per-year pressures, the reckoning compounding on the cruel path.

## Open / tunable (the sim owns final numbers)
- Base points/day (1) and carryover cap (2); the town job cadence (~3 days); the "quiet day" auto-pass threshold; the exact mortgage/upkeep ramp and each year's telegraphed pressure; how strongly expansion is forced.

---

*Next: writing-plans — the Phase-1 plan (the per-day economy + per-day stepping) in full, with the Phase 1-3 roadmap.*
