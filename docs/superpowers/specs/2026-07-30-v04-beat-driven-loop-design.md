# Prototype v0.4 — The Beat-Driven Loop (making the core play fun)

**Status:** validated design (brainstormed with Chris, 2026-07-30). The third and deepest pass on the minute-to-minute. Supersedes the *feel* of the daily loop (D-049): the same systems (economy, mortal hands, the debt, the town) stay, but **how you play across a season changes** from clicking through empty days to deciding at meaningful beats.

**The problem (from playtest):** the day loop is set-and-forget. You assign standing orders once, then every day is an identical "Turn in" click. There are ~40 days and ~2 real decisions in a year. And the economy has no teeth: **odd-jobs are an infinite coin printer** (2 free coins/day), **coin has no sink** (seed is free, nothing to buy → ended Year 1 on 291m of dead money), **labor never bites** (one hand tends, one chops, tiredness irrelevant), and **resources drown you** (118 food / 112 fuel at year's end, 2-3x what's needed). So there is no drama and no squeeze. **Because Year 1 IS the core loop (later years add unlocks, not new rules), a dull Year 1 means every year is dull.** This rework targets Year 1's core.

**Locked from the brainstorm:**
- **Beat-driven:** time auto-advances; the player acts only at meaningful **beats** (events, harvests, threats, town opportunities), not day by day.
- **The early game can genuinely hurt you** from Year 1 (a badly managed winter or event can cost a hand; careless play trends toward foreclosure), with threats **telegraphed** so a careful player survives.

**Scope:** the season loop shape, crew standing-order roles, the event system, the anti-exploit tightening (seed sink, scarce jobs, real labor, cut abundance), the one-beat UI + day-book breakdown, and a sim-validated rebalance. Phased (Phase 1-4). The reckoning *biting* and multi-hand traits stay a later layer; this build makes the *loop* fun.

---

## 1. The beat-driven season

A season stops being 10 manual days and becomes a short string of **beats** with time flowing between them.

**Phase machine** (evolves the existing one):
`brief -> planting -> [ running <-> beat ] -> dusk -> (settlement at winter)`

- **brief / planting (fixed beats):** the Morning Brief, then sow the fields (now *buying seed*, section 5).
- **running:** the game **auto-resolves days** in the background (crops grow, the larder/woodpile drain, hands work their roles) using the existing `resolveDay`. It does NOT ask the player to click each day.
- **beat:** running pauses the instant something wants a decision (the `interrupts()` selector we already built, now also fed by events). The **beat screen** shows *only that situation and its choices* (not the whole crew panel). The player resolves it, then running resumes.
- **dusk:** when the season's days are spent, the day-book closes the season (section 7), then the next season, or the winter settlement.

A season yields ~3-5 beats, a year ~15-20 decisions, never 40 clicks. The machinery is ~80% built: `RUN_DAYS` + `interrupts()` already fast-forward and stop; this makes that the **default flow** and renders a **beat screen** at each stop instead of the day panel.

**Beats that stop the run** (Phase 1 set; events add to it in Phase 3): a crop is ripe and unharvested; a hand has crossed Failing (tired); food or fuel is about to run short; the season's last day; (Phase 3) an event fires.

## 2. Your time — a season pool

The player's own time is a **season pool** (`seasonActionsLeft`, ~5 to start, tunable) — the D-043 action-day vision the daily grind buried. At a beat or a neutral pause, you may spend one of your actions on what only you can do: **ride to town** (a talk / a job / a purchase), **work a field alongside the crew**, **sit with a failing hand**, or meet a beat that demands you. Free things (adjusting crew roles, reading the ledger, resolving a forced event) cost nothing. When your pool is spent, the season runs to its close on the crew's labor alone. This makes *your attention* the scarce resource, spent on the beats that matter.

## 3. The crew — standing-order roles

Daily task micro-assignment (the wall of task buttons, and the tedium) is **replaced by roles.** Each hand holds a role you set and rarely change:

- **Field** — each day, harvest a ripe field if any, else tend the least-grown crop. (Contextual, automatic.)
- **Wood** — chop fuel.
- **Forage** — gather food.
- **Rest** — recover.

`resolveDay` reads each hand's role and picks its day's work contextually (so "Field" is smart, not a fixed field id). You change roles at a beat or on the **Hands tab** — occasionally, not every day. This deletes the per-day assignment screen *and* makes labor a real decision (section 4).

## 4. Labor that bites

Tuned so a hand worked hard all season **genuinely tires and can fail** (Steady -> Worn -> Failing -> Lost, the existing track), which forces the "who do I pull off work?" choice: putting a hand on **Rest** costs you their production for that stretch. Winter cold and hunger accelerate it. A **Failing** hand is a beat (the run stops). A hand can be **Lost** (die) to a brutal winter or a bad event — the real stakes (D-048's mortal hands). Strain numbers are re-tuned (Q-003 / the sim) so this is felt from Year 1, not ignorable.

## 5. The tightening — killing the exploits (the playtest findings)

- **Seed is a coin sink.** Planting consumes seed; you **buy seed** (from Tolliver's store, an existing NPC) with coin. Coin -> seed -> ground -> harvest becomes a real cycle, so coin is no longer dead money. Start with a little seed; the rest is bought.
- **Jobs are scarce.** The town offers a small **rotating** set (e.g. 1-2 on offer at a time, refreshing across the season, not 2 every single day), and taking one **spends a season-action** (real opportunity cost) and may tire the hand who does it. No infinite coin.
- **Abundance cut + a Day-1 stake.** Lower starting food / fuel / coin so the winter food-and-fuel deadline is *earned*, and Year 1 carries a small real obligation from Day 1 (not pure grace) so there is something to strive for immediately.
- **Coin has weight everywhere:** seed, the mortgage (built), upkeep (built), hiring (built), and later tools. The sim (section 9) confirms coin stays scarce and valuable rather than piling up.

## 6. Events — the drama

A seeded, **non-repeating-within-a-run** deck across the seven families (GDD): **weather, pests, wildlife, opportunity, town, personal, reckoning.** Each event is a beat: a situation + 2-4 **choices**, each with consequences (resource / labor / hand / coin / reckoning deltas), some good and some bad, **threats telegraphed** a beat ahead where fair. Examples: a fox in the coop (send a hand and lose their day, or risk a loss); an early frost (chop hard now, or gamble the woodpile); a peddler (cheap seed, if you have coin); a hand takes ill (pay Doc, rest them, or work them through it, feeding strain); a foundling at the gate (a mouth, or a pair of hands); an omen on the east field (the ground remembers). Frequency ~2-4 a season. This is the engine that makes days worth playing and years worth surviving, and it *manufactures* the squeeze (a threat under scarcity is a hard choice). Reuses the card-draw + seed machinery from the town standing work.

## 7. The UI — one beat at a time

- **The beat screen** shows the current situation (a brief, an event, a harvest, a town scene) and its choices, in the reading panel — *not* the crew panel. The overloaded day screen is gone.
- **Crew roles** live on the **Hands tab** (a glanceable roster with a role toggle), touched occasionally.
- **The day-book breaks down the season's ledger:** coin **in** (harvest sales, jobs) vs **out** (seed, upkeep, hires, mortgage), and food / fuel **produced vs consumed** — so you see where the money and the margin went.
- **Distinct button visuals:** event choices (weighty choice-cards), navigation (light), and status reads are visually differentiated so clickable options don't blur together.

## 8. Year 1 as the tightened intro

Year 1 stays the gentlest year (lightest debt, guided tips), **but it plays the full core loop** — beats, real labor, scarce coin, telegraphed threats, the winter deadline that must be earned. Later years add **unlockable options** (more fields, hands, tools, crops, market venues, deeper town content) on top of the *same* loop. So the design bar is: **Year 1's core must be fun on its own**, because it is what every later year is made of.

## 9. Rebalance, validated by the sim

The existing `sim/` (policies over the real reducer) is extended for the new loop (roles, seed cost, scarce jobs, the season pool, events off for determinism) and re-run to tune: coin stays scarce (no 291m pile), the winter deadline is a real bar, a careless line can lose a hand or the farm, and a careful line survives. Numbers are the sim's output.

---

## Failure-mode audit
1. **Difficulty:** the sim tunes the curve; threats are telegraphed so failure is fair, not random. Year 1 can hurt but rewards care.
2. **Dominant strategy:** events + scarcity + the role/rest tradeoff mean no single set-and-forget line wins; the seed sink and scarce jobs kill the coin-spam exploit.
3. **Cheese/exploits:** jobs capped + season-time-costed (no infinite coin); seed sink drains the coin pile; labor bites (can't work everyone forever); events can't be dodged.
4. **Emotional flatness:** the whole point - events are people and land with agency; a hand you can lose; a debt that bites; the ground that remembers.

## Phasing (see the plan)
- **Phase 1 — the beat loop + crew roles:** auto-advance, roles, the beat screen, labor that bites. The transformation.
- **Phase 2 — the tightening:** seed sink, scarce jobs, cut abundance + Day-1 stake, the season pool. Rebalanced via the sim.
- **Phase 3 — events:** the deck, families, choice grammar, consequences, a starter content set.
- **Phase 4 — polish:** the day-book breakdown, distinct buttons, town/NPC card content, final sim rebalance + browser verify.

## Open / tunable (Q-003 / the sim)
- The season pool size (~5), event frequency (~2-4/season), strain re-tuning, seed prices, job scarcity, starting resource cuts, the Day-1 Year-1 stake.
- Whether roles need a fifth option (e.g. "Build/clear") later.

---

*Feeds writing-plans: the Phase-1 plan (beat loop + roles) in full, with the Phase 1-4 roadmap; later phases detailed when reached.*
