# Bushel & Bone — Balance Model

**Status: STUB — to be built in a future session.**

## What this is

A working Python simulation of Bushel & Bone's economy. It models an in-game year (or run) day-by-day across multiple play styles, so we can numerically validate the game's balance BEFORE writing real game code.

## What it will prove

1. **Winter is survivable** with reasonable play across all difficulty levels (Standard, +1, +5, +10 Ascension).
2. **No dominant strategy exists.** Comparing "safe grain," "cash crop gambler," "cruel efficiency," "kind lineage," and "reckless expansion" — none should be strictly best. Each should have a niche.
3. **Difficulty curve is right.** The player should struggle in Year 1, comfortable-but-tense in Years 2–3, mastering the loop by Years 4–6, and pushed by Ascension modifiers past Year 7.
4. **Exploits identified.** Any strategy that reaches infinite/broken outcomes surfaces here, not in shipped code.

## What it needs from other docs

- The **Mechanics Bible** provides every formula and number.
- The **Narrative Bible** provides event probabilities (some events are story-triggered).

## Planned structure

```
balance-model/
├── README.md              (this file)
├── engine/
│   ├── game.py            (core state, day advancement)
│   ├── crops.py           (growth, harvest, yields)
│   ├── market.py          (price model, contract logic)
│   ├── clones.py          (labor, mortality, cruelty)
│   ├── reckoning.py       (accumulation, tier triggers)
│   ├── events.py          (probability, resolution)
│   └── economics.py       (coin flow, resource flow)
├── strategies/
│   ├── safe_farmer.py
│   ├── cash_gambler.py
│   ├── cruel_efficient.py
│   ├── kind_lineage.py
│   └── reckless_expansion.py
├── run_simulation.py      (spawn N runs per strategy, aggregate outcomes)
├── report.py              (generate HTML dashboard: survival rates, coin/day, reckoning curves)
└── requirements.txt
```

## Success criteria for the model

The model is done when:

- 1000 simulated runs per strategy per Ascension level can complete in under 60 seconds
- HTML report shows survival curves, coin distributions, cruelty/reckoning trajectories, and "cause of death" histograms
- No strategy achieves > 90% survival rate at Standard difficulty
- No strategy achieves < 20% survival rate at Standard difficulty (unless intentionally suicidal)
- Removing any one mechanic (e.g., contracts, Weird crops, cruelty) meaningfully changes outcome distributions — proving each system matters

## Deferred to code

This is a validation tool, not the game engine. Its output is decisions about numbers, not files that ship. When the real game code is scaffolded, formulas from this model port into the TypeScript game logic.
