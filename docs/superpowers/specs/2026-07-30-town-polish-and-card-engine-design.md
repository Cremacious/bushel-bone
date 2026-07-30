# Town Polish & the Roguelite Card Engine — Design

**Status:** validated design (brainstormed with Chris, 2026-07-30). Addresses eight playtest notes on the merged town. One design decision locked: **NPC content is per-NPC typed card decks**, drawn randomly without repeats within a run and reshuffled across runs, with pinned story beats.

**Scope:** two phases. **Phase 1 = town polish & clarity** (presentation + tiny state): the town UI matched to the choice-card grammar, a town plate on the left, a persistent action counter with cost tags, solid field backgrounds, assign-timing clarity, and head-home priority. **Phase 2 = the roguelite card engine**: per-NPC typed decks with seeded no-repeat draw + pinned beats, and odd-jobs as conversation scenes. Reuses the scene engine, standing, the content pipeline, and the existing `mulberry32` PRNG (`rngState` is already carried in state, currently unused).

---

# PHASE 1 — Town polish & clarity

## P1.1 Restyle the town place/talk UI (note 1)
The town place view (`.townloc`, `.loc-talk`, `.walkbtn`, jobs) reads inconsistently with the rest of the game, which uses the **choice-card grammar** (`choicecard`: a title line with an optional right-aligned mechanical tag, a sub line). Restyle so that:
- **"Talk to <NPC>"**, **"Take the job"**, and each **"Walk there →"** render as `choicecard`-style rows (title + sub + right-aligned tag), matching the Day/scene screens.
- The place header keeps the eyebrow/title/vignette, then the NPC + standing on one line, then the choice-card actions, then the nav row.
- The overview's place list and job list use the same card grammar.
Presentation only; reuse the existing `choicecard` component where possible.

## P1.2 A town plate on the left (note 2)
Currently the left board panel shows the **fields** whenever `phase === "day"`, so it still shows fields while the player is in town (`screen === "town"`). Fix: **`boardPanel` returns a town illustration plate when `screen === "town"`** instead of the fields grid. The plate shows the place-name caption (the overview → "Marrow's Cross / the town green"; a specific place → that location's `sub`/`desc`), an engraved-border illustration placeholder (same treatment as the field/location plates), so the left panel reflects *where you are*. On the farm (`screen === "home"`, `phase === "day"/"planting"`) it still shows the fields.

## P1.3 A persistent, prominent action counter + cost tags (note 4)
Players lose track of actions in town; "You have 1 of the day to spend here" is small and easy to miss.
- Add a **persistent "Actions today N / M" indicator with pips** to the always-visible chrome (the brass ledger row in the shell), shown whenever `phase === "day"` (on the farm and in town). It uses the lamp accent and pips (filled = remaining) so it reads at a glance.
- Every choice that **spends an action** carries a **"−1 action"** cost tag (red, mono), in the same tag grammar as the +/− stat tags: the town "Talk to…", "Take the job", and the Day-screen personal actions (Forage / Work / Sit with). Walking, "Walk on", and "Head home" are free and carry **no** cost tag.
- The small in-panel "You have N of the day…" line can stay as flavor but is no longer the only signal.

## P1.4 Solid field backgrounds (note 6)
The field cards (`.fieldcard`) look transparent over the plate. Give them a **solid surface fill** (the aged-brown panel color used on the right/leaf, e.g. `var(--leaf)`/`var(--paper)` per the theme) with the existing border, so they read as solid cards matching the right panel.

## P1.5 Assign-timing clarity (note 7)
Players are unsure whether they must assign the crew before town, whether returning locks them out, and whether a task fires on click or at dusk. Add a **persistent one-line note** on the Day screen, near the crew section: *"Set your crew's orders any time today. They hold until you turn in for the night."* This states: assign whenever, town trips do not lock you out, and orders resolve at Turn in (not on click). No mechanical change (this is already how it works); the note makes the model legible.

## P1.6 Head-home priority when spent (note 8)
When `phase === "day"` and `playerActionsLeft === 0` (or it is not the day phase) in town, the **"Head back to the farm"** control moves to the **top** of the town screen, with a short note ("You are spent for the day. Head home to turn in."), so the player is guided out rather than staring at disabled actions.

---

# PHASE 2 — The roguelite card engine

## P2.1 The card model (notes 3, 5)
Each NPC gets a **deck of typed cards** (`content` data + prose). A card:
```
{ id, type: "beat" | "chatter" | "rumor" | "job", minStanding: 0, gate?: { minYear?, minStanding?, flag? }, coin?: N }
```
- **beat** — a pinned story moment (e.g. a Malachi thread, a reckoning omen from Nan). Gated by `gate` (year/standing/flag). Plays in priority when eligible.
- **chatter** — flavor/personality, no stakes.
- **rumor** — world/market intel (seeds Phase-D market thinking, a hard-winter warning, town news).
- **job** — a paid errand wrapped in a short conversation scene; accepting grants `coin`.

Each card id maps to a scene (`scenes.js` mechanics + `script.yaml` prose), exactly like the current talk scenes, with `returnTo: "town"`.

## P2.2 The draw (seeded, no-repeat, pinned-first)
Replace `nextTownScene` with a `drawTownCard(state, npc)` resolution used by the reducer's `VISIT`:
1. **Eligible** = the NPC's cards not in `state.talksSeen`, with `minStanding` and `gate` met (gate: `year >= minYear`, `standing >= minStanding`, and any required `flag` present in state).
2. **Pinned first** — if any eligible card is a `beat`, play the **first** eligible beat (beats are authored in the intended order).
3. **Else random** — pick a random eligible non-beat card using the seeded PRNG (`mulberry32(state.rngState)`), and **advance `rngState`** so the next draw differs. Because the seed varies per run, the order differs across playthroughs; because seen cards are excluded, there are no repeats within a run.
4. **Else** — the NPC's small-talk filler (repeatable), so a visit is never empty.

`VISIT` records the drawn card in `talksSeen`, grants standing, and (for a `job` card, on accept) grants `coin`. The draw's randomness lives in the reducer (it consumes `rngState`); a pure `eligibleTownCards(state, npc)` selector lists the candidates for testing.

## P2.3 Jobs as conversation scenes (note 5)
`job` cards ARE scenes: taking one opens a short conversation with the giver, whose accepting choice pays the coin (via the scene `fx: { coin: +N }`). The overview "Work going" list still surfaces the day's paid work, but **taking a job opens its scene** (the cutscene) rather than instantly adding coin. More job variety is authored across NPCs, drawn like other cards.

## P2.4 Content
Author a starter deck per NPC: ~2–3 chatter/rumor cards each, 1 job each, and 1–2 pinned beats for the story-bearing NPCs (Nan, Silas, Coldwater, Meredith). Built to grow. All prose in `content/script.yaml`, tokenized, no em dashes. The existing intro/deep/small-talk scenes are folded into the new model (intro → an early `chatter`/`beat`, deep → a higher-`minStanding` card, small-talk → the filler).

---

## Failure-mode audit
1. **Difficulty:** unchanged; jobs still pay the same coin (now via a scene). Balance untouched (Q-003).
2. **Dominant strategy:** the random draw + pinned beats give variety without a strategy to solve; standing still rewards repeat visits.
3. **Cheese/exploits:** no-repeat within a run + seeded draw means a player can't farm the same lucrative card; jobs are once-per-offer as now. `rngState` advancing on draw prevents save-scum-free repetition.
4. **Emotional flatness:** the whole point — the town says something new each visit, and story beats land at the right moment, which is the roguelite texture the flat deck lacked.

## What changes in code (high level)
- **Phase 1:** `board.js` (town plate), `shell.js` (persistent action counter in the ledger), `screens.js` (town restyle to choicecards, cost tags, head-home priority, assign-clarity note), `components.js`/CSS (solid field bg), CSS throughout.
- **Phase 2:** `town.js` (typed `TOWN_CARDS` decks replacing/extending `TALKS`), `selectors.js` (`eligibleTownCards`), `reducer.js` (`drawTownCard` in `VISIT`, consuming `rngState`; job-accept coin), `content/script.yaml` + `scenes.js` (the card scenes), `state.js` (any `flags` needed for beat gates).

## Open / tunable (Q-003)
- The exact per-NPC card counts and which beats pin to which year/standing.
- Whether the overview "Work going" list stays or fully merges into per-NPC job cards (Phase 2 keeps the list; taking opens the scene).
- Action-counter exact placement in the ledger row (design in build).

---

*Feeds writing-plans: Phase 1 (polish, ~6 tasks) then Phase 2 (the card engine, ~4 tasks).*
