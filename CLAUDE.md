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

*Last updated: end of Session 9. A follow-up playtest of the onboarding clarity pass produced 16 GitHub issues (#27 to #42), worked one at a time with Chris: implement, report exactly what changed, wait for explicit approval, close only on a yes. Nine closed this session (#27 to #31, #33, #34, #39, #41), including a real "l.name" bug that would have shown "undefined" for cotton's harvest and an unexplained arbitrary-field growth bonus on Attend the Fair. Locked D-039: onboarding hand-holding fades out gradually across a run, never abruptly, and any hidden mechanic that could read as a bug to a first-time player gets a plain-language explanation the moment it first matters. Next: the remaining issues (#32, #35 to #38, #40, #42), in the priority order agreed with Chris, starting wherever the next session picks back up.*
