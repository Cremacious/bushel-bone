# v0.4 Phase 4 — Clarity, Reward & the Clone Reveal

**Status:** validated design (brainstormed with Chris, 2026-07-30), from the second v0.4 playtest ("moving in the right direction"). Raw notes + per-note fixes: `2026-07-30-v04-playtest-notes-triage.md`. This spec turns those ~22 notes into a buildable design.

**The problem (from playtest):** the v0.4 beat loop plays right, but it is **illegible and thin**. The mechanical vocabulary leaks and mis-colors (players can't read event choices — "Tiredness +16" shows *green*), the season action-pool is untaught and un-guarded (spent by accident, meaning unclear), talks and jobs give no reward (a wasted action), a CSS bug breaks event prose across lines, crop grow-times are hidden, and the clones — the game's ethical heart — are never introduced, just silently buyable at a wagon labelled "clone hands, for a price" that spoils its own reveal. So the loop is correct but the *reading* of it, its *rewards*, and its *soul* are missing.

**Scope:** five parts (A-E), each independently shippable. A = the fx-vocabulary overhaul (the biggest legibility win). B = the season-pool + beat-timing clarity. C = the visual/info fixes. D = the NPC/job variety grammar (reward cards + light interactions + a deep pool). E = the scripted clone reveal + the wagon mask + a content push. Pure `(state, action) => state` where logic; content in `content/*.yaml`; sim/browser-verified.

**Out of scope (later):** the reckoning *biting* beyond the current omen/dread nudge, multi-hand traits at depth, market venues beyond the local sell, production port.

---

## Part A — The mechanical vocabulary (the biggest legibility win)

The root cause of half the notes: `fxTag`/`STAT_LABEL` leaks raw fx keys and colors by a naive "any + is good" rule.

**A1. Human labels.** Map every fx key to a player-facing label. Tiredness is the big miss:
- `strainOne` -> "Tiredness · a hand" (a minus -> "Rest · a hand"); when the target hand is known, name them ("Tiredness · Reuben").
- `strainAll` -> "Tiredness · the crew" (minus -> "Rest · the crew").
- Keep the existing `regard/coin/food/fuel/seed` -> regard/coin/food/fuel/seed, `reckoning` -> "Dread".

**A2. Correct valence (a real bug).** Coloring is by *meaning*, not sign:
- **Bad when it goes up (red):** `strainOne`, `strainAll` (tiredness), `reckoning` (dread). So "Work them through it · Tiredness +16" turns **red**. Rest/care (tiredness down) turns green.
- **Good when it goes up (green):** coin, food (larder), fuel, seed, regard. Down = red.
- Encode as a per-key "up is good?" flag in the label table; the tag's color follows `(delta>0) === upIsGood`.

**A3. Stakes on the card.** Event/scene choices that risk a hand carry a plain sub line naming the stake (e.g. sick-hand "work through": *"push them and they may not last a hard week"*). Confirms to the player that **hands can be lost** — telegraphed, per D-039.

**A4. Teach the silent Dread.** The first time a `+Dread` tag is shown, fire a one-time tip: *"The land keeps its own ledger. You will feel the reckoning long before you ever see it counted."* Dread stays hidden (D-027); the tip tells the player it is hidden *by design*, so the tag stops being baffling. Persist "seen" (like other tutorial tips).

**A5. Make Rest/Care land.** Today resting a hand shows no visible change (note 17, 20). Two fixes:
- Surface the step in the day-book / beat feedback: *"Reuben rested — Failing -> Worn."*
- Re-tune `restRecovery`/`careRecovery` (sim, section F) so one stretch of rest is a **visible** condition step, not a rounding error. Sitting with a hand (the player's own action) is a stronger version of the same, so its benefit reads.

## Part B — The season pool + beat-timing clarity

**B1. Relabel the pool.** "You have 5 of the season to spend" -> **"Your own time this season: N actions."** with a one-line hint: *"Spend them in town, foraging, or with a hand. They refill each season."* A first-time tutorial tip on the beat screen explains the pool the first time it is shown.

**B2. Confirm before spending an action.** Forage / Sit with a hand / Ride to town each ask a lightweight in-place confirm ("Spend an action to ___? [Do it] [Not yet]") so a stray tap doesn't burn one (note 14). Free things (roles, ledger, forced beats) never confirm.

**B3. Beat-timing hint.** A persistent one-line note on the beat screen above Continue: *"Your crew's orders take effect as the days run on."* plus a first-time tip, so players know Reuben's role executes when the day resolves (note 6, 11).

**B4. A guaranteed opening beat (playtest follow-up).** Today, planting immediately auto-runs the days to the first *random* beat, so the player's first chance to act lands wherever the first event happens to fire (a playtester saw spring's first turn at day 4, summer's at day 2). This reads as "the season started without me" and hides the point of the action pool. Fix: after planting (and at each season's day-1 start of the run), **stop on day 1** as a beat, so the player always gets an opening turn to survey the fields, set the crew, and optionally spend a season action before choosing "Let the days run on." Implementation: `runDays`/`SOW` should not fast-forward past day 1 on a fresh season, i.e. a "start of season" is itself an interrupt/stop the first time. The day counter is not a spent resource (the 5 season actions are the budget and do not drain with days); the opening beat plus the B1 relabel make that legible.

## Part C — The visual + info fixes

**C1. The `.hl` line-break bug.** "A / warm rain comes" and "fever and a shake" wrap wrong (notes 7, 15). Root: the highlight span perturbs inline layout and/or the YAML `>` block scalar folds a newline into the span. Fix: make `.hl` a pure inline span (`display:inline`, no `line-height`/`display` change, keep only weight + color), and normalize the affected YAML bodies so the highlighted phrase is not split across a fold. Verify each event renders as one flowing paragraph.

**C2. The resource status strip.** The faint mono line "Larder 50 · Fuel 0 · winter wants ..." becomes a proper **status strip** (note 1): bordered/tinted, bold labels, each need shown as have/need, and it goes **amber when short** so the player notices the shortfall at a glance.

**C3. Crop grow-time on the picker.** Each crop chip on the planting grid shows **"ripens ~N days"** and its food/coin lean, computed from `CROPS` (seasons × season length / growth), so the player chooses knowing the time cost (note 9).

## Part D — The NPC & job variety grammar (reward + replay)

**The rule:** no talk or job is ever a dead action. Every one resolves to *something* — a payload, a choice that matters, or at minimum free flavor that costs nothing. Built on the existing choice-card/scene grammar (no new UI screens), with a **deep pool** so replays rarely repeat.

**D1. Card resolution types** (a scene declares its `kind`; all reuse the choice-card renderer):
- **payload** — a talk/visit that grants an fx on view or on a simple choice: intel (a telegraph flag for a coming event, or a market tip), a small **gift** (coin/seed/food), or **standing** that unlocks later cards. This is the floor: even "nothing new" flavor is *free* (no action cost) and clearly marked.
- **question** — a prompt with 2-4 answers where one (or some) is **right**: a right answer pays (standing/coin/a tip), a wrong one is neutral or a small sour note. NPC-flavored (Old Nan's riddle, Doc's diagnosis guess, the Preacher's moral test).
- **haggle** — a light **risk/reward gamble**: push for a better price/deal; a seeded roll (mulberry32 off `rngState`) against the NPC's temper decides win (better terms) / hold (same) / sour (worse or lost standing). Reuses the event roll machinery.
- **moral** — a **profit-vs-kindness fork**: the greedy branch pays more but nudges the hidden reckoning / costs regard; the kind branch pays less (or costs) but eases it. This is the ethics surfacing in ordinary town life, not just the clones.

**D2. Jobs get tradeoffs.** The scarce job offers stop being "pick the biggest coin." Each job is a `kind` above with an axis: coin **vs Tiredness** of the hand who does it, coin **vs standing**, a **risky** (haggle) job, or a **moral** job. So choosing among the 1-2 on offer is a real decision (notes 11, 17).

**D3. A deep, rotating pool.** Author enough cards per NPC and per job family that a single run shows only a slice, and replays reshuffle (the existing no-repeat-within-a-run + rotating-deck machinery). This is where "more dialog, more NPCs' worth of things to say" lives (note 5, 22). New content only — no new NPCs invented (roster is locked); depth comes from more cards on the existing 8-10.

**D4. Fill the mid-season lull.** With talks/jobs now worth doing and the deck deeper, the back half of a season (after harvest) has town errands and relationship beats to spend the pool on (note 13, 16). Tune town-offer refresh so something is usually available.

## Part E — The scripted clone reveal + the wagon mask

The clones are the game's ethical core and are currently never introduced. A **scripted Year-1 sequence** fixes that and teaches exploration + hiring (note 10, 21). **Settled:** scripted, nudged *before* the player can stumble onto the wagon, and the town view must **not** spoil it.

**E1. Mask the wagon pre-reveal.** Today the Town view shows "Vane's wagon / clone hands, for a price" — a spoiler. Before the reveal beat: the wagon is either absent from the Town list or shown as an unremarkable/locked entry (*"a peculiar wagon, newly come to the Cross"*, no "clone" wording), and **hiring is gated** behind the reveal. A `state.cloneRevealed` flag (persisted) gates the label and the HIRE affordance.

**E2. The nudge (forced, early Year 1).** A scripted beat fires early (after the first work-stretch, before any self-directed town visit): you are short-handed; Reuben says the ground is too much for two, *ask in town about more hands*. Because it is a forced beat, every player gets it, and it points them at the wagon before curiosity does.

**E3. The reveal scene at the wagon.** Riding to Vane's wagon runs a scripted scene: you came for hired laborers and Dr. Ambrose Vane shows you his **stock** — grown, not born. The prose carries the ethics (they have names; they look at you; something in the ground shifts). It is the **first framing of Regard and the moral debt** — how you treat them starts the hidden ledger. On close, `cloneRevealed = true`: hiring opens, the Town label updates to the honest (still eerie) wording, and later a first-hire regard/reckoning framing applies.

**E4. Content push.** Seed more event cards into the deck across families and more talk cards per NPC (Part D), so the world feels fuller and the deck lasts (note 22). New content, locked roster.

---

## Failure-mode audit
1. **Difficulty:** A/C don't touch balance; D's job tradeoffs and A5/E re-tunes go through the sim (section F) so the careful line still survives and the careless still loses.
2. **Dominant strategy:** D kills "pick the biggest coin" (every job now a tradeoff); the moral/haggle forks and the deep rotating pool mean no single talk/job line dominates.
3. **Cheese/exploits:** talks give small, bounded payloads (no coin printer); the haggle can *sour*, so pushing isn't free; the reveal gate can't be skipped to hire early.
4. **Emotional flatness:** the whole point — A makes consequences legible, D gives NPCs interiority and choices, E lands the clones as people and the moral debt as real.

## Phasing (see the plan)
- **Phase 4A — the vocabulary overhaul** (A1-A5): labels, valence, stakes, the Dread tip, Rest/Care landing. The biggest single legibility win; do first.
- **Phase 4B — pool & timing clarity** (B1-B3): relabel, confirm-to-spend, beat-timing hint + tips.
- **Phase 4C — visual & info fixes** (C1-C3): the `.hl` bug, the status strip, crop grow-times.
- **Phase 4D — the variety grammar** (D1-D4): card `kind`s (payload/question/haggle/moral), job tradeoffs, the deep pool, lull-fill. The biggest build.
- **Phase 4E — the clone reveal + content** (E1-E4): wagon mask + gate, the nudge, the reveal scene, the content push.

## Open / tunable (Q-003 / the sim)
- Season-pool size wording (N), recovery re-tune (A5) magnitude, job-tradeoff numbers, haggle odds vs NPC temper, town-offer refresh rate, the reveal beat's exact trigger day, pool depth per NPC (how many cards before "enough" for replay variety).

---

*Feeds writing-plans: Phase 4A first in full, with the 4A-4E roadmap; later phases detailed when reached. Each phase is independently shippable, so we can playtest between them.*
