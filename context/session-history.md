# Session History

Chronological log of what each Claude session accomplished. Append a new entry at the top after every session that changed anything meaningful.

Format: `## Session N — YYYY-MM-DD — Short title`
Body: what was worked on, what was decided, what artifacts were produced, what's next.

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

**Next up:**
1. **Run the Balance Model** in a Python env (`python run.py`, or `compare` / `sim`). Act on the report: confirm/tune the expected H-02, H-05, and food-economy findings; record verdicts.
2. **Extend the engine** to the NOT MODELED systems (events §9, contracts §7, Vat/overwork cruelty loops §3, ascension §15) to unlock the remaining ~31 hypotheses — especially the P0/CRUELTY-DEBT set.
3. **Commit** the balance-model code (uncommitted at session end).
4. Later: paper prototype playtest (for the feel numbers can't confirm); then code scaffold (still deferred).

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
