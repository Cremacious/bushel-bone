# Open Questions

Design decisions that are still open. When resolved, move the entry to `decisions-log.md` with rationale.

## High priority — blockers for later work

### Q-001. MVP scope cut list — ✅ RESOLVED (Session 3, → D-033)
Answered in `docs/scope-mvp.md`: ship the full core loop over a 4-year first lifetime; defer the Vat, Ascension, Black Market, Rail Depot, fancy contracts, Season Arcs 5–10, and the deep unlock catalog.

### Q-002. Monetization model
Four options: premium paid ($4–8), free demo + full unlock, F2P cosmetics/DLC, or full F2P (rejected — the design bends around it).
**Blocks:** IAP verification code, store listing prep, marketing.

## Medium priority — needed for deep design

### Q-003. Full numerical balance — 🔄 ADVANCED (not closed)
Every economic value has actual numbers (Mechanics Bible) and a first calibration pass is **ratified** (D-032, `docs/balance-model/config.py`). 9/40 hypotheses validated in the model.
**Remaining before close:** the exploit/Ascension hypotheses (#6, #9, #10 — smarter/adversarial bots), the long-game ceiling, and the paper playtest (#11).
**Owned by:** Balance Model + playtest.

### Q-004. NPC quest arcs — full outlines
Every named NPC has 3–5 quest hooks alluded to but not written. Each needs beat-by-beat outline including reactions to player cruelty state.
**Owned by:** Narrative & World Bible.

### Q-005. Season Arcs — Years 1 through 10
GDD names Year 1 (The Newcomer), Year 2 (The Preacher's Sickness), Year 3 (The Rail Comes), Year 4 (The Vigil Breaks). Need full outlines for 5–10 additional years, plus branch logic for reacting to player state.
**Owned by:** Narrative & World Bible.

### Q-006. The three Vane truths — full backstories — ✅ RESOLVED (Session 3, issue #14)
Written in `docs/narrative-bible.md` Part 3 (elaborates D-014): the shared surface + Corvantine wound; **Truth A** (spy for the Cawdor Mill), **Truth B** (the third Vane, Cassius), **Truth C** (Meredith is a vessel of the dead Meredith) — each with clues, red herrings, reveal pacing, payoff (kind/cruel branches), and cruelty-state reactivity. Full quest-chain beats slot into #13/#15.

### Q-007. World geography and lore — ✅ RESOLVED (Session 3, → D-029/D-030/D-031)
Answered in `docs/narrative-bible.md` Part 1: the Commonwealth of Ostrey / the Sull; vessel-trade; the Church of the Long Vigil; the Marrow as the Reckoning's source.

### Q-008. Ancient / pre-play history of Marrow's Cross — ✅ RESOLVED (Session 3, → D-029)
Answered in `docs/narrative-bible.md` Part 1.5: the Salting (founding sin), the naming, the Old Well.

## Lower priority — needed before ship

### Q-009. Localization plan
Text-heavy game. Which languages ship at 1.0? Which post-launch? Translation vendor?
**Blocks:** content pipeline design for i18n keys.

### Q-010. Live-ops cadence
Event pack every 6–8 weeks — do we have the writing capacity? Major content (new NPC or arc) quarterly? Yearly expansion (new land region + archetype + weird crop) — realistic?
**Blocks:** post-launch team sizing.

### Q-011. Marketing and community strategy
Launch positioning. Press. Streamer strategy. Discord. Wishlist campaign. PC version consideration (Steam/itch).

### Q-012. Audio direction
Music composer/style. Ambient soundscape (wind, crows, distant bells). Voice work (any?). Reckoning musical cue system.

---

## Blocked / awaiting decision

*(none currently — the design is unblocked; questions above are all just next-up work)*
