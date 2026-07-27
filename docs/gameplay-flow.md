# Bushel & Bone — Gameplay Flow & Controls Spec

**Status: WRITTEN** (GitHub issue #18). The canonical **operational** spec — how the game is actually *operated*, screen by screen. This is deliberately separate from [`vertical-slice-year1.md`](vertical-slice-year1.md), which is the *content* spec (what happens in Year 1). This doc answers a different question: **"I am holding the game — what do I look at, what do I tap, and what does it do?"**

It is written against the shipped prototype, [`../prototype/year1.html`](../prototype/year1.html). Every control, label, and number below matches that build. When the prototype changes, update this doc in the same commit.

**Who this is for:** the UI-clarity pass (#19) and the tutorial (#20) both build on it. A person who has never seen the game should be able to read this and correctly operate every screen.

---

## 1. The one-sentence loop

> You are a newcomer working a homestead through **one year — four seasons, the frost at the end.** Each season you **plant**, **set your one farmhand to a task**, **weather what comes**, **bring in the harvest and sell or store it**, and **live off what you laid by.** Survive to the next spring. The land keeps accounts of how you treat the hand — but it never shows you the ledger.

**Win:** reach Year 2, Spring, with the **farmer** alive.
**Lose:** the farmer **starves or freezes**. (Farmhands can die without ending the run — only the farmer's death ends it.)

There is **no failure by debt** in Year 1: the mortgage is in its two-year grace, so the only enemy is winter.

---

## 2. The play surface (the persistent frame)

The whole game is a single portrait "almanac page." Four zones are always on screen, top to bottom:

```
┌─────────────────────────────────────────┐
│  BUSHEL & BONE · The Newcomer      ☾night │  ← brand + theme toggle
│  Spring                          [glyph]  │  ← MASTHEAD: season · year · weather
│  Year One · Spring                Mild    │
├───────────┬───────────┬─────────┬────────┤
│  COIN     │  LARDER   │  FUEL   │  SEED   │  ← LEDGER STRIP (the four resources)
│  100 m    │  80       │  0      │  20     │
├───────────┴───────────┴─────────┴────────┤
│  Reuben ●●●○○   ·   Regard  Known         │  ← HOUSEHOLD ROW (crew + standing)
├───────────────────────────────────────────┤
│                                           │
│   THE LEAF  (the day's card / screen)     │  ← the only part that changes
│   — brief, event, planting, market,       │
│     dusk report, or year-end —            │
│                                           │
├───────────────────────────────────────────┤
│  An Illustrated Almanac of the Sallows   seed │  ← colophon (+ the run's PRNG seed)
└───────────────────────────────────────────┘
```

### 2.1 The masthead
- **Season · Year · Weather.** The season name and a small **weather glyph** for the season now in play (sun / cloud / rain / hail / snow). Weather is rolled once at the start of each season and shown here.
- **Theme toggle (`☾ night` / `☀ day`).** Switches between the daylight almanac and the same page read by candlelight. Cosmetic only.

### 2.2 The ledger strip — the four resources
This is the heart of what the player manages. Left to right:

| Ledger | In-world name | What it is | Why it matters |
|---|---|---|---|
| **Coin** | marks (`m`) | money | buys seed, coal, farmhands, fences |
| **Larder** | food | stored food | the household eats it **every season**; run out in winter and someone dies |
| **Fuel** | fuel | wood/coal laid by | **only spent in winter**; too little and the frailest freezes |
| **Seed** | seed | seed stock | spent first when planting (before coin) |

The strip **colors a number when it is getting dangerous** (Larder goes amber then red as it drops; Fuel warns in Fall/Winter if it is below the winter need). This is the game's only always-on warning system.

### 2.3 The household row
- **Reuben ●●●○○** — your farmhand's **morale**, five dots. High morale = he works harder (and, later, the land is kinder); low morale = he works poorly. Starts at 3 of 5. If he dies, this reads *"a marked grave."*
- **Extra hands** — any farmhand you buy or take in shows here too, with their own morale.
- **Regard** — your **standing in Marrow's Cross**, shown as a word, not a number: *Suspect → Stranger → Known → Welcome → Kin.* Starts at **Known**. Rises by attending festivals and keeping the town's ways; falls by snubbing them.

### 2.4 The leaf
The only zone that changes. It shows exactly **one screen at a time**, and every screen ends with at least one button that advances the game. The screen types are catalogued in §4.

---

## 3. The core loop

A **year** is four **seasons** (Spring → Summer → Fall → Winter). Each season runs the same pipeline of screens. You advance by tapping; there is no timer.

```
        ┌──────────────────────── ONE SEASON ────────────────────────┐
        │                                                            │
  BRIEF ─▶ PLANT ─▶ ASSIGN ─▶ EVENT(S) ─▶ (grow) ─▶ HARVEST/MARKET ─▶ DUSK
   what      set      give     scripted    crops      bring in &        eat,
   weather   the      Reuben   beats +     advance    sell or store     drift,
   & scene   fields   a task   1 systemic             the harvest       an omen
        │                                                            │
        └──────────────▶ turn the season ──────────────▶────────────┘
                                   │
                     after WINTER: resolve food + fuel
                                   │
                          ┌────────┴────────┐
                    farmer lives        farmer dies
                          │                  │
                  "I survived           "The Sallows
                   another year."        keeps the land."
                    (Year 2)                (run ends)
```

Winter is the exception: it has **no planting**, and instead of a normal Dusk it runs the **winter resolution** (§4.8) that decides the run.

---

## 4. The screens, one by one

Each entry says: **what it shows**, **what you do**, and **what advances it**.

### 4.1 Brief / scene card
- **Shows:** an eyebrow (e.g. *"Summer · the market opens"*), a title, sometimes a bracketed *stage-direction* line in the omen voice (*[a wagon-rutted road, four cleared fields…]* — these are the future home of a scene image, #21), and prose.
- **Do:** read.
- **Advance:** a single primary button (*"Walk the fields," "To work," "Begin," "Face it"*).

### 4.2 Event / beat card (scripted or systemic)
The game's main decision unit. **Scripted beats** fire on schedule (Silas's Welcome, Vane's Wagon, the moral fork, Harvest Home, the Long Vigil). **Systemic events** are drawn one per season from a pool (Soft Rain, Crows in the Corn, the Pedlar, a Foundling, …).
- **Shows:** eyebrow + title + optional stage-direction + prose, then **2–4 choice buttons**.
- **Each choice** has a **flavor label** and, on most, a **plain sub-line** stating the effect (*"+regard, a blessed field… but Reuben rests today"*). A choice you cannot afford is **disabled** (greyed).
- **Do:** pick one.
- **Advance:** picking a choice applies its effects and either advances or shows a short **result line** (*"He nods and rides off…"*) with a **Go on** button.

> **Reading a choice:** the label is the *fiction*, the sub-line is the *mechanics*. "Buy the Grower — 110 m / *strong labor; a heavy winter mouth*" means: costs 110 coin, gains a strong worker, but now you must feed two mouths through winter.

### 4.3 Planting
- **Shows:** your four fields as rows. Each **empty** field offers a row of **crop chips** (Turnip, Potato, Wheat, Corn, Cotton, and **fallow**), each chip showing its seed cost. Each **already-planted** field shows its crop and how far along it is (*"coming on (50%)"* / *"ripe this season"*). Fields also show **fertility** (●●● → ○).
- **Do:** tap a chip to choose that field's crop. Seed is spent first, then coin; a crop you cannot afford is disabled. Choosing **fallow** rests the field (it regains a fertility dot).
- **Advance:** **Sow it so** — confirms the planting and pays for it.
- *(In Summer/Fall this screen only appears if a field has come free; in Winter it does not appear at all.)*

### 4.4 Assignment — Reuben's one task
Your farmhand does **one job per season.** The offered jobs depend on the season:
- **Set Reuben to tending** — *+2 yield to one field, and it ripens a touch faster.* (Auto-applies to your most valuable planted field.) Offered when something is planted.
- **Send Reuben to the woodline** — *+16 fuel laid in for winter.* The fuel/harvest tension of Fall.
- **Let Reuben rest the season** — *his spirits mend (+morale).*
- **Do:** pick one. **Advance:** picking it applies the job and shows a one-line result.

### 4.5 Grow (automatic — no screen of its own)
Between assignment/events and harvest, every planted field advances by `1 + weather + (tended ? a little)`. Good rain speeds it; dry slows it. A crop is **ripe** when it has grown for its required number of seasons (1 for turnip/potato, 2 for wheat/corn/cotton).

### 4.6 Market
Appears only if something was harvested this season.
- **Shows:** each **harvest lot** (crop + amount). For each **food crop** you get a two-way toggle: **larder** (turn it into food) or **sell** (turn it into coin), with the projected gain shown live. **Cash crops (cotton)** have no choice — they always sell.
- **Do:** toggle each lot the way you want it. This is the game's central tension: **coin now vs. a full belly in winter.**
- **Advance:** **Close the day-book** — applies every toggle at once (adds the coin, adds the food).
- **Pricing note:** sell price = crop's base × the season's multiplier; the first ~10 units of a lot sell at full price and the rest at a **glut discount** (dumping a huge harvest locally knocks the price down).

### 4.7 Dusk report (Spring / Summer / Fall)
- **Shows:** a closing day-book — the season's weather, what you brought to market, what went into the larder, **what the household ate** (the seasonal food cost), and the **larder now.** Below it, when the land has anything to say, an **omen** (see §5) in the muted omen voice.
- **Do:** read.
- **Advance:** **Turn the season →** (or **Toward winter →** after Fall).

### 4.8 Winter — provisioning and the resolution
Winter replaces planting and the normal Dusk with the crucible:
- A **Winter Readiness** callout shows **Larder X / need** and **Fuel Y / need**, colored met/short.
- A **Provision** screen lets you buy against the shortfall with steppers: **coal** (3 m → 2 fuel) and **grain** (2 m → 1 food), with a live "after buying" readout. **Lay it in** confirms the purchase.
- Reuben can be sent to **chop** for more fuel, or **rest.**
- If you are short, **Sister Ruth's Basket** may appear (accept: +18 food, +14 fuel at a small regard cost — the tutorial-year safety net).
- Then the **resolution** runs, in order:
  1. **Fuel first.** If fuel < need, the **frailest farmhand freezes** (a marked grave), which lowers the remaining need; repeat. If only the farmer is left and fuel is still short → **the farmer freezes → run ends.**
  2. **Food next.** The **farmer eats first** (needs ~20 for the winter). If the larder can't cover that → **the farmer starves → run ends.** Then farmhands are fed strongest-first; a hand that gets a partial ration **goes hungry** (loses morale); one that gets almost nothing **starves.**
- Survive both and it is **Spring, Year Two**: *"I survived another year."*

### 4.9 Year-end
- **Shows:** win or loss. On a win, a tally (coin, larder, the crew that lived, standing) and a line about what the land noticed this year (the only place the hidden layer is even obliquely summarized — still never as a number). On a loss, how it ended.
- **Advance:** **Play another first year** / **Take the charter again** — restarts with a **new random seed** (new weather, new event draws).

---

## 5. The hidden layer (design rule — do not violate)

Two things about the player's conduct are tracked but **never shown as a number, ever**:
- **The Reckoning** — the land's memory of cruelty. Raised by cruelty (refusing Reuben a name, turning a foundling out into the cold); eased by rite (sitting the Long Vigil) and by a clean season. It surfaces **only as omens** in the Dusk report — crows that won't call, milk that sours, footprints in the frost — escalating in tone as it climbs (*Whispers → Warnings → Walkers*).
- **Morale → labor** (partly visible as Reuben's dots, but its exact effect on yield is not stated).

**Rule for all future UI and tutorial work:** these are felt, not read. Never add a "Reckoning meter." Never let a tooltip say a hidden number. The dread lives in the *absence* of a gauge. A cruel player should feel watched without ever being told the score. (See the voice guide's hidden-axis rule.)

---

## 6. Resource & rules reference (as built)

Compact reference for the exact numbers in the prototype. Full rationale lives in the Mechanics Bible / balance model; these are what the current build uses.

**Starting state:** 100 coin · 80 food · 0 fuel · 20 seed · 4 small fields (fertility ●●●) · Reuben (morale 3) · Regard *Known.*

**Crops (per field, at full fertility):**

| Crop | Seed cost | Seasons to ripen | Yield | Food each | Base sell | Notes |
|---|---|---|---|---|---|---|
| Turnip | 3 | 1 | 7 | 1.5 | 2 | fast root |
| Potato | 6 | 1 | 10 | 2 | 2 | belly-filler |
| Wheat | 4 | 2 | 8 | 1.5 | 3 | grain |
| Corn | 5 | 2 | 9 | 2 | 4 | grain |
| Cotton | 10 | 2 | 5 | 0 | 12 | cash · needs 2 hands (half if 1) |

*Harvest yield = yield × (fertility ⁄ 3), +2 if tended. Each harvest drops the field one fertility dot; a fallow season restores one.*

**Market multipliers (base × season):**

| Season | Grain/Root | Cash |
|---|---|---|
| Spring | ×1.1 | ×0.9 |
| Summer | ×1.0 | ×1.2 |
| Fall | ×0.8 | ×1.05 |
| Winter | ×1.25 | ×0.95 |

*First ~10 units of a lot at full price; the remainder at ×0.7 (glut).*

**Weather (rolled per season, shown in the masthead):** Dry (growth −) · Mild (normal) · Good rain (growth +) · Rough → **Hail** in Summer/Fall, **Cold snap** in Winter (+10 fuel need).

**Consumption per season:** farmer + Reuben = **30 food** (Spring/Summer/Fall), **35** in Winter. **Each extra hand** adds **+10** (**+15** in Winter). **Winter fuel need** = **45** (+10 in a cold snap, +8 per extra hand).

**Provision prices:** coal 3 m → 2 fuel · grain 2 m → 1 food.

**Farmhand prices (Vane's Wagon):** Field Hand 60 m · Grower 110 m (haggle to 100 if well-regarded).

**Mortgage:** 150/yr to Silas Ridley, **but Years 1–2 are grace** — no Year-1 payment, cannot be lost to foreclosure.

---

## 7. Glossary — voice label → plain function

The prototype names its controls in the alt-1800s register. This is the decoder (and the raw material for the dual-labels in #19):

| You see | It means |
|---|---|
| **Sow it so** | Confirm the planting; pay seed then coin |
| **Close the day-book** | Confirm the market; apply every larder/sell toggle |
| **Lay it in** | Confirm the winter provisioning purchase |
| **larder** (toggle) | Send this harvest to food |
| **sell** (toggle) | Send this harvest to coin |
| **Set Reuben to tending** | Assign the hand to a field (+2 yield there) |
| **Send Reuben to the woodline** | Assign the hand to chop (+16 fuel) |
| **Let Reuben rest** | Assign the hand to rest (+morale) |
| **Turn the season →** / **Toward winter →** | Advance to the next season |
| **Go on** / **Say nothing** / **Begin** / **Face it** | Advance past a result or brief |
| **Regard: Known** | Your town standing, as a word not a number |
| **omen** (italic, at Dusk) | The land noticing your conduct — the hidden Reckoning, shown only as mood |

---

## 8. Legibility gaps (resolved by #19)

The five gaps below were the checklist for the UI-clarity pass (#19); all five are now closed in `prototype/year1.html`:

1. ~~Voice-only button labels.~~ Every advance button now carries a plain sub-line (`Sow it so` / *confirm the planting; pay seed then coin*, etc.).
2. ~~Unexplained ledger.~~ The four ledger cells (Coin, Larder, Fuel, Seed) are tappable; each opens a plain-English explanation, independent of guided-mode status.
3. ~~Costs not always previewed.~~ Every choice states its effect in `sub`; choices with a clear resource cost or gain also carry a structured `tag` badge (e.g. `−regard`, `+heart`). Choices that move the hidden Reckoning never carry a tag naming it, per §5.
4. ~~No "what do I do here?"~~ A masthead "?" toggle explains the current screen type on demand, keyed by a `screenType` set on every render.
5. The hidden layer stays invisible by design (unchanged, correct) — no tag, badge, or help text anywhere names or numbers the Reckoning.

Additionally, disabled choices and the planting screen's crop chips now explain themselves: disabled choice buttons show a `why` line instead of their normal sub-line; disabled crop chips are tap-to-reveal (not hover-only, for mobile) via the same popover mechanism used by the ledger and screen-help toggles.

---

*This spec is the operational contract for the prototype. Content lives in `vertical-slice-year1.md`; numbers trace to the Mechanics Bible and `balance-model/config.py`; this doc is how it all reaches the player's thumbs. Keep it in lockstep with `prototype/year1.html`.*
