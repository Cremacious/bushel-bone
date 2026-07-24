# Bushel & Bone — Balance Model Hypotheses

**This is the Balance Model's test suite.** Every entry is a *falsifiable, quantified claim* extracted from the Mechanics Bible (`docs/mechanics-bible.md`). The Python simulation in this folder exists to confirm or refute each one across many seeded, headless campaigns.

If a hypothesis **fails** in simulation, one of two things is wrong and must be fixed before the design is trusted:
- the **numbers** (a lever in the relevant §, tune and re-test), or
- the **design** (the mechanic can't do what we claimed — reopen it).

A hypothesis is not "an opinion to defend." It's a bet. The model's job is to try to break each one.

---

## How to read an entry

```
H-NN  [§X · Failure-mode tag]  Claim in one line.
  Pass:      the quantitative threshold the sim must meet.
  Falsifies: what a failing result means (which lever / which design).
```

**Failure-mode tags** (from CLAUDE.md §5 — the four risks every mechanic is audited against):
- `DOMINANT` — guards against a single dominant strategy / convergence (replay death).
- `CRUELTY-DEBT` — the cruel shortcut must always cost more than it gives (self-terminating horror).
- `ECON` — economic balance: no free money, no strictly-right choice.
- `PACING` — difficulty curve & event rhythm (not too easy, not too hard, not boring).
- `UX` — a measurable interface/legibility invariant.

**Priority tiers** (test order for the model):
- **P0 — foundational** (H-01, H-11, H-12, H-30, H-38): if these fail, the game's core premise is broken. Test first.
- **P1 — core loop** (all `ECON` + `CRUELTY-DEBT`): the economic and moral spine.
- **P2 — texture & endgame** (`PACING`, `UX`, meta/ascension): validate once P0/P1 hold.

---

## §1 — Crop Economics

**H-01** `[§1 · CRUELTY-DEBT · P0]` A pure bone-root strategy at high cruelty self-destructs.
- Pass: an all-bone-root farm (deliberate clone deaths to taint fields) reaches **Reckoning Proper and loses the run by Year 3** in ≥90% of seeds.
- Falsifies: if it survives past Year 4, Reckoning accrual (§6) or the reckoning→farming penalty is too weak.

**H-02** `[§1 · ECON · P1]` Bone-root is a high-risk niche, not a default earner.
- Pass: bone-root income per field is **1.5–2.0× wheat income**, but its total risk cost (Reckoning, rep, Black-Market-only sales) makes its *risk-adjusted* return no better than wheat.
- Falsifies: if risk-adjusted bone-root return exceeds diversified farming, it's a dominant strategy — raise seed cost / Reckoning per harvest.

**H-03** `[§1 · ECON · P1]` Monoculture is self-limiting via fertility decay.
- Pass: **4 consecutive same-crop harvests drop a field to ~40% fertility and ~60% base yield**; rotation strictly out-earns monoculture over 3+ seasons.
- Falsifies: if monoculture stays competitive, increase fertility decay (−15%/grain … −30%/cash) or the monoculture growth penalty.

---

## §2 — Market Pricing

**H-04** `[§2 · DOMINANT · P1]` The Rail Depot is a volume valve, not a strictly-better price.
- Pass: **for harvests < ~25 units, Regional Buyers net more coin than the Rail Depot after the 10% freight cut.**
- Falsifies: if Rail always wins, it trivializes mid operations — widen the freight cut or narrow the price gap.

**H-05** `[§2 · ECON · P1]` Warehouse arbitrage is a minor supplement, never a strategy.
- Pass: holding wheat Fall-glut (0.75×) → Winter-peak (1.25×) yields **net < +20%** after glut penalty, tied-up capital, and ~10% spoilage — worse than replanting the capital.
- Falsifies: if net return > replant return, tighten storage caps / storage life or steepen the glut penalty.

**H-06** `[§2 · ECON · P1]` Contract default-to-chase-spot is a losing move. *(= H-19, cross-listed)*
- Pass: defaulting when spot rises above the lock is **net-negative in > 90% of price outcomes** once deposit forfeit + −15 rep + 1-year freeze are counted.
- Falsifies: if default pays in >10% of cases, raise deposit or rep penalty.

**H-07** `[§2 · ECON · P2]` No same-day mass-dump escapes the glut penalty.
- Pass: max single-day liquidation across all unlocked venues still leaves a **>60-unit harvest taking 2–3 days** to clear at good prices.
- Falsifies: if a big harvest clears in one day at full price, lower venue soft-caps or slow glut decay.

**H-08** `[§2 · ECON · P2]` The Black Market can't launder normal crops.
- Pass: routing legal crops through the fence (0.90× + −8 rep/visit) is **strictly worse** than legal venues.
- Falsifies: if fencing wheat ever beats Local+Regional, lower the Black-Market normal-crop multiplier.

---

## §3 — Clone Economics

**H-09** `[§3 · ECON · P0]` Early scaling tracks food, not coin.
- Pass: a **Year-1 player cannot afford AND feed more than ~2 clones** through the first Winter without a food-shortfall gamble.
- Falsifies: if 3+ clones are safely sustainable Year 1, raise clone price / feeding rate / Winter food need.

**H-10** `[§3 · CRUELTY-DEBT · P0]` The Vat corpse-loop eats itself.
- Pass: an industrial Vat-corpse economy pushes **Reckoning to Walkers by Year 2–3**, after which Ghost-Roll returns + Walker events destroy more labor/crop than the loop produces.
- Falsifies: if the loop stays net-positive past Year 3, raise per-death Reckoning (+8) / Vat drip (+0.5/day) or Walker-tier damage.

**H-11** `[§3 · CRUELTY-DEBT · P0]` Overwork-to-death yields *less* net labor than humane management.
- Pass: sustained overwork-to-death produces **less net household labor within 2 seasons** than a rested, fed crew (shared-Morale penalty > per-clone extraction).
- Falsifies: if churn-for-throughput wins, strengthen household-wide Morale contagion or the overwork Morale cost (−8/day).

**H-12** `[§3 · CRUELTY-DEBT · P0]` Corpse-sale is coin-negative by construction.
- Pass: corpse-sale income (15 coin) is **always < replacement cost (60 coin)** + Reckoning/rep — never a revenue loop.
- Falsifies: structurally can't fail unless the 15/60 gap is edited; treat as an invariant guard.

**H-13** `[§3 · ECON · P1]` Starvation-gating loses more than it saves.
- Pass: food "saved" by under-feeding to hover above desertion is **less than the labor lost** to the −10% Morale band + illness downtime (with ±3 Morale variance making the gate unstable).
- Falsifies: if gating nets positive, widen the underfeed penalty or the variance.

---

## §4 — Winter Survival

**H-14** `[§4 · CRUELTY-DEBT · P1]` Sell-in-Fall / rebuy-in-Spring is a loss.
- Pass: for workforces **up to ~6 clones**, culling before Winter and rebuying in Spring costs more (Morale/rep + slow restock + lost ramp) than feeding through Winter.
- Falsifies: if the cull cycle wins, slow Merchant restock or deepen the fire-sale rep/Morale hit.

**H-15** `[§4 · CRUELTY-DEBT · P1]` Deliberate Winter culling is net-negative by Spring.
- Pass: starving the weak to stretch food yields **less labor by Spring** (Morale collapse + Reckoning) than adequate provisioning.
- Falsifies: if triage pays, strengthen the starvation-cascade Morale/Reckoning costs.

**H-16** `[§4 · DOMINANT · P0]` Cash-crop monoculture is punished by the Winter food market.
- Pass: a pure cash-crop farm's Winter food bill (bought at 1.20–1.25× scarcity, capped by Local volume) **erases enough margin that mixed farming is at least competitive**.
- Falsifies: if mono-cash + buy-food dominates, the cash-crop-food-value = 0 rule needs support (widen scarcity peak or tighten food-buy volume caps).

---

## §5 — The Cruelty Ledger

**H-17** `[§5 · CRUELTY-DEBT · P0]` Secrecy delays the social bill but never the supernatural one.
- Pass: a secret-cruelty run can hold Reputation near baseline (good exposure luck), but accrues **Reckoning at the full public rate**; Reckoning Proper remains reachable regardless of concealment.
- Falsifies: if hiding cruelty measurably slows Reckoning, decouple Reckoning from the exposure system entirely (it must be concealment-proof).

**H-18** `[§5 · CRUELTY-DEBT · P1]` No profitable sin-and-confess loop. *(shared with H-20)*
- Pass: the coin+labor cost to atone for an industrial-cruelty phase **exceeds that phase's gains** (diminishing-returns atonement, §6).
- Falsifies: if confess-and-repeat nets positive, steepen atonement diminishing returns (currently 50%/act).

---

## §6 — The Reckoning Meter

**H-19** `[§6 · PACING · P1]` The brink is recoverable; only the Proper is terminal.
- Pass: a player who **halts all cruelty at Walkers onset (Reckoning 55) and atones actively falls back to Warnings within ~2 years**.
- Falsifies: if recovery from Walkers is impossible, weaken accrual-at-tier or strengthen atonement; if too easy, the reverse.

**H-20** `[§6 · CRUELTY-DEBT · P1]` Burst-and-atone can't be run at a profit.
- Pass: the atonement cost to unwind an aggressive cruelty burst **exceeds the burst's gains**; Reckoning can be paid down, never off at a profit.
- Falsifies: tune atonement magnitudes / diminishing-returns rate.

**H-21** `[§6 · CRUELTY-DEBT · P2]` Succession is not a Reckoning-laundering cheat.
- Pass: dying/retiring to shed 75% of Reckoning (heir inherits 25%) **underperforms simply not accruing the debt**, because the generational transition costs more than the relief.
- Falsifies: if farm-dirty-then-hand-off wins, raise the inheritance fraction or the transition cost.

---

## §7 — Contract System

**H-22** `[§7 · DOMINANT · P0]` Contracts lower variance, never raise mean.
- Pass: a fully-contracted season is **lower-variance but NOT higher-mean** than skilled spot-selling, averaged over many price outcomes.
- Falsifies: if contracts beat spot on mean, lower the premium (1.05–1.20×) — certainty must be a cost, not free money.

**H-23** `[§7 · PACING · P1]` One storm ≠ an unrecoverable default.
- Pass: a **single average-severity weather event cannot alone** turn a reasonably-provisioned contract into an unrecoverable default (partial delivery + one hardship appeal absorb it).
- Falsifies: if it can, soften partial-default scaling or the hardship-appeal terms.

**H-24** `[§7 · ECON · P1]` Contract stacking is capped by production, not offers.
- Pass: contracted volume **exceeding realistic harvest/labor capacity is a losing position** (deposit lockup + cascading defaults).
- Falsifies: if over-stacking pays, raise the deposit fraction (20%).

---

## §8 — Building & Construction

**H-25** `[§8 · PACING · P1]` Heavy early building is a mistake.
- Pass: front-loading major construction in Year 1 **starves that year's harvest/Winter stores** enough to leave the player behind a steady builder by Year 2.
- Falsifies: if Year-1 rushing wins, raise build clone-day costs or the Winter penalty for under-provisioning.

**H-26** `[§8 · CRUELTY-DEBT · P1]` The cruelty-funded early snowball collides with its own debt.
- Pass: a cruelty-funded Vat/Longhouse rush lands the player in **Warnings/Walkers with thin stores — a worse Year-2 position** than steady growth. *(composite of H-01/H-10/H-25)*
- Falsifies: if the snowball pulls ahead, the Reckoning trajectory or the food crunch is too weak.

**H-27** `[§8 · ECON · P2]` Overcrowding is a false economy.
- Pass: running a workforce **over its housing cap yields less net labor** (Morale + Winter illness) than building proper housing.
- Falsifies: if packing them in beats building, raise the overcrowding penalty.

---

## §9 — Events & Probability

**H-28** `[§9 · PACING · P0]` No un-telegraphed event ends a healthy run.
- Pass: **zero run-ending outcomes** occur from an un-telegraphed event to a non-vulnerable farm across a large seed sweep; every ruin traces to an ignored telegraph or a pre-existing vulnerability (low fuel / unpaid mortgage / high Reckoning).
- Falsifies: if a healthy run dies to a bolt-from-blue, tighten Crisis state-gating.

**H-29** `[§9 · PACING · P1]` The pacer holds its rhythm.
- Pass: over simulated runs, cadence is **≈ 1 event / 2 days, with ≤ 4 consecutive quiet days and ≤ 2 Majors per 3-day window**.
- Falsifies: adjust base_rate (0.30), pressure step (0.10), or the major-density ceiling.

---

## §10 — Weather System

**H-30** `[§10 · PACING · P0]` Weather is forecast, never a mugging.
- Pass: **every crop-destroying weather event is forecast with enough lead** for a prepared player to mitigate; un-forecast weather is capped at Minor severity (no Confirmed-tier destruction arrives unannounced).
- Falsifies: if a crop dies with no fair warning, extend telegraph lead or cap the un-forecast severity.

**H-31** `[§10 · DOMINANT · P1]` Weatherproofing costs money.
- Pass: an all-resilient-crop (roots) farm **earns meaningfully less over a run (~2:1 coin) than a weather-managed cash-crop farm** — safe and viable, never optimal.
- Falsifies: if weatherproofing is optimal, raise root opportunity cost or lower cash-crop weather exposure.

---

## §11 — Roster Scaling & Housing

**H-32** `[§11 · DOMINANT · P0]` There is an optimal roster size — the curve peaks and declines.
- Pass: net surplus per clone **declines beyond ~6–8 (mid-tier) and goes net-negative** past the point where fields/food/housing keep pace. The size→surplus curve peaks and falls; it never rises forever.
- Falsifies: if surplus rises monotonically with headcount, strengthen coordination overhead / Winter logistics scaling.

**H-33** `[§11 · UX · P1]` Dawn stays manageable at any scale.
- Pass: **dawn decision count stays ~2–4 regardless of roster size** (standing orders + exception-only Brief).
- Falsifies: prototype-measured; if decisions scale with headcount, the standing-order system is incomplete.

---

## §12 — Festivals & Town Reputation

**H-34** `[§12 · DOMINANT · P1]` Two honestly-costed playstyles, no dominant answer.
- Pass: **skipping festivals to farm is net-negative for a town-reliant player** (lost contracts/discounts > labor gained) while **remaining viable for a Black-Market outlaw**.
- Falsifies: if one path strictly dominates, rebalance festival payloads vs. outlaw (Black-Market) access.

---

## §13 — Season Arcs

**H-35** `[§13 · PACING · P1]` Only the mortgage and Reckoning end runs.
- Pass: **no Season Arc except an unpaid mortgage directly ends a run**; arcs branch to worse states, they don't fail-state.
- Falsifies: if an arc can kill directly, convert its lethal branch to a survivable-but-worse one.

**H-36** `[§13 · ECON · P2]` The mortgage buy-out is never a safety cheat.
- Pass: a buy-out-rushed farm (1,200 coin sunk into principal) is **more exposed to the remaining run-enders** (line-death, Reckoning curse), not less — the coin sunk costs enough farm/ledger progress to offset removing foreclosure.
- Falsifies: if paying off the land makes runs safe overall, raise the buy-out principal or its opportunity cost.

---

## §14 — Meta-Progression

**H-37** `[§14 · PACING · P0]` Content-not-power: unlocks never lower the floor.
- Pass: a **fully-unlocked account faces the same base difficulty as a fresh account** (measured: win-rate at Ascension 0 is independent of unlock count).
- Falsifies: if a maxed account wins more easily at base, an "unlock" is secretly power — reclassify or remove it.

**H-38** `[§14 · DOMINANT · P1]` Depth beats churn for Vigils.
- Pass: **Vigils-per-hour is maximized by playing runs long and well**, not by churning short suicide-runs.
- Falsifies: if bail-early farming wins, shift Vigil rewards further toward years-survived / arc-completion.

---

## §15 — Ascension Stacking

**H-39** `[§15 · PACING · P0]` Every level is winnable by a master.
- Pass: the model finds a **viable (if narrow) winning line at each Ascension level, +1 through +10**, using the full unlocked toolkit — punishing but never a dice-roll.
- Falsifies: if a level has no winning line, its modifier magnitude is too high — tune down.

**H-40** `[§15 · DOMINANT · P0]` No single strategy clears +10.
- Pass: **no one build clears +10 untroubled**; the stack forces broad, adaptive mastery across all 15 systems (each level targets a different pillar).
- Falsifies: if one build clears +10 easily, a modifier is mis-targeted — re-point it at that build's blind spot.

---

## Coverage note

- **40 hypotheses** across all 15 systems.
- Every `CRUELTY-DEBT` claim asserts the same invariant from a different angle: *the cruel shortcut always costs more than it gives* (H-01, H-10, H-11, H-12, H-14, H-15, H-17, H-18, H-20, H-21, H-26). If the model confirms these collectively, the game's moral thesis is mechanically sound.
- Every `DOMINANT` claim asserts *no strategy convergence* (H-02, H-04, H-16, H-22, H-31, H-32, H-34, H-40). Confirming these collectively is the replay-longevity guarantee.
- `H-33` (dawn ≤ 2–4) and `H-37` (unlocks ≠ power) and `H-30`/`H-28` (fair telegraphing) are the invariants most likely to be checked by prototype/UX rather than pure simulation — flagged so the model doesn't over-claim.

**Next:** stand up the Python simulation in this folder (`docs/balance-model/`) that encodes the §1–§15 numbers and runs seeded headless campaigns, then tag each hypothesis above Confirmed / Refuted / Untested with the seed count and result. Per session note: this Python work may be done in the web chat where code can execute and charts render.
