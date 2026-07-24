# Bushel & Bone — Balance Model

**Status: v0.1 BUILT (economic + moral core).** Runnable, stdlib-only Python. Not yet run against a Python interpreter on the authoring machine (none installed there) — see "Running it" below.

## What this is

A working, headless Python simulation of Bushel & Bone's economy and moral engine. It plays the game with automated strategy "bots" across many seeded runs, so we can numerically validate the game's balance **before writing real game code**. It validates *math* (economy, exploits, difficulty). It cannot validate *feel* — that's the paper prototype's job.

Its concrete purpose is to test [`hypotheses.md`](hypotheses.md) — the 40 falsifiable claims (H-01…H-40) extracted from the Mechanics Bible. Each hypothesis is a bet; the model tries to break it.

## Files (v0.1 — flat, dependency-free)

```
balance-model/
├── README.md          (this file)
├── hypotheses.md      (the 40 claims — the test spec)
├── config.py          (ALL numbers, each traced to a § of the Mechanics Bible — tune here)
├── model.py           (seeded state + season-stepped engine + campaign runner)
├── strategies.py      (automated player policies: subsistence, cashcrop, boneroot_cruel, balanced, roster-N)
├── hypotheses.py      (evaluates the testable hypotheses; reports the rest NOT MODELED)
└── run.py             (CLI entry point)
```

*(This is deliberately simpler than the multi-package layout the original stub sketched. A flat, readable v0.1 that actually runs beats an elaborate skeleton that doesn't. It refactors into packages when the engine grows.)*

## Running it

Requires **Python 3.8+**, no pip install. From this directory:

```bash
python run.py                                   # run the hypothesis suite (default)
python run.py sim --strategy cashcrop --seed 1  # one verbose campaign
python run.py compare --seeds 40                # strategy comparison table
```

> ⚠️ The authoring machine had **no Python installed**, so this v0.1 was written but **not executed there**. Run it in an environment with Python (e.g. the web chat where code executes and charts render). Expect first-run tuning: some hypotheses are *designed* to come back REFUTED/PARTIAL in v0.1 — that's the model doing its job (see below).

## How to read the output

`run.py` (default) prints a report with one block per tested hypothesis:

- **CONFIRMED** — the sim supports the claim.
- **PARTIAL** — the design *intent* holds but a stated number is off (tune it).
- **REFUTED** — the claim fails as stated; the design or a number needs revisiting.
- **INVARIANT** — true by construction of the config (a guard).
- **NOT MODELED** — the systems it needs aren't in v0.1 yet (listed with reasons).

**Findings already expected from v0.1** (surfaced honestly, not hidden):
- **H-02** bone-root's *raw* per-field margin is far above the 1.5–2× design target — it currently relies entirely on H-01's risk to offset. A real number-vs-intent gap for the balance pass: lower `bone_root` price/yield, or restate the target as risk-adjusted.
- **H-05** warehouse arbitrage's *intent* holds (replanting dominates holding capital), but the specific "<+20% net" threshold is exceeded — tighten glut/spoilage or restate the threshold.

These are exactly the kind of number/intent gaps the model exists to catch.

## v0.1 scope — what's modeled vs. deferred

**Modeled:** crops / fertility / taint (§1), clone food economy & morale deaths (§3), winter survival & fuel (§4), market pricing + glut (§2), the Reckoning meter + tiers + run-end (§6), the mortgage clock (§13), and the reputation/exposure sketch (§5).

**Tested hypotheses (9):** H-01, H-02, H-03, H-05, H-09, H-12, H-16, H-29, H-32.

**Deferred (NOT MODELED, ~31):** the event engine (§9), contracts (§7), the Vat/overwork cruelty loops (§3), construction (§8), festivals/town (§12), season arcs (§13), meta-progression (§14), and ascension (§15). Each is listed with a reason in `hypotheses.py`. The engine is structured so these bolt on without a rewrite.

## Roadmap (the original vision — still the target)

The model is "done" when it can, across all strategies and Ascension +0…+10:
1. Show **Winter is survivable** with reasonable play at every difficulty.
2. Show **no dominant strategy** — safe-grain / cash-gambler / cruel-efficiency / kind-lineage / reckless-expansion each has a niche, none strictly best.
3. Show the **difficulty curve** lands (struggle Y1, tense Y2–3, mastery Y4–6, Ascension pressure past Y7).
4. **Surface exploits** here, not in shipped code.
5. Produce an HTML/chart report: survival curves, coin distributions, Reckoning trajectories, cause-of-death histograms.
6. Run 1000 runs/strategy/Ascension in under 60s.

## Calibration log — v0.1 first pass (6 rounds)

The first real run starved ~90% of all runs by Year 2, masking every deeper hypothesis. Six calibration rounds stabilized the economy. **The config changes below are the model's *proposals*, heavily flagged in `config.py` — they are NOT ratified Mechanics-Bible edits.** They exist so runs survive long enough to test the deeper dynamics; the real design decisions are the user's.

| Round | Change | Effect |
|---|---|---|
| 1 | Fix replant-gap (fields idled a season post-harvest); `START_FOOD` 0→70; small field 0.5→0.8 | starvation ↓, exposed the mortgage as next wall |
| 2 | Mortgage **2-year grace** (new; "The Newcomer"); bots expand sooner | foreclosure ↓ |
| 3 | Roots fertility decay 0.25→0.18 | farms reach ~Year 3–4 |
| 4 | Bots fallow exhausted fields; proper fallow-restore (§1 +30%/season) | fertility sustainable |
| 5 | Subsistence bot hoards food + plants high-food crops (was *selling food while starving*) | bot-bug fix |
| 6 | **Consumption cut** (clone 0.5→0.4, winter 0.75→0.6, farmer 1.0→0.8); fallow earlier (<0.55); subsistence expands to 5 fields | farms establish; runs testable |

### Headline findings (for the design pass)

1. **The food economy never closed on ANNUAL balance.** §1/§3/§4 specify winter stockpile numbers but were never checked against year-round production: a farmer+1 ate ~125 food/yr while a 3-small-field starter plot yields ~60–90/yr (fertility decay compounds). Closing it needed a ~20–40% consumption cut *or* equivalent yield/plot increase. **This is the single most important thing to resolve** — and it's squarely inside the still-open Q-003 (full numerical balance). Decision needed: lower consumption, raise yields, or enlarge the starter plot?
2. **The mortgage (150/yr) is unpayable in the establishment years** — a grace period (or lower early rate) is effectively required. Proposed as a §13 addition.
3. **H-02 confirmed as a real gap:** bone-root's raw per-field margin is ~15.7× wheat, far past the 1.5–2× target. In-sim, the bone-root bot is the top earner (~900 coin). Lower `bone_root` price/yield, or restate the target as risk-adjusted.
4. **H-01 self-termination is slower than claimed:** cruel bone-root runs reach Reckoning Proper only ~15% of the time and not by Year 3 — partly because the v0.1 bot stops killing once its field is tainted (a competent cruel operation keeps killing). The claim's "by Year 3" timeline and/or the accrual rate need revisiting alongside a sustained-cruelty bot.
5. **H-32 peaks at n=1:** additional clones don't pay for their food in the current numbers, so labor isn't the binding mid-game constraint the design intends (**tension with D-024**). The curve peaks-and-declines (claim satisfied) but the *location* of the peak flags that clone value / labor demand needs strengthening.
6. **H-09 tension:** the Round-6 consumption cut removed the intended *Year-1 scarcity* (now all clone counts survive Year 1). "Tight Year-1" (H-09) and "survivable runs" (H-01/H-32) pull in opposite directions — the right answer is a middle point this pass hasn't yet converged on.

### Verdicts after calibration (40 seeds each)

`CONFIRMED`: H-03, H-16, H-32 · `INVARIANT`: H-12 · `PARTIAL`: H-05, H-09, H-29 · `REFUTED`: H-01, H-02 · `NOT MODELED`: 31.

*(Re-run `python run.py` to reproduce; `compare` for the strategy table.)*

### Pass 2 — ratified (issue #2)

The user's decisions (issue #2) reversed the direction of the food fix: **protect the survival weight** rather than lighten it. Consumption was restored to the committed §3/§4 values; the gap is now closed on the production side (4 starting fields + a +10% quick-ground yield). The 2-year mortgage grace was ratified; bone-root was fixed (price 30→4, Reckoning 4→6). A proactive winter-food buy and a food-first Balanced bot were added.

**State after ratification (40 seeds):** no dominant strategy — cashcrop earns most (568) but dies fastest (3.1y); subsistence survives the food economy (0% early starvation) but forecloses (too poor to pay the mortgage); **balanced is the competent survivor** (443 earn, 4.1y, 15% early death); boneroot is now a modest niche. **H-02 → CONFIRMED.**

### Pass 3 — exploit validation (issue #6): the cruelty-debt cluster

Added the exploit-prone systems the counters depend on (the Vat, overwork-to-death, purchased atonement, and — critically — **Walker-tier teeth**: at Walkers+ the dead actively blight fields and take clones, and the Reckoning *accelerates*, so cruelty spirals to the Reckoning Proper rather than plateauing). Added **adversarial bots** (Vat baron, overworker, sin-and-confess, sustained-cruelty) that actively try to cheat, and one engine fix that mattered: **low morale now cuts labor per-clone** (§3 unrest/revolt bands) — previously overwork tanked morale "for free."

**Every cruelty exploit was proven to lose:**
- **H-11 (overwork-to-death) CONFIRMED** — overworking a crew earns *less* (1020) than the SAME crew worked humanely (1093). The original "REFUTED" was a bad test (comparing to a smaller humane roster); the controlled test shows overwork is net-negative.
- **H-10 (Vat corpse-loop) CONFIRMED** — a *running* loop dies to the Reckoning Proper in ~2 years (100%), vs. balanced's 4.1. Doubly defended: 0% of free-economy barons can even afford the 300-coin Vat.
- **H-18/20 (sin-and-confess) CONFIRMED** — buying cleansings never lets cruelty out-perform honest play (284 vs balanced 443).
- **H-01 (sustained cruelty) CONFIRMED** — killing your own workforce starves you by ~Year 3.6 (before the Reckoning even finishes climbing); cruelty never out-lives humane play.

**Ratified mechanic changes (→ Mechanics Bible §3/§6):** morale→labor link (unrest −25%, revolt −70% per clone); overwork morale cost −8→−12 + a −10 household witness penalty; Walker-tier damage (blight 45% / taken 22% / cap 3 per season) and Reckoning acceleration (+6/season at Walkers+); Vat drip 0.5→1.0/day.

**Verdicts now (40 seeds): CONFIRMED 8 · INVARIANT 1 · PARTIAL 3 (H-05, H-09, H-29) · REFUTED 0.** The moral thesis — *cruelty always costs more than it gives* — is validated across the whole exploit cluster. **Still open:** the long-game ceiling and Year-1 scarcity (H-09), plus the remaining NOT-MODELED systems (contracts #10, Ascension, succession) and the paper playtest (#11).

## Deferred to code

This is a validation tool, not the game engine. Its output is *decisions about numbers*, not files that ship. When the real game is scaffolded, the tuned formulas in `config.py` port into the TypeScript game logic (the balance model stays Python, per the tech-stack decision).
