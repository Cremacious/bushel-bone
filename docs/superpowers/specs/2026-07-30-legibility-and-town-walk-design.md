# Legibility Pass & Town Walking — Design

**Status:** validated design (brainstormed with Chris, 2026-07-30). A UX pass on the merged daily-loop prototype (`prototype2/`), addressing ten playtest notes. Two design decisions were locked in the brainstorm: **town navigation becomes location-first "walk to a place"** (free; the encounter costs the action), and **Reuben's health becomes a labeled "Tiredness" meter with plain advice**.

**Scope:** presentation + a small amount of new state for the town-walk. No change to the core loop, the economy, the reckoning, or the crop model. Reuses the scene engine, the tips system, `fxTag`, and the content pipeline.

**Problem:** the loop is legible enough to *operate* but not to *understand*. Players can't read cause and effect: they can't gauge Reuben's tiredness or decide rest-vs-work, can't tell what each action does, don't feel tending help a crop, and (in town) can't get back to the farm. The onboarding also front-loads text in the wrong places and leaves the naming/intro screens noisy.

The pass is organized into five work areas (A–E), each a group of the ten notes.

---

## A. Intro & naming polish (notes 1, 2)

**Naming screen** (`front.js`, the `name` screen ~line 60):
- Remove the eyebrow **"Before the letter comes"**.
- Remove the hint **"This is the name over the door for as long as your line holds the land."**
- Shorten the prompt body to one concise line: **"This land will carry your family's name for as long as your line holds it. What is it?"**

**Intro paging** (`front.js`, the `letter` screen ~line 82): the Previous/Next (and Begin) controls must sit in the **same on-screen position on every page** (letter page 1, narration page 2), and page 2's text must occupy the **same text block/position as the letter's body**, so nothing shifts as the player pages. Implementation: both pages share one fixed layout shell (a constant-height reading area + a fixed control row at the bottom); only the inner content swaps. The letter's aged-paper leaf and the plain page-2 narration render into the same positioned container.

---

## B. Tutorial timing (notes 3, 4)

The guided tips (`content/tips.js` + `pendingTip`) fire by phase/screen. Re-sequence:

- **The orientation tip** ("Now then. Coin buys seed and fuel… that row of dots up by my name… the Regard beside it…") currently fires on the planting screen as the first `plant` page. Move it to fire the **moment the player first reaches the Silas's Welcome scene** (the `silas_welcome` scene, Day 1) — it is an orient-to-the-HUD tip and belongs at the very first game screen, not at planting. Add a `pendingTip` candidate keyed on the active scene being `silas_welcome`.
- **The two planting tips** ("This is the season's planting. Turnip and potato are quick…" and "Mind the fertility dots on each field…") must show **together** on the sow screen, as one multi-page tip (they are already sibling pages of the `plant` tip array — the fix is to ensure the orientation page is no longer bundled with them, leaving the two planting pages as the `plant` tip that fires at planting).
- **Delete Reuben's counsel block** on the Day screen ("I have set us to the work the way I would do it…"). Remove the `counsel()` call from the `day:` renderer (keep the `counsel` mechanism for the planting screen if still used there, or remove `counselFor`'s `day`/`week` branch). The stat tags (area D) replace what the counsel was explaining.

**Net onboarding shape** (upholds D-039): orient at the very first screen → the two planting tips at sowing → mechanics thereafter taught by the always-visible stat tags rather than a paragraph of counsel.

---

## C. Goal panel redesign (note 5)

Replace the current `goalPanel` ("The cold months will want / Wood 0 of ~40 wood · 40 short / Food 80 of ~40 food · laid in") with a clearer, better-looking panel:

- Header: **"To last the winter, lay in —"**.
- One row per resource (**Wood**, **Food**), each showing **`have / need`** (e.g. **0 / 40**, **80 / 40**) with a **progress bar** filled to `have/need` (capped at 100%).
- Colour by state: **amber** bar + `(N to go)` when short; **green** bar + **"✓ laid in"** when met.
- Drop the confusing "~" and the "N short" phrasing; `have / need` + the bar carries it.

Values come from the existing `yearNeeds(state)` selector (`fuel.have/need`, `food.have/need`). Pure presentation change.

---

## D. Legibility system (notes 6, 7, 8) — the core of this pass

Three connected pieces so the player can read cause and effect.

### D.1 Reuben's health, read plainly (note 6)
- Relabel the strain meter as **"Tiredness"** (the word "strain"/"condition" is internal).
- Show a **one-line verdict** next to the meter, from the condition band: **Steady → "fine to work"**, **Worn → "rest him soon"**, **Failing → "rest him now"**, **Lost** never shown (they're gone).
- Keep the bar (filled by `strain / lostAt`, coloured by band). This makes rest-vs-work a legible decision.
- Reuben's first-visit tip mentions it once ("Watch a hand's Tiredness; a worn hand worked hard does not last").

### D.2 Stat tags on every action (note 7)
A general **effect-tag grammar** on the choice buttons, green for gains, red for costs, mirroring the scene `fxTag` but for actions:
- **Crew tasks:** Rest → `−Tiredness`; Tend → `grows crop`; Harvest → `+Food` or `+Coin` (by crop tier); Forage → `+Food` `+Tiredness`; Chop → `+Wood` `+Tiredness`.
- **Your actions:** Forage → `+3 Food`; Work a field → `grows crop`; Sit with a hand → `−Tiredness` (their tiredness); Rest → `keeps your strength` (no cost).
- Tags are **derived** from a single source of truth: an `actionEffects(task)` / `playerActionEffects(kind)` selector returning `{ label, valence }[]`, so the tag text and the actual reducer effect never drift. (A test asserts every offered task has a tag.)
- Disabled tasks keep their existing plain "why" reason (D-039); a valid task shows its effect tag.

### D.3 Tending, made to feel real (note 8)
Tending currently adds `tendGrowthBonus` (0.05/day) invisibly. Make the help visible:
- On the field board, a tended field's **growth bar visibly reflects the bonus** and shows a **"tended ✓ · +growth"** mark (extends the existing "worked today ✓" badge with the effect).
- The field projection reflects tending in its `when` read where it changes the ripen day (e.g. "ripens a day sooner" when the accumulated tend bonus pulls the ripen day in) — at minimum, the tag + the bar movement give immediate feedback.
- **Balance check (Q-003):** if the tend bonus is too small to ever visibly move the ripen day, raise `tendGrowthBonus` so a few days of tending demonstrably pulls a harvest in by at least one day. The player must be able to *see* tending pay off.

---

## E. Town walking + return home (notes 9, 10)

**The locked model:** town is **location-first**. The Town screen lists **places** to walk to (Saloon, Smithy, the Market, Church, Doc's rooms, the Jail, Nan's cottage, the Bank). This reframes the current NPC-row list into place-rows.

Flow:
1. **Walk to a place** — **free** (no action cost). Sets the active town location; the reading panel **paints a short scene** for that place (a location vignette, drawn from `content` — reuse the location `desc`/plate briefs and a line or two of scene-setting prose).
2. At the place, the panel then offers the **encounters** there: **"Talk to <NPC>"** (opens their standing-gated talk deck — the existing `VISIT {npc}`), **"Take a job"** (if an odd-job is on offer there), and later **"Buy…"** (Phase C/D shops). **These cost one action** (unchanged gating: day phase + an action left).
3. **"Head back to the farm"** — a clear control, always present in town, that returns to the Home/day screen. Fixes note 9.

State: add `townAt` (the current place id, or null = the town overview/street). Walking sets `townAt`; "back to the farm" sets `screen: "home"` (and clears `townAt`). Reducer actions: `WALK_TO {place}` (free), `LEAVE_TOWN` (→ home). `VISIT`/`ACCEPT_JOB` unchanged but now dispatched from within a place.

The Day-screen **"Ride to Marrow's Cross →"** (already built) is the entry; it lands on the town **overview** (the list of places). This keeps travel a menu, not spatial movement (upholds D-006), while *feeling* like going places (the scene-paint per location).

---

## Failure-mode audit

1. **Difficulty miscalibration:** none of this changes balance except D.3's tend-bonus check (Q-003 owns it). Legibility makes the *existing* difficulty fair rather than opaque.
2. **Dominant strategy:** stat tags reveal tradeoffs (every gain has a cost — foraging/chopping tire the crew), which *deepens* the rest-vs-work decision rather than solving it. No new dominant line.
3. **Cheese/exploits:** walking being free is safe (it's navigation; the scarce thing — the encounter — still costs an action). "Head home" can't be used to dodge a consequence (the day only resolves at Turn in, unchanged).
4. **Emotional flatness:** the town-walk scene-painting adds texture (each place gets a vignette); the tags and Tiredness read make the crew feel legible and human ("rest him soon") rather than a number.

---

## What changes in code (high level)

- **`front.js`:** naming copy; a shared fixed layout shell for the two intro pages.
- **`content/tips.js` + `pendingTip`:** re-sequence (orientation → `silas_welcome`; planting pair stays at planting); the tip copy for the orientation tip trimmed of the planting content if bundled.
- **`screens.js`:** remove the Day-screen counsel; the redesigned `goalPanel`; the Tiredness read + verdict in the hand row; effect tags on crew tasks and player actions; the reworked `town:` renderer (place list → walk → scene → encounters → head home).
- **`selectors.js`:** `actionEffects`/`playerActionEffects` (tag source of truth); the tend-visibility read.
- **`reducer.js` + `state.js`:** `townAt`; `WALK_TO`, `LEAVE_TOWN`.
- **`components.js`/`board.js`:** the tended "+growth" mark.
- **`content/script.yaml`:** short location vignettes for each walkable place.
- **`balance.js`:** possibly a larger `tendGrowthBonus` (Q-003).
- **Styles:** goal panel, tags, Tiredness read, town place-rows.

## Open / tunable (Q-003)

- `tendGrowthBonus` size (must visibly move a ripen day).
- Exact tag wording ("grows crop" vs "+Growth").
- Whether "Head back to the farm" should also be reachable via the existing Home tab (yes — the tab bar already allows it; the explicit button is the discoverable path).

---

*Feeds writing-plans next: a phased plan — legibility & onboarding first (A–D), then the town-walk refactor (E).*
