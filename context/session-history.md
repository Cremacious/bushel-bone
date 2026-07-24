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

**Artifacts changed:**
- `docs/mechanics-bible.md` — full draft of all 15 systems (was outline + §1); status line + "Systems covered" checklist all ✅; four consistency fixes applied.
- `docs/balance-model/hypotheses.md` — **NEW**: 40-hypothesis test suite for the Balance Model.
- `context/session-history.md` — this entry.

**Next up:**
1. **Build the Balance Model** (Python, `docs/balance-model/`): encode the §1–§15 numbers, run seeded headless campaigns, and tag each of H-01…H-40 Confirmed / Refuted / Untested with seed count + result. Prioritize P0 hypotheses. NOTE: user flagged this Python work may be done in the web chat where code can execute and charts render.
2. Optionally: promote the D-024+ cross-system commitments to `decisions-log.md` (still awaiting user's call — see below).
3. Later: paper prototype playtest (for the feel that numbers can't confirm); then code scaffold (still deferred).

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
