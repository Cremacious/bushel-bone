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

## Deferred to code

This is a validation tool, not the game engine. Its output is *decisions about numbers*, not files that ship. When the real game is scaffolded, the tuned formulas in `config.py` port into the TypeScript game logic (the balance model stays Python, per the tech-stack decision).
