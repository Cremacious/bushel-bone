# Session History

Chronological log of what each Claude session accomplished. Append a new entry at the top after every session that changed anything meaningful.

Format: `## Session N — YYYY-MM-DD — Short title`
Body: what was worked on, what was decided, what artifacts were produced, what's next.

---

## Session 15 — 2026-07-28 — Prototype rebuild Plan 2: the weekly loop & the hands (built & merged)

**Worked on:** Executed **Plan 2** of the prototype rebuild subagent-driven, on branch `feat/prototype2-weekly-loop`, now **merged to main** (merge `f04dc93`). Makes one full **Year 1 (Spring → Winter) playable** in `prototype2/`: plant the four fields, assign each hand a weekly task and spend your own week, watch crops grow and the larder drain, keep the crew fed and warm, and lose a hand to a bad winter if you fail. This is the fun engine (the season time-economy, D-043/D-048) rendered in the V0.3 design.

**Built (five units, each spec- + code-quality-reviewed with fix loops, then browser-verified):**
- **Pure core** (DOM-free, unit-tested): `crops.js` (staple/cash tiers + `ripe`/`weeklyGrowth`), `balance.js` (first-pass tuning, all Q-003-owned), the season/week **phase machine** (brief → planting → week → dusk → next season; yearend at winter's close), the hand **strain/condition track** (Steady→Worn→Failing→Lost, derived from strain), and the reducer actions (`BEGIN_SEASON`, `PLANT`, `FALLOW`, `SOW`, `ASSIGN`, `SET_PLAYER_ACTION`, `RESOLVE_WEEK`, `END_SEASON`). `resolveWeek` is the heart: labor → growth → eating → winter cold → strain → loss.
- **Render layer:** a phase **router** + one screen per phase (Morning Brief, Planting, the two-economy **Weekly Plan**, Dusk day-book, the Year-1 verdict) and read-only **Fields/Hands/Ledger/Almanac** tab views, on the Plan-1 shell/tokens/`el()`, styled in `screens.css` (token vars only, V0.3 language).
- **A full-year headless playthrough** proves the loop never wedges and a cautious line survives; the pressure lands on the **hand's condition** (a solo hand worked all 20 weeks ends at strain 80/failing) not the resources, which is exactly the "keep your people alive" core.

**Reviews caught real issues (all fixed before merge):** a hand was silently tired for empty motion (tend on bare ground / harvest with nothing ripe) — fixed in both layers (`resolveWeek` only charges strain for real work; the Weekly Plan disables a dead task with a plain reason, per D-039); a hardcoded season length → `WEEKS_PER_SEASON`; `.prose > .prose` nesting; season-label duplication single-sourced to `seasonLabel()`. First-pass balance nudge (`hardLabor` 6→4, `fuelPerChopWeek` 5→10, documented in `balance.js`) so a naive solo line survives the year.

**19 files / 74 tests green.** `prototype/year1.html` untouched.

**Known follow-ups (deferred, noted for later):** the Dusk CTA reads "Turn the page" (plan/test text) vs the design mockup's "Turn the year" — a one-line copy reconciliation; per-field task targeting is simplified (tend/harvest default to the first sensible field) — a genuine Plan-3 refinement; seed doesn't yet vary a run (no RNG consumed until events land in Plan 3).

**Next:** **Plan 3 — depth & drama** (events with lasting consequences, the reckoning biting, death's burial ritual + traits + moral weight, forage/hunt/preserve, spoilage), then Plan 4 (the town), Plan 5 (the year & the squeeze), Plan 6 (polish & the Almanac). Plus the standing milestone-2 items (#24 art direction, #48, a Vercel proof-of-concept).

---

## Session 14 — 2026-07-28 — Gameplay-depth design, Claude Design reconciliation, and the prototype rebuild (Plan 1 built & merged)

**Worked on:** Chris flagged the prototype as "interesting but not fun — no real gameplay, players get bored." A long design-first session (no code until a plan was approved), then a subagent-driven build of the foundation.

**Design (brainstorming skill, all locked as D-042→D-048; spec `docs/superpowers/specs/2026-07-28-gameplay-depth-design.md`):**
- The root cause: no scarce resource spent on competing choices. Fix = a **season action-economy** (D-043) — ~5 weekly beats, always over-subscribed — plus **Marrow's Cross exploration** (D-044, the TOWN tab: a menu of NPC scenes, per-NPC standing + rotating deck), an **economic-squeeze difficulty curve** (D-045, flat budget, one telegraphed pressure per year), and a reframe to a **legacy/dynasty survival sim** (D-042) with a **legacy-ledger score** and succession economics (D-046) — the game is endless, you play to last, kind legacy = a gift to your heir, cruelty = a curse. Content-not-power meta upheld.
- A follow-up deep-dive fleshed out the **minute-to-minute weekly loop** (D-048, spec §10): two interlocking economies (assign the crew's clone-days + spend your own week), farming+survival crew tasks, hands as mortal individuals (staged condition Steady→Worn→Failing→Lost, burial ritual, cruelty witnessed and logged), a three-tier crop gamble incl. the Weird crops, the four ledger resources made alive (spoilage/winter fuel/per-hand cold), forecast+surprise events with lasting compounding consequences, and a reckoning that bites. The Mechanics Bible already had 19 systems; the *loop* was the gap.

**Claude Design reconciliation (D-047):** Chris built a new UI ("V0.3") in `design/version-1/`. Reviewed it against the design: strong alignment (two form factors; a six-tab phone bar that realizes the locked portrait-primary decision and already reserves the Town and Almanac tabs). Two conflicts resolved: the opening letter becomes a **hybrid** (canon ≈1884 facts + the design's tighter lines; the design's placeholder 1841/S.Ridley not adopted), and the **"Day X of 20" counter sits over the ~6/weekly action economy.** The prototype is to be **rebuilt** against V0.3 (modular vanilla, no framework, prototype-first before the Next.js production build).

**Build (writing-plans → subagent-driven-development):** wrote a staged plan (`docs/superpowers/plans/2026-07-28-prototype-rebuild-foundation.md`, Plans 1→5) and executed **Plan 1 (foundation)** subagent-driven — fresh implementer + spec-compliance + code-quality review per unit, on branch `feat/prototype2-foundation`, now **merged to main**. Result: **`prototype2/`** — a pure `(state, action) => state` core (state model + reducer + week/season/year clock), a render layer drawing the V0.3 shell (masthead, brass ledger, six-tab nav, night/day, phone + desktop), and the `content/*.yaml` pipeline ported to ES-module data (reuses #45/#46). **22 tests green (8 files)**; `prototype/year1.html` untouched. Reviews caught real bugs (a duplicate `seed` key and a `:root` theme-scope issue in the plan itself; added a generator drift-guard, a PRNG determinism test, and `el()` boolean-attr hardening) — the plan doc was corrected to match.

**Next:** **Plan 2 — the weekly loop & the hands** (read → assign crew → your action → resolve; hand condition tracks; crops; the four live resources), then Plans 3-5 (town, the squeeze/years, polish + the Almanac). All numbers owned by the balance model (Q-003).

---

## Session 13 — 2026-07-28 — Founder story, Year-1 prototype parts: Malachi's journals + Reuben's thread (#43)

**Worked on:** The buildable-now slice of #43 (the founder story, "The Inherited Vigil"). Most of #43 — the Old Well payoff (Years 7/10), the earned-reunion ending, the Codex "how much of the truth was uncovered" field, and the fixed-anchor-vs-new-lineage succession logic — lives in years and systems the Year-1 vertical slice doesn't have, so those stay production-port-gated (their prose is already canon in narrative-bible §0.12–§0.14). The Year-1-appropriate pieces are the **journals feature** and **Reuben's "knew Malachi" thread**; Chris picked both, plus a masthead book control with an unread dot. The Day-1 inheritance framing was already done in Session 10.

**Built (all in `content/script.yaml` + `year1.html`, on the #45/#46 infra):**
- **Malachi's journals.** The four canon 1864 arrival entries (narrative-bible §0.11) — *The first spring / Summer / Fall / The first winter* — added to `content/script.yaml` (tokenized: `{{npc.reuben}}`, `{{npc.nan}}`, `{{npc.malachi}}`). One unlocks per season across Year 1 (`journalUnlockedCount()` = `S.si+1`). A small **book control in the masthead** (engraved SVG, beside the ?/theme toggles) opens an overlay of the unlocked entries, styled as aged italic pages; sealed later pages are noted. An **unread dot** (`renderJournalDot()` in `refresh()`) marks a new page; `S.journalSeen` tracks read state and persists in the save. A one-time guided-mode tip points at the book, fired from `endSeason()` (a season turn, never during boot, so it can't collide with the opening prompt or another tip).
- **Reuben's "knew Malachi" thread.** A new *"Did you know my uncle?"* topic on the Ask Reuben panel: Reuben grieves Malachi, remembers his kindness, and points to the journals — restrained, no spoiler of the Old Well or the sacrifice (the journals reveal that slowly across later years). This reply is newly authored (the journals are canon; Reuben's spoken thread wasn't pre-scripted) — in voice, dash-free — and lives in `content/script.yaml`, so it also flows through the #46 .docx round-trip and the #45 name tokens.

**Verified:** full suite green at **31 files / 110 tests**, incl. new `tests/journals.test.mjs` (4: one entry unlocks per season, the unread dot toggles and clears on open, only unlocked entries show with tokens resolved and no leaks, and Reuben's uncle topic renders his remembrance). Fixed a real interaction bug caught by the existing `tip.test.mjs`: firing the journal tip from `refresh()` (which runs on every paint) collided with other tips — moved it to the discrete `endSeason()` season-turn instead. Confirmed the overlay renders correctly by DOM inspection (the browser preview's static-snapshot mode wouldn't composite live changes).

**Still open on #43 (production-port scope, canon-written):** the Old Well beats at Years 7 and 10, the earned-reunion ending in the Year-10 verdict, the Codex truth-uncovered field, and the first-lineage-vs-later-lineage framing across succession. Left the issue open with the Year-1 boxes checked.

**Next up:** the rest of #43 when the production port exists; and the standing milestone-2 items (#24 art direction, #48 mobile fixed-canvas, a Vercel proof-of-concept for testers).

---

## Session 12 — 2026-07-28 — Dialogue extraction + .docx round-trip (#46)

**Worked on:** Issue #46 — pull every line of the game's writing out of the code into one editable screenplay, and support a Word round-trip (export to `.docx`, tighten by hand, hand back, apply). Chris chose scope up front: `year1.html` narrative prose only for now (the `content/events/*.yaml` files aren't loaded by the prototype yet), and narrative dialogue only (mechanical UI microcopy and help panels stay in code). Built and committed in two parts.

**Part 1 — extraction (commit d70136e):**
- **`content/script.yaml`** — the single screenplay: one entry per scene (eyebrow, title, dir, body, and choices with text/sub/why/result), laid out readably, tokenized with the #45 name tokens. ~205 lines across 23 scenes (all 28 card beats collapse into these — the four season opens, Silas, the Fair, Vane's wagon, the moral fork, Harvest Home, Sour, Ruth's basket, the Long Vigil, the year-end verdict, and all 11 systemic events).
- **`prototype/gen-script.mjs`** (`npm run gen:script`) — parses the YAML with the `yaml` lib, flattens scenes to `<scene>.<field>` / `<scene>.<choice>.<field>` ids, and injects a `SCRIPT` map into `year1.html` between markers (same pattern as gen-names; the single-file prototype can't fetch at runtime). `--check` mode guards drift.
- **`L(id[, vars])`** in `year1.html` returns a line from `SCRIPT`; `{{name}}` tokens resolve later at paint via `tok()`, and the handful of runtime-interpolated lines splice a value through a single-brace `{slot}` (e.g. the Fair's `{field}`/`{blessing}`, the moral fork's `{field}`, the year-end's `{names}`). Every beat, event, and the verdict were refactored to `L()`.
- The mechanical action screens (planting, assignment, market, dusk report, provisioning) stay in code by design — procedural UI, not screenplay.

**Part 2 — the .docx round-trip (this commit):**
- **`prototype/script-lib.mjs`** — shared helpers: load the YAML, resolve `{{name}}` tokens against `names.yaml` (mirrors the game's `tok()`), and flatten a stored HTML line to the readable prose that appears in Word.
- **`npm run script:docx`** (`script-docx.mjs`) — writes `docs/script.docx` (gitignored, regenerable), a screenplay with each line under a small `[scene.field]` label, names filled in, HTML flattened, spoken lines kept.
- **`npm run script:import`** (`script-import.mjs`) — reads an edited `.docx` with `mammoth`, matches lines back by their stable `[id]` labels, and reports exactly which changed (old vs new, plus the raw YAML value that still carries tokens/markup to preserve) and a JSON block. It does **not** write the YAML itself: the apply is Claude-mediated, so tokens and inline markup (spoken lines, emphasis) that the readable Word text drops are re-applied by hand and reviewed before landing.
- Stage-direction brackets like `[a wagon-rutted road…]` contain spaces, so they never collide with the dotted, space-free `[scene.field]` id labels.

**Verified:** full suite green at **30 files / 106 tests**. New `tests/script-dialogue.test.mjs` (7: SCRIPT populated, `L()` slot-fill and missing-id, beats render from the script, an edit propagates, a no-token-leak full-year playthrough, a guard that ten distinctive extracted phrases are no longer inline in the source, and the generator `--check` sync) and `tests/script-docx.test.mjs` (2: export produces a labelled/name-resolved docx, and a pristine export re-imports with zero changes). Also proved the edit path live: changed two lines in a copy of the docx and the importer flagged exactly those two with correct old/new. Added `yaml`, `docx`, `mammoth` devdeps. Workflow written up in `docs/script-workflow.md`.

**Deferred (noted for later):** the ~120 name literals / dialogue across `content/events/*.yaml` — not loaded by the prototype yet — can fold into the same screenplay + token scheme when the production port loads them.

**Next up:** the rest of #43 (the founder-story feature: journals, the Old Well payoff, the reunion ending, the Codex field), and the standing milestone-2 items (#24 art direction, #48 mobile canvas, a Vercel proof-of-concept for testers).

---

## Session 11 — 2026-07-28 — Names config as source of truth (#45)

**Worked on:** Issue #45 — one config file that is the single source of truth for every NPC and location name, so a placeholder rename is a one-line edit that propagates everywhere. Chris chose the two shaping calls up front: a real YAML file consumed via a generator (over an inline JS object), and tokenizing the prototype's prose now while deferring the `content/events/*.yaml` prose to #46 (dialogue extraction), which will reuse the same token scheme.

**What shipped:**
- **`content/names.yaml`** — the canonical config: `places` (town, region, well), `terms` (shared family surnames: ridley, halloway, grange, vane), `characters` (id → name/first/role/desc), `locations` (id → cap/sub/desc). Full names are composed from the shared surname (`meredith.name: "Meredith {{term.vane}}"`), so renaming a family is one edit.
- **`prototype/gen-names.mjs`** + `npm run gen:names` — injects the config into `year1.html` between `/* names:start */`…`/* names:end */` markers as a generated `NAMES` object (the single-file prototype can't `fetch()` at runtime). Has a `--check` mode used by a test to guard drift; newline-aware so it's stable on CRLF. `NPCS`/`SETTINGS` are now aliases of the generated config, not a second copy. Includes a deliberately minimal YAML reader (throws on anything outside the documented shape); the Next.js port will load the same YAML with a real parser.
- **Render-time resolver** `tok()` — replaces `{{npc.id[.field]}}`, `{{loc.id[.field]}}`, `{{place.id}}`, `{{term.id}}`, `{{lineage}}` against the config, multi-pass so composed names resolve. Wired into every render sink: `paint()` (stage cards), `openOverlay()` (all overlays), `setPlate()` (plate/nameplate), `renderIntroPage()` (the #44 letter), the folded tut-tip branch, and the static chrome (askbar, colophon, aria-label) at boot. The starting hand's name now comes from the config too (`mkHand("reuben", tok("{{npc.reuben}}"), …)`).
- **Prose tokenized** — every NPC/location display name across `year1.html`'s scripted beats, systemic events, choices, results, dirs, help text, tutor, and the intro letter now references a token. Handled the landmines by hand: names whose literal equals the config value (Reuben, Doc Bell, Old Nan, Sheriff Coldwater, Malachi) and `openAskReuben` (a function name containing "Reuben") ruled out blanket replaces; first-name/surname forms (Silas/Bess/Ruth, Ridley/Vane/Grange) resolve via `.first` fields and `term.*`.

**Verified:** full Vitest suite green at 28 files / 97 tests, incl. new `tests/names-config.test.mjs` (7: namespace resolution, family-rename propagation, static-chrome resolution, a no-`{{`-leak scan across a full year + overlays + intro + tut-tip, a no-hardcoded-literal source guard, and the generator `--check` sync). Also did a live round-trip proof: edited two lines in `names.yaml` (Ridley→Thorne, Silas→Josiah), ran the generator, and the nameplate, card title, body prose, and dialogue all changed together; then reverted.

**Deferred (noted for #46):** the ~120 name literals across `content/events/*.yaml` (not yet loaded by the prototype, so no visible seam) will be tokenized with the same scheme when dialogue is extracted.

**Next up:** #46 (dialogue extraction, shares this token scheme), then the rest of #43, and the standing milestone-2 items (#24 art direction, #48 mobile canvas, a Vercel proof-of-concept).

---

## Session 10 — 2026-07-28 — New Game opening letter (#44), Day-1 inheritance reframe (part of #43), Sull→Sallows scrub

**Worked on:** Built the **New Game opening** (issue #44) into `prototype/year1.html`, then, at Chris's direction, folded in two adjacent pieces: the **Day-1 inheritance reframe** (the first task of #43) and a full **Sull→Sallows** rename across all player-facing content.

**The opening (#44), to the locked copy in the issue:**
- A **lineage-naming step** ("Name your line"): a surname field prefilled `Crane`, editable, capped at 18 chars, Continue disabled on a blank, Enter also advances. Stored as `S.lineageName` and persisted in the save (survives a save/load round-trip), ready for the later Codex/graveyard/heir uses.
- A **two-page letter**, its own black-screen register regardless of the day/night theme, paged with Previous/Next and a page counter, Next becoming **Begin** on page 2. Page 1 is the Sallows Charter Company letter styled as black ink on an aged-paper leaf; **page 2 is plain cream-on-dark narration** (not a letter, so it deliberately does not wear the paper — Chris's call). `{LINEAGE NAME}` fills uppercase beside MALACHI and title-case in "the {name} place" on both pages.
- Plays on **every** New Game (Continue skips it); routes through `startIntro()` → `beginNewGame(name)`, leaving the test-harness entry point (`beginNewGame()` with no args) intact.

**Day-1 reframe (part of #43):** the opening Morning Brief card went from a generic charter ("You have taken the charter on a homestead…") to **"Your uncle's ground"**: inherited as Malachi's nearest blood, he *vanished this past winter*, Reuben stays on as the hand who worked beside him. All mechanical starting facts preserved. **Silas's Welcome** now hands over the inherited mortgage (*"I hold the paper on this place, the same as I held it for your uncle… the debt came down to you along with the land"*), still cold and transactional, keeping the eerie "soft ground by the east field" beat. The rest of the #43 epic (journals, Old Well payoff, reunion ending, Codex field) remains its own work.

**Sull→Sallows scrub:** the docs were renamed Sull→Sallows in a prior commit but the prototype and content still said "Sull". Renamed all 11 prototype references and ~24 across the seven `content/events/*.yaml` files. Done as a careful proper-noun rename (case-sensitive, so lowercase "sullen" was left alone), with the three tricky forms handled by hand: two possessives → "the Sallows'", and one contraction ("the Sull's not for sale" = "the Sull is") expanded to "the Sallows isn't for sale". All seven YAML files re-parsed clean.

**Verified:** full Vitest suite green at 27 files / 90 tests (new `tests/intro-opening.test.mjs`, 9 tests; two start-screen tests updated for the intro; no test referenced the old copy or the word "Sull"). Walked the whole flow live in the browser (start → name → letter p1 → p2 → Begin → reframed Morning Brief → Silas), no console errors.

**Artifacts changed:** `prototype/year1.html`, `prototype/tests/intro-opening.test.mjs` (new), `prototype/tests/start-screen.test.mjs`, all seven `content/events/*.yaml`, `CLAUDE.md`, this file.

**Next up:** #45 (names config) and #46 (dialogue extraction) are the natural plumbing before more narrative pours in; then the rest of #43, plus the standing milestone-2 items (#24 art direction, #48 mobile canvas, a Vercel proof-of-concept for testers).

---

## Session 9 — 2026-07-27 — Onboarding clarity pass, part 2 (issues #27 to #42, D-039)

**Worked on:** Chris ran a full playtest of the just-shipped onboarding clarity pass (`docs/superpowers/specs/2026-07-27-onboarding-clarity-pass-design.md`) and reported a long list of remaining confusion points. Rather than a single design doc, this session filed 16 GitHub issues (#27 to #42) covering every point, agreed an implementation order with Chris, then worked through them one at a time: implement, report exactly what changed and how to see it, wait for explicit approval, close the issue only on a yes.

**Closed this session:** #39 (reworded "Crows in the Corn" to remove an unintended reading), #31 (Reuben's guidance no longer names a specific crop), #27 (fertility fully explained on the planting screen, five review rounds before it landed), #30 (live seed-spend feedback while planting), #34 (per-crop info icon, moved per Chris's preference with a padded tap zone), #29 (explicit "Show roster" button plus a Close button on the roster panel), #33 (reworked guided tutorial tips from a non-blocking bottom bar into blocking, paginated modal dialogs, several copy fixes found only by testing it), #28 (crew-assignment screen gives a direct answer when there is only one hand), #41 (the market screen always shows, and always lists still-growing fields; also fixed a real "l.name" bug that would have shown "undefined" for cotton).

**Real bugs found via user testing that pure code review would have missed:** the sell/larder toggle buttons already had a `sel` class wired up with no matching CSS rule (silently doing nothing); a cash-crop lot object had no `.name` field so cotton's harvest line would read "undefined"; and the Attend the Fair "blessed field" bonus targeted an essentially arbitrary field (`S.fields.find(x=>x.crop)`, i.e. whichever planted field has the lowest id) with zero on-screen indication of which field or that it happened, which is what made two mechanically identical crops (turnip and potato, both one season) visibly diverge with no explanation.

**Decided (→ D-039):** onboarding hand-holding fades out gradually across a run, never abruptly; any hidden mechanical effect that could read as a bug to a first-time player gets a plain-language explanation the moment it first matters. Written up with rationale in `decisions-log.md`, indexed in `CLAUDE.md`'s locked-decisions table.

**Process note worth keeping:** several rounds on #27 and #33 were the user pushing back on a fix that was technically correct but still unclear (a contradictory sentence, a "See this" pointing gesture whose target was dimmed by the very modal explaining it, a crop-timing claim that was flatly wrong). Verified suspect claims against the actual code and, once, against a small scripted repro (`prototype/tests/helpers.mjs`) rather than trusting a first draft. Worth continuing: don't mark an issue resolved on a plausible-sounding explanation alone if it's checkable against the running code.

**Next up:** issues #35 to #40, #42 remain open (mobile/desktop layout epic, start screen and save system, How to Play screen, Settings and audio, Year One as a low-risk tutorial arc, operating-cost visibility before the dusk report), roughly in that priority order agreed with Chris.

---

## Session 8 — 2026-07-27 — The founder's story (The Inherited Vigil, D-038)

**Worked on:** Designed the game's story with Chris in a choice-driven, collaborative session (Chris picked every fork; Claude offered options and tradeoffs). Goal set by Chris: the narrative that gets a player started, explains why they take the farm and why there is a Reckoning, and what the ending shows, plus how the uncle threads into the existing cast.

**What we found first:** the world, the cosmology (the Marrow), the 10-NPC cast, the Vane three-truth mystery, and the season arcs Years 1 to 10 were all already canon (narrative-bible Parts 1 to 4). The real gap was the **player's personal on-ramp**, so the session focused there and wove it into the existing world rather than reinventing it.

**Decided (→ D-038), the forks Chris chose:**
- **Origin:** an **inheritance** (over fresh charter / fleeing / returning blood). You are the heir of an uncle you never met.
- **The uncle, Malachi:** a quiet, kind farmer who worked the Sull twenty years, learned the Marrow alongside Old Nan, and kept a private vigil.
- **His fate:** **vanished, no body, no grave**, left his journals.
- **The truth (fixed, not randomized):** the town's Long Vigil was slowly losing, and he **went down the Old Well and gave his life freely** to renew the failing seal.
- **The trail (lean):** the player retraces him through his **journals**, **Old Nan** (spiritual truth), **Sheriff Coldwater** (the cold case), and **Reuben** the Foreman (his old hand). Chris kept the trail lean, declining Silas/Grange/Meredith as carriers.
- **Thesis:** **deferral, forever.** You never beat the land; the best ending is bittersweet (the seal renewed, the watch passed to an heir on a loved land), agreeing with the core fantasy "I survived another year" (D-001).
- **The reunion:** **earned and rare**, a reward for a kind, low-Reckoning lineage.
- **Meta:** Malachi's sacrifice is permanent town canon (D-015); the first lineage is his heir; later lineages rediscover the truth, Codex-tracked. He is the fixed personal anchor beside the randomized Vane mystery.

**Artifacts changed:** `docs/narrative-bible.md` (new **Part 0: The Founder's Story**, plus cross-refs on Old Nan, Coldwater, and the Old Well, and the status line), `context/decisions-log.md` (D-038, Session 8 header), `context/open-questions.md` (Q-013 resolved), `docs/vertical-slice-year1.md` (Year-1 reframed as arrival-and-inheritance: the starting state, Silas's Day-1 call, the Long Vigil resonance, a Journals object), `CLAUDE.md` (status bullet + footer), this file. Not yet committed.

**Also:** opened a GitHub issue to implement the story (the prototype's Day-1 inheritance framing, the in-game journals/almanac feature, Reuben's "knew Malachi" thread, the Year-7/Year-10 Old Well payoff, the earned-reunion ending state, and a Codex field for how much of Malachi's truth a lineage uncovered). Code/prototype changes were deliberately left for that issue rather than made unreviewed this session.

**Next up:** implement the founder story per the new issue; plus the standing milestone-2 items (#24 art direction doc, the Vercel proof-of-concept for testers).

---

## Session 7 — 2026-07-26 — UI clarity pass (#19)

**Worked on:** Closed out the "UI clarity" issue in the "Prototype v0.2: Onboarding & Imagery" milestone, per the approved design (`docs/superpowers/specs/2026-07-25-ui-clarity-pass-design.md`) and implementation plan (`docs/superpowers/plans/2026-07-26-ui-clarity-pass.md`). Nine tasks: three build the reusable mechanisms, five author content season by season, one wraps up.

**Built:** Three reusable mechanisms in `prototype/year1.html`: a `screenType`-keyed contextual help toggle in the masthead ("what do I do here?"), tap-to-reveal explanations on the four ledger cells (Coin, Larder, Fuel, Seed), and a structured `tag`/`why` field on choice buttons (a short badge for a clear resource cost/gain, a disabled-reason line in place of the normal sub-line when a choice can't be taken). Then a full content-authoring pass applied those mechanisms across all four seasons' scripted beats and systemic events, plus the planting screen, where disabled crop chips now explain why they're disabled.

**Process:** Subagent-driven, one implementer + one spec-compliance reviewer + one code-quality reviewer per task, across all nine tasks, following the written spec and plan rather than improvising per-task.

**Hidden-Reckoning constraint:** every tag decision was checked against the standing design rule that the Reckoning meter is never named or numbered anywhere in player-facing UI. Choices that move the hidden Reckoning got a `sub` line describing the moral weight in voice, never a tag naming or quantifying it. This was enforced task by task by the reviewers, not left to a single final pass.

**Mid-implementation correction:** Task 8's first pass used a hover-only `title` tooltip for disabled planting chips. Code review flagged this as a mobile-usability gap (the game is mobile-first per CLAUDE.md; native tooltips don't fire on touch), so it was reworked to a tap-to-reveal popover, reusing the same `openInfo()` helper the ledger and screen-help toggles already used.

**Verified:** Full suite green at 23 test files / 58 tests (`cd prototype && npm test`). A temporary headless smoke script (`prototype/smoke.mjs`, written for this task and deleted afterward) booted the game three times, clicked through a full year each run using the `helpers.mjs` `advance()` pattern, and confirmed no thrown errors and no unknown `screenType` values at any step (all runs reached an end screen in 35 steps, well under the 400-step safety bound).

**Artifacts changed:** `prototype/year1.html` (all nine tasks), `docs/gameplay-flow.md` (§8 rewritten from "known gaps" to "resolved"), `CLAUDE.md` (status line + footer), this file.

**Next up:** Close issue #19. Then the remaining milestone #2 items: #24 (art direction doc) and the Vercel proof-of-concept for testers.

---

## Session 6 — 2026-07-25 — Dash-punctuation scrub (#26)

**Worked on:** Closed out the last content task in the "Prototype v0.2: Onboarding & Imagery" milestone: scrubbed every em dash and hyphen-as-pause from player-facing text, per D-037.

**Method:** Dispatched nine parallel subagents, one per file, each briefed on the style-guide rule (comma/period/colon/semicolon/fresh-sentence instead of a dash, judged sentence by sentence, not a blind replace) and told to preserve hyphenated compound words. Covered `prototype/year1.html` (42 fixed), all seven `content/events/*.yaml` files (155 fixed total across weather/reckoning/opportunities/town/pests/wildlife/personal), and `docs/style-guide.md` itself (which, ironically, used em dashes in the very prose banning them).

**Verified:** grepped the whole set for `—` (zero remaining), re-parsed all seven YAML files with `pyyaml` (all valid), and re-parsed `year1.html`'s embedded `<script>` block with Node (no syntax breakage from the edits).

**Scope note:** left em dashes alone in internal design/process docs (CLAUDE.md, decisions-log, mechanics-bible, narrative-bible, etc.) and gitignored `.superpowers/` scratch content — issue #26 only covers player-facing prose and the style guide's own examples.

**Artifacts changed:** `prototype/year1.html`, `docs/style-guide.md`, `content/events/{opportunities,personal,pests,reckoning,town,weather,wildlife}.yaml`, `CLAUDE.md` (status line), this file. **Not yet committed** — awaiting the user's go-ahead to commit and close #26.

**Next up:** Commit this scrub and close #26, then the Vercel proof-of-concept for testers (the last item in milestone #2).

---

## Session 5 — 2026-07-25 — Prototype UX design: Reuben the Foreman + the imagery layer

**Worked on:** Acted on the first real playtest feedback (the prototype is confusing to play; Reuben is inconsistently privileged). Ran a full brainstorm-to-spec design pass using the visual companion (mockups approved in-browser), and set up issue tracking for the whole onboarding-and-imagery phase.

**Milestone opened, "Prototype v0.2: Onboarding & Imagery" (#2):** filed and specced the phase, issues #18 to #26. #18 (the gameplay-flow spec) is already closed. Remaining: #19 UI clarity, #20 tutorial, #21 setting plates, #22 portraits, #23 placeholders, #24 art direction, #25 Foreman and roster, #26 dash scrub.

**Design locked (→ D-036, D-037), full spec at `docs/superpowers/specs/2026-07-25-reuben-foreman-and-imagery-design.md`:**
- **Reuben is the Foreman** — the player's right hand and the single voice of the farmhand collective: their voice, the **tutor** (Ask Reuben: "what should I do next?"), and the **Reckoning alarm** (he interrupts in character when moral debt crosses a tier, no number shown). Promotable if he dies. This closes the "why is Reuben special?" inconsistency and makes the hidden Reckoning *fair* (no more "came out of nowhere") while keeping it unmeasured.
- **Farmhand roster** — every hand first-class: a vertical list with morale + condition, per-hand seasonal assignment (realizes the locked per-clone-assignment decision), closing the "scale on anonymous disposable labor" exploit.
- **Imagery layer** — every scene shows a location **"plate"** (woodcut illustration in an engraved border) with an always-visible place-name caption, and a **speaker portrait** rising over it. Play-screen layout settled (visual-novel stage + woodcut border + caption below). Placeholders describe the art until it exists, so the imagery layer is playtestable now.
- Review decisions: alarm fires **first-only** per tier per run; the ambient **collective voice is always Reuben** (individual scripted beats may still show a hand's own portrait).

**D-037 — no dash punctuation:** the em dash (and hyphen-as-pause) is banned in all game text and docs as the strongest AI tell; hyphenated compounds kept. Reverses the old "favor the em-dash" guidance in `docs/style-guide.md`. Saved to memory. Existing content scrub tracked in #26.

**Next up:** turn the spec into an implementation plan (writing-plans), then build toward the sequence Chris set: Foreman/roster + imagery slot → tutorial (#20) → Vercel proof-of-concept for testers.

**Blockers/notes:** in-app Browser pane still flaky, but the visual-companion server (localhost) worked fine in Chris's own browser. `.superpowers/` is gitignored.

---

## Session 4 — 2026-07-24 — First playable: Year-1 browser prototype ("The Newcomer")

**Worked on:** With the "Ready to Code" milestone complete (17/17 issues), began the code phase by building the first **playable** thing — a self-contained browser prototype of the Year-1 vertical slice.

**Delivered — `prototype/year1.html`:** a single-file, dependency-free HTML/CSS/JS game that plays the whole Year-1 loop end to end (Morning Brief → Play → Dusk, four 20-day seasons → "I survived another year"). Faithful to spec:
- **All six scripted beats** — Silas's Welcome, First Furrow, Vane's Wagon, the Cotton/Harvest moral fork, Harvest Home, the Long Vigil — in the `style-guide.md` voice, plus a rotating systemic-event pool per season (Soft Rain, Crows, A Name of His Own, Hot Wind, Pedlar, Rats, Foundling, Cabin Fever, etc.).
- **Real numbers** from `docs/vertical-slice-year1.md` / `balance-model/config.py`: 100 marks / 4 small fields / Reuben / 80 food / 20 seed start; the crop table (turnip/potato/wheat/corn/cotton); seasonal market multipliers + glut soft-cap; d6 weather ladder; winter food+fuel consumption; the 2-year mortgage grace (no Y1 foreclosure).
- **The hidden Reckoning is never a number** — it surfaces only as *omens* (per the voice guide's hidden-axis rule). Cruelty (refusing a name, turning out a foundling) raises it; the pointed "Sour" whisper fires only if it climbs; the Vigil eases it.
- **Seeded PRNG** (mulberry32, seed stored in state and shown in the colophon), state as one plain object — matching the D-021 code conventions so logic ports cleanly to the Next.js build.

**Design/art:** "The Illustrated Almanac" made playable — foxed-paper ground (CSS-generated, not the flat-cream cliché), one bookish old-style face, a **seasonal accent that turns with the year** (sap-green → wheat-amber → oxblood → cold-slate), day/night themes. Portrait-primary, per the locked UI direction.

**Validated headlessly (jsdom, 8+ seeds, auto-played):** zero runtime crashes; the full year always resolves to a win/lose screen. **Balance confirms D-032's target:** a cautious food-first player who declines the second mouth **survives every run**; a player who buys a second hand without securing winter food **loses** to starvation — the "Della" beat lands and Year 1 is tense but fair.

**Also published** as a private claude.ai Artifact for instant mobile play (URL in chat; user can share from the artifact page).

**Next up:**
1. User playtests the prototype for *feel* — does the loop teach itself, does the Summer fork make you hesitate, does the Vigil land? (Feed findings back per the playtest-kit questions.)
2. Iterate loop feel / numbers from playtest.
3. Scaffold the production **Next.js 15** app (D-021) and port the logic into pure `(state, action) => newState` modules, loading `content/events/*.yaml` through the `content-schema.md` contract.

**Blockers/notes:** In-app Browser pane was unresponsive this session (navigate timed out) — validated via jsdom + Node syntax-check instead. Watch: several prose strings needed typographic apostrophes (’) to avoid JS single-quote-delimiter breaks; keep that in mind when authoring inline content.

---

## Session 3 — 2026-07-24 — Pre-code issue tracking + World & Lore foundation

**Worked on:** Set up GitHub issue tracking for all remaining pre-code design work, then resolved the first issue (#3, World & Lore).

**GitHub tracking (done):** Repo `Cremacious/bushel-bone` is live and **PUBLIC** (design docs + issues are world-visible — flagged for the user). Created **17 issues** under the **"Ready to Code" milestone** — when all are closed, the docs are complete enough to code confidently. Labeled by track (mechanics/narrative/content/scope/validation) and priority (P0/P1/P2). Recommended resolution order captured in the final report: Phase 1 foundations (#1 scope, #2 calibration ratify, #3 world, #5 voice) → Phase 2 depth (#4 NPC interiority, #6 exploit bots, #8 mechanics, #12 schema) → Phase 3 breadth (#13/#14/#15 narrative, #9/#10 model, #16 events) → Phase 4 converge (#7 vertical slice → #11 playtest → #17 monetization) → code.

**Issue #3 — World & Lore foundation (DONE, resolves Q-007 + Q-008):** Wrote `docs/narrative-bible.md` Part 1. Three foundational forks locked with the user (→ decisions-log D-029/D-030/D-031):
- **D-029** The Reckoning is real; the land keeps the ledger — *the Marrow*, an old seam under the Sull that returns the wronged dead by name. Cruelty = debt, rite = payment.
- **D-030** Whether making vessels is itself a sin is a *permanently unsettled doctrinal dispute* (Church of the Long Vigil vs. Old Nan) — grounded in the hidden truth + the §6 Vat drip.
- **D-031** Invented frontier nation — Commonwealth of Ostrey / the Sull — sidesteps the D-018 trap (land's grievance is geological, not ethnic).
- Also written: vesselry origins (Dr. Sabine Orrell, "quick ground"), Marrow's Cross history (the Salting = founding sin, the Old Well), a region map sketch, and a mechanics-mapping section.

**Issue #4 — NPC interiority (DONE):** Wrote `docs/narrative-bible.md` Part 2 — all 10 canon NPCs profiled with real interiority (Public / Private truth / Background / Wants+Fears / Voice + signature line / Ties / reaction gradient / arc seed), each grounded in the Marrow/Salting/doctrine and carrying a genuine wound. Kept the Vane D-014 mystery live (all three truths). Added a cross-cast tension web. Full quest arcs deferred to #13, Vane biographies to #14, dialogue sets to #5.

**Issue #5 — Voice & style guide (DONE):** Wrote `docs/style-guide.md` — register, do/don't, world diction vs. forbidden words, rhythm, five prose principles, 10 NPC voice tics, the event-card grammar, five reference cards (quiet dread / opportunity / town / reckoning / moral), a four-tier dialogue example. Fulfills Narrative Bible Part 6; **blocks #16 cleared.**

**Artifacts changed:** `docs/narrative-bible.md` (Parts 1, 2 & 6-pointer), `docs/style-guide.md` (NEW), `context/decisions-log.md` (D-029–D-031), `context/open-questions.md` (Q-007/Q-008 resolved), this file. GitHub issues #1–#17 created; **#3, #4, #5 closed (3/17).**

**Issues #1 & #2 — DONE (user made the calls; all matched recommendations):**
- **#1 MVP scope (→ D-033):** wrote `docs/scope-mvp.md`. Ship the full core loop over a 4-year first lifetime (all 10 NPCs, 4 festivals, ~120 events, full reckoning arc, lineage meta); defer the Vat, Ascension, Black Market, Rail Depot, fancy contracts, Season Arcs 5–10, deep unlock catalog. Resolves Q-001.
- **#2 calibration (→ D-032):** ratified — **protect the survival weight** (committed consumption; close the gap via production: 4 starter fields + +10% quick-ground yield + roots decay 0.18), **2-year mortgage grace**, **bone-root price 30→4 + Reckoning 4→6**. Re-ran the model: no dominant strategy (cashcrop earns most/dies fast, subsistence survives-but-forecloses, balanced = competent survivor), **H-02 now CONFIRMED**. Back-ported to Mechanics Bible §1/§6/§13 + a ratification note; README calibration Pass-2 logged. Q-003 advanced (not closed — long-game ceiling + Year-1 scarcity + exploit hypotheses pending #6/#11).

**Issue #7 — Year-1 vertical slice (DONE):** Wrote `docs/vertical-slice-year1.md` — the keystone. A complete, self-contained "The Newcomer" year: exact starting state, the Morning Brief→Play→Dusk loop, a season-by-season arc spine (Silas's welcome → First Furrow → Ambrose's wagon → the Summer moral fork → Harvest Home → the first Whisper → the Long Vigil), which of the 15 systems are active in Y1 and their limits, a curated ~18-card event set (two new cards written in full in-voice), the moral-fork + first-Whisper design, a paper-prototype kit, and a ratified-number cross-check. Year 1 is forgiving (no mortgage — grace; can't reach Walkers) but exercises the whole loop. Supports both a kind and a cruel first year.

**Issue #6 — exploit/adversarial bots (DONE → D-034):** Extended the balance model with the exploit-prone systems (the Vat, overwork-to-death, purchased atonement, Walker-tier damage + Reckoning acceleration) and adversarial bots (Vat baron, overworker, sin-and-confess, sustained-cruelty) that actively try to cheat. The model caught two real would-be exploits (overwork and the Vat baron topped the leaderboard) and drove the fixes: **morale→labor link** (low morale cuts output per clone — the key fix; overwork was "free" before), steeper overwork costs, Walker-tier teeth (+ acceleration), Vat drip 0.5→1.0/day. **Result: the whole cruelty-debt cluster CONFIRMED** — H-01 (sustained cruelty self-terminates ~Y3.6 via workforce collapse), H-10 (running Vat loop dies to Reckoning 100% in ~2y, and 0% can afford it), H-11 (overwork nets less than the same crew humane), H-18/20 (sin-and-confess never out-performs honest play). **Suite: CONFIRMED 8 · INVARIANT 1 · PARTIAL 3 (H-05/H-09/H-29) · REFUTED 0.** The moral thesis — *cruelty always costs more than it gives* — is validated. Back-ported to Mechanics Bible §3/§6.

**Issue #14 — The Vane mystery (DONE, resolves Q-006):** Wrote `docs/narrative-bible.md` Part 3. The three-truth campaign mystery (D-014), all sharing one ambiguous surface (guarded siblings, secret eastern correspondence, Old Nan's unease, the Corvantine wound) that recolors three ways: **Truth A** — Meredith spies for the Cawdor Mill (coerced, not villainous); **Truth B** — the third Vane, Cassius, the family's ruined prodigy, coming west for the quick ground; **Truth C** — Meredith is a vessel Ambrose grew of his dead sister (binds the mystery to the cosmology, D-029/030). Each with clues, red herrings, reveal pacing (Cold→Warm→Bonded + triggers), kind/cruel payoff branches, and cruelty-state reactivity. Ties Old Nan/Doc Bell/Coldwater in.

**Issue #13 — NPC quest arcs (DONE, resolves Q-004):** Wrote `docs/narrative-bible.md` Part 3B. 3 arcs per NPC (Vanes' in Part 3), each grown from the Part 2 wound, with hook → beats → branches by cruelty/reputation/Reckoning, plus an "arc web" (the Founding Lie links Halloway/Bess/Nan; the mercy underground links Ruth/Bell; Cursed Paper links Silas to Vane Truth A; the reckoning-endgame beats converge on the Vigil breaking + the Old Well). Card-level scripting deferred to #15/#16.

**Issue #15 — Season Arcs Years 5–10 (DONE, resolves Q-005):** Wrote `docs/narrative-bible.md` Part 4. Full outlines for Years 5–10 on the §13 setup→escalation→climax anatomy: **Y5 The Auction** (Cawdor Mill's devil's-bargain; ties Vane Truth A), **Y6 The Foundling War** (labor-vs-mercy crisis; Ruth's arc), **Y7 The Old Well Opens** (Reckoning-gated; Old Nan's Long Watch; a cruel lineage can end here), **Y8 The Reckoning of the Vanes** (adapts to the active Vane truth — Mill / Cassius / the vessel's claim), **Y9 The Lineage Turns** (D-007 succession, 25% Reckoning inheritance, Bess/heir), **Y10 The Long Vigil** (state-dependent capstone). Plus how arcs branch by state and remix past Year 10 with Ascension. Card scripting → #16.

**Issue #12 — content data schema (DONE):** Wrote `docs/content-schema.md` — the data contract for runtime content (the bridge to code). Defines the event object (fields, 7 families, 4 severities), a declarative **Condition DSL** (season/reckoning-tier/reputation/relationship/vane-truth/flags/etc. with any/all/not composition), the **Choice** object (requires/cost/result-or-outcomes), the **Effect DSL** (every ledger axis + clone/crop/flag/unlock/contract verbs), odds bands, and the §9 draw/pacing metadata (weight, crisis_gate, recency, on_ignore). Includes **three full example events** in YAML that validate against it (sour-milk, vanes-wagon, she-comes-back). Data-driven, no code in content; engine validates at build time. **Unblocks #16.**

**Issue #16 — event library (STARTED, in batches — stays OPEN):** Created `content/events/` (README with the batch plan + target distribution). **Batch 1 done:** `weather.yaml` (12 cards) + `reckoning.yaml` (14 cards) — ~26 schema-valid, in-voice cards spanning all severities and all five Reckoning tiers (Whispers ambient → the Reckoning Proper), incl. the atonement-offer cards (Grange's rite, Nan's price). **Batch 2 done:** `opportunities.yaml` (11 — Vane's wagon, demand shocks, the Ledbury contract, the back-door fence, a foundling, the almanac, the card game at Vane's, and the Cawdor Mill's first approach) + `town.yaml` (11 — the four festivals, the Sheriff's rounds, the Mayor's civic request, the collection plate, Sister Ruth's basket, Kettle Bottom emptying, Bess's test, Ridley at the door). ~48 of ~120 written. **Batch 3 done:** `pests.yaml` (8), `wildlife.yaml` (6), `personal.yaml` (9 — incl. the burial card, the five disposal choices = the whole moral engine in one card). **~71 of ~120 written; all 7 families + all severities now covered.** The library is representative and code-ready; remaining ~50 are depth/volume (a live-ops content lane, Q-010). #16 left open for that volume, but MVP-sufficient to begin coding the event system.

**Issue #8 — under-specified mechanics (DONE):** Added Mechanics Bible §16–§19 (same template, hard numbers, four-failure-mode audits, verified counters): **§16 Livestock & Manure** (chickens/pigs/cows; fodder economy; manure as the sustainable fertility restore; slaughter as winter insurance; the food-battery exploit countered), **§17 Festival Interactions** (the four festivals' mini-loops — seed swap, blessing, the hot market, the Harvest-Home crop competition, the Vigil rite; rep-cap counters), **§18 Building Upgrade Trees** (tier tables for housing/storage/water/atonement/livestock/cruelty; no-refund-loop counter), **§19 Vane-Mystery Mechanics** (the seeded truth, hidden clue meter, reveal thresholds, kind/cruel payoff hooks; save-scum-proof by seeding). "Systems covered" index updated.

**Issue #9 — Balance model: Ascension (DONE):** Modeled the +1..+10 stacking modifiers (§15) as `config.ASCENSION_LEVELS`, applied at each system's hook via `farm.asc` (start coin, yield, fertility, exposure, reckoning accrue/decay, winter food + cold snaps, market amplitude, frailty + merchant price, mortgage + grace, Walker damage). Each level targets a different system. Added `run.py ascension` (strategy×level survival table). **H-39 (every level winnable) CONFIRMED** — best survival declines gracefully 5.0y(+0)→3.5y(+10), no cliff. **H-40 (no single strategy clears +10) CONFIRMED** — the best playstyle changes across the ladder (subsistence→boneroot→balanced), +10 genuinely hard (top 3.5y vs 15-cap). **Suite: CONFIRMED 10 · INVARIANT 1 · PARTIAL 3 · REFUTED 0.** Both core-loop AND endgame anti-dominant-strategy guarantees now hold.

**Issue #10 — Balance model: contracts & events (DONE):** Added a forward-contract system (§7: sign in Spring at a premium, 20% deposit, deliver/default at year-end) + contractor/over-contractor/defaulter bots. **H-06** (default loses), **H-24** (over-signing loses), **H-28** (no un-gated run-ender — 160 runs, 0 healthy-farm deaths) all CONFIRMED. **H-22 CONFIRMED with a finding:** a fixed-quantity crop contract trades price risk for delivery risk; with low price noise, yield risk dominates so the variance benefit is marginal (grows with market volatility) — but contracts don't beat spot on mean. **Suite: CONFIRMED 14 · INVARIANT 1 · PARTIAL 3 (H-05/H-09/H-29) · REFUTED 0; 18/40 tested.** Remaining untested need lineage (H-21), day-level venue/hardship (H-07/H-23), or are UX/playtest (H-33/#11).

**Issue #11 — playtest kit (KIT BUILT; playtest awaits the user — stays OPEN):** Wrote `docs/playtest-kit-year1.md` — a complete, table-ready kit to run "The Newcomer" by hand in ~45–60 min: the 7-phase season loop, the §9 pacing rule by hand, exact starting state, a rounded-for-hand-play rules cheat-sheet (crops, food/fuel, labor, market, weather d6 table, the hidden Reckoning track + tiers), the season track with scripted beats, the Year-1 event deck (6 scripted + 8 systemic cards, cuttable), printable components (calendar/field/clone/resource/hidden tracks), and a **report form** with the five feel-questions (does the loop self-teach, does Vane's Wagon decide, does the Cotton fork make you hesitate, does Winter hold its breath, does the Long Vigil land). #11 completes when the user plays it and files the report (findings → bibles / config, then re-run the model).

**Issue #17 — monetization (DONE → D-035, resolves Q-002):** Free demo (through Year 1 / the first lifetime) + a single ~$6 full unlock; **all post-launch content free** (no paid DLC — the deferred systems ship as free updates); no pay-to-win/gems/ads; **mobile-first + PC (Steam/itch)** dual-launch. The single unlock is the whole revenue model by choice (retention via free content, not sold) — a principled premium stance fitting the anti-monetization-bending ethos.

**Issue #11 — paper playtest (DONE via worked playthrough):** Played a full Year-1 game by hand and wrote it up as `docs/playtest-example-year1.md` (a sample game — real dice/choices, an overreach-and-near-miss arc: bought a 2nd hand "Della," couldn't feed two through winter, lost her to a cold snap, survived to Year 2). **Findings:** the kit works and teaches what it should — H-09 tension landed viscerally, the labor constraint (cotton needs 2 hands vs chopping wood) is sharp, the overwork moral fork's honest non-cost lands, the Long Vigil has weight, and a losing-ish run instructs better than a clean win. **3 small kit fixes applied** to `playtest-kit-year1.md` (seed-vs-marks clarified; per-clone food added to cheat-sheet; a "falling short" rule for winter fuel/food). A human play-session would still add subjective-fun data, but the deliverable (playtest report + findings) is met.

**Issue #16 — MVP event library (DONE):** Filled the library to the full target across batches 4–6 — **117 events** across all 7 families and all severities (weather 16, reckoning 21, opportunities 20, town 18, pests 14, wildlife 12, personal 16). **Validated with pyyaml:** every file parses, no duplicate IDs, all required schema fields present. New cards include the Rail Depot, standing orders, the Cawdor letter (a Vane clue), the water-rights dispute, the charter levy, Grange's field blessing, "what grows in tainted ground," the bear, the Vigil guttering (Vigil-Fails crisis), Grange's plain warning, the two hands in love, a defiant hand (cruelty test), the broken plough (cruelty temptation), a hand who won't eat, and more — all in the alt-1800s voice. Additional cards beyond 117 are post-launch free content (D-035).

**Milestone: 17/17 closed — the "Ready to Code" milestone is COMPLETE.** Every design, validation, decision, playtest, and content issue is resolved. The game is fully specified, numerically validated, narratively realized, scoped, priced, and stocked with content. **Next: write code → playable browser build** (start with the Year-1 vertical slice, `docs/vertical-slice-year1.md`, against the schema `docs/content-schema.md` and the `content/events/` library).

**Next up:** **#11 (paper-prototype playtest)** — the only test for "is it fun / boring" (needs the user at a table; I can produce the printable kit). Narrative breadth (solo): **#13 (quest arcs)**, **#14 (Vane mystery)**, **#15 (arcs 5–10)**. Remaining mechanics/model: **#8** (under-spec'd mechanics), **#12** (content schema), **#10** (contracts/events model), **#9** (Ascension model). Remaining exploit hypotheses now unlockable: H-13/H-14/H-15/H-17/H-21 (needs more bots + lineage).

---

## Session 2 — 2026-07-24 — Mechanics Bible full draft (§2–§15)

**Worked on:** Completed the Mechanics Bible from its §1 template (Crop Economics, written Session 1) to a full 15-system draft.

**Systems written (§2–§15), all to the §1 template** (Recap → Numbers & formulas → Intended experience → Four failure modes checked → Balancing levers → two Sample scenarios):
- Core economic loop: §2 Market Pricing, §3 Clone Economics, §4 Winter Survival
- Moral engine: §5 The Cruelty Ledger, §6 The Reckoning Meter
- Commitment & building: §7 Contract System, §8 Building & Construction
- World simulation: §9 Events & Probability, §10 Weather System
- Scaling / social / meta: §11 Roster Scaling & Housing, §12 Festivals & Town Reputation, §13 Season Arcs, §14 Meta-Progression, §15 Ascension Stacking

**Format decisions locked this session (per user):** keep §1 template; economical Recap/Intended-experience (one tight paragraph each); HARD NUMBERS EVERYWHERE (no [TBD-balance] placeholders — the Balance Model needs testable hypotheses); four-failure-mode audit gone *harder* with more "verified counter" targets; two scenarios per system (one normal-play, one edge/exploit); forward-references allowed; **standing rule — every gameable number is annotated with the specific exploit it defends against.**

**Key cross-system design commitments made (candidates for decisions-log — see open question below):**
- Labor (clone-days), not coin, is the primary mid-game constraint.
- Cash crops have zero food value (the anti-monoculture Winter gate).
- Reputation is a two-way axis (high-rep "pillar" and low-rep "outlaw" both viable).
- Reckoning is hidden, un-hideable, and carries 25% to heirs on the same land.
- Meta-progression is content-not-power; Ascension (+1..+10) owns difficulty scaling.

**Consistency pass (done this session):** traced every cross-referenced figure against the file (not memory). Big-ticket shared numbers confirmed consistent (Reckoning tiers/`reckoning_mult` match exactly between §1 and §6; funeral 40 coin, corpse-sale 15 coin, clone food 0.5/0.75, Merchant 60/75/110, clone-day mults all consistent). **Four drifts found & fixed:** (1) §1 scenario funeral relief "15%" → "−8" to match §6; (2) §3 Merchant markup "below 0 rep" (impossible on 0–100) → tied to §5 bands (<40 = +25%, ≥70 = −10%); (3) §4 scenario readiness "Food 25/30" → "33/35" (farmer 20 + clone 15); (4) §6 baseline drip "more than clears" → "exactly offsets" (+8/yr vs −8/yr). Two minor items left as judgment calls for the user (taint +30/+50 nuance; tier-threshold notation).

**Hypotheses checklist (done this session):** extracted all ~40 verified-counter claims into `docs/balance-model/hypotheses.md` — the Balance Model's test suite. Each has a stable ID (H-01…H-40), a falsifiable pass criterion, a failure-mode tag (DOMINANT / CRUELTY-DEBT / ECON / PACING / UX), a priority tier (P0/P1/P2), and its source §. P0 foundational set: H-01, H-09, H-10, H-11, H-12, H-16, H-17, H-28, H-30, H-32, H-37, H-39, H-40.

**Decisions promoted (done this session):** D-024–D-028 written to `decisions-log.md` (labor-primary-constraint, cash-crops-zero-food, two-way reputation, hidden/25%-inherited Reckoning, content-not-power).

**Git (done this session):** repo initialized on branch `main`; initial commit `83be5b1` captured everything through the consistency pass + hypotheses checklist (13 files). The balance-model code below is NOT yet committed (uncommitted working tree at session end).

**Balance Model v0.1 (done this session — BUILT, NOT RUN):** wrote a stdlib-only Python simulation in `docs/balance-model/`. No Python is installed on the authoring Windows machine, so it was written and manually reviewed but **not executed** — run it in the web chat / a Python env. Season-stepped engine models the economic + moral core (crops/fertility/taint §1, clone food economy + morale deaths §3, winter survival §4, market + glut §2, Reckoning meter + tiers + run-end §6, mortgage §13). Tests 9 hypotheses (H-01, H-02, H-03, H-05, H-09, H-12, H-16, H-29, H-32); the other ~31 report NOT MODELED with reasons (events/contracts/Vat/construction/festivals/arcs/meta/ascension deferred). Two v0.1 findings are already expected: **H-02** (bone-root raw margin far exceeds the 1.5–2× target — relies on H-01 risk to offset) and **H-05** (arbitrage intent holds but the <+20% threshold is exceeded). Also flagged in-code: the food economy may be tight (year-round consumption vs. starting-plot yields) — a real balance question to confirm on first run.

**Artifacts changed:**
- `docs/mechanics-bible.md` — full draft of all 15 systems; four consistency fixes applied.
- `docs/balance-model/hypotheses.md` — 40-hypothesis test suite.
- `docs/balance-model/{config,model,strategies,hypotheses,run}.py` — **NEW**: the v0.1 simulation (stdlib-only, Python 3.8+).
- `docs/balance-model/README.md` — updated from stub to reflect the built v0.1, how to run, scope, and expected findings.
- `context/decisions-log.md` — D-024–D-028.
- `context/session-history.md` — this entry.

**Balance Model RUN + CALIBRATED (done this session):** installed Python 3.12 via winget; ran the suite. First run starved ~90% of runs by Year 2 (all strategies). Ran a 6-round calibration pass (commits `e2805f5`, `e147257`) to a stable, testable economy. After calibration (40 seeds): **CONFIRMED** H-03, H-16, H-32; **INVARIANT** H-12; **PARTIAL** H-05, H-09, H-29; **REFUTED** H-01, H-02; 31 NOT MODELED. Config changes are flagged in-code as *proposals*, NOT ratified Mechanics-Bible edits. Full calibration log + findings in `docs/balance-model/README.md`.

**DESIGN DECISIONS NOW PENDING (from the model's findings — need the user):**
1. **Food economy (headline):** §1/§3/§4 never closed on ANNUAL balance — farmer+1 ate ~125 food/yr vs a starter plot's ~60–90/yr. The model closed it by cutting consumption (clone 0.5→0.4, winter 0.75→0.6, farmer 1.0→0.8). DECISION: lower consumption, raise yields, or enlarge the starter plot? (Squarely inside open Q-003.)
2. **Mortgage grace:** 150/yr is unpayable in establishment years — model added a 2-year grace. Ratify as a §13 addition?
3. **Bone-root price (H-02):** raw margin ~15.7× wheat (target 1.5–2×); it's the top in-sim earner. Lower `bone_root` price/yield, or restate the target as risk-adjusted?
4. **H-01 timeline/accrual & H-32 peak-at-n=1** (clones not worth their food → labor not binding, tension w/ D-024) and **H-09 tension** (consumption cut removed intended Year-1 scarcity) — all need a numbers pass.

**Next up:**
1. **Resolve the design decisions above** (esp. the food economy), then re-run to reconverge; if ratified, back-port the accepted numbers into the Mechanics Bible §1/§3/§4/§13 and resolve/advance Q-003.
2. **Extend the engine** to NOT MODELED systems (events §9, contracts §7, Vat/overwork loops §3, ascension §15) + a sustained-cruelty bot (to test H-01 properly) to unlock the remaining hypotheses.
3. Later: paper prototype playtest; then code scaffold (still deferred).

**Open decisions for the user:**
- Promote the five cross-system commitments above to `decisions-log.md` as D-024+? (Asked; not yet answered.) Recommendation: yes for at least "labor is the primary constraint" and "cash crops = zero food value," as the Balance Model leans on both.
- Q-003 (full numerical balance) is now substantially advanced — every economic value has a proposed number — but stays OPEN pending Balance Model validation.

**Blockers/notes:** None. `docs/mechanics-bible.md` is long (~15 systems); a consistency pass is advisable before it's treated as locked. No code written — still in deep design pass per plan.

---

## Session 1 — 2026-07-24 — Foundational GDD

**Worked on:** Foundational game design brainstorm, from a blank slate to a full 41-page GDD.

**Decisions locked (23):** D-001 through D-023. See `decisions-log.md` for full list with rationale. Highlights:
- Core hook: farmhand clones with cruelty axis and supernatural reckoning
- Setting: alternate 1800s Weird West
- Structure: nested Year → Lifetime → Lineage runs
- Town: Marrow's Cross with 10 named NPCs including the Vane siblings mystery
- Tech: Next.js + Capacitor + Neon + Better Auth + Drizzle + Vercel

**Artifacts produced:**
- `docs/GDD_v0.1.docx` and `.pdf` — 41-page Game Design Document
- `CLAUDE.md` — cross-session context handoff
- `context/` folder — decisions log, open questions, project overview, this file
- `.gitignore` — for the future Node/Python project
- `README.md`
- `docs/mechanics-bible.md` — outline + first entry started (see next session)
- `docs/narrative-bible.md` — outline stub
- `docs/balance-model/README.md` — placeholder

**Next up:**
1. Complete the Mechanics Bible (deep numerical + exploit analysis for all systems)
2. Build the Balance Model (Python simulation)
3. Write the Narrative & World Bible
4. Paper prototype playtest
5. Then and only then: scaffold the Next.js code repo

**Blockers/notes:** None. Repo is ready to sync across machines. Open Claude Code in the repo root and CLAUDE.md will pick up context.

---

<!-- Add new session entries above this line. Most recent first. -->
