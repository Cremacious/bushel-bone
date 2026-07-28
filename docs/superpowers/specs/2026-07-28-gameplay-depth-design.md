# Gameplay Depth: the Action Economy, Exploration, and the Difficulty Curve

*Design spec — 2026-07-28. Status: proposed, pending review.*

## The problem

Playtesters find the prototype **interesting but not fun**. The tone and premise land; the gameplay does not. A whole year plays out in a few minutes, because the only real decision is what to plant — everything else is tapping through a fixed script. There is no world to explore and no scarce resource being spent on competing choices, so there are no real decisions.

This spec fixes that with one connected machine: a **season time-economy** (scarcity), an **explorable Marrow's Cross** (agency and story), and a **fair year-over-year difficulty curve** (rising stakes), inside a **legacy-survival structure** with a longevity score.

It respects the locked decisions it touches: D-006 (town is a menu, not spatial gameplay), D-007 (nested Year → Lifetime → Lineage runs), D-027 (heir inherits 25% reckoning; new land starts at 0), and D-028 (meta-progression is content-not-power). It **refines the framing** of the game from "roguelite" toward "legacy/dynasty survival sim" — see §7.

## Design goals

1. Every season forces real decisions under scarcity — you can never do everything.
2. Marrow's Cross becomes a place you choose to explore, delivering the story and the tools to survive.
3. Difficulty rises fairly, one telegraphed pressure per year, never a random spike.
4. The game is endless by design; you play to *last*, and a legacy score rewards lasting longer, cleaner, and deeper into the story.

---

## 1. The core loop: the season as a time-economy

Today a season is a cutscene: plant → one festival → one random event → harvest. The change makes **time the scarce resource**.

**Shape of a season.** Fixed bookends stay — a Morning Brief to open, planting, the one festival beat, and Harvest/Dusk to close. Between them sits the new part: a run of **action-days** (start at **6 per season**; a tuning lever) where each day the player spends on exactly one activity:

| Action | What it does |
|---|---|
| **Work a field** | Tend a crop (raise yield/quality, harden it against a coming event), break new ground, or fight taint. |
| **Ride to town** | Spend the day in Marrow's Cross (§2). One destination per trip. |
| **Tend the hands** | Shore up morale, ease the reckoning, deal with a sick or breaking clone. |
| **Handle what's happening** | A live event (weather, pests, a caller) sometimes claims a day. |
| **Rest** | Recover a hand's morale or your own footing; the day is spent. |

Crops grow in the background across the season regardless; **working** them is what makes them thrive. So the loop becomes: *you never have enough days for everything that matters.*

**First principle — over-subscription.** The season must always dangle **more worth doing than 6 days allow**. Early years mildly (7–8 pulls vs 6 days); later years brutally (11–12 vs 6). The budget stays flat; the demands pile up. The skill is choosing well; that is the gameplay.

**Four failure modes.**
- *Miscalibration* — one clean knob (days per season vs how many demands compete). No hidden math.
- *Dominant strategy* — no single action wins; the economic squeeze (§3) forces a shifting mix. Pure-farming starves you of cash; pure-town starves you of food.
- *Cheese* — days can't be banked or farmed; they reset each season. Town rewards are gated/rotating (§2).
- *Emotional flatness* — the reason to spend a scarce day in town is story and people (§2), the opposite of wallpaper.

---

## 2. Exploration: Marrow's Cross as a place you explore

**"Ride to town" spends one action-day and opens a menu of destinations — and you visit only *one* per trip.** That single constraint gives the town distance and weight: you can't see everyone, so who you spend the day with is a real choice. This satisfies D-006 (travel is a menu, not spatial gameplay) and delivers the text-adventure feel.

**Destinations** (each a canon NPC/location, each a short text scene):

| Place | Person | What it's for |
|---|---|---|
| The saloon | Meredith Vane | Rumors, market intel — learn to sell high. Town gossip hub. |
| The edge of things | Old Nan | The *only* reading on the hidden reckoning; folk-truth; Malachi's spiritual trail. |
| The bank | Silas Ridley | The mortgage, loans, extensions — where the squeeze is negotiated. |
| The church | Grange & Sister Ruth | Charity when short; moral standing; quieter counsel. |
| The surgery | Doc Bell | Medicine for sick hands; more rumors. |
| The law | Sheriff Coldwater | Cruelty investigations; Malachi's cold case. |
| The wagon / store | Ambrose Vane, Halloway | Hiring, goods, seed; civic contracts. |

**Two layers** (this is the content model; alternatives — pure authored arcs, or a pure random deck — were rejected for being low-replay and world-as-slot-machine respectively):

- **Standing** — each NPC has a **stranger → known → trusted** tier that *builds across visits* and gates deeper content: better deals, their personal arc, the Malachi threads. Standing is per-NPC and lightweight; it is *not* the same as the global **Regard** meter (how the whole town sees you). They measure different things and stay separate.
- **A rotating opportunity deck** — every visit also surfaces something situational (a rumor, a contract offer, a one-off crisis), drawn so visits don't go stale and don't repeat back-to-back.

**Why a town-day is worth it.** Town is where you get the *tools to survive the squeeze* — contracts (guaranteed cash), market intel (sell high), hiring, a mortgage extension, charity — **and** where the story lives (NPC arcs, Nan's reckoning intel, Malachi's mystery). Every town-day is an investment traded against a farm-day.

**Four failure modes.**
- *Miscalibration* — standings and deck rewards tune per tier; the strong help is gated behind standing built over seasons, so town can't trivialize an early year.
- *Dominant strategy* — no "always go to town": a town-day costs food/work you need, and each NPC serves a different need, so the *right* destination shifts with your situation.
- *Cheese* — one visit per town-day; standings rise slowly; deck opportunities don't repeat consecutively. No grinding a single NPC.
- *Emotional flatness* — persistent people with memory and arcs are the fix.

---

## 3. The difficulty curve: the economic squeeze, year by year

**The rule that keeps it fair:** the action budget never grows (6 × 4 = **24 action-days a year**), and every new pressure is **scheduled and telegraphed**. Difficulty rises because *more things demand your days*, never because a hidden number got meaner or the dice turned. You see it coming a year out.

Each year adds **one** new, visible pressure (the MVP is the 4-year first lifetime; `docs/scope-mvp.md`):

| Year | The new pressure | Household | Mortgage | Feel |
|---|---|---|---|---|
| **1 — Newcomer** | none — learn the loop | you + Reuben | grace (0) | Easy on purpose. Safety nets on (Ruth's basket). ~7 pulls vs 6 days. |
| **2 — Footing** | safety nets fade; winter math gets real | +1 hand | grace (0) | Training wheels off. ~8–9 pulls. |
| **3 — The Note Comes Due** | **the mortgage: 150 marks/yr** (Silas warned you Day 1) | +1–2 | **150** | A subsistence farm *can't* pay it. Forces cash crops / town contracts. ~10 pulls. |
| **4 — The Vise** | reckoning overlay peaks; costs highest | peak | 150+ | Climax of the first lifetime. ~11–12 pulls vs 6 days. |

**The squeeze's four knobs** (first-pass values; the balance model `docs/balance-model/config.py`, D-032, calibrates the real numbers):

1. **Mortgage** — 0 → 0 → 150 → 150+. The headline clock, telegraphed from Year 1.
2. **Mouths to feed** — every hand added needs food + winter fuel, i.e. more *field-days* to sustain. Growing your crew raises your own demands — a pressure the player *chooses*, which reads as fair.
3. **Field fertility** — land overworked yields less over years, so you must rotate/rest (costing a season's harvest). Slow attrition that rewards planning.
4. **Cost of living** — small, rising upkeep (tools, repairs).

**Reckoning and weather are overlays, not the spine.** The reckoning rides *on top* of the money curve, so the years you're most desperate for cash are the years cruelty tempts you hardest — the economics *manufacture* the moral drama. Weather adds texture but is bounded so it never becomes the random spike we're avoiding.

**Why it stays fun and fair:** the tools to meet each year's pressure appear in town the year *before* you need them — contracts, intel, a bigger crew, an extension. A smart player who spends days wisely keeps pace; a sloppy one falls behind. The challenge is allocation under a clock you can read, not reflexes or luck.

**Four failure modes.**
- *Miscalibration* — one dial (pulls-per-season vs 6 days) plus a fixed mortgage schedule; the balance model exists to tune it.
- *Dominant strategy* — the winning mix shifts every year (Year 1 rewards caution; Year 3 punishes it), so no single build carries a whole lifetime.
- *Cheese* — mortgage and mouths can't be dodged; fertility stops infinite mono-cropping; town help is gated by standing.
- *Emotional flatness* — the reckoning-on-money coupling makes the desperate years the tempting ones.

---

## 4. Structure: legacy survival, succession, endings, and score

**Length is nested, not a fixed number (D-007).** Year (the tactical loop) → Farmer's Lifetime (several years; the farmer ages out or dies) → Family Lineage (generations of heirs on the same land). A farmer's death is **not** a game-over: an heir takes up the same ground and plays on. A run ends **only** on **line-death** (the bloodline runs out) or **land-loss** (foreclosed, burned, or the Marrow reclaims the land — the Salting repeated). The full intended arc runs to **Year 10** (the Old Well opens Year 7; the reckoning climaxes Year 10). The **MVP target is the 4-year first lifetime** — exactly the curve in §3.

**Succession vs. a fresh start** (the incentive structure the loop turns on):

| | Continue as heir (same land) | New lineage (new land) |
|---|---|---|
| Reckoning | inherit **25%** of yours — ≈0 if kind, a real weight if cruel (D-027) | resets to **0** |
| Debt | the mortgage rides with the land | a fresh charter, a fresh mortgage |
| The land | keep it **improved** (cleared fields, buildings, fertility, fences) | raw and weedy — start over |
| The town | your family is *known*; standings carry | a stranger again |
| Story / Codex | continues toward the payoff | restarts the mystery |

The debt is the **price of inheriting a built farm** (you're handed capital; the mortgage is the interest). The only true handicap is the 25% reckoning, and it is **self-inflicted**: kind play makes your legacy a gift to your heir, cruelty makes it a curse they can only flee by abandoning everything you built. **Balance requirement:** for a lineage that played well, the inherited capital must visibly outweigh the inherited debt, so continuing reads as a reward, not a punishment.

**Endless by design, with a legacy score.** The squeeze compounds until every lineage eventually falls — you play to *last*, not to win ("I survived another year," D-001). A **legacy ledger** at run-end scores: years survived, generations, how much of Malachi's truth was uncovered, the condition of the land passed on, and the moral tenor (kind vs cruel). The chase is to last longer, cleaner, and deeper than last time.

**Narrative peaks along the climb.** The Old Well (Year 7) and the reunion (Year 10) are authored high points, not hard stops. On the deferral thesis (§0.6): a kind, low-reckoning lineage earns the **bittersweet best** — the seal renewed, the vigil handed to an heir on a loved land, and the rare **reunion** where the player finally names Malachi and gives him his grave. Frayed survival and the Salting-repeated are the other shapes.

**Meta-progression is content-not-power + skill + score (D-028 upheld).** Across campaigns you unlock *breadth* (crops, events, archetypes, Codex truth) and improve by *skill*; you never get *stronger*. The progression is the legacy score. This deliberately refuses the power-creep loop, which would be at war with a game about a debt you can only defer.

---

## 5. How the story rides the loop

The exploration layer (§2) **is** the story's delivery system. Malachi's mystery comes through his journals (already built, #43) plus Old Nan, Sheriff Coldwater, and Reuben; each NPC has an arc; each year has a Season Arc. The **economic squeeze is what makes the story land** — the years you're most desperate for cash are the years cruelty tempts you hardest. Story, exploration, and difficulty are not three features; they are one machine.

---

## 6. What changes in the prototype (scope)

**Target: the 4-year first lifetime** (the MVP arc), built on the new machine.

- **New:** the season action-economy (§1); the town exploration menu with standing + deck (§2); the year-over-year squeeze and the multi-year frame (§3); succession between years/lifetimes and the legacy ledger (§4).
- **Reused/extended:** the existing planting, hands/roster, market, provisioning, reckoning, and event systems become *things you spend action-days on*, not fixed steps. The #43 journals, #45 name tokens, and #46 script/`.docx` pipeline all carry forward — new town scenes are authored in `content/script.yaml`.
- **Staging (for the implementation plan, not this spec):** build and validate the new single-season loop first, then Years 1–2 (to feel the ramp), then extend to 4. Ship nothing that isn't fun at each stage.
- **Next horizon (post-MVP, canon-written):** the Year-7/10 Old Well endings and full multi-lifetime lineage play.

---

## 7. Locked-decision deltas

- **Refines framing (new decision to log):** Bushel & Bone is a **legacy/dynasty survival sim**, not a traditional roguelite. Meta is content-not-power (D-028); the progression is a legacy/longevity score; you never get stronger, the world gets richer and you get better. This clarifies the "true roguelite meta" language in D-007 without changing its mechanics.
- **New decisions to log:** the **season action-economy** as the core loop; **Marrow's Cross exploration** (menu of destinations, per-NPC standing + rotating deck, one visit per town-day); the **economic-squeeze difficulty model** (flat budget, one telegraphed pressure per year); the **legacy ledger** score.
- **Upheld unchanged:** D-006 (menu not gameplay), D-007 (nested runs, run-ends), D-027 (25% reckoning inheritance; new land at 0), D-028 (content-not-power), D-009 (three-beat day — the action-days *are* the "Play" beat).

## 8. Open questions to resolve later

- Exact numbers for all four squeeze knobs and the pull-count per year — owned by the balance model (Q-003).
- The legacy-ledger scoring weights.
- How far standing content is authored per NPC for the MVP vs. deferred.
- The prototype build staging (single season → 2 years → 4).
