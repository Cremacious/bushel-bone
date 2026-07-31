# Bushel & Bone — Claude Context File

**This file is read by Claude at the start of every session in this repo.** It carries all project context across sessions, machines, and time so any Claude Code session can pick up where the last left off.

If you (Claude) are reading this at the start of a new session: welcome back. Read this file end-to-end before touching anything. Then check `context/session-history.md` for what the last session accomplished and `context/open-questions.md` for what's next.

---

## 1. What This Project Is

**Bushel & Bone** is a mobile-first, dark alt-1800s survival and management game with a Weird West undertow. The player runs a rooted homestead worked by farmhand clones grown by strange 1800s pseudo-science. The player can treat the clones kindly or cruelly — cruelty raises yields but calls down a supernatural reckoning that the land itself remembers.

**Elevator pitch:** *Stardew Valley × Oregon Trail × ethical horror.*

**Emotional core:** grit and survival. "I survived another year."

**Primary reference:** `docs/GDD_v0.1.pdf` (41 pages). This is the source of truth for the game's design. Everything in this file is a compressed summary — when in doubt, defer to the GDD.

---

## 2. Current Status (updated per session)

- ✅ **Foundational Game Design Document (v0.1)** — complete. Delivered as `docs/GDD_v0.1.docx` and `.pdf`.
- ⏳ **Mechanics Bible** — in progress. See `docs/mechanics-bible.md`.
- ⏳ **Narrative & World Bible** — not started. Stub at `docs/narrative-bible.md`.
- ⏳ **Balance Model** — not started. Stub at `docs/balance-model/README.md`.
- ✅ **Paper Prototype Playtest** — kit + worked playthrough done (`docs/playtest-kit-year1.md`, `docs/playtest-example-year1.md`).
- ✅ **Playable Year-1 browser prototype** — `prototype/year1.html`. Single-file, dependency-free; plays the full Year-1 loop ("The Newcomer") with all six scripted beats, real numbers, hidden-Reckoning-as-omen, seeded PRNG. Validated headlessly (winnable via the cautious line, punishing via the greedy line). Also a private claude.ai Artifact.
- ✅ **Foreman + farmhand roster + Ask Reuben (D-036).** Built into `prototype/year1.html` via subagent-driven development with a Vitest + jsdom harness (24 tests), reviewed and merged to `main`. Reuben is now the foreman: the collective's voice, the tutor (Ask Reuben), and the first-only Reckoning alarm. Every hand is first-class with per-hand assignment and promotion on death. Design spec: `docs/superpowers/specs/2026-07-25-reuben-foreman-and-imagery-design.md`.
- ✅ **First-run tutorial (#20).** Built into `prototype/year1.html` (subagent-driven, 35 tests, reviewed and merged). Reuben is the guide: an opt-in first-run prompt, and in guided mode tips lean in from the Ask Reuben bar (ringing the control they explain) on first encounter of each mechanic. Seven curated tips; stop/replay from the Ask Reuben panel; `localStorage` persistence. Design: `docs/superpowers/specs/2026-07-25-tutorial-design.md`.
- ✅ **Imagery layer (#21 to #23).** Built into `prototype/year1.html` (subagent-driven, 40 tests, reviewed and merged). Every scene shows a location "plate" (illustration placeholder in an engraved border) with an always-visible place-name caption, and a speaker portrait with a nameplate when a character talks. The bracketed stage-directions are the plate briefs; a `SETTINGS`/`NPCS` manifest drives it; real art drops into the same slots later. Design: imagery spec section 7.
- ✅ **Dash-punctuation scrub (#26).** Every em dash and hyphen-as-pause removed from `prototype/year1.html`, all seven `content/events/*.yaml` files, and `docs/style-guide.md`'s own prose and reference cards (155 instances, rewritten sentence by sentence via nine parallel subagents, not a blind find-and-replace). Hyphenated compound words left untouched. All YAML re-validated; the HTML's embedded script re-verified to parse. Not yet committed.
- ✅ **UI clarity pass (#19).** Built into `prototype/year1.html`: tap-to-reveal ledger help, a contextual masthead help toggle, and dual-labeled/tagged choice buttons across every scripted beat and systemic event, plus disabled-reason text on unaffordable choices and tap-to-reveal explanations on disabled planting chips (touch-friendly, not hover-only). Design: `docs/superpowers/specs/2026-07-25-ui-clarity-pass-design.md`. Plan: `docs/superpowers/plans/2026-07-26-ui-clarity-pass.md`.
- ✅ **The founder's story (D-038).** The player's personal on-ramp and the spine of a lineage, designed collaboratively with Chris and written to `docs/narrative-bible.md` Part 0. You inherit the homestead of an uncle you never met, **Malachi**, who vanished into the Old Well after giving his life to renew the Marrow's failing seal. A fixed mystery uncovered through his journals, Old Nan, Sheriff Coldwater, and Reuben (his old hand); a deferral thesis (you never beat the land, you pass the watch on); an earned, rare reunion for the kind path. Implementation tracked in a new GitHub issue (prototype text, the journals feature, the Old Well payoff, the reunion gate).
- ✅ **Onboarding clarity pass, part 2 (#27 to #42, D-039).** A follow-up playtest of the pass above surfaced a further round of confusion points, tracked as 16 GitHub issues and worked through one at a time with Chris (implement, report what changed, wait for explicit approval, close on a yes). Closed this session: #27 to #31, #33, #34, #39, #41. Locked a standing principle (D-039): onboarding hand-holding fades out gradually across a run, never abruptly, and any hidden mechanical effect that could read as a bug gets a plain-language explanation the moment it first matters. Still open: #32, #35 to #38, #40, #42.
- ✅ **New Game opening: the inheritance letter (#44).** Built into `prototype/year1.html` (subagent-free, 9 new tests, full suite 90 green). Every New Game now runs a **lineage-naming step** (the player's family surname, stored as `S.lineageName` and persisted in the save) and a **two-page letter** read at the player's own pace: a black screen, paged Previous/Next, page 1 the Sallows Charter Company letter (black ink on an aged-paper leaf), page 2 plain cream-on-dark narration, then Begin hands into the first Morning Brief. Copy is the locked text from the issue; `{LINEAGE NAME}` fills through both pages. Also folded in the **Day-1 inheritance reframe** (the first task of #43): the opening Morning Brief is now "Your uncle's ground" (Malachi's heir, not a generic charter) and Silas hands over the inherited mortgage, still transactional. And a full **Sull → Sallows** rename across the prototype and all seven `content/events/*.yaml` files (the docs were renamed earlier; the game text hadn't been).
- ✅ **Names config as source of truth (#45).** `content/names.yaml` now holds every NPC and location name (`places`, shared-surname `terms`, `characters`, `locations`); editing one line renames a placeholder everywhere. A generator (`prototype/gen-names.mjs`, `npm run gen:names`) injects it into `year1.html` between markers as a `NAMES` object (the single-file prototype can't fetch at runtime), and a render-time resolver `tok()` replaces `{{npc.id}}` / `{{loc.id}}` / `{{place.id}}` / `{{term.id}}` / `{{lineage}}` tokens (multi-pass, so composed full names resolve) at every render sink. All prose in `year1.html` was tokenized; `NPCS`/`SETTINGS` are aliases of the generated config, not a second copy. 28 files / 97 tests green (new `tests/names-config.test.mjs` incl. a no-leak playthrough scan, a no-hardcoded-literal guard, and a generator `--check` sync test). The ~120 name literals in `content/events/*.yaml` are deferred to #46 (dialogue extraction), which shares the token scheme.
- ✅ **Dialogue extraction + .docx round-trip (#46).** Every line of the game's writing now lives in one screenplay, `content/script.yaml` (eyebrow/title/dir/body + choices, tokenized with the #45 names), read by the game via `L("<id>")` after `prototype/gen-script.mjs` (`npm run gen:script`) injects a `SCRIPT` map into `year1.html`. A Word round-trip lets Chris tighten the whole script by hand: `npm run script:docx` exports a readable `docs/script.docx` (each line under a stable `[scene.field]` label, names filled in), and `npm run script:import` matches an edited docx back by those labels and reports exactly what changed (the apply is Claude-mediated, preserving `{{tokens}}` and inline markup). Mechanical action screens (planting, assignment, market, dusk, provisioning) stay in code. 30 files / 106 tests green (`tests/script-dialogue.test.mjs`, `tests/script-docx.test.mjs`). Workflow: `docs/script-workflow.md`. Adds `yaml`/`docx`/`mammoth` devdeps. `content/events/*.yaml` dialogue deferred to the production port.
- ⏳ **Founder story (#43) — Year-1 prototype parts done.** Built **Malachi's journals** (the four canon 1864 entries, narrative-bible §0.11, one unlocking per season) behind a masthead book control with an unread dot and a guided nudge; and **Reuben's "knew Malachi" thread** as a *"Did you know my uncle?"* topic on the Ask Reuben panel. Both live in `content/script.yaml` (so they flow through the #45 tokens and the #46 .docx round-trip). 31 files / 110 tests green (`tests/journals.test.mjs`). The Day-1 inheritance framing was done in the #44/#43 reframe. **Still open (production-port scope, canon-written in §0.12–§0.14):** the Old Well beats (Years 7/10), the earned-reunion ending, the Codex truth-uncovered field, and the first-vs-later-lineage succession framing.
- ✅ **Gameplay depth design + prototype-rebuild direction (D-042 to D-047).** A brainstorming session addressing "interesting but not fun." Locked: a **season action-economy** (6 discretionary action-days over the 20-day calendar; always over-subscribed), **Marrow's Cross exploration** (a menu of NPC/location scenes via the TOWN tab, per-NPC standing + a rotating deck, one visit per day), an **economic-squeeze difficulty curve** (flat budget, one telegraphed pressure per year, Y1 easy → Y4 the vise), and a reframe to a **legacy/dynasty survival sim** with a **legacy-ledger score** (endless; runs end only on land-loss/line-death; kind legacy = a gift to your heir, cruelty = a curse). Design spec: `docs/superpowers/specs/2026-07-28-gameplay-depth-design.md`. The next code work is a **rebuild of the prototype** against the **Claude Design "V0.3"** language in `design/version-1/` (two form factors; the six-tab phone bar Home/Fields/Hands/Town/Ledger/Almanac realizes the locked portrait-primary decision). Reconciled: the opening letter becomes a hybrid (canon ≈1884 facts + the design's tighter lines); the "Day X of 20" counter sits over the 6-action economy. No code yet — implementation plan next.
- ✅ **Minute-to-minute weekly loop design (D-048).** A follow-up brainstorm fleshed out the moment-to-moment (the Mechanics Bible had 19 systems but no *loop*). Locked (spec §10): **two interlocking economies** (assign the crew's clone-days + spend your own week), a **weekly beat** (~5/season) of read → assign → act → resolve with event interrupts, **farming+survival crew tasks** (tend/harvest/chop/break/forage-hunt/preserve/rest), **hands as mortal individuals** (one staged condition track Steady→Worn→Failing→Lost; death with burial ritual and grief; names, traits, cruelty witnessed and logged), a **three-tier crop gamble** (staples/cash/Weird), the **four ledger resources made alive** (spoilage + winter fuel drain + per-hand cold/sickness), **forecast+surprise events with lasting compounding consequences**, and a **reckoning that bites** (taint, hands seeing things, walkers, the Proper can take the land; atonable). The feel: never enough hands or days, every choice a real cost, people you can lose, a debt in the ground — Oregon Trail's attrition worn over a farm and a conscience.
- ✅ **Prototype rebuild — Plan 1 (foundation) built & merged.** Wrote a staged implementation plan (`docs/superpowers/plans/2026-07-28-prototype-rebuild-foundation.md`, Plans 1→5) and executed **Plan 1 subagent-driven** (fresh implementer + spec + code-quality review per unit). Result on `main`: **`prototype2/`** — a modular, frameworkless vanilla-JS rebuild against the Claude Design V0.3, with a pure `(state, action) => state` core (state model + reducer + week/season/year clock), a render layer drawing the V0.3 shell (masthead, brass ledger, six-tab nav Home/Fields/Hands/Town/Ledger/Almanac, night/day, phone + desktop), and the `content/*.yaml` pipeline ported to ES-module data (reuses #45/#46). **22 tests green (8 files)**; the old `prototype/year1.html` is untouched. Reviews caught real bugs (a duplicate `seed` key and a `:root` theme-scope issue in the plan; added a generator drift-guard, a PRNG determinism test, and `el()` boolean-attr hardening). **Next: Plan 2 — the weekly loop & the hands** (read → assign crew → your action → resolve; hand condition tracks; crops; the four live resources), then Plans 3-5 (town, the squeeze/years, polish/Almanac).
- ✅ **Prototype rebuild — Plan 2 (the weekly loop & the hands) built & merged.** Executed **Plan 2 subagent-driven** (`docs/superpowers/plans/2026-07-28-prototype-rebuild-plan2-weekly-loop.md`), five units each spec- + code-quality-reviewed with fix loops, then browser-verified end to end; merged to `main` (`f04dc93`). **`prototype2/` now plays one full Year 1 (Spring → Winter):** plant the four fields, assign each hand a weekly task and spend your own week, watch crops grow and the larder drain, keep the crew fed and warm, lose a hand to a bad winter if you fail. Pure core: crops + first-pass balance (Q-003-owned), the season/week phase machine, the hand strain/condition track (Steady→Worn→Failing→Lost), and the reducer's `resolveWeek` (labor→growth→eating→cold→strain→loss). Render: a phase router + one screen per phase (Morning Brief, Planting, the two-economy Weekly Plan, Dusk day-book, Year-1 verdict) + read-only Fields/Hands/Ledger/Almanac tabs, styled in `screens.css`. A headless full-year playthrough proves it never wedges and a cautious line survives — the pressure lands on the **hand's condition**, not the resources. Reviews caught + fixed a real gap: a hand was silently tired for empty motion (now `resolveWeek` only charges strain for real work, and the Weekly Plan disables a dead task with a plain reason, per D-039). **19 files / 74 tests green.** Deferred follow-ups: Dusk CTA "Turn the page" vs the design's "Turn the year" (one-line copy reconcile); per-field task targeting (Plan-3 refinement); seed doesn't vary a run until events land (Plan 3). **Next: Plan 3 — depth & drama** (events, the reckoning biting, death's burial ritual + traits, forage/hunt/preserve, spoilage), then Plans 4-6 (town, the squeeze/years, polish/Almanac).
- ⏳ **Prototype v0.2 phase (milestone #2)** — UI clarity, the dash scrub, and the first onboarding clarity pass are done; remaining from this pass: #32, #35 to #38, #40, #42, plus #24 (art direction doc) and a Vercel proof-of-concept for testers.
- ⏳ **Production code scaffold (Next.js 15)** — deferred until the prototype design is validated with testers. Port the prototype's pure logic into `(state, action) => newState` modules loading `content/events/*.yaml` via `docs/content-schema.md`.

See `context/session-history.md` for full session-by-session log.

---

## 3. Locked Design Decisions

These are settled. Do not reopen without the user's explicit ask.

| Area | Decision |
|---|---|
| Genre | Turn-based survival management with roguelite meta-progression |
| Setting | Alternate 1800s, Weird West undertow, dark tone, light story |
| Core hook | Farmhand clones grown by 1800s pseudo-science are the labor force |
| Moral axis | Cruelty vs. kindness. Cruelty raises yields; supernatural reckoning collects the debt |
| Spatial frame | Rooted homestead + nearby town (Marrow's Cross). No travel as gameplay |
| Run architecture | Nested — Year → Farmer's Lifetime → Family Lineage on Land |
| Run-end conditions | Line-death OR land-loss (foreclosed, cursed past use, burned) |
| Time model | Turn-based days. Tap-to-advance. |
| Calendar | 20 days per season, 80 days per year |
| Session length target | Snackable (2–4 min) to standard (10–15 min); flexible up to 1hr+ |
| Day structure | Three-beat: Morning Brief → Play → Dusk Report |
| Homestead view | 2D static diorama, not a walkable tile map |
| Assignment | Per-clone at dawn; auto-templates for scaling |
| Field abstraction | Field-level, not tile-level |
| Crop families | Grains, Roots, Cash, Weird (moon barley, bone-root, whisper wheat) |
| Clone sources | Three: Dr. Vane's wagon (Merchant), The Vat, Foundlings |
| Cruelty ledger | Four axes: Reckoning (hidden), Morale, Reputation, Ghost Roll (hidden) |
| Market model | Four price layers: base, seasonal wave, demand shocks, micro-noise |
| Market venues | Local, Regional Buyers, Rail Depot (mid-game), Black Market |
| Town | Marrow's Cross, 10 named NPCs, 4 annual festivals |
| Story shape | One Season Arc per year + NPC threads |
| Meta-currency | Vigils |
| Meta-progression style | Content unlocks, not power. Codex persists across all runs. |
| Ascension | +1 through +10 difficulty modifiers |
| Event families | Seven — weather, pests, wildlife, opportunities, town, personal, reckoning |
| Event resolution | Universal choice-card grammar |
| Reckoning tiers | Whispers → Warnings → Walkers → Long Vigil Fails → The Reckoning Proper |
| Cultural care | No Native American cultures depicted, real or thinly-veiled |
| Art direction | "The Illustrated Almanac" — cross-hatched ink, aged paper, seasonal accent colors |
| UI | Portrait-primary, 6-tab bottom bar, full accessibility from day one |
| Onboarding pacing | Hand-holding starts thick for a first-time player and fades out gradually, never abruptly; any hidden mechanic that could confuse a new player gets a plain-language explanation the first time it matters (D-039) |
| Tech stack | Next.js 15 + React + Tailwind + Zustand + Immer |
| Mobile packaging | Capacitor for iOS + Android |
| Hosting | Vercel |
| Database | Neon (serverless Postgres) |
| Auth | Better Auth (self-hosted, TypeScript-first) |
| ORM | Drizzle |
| Content pipeline | YAML/JSON event files loaded at runtime |
| No game engine | HTML/CSS/JS + Canvas overlay for weather. No Unity, no Godot. |

Full rationale for each decision is in `context/decisions-log.md`.

---

## 4. NPC Roster (canon)

Marrow's Cross has 10 named NPCs. Do not invent new ones without the user's approval.

- **Mayor Cyrus Halloway** — politics, civic contracts
- **Preacher Elias Grange** — church, moral weathervane
- **Doc Bell** — medicine, rumors
- **Meredith Vane** — saloonkeeper, information hub, sister of Ambrose
- **Silas Ridley** — banker, mortgages
- **Bess Halloway** — mayor's daughter, potential spouse/heir source
- **Old Nan** — folk-magic woman, reckoning intel
- **Sheriff Nathaniel Coldwater** — law, cruelty investigations
- **Dr. Ambrose Vane** — clone merchant, brother of Meredith
- **Sister Ruth Grange** — preacher's wife, charity work

The **Vane siblings mystery** has three possible truths, randomized per campaign. See GDD §12.5.

---

## 5. Design Concerns To Always Keep In Mind

The user has explicitly flagged these as risks. Any mechanic proposal must consider:

1. **Difficulty miscalibration** — too easy, too hard, or peaks too early.
2. **Dominant strategy convergence** — one right way to play; replay dies.
3. **Cheese and exploits** — save-scumming, contract defaults, cruelty loopholes, min-max abuse.
4. **Emotional flatness in narrative** — NPCs feel like wallpaper, mysteries land in a shrug.

Every mechanic that goes into the Mechanics Bible must be audited against these four failure modes. Every NPC that goes into the Narrative Bible must have real interiority.

---

## 6. Working Conventions

**When designing:**
- Propose concrete numbers, not "some" or "a lot." "Wheat costs 4 coin per seed" beats "wheat seed is cheap."
- Always name the four failure modes when introducing a mechanic and how it defends against each.
- Prefer field-level abstractions over tile-level. Prefer card-based interactions over screen-based ones.
- Every system should be describable to a non-designer in three sentences.

**When writing prose (for GDD, dialogue, event cards):**
- Alt-1800s voice. No modern slang. No memes. No fourth-wall gags.
- Restraint over spectacle. A crow at the window beats an army of ghosts.
- Adult but not gratuitous.

**When writing code (later):**
- TypeScript-first everywhere except the balance model (which is Python).
- Game state is one plain-JS object, serializable to JSON.
- Game logic modules are pure `(state, action) => newState`. No React in the logic layer.
- All randomness uses a seeded PRNG. Store the seed in save state.
- Event content lives in YAML/JSON files loaded at runtime. Never hard-code events.
- Tests: Vitest for logic, Playwright for critical E2E paths only.

**When updating docs:**
- Add a session entry to `context/session-history.md` for every session that changes anything.
- Add locked decisions to `context/decisions-log.md` with rationale.
- Move resolved items from `context/open-questions.md` to `context/decisions-log.md`.
- Bump the GDD version number (v0.1 → v0.2 → v1.0) when you regenerate it.

---

## 7. Where Things Live

```
bushel-and-bone/
├── CLAUDE.md                    ← you are here — read first
├── README.md                    ← human-facing intro
├── .gitignore
├── docs/
│   ├── GDD_v0.1.docx           ← the source-of-truth design doc
│   ├── GDD_v0.1.pdf
│   ├── mechanics-bible.md      ← in-progress deep mechanics
│   ├── narrative-bible.md      ← stub
│   └── balance-model/          ← Python simulation (empty)
├── context/
│   ├── project-overview.md     ← quick summary
│   ├── decisions-log.md        ← every locked decision + rationale
│   ├── open-questions.md       ← still to be decided
│   └── session-history.md      ← per-session log
└── src/                        ← Next.js code (empty for now)
```

---

## 8. First Actions For A New Session

1. Read this file (you just did).
2. Read `context/session-history.md` to see the last session's outcome.
3. Read `context/open-questions.md` to see what's next.
4. If working on the Mechanics Bible: read `docs/mechanics-bible.md` end-to-end before adding new systems (consistency matters).
5. If working on the Narrative Bible: read `docs/narrative-bible.md` and the GDD's Marrow's Cross section.
6. Ask the user what they want to work on. Don't assume.

---

*Last updated: end of Session 19. **v0.4 Phase 4 complete and merged to main**, across five subagent-driven plans answering a ~22-note playtest: **4A** the mechanical vocabulary (human "Tiredness"/"Dread" labels + correct red-up valence, fixing the sick-hand choice that showed green; the silent-Dread tip; visibly-landing rest recovery), **4B** season-pool clarity + confirm-to-spend + the guaranteed **day-1 opening beat** (D-055, the "it's already day 4" fix: seasons no longer auto-run past day 1), **4C** the highlight line-break bug root-caused to a CSS class collision and fixed, plus an amber status strip, crop grow-times, and a Dusk crew snapshot, **4D** the **NPC/job variety grammar** (a seeded haggle roll, jobs open a tradeoff card, all 16 talks reworked across payload/question/haggle/moral + 8 new cards + seeded rotation + question-tag suppression), and **4E** the **scripted clone reveal** (masked wagon with no spoiler, a Sow-fired Reuben nudge, the `vane_reveal` first-moral-framing scene written to narrative-bible canon, and 4 new event cards). 289 tests / 44 files green; the whole reveal browser-verified end to end. Minor deferred: the town-screen pool label still uses old wording, the town job list shows a flat coin preview, and HIRE is render-gated (the sim resolves reveal-then-hire). Full detail in `context/session-history.md` Session 19. Prior detail, end of Session 15: Executed **Plan 2 of the prototype rebuild (the weekly loop & the hands) subagent-driven, merged to main** (`f04dc93`): `prototype2/` plays one full Year 1 (Spring → Winter) in the Claude Design V0.3 — plant four fields, assign each hand a weekly task and spend your own week, watch crops grow and the larder drain, keep the crew fed and warm, lose a hand to a bad winter if you fail. Pure core (crops + first-pass balance, the season/week phase machine, the hand strain/condition track, `resolveWeek`), a phase router + one screen per phase (Morning Brief, Planting, the two-economy Weekly Plan, Dusk day-book, Year-1 verdict) + read-only Fields/Hands/Ledger/Almanac tabs in `screens.css`, and a headless full-year playthrough proving it never wedges (pressure lands on the hand's condition, not resources). Five units, each spec- + code-quality-reviewed with fix loops, then browser-verified; reviews caught + fixed a real gap (a hand silently tired for empty motion — now strain is only charged for real work and dead tasks are disabled with a plain reason, per D-039). 19 files / 74 tests green; `year1.html` untouched. Deferred: Dusk CTA wording ("Turn the page" vs the design's "Turn the year"), per-field targeting, and run-varying seeds (all Plan 3+). **Next: Plan 3 (depth & drama — events, the reckoning biting, death's burial ritual + traits, forage/hunt/preserve, spoilage), then Plans 4-6.** Prior (Session 14): a gameplay-design brainstorm addressing "interesting but not fun" produced a full spec (`docs/superpowers/specs/2026-07-28-gameplay-depth-design.md`) and six locked decisions (D-042 to D-047): a season action-economy (6 action-days over the 20-day calendar, always over-subscribed), Marrow's Cross exploration (TOWN-tab menu of scenes, per-NPC standing + rotating deck), an economic-squeeze difficulty curve (flat budget, one telegraphed pressure per year), and a reframe to a legacy/dynasty survival sim with a legacy-ledger score. The next code work is a full prototype REBUILD against the Claude Design "V0.3" language in `design/version-1/` (two form factors; six-tab phone bar realizing the portrait-primary lock); the opening letter reconciles to a hybrid (canon ≈1884 facts + the design's tighter lines) and the "Day X of 20" counter sits over the 6-action economy. A follow-up brainstorm then fleshed out the minute-to-minute weekly loop (D-048, spec §10): two interlocking economies (assign the crew + spend your own week), ~5 weekly beats + event interrupts, farming+survival crew tasks, hands as mortal individuals (staged condition, burial ritual, cruelty witnessed and logged), a three-tier crop gamble incl. the Weird crops, the four ledger resources made alive (spoilage, winter fuel drain, per-hand cold/sickness), forecast+surprise events with lasting compounding consequences, and a reckoning that bites (taint, walkers, the land can be taken). The Mechanics Bible already had 19 systems; the loop that ties them into fun was the gap. Then wrote a staged implementation plan and **executed Plan 1 (the foundation) subagent-driven, now merged to main**: `prototype2/` — a modular vanilla-JS rebuild against the Claude Design V0.3 with a pure core, the V0.3 shell (six-tab nav, night/day, phone+desktop), and the #45/#46 content pipeline ported; 22 tests green, `year1.html` untouched. **Next: Plan 2 (the weekly loop & the hands), then Plans 3-5.** Earlier this day: #44 opening letter (S10), #45 names config (S11), #46 dialogue extraction + .docx round-trip (S12), #43 journals + Reuben thread (S13).*

*Prior (end of Session 13): Built the Year-1 prototype parts of the founder story (#43): Malachi's journals (the four canon 1864 entries, one unlocking per season, behind a masthead book control with an unread dot and a guided nudge) and Reuben's "knew Malachi" thread (a "Did you know my uncle?" topic on Ask Reuben) — both in `content/script.yaml`, so they flow through the #45 name tokens and the #46 .docx round-trip. 31 files / 110 tests green (`tests/journals.test.mjs`). #43 left open: the Old Well beats (Years 7/10), the earned-reunion ending, the Codex truth-uncovered field, and the succession framing are production-port scope (canon-written). Next: those, when the port exists, and the milestone-2 items (#24, #48, a Vercel proof-of-concept). Earlier this day: #44 opening letter + Day-1 reframe (Session 10), #45 names config (Session 11), #46 dialogue extraction + .docx round-trip (Session 12).*

*Prior (end of Session 12): Built the dialogue extraction + .docx round-trip (#46): every line of the game's writing now lives in one screenplay, `content/script.yaml`, injected into the prototype by `prototype/gen-script.mjs` (`npm run gen:script`) and read via an `L("<id>")` helper; `npm run script:docx` exports a hand-editable `docs/script.docx` and `npm run script:import` matches an edited docx back by stable `[scene.field]` labels and reports what changed (apply is Claude-mediated, preserving name tokens and markup). Mechanical action screens stay in code. 30 files / 106 tests green; workflow in `docs/script-workflow.md`. #46 closed. Next: the rest of #43 (the founder-story feature) and the milestone-2 items (#24, #48, a Vercel proof-of-concept). Earlier the same day: the opening letter (#44) and Day-1 reframe (Session 10), and the names config (#45, below).*

*Prior (end of Session 11): Built the names config (#45): `content/names.yaml` is now the single source of truth for every NPC and location name, injected into the prototype by `prototype/gen-names.mjs` (`npm run gen:names`) and resolved at render time by a `tok()` `{{token}}` helper wired into every render sink; all `year1.html` prose was tokenized, and renaming a placeholder is a one-line edit that propagates everywhere (proven live and guarded by `tests/names-config.test.mjs`). 28 files / 97 tests green. The content/events YAML literals are deferred to #46. #45 closed. Earlier the same day (Session 10): the New Game opening letter (#44), the Day-1 inheritance reframe (part of #43), and the Sull→Sallows rename. Next: #46 (dialogue extraction, reuses the token scheme), then the rest of #43 and the milestone-2 items (#24, #48, a Vercel proof-of-concept).*

*Prior (end of Session 10): Built the New Game opening letter (#44): a lineage-naming step plus a two-page, self-paced letter (black screen; page 1 an aged-paper letter, page 2 plain cream-on-dark narration) that hands into the first Morning Brief, to the locked copy in the issue. The player's surname is stored as `S.lineageName` and persisted. At Chris's direction also folded in the Day-1 inheritance reframe (part of #43): the opening is now "Your uncle's ground" (Malachi's heir) and Silas hands over the inherited mortgage. And renamed Sull→Sallows across the prototype and all seven content/events YAML files (a careful proper-noun rename that left lowercase "sullen" alone). Full suite green at 27 files / 90 tests; walked the whole flow live with no console errors. #44 closed. Next: #45 (names config) and #46 (dialogue extraction) as plumbing before more narrative, then the rest of #43 and the standing milestone-2 items (#24, #48, a Vercel proof-of-concept). Onboarding issues still open from Session 9: #32, #35 to #38, #40, #42.*
