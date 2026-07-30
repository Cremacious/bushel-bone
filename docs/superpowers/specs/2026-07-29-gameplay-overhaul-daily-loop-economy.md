# Gameplay Overhaul — the Daily Loop, the Build-Up Economy, and the Living Town

**Status:** validated design (brainstormed with Chris, 2026-07-29). A ground-up rework of the
minute-to-minute. Supersedes the *loop structure* of the two prior gameplay specs
(`2026-07-28-gameplay-depth-design.md` §10 and `2026-07-29-minute-to-minute-gameplay-design.md`):
the abstract five-**week** labor-allocation turn is replaced by a **day-by-day** loop. It keeps
and builds on everything those specs locked *around* the loop — mortal hands, the reckoning, the
squeeze curve, succession/legacy, the V0.3 UI target.

**Scope:** the moment-to-moment and the economy of `prototype2/` — the daily cycle, the
stepped build-up progression, the three coin engines (crops, town odd-jobs, an optional crop
market), the town as an explorable menu-map with travel, four new NPCs, and Reuben's onboarding
for the new loop. Presentation + loop + economy design. It reuses the existing pure core
(reducer, crops, hands, scene engine, tips) but restructures the phase machine.

---

## 1. The problem

The rebuilt prototype plays "interesting but not fun." The specific failures, from playtest:

- **The farm-management core is unloved.** The seed-planting / weekly-labor system is fiddly and
  opaque; players "randomly clicked Rest / Work field / Chop because I didn't know what else to
  do." The abstract "week" turn is neither a satisfying decision nor a readable simulation.
- **There is nothing to *do* between sowing and harvest.** The true hook — the stretch from
  arriving to harvest — is empty. A season is a labor menu repeated five times.
- **No pull, no growth.** Nothing draws the player forward. There is no ladder of goals, no
  sense of building something up over time.

The fix is a genre reframe plus a new loop: a **day-by-day survival-management sim built on a
stepped economy of growth** — a cross of *TCG Card Shop Simulator* and *Bookstore Simulator*
(start tiny, save, unlock ever-pricier capacity) and *Stardew Valley* (a warm daily rhythm in a
town of people), worn over B&B's farm and its conscience.

## 2. The reframe

**You are a proprietor building up a failing homestead, not a laborer working it.** You inherit
one cleared field and one hand (Reuben). Everything else — more land, more hands, tools,
buildings, better crops, better markets — is *earned*, one escalating rung at a time. The daily
job is not "do the farm work yourself"; it is **direct the crew, work the town, and grow the
operation** while the debt in the ground and the debt at the bank both come due.

## 3. Design principles (locked this session)

1. **Stepped progression is the spine.** A visible ladder of upgrades, each dearer than the last,
   is the carrot on the stick. The player always has a next thing to save for. (TCG/Bookstore-sim
   pattern.)
2. **Every rung raises the stakes.** Growth is never just bigger numbers: more land needs more
   hands; every hand is another mouth and another winter risk; the cruelty lever always offers a
   faster climb at the land's expense. Expansion buys *more to manage*, not an easier game.
3. **Days scale with the operation.** Early days are seconds (one field, one hand, Reuben's plan
   pre-filled); richness grows as you hire and clear. The game earns your time.
4. **No dead air.** A "Let the days run" fast-forward crosses calm days and auto-stops on anything
   that wants a decision. The calendar is a reservoir of time, not a set of mandatory turns.
5. **Time is the scarce resource.** Commerce is free; *your attention* (a talk, an odd-job, a
   field worked by your own hand) is the thing you never have enough of.
6. **The market is optional depth, never a survival tax.** A careful seller always survives;
   playing the market lets you climb faster. No easy exploit may break it.
7. **Reuben teaches by doing.** He pre-fills, narrates once, leans in on each first encounter, and
   fades. (Upholds D-039 gradual onboarding.)

## 4. The daily loop

The atomic unit of play is a **day**, in three beats:

- **Dawn — assign.** At the homestead. Set each hand to one task on one field. Reuben has already
  pre-filled a sensible plan; the player accepts or overrides. One hand works one field per day.
  Valid tasks only are offered (see §5). Early on this is a single tap.
- **Day — spend your own actions.** You, the proprietor, have a small pool of personal actions
  (**start at 2, tunable**). Options: **ride to town** (talk to an NPC, take an odd-job, read the
  market — see §9/§10), **work a field yourself** (an extra pair of hands), **forage**, or **tend
  a relationship / handle a caller**. This is the free, exploratory heart of the day.
- **Dusk — sleep and resolve.** "Turn in for the night." The day resolves: crops grow, the crew
  eats and tires, the market ticks, an event may fire, the reckoning may stir. Then the next day.

**"Let the days run."** Whenever nothing needs a decision, one control fast-forwards: the crew
holds its standing orders and days resolve automatically. It **auto-stops** the instant something
wants the player — a crop ripens, an event fires, a caller/visitor arrives, a hand falls ill, or a
market swing the player flagged hits. Players never tap through empty days.

Phase machine (replaces the `week ×5` core): `brief → planting → day ×N → dusk(season) → (next season)`,
where a "day" is `dawn-assign → your-actions → resolve`, and fast-forward batches `resolve` across
days until an interrupt.

## 5. Hands and tasks

One hand does **one task on one field per day**. Tasks (only the valid ones surface, per D-039):

- **Plant** — sow a chosen crop into a fallow field.
- **Tend** — push a growing crop along faster / protect its yield.
- **Harvest** — bring in a ripe crop. (Some crops, e.g. cotton, need two hands the same day.)
- **Chop** — lay in winter fuel.
- **Forage / hunt** — gather food from the wild (the larder engine when crops are thin).
- **Rest** — recover condition.

Hands remain **mortal individuals** exactly as locked in D-048: the staged condition track
**Steady → Worn → Failing → Lost**, needs (fed / warm / rested / fairly treated), traits that
surface through play, death with ritual (bury proper vs discard), names and loyalty, and cruelty
that is profitable now but witnessed and logged into the reckoning. Nothing in that system changes;
the daily loop is simply the new cadence at which it plays out.

## 6. The build-up ladder (the carrot)

You start with **1 cleared field and 1 hand**. The ladder is the spine of long-term play. Each
category escalates in price; the next rung is always visible but out of reach. Illustrative
prices; **all numbers owned by the Balance Model (Q-003)** and tuned in playtest.

| Category | Rungs (escalating) | The tension it introduces |
|---|---|---|
| **Land** | Clear the River Strip (~120m) → the Near Acre (~260m) → the Stone Lot (~480m) | More ground than hands: leave it fallow (wasted coin) or hire. |
| **Hands** | Hire a field hand (~60m) → a second (~110m) → a foreman (~300m) | Each hand is capacity *and* an ongoing food + winter-fuel cost. |
| **Tools & buildings** | A plow (~200m, tend/yield) → a well (~350m, drought) → a barn (~550m, storage + less spoilage) | Efficiency you must fund before it pays off. |
| **Crops** | Unlock cash grains → cotton → the Weird seed | Better coin, but the Weird feeds the reckoning (D-048). |
| **Market** | Regional buyers → the rail depot | Bigger buyers, better base — gated by standing and mid-game arrival. |

**Gating.** Mostly **money** (save and buy from the relevant vendor — see §10). A few rungs are
gated by **standing** (the town must trust you: regional buyers, the rail contract) or by **story
/ time** (the rail line reaching the Cross mid-game). Land deeds route through the bank (Silas
Ridley) and tie to the Malachi inheritance; tools/buildings through the new toolwright (§10).

This ladder is the concrete, mechanical expression of the already-locked **squeeze curve (D-045)**:
the budget stays tight, one telegraphed pressure lands per year, and the tools to meet each year
appear in town the year before you need them. Expansion is how you build the capacity to survive
the vise — and the temptation to cut moral corners to afford it faster.

## 7. The three coin engines

1. **Crops (the base engine).** Grow and sell harvests. The reliable spine of income; pacing is
   tied to the seasons.
2. **Town odd-jobs (the slow-day engine).** Small paid errands between harvests — haul for the
   miller, sit with Doc's patient, mend a fence. Modest coin, and something lucrative to *do* on a
   quiet day. Sourced from the rotating town deck (§10) so there is usually one available.
3. **The crop market (optional strategic depth).** A Grand-Exchange-style price minigame (§8).
   Reading it and timing sales lets a clever player climb faster — never required to survive.

## 8. The crop market minigame

Modeled on OSRS's Grand Exchange: prices move on supply and demand, and — crucially — **the
player's own selling moves the price**, which is the primary anti-exploit lever. Single-player and
offline, so "demand" is simulated. Each crop's price is the sum of:

1. **Seasonal wave (known, plannable).** Grain climbs into winter scarcity; roots crash at the
   autumn glut. Printed in the Almanac; readable months ahead. The baseline skill.
2. **Demand shocks (telegraphed, probabilistic).** Events swing a crop ±20–50% — a mill fire, a
   rail contract, a bad harvest a county over. **Heard by going to town and talking to people**
   (Meredith's saloon gossip, the preacher's "hard winter" sermon). This is the load-bearing tie
   between town exploration and the economy: town visits are *market intelligence*, which is what
   fills the slow days.
3. **Player flooding (the anti-exploit).** Selling a large quantity at once pushes the local price
   down as you sell — the average craters. To move volume you either **spread sales across days**
   or **ship to a bigger venue** (regional buyer weekly, rail depot mid-game) that absorbs more at
   a better base but costs travel/time and pays on a delay. No infinite dump; no cornering your own
   market.
4. **Micro-noise (±10%).** Day-to-day flutter so the board is never dead-flat.

**Exploit-killers** (against "no easy win"): flooding self-corrects; **spoilage is the carrying
cost** on hoarding (holding for a spike bleeds to rot; the barn upgrade reduces it, tying back to
the ladder); forecasts are probabilistic (gossip shifts odds, never guarantees); and the squeeze
curve still bites, so cleverness buys margin, not immunity.

**Diegetic presentation** (against emotional flatness): chalk on the depot board, gossip in the
saloon, the Almanac's seasonal chart — never a stock ticker.

## 9. The town and travel

**No walking; no travel-as-gameplay** (locked). Marrow's Cross is a **stylized illustrated
menu-map** the player reads. **Riding in from the homestead costs one Day action**; once there,
the player calls at places off the map. Time economy inside town:

- **Free, anytime in town:** read the market board, buy seed, sell harvest, restock sundries,
  check the ledger. Commerce never costs a turn.
- **Costs one Day action (of ~2):** the meaty encounters — a real conversation / relationship
  scene, a paid odd-job, a folk-reading from Nan, courting someone.

So a town trip is: ride in, freely sell and restock, then spend an action or two on the day's
worthwhile encounter, and home by dusk. A **rotating deck** keeps a visit fresh — a new odd-job,
an NPC with news, a market rumor — so "go to town" is never nothing.

The Town screen, the action chooser, and the market board are new screens designed *in* the V0.3
language (per D-047).

## 10. NPC roster

The 10 canon NPCs (do not alter) each anchor a place and a purpose. Four **new** NPCs are added
this session (Chris-approved) to fill economic roles the ladder needs. All names live in
`content/names.yaml` (per #45) and are renameable with a one-line edit.

**Canon (10):** Meredith Vane (saloon — gossip/market intel, odd-jobs) · Silas Ridley (bank —
mortgage, loans, land deeds) · Elias & Ruth Grange (church — moral weathervane, charity) · Doc
Bell (heal a sick hand, rumors) · Sheriff Coldwater (law, cruelty inquiries) · Old Nan (folk
magic, reckoning intel) · Dr. Ambrose Vane (wagon — hire hands) · Cyrus & Bess Halloway (mayor —
civic contracts, festivals).

**New (4):**

- **Hollis Crake, the toolwright.** A one-armed smith who lost the arm to his own threshing
  machine and now fits iron to a farm's needs. **Sells the tool/building ladder** (plow, well,
  barn). The primary "spend coin to upgrade" vendor.
- **Prudence Tolliver, the shopkeep.** Tight-fisted keeper of the general store; sees every
  purchase that passes through the Cross. **Seed, goods, sundries**, and a quiet gossip.
- **Mr. Fenwick, the rail agent.** A company man from back east who arrives only when the line
  reaches the Cross (mid-game). **Buys crops in bulk for the depot** — the top market venue
  unlocking. All ledger, no soul.
- **The Ostrander farm across the creek.** A rival homestead that works its hands cruelly — a
  living mirror of what the player might become. **Market color and moral contrast**; a source of
  rumor and the occasional odd-job or rivalry beat. (World texture, not a vendor.)

## 11. Reuben's onboarding for the new loop

Reuben is the guide (foreman, the collective's voice, the tutor — unchanged role), retooled for
the daily loop and honoring D-039 (thick at first, fading gradually, never abruptly):

- **He pre-fills every Dawn.** A newcomer never faces a blank assignment; the default plan *is* the
  tutorial. Accept it, or override.
- **He narrates day one's three beats once:** set the crew at dawn, spend the day as you see fit
  (town or the fields), turn in when spent.
- **He leans in on each first encounter, then fades:** first planting → what to sow first, *but
  every season turns different*; first town trip → who's who; first market glance → how the board
  moves; **first approach of winter → he foreshadows the wood and food you'll need**; first hire →
  the mouth-to-feed tradeoff; first cruelty option → a quiet warning about what the land remembers.
- **"Ask Reuben" is always available** for context-aware, on-demand guidance, and he remains the
  narrative thread (Malachi's old hand).

## 12. Calendar and reconciliation with locked canon

- **Season length → 10 days (40/year), tunable via playtest** (Chris's call). This **updates the
  GDD-locked 20-day / 80-day calendar** (a new decision this session). Four seasons/year unchanged.
  Crop growth rates and the personal action budget are recalibrated to the shorter season.
- **The "week ×5" turn is retired** in favor of the daily loop. The prior specs' *principles* that
  survive — read → adjust → resolve, Reuben pre-fills, planning must matter, events are fair, no
  dominant crop, Year 1 teaches — all carry into the daily cadence.
- **Carried over unchanged:** mortal hands and the condition track (D-048), the reckoning tiers and
  hidden ledger (D-027/D-048), the squeeze curve (D-045) — now concretely expressed by the ladder —
  succession and the legacy ledger (D-046), and the V0.3 UI rebuild target and its six-tab bar
  (D-047). The new Town/market/action screens are designed in the V0.3 language.
- **Crop tiers** stay the three-tier gamble (staples / cash / Weird, D-048); the market (§8) is the
  new layer over selling them.

## 13. The four failure modes (audit)

Per the project's standing requirement, every mechanic is audited against the four risks:

1. **Difficulty miscalibration.** Bounded market bands + spoilage carrying cost cap runaway income;
   the flat-budget squeeze (D-045) keeps pressure legible and rising; Year 1 teaches with near-zero
   stakes. The ladder paces growth so power never outruns the curve.
2. **Dominant-strategy convergence.** Seasonal winners shift; demand shocks re-weight crops per run;
   flooding self-corrects any "grow one super-crop" plan; run-varying seeds change the board. The
   best crop is always "it depends."
3. **Cheese and exploits.** Flood-depression, spoilage, buy/venue absorption limits, and
   probabilistic (never deterministic) forecasts kill the dump/hoard/arbitrage money pumps.
   Commerce being free prevents action-starvation cheese; the fast-forward can't skip consequences,
   only calm.
4. **Emotional flatness.** The market speaks diegetically (chalk board, saloon gossip); the town is
   people with purposes, not vendors; the ladder's tension is moral (hire = a mouth; cruelty = a
   faster climb the land remembers); Reuben carries voice and the Malachi thread.

## 14. What changes in code (high level; detailed by the implementation plan)

- **Phase machine:** replace `week ×5` with the daily loop (`dawn-assign → your-actions →
  resolve`), plus the fast-forward batcher with interrupt detection.
- **New systems:** the build-up ladder (owned upgrades + escalating costs + vendors), the crop
  market (price model with seasonal wave, telegraphed shocks, flood-depression, venues, spoilage),
  town locations + the rotating deck + odd-jobs, personal-action economy.
- **New screens (V0.3 language):** Town menu-map, the day/action chooser, the market board, the
  upgrade/vendor screens, revised Dawn/Dusk.
- **Content:** four new NPCs into `content/names.yaml`; town scenes, odd-jobs, and market-rumor
  lines into `content/script.yaml` (flowing through the #45 tokens and #46 .docx round-trip).
- **Reuse unchanged:** the pure `(state, action) => state` core discipline, hands/condition,
  reckoning, scene engine, tips, the content pipeline.
- **Recalibrate:** crop growth and balance constants to the 10-day season (Q-003).

## 15. Open questions / balance-owned

- **All prices and rates** (ladder rung costs, crop bases + waves, shock magnitudes, flood-decay,
  spoilage, action budget, growth per day) are owned by the **Balance Model (Q-003)** and tuned in
  playtest. The numbers here are illustrative.
- **Exact personal-action budget** (start 2?) and whether it grows with any upgrade — tune in play.
- **Odd-job coin scale** relative to crop income — must stay a *supplement*, not a bypass of the
  farm.
- **Rail depot arrival year** and the standing thresholds for regional/rail venues.
- **Season length** — starting at 10, revisit after first playtest.

---

*Feeds the writing-plans skill next: a staged, subagent-driven implementation plan that rebuilds
the loop and layers in the economy and town, reusing the existing pure core.*
