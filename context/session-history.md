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

**Milestone: 6/17 closed (#1–#5, #7).** Phase 1 done; the keystone of Phase 4 (the slice) is done early.

**Next up:** **#11 (paper-prototype playtest)** is now unblocked (its dep #7 is done) — the only test for "is it fun / boring," which nothing else can answer. Also high-value: **#6 (exploit/adversarial bots — the direct anti-loophole validation)**. Narrative breadth: **#13 (quest arcs)**, **#14 (Vane mystery)**, **#15 (arcs 5–10)**. Remaining mechanics/schema: **#8**, **#12**.

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
