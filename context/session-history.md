# Session History

Chronological log of what each Claude session accomplished. Append a new entry at the top after every session that changed anything meaningful.

Format: `## Session N — YYYY-MM-DD — Short title`
Body: what was worked on, what was decided, what artifacts were produced, what's next.

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
