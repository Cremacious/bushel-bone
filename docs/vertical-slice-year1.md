# Bushel & Bone — Year-1 Vertical Slice: "The Newcomer"

**Status: WRITTEN** (GitHub issue #7). The one fully-specified year — every mechanic, number, event, and NPC beat that appears in **Year 1**, fused into a single playable spec. This is what we **paper-prototype** (#11) and **build first**. It is deliberately *forgiving* (a tutorial lifetime's first year) but *complete* — it exercises the whole core loop end to end.

**Cross-checked against:** ratified numbers (D-032, `docs/balance-model/config.py`), MVP scope (D-033, `docs/scope-mvp.md`), the world (D-029/030/031), the cast (Narrative Bible Part 2), the voice (`docs/style-guide.md`).

---

## 1. What Year 1 is

A newcomer takes over a homestead in the Sull and works it through one year (four seasons, 80 days), meeting the town, learning the loop, and surviving the first winter. Per the founder story (D-038, narrative-bible Part 0), the newcomer is the **heir of Uncle Malachi**, a farmer they never met who worked this land for twenty years and then vanished into the Old Well, leaving no grave and a shelf of journals. Year 1 plays as arrival and inheritance; the founder mystery only whispers here (a first journal entry, a word from Reuben who was Malachi's hand), and deepens across later years. **Year 1 has no mortgage payment** (the 2-year establishment grace, D-032/§13), so it cannot be lost to foreclosure; the only failure is starving or freezing the household. It teaches every system at low stakes and ends on the Long Vigil — the town's rite over the thing in the ground — so the player leaves Year 1 having *felt* the whole game in miniature.

**Win:** reach Year 2, Spring Day 1, with the farmer alive.
**Lose:** the farmer starves or freezes. (Clones can die; the run only ends if the farmer does.)

---

## 2. Starting state (Year 1, Spring, Day 1)

| Thing | Value | Notes |
|---|---|---|
| Coin | **100 marks** | |
| Fields | **4 small, cleared** | ratified starter (D-032). Small = 0.8× yield, +10% quick-ground (D-029). |
| Clone | **1 — "Reuben," Field Hand, Body Average, Mind Average** | was Uncle Malachi's hand and stayed with the land; the one soul on the farm who remembers him (D-038). |
| Journals | **Malachi's almanac-notebooks** | a readable in-game object; entries unlock over time and pace the Marrow reveal (D-038). |
| Food | **80 units** | the starting larder. |
| Seed | **20 (mixed wheat & potato)** | enough to plant the four fields once. |
| Fuel | **0** | must be laid in before winter. |
| Buildings | **Lean-to** (houses 2), homestead, the four fields | no barn, cellar, or Vat (Vat is post-launch anyway, D-033). |
| Mortgage | **held by Silas Ridley, 150/yr — but in grace Years 1–2** | introduced Day 1; first payment not until end of Year 3. |
| Ledger | Morale 60 · Reputation 50 · Reckoning ~0 (Whispers) · Ghost Roll empty | |

---

## 3. The day loop (D-009)

Every day is three beats:

1. **Morning Brief** — the day's weather (with the forecast confidence tier, §10), any event, the market's headline prices, a line of flavor. **Dawn assignment:** set each clone's task (tend a field / chop wood / harvest / rest). With one clone this is trivial; it teaches the interface for later.
2. **Play** — tap-to-advance the day; events resolve as choice-cards (§9, `style-guide.md` grammar).
3. **Dusk Report** — what changed: growth, harvests, coin, food, morale, and any omen (hidden axes shown only as omen, never as a number).

Seasons are **20 days**; the year is **80 days**, four seasons: Spring → Summer → Fall → Winter.

---

## 4. The Year-1 spine — "The Newcomer" arc, season by season

### SPRING (Days 1–20) — Arrival & first planting
- **Day 1 — Silas Ridley calls.** *(scripted)* The banker rides out to "welcome" the newcomer, hand over the deed to Uncle Malachi's homestead, and lay out the mortgage. In his bloodless way he notes only that the charter passes to blood when a holder is "lost," and moves straight to the dates (the founder mystery stays a whisper in Year 1; Silas is not one of its threads, D-038). He is correct, cold, and — for once — almost kind: *"You'll owe the bank a hundred and fifty a year. Not this year, nor the next; the charter's not unkind to a new man. After that, it minds its dates."* Teaches the mortgage clock **and** the grace. First read of Silas.
- **Days 1–3 — First planting (tutorial).** Guided: the four fields, season-fit, seed cost. Recommended nudge: plant food (potato, wheat) — *"a newcomer plants his belly first."* The player may ignore the nudge.
- **Day 10 — First Furrow (Spring festival, §12).** *(scripted)* The town gathers. Introduces **Mayor Halloway** (expansive welcome, offers a first small **crop-supply contract** — 8 units of wheat at a fair locked price, an easy tutorial contract) and **Preacher Grange** (blesses the fields — a small Reckoning ease + a fertility touch; teaches the rite quietly). The player sees the town square, the church, the saloon.
- **Systemic Spring:** mild weather; one **rain** event (+growth); one minor systemic card (a fence to mend / a stray dog at the flock). Reuben tends; the player learns dawn assignment.

### SUMMER (Days 21–40) — Growth, the market, the first temptation
- **The market opens.** First harvests of fast crops. The player sells at **Local** (learns the glut soft-cap, §2) and hears of **Regional** buyers (a wagon day). Introduces **Meredith Vane** (the saloon, information — for a price) and **Doc Bell** (dry, watchful).
- **Ambrose's wagon (opportunity, §3).** *(scripted, ~Day 25)* The Vane wagon offers a **second clone** (a Field Hand, 60 marks; or a Grower, 110). **The real decision (H-09):** a second mouth must be fed through winter — can you afford *and* feed two? Teaches that headcount is bounded by food, not coin.
- **Day 30 — The High Market (Summer festival).** Trading; Regional buyers converge; a second contract offer. Prices spike.
- **The first moral fork (essential).** *(scripted, late Summer)* A field ripens as a storm gathers (the forecast reads "Reported"). **"The Cotton Won't Wait"**-style card (see §7): push Reuben through the night to save the crop (overwork, −Morale, he's worn) or let him rest and lose a third. Overwork alone is **not** a Reckoning debt — the prose is honest about that (*"the land takes no notice of a hard day — not yet"*). This plants the *idea* of the cruelty-vs-yield trade without punishing it yet.

### FALL (Days 41–60) — Harvest, the scramble, the first whisper
- **Main harvest + the winter scramble (§4).** Bring in the crop, preserve food, and lay in fuel — chop wood (Reuben's labor) or buy coal (~3 marks/unit). These compete for the same days. From **Fall Day 12** the **Winter Readiness** panel appears: *Food X / need · Fuel Y / need · days left.*
- **Day 50 — Harvest Home (Fall festival).** *(scripted)* Lands mid-crunch — the soft-required tension (attend and lose a harvest day, or skip and take a small rep hit). Introduces **Bess Halloway** (the mayor's daughter — one sharp, honest question that reads the player), **Sister Ruth Grange** (charity; notes how the player's clones look), **Sheriff Coldwater** (a cool word about "soft ground"), and **Old Nan** at the edge of the green, watching.
- **A clone-care beat.** *(systemic)* Either a **Foundling** wanders in (a stray vessel — a Sister Ruth thread; free labor, but another mouth) **or** Reuben takes ill (Doc Bell treats for ~20 marks; untreated risks worse in winter). A kindness-vs-cost choice.
- **The first Reckoning beat (§6):**
  - **Every run** gets ambient **Whispers** flavor by late Fall — a cold spot in the barn, crows on the rail, a dream. Mood only, no penalty. (Whispers ships to every run.)
  - **If the player has been cruel** (an unmarked burial, a clone worked to death), a **pointed Whisper** fires — the **"Sour"** card (`style-guide.md` §8A): milk turns though the cow is sound, and Old Nan, if asked, says *"you've laid something down it didn't care for."* Teaches the mechanic by showing, not telling.

### WINTER (Days 61–80) — The crucible (milder, guided)
- **The first winter is gentler (§4 tutorial mildness):** a small household, an explicit readiness callout in the late-Fall Brief, and **at most one cold snap** (vs. the usual two).
- **Consumption:** farmer 1.0/day + each clone 0.75/day, plus fuel. Farmer + Reuben over 20 days = **35 food** + ~46 fuel. If short, the **emergency levers**: **Sister Ruth's charity** (a Ruth event gifts food/fuel at a small reputation/obligation cost — the tutorial safety net) or a fire-sale of stored crops for coal.
- **Day 75 — The Long Vigil (Midwinter festival, §12) — the thematic heart.** *(scripted)* The town watches through the longest night to renew the cap on the Old Well. The player attends (or not). This is where the **cosmology surfaces**: Grange's liturgy, the naming of the year's dead, and the plain fact that the whole town is afraid of something under the ground. The player leaves Year 1 knowing there *is* a Marrow, without being told what it is. For this player it lands doubly: the rite Malachi kept in private is the one the whole town keeps tonight, and a first journal entry can be earned here (D-038).
- **Spring, Day 1, Year 2 — "I survived another year."** The win beat. A quiet Dusk-to-dawn: the household wakes, the frost breaks, and the year turns. Vigils awarded (meta, §14); the Codex records who lived and who didn't.

---

## 5. Systems active in Year 1 (and their Year-1 limits)

| System | In Year 1? | Year-1 shape |
|---|---|---|
| §1 Crops | ✅ | All families available; tutorial nudges toward food. Bone-root **not** reachable (needs a tainted field → a death; rare in a forgiving Y1). |
| §2 Market | ✅ | **Local + Regional** only. Seasonal wave + glut taught. |
| §3 Clones | ✅ | **Merchant + Foundling.** Start with 1; can reach 2–3. No Vat. |
| §4 Winter | ✅ | The centerpiece — but milder (one cold snap, guided). |
| §5 Ledger | ✅ | Morale + Reputation active and visible. Exposure only if cruel. |
| §6 Reckoning | ✅ | **Whispers** (all runs, ambient) and a pointed Whisper if cruel. Cannot reach Walkers+ in one forgiving year. |
| §7 Contracts | ✅ | **Crop-supply only** — two easy tutorial contracts (First Furrow, High Market). |
| §8 Building | ◔ | Field-clearing + fences + woodshed affordable; barn/cellar are stretch goals. |
| §9 Events | ✅ | A curated Year-1 set (§6 below) — heavier on flavor/minor, no crises unless the player creates the vulnerability. |
| §10 Weather | ✅ | Forecast ladder taught; one storm near the Summer fork; the Winter cold snap. |
| §11 Roster | ◔ | Housing cap 2 (Lean-to); Bunkhouse (houses 5) is the first real expansion. |
| §12 Festivals | ✅ | **All four** — the spine of the year and the NPC introductions. |
| §13 Arcs | ✅ | This *is* the Year-1 arc (The Newcomer). |
| §14 Meta | ◔ | Vigils + Codex awarded at year-end; unlocks are a Year-2+ concern. |
| §15 Ascension | ❌ | Post-launch (D-033). |

---

## 6. The Year-1 event set

A curated ~18-card set (tutorial-appropriate: heavy on flavor/minor, crises only if the player builds the vulnerability). **Scripted** = fires on schedule; **systemic** = drawn by the §9 engine.

**Scripted (arc):** Silas's welcome (D1) · First Furrow (D10) · Ambrose's wagon (~D25) · The Summer storm/moral fork (~D35) · Harvest Home (D50) · The Long Vigil (D75).
**Systemic pool (Spring):** spring rain (+growth) · a fence to mend · a neighborly visit from Tamsin's Reach.
**Systemic pool (Summer):** a demand shock (one crop +price) · a hot spell · Doc Bell's first rumor.
**Systemic pool (Fall):** a foundling at the gate *or* Reuben's fever · early-frost warning · the Whisper ("Sour," if cruel) · ambient Whispers flavor (all runs).
**Systemic pool (Winter):** the cold snap · Sister Ruth's charity (if short) · a quiet cabin-fever beat.

Three are written in full in the voice guide already (Vane's Wagon = 8B, The Sheriff's Rounds = 8C, The Cotton Won't Wait = 8E, Sour = 8A). Two more, written here for the slice:

**Silas's Welcome** *(scripted, Day 1)*
*[a man in a good coat on a poor road, a ledger in his saddlebag, not dismounting]*
> Silas Ridley reins up at your gate and does not get down. "Ridley. I hold your charter." He says it the way another man might say the weather. "A hundred and fifty a year to the bank. Not this year, nor the next — the charter allows a new man his feet. After that, it minds its dates, and so will I." He looks a long moment at the soft ground by the east field, and something crosses his face he does not explain. "Good day."

- **"Obliged, Mr. Ridley."** → *He nods and rides off. You are, it seems, a man with a deadline — two years out.*
- **"You believe the stories about this ground?"** → *He pauses. "I believe in the ledger," he says. "The stories are the ledger's business." He rides off faster than he came.*

**The Long Vigil** *(scripted, Day 75)*
*[the whole town in the church at midnight, every candle lit, an old capped well-head visible through the open door]*
> On the longest night the town does not sleep. They fill the church and they watch, and near midnight Grange reads the names of everyone who died in the Sull this year, slow, one by one, so that none of them are forgotten and left to be — the liturgy does not say *taken,* but everyone hears it. Outside, past the graves, the old well-head sits under its cap of iron and salt, and the watching is for it.

- **Watch the night through with them. (a rest day, +Morale, +Reputation)** → *You watch. You do not know what you are watching for, and by dawn you understand that no one else quite does either, and that they watch anyway. It is the truest thing you have seen in the Sull.*
- **Go home to your fire.** → *You keep your own watch, alone, over your own ground. In the morning the town is a little colder to the man who wouldn't sit the Vigil. (−small Reputation)*

---

## 7. The moral fork & the first whisper (why Year 1 matters)

Year 1 must make the player *feel* the core hook once, gently:
1. **The temptation** (Summer): overwork Reuben to save a crop. Cheap, effective, and — the prose is careful — **not yet** a debt. It plants the idea.
2. **The line** (any cruelty that kills or unmarks a clone): if the player crosses it, the **pointed Whisper** (Sour) fires in Fall — the land's first, penalty-free notice.
3. **The rite** (Winter): the Long Vigil shows what the Whispers are *about* — a whole town keeping watch over a capped well. The player ends Year 1 understanding the shape of the bargain: *the land keeps accounts, and this town has been paying a long time.*

A wholly kind Year-1 player never crosses the line and never sees the pointed Whisper — only the ambient dread and the Vigil. That is correct (the clean run exists). The slice must support **both** the kind and the cruel first year.

---

## 8. Paper-prototype kit (#11)

To run Year 1 on a table:
- A **calendar track** of 80 day-cells, marked into four seasons, with the six scripted beats pinned to their days.
- **Field cards** ×4 (crop, growth pips, fertility, taint).
- **Clone tokens** (Reuben + any bought/foundling) with a Morale dial.
- Resource counters: **coin, food, fuel, seed.**
- Two hidden tracks the facilitator keeps: **Reckoning** and **Ghost Roll** (shown to the player only as omen).
- The **event deck**: the ~18 Year-1 cards, split scripted (pinned) vs. systemic (drawn), plus the §9 pacing rule (base 0.30 + pressure).
- The **Winter Readiness** reference (food/fuel needs for the current household).
- **Goal:** reach Spring Y2 alive. **Watch for:** does the loop teach itself? does the Summer fork land? does the Vigil feel like it means something? (These are the playtest questions for #11.)

---

## 9. Ratified-number cross-check (D-032)

- Starter: 4 small fields, 100 coin, 1 clone, 80 food, 20 seed ✅
- Consumption: farmer 1.0/day, clone 0.5 (0.75 winter) ✅ → farmer+Reuben winter food = 35, fuel ≈ 46 ✅
- Mortgage: 150/yr, **Year 1–2 grace** → no Year-1 payment ✅
- Quick-ground yield +10%, roots decay 0.18, small-field 0.8× ✅
- Market: Local (cap 10) + Regional (cap 30, wagon day) ✅
- Bone-root unreachable in a forgiving Y1 (needs a death → taint) ✅ (its price is now 4, irrelevant to Y1)
- First winter milder: one cold snap, guided readiness ✅ (§4)

*Resolves nothing on its own, but it is the concrete target for #11 (paper playtest) and the first build. When Year 1 plays well on paper, it becomes the first thing coded.*
