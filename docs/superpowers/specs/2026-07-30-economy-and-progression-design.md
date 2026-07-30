# Economy & Progression — Design

**Status:** validated design (brainstormed with Chris, 2026-07-30). Builds the load-bearing economic skeleton the prototype has lacked: continuous multi-year play, the debt squeeze (D-045), the unlock ladder as a real progression curve (D-050), and a **balance simulation on the real game core** to validate the whole thing with math. Bundles three cheap town fixes.

**Two locked decisions from the brainstorm:**
1. **Full multi-year continuous run** — the game continues past Year 1; the squeeze and unlock curve span years; the run ends on **foreclosure** (land-loss, D-006). Succession/heir (D-046) is a later layer.
2. **The balance sim is a JS harness driving the real reducer** — scripted player policies (optimal/normal/sloppy) over N years, reported and asserted. **This supersedes the CLAUDE.md "balance model is Python" convention** (which predates the testable JS core); to be recorded in the decisions log.

**Scope:** the economic framework + the mouth/capacity lever (hiring hands) + the sim + a tuning pass + three town fixes. **Out of scope (later, plug into the same ladder + sim):** tools/buildings, crop/market unlocks, the reckoning biting, succession. The framework is **data-driven** (sinks and unlock costs are tables the sim reads) so those later levers slot in without structural change.

---

## 1. Continuous multi-year play

`endSeason` at winter currently sets `phase: "yearend", ended: true` and the screen reloads. Replace with a **year-end settlement** and a turn-the-year:

- Winter's end → **`phase: "settlement"`** (not game-over). The settlement screen shows the year's accounts and the **mortgage due**, deducts it, and offers **"Turn the year"** → `year + 1`, Spring, `phase: "brief"`, state carried forward (coin, fields incl. cleared/fertility, hands, standing, upgrades, mortgage balance/arrears).
- The run ends only on **foreclosure** (§2) → `phase: "foreclosed"`, `ended: true` — a run-end screen (years survived, why). The "Play another first year" reload is replaced by "Begin a new line."

State additions: `mortgage: { balance, arrears }`, `upgrades: []` (owned tool/building ids, for later), `history: []` (per-year record for the run-end summary; optional). `year` already exists.

## 2. The sinks — the squeeze (D-045)

All values first-pass in `balance.js`, **owned by the sim/tuning pass (§5)**.

- **The mortgage.** An inherited **debt balance** (~600m). A **payment is due each year-end**, on the D-045 schedule (grace, then rising):
  | Year | Payment | Upkeep | Note |
  |---|---|---|---|
  | 1 | 0 | 0 | grace / tutorial (nets on) |
  | 2 | ~50 | 0 | nets fade |
  | 3 | 150 | ~20 | the debt comes due |
  | 4 | 150 | ~40 | the vise |
  | 5+ | 150 | +rising | endless pressure |

  Payment reduces the balance; upkeep is a flat yearly cost. **Foreclosure rule (legible):** at settlement, coin pays the due (payment + upkeep). If coin is short, the shortfall becomes **arrears** and the player gets a **warning year**. If they are still in arrears at the *next* settlement (a second consecutive miss) → **foreclosure**. So one bad year is survivable; two in a row loses the land. Telegraphed Day 1 and each year-end.
- **Mouths.** Each hand hired (§4) eats `foodPerMouthPerDay` and burns `fuelPerMouthPerDay` in the cold — already modeled. Growth raises running costs (the reason expansion is a *decision*, not a freebie).
- **Fertility depletion.** Harvest drops a field's `fert` (already modeled); over-farming degrades yield unless rested/fallowed. A soft sink on greed.
- **Rising upkeep.** The yearly upkeep above, climbing each year.

This is what makes coin *contested*: clearing a 40m field is coin not paid toward the debt. The 2nd field stays cheap, but it is no longer free of consequence.

## 3. The unlock ladder (D-050)

A data table of upgrades, each on a **~×1.7–2 cost curve** (the steady-cadence the research prescribes). This build implements **land (exists) + hands (§4)**; the rest are hooks the sim and later work fill:

| Rung | Costs (first pass) | Status |
|---|---|---|
| Clear a field | 40 / 90 / 150 | built (CLEAR_FIELD) |
| Hire a hand | 60 / 110 / (foreman 300) | **this build (§4)** |
| Tools / buildings | plow 200 · well 350 · barn 550 | hook only (later) |
| Crop unlocks | cash grains · cotton · Weird | hook only (later) |
| Market venues | regional · rail | hook only (later) |

Costs live in `balance.js` as tables (`clearCosts` exists; add `hireCosts`, and a `LADDER` manifest for future rungs).

## 4. Hiring hands (the mouth/capacity lever)

The central sink-and-capacity lever, so the squeeze is real:

- **Where:** Dr. Ambrose Vane's clone-wagon (an existing NPC/place; a town encounter). A **"Hire a hand"** action, costing the next `hireCosts` price, available when affordable.
- **Effect:** adds a new hand to `state.hands` (a generated name/body/mind, `alive`, strain 0). The crew can now work more fields per day; the household eats and burns more (already scales with `mouths`).
- **The tension:** more hands = more fields worked = more income, *but* more food + winter fuel to find, and coin spent hiring is coin not paid to the bank. Over-hiring before you can feed them is how a sloppy player dies in winter.
- First pass: a simple hire (name from a pool); traits/personality/loyalty (D-048) are a later layer.

## 5. The balance simulation (on the real core)

A JS harness (`prototype2/sim/`, runnable via node + a vitest test) that **drives the actual `reduce()`** with scripted **player policies**, so the sim can never drift from the game and doubles as a regression test.

- **A policy** is `policy(state) => action` (or a small sequence): given the current state, decide the next move — what to plant, how to assign the crew, which personal actions/jobs to take, when to clear a field / hire / pay. Three policies:
  - **optimal** — best crop mix for the situation, harvest on time, tend, take lucrative jobs, keep fuel ahead of winter, expand only when safe, always pay the mortgage.
  - **normal** — reasonable but imperfect (mixed crops, some mistimed harvests, occasional jobs).
  - **sloppy** — staples only, misses harvests, ignores fuel until winter, ignores jobs, over/under-expands.
- **The harness** runs each policy for **4+ years** from a fixed seed (or several seeds), stepping the reducer, and records per year: coin, larder/fuel at winter, fields cleared, hands, mortgage balance/arrears, and **which unlocks were hit and on what day/year**, plus **foreclosure year** (if any) and **years survived**.
- **A report** (console table) and a **vitest assertion** encode the target curve:
  - optimal: never forecloses in 4y; clears fields ahead of the normal line; ends Y4 with surplus.
  - normal: survives 4y; hits the milestone curve (2nd field ~Y1, 3rd ~Y2, a hire ~Y2); tight but not foreclosed by Y4.
  - sloppy: caught by the Y3 mortgage — forecloses by Y4.
- **The tuning pass (§below)** adjusts `balance.js` (payments, upkeep, hire/clear costs, crop values, job pay) until the sim reports that shape. Numbers are the sim's output, not guesses.

## 6. The tuning pass

Iterative: run the sim → read the report → adjust `balance.js` → re-run, until the three policies hit the target bands (§5). Document the final curve in `balance.js` comments and the decisions log. This is where Chris's questions get *answered with math*: exactly when each unlock lands for each skill level, and whether the spread feels fair.

## 7. Folded-in town fixes (cheap, ordering-independent)

- **Delete the player "Rest" action** — it costs an action and does nothing. Unspent actions carry no penalty; "Turn in" ends the day. A one-line reassurance so no one hoards in fear.
- **Free-if-dry talks** — a talk with real content costs an action; a "nothing new today" filler is **free** (you never pay for nothing).
- **Highlight system** — color-coded keywords in dialogue by category: market intel (gold), weather/season (blue), omen (dull red), people/story (green), opportunity (lamp). A small markup convention in the script + a render pass.

---

## Failure-mode audit
1. **Difficulty miscalibration** — the entire point: the sim validates the curve across skill levels so it is neither trivial (2nd field was a Day-1 freebie) nor a grind wall. Numbers are simulated, not guessed.
2. **Dominant strategy** — the sim's *normal* and *optimal* policies use different crop/labor mixes; the tuning target is that multiple lines survive (staples-heavy vs cash-heavy both viable), so there is room for strategy, not one solved path. (A stretch goal: add a 4th "cash-rush" policy to confirm a second viable style.)
3. **Cheese/exploits** — foreclosure can't be dodged (settlement is unavoidable); the mortgage grows faster than early income so hoarding without expanding also fails; fertility depletion caps over-farming one field.
4. **Emotional flatness** — the debt is a felt, telegraphed antagonist ("the bank wants 150 by winter"); the vise manufactures the moral drama (the years you most need coin are when cruelty tempts, D-045).

## What changes in code
- **`state.js`:** `mortgage`, `upgrades`, drop the Year-1 `ended`-at-winter assumption.
- **`balance.js`:** `mortgageSchedule`, `upkeepSchedule`, `debtStart`, `hireCosts`, a `LADDER` manifest.
- **`reducer.js`:** `endSeason` → settlement; `SETTLE_YEAR`/`TURN_YEAR`; foreclosure check; `HIRE`; remove player-`rest` handling.
- **`selectors.js`:** `mortgageDue(state)`, `canAffordHire`, ladder helpers; the free-if-dry talk resolution.
- **`screens.js`:** the settlement screen, the foreclosed run-end screen, the hire affordance (Vane), remove the Rest personal action, the highlight render.
- **`content/script.yaml`:** settlement/foreclosure/hire prose; highlight markup in intel lines.
- **`sim/`:** the harness + policies + report; `tests/sim.test.mjs` asserting the curve.

## Open / tunable (owned by the sim)
- Every number in §2/§3/§4 (the sim decides the finals).
- Whether a missed year is 1-warning-then-foreclose or a softer arrears curve.
- Exact hire-cost curve and whether a foreman (auto-assist) lands in this build or later.

---

*Feeds writing-plans: Phase 1 town fixes (quick) → Phase 2 multi-year + mortgage → Phase 3 hiring → Phase 4 the sim + tuning.*
