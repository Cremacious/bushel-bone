# Bushel & Bone — Mechanics Bible

**Status: IN PROGRESS.** Session 1 established the outline and produced the first worked system (Crop Economics) as a template. Session 2 added Market Pricing (§2), Clone Economics (§3), and Winter Survival (§4) — the core economic loop — then The Cruelty Ledger (§5) and The Reckoning Meter (§6), the moral engine, then the Contract System (§7) and Building & Construction (§8), then Events & Probability (§9) and the Weather System (§10), then Roster Scaling & Housing (§11) and Festivals & Town Reputation (§12), and finally Season Arcs (§13), Meta-Progression (§14), and Ascension Stacking (§15). **All 15 systems are now drafted to the §1 template.**

> **Balance-ratified adjustments (Session 3, GitHub issue #2 → decisions-log D-032).** The Balance Model surfaced that the numbers didn't close; these changes are now ratified and reflected in `docs/balance-model/config.py` (the live tuned source of truth):
> - **Food economy — "protect the survival weight":** consumption stays at the committed §3/§4 values (people eat heavily; food is a real burden). The annual gap is closed on the *production* side instead — the starter plot is **4 small fields** (was 3) and the Sallows' *quick ground* gives a **+10% yield** bump (D-029). Roots fertility decay softened to **0.18** (was 0.25) for food sustainability.
> - **Mortgage (§13):** a **2-year establishment grace** before the 150/yr payment begins.
> - **Bone-root (§1/§6):** base price **30 → 4** (to hit the 1.5–2× wheat target; H-02 now CONFIRMED) and its Reckoning-per-harvest **4 → 6** (the land minds it more).
> - **Exploit-hardening (issue #6 → decisions-log D-034):** validated the cruelty-debt cluster with adversarial bots and hardened the counters — **low Morale now cuts labor** (§3 bands: unrest −25%, revolt −70%, per clone), overwork Morale cost −8→−12 plus a −10 household witness penalty, **Walker-tier teeth** (the dead blight fields & take clones, and the Reckoning *accelerates* +6/season at Walkers+, §6), and the **Vat drip 0.5→1.0/day** (the Vat is the land's deepest offense, D-030). Result: H-01/H-10/H-11/H-18/H-20 all CONFIRMED — *cruelty always costs more than it gives*.
> - **Still open:** the long-game ceiling (can a masterful player last 10+ years?) and Year-1 feeding scarcity (H-09) need the paper playtest (#11) and the remaining systems (contracts #10, Ascension, succession). Full log: `docs/balance-model/README.md`.

---

## Purpose

The GDD (`docs/GDD_v0.1.pdf`) describes *what* the game does. This document describes *how* — with actual numbers, formulas, and adversarial analysis. Its job is to ensure the game is:

- **Not too easy** — the player can lose, and does, sometimes, and it's their fault
- **Not too hard** — a smart player can win with reasonable play
- **Not boring** — no long stretches of "just tap advance"
- **Not exploitable** — no dominant strategy, no cheese, no min-max loophole

Every system in this bible is audited against those four failure modes.

## How to read this document

For each system:

1. **Recap** — one paragraph reminder of what it is (full detail is in GDD).
2. **Numbers & formulas** — the actual math. All values are proposed and will be validated against the Balance Model.
3. **Intended experience** — what should the player *feel*?
4. **Four failure modes checked:**
   - Too easy: how might a player breeze through?
   - Too hard: how might a player be blocked?
   - Boring: how might this feel like grind?
   - Exploitable: what's the "cheese"? What would a min-maxer do?
5. **Defenses** — the specific design choices that push back on each failure mode.
6. **Balancing levers** — the specific numbers we can tune.
7. **Sample scenarios** — 2–3 worked examples showing the system in action.

## Systems covered (in write order)

1. **Crop Economics** — ✅ done (see below)
2. **Market Pricing** — ✅ done (see below)
3. **Clone Economics** — ✅ done (see below)
4. **Winter Survival** — ✅ done (see below)
5. **The Cruelty Ledger** — ✅ done (see below)
6. **The Reckoning Meter** — ✅ done (see below)
7. **Contract System** — ✅ done (see below)
8. **Building & Construction** — ✅ done (see below)
9. **Events & Probability** — ✅ done (see below)
10. **Weather System** — ✅ done (see below)
11. **Roster Scaling & Housing** — ✅ done (see below)
12. **Festivals & Town Reputation** — ✅ done (see below)
13. **Season Arcs (mechanical hooks)** — ✅ done (see below)
14. **Meta-Progression (Vigils, unlocks)** — ✅ done (see below)
15. **Ascension Stacking** — ✅ done (see below)

**Supplementary systems (issue #8):**
16. **Livestock & Manure** — ✅ done (see below)
17. **Festival Interactions** — ✅ done (see below)
18. **Building Upgrade Trees** — ✅ done (see below)
19. **Vane-Mystery Mechanics** — ✅ done (see below)

---

# 1. Crop Economics

## Recap

The player plants seed in fields. Crops grow over N days, subject to season, weather, field condition, and tending. When ripe, they harvest into inventory, then sell at market. Four crop families (Grains, Roots, Cash, Weird), 11 crop types total.

## Numbers & formulas

### Crop stat table

| Crop | Family | Grow days | Seed cost/field | Yield/field (base) | Base price (per unit) | Season | Labor to harvest | Storage life |
|---|---|---|---|---|---|---|---|---|
| Wheat | Grains | 30 | 4 | 12 | 3 | Spring→Summer | 1.0 clone-days | 8 seasons |
| Corn | Grains | 25 | 5 | 10 | 4 | Summer | 1.0 clone-days | 6 seasons |
| Oats | Grains | 18 | 3 | 8 | 3 | Cool | 0.8 clone-days | 8 seasons |
| Potatoes | Roots | 22 | 6 | 15 | 2 | Spring/Fall | 1.2 clone-days | 12 seasons |
| Turnips | Roots | 15 | 3 | 10 | 2 | Cool | 0.8 clone-days | 8 seasons |
| Tobacco | Cash | 40 | 12 | 6 | 15 | Summer | 1.5 clone-days | 12 seasons |
| Cotton | Cash | 45 | 10 | 8 | 12 | Summer | 3.0 clone-days | 10 seasons |
| Hops | Cash | 30 | 8 | 6 | 10 | Summer | 1.2 clone-days | 4 seasons |
| Moon Barley | Weird | 20 | 15 (rare) | 4 (variable ±50%) | 25 | Any (moon-gated) | 1.0 clone-days | 4 seasons |
| Bone-root | Weird | 25 | 10 (rare) | 6 | 4 | Any (tainted field required) | 1.5 clone-days | 8 seasons |
| Whisper Wheat | Weird | 30 | 20 (very rare) | 8 | 20 | Summer | 1.5 clone-days | 6 seasons |

*Yields above are for a **Medium field** at 100% fertility, ideal weather, no tending bonus. Small = 0.5x, Large = 2.0x.*

### Growth formula

Each day, a planted field's growth progress advances by:

```
growth_this_day = base_daily_growth × season_fit × weather_mult × fertility_mult × tending_mult × reckoning_mult
```

Where:

- `base_daily_growth = 100 / grow_days` (a wheat crop advances ~3.3% per day)
- `season_fit`:
  - Right season: 1.0
  - Adjacent season (spring/fall crop planted just outside window): 0.5
  - Wrong season entirely: 0.0 (does not grow)
- `weather_mult`:
  - Mild sunny day: 1.0
  - Rain: 1.15 (most crops)
  - Drought day: 0.7
  - Hail: 0.5 + chance of destruction (see events)
  - Frost: 0.0 for warm-season crops, 1.0 for cool-season
  - Blizzard: -5% growth (crops can regress)
- `fertility_mult`:
  - Fertility 100%: 1.0
  - Fertility 50%: 0.75
  - Fertility 0%: 0.4
- `tending_mult`:
  - No clone assigned: 1.0
  - One clone tending (any type): 1.15
  - A Grower tending: 1.25
- `reckoning_mult`:
  - Whispers or lower: 1.0
  - Warnings tier: 0.95
  - Walkers tier: 0.85
  - Vigil Fails: 0.7
  - Reckoning Proper active: 0.5

### Harvest window

When growth hits 100%, a `harvest_window` opens for **8 days**. During the window, the crop can be harvested (with the labor cost above). If not harvested within the window:

- Day 9–12: crop rots to 70% yield
- Day 13–15: crop rots to 40% yield
- Day 16+: crop is lost entirely (rots to 0)

Weather events during the harvest window can end it early or destroy the crop:

- Hail (day 3–15 of ripeness): rolls to destroy 50% of crop for grain, 30% for cash, 20% for roots
- Early frost (crops in warm-season): full loss unless harvested that day
- Wildlife event (unfenced fields): 20% yield loss per event

### Fertility decay & restoration

- Each harvest drops field fertility by:
  - Grains: -15%
  - Roots: -25% (roots are heavy feeders)
  - Cash: -30%
  - Weird: -10% (they take from a different well)
- **Fallow** (leave a field unplanted for a full season): +30% fertility restored
- **Manure** (produced by livestock, 1 unit per 4 pigs/cows/season): +20% fertility per applied unit
- **Crop rotation** (planting a Root after a Grain, or vice versa): +5% fertility bonus this planting
- Fertility floor: 20% (never drops below)
- Fertility ceiling: 120% (with heavy manure + fallow, a field can become "rich")

### Taint accumulation

Taint enables Bone-root and repels normal crops. Rises when:

- Clone dies in the field: +30% taint on that field
- Unmarked burial in the field: +50% additional
- Dark ritual event resolved in the field: +40%

Taint effects:

- 0–20%: normal
- 21–50%: normal crops -20% yield; bone-root can grow
- 51–80%: normal crops -50% yield; bone-root yield +25%
- 81–100%: normal crops fail entirely (rot on planting); bone-root yield +50%

Taint decays by 5% per full season of fallow. Can be reduced by:

- Full funeral for a clone buried there: -20%
- Preacher-blessed cleansing ceremony (costs 50 coin, 1 day): -30%
- Old Nan folk-cleansing (requires Warm+ relationship): -40%, but she notes what you did

## Intended player experience

The player should feel that **every crop choice is a real decision** with tradeoffs on multiple axes: money vs. safety, labor vs. yield, time vs. flexibility, ethical cleanliness vs. temptation. There should be no crop that is always right. There should be no crop that is always wrong.

The player should feel that **their fields have history**. A field that has grown wheat for four straight seasons should feel exhausted. A field where Silas died should feel different.

The player should feel that **the harvest window matters**. A crop hitting 100% should be a small event — the game should communicate "harvest me now" clearly and let the player feel the pressure of the closing window.

## Four failure modes checked

### Too easy

**Risk 1:** Wheat is so safe and reliable that "always plant only wheat" is a strictly good strategy.
- Defense: fertility decay (-15% per harvest) forces rotation. Four consecutive wheat harvests drop a field to 40% fertility and 60% wheat yield, cutting your economics significantly. Requires actual planning.
- Defense: wheat prices bottom out after harvest season (see Market Pricing) — flood the market and you tank your own margin.

**Risk 2:** Weird crops (bone-root) are too profitable at 30 coin/unit.
- Defense: seed is rare and expensive (10 coin, only sold at Black Market or as event drops).
- Defense: requires tainted fields, which requires clone deaths, which cost reckoning.
- Defense: sold only at Black Market, which requires low town reputation and lowers it further.
- Defense: the coin/reckoning ratio should make bone-root a "high-risk high-reward niche" not a default.
- Balance target: bone-root income should be 1.5–2x wheat income per field, but with 2x+ the risk cost.

### Too hard

**Risk 1:** The player can't figure out planting windows and misses all their opportunities.
- Defense: Morning Brief always announces "planting window opens for X" and "closes in Y days." Almanac (rare buy) projects windows for the whole season.
- Defense: tutorial run has a friendly first spring with clear callouts.

**Risk 2:** Weather RNG destroys the player's crop and they can't recover.
- Defense: weather is forecast in Morning Brief with confidence tiers (Rumored / Reported / Confirmed).
- Defense: hail/frost events give warnings 1–3 days ahead in most cases, allowing emergency harvest.
- Defense: potatoes and turnips are "insurance crops" — cheap seed, food value, always something.

### Boring

**Risk 1:** Once the player figures out crop rotation, the planting decision becomes mechanical.
- Defense: seasonal price fluctuations (Market §) mean "what to plant" changes even when "how to rotate" is solved.
- Defense: Demand shock events tell you "cotton demand up 40% for 60 days" — replans your season.
- Defense: Weird crop discovery mid-run adds new options.

**Risk 2:** Tending is a "correct answer" (always tend the highest-value field) with no interesting variation.
- Defense: farmhand assignment is a limited resource; tending one field means not-tending another.
- Defense: clone traits interact with tending (a Grower gives +25% not +15%; a "sees things" clone tending Whisper Wheat has narrative consequences).

### Exploitable

**Exploit 1:** Plant only bone-root, deliberately kill a clone in each field to enable it.
- Defense: sustained cruelty means Reckoning rises fast (see Reckoning Meter §). Walker-tier events at Reckoning ~60% will start destroying crops and killing clones you didn't intend to.
- Defense: Ghost Roll fills, and specific dead-clones return at night. Naming their fields matters mechanically.
- Defense: Black Market being the only buyer means town reputation tanks; supplies get expensive and inconsistent.
- Verified counter: at high cruelty, a "pure bone-root" strategy should die by Year 3 to Reckoning Proper.

**Exploit 2:** Save-scum weather / event rolls to always get favorable outcomes.
- Defense: seeded PRNG means "reload the day and try again" gets the same weather. Reloading only works if you *change your action* on the day.
- Defense: mobile-friendly design means saves are auto-only at day boundaries; players can't checkpoint mid-day.

**Exploit 3:** Overplant on Year 1 with all cheap seed, hope for at least one to hit.
- Defense: labor is real. A single clone can tend maybe 2 fields well; more fields means less tending per field, means lower per-field yield.
- Defense: expansion is capped at 2–3 fields at start, +1 per major labor project (multi-day clone commitment).

**Exploit 4:** Sit on a hoard of harvested crops indefinitely, waiting for market peaks.
- Defense: storage life (see stat table). Wheat lasts 8 seasons; hops last only 4. Sitting on hops through winter loses them.
- Defense: cellar building extends storage but costs to build.
- Defense: storage cap at each building tier — hoarding requires investment.

**Exploit 5:** Harvest one crop, immediately replant same field with same crop.
- Defense: fertility decay makes this progressively worse. Four repeats = 60% yield.
- Defense: same-crop-consecutive gets a "monoculture penalty" of -10% growth speed (proposed — validate against balance model).

## Balancing levers

Numbers we can tune if simulation or playtesting shows issues:

- Base grow times (currently 15–45 days)
- Base yields per field (currently 4–15)
- Base prices per unit (currently 2–30)
- Seed costs (currently 3–20)
- Fertility decay per harvest (currently 15–30%)
- Harvest window length (currently 8 days)
- Rot curve steepness
- Reckoning growth multipliers
- Taint accumulation rates
- Storage lives

## Sample scenarios

### Scenario A — Year 1, cautious homesteader

Player starts with:
- 3 small cleared fields
- 100 coin, 20 seed (mixed wheat/potato from starting supply)
- 1 clone (Elias, Field Hand, Body Average, Mind Average)

Player plants:
- Field 1: wheat (small, 4 seed, expected yield 6 bushels)
- Field 2: potatoes (small, 6 seed, expected yield 7 units)
- Field 3: fallow (rebuilding fertility)

Growth over Spring:
- Day 5: rain, both crops +15% growth that day
- Day 12: drought week begins; wheat and potato growth slowed
- Day 18: potato at 100%, 8-day harvest window opens
- Day 20 (season end): Elias harvests potatoes (0.6 clone-days for small field), stores 7 units. Wheat at 70%.
- Day 30: wheat harvest, 6 bushels stored.

Player sells 3 bushels wheat and 3 units potato in Summer market. Coin flow this season: -10 (seed) +9 wheat +6 potato = +5 coin net, but with 3 wheat + 4 potato held for winter food.

Feels: tight but rewarding. Elias survived spring. Winter food not yet secured.

### Scenario B — Year 3, cash-crop gambler

Player has:
- 5 fields (2 medium, 3 small)
- 400 coin, 4 clones
- Cotton contract signed with Regional Buyer: 20 units at 15 coin/unit, delivery Day 55 of Fall

Player plants:
- Medium 1: cotton (10 seed, target yield 16 units)
- Medium 2: cotton (10 seed, target yield 16 units)
- Small 1: wheat (fallback food)
- Small 2: potatoes (fallback food)
- Small 3: fallow

Risk: cotton requires 3.0 clone-days per medium field at harvest. Two mediums = 6 clone-days. Player has 4 clones. Peak harvest week will consume 1.5 days per clone — everything else stops.

Day 45 hailstorm event: 30% roll to destroy 50% of cotton yield. Player has to choose: emergency harvest early (rushed, -20% yield) or hope for no hail. Reads the paper — "Reports of storm systems north" — decides to emergency harvest.

Outcome: 26 cotton units instead of 32. Contract requires 20. Delivers exactly, keeps 6 to sell after contract (post-contract price drop of 20%). Net after seed and labor: ~200 coin profit.

Feels: intense, high-variance, requires reading the paper and reacting.

### Scenario C — Year 5, morally-compromised expansion

Player has:
- 8 fields, 12 clones, 800 coin
- Vat operational, Reckoning at 45% (Warnings tier active)
- Recent unmarked burial of clone Josephine in East Field

East Field now has 50% taint, enabling bone-root. Player plants bone-root there.

- Seed: 10 coin (bought last week from Black Market)
- Grow: 25 days
- Ideal yield: 6 units × 1.25 tainted bonus = 7 units
- Sell price: 30 coin/unit × Black Market only = 210 coin

Simultaneous cost: household morale dropped 10 points from unmarked burial. Two more clones show refusal-to-work events over the next month. Reckoning ticks +5% (approaching Walkers threshold).

Player faces choice at Day 20: harvest bone-root as planned (locking in the cruelty benefit), or give Josephine a late funeral (spending 40 coin + labor, easing the Reckoning by 8 — a full funeral's relief, §6 — removing her from Ghost Roll, but voiding the taint before harvest).

This is the game.

---

# 2. Market Pricing

## Recap

The player sells crops (and buys seed, coal, and clones) through four price layers stacked multiplicatively — a stable **base**, a predictable **seasonal wave**, event-driven **demand shocks**, and daily **micro-noise** — across four venues (Local, Regional Buyers, Rail Depot, Black Market) that trade price against access, volume, and reputation. Forward contracts let the player lock a price and quantity now for delivery later, insulating against crashes at the cost of default risk. The market rewards information — reading the paper, timing sales, choosing venues — without demanding a spreadsheet.

## Numbers & formulas

### The price stack

```
sale_price(crop, day, venue) =
    base_price
    × seasonal_mult(crop, season)
    × (1 + demand_shock)
    × micro_noise
    × venue_mult
    × glut_penalty(venue, crop, recent_sales)
```

Base prices are the per-unit values in the §1 crop table (wheat 3, cotton 12, bone-root 30, etc.). Each layer below is a multiplier on that base.

### Layer 1 — Seasonal wave

Each crop family has a four-season price curve. Prices bottom out in the family's **harvest glut** and peak in its **scarcity window**. Amplitude is ±25% around base.

| Family | Spring | Summer | Fall | Winter |
|---|---|---|---|---|
| Grains | 1.15 | 1.00 | 0.75 | 1.25 |
| Roots | 1.10 | 1.00 | 0.80 | 1.20 |
| Cash | 0.90 | 1.20 | 1.05 | 0.95 |
| Weird | 1.00 | 1.00 | 1.10 | 1.30 |

*(Defends against: "harvest and immediately dump everything." Selling grain in the Fall harvest glut earns 0.75× base — 25% below par. The player who wants top coin must store into Winter scarcity (1.25×), which storage life and storage caps from §1 bound. There is no sell-timing that is both immediate and optimal.)*

The full curve is shown in the Almanac (rare buy, ~40 coin) and the current-season value is always visible in the Market tab, so the wave is **learnable, not hidden** *(defends against: "prices feel random / too hard" — see failure modes)*.

### Layer 2 — Demand shocks

Event-driven temporary multipliers on one crop or family. Range **−0.50 to +0.80**. Duration **20–60 days**. On average **one shock is active at a time**; a new shock rolls roughly every 15–25 days (see §9 Events for the exact draw).

Examples:
- "Rail crews need tobacco" → tobacco +0.60 for 40 days.
- "Blight in the southern counties" → potato/turnip +0.50 for 60 days (scarcity elsewhere).
- "Mills overstocked" → wheat −0.40 for 30 days.

Shocks are announced in the Morning Brief with a confidence tier (Rumored / Reported / Confirmed) 2–5 days before they take effect *(defends against: "boring — solved rotation." A locked crop-rotation plan is disrupted by shocks that make this season's right answer different from last season's. See failure modes.)*

### Layer 3 — Micro-noise

A daily mean-reverting jitter, **±5%**, seeded per crop per day. Prevents a single "correct" sell-day and gives a small reward for checking the market, but is too small to build a strategy on *(defends against: "perfect arbitrage" — the player cannot compute one exact optimal minute to sell; noise blurs the peak by ±5%, so timing is a judgment call, not a solved equation).*

### Layer 4 — Venues

| Venue | Price mult | Daily soft-cap (units) | Access cost | Notes |
|---|---|---|---|---|
| **Local** (Marrow's Cross) | 1.00 | 10 | none | Always open. Low volume. |
| **Regional Buyers** | 1.10 | 30 | 1 clone-day wagon trip; buyer present every 5th day | Where contracts are signed. |
| **Rail Depot** | 1.25 | 100 | Rail must have come (Year 3+ Season Arc); 10% freight cut | Late-game scaling valve. |
| **Black Market** | 1.30–1.80 | 15 | −8 town reputation per visit; only buyer for bone-root & moon barley | Contraband & Weird crops. |

*(Venue design defends against two things at once. The Local soft-cap of 10 units/day defends against "dump your whole harvest at full price" — you physically cannot. The higher-price venues each carry a real cost — labor (Regional), a mid-game gate (Rail), or reputation (Black Market) — so there is no free "just always sell at the best price" move. Splitting a large harvest across venues IS allowed and intended: it rewards logistics, but total throughput is capped by your wagon/clone labor, not by a menu click.)*

### Glut penalty (venue saturation)

Each venue tracks a per-crop **saturation** value that rises as you sell there and decays **20% per day**.

```
glut_penalty = max(0.40, 1.00 − 0.15 × floor(units_sold_in_window / soft_cap))
```

So at Local (cap 10): first 10 wheat sell at full seasonal price; units 11–20 at 0.85×; 21–30 at 0.70×; floored at 0.40× no matter how much you flood.

*(Defends against: the "flood one venue" dump. Worked: dumping 30 wheat at Local in one day nets 10×3 + 10×2.55 + 10×2.17 = 87 coin, an effective 2.32/unit vs. the 3.00 base — a 23% self-inflicted haircut. Spreading those 30 across three days lets saturation decay between sales, but that ties up storage life and exposes you to price moves. The 0.40 floor exists so a desperate player can always liquidate for *something* — defends against "too hard: I'm stuck holding unsellable stock.")*

### Forward contracts

Signed at Regional Buyers or as civic contracts via Mayor Halloway. A contract specifies **crop, quantity, locked price, delivery deadline**.

- **Locked price** is typically set at **1.05–1.20× the current spot** — a premium for the buyer's certainty, and the player's insurance against a crash.
- **Signing deposit:** player posts **20% of contract value** at signing, refunded on delivery. *(Defends against: "sign infinite contracts risk-free to lock every price" — capital is tied up per contract, so over-committing starves your working coin.)*
- **Default penalty (zero delivery):** forfeit the 20% deposit + **−15 town reputation** + that buyer offers no new contracts for **1 in-game year**. *(Defends against: "sign a contract, then default whenever spot rises above the locked price." The deposit forfeit alone must exceed the spot-vs-locked upside in >90% of price scenarios — see verified counter.)*
- **Partial delivery:** pro-rated payment on what's delivered; deposit forfeit and rep hit scale with the shortfall (deliver 80%, lose 20% of the deposit and −3 rep). *(Defends against: an all-or-nothing cliff that would make one bad hailstorm catastrophic — "too hard" mode.)*

## Intended player experience

The player should feel like a **canny frontier trader reading a fickle market** — that selling well is a skill of timing and venue, not a lookup. A good harvest sold badly (dumped into a glut) should sting; the same harvest stored, split across venues, or pre-sold on contract should feel earned. Contracts should feel like a **bet on your own competence**: the security is real, and so is the noose if the weather turns.

## Four failure modes checked

### Too easy

**Risk 1:** The seasonal wave is learnable, so "buy at glut, sell at scarcity" becomes a trivial money printer.
- Defense: storage life (§1) caps how long you can hold — hops rot in 4 seasons, so you can't warehouse them to Winter peak reliably.
- Defense: capital tied up in stored goods is capital not replanted; the opportunity cost is real (see verified counter below).
- Defense: micro-noise and demand shocks mean the "buy low" and "sell high" points are fuzzy, not fixed.

**Risk 2:** Rail Depot's 1.25× makes all other venues obsolete once unlocked.
- Defense: the 10% freight cut nets it to ~1.125× effective — barely above Regional's 1.10× — so it's a *volume* valve (cap 100), not a strictly-better price. It matters when you have a big harvest to move, not for a handful of units.
- Verified counter: **for harvests under ~25 units, Regional Buyers should net more coin than the Rail Depot after freight** — so the Rail does not trivialize small/mid operations.

### Too hard

**Risk 1:** Prices feel random; the player can't plan and gives up on the market.
- Defense: the seasonal curve is fully visible (Market tab shows current, Almanac shows the whole year). Only ±5% noise and the shock timing are uncertain.
- Defense: demand shocks are pre-announced with confidence tiers 2–5 days out.

**Risk 2:** The player over-produces one crop and can't sell it before it rots (no venue can absorb it).
- Defense: the 0.40× glut floor guarantees a liquidation price.
- Defense: Regional (cap 30) + Rail (cap 100) exist precisely to move volume; the fix for "too much to sell" is unlocking/reaching bigger venues, which is legible progression.

### Boring

**Risk 1:** Once the player memorizes the seasonal table, selling becomes rote.
- Defense: demand shocks re-rank crops every ~20 days — the profitable crop this season may be the dumped crop next season, so "what to plant/sell" never fully solves even when "how to rotate" (§1) does.
- Defense: contracts turn selling into forward-planning under weather risk, not a spot-price lookup.

### Exploitable

**Exploit 1 — Warehouse arbitrage:** buy/hold crops through the seasonal trough and sell at the Winter peak, every year, as a primary income.
- Defense: storage life + storage caps (§1) + capital lockup + spoilage events (§9) + the glut penalty when you finally sell the hoard all at once.
- **Verified counter:** *holding wheat from Fall glut (0.75×) to Winter peak (1.25×) is a nominal +67% on price, but after (a) the glut penalty on selling a large stored lot, (b) a season of tied-up capital that could have funded a replant, and (c) ~10% expected spoilage/event loss, net return should be **under +20%** — worse than replanting the same coin into a crop. Arbitrage should be a minor supplement, never a main strategy.*

**Exploit 2 — Contract default gaming:** sign contracts to lock a floor, then default whenever spot rises above the locked price.
- Defense: 20% deposit forfeit + −15 rep + 1-year buyer freeze.
- **Verified counter:** *defaulting to chase spot must be net-negative vs. delivering in >90% of price outcomes. Since the locked price is already 1.05–1.20× spot-at-signing, spot would have to rise >20% AND exceed the 20% forfeited deposit's value for default to pay — a rare double condition, and even then the −15 rep and buyer freeze (lost future contract access) should tip it negative.*

**Exploit 3 — Multi-venue simultaneous dump** to beat the glut penalty by splitting a huge harvest across Local + Regional + Rail on the same day.
- Defense: this is *intended and allowed* — but each venue's soft-cap + your finite wagon/clone labor (one Regional trip costs a clone-day; the Rail run has freight) bounds total same-day throughput. You can move a big harvest, but moving it costs labor you're not spending elsewhere.
- **Verified counter:** *maximum single-day liquidation across all unlocked venues should still leave a large harvest (>60 units) taking 2–3 days to clear at good prices — enough that storage life and price drift remain live concerns.*

**Exploit 4 — Black Market laundering** of normal crops to dodge Local glut.
- Defense: Black Market's 1.30–1.80× is for contraband/Weird; **normal crops sell there at only 0.90×** (fences don't want your wheat) and every visit still costs −8 rep. Not worth it for legal goods. *(This number — normal crops at 0.90× Black Market — exists specifically to kill the "route everything through the fence" exploit.)*

## Balancing levers

Seasonal amplitude (±25%); demand-shock range (−50/+80%) and frequency; micro-noise band (±5%); venue price mults and soft-caps; glut decay rate (20%/day) and step (−15%/cap); glut floor (0.40×); contract premium (1.05–1.20×), deposit (20%), and default rep hit (−15).

## Sample scenarios

### Scenario A — Normal play: Year 2, timing a grain harvest

Player harvests 24 wheat bushels in Fall. Fall grain price is 0.75× base = 2.25/unit; Winter scarcity is 1.25× = 3.75/unit.

- Sells 10 now at Local (Fall): needs cash for coal. 10 × 2.25 = ~22 coin (first 10, no glut penalty).
- Stores 14 for Winter. Wheat's 8-season storage easily covers it.
- Winter: sells 10 at Local peak (3.75×): ~37 coin. Holds 4 as winter food (§4).

The player *feels* the wave working for them — patience paid ~1.5× per stored bushel — but also feels the pull of needing cash now. Splitting the harvest across the season is the intended rhythm.

### Scenario B — Edge/exploit: Year 3, the over-committed contractor

Min-maxer signs **three** cotton contracts at Regional to lock Summer's high price (1.20× × 12 = ~14.4/unit): 20 units each, 60 total, delivery Fall Day 55. Deposits posted: 3 × (20 × 14.4 × 0.20) = ~173 coin locked up.

- Plants 4 cotton fields targeting 64 units. Labor is already stretched (cotton = 3.0 clone-days/field at harvest, §1).
- Day 45: hailstorm event destroys 50% of one field. Projected yield drops to ~48 units.
- Player can now fill **two** contracts (40 units) and must **partial-or-default** the third.
- Chooses partial: delivers 8 of the third contract's 20 (48 − 40 = 8). Pro-rated pay on 8, forfeits 60% of that contract's deposit (~35 coin), takes −9 rep.

The 173-coin lockup starved his mid-Summer cash (couldn't buy a needed clone); the rep hit raised his Merchant prices (§3) and nudged Black Market access. **The system's lesson lands: contracts are leverage, and leverage cuts both ways.** A humbler two-contract plan would have survived the hail with margin to spare — which is exactly the calibration the four-failure-mode audit is protecting.

---

# 3. Clone Economics

## Recap

Clones are the farm's labor and the game's moral engine. The player acquires them three ways — **Dr. Ambrose Vane's Merchant wagon** (reliable, legal, pricey), **The Vat** (DIY, cheap-per-unit, horrifying, unlocked mid-game), and **Foundlings** (free, rare, unpredictable) — then feeds, houses, and assigns them. Each clone supplies labor measured in **clone-days**, modified by Body, Mind, archetype, traits, and Morale. Cruelty extracts more labor now and pays for it across the four-axis ledger (Morale and Reputation visible; Reckoning and Ghost Roll hidden). **Labor, not coin, is the true scarce resource from mid-game on** — and every clone is both an asset and a potential debt the land will call in.

## Numbers & formulas

### Labor: the clone-day

Each clone provides **1.0 clone-day of labor per day**, assignable to one primary task, modified by Body:

- **Strong:** ×1.25 → 1.25 clone-days/day
- **Average:** ×1.00
- **Frail:** ×0.75

Task costs are in clone-days (harvest costs in §1; construction in §8). A clone may be **pushed to 1.5 clone-days in a day (overwork)** for +50% output that day, at a Morale and health cost (below). *(The 1.5 cap defends against: "just overwork everyone to +200% and never hire" — output per clone is hard-capped at 1.5×, so labor still scales with headcount, and the cost curve on overwork makes sustained pushing a losing trade — see Exploit 2.)*

### Clone stats

- **Body** (Frail / Average / Strong): labor multiplier above; also cold/illness resistance in Winter (§4).
- **Mind** (Dull / Average / Sharp): Sharp = +0.10 tending bonus and can work Weird crops competently; Dull = −0.10 on skilled tasks but +morale-stability (less prone to unrest). *(Mind is a genuine trade, not a strict ladder — defends against "one stat is always best": Sharp clones are better labor but more volatile under cruelty, Dull clones are worse labor but obedient.)*
- **Archetype:** Field Hand (baseline), Grower (+25% crop tending vs. +15% generic, per §1). More archetypes unlock via Vigils (D-015, content-not-power).
- **Traits** (hidden until revealed by play): e.g. *"sees things"* (interacts with Weird crops & Reckoning — a Whisper Wheat tender who sees things has narrative consequences, §1), *"strong back"* (+0.10 labor), *"sickly"* (2× illness risk), *"devout"* (2× Morale hit from witnessing cruelty).

### Acquisition & pricing

**Merchant (Dr. Ambrose Vane's wagon)** — visits every **10 days**, carries **1–3 clones** in stock:

| Clone | Body / Mind | Merchant price |
|---|---|---|
| Field Hand | Avg / Avg | 60 coin |
| Field Hand | Strong / Dull | 75 coin |
| Grower | Avg / Sharp | 110 coin |

Merchant prices **scale with your town reputation** (§5): at Suspect standing or lower (rep <40), Vane marks up **+25%**; at Pillar standing (rep ≥70) or a warm personal track (§12), he discounts **−10%**. *(Defends against: "run a cruel, low-rep farm with no economic consequence" — cruelty tanks reputation (§5), which raises the price of the very labor cruelty consumes. The market itself punishes the cruel path.)*

**The Vat** (mid-game building, ~300 coin to build, §8) — grows a clone in **8 days** from **biomass + 10 coin nutrients**. Biomass comes from failed crops, slaughtered livestock, or corpses (below). Marginal coin cost per Vat clone is low (~10–20), but Vat clones roll **wider stat variance** (more Frails and Duds) and carry a **standing +Reckoning drip** while operating. *(The 8-day grow time defends against: "spin up an instant clone army the moment you can afford the Vat" — expansion is rate-limited to one clone per 8 days per Vat, so headcount grows at a pace the Reckoning and food systems can react to.)*

**Foundlings** — free clones via events (a wanderer, a church foundling from Sister Ruth, a survivor). **Rare** (a few per lifetime), often Frail or trait-encumbered, sometimes with narrative strings. *(Free, but their rarity and unpredictability defend against "just farm foundlings for free labor" — you cannot scale a workforce on them.)*

### Upkeep: feeding

Each clone eats **0.5 food/day** (baseline), rising to **0.75/day in Winter** (§4). The farmer eats **1.0/day**. Underfeeding to **0.25/day** saves food but costs **−5 Morale/day** and doubles illness risk. *(The feeding cost defends against: "buy 20 clones in Year 1 and steamroll" — every clone is a standing food liability that must be provisioned through Winter, so headcount is bounded by your food economy, not just your coin. See verified counter.)*

### Morale (visible ledger axis, 0–100, starts ~60)

| Band | Effect |
|---|---|
| 70–100 | Content: +5% household labor; no negative morale events |
| 40–69 | Normal |
| 20–39 | Unrest: refusal-to-work events possible; −10% labor |
| 0–19 | Revolt/desertion roll each dawn |

Morale is **household-wide with a per-clone component**: individual clones have their own morale, but a shared "household mood" floats with the worst events. **Crucially, cruelty to one clone drags the whole household's mood** *(this shared-mood design defends against Exploit 2 — you cannot quarantine cruelty to a single "disposable" clone; survivors witness it and slow down).*

Morale drivers (per day unless noted):
- **Up:** adequate food (+1), a rest day (+4, whole household off work), shelter upgrade (+one-time), festival attendance (+8, §12), a full funeral for a fallen clone (+10 one-time).
- **Down:** overwork (−8/day per overworked clone), underfeeding (−5/day), cold/no fuel (−6/day, §4), witnessing a clone death nearby (−10), an unmarked field burial (−10 household, §1).

### Cruelty → yield exchange (the core hook, quantified)

| Cruel action | Immediate gain | Ledger cost |
|---|---|---|
| Overwork (1.5 clone-days) | +50% labor today | −8 Morale/day; +Frailty wear; +Reckoning if sustained |
| Skimp food (0.25/day) | Save 0.25 food/clone/day | −5 Morale/day; +illness |
| Work-a-clone-to-death (for Vat biomass or field taint, §1) | 1 corpse (biomass or +50% field taint) | −10 household Morale; +Reckoning; +1 Ghost Roll entry |

### Death & disposal (five options, D-011)

| Disposal | Coin / labor | Morale | Reckoning | Ghost Roll | Other |
|---|---|---|---|---|---|
| **Marked grave** | plot + 0.3 clone-day | +2 | −small | — | Respectful baseline |
| **Unmarked field burial** | free | −10 household | +medium | +1 entry | +50% field taint (§1) → enables bone-root |
| **Sell corpse to Vane** | **+15 coin** | −6 | +small | — | Ambrose "remembers"; rep risk if exposed |
| **Feed to Vat** | +biomass (≈½ a clone's grow cost) | −8 | +medium | +1 entry | The horror-efficiency loop |
| **Full funeral** | −40 coin + 1 rest day | +10 | **−large** | removes 1 entry | Requires Preacher Grange relationship |

*(The **+15 coin** corpse-sale price is deliberately set **far below the 60-coin replacement cost** — see Exploit 3. It exists so the option is *tempting and characterful* without ever being *coin-positive*.)*

## Intended player experience

The player should feel the constant, quiet arithmetic of **how much a person is worth to them** — and should feel the game noticing their answer. A well-run household of loyal, fed, rested clones should be visibly more productive than a churned one, so kindness reads as competence, not just virtue. And the cruel shortcuts should always be *right there*, cheap and effective in the moment, so that every humane choice is a choice and not a default.

## Four failure modes checked

### Too easy

**Risk:** Buy a big Grower workforce early and trivialize the labor economy.
- Defense: Year-1 coin scarcity (start 100 coin; a Grower is 110). Merchant stock is 1–3 per 10 days.
- Defense: feeding + Winter food crunch caps sustainable headcount well below what coin alone would allow.
- **Verified counter:** *a Year-1 player cannot afford AND feed more than ~2 clones through the first Winter without gambling on a food shortfall. Headcount growth should track food-production growth, not coin, keeping early scaling honest.*

### Too hard

**Risk:** Clones keep dying or deserting and the player can't maintain a workforce.
- Defense: the Merchant is an always-available (if pricey) restock — you can never be permanently locked out of labor.
- Defense: Foundling events provide free lifelines.
- Defense: Morale is fully visible with legible drivers; recovery (food, rest, a funeral, a festival) is always in the player's hands.

### Boring

**Risk:** Assignment collapses to "always tend the highest-value field" with no interesting variation.
- Defense: finite labor means tending one field is not-tending another (from §1).
- Defense: trait interactions (a *"sees things"* clone on Whisper Wheat), Morale management, and cruelty temptations make assignment a character-and-ethics decision, not just a value sort.
- Defense: event-driven disruptions (illness, refusal, desertion) force reassignment.

### Exploitable

**Exploit 1 — The Vat corpse loop:** feed dead clones to the Vat to grow replacements at near-zero coin; treat clones as fully fungible biomass.
- Defense: every death adds Reckoning + a Ghost Roll entry; the standing Vat Reckoning drip compounds it. Household Morale collapses under repeated death, cratering the labor the loop is trying to produce.
- **Verified counter:** *an industrial Vat-corpse economy should push Reckoning into Walkers tier by Year 2–3 (cf. §1's bone-root counter), at which point returning dead (Ghost Roll) and Walker-tier events destroy more labor/crop than the loop generates. The efficient-horror path must become self-terminating, not dominant.*

**Exploit 2 — Overwork-then-discard:** extract maximum labor by pushing clones to death, then rebuy fresh.
- Defense: the 1.5 clone-day overwork cap limits per-clone extraction; −8 Morale/day is household-wide, so survivors' output falls faster than the overworked clone's rises.
- **Verified counter:** *sustained overwork-to-death should yield LESS net household labor within 2 seasons than humane management, because the shared-Morale penalty (−10% then desertion) outweighs the +50%/day per-clone extraction. Cruelty-for-throughput must be a trap, not a tactic.*

**Exploit 3 — Corpse-sale arbitrage:** kill clones and sell the bodies to Vane for coin.
- Defense: 15 coin/corpse vs. 60+ coin to replace, plus Reckoning, Morale, and rep-driven Merchant markups.
- **Verified counter:** *corpse-sale income is fixed strictly below replacement cost, so the loop is coin-negative by construction — it can never be a revenue strategy, only a grim way to recoup a fraction on a clone already dead.*

**Exploit 4 — Starvation-gating:** underfeed clones to exactly hover above the desertion threshold, banking food.
- Defense: illness risk doubles under-fed; the −10% labor band starts at Morale 39; and **daily Morale variance (±3)** means a clone gated near 20 will randomly dip into the revolt-roll band. *(The variance is deliberately there to punish precise threshold-gating — you cannot safely park a clone at Morale 21.)*
- **Verified counter:** *food "saved" by gating is less than the labor value lost to the −10% band and illness downtime, so starvation-gating is net-negative on output.*

**Exploit 5 — Foundling-only farming:** rely entirely on free foundlings.
- Defense: rarity (a few per lifetime) and their frequent Frailty/trait baggage make a foundling-only workforce too small and too weak to run a farm at scale.

## Balancing levers

Clone-day value & Body mults; overwork cap (1.5) and its Morale cost (−8); Merchant prices, visit cadence (10 days), stock size (1–3), and rep-scaling (±25%); Vat build cost (300), grow time (8 days), and Reckoning drip; feeding rates (0.5/0.75/day) and underfeed penalty; Morale bands, drivers, and daily variance (±3); the full disposal cost table (esp. the 15-coin corpse price and funeral's −large Reckoning).

## Sample scenarios

### Scenario A — Normal play: Year 2, the fourth-clone decision

Player has 3 clones (2 Field Hands, 1 Grower) and 130 coin, planning a two-field cotton season (needs 6 clone-days at peak harvest, §1). Vane's wagon arrives with a Grower (Avg/Sharp, 110 coin).

- Buying it covers the cotton labor crunch — but leaves 20 coin and adds 0.75 food/day of Winter feeding (≈15 more food to stockpile, §4).
- Player buys, then re-plans Fall: one extra food field to cover the new mouth.

The decision *feels* like real husbandry — labor need weighed against the standing cost of another life to keep warm and fed. Exactly the intended texture.

### Scenario B — Edge/exploit: Year 2–3, the Vat baron

Min-maxer builds the Vat in Year 2 (300 coin) and runs the corpse loop: grows 6 clones cheap, overworks them at 1.5 clone-days, feeds the Frails and the dead back into the Vat for biomass.

- Season 1: throughput is spectacular. Fields worked hard, harvests up ~40%.
- Household Morale slides from 60 → 32 (overwork −8/day, deaths −10 each) → the −10% labor band, then refusal events.
- Reckoning crosses into **Warnings** (Year 2 end) then **Walkers** (mid Year 3): crops begin failing (reckoning_mult 0.85 → 0.70, §1), and Ghost Roll clones — the specific dead, by name — start returning at night, sabotaging fields and spiking further Morale loss.
- By Year 3 the operation is producing less than a humane 4-clone farm and is spiraling toward Reckoning Proper.

The would-be baron discovers the loop **eats itself** — the verified counters holding exactly as designed. *This is the game:* the cruel path is always open, always tempting, and always collecting its debt.

---

# 4. Winter Survival

## Recap

Winter is the year's crucible — Season 4, days 61–80. Almost nothing grows; the homestead only consumes. To bring the household (farmer + clones + livestock) through 20 cold days, the player must have stockpiled **food** and **fuel** during Fall, when that same labor is desperately needed for harvest. Under-prepare and Winter takes its cut in illness, frozen clones, desertion, and — at the extreme — starvation and line-death. This is the Oregon Trail heart of the game: the season you survive, or don't, on what you set aside.

## Numbers & formulas

### Winter consumption

**Food** (per day, all 20 Winter days):
- Farmer: 1.0 food/day
- Each clone: 0.75 food/day (up from 0.5 — cold burns calories, §3)
- Livestock: 0.5 fodder/day per animal

*Household of farmer + 4 clones = 1.0×20 + 4×0.75×20 = **80 food** for the season.*

**Fuel** (heat) — the homestead burns fuel to stay above freezing:
- Baseline: **2 fuel/day** → **40 fuel** for the season.
- +0.5 fuel/day per building beyond the core (bunkhouse, barn, Vat).
- Fuel units: **1 wood = 1 fuel; 1 coal = 2 fuel.**

*(The Fall-labor-vs-Winter-stockpile squeeze is the entire point — food and fuel both cost harvest-season clone-days to secure, so you cannot max harvest income AND max Winter buffer. Defends against "too easy: just stockpile everything" — the buffer has a hard opportunity cost in foregone Fall income.)*

### Fuel sourcing: wood vs. coal (a real decision)

| Fuel | Coin cost | Labor cost | Notes |
|---|---|---|---|
| **Wood** | free | 1 clone-day → 4 wood (chop in Fall) | Labor-rich / coin-poor path |
| **Coal** | ~3 coin/unit (2 at Rail Depot, §2) | none | Coin-rich / labor-poor path |

*40 fuel via wood = 10 clone-days of Fall chopping (10 days a clone isn't harvesting). 40 fuel via coal (20 coal) = ~60 coin.* *(This trade defends against "boring — winter prep is one solved checklist": the right answer differs by playstyle and by year. A cash-crop farm short on labor buys coal; a subsistence farm short on coin chops wood. Neither is dominant.)*

### Food sourcing & the cash-crop trap

Crops convert to food value:

| Crop | Food value/unit |
|---|---|
| Potato | 2.0 |
| Corn | 2.0 |
| Turnip | 1.5 |
| Wheat | 1.5 |
| Oats | 1.5 |
| **Cotton / Tobacco / Hops** | **0 (inedible)** |
| Livestock (slaughter) | pig 15, cow 25 |

*(Cash crops having **zero food value** is the load-bearing anti-monoculture number. Defends against "just grow the highest-margin cash crop and buy food" — see verified counter. Roots are the efficient winter larder: a Medium potato field = 15 units × 2.0 = 30 food, and potatoes store 12 seasons (§1).)*

### Winter Readiness projection

From **Fall Day 12 onward**, the Morning Brief shows a live readiness panel:

```
WINTER READINESS  (household: farmer + 4)
  Food:  62 / 80 needed      ⚠ short 18
  Fuel:  30 / 40 needed      ⚠ short 10   (+15 buffer recommended for cold snaps)
  Fall days remaining: 6
```

*(This projection is the primary defense against "too hard: one under-preparation death-spirals the run unrecoverably" — the player always has ~8 days of clear runway and explicit shortfalls to react to. No silent failure.)*

### Winter attrition events

- **Cold snap** (≈2 per Winter, weather event §10): fuel demand **+50% for 2–3 days**. If fuel runs out, unsheltered clones roll frostbite (illness) or, at zero fuel + Frail, death.
- **Winter fever** (illness): a clone loses labor for **3–5 days**; Doc Bell treats for **~20 coin**; untreated + Frail can be fatal.
- **Starvation cascade:** food hits 0 → household eats seed/reserves → Morale −15/day → weakest (Frail first) clones die → deaths crash Morale further → spiral. Farmer starvation = **line-death risk (run end, D-007).**
- **Cabin fever:** a slow **−1 Morale/day** shut-in drain across Winter, offset by the **Midwinter festival (+8, §12)** and by events.
- **The dead walk in the cold:** Reckoning events cluster in Winter (Ghost Roll returns are more frequent) — thematically, Winter is when horror peaks. *(Mechanical hooks detailed in §6.)*

### Emergency levers (anti-death-spiral safety nets)

- **Slaughter livestock:** instant food (pig 15 / cow 25), but forfeits future breeding + manure (§1 fertility).
- **Fire-sale assets** for emergency coal (sell stored crops, even at Winter glut penalty, §2).
- **Church charity:** a Sister Ruth event can gift food/fuel at a **reputation or obligation cost** (never free, never exploitable on demand).

## Intended player experience

Winter should feel like **holding your breath for twenty days**. The dread should build through Fall as the readiness panel creeps toward "enough," and the payoff — surviving a cold snap on your last four coal, waking the household on the first day of Spring with everyone still breathing — should be the game's core emotional beat: *"I survived another year."* It should be beatable with foresight and brutal to the careless, never arbitrary.

## Four failure modes checked

### Too easy

**Risk:** Stockpile a huge buffer once and never fear Winter again.
- Defense: every unit of food/fuel hoarded is Fall labor and coin not spent on income — a real, recurring opportunity cost.
- Defense: storage caps (§1) limit how much you can bank; growing the household raises the bar every year, so last year's comfortable buffer is this year's shortfall.

### Too hard

**Risk:** A single under-preparation kills the run with no chance to react.
- Defense: the Winter Readiness projection (Fall Day 12+) gives explicit shortfalls and ~8 days of runway.
- Defense: emergency levers (slaughter, fire-sale, charity) provide costly-but-real outs mid-crisis.
- Defense: the **first Winter is milder** — smaller household, a guided readiness callout — so the mechanic is taught before it's lethal.

### Boring

**Risk:** Winter is just watching numbers tick down for 20 days.
- Defense: cold snaps, fever, and cabin-fever Morale management give the season live decisions; the Midwinter festival is a tentpole.
- Defense: it's a tight 20 days, and it's when Reckoning/horror events peak — Winter is the most *eventful* season, not the emptiest.

### Exploitable

**Exploit 1 — Sell-in-Fall / rebuy-in-Spring:** dump most of the workforce before Winter to dodge feeding them, rebuy in Spring.
- Defense: Merchant stock is 1–3 per 10 days, so rebuilding is slow; a fire-sale of clones tanks Morale and reputation (raising Spring Merchant prices, §3); you lose accumulated high-Morale, trait-known clones for fresh unknowns.
- **Verified counter:** *for workforces up to ~6 clones, the sell-in-Fall/rebuy-in-Spring cycle should cost more (Morale/rep hit + slow restock + lost labor ramp) than simply feeding the workforce through Winter. Culling for the season must be a loss, not a savings.*

**Exploit 2 — Starve-the-weak triage:** deliberately underfeed and let Frail clones die to stretch food for the strong.
- Defense: deaths trigger the Morale crash + Reckoning + Ghost Roll; the starvation cascade is hard to steer once begun (you can't cleanly choose who dies or when it stops).
- **Verified counter:** *deliberate Winter culling should net-negative on labor by Spring (Morale collapse + Reckoning cost) vs. adequate provisioning — mirroring the §3 overwork counter. The cruel Winter shortcut collects its debt like every other.*

**Exploit 3 — Cash-crop mono-farm + buy food:** grow only high-margin cash crops, buy all Winter food.
- Defense: cash crops are inedible (0 food value); Winter is the grain/root **scarcity peak** (§2 seasonal wave, 1.20–1.25×), so you buy food at the worst prices, and Local's volume cap means you can't even buy 80 food in a day.
- **Verified counter:** *a pure cash-crop farm's Winter food bill (bought at scarcity prices) should erase enough of its margin advantage that mixed farming is at least competitive. Monoculture must be punished by the Winter food market, not just by risk.*

**Exploit 4 — Livestock-as-food-battery:** breed livestock purely to slaughter for Winter food, skipping crops.
- Defense: livestock eat 0.5 fodder/day (fodder competes with food crops for fields + Fall labor), breed slowly, and slaughtering the herd forfeits its manure (−fertility, §1) and future breeding. A viable *supplement*, deliberately not a dominant *substitute*. *(Named explicitly per the standing rule: this is the exploit the fodder-cost and manure-loss numbers defend against.)*

**Exploit 5 — Coal summer-hoard arbitrage:** buy coal cheap in Summer, "profit" from Winter scarcity.
- Defense: fuel's seasonal wave is intentionally mild (fuel is less volatile than crops), fuel storage is capped, and — most simply — you actually need the coal to survive, so it's not free inventory to flip.

## Balancing levers

Consumption rates (farmer 1.0, clone 0.75, livestock 0.5); fuel baseline (2/day) and per-building add; wood yield (4/clone-day) and coal price (3, or 2 at Rail); food-value table (esp. cash-crop 0); cold-snap frequency (2) and fuel spike (+50%); fever duration (3–5 days) and Doc cost (20); starvation Morale rate (−15/day); cabin-fever drip (−1/day); readiness-panel start day (Fall 12); first-Winter mildness.

## Sample scenarios

### Scenario A — Normal play: Year 1, the fuel scramble

Farmer + 1 clone. Late-Fall readiness panel (Day 76): **Food 33/35 ✓-ish, Fuel 12/40 ⚠ short 28.** Four Fall days remain (household Winter food need = farmer 20 + clone 0.75×20 = 35).

- The player pulls the clone off a final wheat harvest (≈4 bushels foregone, §1) and chops wood: 4 days × 4 wood = 16 wood. Fuel now 28/40 — still short.
- Buys 6 coal (12 fuel, ~18 coin) to close the gap: fuel 40/40.
- Winter Day 12: a cold snap spikes fuel demand; the player's buffer is thin but holds. Everyone wakes on Spring Day 1.

The sacrificed wheat is the *feel* — Winter made the player give something up, and survival was the reward. **"I survived another year."**

### Scenario B — Edge/exploit: Year 4, the sell-in-Fall gambit

Min-maxer with 8 clones (a big cotton operation) tries to dodge Winter feeding: sells 5 clones to Vane in late Fall, keeps 3.

- The fire-sale marks the farm as distressed: −rep, and Vane's Spring stock (1–3) can't quickly replace 5.
- The remaining 3 clones watched the sell-off: household Morale drops into the unrest band; two throw refusal events in early Spring.
- Spring arrives labor-poor: the cotton fields can't be worked at scale, the harvest ramp is lost, and the player spends the first month clawing the workforce back at marked-up prices.

Tallied against a rival who simply provisioned 80 extra food and kept the team warm, the gambit comes out **behind** — exactly as the verified counter requires. The lesson: **the household is not a cost to shed for the season; it's the farm.**

---

# 5. The Cruelty Ledger

## Recap

The Ledger is the game's moral accounting — four axes that record how the player treats their clones, deliberately kept separate so cruelty can never collapse into a single tunable "evil number." **Morale** (visible) is the household's mood, felt in labor output. **Reputation** (visible) is how Marrow's Cross sees you. **Reckoning** (hidden) is the land's supernatural debt (full mechanics in §6). **Ghost Roll** (hidden) is not a number at all but a *named list* of the wrongly-dead. The four differ on three dimensions — visibility, timescale, and whether you can *get away with it* — and it's that divergence that makes the moral choices real instead of arithmetic.

## Numbers & formulas

### The four axes at a glance

| Axis | Visible? | Timescale / memory | Can it be "gotten away with"? | Primary effect |
|---|---|---|---|---|
| **Morale** | Visible (0–100) | Days — fast, short memory | No — the household always feels it now | Labor output (§3) |
| **Reputation** | Visible (0–100) | Seasons — slow, sticky | **Yes** — only bites if the town finds out | Prices, contracts, quests, law |
| **Reckoning** | Hidden | Lifetime+ (partial lineage carry) | No — the land always knows | Supernatural escalation (§6) |
| **Ghost Roll** | Hidden (named list) | Permanent per name (atonable) | No — but each name is individually redeemable | *Which* dead return, and where (§6) |

*(This divergence table is the whole design. A single cruel act hits several axes at different rates, on different clocks, with different escape hatches — so there is no one lever a min-maxer can zero out. Defends against the CLAUDE.md §5 "one cruelty number collapse" failure mode by construction.)*

### Axis 1 — Morale

Fully specified in §3 (0–100, starts ~60, household-wide with per-clone component, four bands, driver table). The Ledger's role: Morale is the **fast, honest** axis — it moves within days of any act and can't be hidden from the household. It recovers quickly (food, rest, festivals), so it punishes cruelty *immediately* but *forgivingly*. It is the axis that says "your workers know what you did yesterday."

### Axis 2 — Reputation

Town-facing standing, **0–100, starts ~50**. Bands:

| Band | Standing | Effects |
|---|---|---|
| 70–100 | Pillar of the community | Merchant −10% (§3); best contracts + civic honors; festival roles; marriage/heir prospects (Bess Halloway) open |
| 40–69 | Neutral | Baseline prices and access |
| 20–39 | Suspect | Merchant +25% (§3); Sheriff Coldwater watches; some NPCs cold; contract terms worsen |
| 0–19 | Pariah | Black Market becomes your main venue; active Sheriff investigations; charitable/church quests locked |

Reputation is **slow and sticky** — it moves ~±2 per relevant act and recovers only a **+1/season** passive drift toward 50. *(The slow recovery defends against: "commit a public cruelty, then buy back reputation in a week." Rebuilding standing takes seasons of visible good conduct, so a public atrocity has a long tail — unlike Morale, which a festival can repair.)*

**The exposure mechanic (information asymmetry).** Reputation only reacts to cruelty the town *learns about*. A cruelty done in the open (a public beating, a contract default) hits Reputation immediately. A cruelty done in secret (an unmarked night burial, a quiet Vat feeding) hits Reputation **only if exposed**:

- Each hidden cruel act carries a **base 15% per-season exposure chance** (a rumor via Doc Bell, a talkative clone, a Sheriff patrol).
- Exposure chance **rises +5% per additional un-exposed act** that season — the more bodies, the harder to keep quiet — and Sheriff investigation events can spike it.
- On exposure: retroactive Reputation hit (sum of the concealed acts) + possible Sheriff quest.

*(The exposure roll defends against: "route all cruelty through secrecy to dodge Reputation entirely." Secrecy *delays and gambles* the social cost — it never removes it, and scale makes concealment fail. Crucially, it does nothing to the Reckoning, which is the point of the next axis.)*

### Axis 3 — Reckoning (summary; full spec §6)

Hidden supernatural debt, **0–100, never shown as a number**. Accrues from cruelty acts (per-act point values in §6), decays slowly with time and atonement. It has the **longest memory** — it persists across a farmer's lifetime and carries partially (25%) to an heir on the same land (§6). It **cannot be hidden or gamed**, because there's no bar to watch and no secrecy that fools the land — you read it only through omens (the five tiers, §6) and Old Nan's readings. The Reckoning is the axis that says *"the town may not know, but the land does."*

### Axis 4 — The Ghost Roll

Not a scalar — a **named list** of clones who died *wrong*. An entry is added on:

- Unmarked field burial (+1 named entry, §1)
- Fed to the Vat (+1, §3)
- Worked to death (+1, §3)

An entry is **not** added by a marked grave, and is **removed** by a full funeral for that specific clone (§3). Each entry stores *who they were and where they worked/died*.

The Ghost Roll's payoff is in §6: at **Walkers** tier and above, the dead return — and *which* clone returns, *where* it goes, and *what it does* are drawn from this list. Josephine, buried unmarked in East Field (§1), walks back to *East Field*. *(This is why "naming their fields matters mechanically," per §1. The Ghost Roll defends against the ultimate abstraction exploit — treating clones as fungible units — by making the dead specific, personal, and geographically vengeful. You don't face "a haunting"; you face *her*.)*

### How one act touches the ledger (worked)

An **unmarked field burial** of a clone who died in Winter:

| Axis | Hit | Character |
|---|---|---|
| Morale | −10 household, recovers over ~1 week | Fast, visible, forgiving |
| Reputation | 0 now; 15% per-season roll to expose (then −2 to −4) | Hidden unless caught |
| Reckoning | +6 (§6), effectively permanent | Hidden, unforgiving |
| Ghost Roll | +1 entry ("her," this field) | Personal, atonable by funeral |

*Four different costs, four different clocks, from one decision. That is the system working.*

## Intended player experience

The player should feel that cruelty is never *free* and never *simple* — that each hard choice sends ripples down four channels that don't move together, so there's no clean way to "pay it off." A player should be able to *think* they're getting away with something (Morale managed, Reputation intact) while a colder debt quietly accrues out of sight. The Ledger should make players sit with their choices, not tally them.

## Four failure modes checked

### Too easy

**Risk:** A player who simply never does cruelty renders the whole Ledger inert — it becomes a system that only punishes and is trivially avoided.
- Defense: cruelty is *mechanically tempting*, not just morally available — bone-root margins (§1), Vat labor economics (§3), overwork through a labor crunch, unmarked burials to save Fall funeral-labor. The kind path is viable but pays a real efficiency tax, so most players *choose in* at least sometimes.
- Defense: the ledger is a **tension** system, not a punishment system — even a clean run feels the Whispers-tier dread (§6), so the axes are present even at zero cruelty.
- *(A fully humane playthrough keeping Reckoning near zero is an intended, valid way to play — "too easy" here means "the ledger adds nothing," and the defense is that the temptation is real, not that everyone must sin.)*

### Too hard

**Risk:** Hidden axes blindside the player — a Reckoning they couldn't see arrives and feels like a cheat.
- Defense: hidden ≠ invisible-in-effect. The tiers telegraph loudly and escalate (§6); Old Nan sells readings; the Codex (D-015) teaches thresholds to returning lineages — knowledge *is* the meta-progression.
- Defense: the two axes the player must actively manage (Morale, Reputation) are fully visible with legible drivers.

### Boring

**Risk:** Four axes feels like bookkeeping.
- Defense: only **two** are numbers on a screen (Morale, Reputation, in the Ledger tab). The other two are experienced as **story and omen** — the Ghost Roll is names, the Reckoning is weather-in-the-soul — not spreadsheet rows.
- Defense: the axes' *divergence* creates drama (managing a mutiny while the land's debt climbs unseen), which is the opposite of rote.

### Exploitable

**Exploit 1 — Secret-cruelty laundering:** do all cruelty in secret to dodge Reputation.
- Defense: exposure rolls (rising with scale) + the Reckoning's total indifference to secrecy.
- **Verified counter:** *a secret-cruelty strategy may hold Reputation near baseline through good luck, but accrues Reckoning at the full public rate; since Reckoning Proper (§6) is unavoidable by concealment, secrecy delays the social bill and never touches the supernatural one. Hiding buys time, not absolution.*

**Exploit 2 — Sin-and-confess:** run heavy cruelty, then full-funeral / Preacher-cleanse the Ledger back to clean and repeat.
- Defense: funerals cost 40 coin + a whole-household rest day each (§3); atonement has hard diminishing returns within a season (§6); and Ghost Roll damage that already occurred (a walker that already blighted a field) is not undone by later atonement.
- **Verified counter:** *the coin+labor cost of atoning for an industrial-cruelty phase should exceed that phase's gains (mirroring §1/§3/§4). No profitable sin-and-confess loop exists — confession is real relief, but priced above the sin.*

**Exploit 3 — Morale-gate through cruelty:** keep the household just productive enough via festivals/food while running cruelty, ignoring the hidden axes because they're invisible.
- Defense: this *works* on Morale and *is exactly the trap* — Reckoning and Ghost Roll are untouched by Morale management and collect later (§6). The game *wants* a careless player to try this once; the horror payoff is the lesson. Telegraphing (omens, Old Nan) gives an attentive player the chance to notice. *(Not fully "defended against" — it's the intended cautionary arc, flagged here so the balance model treats the Reckoning trajectory, not Morale, as the true cost meter.)*

**Exploit 4 — Save-scum to read hidden values.**
- Defense: seeded PRNG (§1); reloading a day yields the same rolls and never surfaces the hidden numbers.

## Balancing levers

Reputation band thresholds and effects; Reputation act-magnitude (±2) and passive recovery (+1/season); exposure base chance (15%/season) and per-act escalation (+5%); the per-act ledger-hit table (esp. the Morale-vs-Reckoning split); Ghost Roll add/remove triggers. (Reckoning point values and decay live in §6.)

## Sample scenarios

### Scenario A — Normal play: the honest burial

Year 2, a clone (Marta, Frail) dies of Winter fever despite Doc Bell's treatment. The player chooses a **marked grave** (plot + 0.3 clone-day):

- Morale: −6 (a death is felt) but **+2** for the respect — nets mild, recovers by Spring.
- Reputation: unaffected (nothing to hide).
- Reckoning: −small (a respectful death eases the land).
- Ghost Roll: **no entry** — Marta rests.

The humane default costs a little labor and coin and closes the book. The Ledger rewards decency without fanfare — exactly the baseline it should establish.

### Scenario B — Edge/exploit: the man who thought he got away with it

A player runs a quiet cruelty operation across Years 2–3: three unmarked night burials (to save funeral-labor and taint a field for bone-root, §1), all Morale dips patched with festivals and good food.

- **Visible ledger looks clean:** Morale sits at 64 (festival-managed); Reputation holds at 48 (exposure rolls came up lucky — the town never learned).
- **Hidden ledger is filling:** Reckoning has climbed unseen through Warnings into Walkers (§6); the Ghost Roll holds three names.
- Then Walkers manifests: the three return, by name, to their fields. The bone-root the player buried Josephine to grow is blighted by Josephine. The "clean" farm was never clean — it was *unaudited*.

The player learns the lesson the four-axis design exists to teach: **you can fool Marrow's Cross, but the land keeps its own books.** *This is the game.*

---

# 6. The Reckoning Meter

## Recap

The Reckoning is the hidden supernatural debt the Ledger (§5) has been feeding — a 0–100 value the player never sees as a number, only reads through escalating omens across five tiers: **Whispers → Warnings → Walkers → The Long Vigil Fails → The Reckoning Proper** (D-017). It accrues from cruelty, decays slowly with time and atonement (at diminishing returns), degrades farming as it climbs (the `reckoning_mult` from §1), and — at Walkers and above — turns the Ghost Roll's named dead loose on the fields where they died. It is the axis that cannot be hidden from or bought off cheaply, the land's long, patient collection. Crossing into the Proper ends the run by curse (land-loss, D-007).

## Numbers & formulas

### Accrual (hidden 0–100)

| Source | Reckoning | Cross-ref |
|---|---|---|
| Baseline land-weirdness | +0.1/day | The land is strange regardless; keeps even kind runs *aware* |
| Sustained overwork (household, per season) | +2 | §3 |
| Bone-root harvest (per field) | +4 | §1 |
| Sell corpse to Vane | +3 | §3 |
| Unmarked field burial | +6 | §1, §5 |
| Fed corpse to the Vat | +6 | §3 |
| Vat operating (standing drip, while active) | +0.5/day | §3 |
| Worked a clone to death | +8 | §3 |
| Dark ritual event resolved | +10 | §9 |

*(The baseline +0.1/day is deliberately tiny — over a full 80-day year it's +8, which the passive decay below (−2/season = −8/year) exactly offsets, so a kind player parks permanently at the Whispers floor. It exists only so the system is never fully *absent*. Defends against: "a clean run experiences no reckoning content at all," which would waste the game's central mood.)*

### Decay & atonement

| Path | Reckoning relief | Cost |
|---|---|---|
| Time (passive) | −2/season | none (only if cruelty stops) |
| Full funeral | −8 (first act) | 40 coin + 1 rest day (§3) |
| Preacher Grange cleansing | −5 (first act) | 50 coin + relationship (§1) |
| Old Nan folk-rite | −10 (first act) | relationship; "she notes what you did" (§1) |

**Diminishing returns (anti-launder):** each atonement act *after the first in the same season* is **50% as effective** as the last. Funeral five clones in one season and you get −8, −4, −2, −1, −0.5 = −15.5, not −40 — at a cost of 200 coin and five lost workdays.

*(This decay curve defends against the sin-and-confess exploit named in §5. The first atonement each season is meaningful; bulk atonement is deliberately inefficient, so you cannot launder a lifetime of cruelty in one guilty Sabbath. The verified counter in §5 depends on exactly this curve.)*

### The five tiers

| Tier | Reckoning | `reckoning_mult` (§1) | Manifestations |
|---|---|---|---|
| **Whispers** | 0–24 | 1.00 | Ambient only — crows, sour dreams, a cold spot in the barn. No mechanical penalty. Establishes the mood and teaches that the system is *there*. |
| **Warnings** | 25–54 | 0.95 | Omens with teeth — milk sours, isolated small crop failures, a clone's night terrors (−Morale). Old Nan begins to comment; the Preacher's sermons darken. |
| **Walkers** | 55–79 | 0.85 | **The dead walk.** Ghost Roll clones return at night, by name, to their fields (§5): sabotage, fear events (−Morale household), occasionally a living clone is *taken*. |
| **The Long Vigil Fails** | 80–94 | 0.70 | The church rite that held the land falters. Widespread blight, multiple simultaneous walkers, livestock found dead, taint (§1) spreading on its own. |
| **The Reckoning Proper** | 95–100 | 0.50 | The land collects in full — cascading catastrophe. The run is almost certainly ending: land-loss by curse (D-007). |

*(Thresholds are set to match §1's two anchor points — 45 reads as Warnings, ~60 as Walkers. The `reckoning_mult` degradation is a **gentle staircase (−0.05, −0.10, −0.15, −0.20)**, not a cliff — defends against "too hard: crossing a line instantly wrecks the farm." Each tier is a worsening weather, not a trapdoor.)*

### Reading the hidden meter

The player never sees the number, but the tier is **always inferable**:

- **Omens** escalate distinctly per tier — the content itself is the gauge.
- **Old Nan** sells a qualitative reading for coin/relationship ("The land is restless" ≈ Warnings; "The land is hungry" ≈ Walkers).
- **The Preacher's** sermons and the **Long Vigil** rite's health track it.
- **The Codex** (D-015, persists across lineages) records what each omen meant — so knowledge accumulates across runs. Learning to read the land *is* the meta-progression.

### Across the lineage (meta)

When a farmer dies or the run ends short of the Proper and an heir continues on the **same land**, the heir inherits **25% of accrued Reckoning** — the land remembers even a new name. A wholly **new lineage on new land starts at 0**. *(Defends against: "die/retire the farmer to wipe the Reckoning and resume cruelty fresh." Succession launders only 75% of the debt, and only by paying the price of a generational transition — so cruelty is a multi-generational mortgage, which is the thematic spine: *the land itself remembers.*)*

## Intended player experience

The Reckoning should feel like a **barometer you can't read directly but can always feel** — a pressure that builds behind the weather. A kind player should feel its Whispers as atmosphere and be grateful never to learn what's underneath. A cruel player should feel the slow, dawning horror of a debt with no visible balance, then the specific, personal dread of the named dead walking back to the rows they once tended. It should never feel arbitrary — every omen is earned — and the descent should be *recoverable right up until it isn't.*

## Four failure modes checked

### Too easy

**Risk:** A kind player never triggers anything past Whispers, so the marquee system is dormant for them.
- Defense: Whispers-tier ambient dread ships to *every* run, so the mood is always present.
- Defense: the mechanical temptations (§1 bone-root, §3 Vat, labor crunches) mean most players brush Warnings at least once — the system activates through ordinary desperation, not just villainy.

### Too hard

**Risk:** A player crosses into Walkers/Vigil Fails and death-spirals with no way back.
- Defense: the `reckoning_mult` staircase is gradual (0.95→0.85→0.70), so entering a tier bends the farm, doesn't break it.
- Defense: atonement paths exist at *every* tier, and the tiers telegraph for seasons before the Proper — the Year-4 "The Vigil Breaks" Season Arc (§13) is literally built around pulling back from Walkers.
- **Verified counter:** *a player who halts all cruelty at the onset of Walkers (55) and atones actively should fall back to Warnings within ~2 years. The brink (Walkers/Vigil Fails) is recoverable; only the Proper (95+) is terminal. The system must always offer a road back until the very end.*

### Boring

**Risk:** A hidden number I can't see is just free-floating anxiety with no agency.
- Defense: agency lives in the *visible choices* that feed it (every cruelty is a legible decision) and the *visible acts* that reduce it (funeral, Preacher, Old Nan).
- Defense: the meter is expressed as **events and named hauntings**, not a status bar — it generates content, not dread-without-play. Old Nan converts coin into as much visibility as the player wants.

### Exploitable

**Exploit 1 — Burst-and-atone:** extract a fast cruelty windfall (a bone-root season, a Vat labor surge), then atone the Reckoning back down before it bites.
- Defense: diminishing-returns atonement + funeral coin/labor cost + the fact that any Walkers damage already inflicted (a blighted field, a taken clone) is permanent — atonement lowers the meter, not the scars.
- **Verified counter:** *the atonement cost to unwind an aggressive cruelty burst should exceed the burst's gains (consistent with §1/§3/§4/§5). Reckoning can be paid down, never paid off at a profit.*

**Exploit 2 — Ignore-the-invisible:** feed the Vat all Winter for cheap labor, betting the hidden meter won't bite in time.
- Defense: omens telegraph; Old Nan warns; the Codex teaches. But — as in §5 Exploit 3 — this is partly **the intended trap**: the game wants a careless cruel player to get burned by it once. Flagged so the balance model scores the *Reckoning trajectory* as the real cost, not the (cheap, healthy-looking) Winter labor line.

**Exploit 3 — Succession wipe:** retire/kill the farmer to reset the Reckoning and resume cruelty on a clean slate.
- Defense: 25% inheritance on the same land + the real cost of a generational transition (lost momentum, heir's weaker starting position).
- **Verified counter:** *succession should never be a net-positive Reckoning-laundering move — the 75% relief must be worth less than the transition costs it forces, so "farm it dirty, hand it off, repeat" underperforms simply not accruing the debt.*

**Exploit 4 — Save-scum the omens.** Seeded PRNG (§1); reloading reproduces the same rolls and never exposes the number.

## Balancing levers

Per-act accrual point values (esp. death +8, unmarked burial +6, Vat drip +0.5/day); passive decay (−2/season) and baseline drip (+0.1/day); atonement magnitudes and the diminishing-returns rate (50%/act); the five tier thresholds (24/54/79/94/95) and their `reckoning_mult` staircase; lineage inheritance fraction (25%); Old Nan reading cost/precision.

## Sample scenarios

### Scenario A — Normal play: a hard year, and back from the edge

Year 2 goes badly: two clones die of Winter fever, and to save funeral-labor during the Fall scramble the player buries both unmarked (+6 each → Reckoning ~14, plus the year's baseline → into low **Warnings**, ~26).

- Warnings manifests: milk sours; a surviving clone, Tom, wakes screaming (−Morale). Old Nan, asked, says "the land's grown restless — you've put something down wrong."
- The player course-corrects: one late full funeral (−8), fallows and Preacher-cleanses the tainted field (−5), and simply stops. Passive decay (−2/season) does the rest.
- By mid-Year 3, Reckoning has drifted back into **Whispers**. The omens quiet.

Tension raised, agency exercised, recovery earned — the system's intended loop for the ordinary player who slips once.

### Scenario B — Edge/exploit: the Vat baron, seen from the land's side

The §3 Vat baron, viewed through this meter. The corpse loop runs from Year 2:

- Y2 spring–summer: unmarked burials (+6), Vat feedings (+6), the standing Vat drip (+0.5/day), a bone-root field (+4) — Reckoning climbs past 25 (**Warnings**) by mid-Y2, past 55 (**Walkers**) by Y2's end. `reckoning_mult` slips to 0.85; harvests quietly shrink.
- **Walkers:** Josephine returns, by name, to East Field and blights the very bone-root her burial enabled (§1). Two more names follow. Household Morale (already low from §3's overwork) craters under fear events; a living clone is taken.
- The baron panics and atones — funerals all round — but diminishing returns (−8, −4, −2…) plus 200 coin and a week of lost labor claw Reckoning down only into high Warnings, while the walkers' damage stands. The next cruel Winter, run to stay solvent, tips it to **The Long Vigil Fails** (0.70 mult): fields fail broadly, taint spreads on its own.
- Year 4: **The Reckoning Proper.** The land is lost to the curse (D-007). The run ends.

Every verified counter holds — the burst couldn't be atoned at a profit, the succession wipe wasn't reached, the hidden axis was the one that collected. *This is the game.*

---

# 7. Contract System

## Recap

Contracts are forward agreements that trade **flexibility for certainty** — the player commits fields and labor now to deliver a set quantity at a locked price later, insulating against a market crash at the cost of forfeiting a spike and living or dying by the weather. §2 established the spot mechanics (deposit, default penalty, partial delivery); this section builds out the full system: contract *types* (Regional supply, Mayor Halloway's civic works, standing recurring deals, rush contracts spawned by demand shocks, and Black Market runs), how offers are gated by Reputation (§5), and the one rep-gated hardship valve that keeps a single bad storm from ending a run. The governing rule: contracts lower income *variance*, they never beat spot on income *mean*.

## Numbers & formulas

### Contract types

| Type | Source | Terms | Pays in | Notes |
|---|---|---|---|---|
| **Crop supply** | Regional Buyers (§2) | 10–50 units, deadline 20–60 days, locked 1.05–1.20× spot | Coin | The staple. 2–3 offers rotate per buyer visit (every 5 days). |
| **Civic** | Mayor Halloway | Town need (grain for winter stores, timber for a public work), 15–40 units | Coin **+ Reputation** (+2 to +4) | 1–2 per season, tied to town calendar/festivals. Sometimes non-crop. |
| **Standing (recurring)** | Regional / Rail, mid-game | X units *per season* for 1 year at fixed price | Coin | Stability locked in; flexibility locked out. Higher default stakes. |
| **Rush** | Spawned by demand-shock events (§2, §9) | Tight deadline (10–20 days), premium 1.30–1.50× | Coin | High-risk opportunity card; default penalty 1.5× normal. |
| **Black Market** | Fence / Ambrose, low rep only | Contraband & Weird crops (bone-root, moon barley) | Coin | Each is a −Reputation & +Reckoning liability (§5/§6). |

### Contract pricing

- **Locked price** = spot-at-signing × premium. Premium rises with deadline distance (the buyer pays you to carry the risk further out) and with rush urgency: near-term supply ~1.05×, far-term ~1.20×, rush 1.30–1.50×. *(Defends against: "contracts are strictly better than spot." The premium is the buyer's price for *their* certainty; you pay it back by forfeiting any upside if spot rises — see the too-easy verified counter.)*
- **Deposit** = 20% of contract value, posted at signing, refunded on delivery (§2). *(Defends against: over-signing — every open contract ties up working capital.)*
- **Reputation gate:** civic and premium Regional contracts require rep ≥40; the best standing contracts require rep ≥70; Pariah (<20) is locked to Black Market only (§5). *(Defends against: cruelty having no market consequence — a low-rep farm is cut off from the stable, high-quality contract economy and pushed toward the liability-laden Black Market.)*

### Offer generation

Regional shows **2–3 offers** at a time, refreshing on the 5-day buyer cycle; offer *quality* (size, premium, deadline slack) scales with Reputation. Civic offers appear **1–2 per season**. Rush offers piggyback on demand-shock events (~1 active shock at a time, §2). *(The finite, rep-scaled offer flow defends against "always have a perfect contract available to lock every crop" — you take the deals on the table, not the deals you wish for.)*

### Fulfillment

- **Deliver** the contracted units at the venue by the deadline. **Partial** allowed: pro-rated pay, deposit forfeit and rep hit scale with the shortfall (§2).
- **Over-delivery:** the buyer takes only the contracted quantity at the locked price; surplus is yours to sell at spot or hold. *(This makes a contract a clean *floor on part of your crop* — an intended, healthy use, not an exploit.)*
- **Early delivery:** allowed; a reliable early fill grants **+1 rep** (the buyer values dependability).
- **Reputation gain is capped:** contract deliveries grant at most **+2 rep/season**, and only contracts **≥15 units** count. *(Defends against: micro-contract rep-farming — signing a flurry of tiny trivial contracts just to grind Reputation. Small busywork deals give negligible standing.)*

### Default & the hardship valve

- **Full default** (zero delivery): forfeit deposit + **−15 rep** + that buyer offers no new contracts for **1 year** (§2). Rush defaults are ×1.5 (−22 rep).
- **Hardship appeal:** a player with rep ≥60 may, **once per ~3 years**, invoke a relationship-based appeal (via the Mayor or the specific buyer) to halve one default's penalty — representing standing in the community, not a loophole. *(Defends against two things at once: without it, one confirmed-disaster crop loss could cascade into an unrecoverable default — "too hard." *With* it made automatic-on-disaster, players would sign reckless contracts hoping for a bailout — so it is deliberately **rare, rep-gated, and manual**, a finite favor you spend, not a standing insurance policy.)*

## Intended player experience

Signing a contract should feel like **making a promise you're not certain you can keep** — a considered bet on your own fields and the sky. The security should be genuinely comforting (a locked price through a crashing market is a lifeline) and the exposure genuinely frightening (a hailstorm three days before a deadline should make the player's stomach drop). A well-judged contract book — enough to stabilize income, not so much that one storm sinks you — should feel like the mark of a canny farmer.

## Four failure modes checked

### Too easy

**Risk:** Contracts are free stability — always sign the maximum and never worry about the market again.
- Defense: deposit lockup (capital), default risk (weather), forfeited spot upside, and committed fields/labor all bound how much you *should* sign.
- **Verified counter:** *a fully-contracted season should be lower-*variance* but NOT higher-*mean* than spot-selling the same crop. Contracts trade expected value for certainty; averaged over many seasons and price outcomes, the contracted farmer earns slightly less than the skilled spot-seller and much less than a lucky one. Certainty is a product you buy, not free money.*

### Too hard

**Risk:** One weather event wrecks a contracted crop and cascades into a run-ending default.
- Defense: partial delivery softens the cliff; weather is forecast (§2/§10) enabling emergency harvest; deadlines carry slack; the hardship valve exists for the genuinely unlucky high-rep player.
- Defense: the first contracts a new player is offered are small and near-deadline (low-risk), scaling up only as rep and evident capacity grow.
- **Verified counter:** *a single average-severity weather event should not, by itself, turn a reasonably-provisioned contract into an unrecoverable default — partial delivery + one hardship appeal must be able to absorb it. Ruin requires either over-committing or ignoring the forecast.*

### Boring

**Risk:** Contracts are just a menu you click "accept" on.
- Defense: the sign/pass decision is a live synthesis of weather forecast, market outlook, and current labor/field capacity — never a rote yes.
- Defense: rush contracts are dramatic timed opportunity cards; civic contracts thread into the town's story and festivals (§12/§13).

### Exploitable

**Exploit 1 — Sign-and-default gaming:** treat contracts as free price-floors, defaulting whenever spot rises above the lock.
- Defense: §2's mechanics; re-verified here.
- **Verified counter (from §2, restated):** *defaulting to chase spot is net-negative in >90% of price outcomes once the forfeited deposit, −15 rep, and 1-year buyer freeze are counted against the locked-vs-spot gap. The lock already sits above signing-spot, so the spike must be large AND outrun the deposit loss — rare, and rep/freeze usually tip it negative anyway.*

**Exploit 2 — Contract stacking across sources:** sign Regional + civic + rush simultaneously to guarantee the whole season's income.
- Defense: total deposit lockup + total committed fields/labor cannot exceed your production capacity — you can only promise what you can grow and harvest.
- **Verified counter:** *aggregate contracted volume that exceeds a player's realistic harvest-and-labor capacity should be a losing position: the deposits starve working capital, and any shortfall triggers multiple simultaneous defaults. The binding limit on contracting is production, not the number of offers on the table.*

**Exploit 3 — Winter-deadline storage dodge:** sign a Winter-deliverable contract, harvest in Fall, store, deliver risk-free.
- Defense: the contract premium already prices the time; storing for a Winter deadline occupies cellar space you need for food (§4) and exposes the lot to spoilage events (§9); storage life caps which crops can even make the trip (§1). A legitimate tactic, deliberately not a free one.

**Exploit 4 — Hardship-appeal abuse:** sign recklessly, plan to invoke the appeal.
- Defense: rep ≥60 gate + once-per-~3-years + it only *halves* one penalty. It rescues a genuine disaster once; it cannot underwrite a habit. *(This is the number the rarity/cooldown defends against directly.)*

## Balancing levers

Contract size range (10–50); premium curve (1.05–1.50× by deadline/urgency); deposit (20%); rep gates (40/70; Pariah→Black Market); offer counts (2–3 Regional / 1–2 civic per season) and rep-scaling; rep-gain cap (+2/season) and size threshold (≥15 units); default penalties (−15, rush ×1.5); hardship-appeal gate (rep ≥60), cooldown (~3 years), and relief (×0.5).

## Sample scenarios

### Scenario A — Normal play: riding a demand shock with a contract

Year 3. A "Rail crews need tobacco" demand shock hits (tobacco +0.60 for 40 days, §2). Spot tobacco jumps from 15 to ~24. The player, who has two Summer tobacco fields maturing, signs a Regional supply contract: **20 units at 26/unit** (1.08× the shocked spot), deadline Fall Day 50, deposit ~104 coin.

- The lock protects against the shock *ending* before harvest (which it does, on Day 40 — spot falls back to 16).
- Player delivers 20 on Day 46, is paid 20 × 26 = 520 coin, deposit refunded, +1 rep for the on-time fill. Surplus 4 units sell at spot.

Because they *locked the shocked price*, they banked the spike a spot-seller would have watched evaporate. Contracts used as intended: certainty purchased at exactly the right moment.

### Scenario B — Edge/exploit: the over-stacked book

A player tries to guarantee a whole season: signs a Regional cotton contract (25 units), a civic grain contract (20 units), and a rush hops contract (15 units) — 60 units committed across three crops, ~180 coin in deposits locked. Realistic capacity given fields + clone-days is ~45 units.

- The deposit lockup immediately starves mid-Summer cash; the player can't buy a needed clone, worsening the labor shortfall.
- A single hailstorm (Day 45) clips the cotton. Now short on two of three contracts.
- Player burns the **hardship appeal** on the civic default (halving −15 to −8 rep) but still fully defaults the rush hops (−22 rep, deposit gone) and partial-delivers cotton.
- Net: rep in the Suspect band, deposits largely forfeited, a worse position than if they'd signed *one* contract sized to capacity.

The production cap — not the offer sheet — was the real limit all along. The stacking exploit collapses exactly where the verified counter says it should.

---

# 8. Building & Construction

## Recap

The homestead is a static 2D diorama (D-009) whose buildings unlock and scale the player's capabilities — housing more clones, storing more crop, sheltering against Winter, enabling livestock, and (darkly) growing clones in the Vat or (gently) easing the land at a Shrine. Construction spends coin **plus materials plus committed clone-labor plus calendar days**, and cannot happen in frozen Winter — so every building competes directly with the harvest for the same hands in the same warm seasons. What you build, and in what order, is one of the clearest expressions of a playstyle.

## Numbers & formulas

### Building table (MVP set)

| Building | Coin | Materials | Clone-days | Effect |
|---|---|---|---|---|
| **Lean-to** (starting) | — | — | — | Houses 2 clones |
| **Bunkhouse** | 80 | 20 wood | 6 | Houses 5; −0.5 Winter fuel/day; +one-time Morale |
| **Longhouse** | 200 | 40 wood + 15 stone | 12 | Houses 10; −1.0 Winter fuel/day |
| **Barn** | 120 | 30 wood | 8 | Enables livestock → manure (§1) + food reserve (§4) |
| **Cellar / Granary I** | 60 | 15 wood + 10 stone | 5 | +50% crop storage life; raises storage cap (§1/§2) |
| **Cellar II** | 140 | 25 wood + 20 stone | 8 | +100% storage life; large cap |
| **Well / Cistern** | 90 | 20 stone | 6 | Drought weather-mult 0.70 → 0.90 (§1) |
| **Smokehouse** | 70 | 15 wood + 5 stone | 4 | Preserves meat (extends livestock-food storage, §4) |
| **Woodshed / Coal store** | 40 | 12 wood | 3 | Raises fuel storage cap (§4) |
| **Fences** (per field) | 15 | 8 wood | 2 | Wildlife crop loss 20% → 5% (§1) |
| **The Vat** | 300 | 30 wood + 20 stone | 15 | Grows clones (§3); standing +Reckoning drip (§6) |
| **Shrine** | 50 | 10 wood | 3 | +1/season extra Reckoning decay (§6); +Morale for *devout* clones (§3) |
| **Clear new field** (small) | 20 | — | 8 | +1 field (practical cap applies below) |

### Materials

- **Wood:** from Fall chopping (1 clone-day → 4 wood, §4) or bought (~2 coin/unit). Labor-not-coin path.
- **Stone:** bought (~4 coin/unit) or quarried by labor (1 clone-day → 3 stone). The gate on bigger builds.
- Materials **do not spoil** — they can be stockpiled ahead of a build. *(This is intentional and not an exploit: the binding constraint on construction is labor + warm-season days, not material timing, so letting materials bank simply lets a player prepare. See exploits.)*

### Construction rules

- A build consumes its clone-days **spread over consecutive days** (a 12-clone-day Longhouse with 2 clones assigned = 6 real days those clones aren't farming). *(This opportunity cost is the core tension — defends against "building is free progress"; every build-day is a not-harvest day.)*
- **No construction in Winter** (frozen ground). Builds happen Spring–Fall only. *(Defends against: "use idle Winter to build everything at no harvest cost" — construction is deliberately forced into competition with the growing season.)*
- **Demolition** recovers only **~25% of materials** and **no coin**. *(Defends against: any build-then-teardown refund loop — there is no profit in cycling structures.)*

### Field expansion & the practical cap

Start with **3 small fields**. Each new field is a **major labor project (8 clone-days + 20 coin)** to clear (from §1's "expansion capped at 2–3 fields at start, +1 per major labor project"). There is **no hard field cap**, but a **practical cap**: you cannot productively work more fields than your clone-days cover (a field needs tending + harvest labor, §1/§3), and every clone needs housing (§4) and Winter food. *(Defends against: "clear twenty fields and overwhelm the economy" — unworked fields are dead capital; the labor + housing + food chain caps useful farm size organically, no arbitrary limit needed.)*

## Intended player experience

The player should feel the homestead **growing under their hands, slowly and at cost** — that the barn raised in Year 2 or the cellar that finally let them play the market are hard-won landmarks, not menu purchases. Build order should feel like a statement of intent: the player who raises a Longhouse and a Vat is building a different farm — and a different soul — than the one who raises a Barn and a Shrine.

## Four failure modes checked

### Too easy

**Risk:** Rush the Longhouse + Vat early and snowball labor into a runaway lead.
- Defense: coin + materials + clone-days + the no-Winter-building rule pace construction; clones building are clones not farming; the Vat adds a Reckoning drip (§6).
- **Verified counter:** *front-loading heavy construction in Year 1 should starve that year's harvest and Winter stores badly enough to be a mistake. Major building is a Year-2+ investment funded by farming surplus — the economy should punish a player who builds before they can feed the builders.*

### Too hard

**Risk:** The player can never afford buildings and the farm stalls.
- Defense: cheap early structures (Woodshed 40, Shrine 50, Cellar I 60, Fences 15/field) give incremental wins; the wood path lets a coin-poor / labor-rich player build with sweat instead of coin.
- Defense: buildings are **accelerators, not survival requirements** — the only near-required project is clearing a field or two, which is cheap. A player can survive many years in the starting footprint.

### Boring

**Risk:** Construction is just spend-and-wait.
- Defense: *what to build next* is a genuine strategic fork — housing to scale labor, Cellar to unlock market timing (§2), Vat to industrialize (§3/§6), Shrine to stay clean, Well to de-risk drought. Limited warm-season build-days force prioritization every year.
- Defense: build order visibly reshapes the diorama — progress you can see.

### Exploitable

**Exploit 1 — Cruelty-funded early snowball:** run a Year-1 bone-root/cruelty windfall to fund a Vat + Longhouse and industrialize immediately.
- Defense: the windfall requires cruelty (Reckoning + Ghost Roll), the Vat compounds it, and the construction labor cannibalizes Year-1 food.
- **Verified counter:** *an early cruelty-funded construction snowball should collide with both the Winter food crunch (builders aren't farming) and the self-terminating Reckoning trajectory (§3/§6) — landing the player in Warnings/Walkers with thin stores, a worse Year-2 position than steady growth.*

**Exploit 2 — Overcrowd housing to skip a build:** cram 8 clones into a 5-cap Bunkhouse instead of raising the Longhouse.
- Defense: overcrowding penalty — clones above cap suffer **−Morale and elevated Winter illness** (§4), which costs more labor than the Longhouse's build cost saves. *(This penalty is precisely the number defending against under-housing to dodge construction.)*
- **Verified counter:** *running a workforce over its housing cap should yield less net labor (via Morale + illness losses) than housing it properly — so "skip the build, pack them in" is a false economy.*

**Exploit 3 — Build-then-demolish refund cycling.**
- Defense: 25% material recovery, zero coin — every teardown is a net loss. No loop exists.

**Exploit 4 — Material pre-hoard to burst-build.**
- Defense: allowed and harmless — materials don't spoil, but you still pay the clone-days and warm-season days at build time, which are the real constraints. Pre-buying stone just front-loads the coin; it doesn't dodge the labor/season gate.

## Balancing levers

The full building cost table (coin / materials / clone-days) and effects; wood & stone yields (4/clone-day, 3/clone-day) and buy prices (~2, ~4); the no-Winter-building rule; demolition recovery (25%); field-clearing cost (8 clone-days + 20 coin); overcrowding Morale/illness penalty; the Vat's Reckoning drip and the Shrine's decay bonus (the dark/light construction pair).

## Sample scenarios

### Scenario A — Normal play: the Year-2 build fork

After a solid Year 1, the player has ~150 surplus coin and 30 stockpiled wood entering Spring Year 2. The fork: **(a)** a 4th clone (110 coin, more labor now) vs. **(b)** Cellar I (60 coin + materials, unlocking Winter-scarcity market timing, §2) plus Fences on the two best fields (30 coin, cutting wildlife loss).

- They choose **(b)**: the Cellar lets them store this year's grain to the Winter price peak, and the Fences stop the wildlife nibble that cost them a field last year.
- The build costs 7 clone-days across late Spring — a slightly lighter planting — but pays back within the year.

A clean expression of the intended loop: farming surplus reinvested into infrastructure that compounds, weighed honestly against more hands.

### Scenario B — Edge/exploit: the Year-1 Vat rush

A player tries to skip ahead: a cruel Year-1 bone-root windfall (unmarked burial to taint a field, §1) funds a Vat by late Fall Year 1 (300 coin + 15 clone-days).

- Those 15 clone-days came out of Fall harvest and wood-chopping. Winter Readiness (§4) reads dangerously short on both food and fuel.
- The cruelty already pushed Reckoning into Warnings (§6); the Vat's drip keeps it climbing.
- Winter Year 1 is a knife-edge: the player slaughters livestock to eat and barely survives, entering Year 2 with a Vat but no herd, thin Morale, and a haunted field.

Against a steady player who built nothing and banked a comfortable Winter, the rusher is *behind* — exactly what the front-load and overcrowding counters predict. The Vat is a Year-2+ instrument; reaching for it early is the trap.

---

# 9. Events & Probability

## Recap

Events are the game's texture and its teeth — the draw engine that produces demand shocks (§2), weather (§10), pests, wildlife, town happenings, personal clone dramas, and the reckoning's hauntings (§6), all resolved through one universal choice-card grammar (D-016). Its job is pacing as much as content: it must keep quiet, snackable days *and* spikes of crisis, telegraph danger fairly, never blindside a healthy run, and resist save-scumming — all from a pool of ~120 cards at MVP (400+ by year one). This section specifies the *engine* — how often events fire, which family is drawn, how severe, and how the card resolves — that every other system's events plug into.

## Numbers & formulas

### The daily draw & the pressure pacer

Each day the engine rolls whether an event fires, using a self-correcting **pressure** value that prevents both dead stretches and pile-ups:

```
event_chance(day) = base_rate + pressure
  base_rate = 0.30
  pressure  += 0.10 for each consecutive quiet day; resets to 0 when any event fires
```

So a run of quiet days climbs 0.30 → 0.40 → 0.50 → 0.60 → ~guaranteed, then discharges. *(Defends against: "boring — long stretches of tap-advance," the CLAUDE.md pacing concern. Also preserves quiet days for the 2–4 min snackable session — not every day is loud.)*

A hard ceiling caps intensity: **no more than 2 *major*-or-higher events in any rolling 3-day window** (minor/flavor exempt). *(Defends against: "too hard — a random pile-up of disasters ends the run through sheer density.")*

### Family weighting (which event, when one fires)

| Family | Base weight | Key modifiers |
|---|---|---|
| Weather | 25 | +in transitional seasons (§10) |
| Opportunities | 18 | source of demand-shock & rush-contract cards (§2/§7) |
| Town | 15 | +near festivals (§12); scales with Reputation |
| Pests | 12 | +Summer; **+on monoculture fields** (ties to §1 rotation) |
| Personal | 12 | scales with roster size & low Morale (§3) |
| Wildlife | 10 | **+on unfenced fields** (§8); +Fall |
| Reckoning | 8 + tier bonus | **tier bonus = 0 / 10 / 30 / 50 / 70** for Whispers→Proper (§6) |

*(The dynamic Reckoning weight is the mechanical face of the tiers: near-invisible at Whispers, it crowds out mundane events at Walkers+ — the world itself curdling around a cruel farm. Defends against "the Reckoning is just a farming debuff" — at high tiers it visibly hijacks the event stream.)*

Anti-repetition: a card that fired is **weight-suppressed for its next 12 draws**, and families rotate so the same family rarely fires twice running. *(Defends against: "events feel same-y" — recency suppression + a 120→400 card pool keep the stream fresh.)*

### Severity classes

| Class | Share | Nature |
|---|---|---|
| Flavor | ~30% | No mechanical effect — mood/story; dismissable |
| Minor | ~45% | Small resource swing; single choice or auto-resolve |
| Major | ~20% | Real stakes; 2–4 option choice card |
| Crisis | ~5% | Run-threatening; **state-gated** (only fires when the player is *already* in the relevant danger) |

*(Crisis gating is the load-bearing fairness rule: a cold-snap crisis can only fire if fuel is low (§4); a foreclosure crisis only if the mortgage is unpaid (§13); a Walker attack only at Walkers+ (§6). Defends against "too hard — a bolt-from-the-blue crisis kills a healthy run." Crises escalate existing vulnerabilities; they don't invent them.)*

### The choice-card grammar (D-016, universal)

Every interactive event is one card: title + ink illustration + a 1–3 sentence prompt (alt-1800s voice, §Working Conventions) + **2–4 options**. Each option carries a requirement/cost (coin, clone-days, item, relationship, rep), an outcome (deterministic or a seeded roll), and any ledger effects (§5). Options may be **state-gated** (greyed unless you have ≥X coin, a Grower, Old Nan's favor, etc.).

- **Ignoring a Major auto-resolves to its worst option** (an untreated pest event spreads). *(Defends against: "skip every event risk-free" — disengagement has a price. Flavor/Minor may be freely dismissed.)*
- **Outcome odds show as qualitative bands** ("long odds," "a fair chance," "likely") over exact hidden probabilities; exact numbers unlock via the Almanac (§2) or Old Nan. *(Keeps it mobile-legible and non-spreadsheet — matches §2's Rumored/Reported/Confirmed tiers — while rewarding investment for players who want the decimals.)*

### Determinism

The event schedule *and* each option's roll are seeded (D-021, §1). Reloading a day reproduces the same card; picking the same option reproduces the same result — only a *different choice* yields a different outcome. *(Defends against: save-scum reroll farming. Re-references §1.)*

## Intended player experience

Days should have **weather in the dramatic sense** — a rhythm of calm and squall. Quiet mornings should feel earned, not empty, and a Major card should land with a small jolt: a real decision, in the game's voice, with no free-lunch option. Over a season the player should feel *managed by a fair hand* — never safe, never cheated.

## Four failure modes checked

### Too easy
**Risk:** Players optimize every card into pure upside.
- Defense: most Major cards are genuine tradeoffs or lose-less choices, not free gifts; Crisis cards threaten real loss; the pressure pacer means you can't farm a stream of easy wins.

### Too hard
**Risk:** Random events blindside and end runs unfairly.
- Defense: telegraphing (weather forecast §10, reckoning omens §6, town notices in the Brief); Crisis state-gating; the 2-majors-per-3-days ceiling; seeded fairness.
- **Verified counter:** *no single un-telegraphed event may end a healthy run. Run-ending outcomes must require either an ignored telegraph or a pre-existing vulnerable state (low fuel, unpaid mortgage, high Reckoning). The engine escalates danger you can see coming; it never manufactures ruin.*

### Boring
**Risk:** Events repeat and pacing flatlines.
- Defense: 120+ pool with recency suppression + family rotation; the pressure pacer guarantees variety of tempo.
- **Verified counter:** *target cadence ≈ 1 event per 2 days, with no more than 4 consecutive quiet days and no more than 2 Majors per 3 days — a rhythm the balance model can measure directly against a simulated run log.*

### Exploitable
**Exploit 1 — Save-scum outcomes.** Defense: seeded PRNG (§1).
**Exploit 2 — Pressure-gaming:** idle on quiet days to "bank" pressure and discharge on demand.
- Defense: pressure raises event *chance*, never *quality or valence* — you cannot steer *which* family fires or whether it's good or bad, and inviting an event is as likely to summon a wildlife loss as an opportunity. *(This is the number's job: pressure is a pacing dial, deliberately decoupled from outcome so it can't be milked.)*
**Exploit 3 — Family suppression:** manipulate state to see only Opportunity cards.
- Defense: weights are only partially player-controllable (fencing lowers wildlife, rotation lowers pests) and the Reckoning weight *rises with cruelty regardless* — you can nudge the pool, never curate it.
**Exploit 4 — Blanket-ignore:** dismiss everything to avoid bad choices.
- Defense: Majors auto-resolve to worst outcome; ignoring is itself a (bad) choice.

## Balancing levers

base_rate (0.30) and pressure step (0.10); the major-density ceiling (2 per 3 days); family base weights and the Reckoning tier-bonus curve (0/10/30/50/70); recency suppression window (12 draws); severity-class shares (30/45/20/5); Crisis state-gates; auto-resolve-to-worst rule.

## Sample scenarios

### Scenario A — Normal play: a Summer week's rhythm
Days 21–24 pass quiet (pressure climbing 0.30→0.60), the diorama calm. Day 25 fires a **Pests / Major** card — aphids on the monoculture wheat field (which carried extra pest weight per §1). Options: treat with clone labor (2 clone-days, reliable), buy Doc Bell's remedy (18 coin, instant), or ignore (auto-worst: spread to the adjacent field). The player, short on hands mid-Summer, pays Doc Bell. Pressure resets; Day 26 is quiet again. The pacer delivered a calm stretch, then a real decision, then breath.

### Scenario B — Edge/exploit: banking pressure backfires
A player, having read that quiet days raise event odds, deliberately idles for four days hoping to "roll" a lucrative Opportunity. On Day 4 the near-guaranteed draw resolves — but the family roll lands on **Wildlife**, and an unfenced field (§8) loses 20% of its ripening crop. Pressure governs *when*, never *what*. The would-be exploiter simply paid four idle days to summon a loss — exactly as the decoupling intends.

---

# 10. Weather System

## Recap

Weather is the largest event family (§9) and also a persistent daily-state layer that feeds the growth formula's `weather_mult` (§1). Two tiers: **daily weather** (sun, rain, heat, cold — a seasonal, autocorrelated backdrop that nudges growth) and **weather events** (hail, frost, drought, blizzard, cold snap, flood — the dramatic, crop-threatening cards). The whole system is built around one promise: weather is *forecast*, in confidence tiers, with enough lead that a prepared player can act — so loss is the price of a bad gamble or poor prep, never an arbitrary theft.

## Numbers & formulas

### Daily weather (the backdrop)

Each day carries a weather state driving §1's `weather_mult` (mild 1.00, rain 1.15, drought-day 0.70, frost 0.00 warm-season / 1.00 cool, blizzard −5%). States are **seasonal and autocorrelated** — a wet spell persists ~2–4 days rather than flickering daily:

| Season | Dominant states | Risk skew |
|---|---|---|
| Spring | Rain, Mild, Overcast | Flood (wet spells) |
| Summer | Hot, Mild, dry | Drought, Heat wave, Hail |
| Fall | Variable, Cool, Overcast | Early frost, Hail |
| Winter | Cold, Snow | Blizzard, Cold snap |

*(Autocorrelation defends against two things: it makes weather *feel* like weather rather than dice, and — crucially — it makes forecasting *possible*, since tomorrow correlates with today. A purely IID weather system couldn't be fairly telegraphed.)*

### Weather events (the dramatic layer)

| Event | Season | Effect | Telegraph lead |
|---|---|---|---|
| Hailstorm | Summer/Fall | Destroys ripe crop: 50% grain / 30% cash / 20% root (§1) | 1–3 days |
| Early frost | Fall | Full loss of warm-season crops unless harvested that day | 1–2 days |
| Drought (spell) | Summer | Multi-day 0.70 growth; fire risk | building (visible dry spell) |
| Heat wave | Summer | 0.80 growth; clone illness risk (§3) | 1–2 days |
| Blizzard | Winter | Growth −5%; +fuel demand; blocks wagon trips (§2) | 1–2 days |
| Cold snap | Winter | Fuel demand +50% for 2–3 days (§4) | 1 day |
| Flood | Spring | Field damage; fertility swing (silt +15% *or* wash-out −20%, §1) | rain-spell escalation |

### Forecasting (the fairness engine)

The Morning Brief shows weather in **confidence tiers**, matching §2's market grammar:

| Tier | Lead time | Reliability |
|---|---|---|
| Rumored | 3–5 days | ~50% |
| Reported | 2–3 days | ~75% |
| Confirmed | 1 day | ~95% |

*(The escalating-reliability ladder is the core decision generator: act early on a cheap-but-uncertain Rumored signal, or wait for a reliable Confirmed one and risk it arriving too late to save an unripe crop. Defends against both "too easy — just dodge everything" (early signals are only coin-flips) and "too hard — destroyed with no warning" (Confirmed gives a real out).)*

The **Almanac** (§2, ~40 coin) extends lead time and bumps reliability one tier; **Old Nan** sells supernatural reads (relationship-gated). Emergency harvest inside a forecast window costs **−20% yield** for the rush (§1).

### Weather × Reckoning

At Warnings+ the sky sours: unseasonal frosts, red rain, still air before a haunting. Higher Reckoning tiers **add weight and severity to weather events** (§6/§9) — the land's mood in the weather. *(Mechanical link, not just flavor: a cruel farm faces objectively worse weather, compounding the `reckoning_mult` growth penalty.)*

### Mitigation (ties to §8)

Well/Cistern: drought `weather_mult` 0.70 → 0.90. Cellar: lets you bank an emergency-harvested crop. Weather-resilient crops (roots) shrug off hail/frost far better than exposed cash crops (§1).

## Intended player experience

Weather should be the sky the player learns to *read* — the almanac-farmer's eye on a Rumored cloud, the gut-call on whether to rush the cotton in today or trust the front to miss. A saved harvest, pulled in the morning before an afternoon hail, should feel like skill, not luck; a crop lost to an ignored Confirmed frost should feel like a lesson, not a mugging.

## Four failure modes checked

### Too easy
**Risk:** Weather is predictable enough to dodge entirely.
- Defense: Rumored signals are 50% coin-flips; emergency harvest costs −20%; some hits are undodgeable (a Confirmed hail on a still-unripe field — nothing to pull). Weather is *managed*, never *defeated*.

### Too hard
**Risk:** RNG wipes crops with no counterplay.
- Defense: forecasts + confidence tiers + insurance crops (§1) + mitigation buildings (§8) + emergency harvest + the contract hardship valve (§7).
- **Verified counter (restates §1):** *every crop-destroying weather event is forecast with enough lead for a prepared player to mitigate. Un-forecast weather is capped at Minor severity — no Confirmed-tier destruction ever arrives unannounced.*

### Boring
**Risk:** Weather is just a multiplier ticking in the background.
- Defense: weather events are dramatic emergency-harvest-or-gamble choice cards (§9); the forecast ladder creates multi-day suspense; daily weather animates the diorama (rain on the aged paper).

### Exploitable
**Exploit 1 — Save-scum weather.** Defense: seeded (§1) — reload yields identical weather; only a changed action changes the result.
**Exploit 2 — All-resilient-crop farm** to negate weather.
- Defense: resilient roots are low-value (potatoes 2 coin/unit, §1); safety is bought with income.
- **Verified counter:** *an all-resilient-crop farm should earn meaningfully less over a run than a weather-managed cash-crop farm — safety must cost money, so "weatherproof by crop choice" is a valid conservative style, never a dominant one.*
**Exploit 3 — Panic-harvest on every Rumored signal** to never eat a loss.
- Defense: the −20% rush penalty (§1) + Rumored's 50% false-alarm rate means reflexive early harvesting bleeds ~10% average yield to phantom threats. *(This is exactly what the −20% number defends against — it prices the option of harvesting on thin information.)*
**Exploit 4 — Ignore forecasts as unreliable.**
- Defense: Confirmed is 95% reliable; ignoring a Confirmed warning is genuinely, repeatably costly. Only long-range reads are coin-flips.

## Balancing levers

Daily-state seasonal distributions and autocorrelation length (2–4 days); weather-event effect magnitudes (hail 50/30/20%, flood ±15/20%, etc.); telegraph lead times and tier reliabilities (50/75/95%); Almanac/Old Nan forecast boosts; emergency-harvest penalty (−20%); Reckoning weather-severity scaling; Well drought mitigation (0.70→0.90).

## Sample scenarios

### Scenario A — Normal play: reading the front
Year 3, two cotton fields ripe on Fall Day 45. The Brief shows **Rumored hail (50%)** for Day 47. The player holds — rushing now costs −20%, and it's a coin-flip. Next morning it firms to **Reported (75%)**; the player emergency-harvests one field (−20%, banked safe) and gambles the second. Hail hits Day 47 and takes 40% of the un-harvested field — a net better outcome than either panicking on the Rumor or ignoring the escalation. *(This is §1 Scenario B seen from the weather side: the forecast ladder is the decision.)*

### Scenario B — Edge/exploit: the weatherproof farmer
A cautious player plants only potatoes and turnips, proudly losing nothing to hail or frost across a full run. But at 2 coin/unit their fields earn roughly half what a neighbor's weather-managed tobacco and cotton bring in — the neighbor eats the occasional hail and still finishes a run ahead by ~2:1 on coin. The weatherproof style is *safe and viable*, and deliberately *not optimal* — exactly the balance the verified counter protects.

---

# 11. Roster Scaling & Housing

## Recap

A run begins with one clone and can grow to a dozen or more — and this section is about making that growth *interesting* rather than a snowball that trivializes the game or a spreadsheet that buries the player in dawn assignments. Two collapses must be prevented: **difficulty collapse** (a big workforce steamrolling everything, the CLAUDE.md "peaks too early" risk) and **UI collapse** (assigning twelve clones by hand every morning). The defenses are, respectively, soft diminishing returns plus super-linear logistics costs, and standing orders that keep the dawn decision count flat regardless of headcount. There is an *optimal farm size per lifetime tier* — not "more is always better."

## Numbers & formulas

### Assignment at scale — standing orders (the UI defense)

Each clone holds a **standing order** (a persistent default: *tend East Field*, *chop wood*, *harvest when ripe*, *rest*). The Morning Brief surfaces **only exceptions** — clones whose order is blocked (field already harvested), or a decision the day forces (an event, a ripe crop needing hands). **Templates** ("Planting Day," "Harvest Rush," "Winter Prep") reassign the whole roster in one tap, with the game suggesting a seasonal default.

- **Design commitment:** dawn decisions stay **~2–4 regardless of roster size**. A 1-clone farm and a 12-clone farm present a similar-sized morning. *(Defends against: "boring — micromanagement tedium at scale." The UI must not scale with headcount.)*

### Housing caps (the hard gate)

Roster size is capped by beds (§8): Lean-to 2 → Bunkhouse 5 → Longhouse 10 (stackable/upgradable beyond via meta unlocks, §14). Exceeding cap incurs the overcrowding penalty (§4/§8): −Morale and elevated Winter illness. *(You cannot out-buy your housing; scaling the roster requires scaling the buildings that compete for the same warm-season labor, §8.)*

### Diminishing returns & super-linear costs (the difficulty defense)

Four frictions grow with roster size so that N clones deliver less than N× one clone:

1. **Coordination overhead** — a mild household-labor efficiency tax by band: clones 1–5 at 100%, 6–10 at **−5%**, 11–15 at **−10%**. Mitigated by a **Foreman** (a meta-unlocked archetype/upgrade, §14) and the Longhouse. *(Defends against: "snowball a huge workforce to trivialize labor." Kept mild and offsettable — growth is encouraged, just not linear.)*
2. **Winter logistics tax (the main organic cap)** — feeding + fuel scale with headcount and spike in Winter (§4): a 12-clone household needs ~180 food + a larger fuel share, a Fall stockpiling burden that competes with the very harvest labor the big roster was meant to provide. *(This super-linear Winter cost is the real ceiling — defends against unbounded scaling more than any efficiency tax.)*
3. **Morale contagion** — household-wide Morale (§3) means one bad event ripples across the whole roster, and the **Personal event weight scales with roster size** (§9), so big farms are more volatile and harder to keep content.
4. **Reckoning exposure** — more clones means more deaths over time means more disposal decisions means more Reckoning pressure for a cruel operation (compounding §3/§6).

### The labor-to-land ratio

One clone sustainably works **~2 fields** (tending + periodic harvest, §1/§3). The game nudges balanced growth around this ratio:
- Roster outpacing fields → **idle clones eating 0.5–0.75 food/day for no output** (pure loss).
- Fields outpacing roster → unworked land (§8 practical cap).

*(The ~2:1 sweet spot means expansion is a *coordinated* decision — you grow clones and fields and housing and food together, or you bleed. Defends against lopsided min-maxing of any single dimension.)*

## Intended player experience

The farm should feel like it **grows into a living operation** the player commands with a light hand — the satisfaction of a well-drilled crew running on standing orders, broken by the mornings that genuinely need a decision. Scaling up should feel like taking on more *responsibility*, not more *busywork*, and the player should sense a natural size their land and lifetime want to be — pushing past it should feel like overreach, because it is.

## Four failure modes checked

### Too easy
**Risk:** Scale to a huge workforce and steamroll.
- Defense: coordination overhead + super-linear Winter logistics + morale volatility + reckoning exposure + the 2:1 ratio (idle clones are pure cost).
- **Verified counter:** *each clone beyond ~6–8 (at a mid-lifetime tier) should add less net surplus than the previous, and past the point where fields/food/housing keep pace, additional clones go net-negative. There is an optimal roster size per tier — the balance model should find a curve that peaks and declines, not one that rises forever.*

### Too hard
**Risk:** Scaling friction is so heavy the player can't grow.
- Defense: standing orders/templates remove the UI tax; Foreman + Longhouse offset overhead; frictions are soft, not walls; the Merchant always supplies labor. Growth is the intended arc — the frictions shape it, not block it.

### Boring
**Risk:** Assigning a large roster every dawn is tedium.
- Defense: standing orders + exception-only Brief + one-tap templates.
- **Verified counter:** *dawn decision count stays ~2–4 across all roster sizes — a measurable UX invariant the prototype must hold.*

### Exploitable
**Exploit 1 — Blitz-and-cull:** mass-buy clones for a labor surge, sell/cull before Winter.
- Defense: §4's sell-in-Fall counter (Morale/rep hit + slow Merchant restock + lost labor ramp) — re-verified; the bigger the blitz, the worse the unwind.
**Exploit 2 — Overcrowd to dodge housing cost.** Defense: overcrowding penalty (§8) costs more labor than the build saves.
**Exploit 3 — Bench a labor reserve:** hold idle clones for surge weeks.
- Defense: idle clones still eat **0.5–0.75 food/day year-round** (§3/§4); a standing bench is a standing food bill for occasional value. *(The feeding cost is precisely what makes benching a large reserve a losing proposition.)*
**Exploit 4 — Set-and-forget automation:** perfect templates, never engage.
- Defense: events (§9) force response; standing orders go stale as weather/market shift (§10/§2), so blind automation quietly underperforms attentive play — the templates handle *routine*, never *judgment*.

## Balancing levers

Coordination-overhead bands (−5%/−10%) and Foreman offset; housing caps (2/5/10) and overcrowding penalty; Winter feeding/fuel per-clone rates (§4); Personal-event roster scaling (§9); the labor-to-land ratio (~2 fields/clone); idle-clone feeding cost.

## Sample scenarios

### Scenario A — Normal play: the coordinated grow
Year 4, a 6-clone farm working 12 fields (on-ratio) considers a bigger cash-crop push. Growing to 8 means +2 clones (+labor) but also +~30 Winter food, a Longhouse upgrade for beds (§8), and the onset of the −5% coordination band. The player grows to **7**, upgrades housing, and clears two fields — keeping the 2:1 ratio and staying under the overhead cliff. Balanced expansion, honestly costed.

### Scenario B — Edge/exploit: the fourteen-clone blitz
A player mass-buys to 14 clones in Year 3 for a cash-crop blitz. The −10% coordination tax bites; a single death event cascades morale across the whole roster (§3); and — decisively — the Fall stockpiling for a 14-mouth Winter can't keep pace with harvesting the fields the roster was bought to work. Winter arrives short; clones starve; the oversized farm collapses below where a steady 8-clone operation would have finished. The verified counter holds: **past the logistics envelope, bigger is worse.**

---

# 12. Festivals & Town Reputation

## Recap

Marrow's Cross anchors the year with four festivals (D-013) and a web of relationships with its ten named NPCs (CLAUDE.md §4). This section lays out the festival calendar and what each does mechanically, then deepens the Reputation axis introduced in §5 into a two-layer social system: an aggregate **town Reputation** and **per-NPC relationship tracks** that can diverge from it. Crucially, Reputation is a *two-way* axis — the high-rep "pillar of the community" path and the low-rep "outlaw" path are both viable, opening different doors — so the town is a system of tradeoffs, not a virtue meter to maximize.

## Numbers & formulas

### The four festivals (one per season)

| Festival | Season | Run by | Mechanical payload |
|---|---|---|---|
| **First Furrow** (Planting Fair) | Spring | Halloway + Grange | Discounted seed; a civic contract offering (§7); a field blessing (small Reckoning relief + minor fertility, §1/§6) |
| **The High Market** | Summer | Halloway + Regional buyers | Temporary +venue prices; extra contract offers; gossip reveals (upcoming demand shocks, §2) |
| **Harvest Home** | Fall | the whole town | Crop competitions (rep + prize); feast (+Morale, §3); a communal note — **and it lands mid-harvest crunch** |
| **The Long Vigil** (Midwinter) | Winter | Grange (the church rite) | Participation eases the land (Reckoning relief, §6); Midwinter feast (+8 Morale, §4); the Vigil's health is itself a Reckoning readout |

*(The Long Vigil is the keystone: it is literally the rite named in the Reckoning tiers — "The Long Vigil Fails," §6. Supporting it is a communal atonement lever; a farm too cruel, or a town that neglects it, weakens the rite that holds the land. Festivals aren't set-dressing — each is a mechanical node.)*

### Soft-required attendance

Attending costs **a partial-to-full day of household labor** and sometimes a contribution (food for the feast, a church tithe). Skipping costs **−2 to −4 town rep** ("the Blackwoods didn't come again") plus the forgone payload (contracts, discounts, Morale, NPC beats).

*(The Fall Harvest Home deliberately collides with harvest crunch (§1) — attendance there is a genuine sacrifice of harvest labor, not a free rep top-up. Defends against "soft-required is just a mandatory tax you always pay": you can skip when the fields demand it and eat the rep cost — a real, situational tradeoff.)*

### Reputation, layer two — per-NPC relationships

§5 defined town Reputation (0–100, bands, exposure). On top of the aggregate, each of the ten NPCs carries an **individual track: Cold / Neutral / Warm / Close**. Individual tracks can diverge from the town average — Old Nan may stay Warm as the town sours (if you feed her reckoning intel); Sheriff Coldwater may stay Cold at high town rep (if he suspects what's in your fields).

NPC hooks (canon roster — no new NPCs, per CLAUDE.md §4):

| NPC | Gates / provides |
|---|---|
| Mayor **Cyrus Halloway** | Civic contracts (§7); festival roles; town politics |
| Preacher **Elias Grange** | Field blessings; cleansing rites (Reckoning relief, §6); the Long Vigil |
| **Doc Bell** | Illness treatment (§4); clone health; rumors (feeds §5 exposure) |
| **Meredith Vane** | Saloon information hub; Black Market brokering (§2); Vane mystery (D-014) |
| **Silas Ridley** | Mortgages & loans (ties to §13 foreclosure/land-loss) |
| **Bess Halloway** | Marriage / heir line (D-007 lineage); high-rep gated |
| **Old Nan** | Reckoning reads & folk-cleansing (§1/§6); reckoning intel |
| Sheriff **Nathaniel Coldwater** | Law; cruelty investigations (§5); raids/fines |
| Dr. **Ambrose Vane** | Clone stock & prices (scale with relationship, §3) |
| Sister **Ruth Grange** | Charity; foundlings (§3); Winter relief (§4) |

Relationship drivers: festival attendance, quest beats, gifts/fair trades, honoring vs. defaulting contracts, cruelty exposure (§5), and taking sides in town disputes. *(Gift gains diminish, and conduct-sensitive NPCs — Grange, Coldwater — weight your cruelty over your gifts. Defends against: "gift-spam to buy any relationship." You cannot bribe past a haunted reputation.)*

### The two-way axis

- **High rep (Pillar):** Merchant discounts (§3), best contracts (§7), information, marriage/heir (Bess), festival honors, Sister Ruth's charity.
- **Low rep (Outlaw):** locked out of the above — but the Black Market opens (§2), bone-root/Weird buyers appear, and a farm nobody wants to look at closely can run the Vat and the dark crops with less initial scrutiny.

*(Reputation opens as many doors as it closes; the doors are just darker on the low end. Defends against "rep is a one-directional punishment" — it's a playstyle selector. See the outlaw verified counter.)*

## Intended player experience

The town should feel like a **small, watchful community with a memory** — a place where the same ten faces notice whether you came to the Vigil, whether your hands look happy, whether the Sheriff has started asking questions. The player should feel Reputation as *belonging or exile*, both playable: the warmth of being the town's pillar, or the cold, useful freedom of being the farm folks don't visit after dark.

## Four failure modes checked

### Too easy
**Risk:** Max rep trivially via festivals and unlock everything.
- Defense: rep gains are slow and capped (§5 +1/season passive, §7 +2/season contract cap, festival gains modest); high-rep benefits are *conveniences and content*, not power (D-015 philosophy); and holding high rep constrains your cruelty options — it's a tension, not a freebie.

### Too hard
**Risk:** The player tanks rep and the town locks them out for good.
- Defense: rep recovers (slowly); the low-rep outlaw path is fully playable, not a dead end; individual NPC tracks can be rebuilt one relationship at a time.

### Boring
**Risk:** Festivals are a menu you click "attend" on.
- Defense: each festival is event-rich (choice cards, NPC beats, competitions, the Vigil's Reckoning stakes); they land at mechanically loaded moments (Harvest Home vs. crunch); the Long Vigil welds the calendar to the horror.

### Exploitable
**Exploit 1 — Festival rep-farming.** Defense: rep caps + modest, diminishing festival gains.
**Exploit 2 — Skip all festivals to bank labor.**
- Defense: for a town-dependent playstyle, compounding rep loss + missed contracts/discounts/quests should exceed the labor saved; for a committed outlaw it's a legitimate choice.
- **Verified counter:** *skipping festivals to farm should be net-negative for a town-reliant player (lost contract/discount value > labor gained), while remaining viable for a Black-Market outlaw who doesn't need town access. Two honestly-costed playstyles, not one dominant answer.*
**Exploit 3 — Gift-spam a relationship.** Defense: diminishing gift returns; quest-gated tracks; conduct-sensitive NPCs weight cruelty over gifts.
**Exploit 4 — Marry Bess purely for a lineage bonus.**
- Defense: marriage is high-rep gated with narrative weight, and the heir carries **25% inherited Reckoning** (§6) — a haunted farm hands its debt down the bloodline, so the "bonus" comes mortgaged.

## Balancing levers

Festival attendance costs (labor + contribution) and skip penalties (−2 to −4 rep); each festival's payload magnitudes (blessing relief, feast Morale, competition prizes); per-NPC track thresholds and gate requirements; gift diminishing curve; the Long Vigil's Reckoning-relief weight; outlaw-path access thresholds.

## Sample scenarios

### Scenario A — Normal play: Harvest Home vs. the harvest
Fall, Year 3. Harvest Home falls on Day 52 — dead in the crunch, with cotton ripening. Attending means a lost day of harvest labor; skipping means −3 rep and a forgone civic contract + feast + a Bess relationship beat. The player compromises: sends **half** the household to represent the family (partial labor loss, most of the rep and the contract secured) and keeps half in the fields. The soft-required tension resolved by a real allocation choice — exactly the intended texture.

### Scenario B — Edge/exploit: the outlaw who never came to town
A player runs a Black-Market bone-root operation and skips every festival for four years. Town rep craters to **Pariah** — and for them that's *fine*: they never needed contracts or discounts, sell everything to the fence (§2), and low rep even meant less early scrutiny of the Vat. But it's not consequence-free: a Sheriff Coldwater investigation eventually fires (§5), Sister Ruth's charity is closed to them in a hard Winter, and the Reckoning (indifferent to the town's opinion, §6) collects regardless. The outlaw path is **viable and different, not free** — the verified counter holding on both sides.

---

# 13. Season Arcs (mechanical hooks)

## Recap

Each year of a lifetime carries one named **Season Arc** — a scripted spine of event cards (§9) that gives the year a story and, more importantly here, a set of mechanical gates and pressures. This section is the *mechanical* skeleton only (full narrative lives in the Narrative Bible, Q-005): the persistent economic clock under every arc (**the mortgage**, whose non-payment is one of only two run-enders, D-007), the anatomy of an arc, how the four named years (The Newcomer, The Preacher's Sickness, The Rail Comes, The Vigil Breaks) express that anatomy, and how arcs branch on the player's ledger state rather than pass/fail.

## Numbers & formulas

### The mortgage (the run-clock under every arc)

The homestead is mortgaged to Silas Ridley (§12). A payment of **150 coin is due at year-end (Winter Day 80)** until the principal is bought out — but the **first two years are grace** (the establishment period, "The Newcomer"; balance-ratified, issue #2), so the first payment falls due at the end of Year 3.

- **Miss one payment:** a warning year (Ridley relationship −, a Crisis-gated foreclosure notice, §9). 
- **Miss two consecutive:** foreclosure → land-loss → run ends (D-007).
- **Buy-out:** the player may pay down principal (say **1,200 coin total**) to own the land free and **remove the foreclosure clock entirely** — a major long-term capital goal, not a quick escape (see exploit).

*(The mortgage is the Oregon-Trail survival clock — a predictable, escalating pressure that makes every year's surplus *mean something*. Defends against "too easy — a good farm just coasts": there is always a hard number due in Winter. It is deliberately predictable with a warning year, so it pressures without ambushing — defends against "too hard — a surprise bill ends the run.")*

### Arc anatomy

Every Season Arc is a three-beat structure gated to the calendar:
1. **Setup** (Spring): an inciting event card introduces the year's situation.
2. **Escalation** (Summer–Fall): 2–4 follow-up cards, gated on player state, that develop and demand small commitments.
3. **Climax** (late Fall–Winter): a decisive choice card with **lasting consequences** (unlocks, town changes, ledger shifts, Vigils §14).

Arcs **branch on the ledger** (§5/§6) — a kind, low-Reckoning farm and a cruel, high-Reckoning farm meet different versions of the same year — rather than resolving pass/fail.

### The four named years (mechanical hooks)

| Year | Arc | Mechanical hook |
|---|---|---|
| **1** | The Newcomer | Tutorial arc: establishes the mortgage, introduces NPCs & the first festival, guided milder first Winter (§4) and small starter contracts (§7). |
| **2** | The Preacher's Sickness | Grange falls ill: the church's blessing/cleansing services (**Reckoning relief, §6**) go unavailable or costly. Choice: fund his care (coin/quest) to restore them, or let them lapse — real pressure on cruel players who lean on atonement. |
| **3** | The Rail Comes | Unlocks the **Rail Depot** (§2 mid-game venue): a town contribution (~100 coin) backs the line, granting depot access (better prices/volume, cheaper coal §4) and new demand shocks. Choice: back it or oppose it. |
| **4** | The Vigil Breaks | The Long Vigil rite (§6/§12) falters, **gated on accumulated town + player Reckoning**: a high-Reckoning farm faces a town-wide Walkers-tier spike; a clean farm sees the Vigil hold. The horror crescendo — shore it up or abandon it. |

Years 5–10+ are outlined in the Narrative Bible (Q-005); each plugs into this same anatomy and reads the same ledger state.

### Arc rewards

Completing an arc grants **Vigils** (§14), unlocks content, and **permanently shifts Marrow's Cross** across campaigns (D-015) — the graveyard fills, NPCs remember, buildings persist.

## Intended player experience

Each year should feel like it has a **shape and a name** — a situation that arrives, builds, and asks something of the player at the end, colored by who they've chosen to be. The mortgage should sit under all of it as a quiet drumbeat: the land is not yet yours, and Winter is coming with its hand out. Arcs should make a lifetime feel like a *story with chapters*, not a string of interchangeable years.

## Four failure modes checked

### Too easy
**Risk:** Arcs are optional story a player can ignore.
- Defense: arcs carry real mechanical stakes (the Vigil breaking hurts the whole farm; the Rail is a genuine economic unlock; the mortgage is non-optional). Ignoring an arc has a mechanical cost, not just a narrative one.

### Too hard
**Risk:** A flubbed arc ends the run.
- Defense: arcs **branch, they don't fail-state** — a "bad" arc outcome is a worse branch, not death. The mortgage (predictable, warned) and the Reckoning (telegraphed, §6) are the only true run-enders.
- **Verified counter:** *no Season Arc except an unpaid mortgage may directly end a run. Arcs shape the run; only the mortgage clock and the Reckoning collect it. A player should never lose to a story beat they couldn't see the stakes of.*

### Boring
**Risk:** Arcs play out identically every campaign.
- Defense: ledger-state branching (kind/cruel, rich/poor, high/low rep); the Vane-truth randomizer (D-014); the meta-evolving town (D-015); a growing library of distinct year-arcs (Q-005).

### Exploitable
**Exploit 1 — Rush the mortgage buy-out to remove the run-clock, then coast risk-free.**
- Defense: the 1,200-coin buy-out is a large capital sink that starves farm investment while you pursue it, and owning the land free removes **only foreclosure** — line-death and the Reckoning curse (the other run-enders, D-007) remain fully live.
- **Verified counter:** *paying off the mortgage should be a valid long-term aspiration, never a safety cheat — the coin sunk into principal must cost enough farm/ledger progress that a buy-out-rushed farm is more exposed to the remaining run-enders, not less.*

**Exploit 2 — Save-scum arc choices** for the best branch. Defense: seeded, choices commit (§1/§9).

**Exploit 3 — Skip the Rail arc's cost but still get the depot.** Defense: depot access is gated behind backing the Rail — no free unlock.

## Balancing levers

Annual mortgage payment (150) and buy-out principal (1,200); miss-payment grace (1 warning year); per-arc reward Vigils; arc branch thresholds on the ledger; the Vigil-Breaks Reckoning gate; Rail contribution cost (~100).

## Sample scenarios

### Scenario A — Normal play: The Rail Comes (Year 3)
The arc's Spring setup announces the railway survey. Through Summer, escalation cards ask the player's stance. At the Fall climax the player weighs a ~100-coin town subscription against a tight budget — but backing it unlocks the **Rail Depot**: better prices, 100-unit volume (§2), and coal at 2 coin (§4) for every Winter after. They back it, reshaping their late-game market. The arc delivered a permanent economic fork, not just a cutscene.

### Scenario B — Edge/exploit: the mortgage-rusher's false safety
A player funnels every surplus coin into principal, buying the land free by Year 3 — and feels untouchable. But the buy-out starved their ledger management and farm growth; Reckoning drifted into Walkers unattended (§6). Year 4's **The Vigil Breaks** lands on their haunted, under-built farm, and the run ends by **curse-driven land-loss** (D-007) — the very outcome they thought they'd bought their way out of. Removing the foreclosure clock did nothing to the land's own reckoning. The verified counter holds.

---

# 14. Meta-Progression (Vigils, unlocks)

## Recap

Bushel & Bone is a roguelite: runs end (line-death or land-loss, D-007) but leave permanent residue. The meta layer is built on one firm principle — **unlocks are content, never power** (D-015) — so a veteran account has *more options*, not an *easier game*. The meta-currency is **Vigils**, earned by playing runs deeply and spent on breadth (new archetypes, crops, buildings, events, arcs, scenarios). The **Codex** persists across every run ever played — a named memorial of the dead and a growing body of knowledge that is itself the returning player's real advantage. Difficulty scaling is explicitly *not* meta-progression's job; that belongs to Ascension (§15).

## Numbers & formulas

### The nested run structure (D-007 recap)

**Year** (80-day tactical loop) → **Farmer's Lifetime** (many years until the farmer dies) → **Family Lineage on Land** (many lifetimes until line-death or land-loss). A run = a lineage. When a run ends, Vigils and the Codex persist to the next.

### Vigils (meta-currency)

Earned for **depth**, not starts:
- **~1–5 Vigils per year survived** (scaling with how eventful/successful the year was).
- **~5–10 per Season Arc completed** (§13).
- **One-time milestone grants:** first Winter survived, first Vigil upheld, first heir born, first Vane-truth uncovered, etc.
- **End-of-run tally:** a bonus reflecting the *character* of the ending (a dignified line-death that upheld the Vigil, a lineage that owned its land free, etc.).

Spent on **content unlocks** — new clone archetypes (a Forager, a Foreman §11), new crops (widening the §1 families), new buildings (§8), new event cards/families (§9), new Season Arcs, new starting scenarios, and Codex/cosmetic entries. *(Never stat boosts — see the content-not-power counter.)*

### The Codex (persistent memorial, D-015)

Records, across **all runs ever**: every clone who lived and died **by name** (tying the Ghost Roll, §5, into a permanent memorial), every event seen, every crop/building/NPC secret, every arc outcome, each Vane-truth uncovered. Codex completion grants Vigils, and Codex *knowledge* is the returning player's edge — the reckoning thresholds, event outcomes, and market patterns that let a veteran read the land (the "knowledge as meta-progression" promised in §6).

### Content-not-power (the anti-powercreep spine)

Unlocks add strategic *options*, not *strength*: a new archetype is *different* (new tradeoffs), not better; a new crop is a new axis, not a higher number.
- **Verified counter:** *a fully-unlocked account must face the same base difficulty as a fresh account. Unlocks widen the strategy space; they never lower the challenge floor. If a maxed account finds the base game easier than a new one does, meta-progression has failed — difficulty escalation is Ascension's job (§15), full stop.*

## Intended player experience

The meta layer should make the player feel that **nothing was wasted** — that the clone who died in a bad Winter three lineages ago is still named in the Codex, that each ending taught the land something. Progression should feel like a **widening of possibility and understanding**, not a power bar filling — the pleasure of *new ways to play* and *deeper knowledge of a strange place*, not of finally being strong enough to win.

## Four failure modes checked

### Too easy
**Risk:** Meta-unlocks make later runs trivial.
- Defense: content-not-power (the whole design); Ascension supplies escalating difficulty (§15). Per the verified counter above, the base floor never drops.

### Too hard
**Risk:** New players feel locked out of content — grindy or "paywalled-feeling."
- Defense: the **core loop is fully playable and complete from run 1** with base content; unlocks are *breadth*, never *access to winning*; Vigils accrue steadily so there's always visible progress. A first lineage is a whole, satisfying game.

### Boring
**Risk:** Meta becomes a numeric grind for its own sake.
- Defense: unlocks are tied to **discovery** (Codex) and **story** (arcs, the Vane truths D-014), not a spreadsheet of upgrades; each unlock genuinely changes *how* you can play.

### Exploitable
**Exploit 1 — Suicide-run farming:** deliberately end runs fast to farm Vigils per unit time.
- Defense: Vigils reward **depth** — years survived, arcs completed, Codex discoveries — which dwarf any start-of-run grants.
- **Verified counter:** *Vigils-per-hour must be maximized by playing runs well and long, not by churning short ones. There should be no rate incentive to bail early — the deep, complete run is always the efficient one.*

**Exploit 2 — Save-scum the meta.** Defense: seeded; meta commits at run-end (§1).

## Balancing levers

Vigil grants (per year 1–5, per arc 5–10, milestone one-times, end-of-run tally); unlock costs by category; Codex-completion Vigil rewards; the pace of the unlock tree (breadth vs. gating).

## Sample scenarios

### Scenario A — Normal play: a first lineage closes
A player's first lineage line-dies in Year 6 after a hard-fought run — no heir, the last farmer gone. The end-tally grants ~30 Vigils (years survived + two arcs + first-Winter and first-heir milestones), and the Codex fills with a dozen named dead and a clutch of discovered events. The player spends the Vigils unlocking a new crop and the Forager archetype — *new ways to play* next run, at the same base difficulty. The roguelite loop lands: the run ended, but nothing was lost.

### Scenario B — Edge/exploit: suicide-farming that isn't
A player tries to grind Vigils by starting lineages and bailing at the first milestone, over and over. But start-and-early grants are a trickle next to the years-survived and arc-completion rewards they're skipping — their Vigils/hour comes out well below a player who simply plays runs out. The exploit is self-defeating by construction; depth is the efficient path, exactly as the counter requires.

---

# 15. Ascension Stacking

## Recap

Ascension is the endgame difficulty ladder — **+1 through +10** stacking modifiers (D-015) that a player unlocks by completing runs. Each level is a *named rule change* that reshapes strategy, not a flat numeric slider, and because they **stack** (climbing to +5 carries +1 through +5), high Ascension demands mastery across *all fifteen systems* at once. This is the system that keeps the game hard for experts — the primary structural defense against the whole design going stale — and the ultimate enforcer against dominant strategies (CLAUDE.md concern #2).

## Numbers & formulas

### The ladder (each level stacks on all below it)

| Level | Name | Modifier (targets a different system) |
|---|---|---|
| **+1** | Lean Years | Reduced starting coin/supplies; harvests slightly lower (§1) |
| **+2** | Hard Ground | Fertility starts lower & decays faster — rotation matters more (§1) |
| **+3** | A Watchful Town | Cruelty exposure chance up; Sheriff more active (§5) |
| **+4** | The Restless Land | Reckoning accrues faster, decays slower (§6) |
| **+5** | Cruel Winters | Winter consumption up; cold snaps more frequent/severe (§4/§10) |
| **+6** | Fickle Markets | Demand shocks more volatile, seasonal swings wider; contracts stricter (§2/§7) |
| **+7** | Thin Blood | Clones frailer, more illness; Merchant prices up (§3) |
| **+8** | The Bank's Patience Wears | Mortgage payments rise; less foreclosure warning (§13) |
| **+9** | The Vigil Frays | The Long Vigil weakens faster; Walkers-tier events escalate (§6/§12) |
| **+10** | The Land Remembers All | Reckoning inheritance up (§6); everything above intensified — the definitive climb |

*(Each level attacks a **different pillar**, so the stack forces broad competence: you cannot climb by mastering one system. This is deliberate — it's the mechanical guarantee against a single dominant strategy carrying the whole game.)*

### Structure & rewards

- Ascension unlocks **sequentially** (clear +N to attempt +N+1) and is **entirely optional** — a player who wants the base experience never touches it.
- Completions grant bonus **Vigils** (§14) and **Codex/cosmetic prestige marks** — recognition, not power (content-not-power holds even here).

## Intended player experience

Ascension should feel like the game **teaching itself to you again, harder** — each level a new constraint that invalidates a comfortable habit and demands you re-learn a pillar you thought you'd mastered. Climbing should feel like earned mastery, not attrition: +10 should be the achievement a veteran chases for years, brutal but always *fair*, always beatable by better play rather than better luck.

## Four failure modes checked

### Too easy
**Risk:** For veterans, the base game is solved and stale.
- Defense: **this system is the answer.** Ten stacking, strategy-changing levels give experts a mountain the base game can't. Ascension exists precisely to defend the whole design against "too easy for masters."

### Too hard
**Risk:** High Ascension feels impossible or unfair.
- Defense: modifiers are difficulty *increases to a fair base*, not luck-swings; each is opt-in and telegraphed; by the time a player climbs high, they have full Codex knowledge (§14) and the entire unlocked toolkit.
- **Verified counter:** *every Ascension level must be winnable by a master player using the full unlocked toolkit. +10 is punishing but fair — a test of skill and system-mastery, never a dice-roll. The balance model must show a viable (if narrow) winning line at each level.*

### Boring
**Risk:** Ascension is just bigger numbers.
- Defense: each level is a **named rule change** that shifts strategy, so climbing feels like re-learning the game under new constraints, not dragging a difficulty slider.

### Exploitable
**Exploit — Carry one dominant strategy up the ladder.**
- Defense: because modifiers stack and each targets a different system, a strategy that sidesteps one level is punished by another (a contract-heavy build cruises +1–5 then hits +6 Fickle Markets; a cruelty-blitz build hits +3 Watchful Town then +4 Restless Land).
- **Verified counter:** *no single strategy should clear +10. The stack must force broad, adaptive mastery across all fifteen systems — the definitive anti-dominant-strategy guarantee. If the balance model finds one build that clears +10 untroubled, a modifier is mis-targeted and must be re-pointed at that build's blind spot.*

## Balancing levers

The specific modifier on each of the 10 levels and its magnitude; the sequential-unlock gating; completion Vigil rewards; which system each level targets (the anti-dominant-strategy coverage map — every major pillar should be hit by at least one level).

## Sample scenarios

### Scenario A — Normal play: a habit invalidated
A veteran who has mastered a comfortable mild-cruelty style climbs to **+3 A Watchful Town**. Suddenly the small cruelties they used to get away with (§5 exposure) trigger Sheriff investigations, tanking rep and pulling the Sheriff onto their farm. They're forced to adapt toward cleaner play — the modifier reshaped their strategy exactly as intended, not merely slowed it.

### Scenario B — Edge/exploit: the one-trick build meets the stack
A player who dominated +1–5 on a pure cash-crop-plus-contracts engine hits **+6 Fickle Markets**: volatility and stricter contract terms gut their reliable margins, forcing diversification. Pressing on, **+8 The Bank's Patience Wears** squeezes the mortgage their thin-margin build can't easily cover, and **+9 The Vigil Frays** punishes the reckoning they'd been ignoring. No single trick survives the full stack — broad mastery is the only path to +10, precisely as the anti-dominant-strategy counter demands.

---

# Document status: full draft complete

All 15 systems are drafted to the §1 template — hard numbers throughout, each audited against the four failure modes (too easy / too hard / boring / exploitable), each gameable number annotated with the exploit it defends against, and each carrying **verified-counter claims**: falsifiable, quantified hypotheses ("bone-root should die by Year 3 to Reckoning Proper," "contracts lower variance but not mean," "no single strategy clears Ascension +10") that the Balance Model exists to test.

**Immediate next steps (per session-history plan):**

1. **Cross-system numerical consistency pass** — trace shared figures (clone food cost, per-death Reckoning value, clone-day labor, coin values) across all 15 sections to catch drift before the model consumes them.
2. **Build the Balance Model** (Python simulation, `docs/balance-model/`) — encode the systems and run headless campaigns to validate every verified-counter claim: that no strategy dominates and the difficulty curve holds across Ascension.
3. **Paper prototype playtest** — validate the core day loop and the moral-tension feel that numbers can't confirm.

The verified-counter claims scattered through §1–§15 are the Balance Model's test suite. Extracting them into a single checklist would be a good first task of the modeling phase.

---

# Supplementary Systems (issue #8)

Four systems referenced by the core 15 but not previously spec'd to the §1 template. Same format, hard numbers, four-failure-mode audit, verified counters. Numbers consistent with the ratified set (D-032/D-034).

---

# 16. Livestock & Manure

## Recap

Livestock (chickens, pigs, cows) turn fodder and labor into a slow, steady stream of **food, fertility (manure), and winter insurance (slaughter)**. They are a resilience and sustainability play — not a food printer — that competes with food crops for the land and labor that feed them. Requires a Barn (§8).

## Numbers & formulas

| Animal | Buy | Fodder/day | Ongoing product | Slaughter (food) | Breeds |
|---|---|---|---|---|---|
| Chicken | 3 | 0.1 | 0.5 food/season (eggs) | 3 | fast (~1/season/pair) |
| Pig | 15 | 0.4 | — | 15 | ~1 piglet/year/pair |
| Cow | 30 | 0.5 | 1.5 food/season (milk) + **0.25 manure/season** | 25 | ~1 calf/2 years/pair |

- **Barn cap:** 8 animals (Big Barn upgrade → 16, §18).
- **Fodder:** grown (a field of oats/corn diverted to fodder, or the stubble after harvest) or bought at ~1 coin/unit. A cow eats **0.5 fodder/day = 10/season = 40/year**.
- **Manure → fertility:** applied to a field, **+20% fertility per unit** (§1). 4 cows ≈ 1 unit/season (§1's "1 per 4/season"). Manure is the *sustainable* fertility restore — it lets a field stay in production without the season-long fallow (+30%, §1). *(This is the main reason to keep cows: with the tight ratified food economy, D-032, sustained fertility is worth more than the milk.)*
- **Slaughter:** one-time food (winter emergency lever, §4). Meat spoils in 2 seasons without a Smokehouse (§8).

## Intended experience

A few chickens and a cow should feel like *the homestead breathing* — a low, reliable hum of eggs and milk and dung under the drama of the crops, and a pig in the sty that is this winter's insurance if the harvest fails.

## Four failure modes checked

**Too easy** — a big herd as free food + fertility. Defense: fodder competes with food crops for land and labor; the Barn cap (8); slow breeding; modest manure (4 cows → 1 unit). **Verified counter:** *a herd's fodder cost should roughly offset its food output, so livestock nets out as a fertility + winter-insurance play, not a food surplus engine.*

**Too hard** — a fiddly drain. Defense: chickens are cheap and near-free to keep (0.1 fodder, eggs); manure is genuinely valuable in the tight economy; slaughter is a real safety net.

**Boring** — buy animals, collect food. Defense: the fodder-vs-food-crop land tradeoff, slaughter timing (hold the pig or eat it), manure allocation (which exhausted field), breeding.

**Exploitable** — livestock-as-food-battery (breed a herd, ignore crops; §4 named exploit). Defense: fodder land + labor + slow breeding cap the yield. **Verified counter:** *a livestock-only food strategy should underperform mixed farming — the fodder land it needs, grown as food instead, feeds more mouths than the herd does.*

## Balancing levers

Buy prices; fodder rates; product yields (eggs/milk); manure rate (0.25/cow/season) and fertility value (+20%/unit); slaughter food values; breeding rates; Barn cap (8/16); meat spoilage (2 seasons).

## Sample scenarios

- **Normal:** a Year-3 farm keeps 4 chickens and 2 cows. The eggs and milk are a modest food trickle; the real value is a manure unit each season that keeps the two best fields off the fallow rotation. A pig fattens in the sty against a bad winter.
- **Edge/exploit:** a player breeds a 12-pig herd as a food battery, diverting two fields to fodder. The fodder land, slow breeding, and Barn overflow mean the herd feeds fewer mouths than those two fields in potatoes would have — the battery underperforms, as the counter predicts.

---

# 17. Festival Interactions

## Recap

The four annual festivals (§12) are not just attend/skip toggles — each is a small **mini-loop** with its own payload: seed swaps and blessings (First Furrow), a hot market (High Market), a crop competition and feast (Harvest Home), and the Vigil rite (Long Vigil). Attendance costs real time; the payoff is soft goods (reputation, morale, contracts, atonement) rather than raw output.

## Numbers & formulas

| Festival | Season | Attend cost | Mini-loop payload |
|---|---|---|---|
| First Furrow | Spring | ½–1 rest day | Discounted seed (−25%); Grange field blessing (**−1 Reckoning, +5% fertility one field**); a civic contract offer |
| High Market | Summer | 1 rest day | Market runs hot (**+0.3 venue price, 1 season**); extra contract offer; gossip (a demand-shock preview) |
| Harvest Home | Fall | ½–1 rest day (lands in crunch) | **Crop competition** (below); feast (**+6 morale**) |
| Long Vigil | Winter | 1 rest day | Vigil participation (**−2 Reckoning**); Midwinter feast (**+8 morale**); the Vigil's health is a Reckoning readout |

- **Skip penalty:** −2 to −4 reputation (§12).
- **Reputation gain is capped at +2/season from festivals** (§5) — attending all four in a season doesn't stack past the cap.
- **Crop competition (Harvest Home):** enter your best crop; scored on `units × freshness × luck(±15%)`. Tiers: no place (participation, +1 rep) · third (10 coin) · second (20 coin) · first (40 coin + **+2 rep, permanent town renown flag**).

## Intended experience

Festivals should feel like the year's punctuation — the town gathering to trade, judge, feast, and watch the dark — and each should present one real *decision*, not a formality (chiefly: is a festival day worth more than a field day, right now?).

## Four failure modes checked

**Too easy** — free rep/morale, always attend. Defense: attendance costs a rest day in the tight economy (D-032); rep capped (+2/season); Harvest Home lands mid-crunch. **Verified counter:** *attending every festival should net-negative on pure output (lost labor) and net-positive on soft goods (rep, morale, contracts) — a genuine trade, never free.*

**Too hard** — a mandatory tax. Defense: soft-required (skippable at a bounded rep cost); the payload scales with participation, not perfection.

**Boring** — click "attend." Defense: the mini-loops (seed swap, competition, blessing, the Vigil stakes); festivals land at loaded moments; NPC beats fire here (Part 3B).

**Exploitable** — festival-farm rep; farm the competition prize. Defense: rep cap + diminishing (§12); the prize needs a genuinely superior crop (the `units × freshness` score), which costs a field's worth of good management. **Verified counter:** *competition prize income should be less than the value of the field-management effort that wins it — a bonus for good farming, not a strategy.*

## Balancing levers

Attend costs (½–1 day); skip penalties (−2 to −4 rep); rep cap (+2/season); seed discount (25%); blessing relief (−1) & fertility (+5%); High Market price bump (+0.3) & duration; feast morale (+6/+8); Vigil relief (−2); competition score formula and prize tiers.

## Sample scenarios

- **Normal:** Harvest Home falls mid-crunch; the player sends half the household (partial rep + feast) and enters a prize pumpkin from a well-tended field, taking second (20 coin, +1 rep). A real allocation choice, honestly costed.
- **Edge/exploit:** a rep-farmer attends all four festivals every year expecting to climb to Pillar fast; the +2/season cap and the lost labor days mean they gain standing slowly and fall behind on the fields — the cap doing its job.

---

# 18. Building Upgrade Trees (beyond MVP)

## Recap

The §8 core buildings sit at the base of **upgrade trees** — each structure can be climbed one tier at a time, at escalating cost, for stronger effects. The tree a player climbs (labor / storage / water / atonement / cruelty) expresses their strategy. Some tiers are post-MVP (D-033).

## Numbers & formulas

| Tree | Tier 1 | Tier 2 | Tier 3 (post-MVP) |
|---|---|---|---|
| **Housing** | Bunkhouse (80c, houses 5, −0.5 winter fuel) | Longhouse (200c+15 stone, houses 10, −1.0 fuel) | Barracks (400c, houses 16) |
| **Storage** | Cellar I (60c, +50% life) | Cellar II (140c, +100% life) | Ice House (260c, +150% life, meat keeps) |
| **Water** | Well (90c, drought 0.70→0.90) | Cistern (160c, →0.95 + a water reserve vs one drought/yr) | — |
| **Atonement** | Shrine (50c, −1/season Reckoning) | Chapel (180c, −2/season + can host cleansings on-site) | — |
| **Livestock** | Barn (120c, cap 8) | Big Barn (240c, cap 16, +manure eff.) | — |
| **Cruelty** | Vat (300c, grow clones) | Vat II (250c, faster grow / better quality) | — |

- Each upgrade requires the prior tier + coin + materials + clone-days, and **cannot be built in Winter** (§8).
- **Demolition recovers 25% materials, no coin** (§8) — no refund loop.

## Intended experience

The homestead should visibly *become* something over a lifetime — and the shape it takes (a Longhouse-and-Vat labor factory, a Cellar-and-Cistern market operation, a Shrine-and-Barn humble holding) should read at a glance as the story of how the player chose to survive.

## Four failure modes checked

**Too easy** — rush upgrades and snowball. Defense: escalating costs; no-winter-building; the §8 opportunity-cost counters. **Verified counter:** *each upgrade tier should pay back over multiple seasons, not immediately — no tier is a Year-1 rush, and the Vat tree carries the §6 Reckoning drip (D-034).*

**Too hard** — upgrades unaffordable, farm stalls. Defense: upgrades are optional accelerators; the cheap first tiers (Shrine 50, Cellar I 60) give incremental wins.

**Boring** — spend-and-wait. Defense: *which tree to climb* is the strategy; limited warm-season build-days force prioritizing one tree per year.

**Exploitable** — build-then-demolish refund; overbuild storage to hoard-arbitrage. Defense: 25% recovery / no coin (no loop); storage caps + storage life + tied-up capital bound hoarding (§2 H-05). **Verified counter:** *no build/demolish cycle is coin-positive, and storage upgrades never make warehouse arbitrage beat replanting (H-05).*

## Balancing levers

The full tier cost/effect table; prerequisite chains; the no-winter rule; demolition recovery (25%); the Vat-tree Reckoning drip (D-034).

## Sample scenarios

- **Normal:** a Year-4 market-focused farm climbs the storage tree (Cellar II) and the water tree (Cistern), timing sales to the Winter peak and shrugging off the Summer drought. A coherent build identity.
- **Edge/exploit:** a player builds and demolishes a Cellar repeatedly hoping to recoup materials; each cycle loses 75% of the timber and all the labor — the anti-refund number holding.

---

# 19. Vane-Mystery Mechanics

## Recap

The narrative three-truth mystery (Part 3, D-014) runs on a hidden mechanical spine: a seeded **truth**, a hidden **clue meter** the player fills by investing in the Vanes, **reveal thresholds** tied to relationship tiers, and **payoff branches** (kind/cruel) that hook into the market, clone stock, and the season arcs. It is optional content with a real cost of entry and a real reward.

## Numbers & formulas

- **Seeding:** at lineage start the PRNG (D-021) fixes one truth (`spy` / `third_vane` / `vessel`). Immutable for the lineage; recorded in the Codex on reveal (D-015).
- **Clue meter (hidden, 0–100):** filled by — befriending a Vane (**+10 per relationship tier gained**, Meredith or Ambrose), the shared-surface clue events (**+8 each**, §16-family cards), an Old Nan or Doc Bell reveal (**+20**), and triggers (the Rail arc, a Reckoning-tier crossing: **+15**).
- **Reveal thresholds:** at **Warm** relationship *or* clue ≥ 40 → the player learns *there is a secret* (the surface). At **Bonded** *or* clue ≥ 80 → the active truth resolves.
- **Payoff hooks:** **kind branch** → improved Ambrose clone stock/prices (§3, −10%), deeper Meredith Black-Market access (§2), a defended town (blunts the Cawdor/Cassius endgame). **cruel branch** → a coin/power windfall now (blackmail, sale, alliance) at a **−reputation and +Reckoning** cost, and a worse town endgame. Resolutions fire through the Year-5 and Year-8 arcs (§13/Part 4).

## Intended experience

The mystery should feel like something you *earn by paying attention to people* — years of small investments in two guarded siblings, resolving into a secret that recolors everything and hands you a genuine, weighty choice.

## Four failure modes checked

**Too easy** — the mystery is a free reward. Defense: the clue meter requires sustained relationship investment (time, festival attendance, coin) and engagement with events; the payoff has a real cost branch. **Verified counter:** *uncovering a truth requires investment across multiple in-game years (≥2 relationship tiers + several clue events) — never a single lucky roll.*

**Too hard** — the mystery never surfaces / is opaque. Defense: the surface clues fire systemically once you engage the Vanes; Old Nan and Doc Bell offer guided reveals (+20); the Codex teaches returning players what the clues meant.

**Boring** — a fetch quest. Defense: the three truths are distinct and reactive; the ambiguity (which truth?) holds until Bonded; the choices carry real moral and mechanical weight (esp. Truth C).

**Exploitable** — save-scum to learn or re-roll the truth. Defense: seeded and immutable per lineage (D-021) — reloading reveals nothing and cannot change the truth. Ignoring the mystery entirely is a valid choice, not an exploit (it forgoes the payoff).

## Balancing levers

Clue-meter fill rates (tier +10, event +8, oracle +20, trigger +15); reveal thresholds (40 / 80, or Warm / Bonded); payoff magnitudes (Ambrose −10%, Black-Market access, cruel windfall vs. its rep/Reckoning cost).

## Sample scenarios

- **Normal:** over Years 2–5 the player drinks at Meredith's, does her small favors, and pieces together the clues; at Bonded the truth lands (Truth A, the spy), and they spend the Year-5 Auction arc helping her break the Cawdor Mill's hold — earning both Vanes and a town that holds.
- **Edge/exploit:** a player reloads the day they hit Bonded hoping for a different (juicier) truth; the seed is fixed, the truth doesn't change, and they learn the mystery is theirs to uncover, not to shop for.

---

*Supplementary systems §16–§19 complete (issue #8). The Mechanics Bible now covers all core and supplementary systems; every mechanic referenced by the game is spec'd to the template with hard numbers and verified counters.*
