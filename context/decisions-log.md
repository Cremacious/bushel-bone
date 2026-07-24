# Decisions Log

Every locked design decision, in chronological order, with rationale. Do not reopen without the user's explicit request. When a decision is superseded, mark it and note when/why.

---

## Session 1 — Foundational GDD

### D-001. Core Player Fantasy: "I survived another year."
**Options considered:** legacy/heirloom, cunning/market-outsmart, grit/survival, whimsy/folk-magic.
**Chosen:** grit and survival. Warmth without coziness. The joy is in barely making it.
**Rationale:** Sets the tonal spine and rules out the crowded cozy-fantasy market. Justifies weight of stakes.

### D-002. Setting: Alternate 1800s with dark tone, light story
**Options considered:** historical Americana, Dust Bowl, post-apocalyptic reclamation, fictional harsh northland.
**Chosen:** alternate 1800s, dark tone, light story.
**Rationale:** Freedom to invent without breaking real-world lore. Player explicitly stated pillars are broader than just market — planting, buying, management, supplies, market are all first-class. Elevator pitch: Stardew × Oregon Trail × ethical horror.

### D-003. Weirdness dial: Weird West / occult undertow
**Options considered:** grounded superstition, Weird West horror, soft folk fantasy, no supernatural.
**Chosen:** Weird West / occult undertow. Something is genuinely wrong out there.
**Rationale:** Enables real supernatural stakes for the reckoning system while keeping tone grounded (horror, not fantasy).

### D-004. The core hook: Farmhand clones
**Chosen:** The player buys farmer clones grown by strange 1800s pseudo-science. Cruelty raises yields; kindness sustains loyalty.
**Rationale:** User-generated. Turns a "manage-a-farm sim" into a moral engine. Gives "bone" real weight (clones are disposable — or aren't). Creates the moral axis on which the reckoning turns.

### D-005. Consequences: Supernatural (The land remembers)
**Options considered:** supernatural, social/economic, mechanical rebellion, layered.
**Chosen:** supernatural. Hauntings, blights, ill omens, the dead do not stay buried.
**Rationale:** Tightest thematic fit. Un-gameable. Reveals horror slowly. Poetic.

### D-006. Spatial frame: Rooted homestead + nearby town
**Options considered:** rooted, homestead+expeditions, full journey, rooted+relocatable.
**Chosen:** rooted homestead. Town is a wagon ride away. Travel is a menu, not gameplay.
**Rationale:** Simpler scope. Oregon Trail DNA relocates from spatial travel to weighty menu decisions, brutal events, and resource management before winter.

### D-007. Run architecture: Year → Farmer's Lifetime → Family Lineage
**Options considered:** one year per run, one farmer's lifetime, multi-generational, chapters.
**Chosen:** hybrid of 1 and 3 — nested tiers.
**Rationale:** Year gives mobile-friendly tactical loop. Lifetime gives emotional weight. Lineage gives true roguelite meta. Best of all worlds. Runs end only on line-death or land-loss.

### D-008. Time model: Turn-based, 20-day seasons
**Chosen:** Turn-based days, 20 days per season, 80 days per year. Portrait mobile-primary. Session sweet spot 10–15 min.
**Rationale:** Save-anywhere, mobile-native, battery-friendly, honest to Oregon Trail. Round numbers map to UI.

### D-009. Core day structure: Three-beat
**Chosen:** Morning Brief → Play → Dusk Report. Homestead View is a static 2D diorama. Per-clone assignment with auto-templates for late-game scaling.
**Rationale:** Predictable rhythm, works for both quiet and event-heavy days. Diorama scope-manageable and thematically right.

### D-010. Farming: Four crop families, field-level abstraction
**Chosen:** Grains (Wheat, Corn, Oats), Roots (Potatoes, Turnips), Cash (Tobacco, Cotton, Hops), Weird (Moon Barley, Bone-root, Whisper Wheat). Fields, not tiles.
**Rationale:** Weird crops weld farming to the moral system. Field-level abstraction is mobile-legible.

### D-011. Clones: Three sources, four-axis cruelty ledger, five burial options
**Chosen:** Sources — Dr. Vane's Merchant, The Vat, Foundlings. Ledger — Reckoning (hidden), Morale (visible), Reputation (visible), Ghost Roll (hidden). Burial — marked, unmarked-field, sell-to-Vane, feed-Vat, full funeral.
**Rationale:** Progression from Merchant-only to full DIY horror. Multi-axis ledger prevents "one cruelty number" collapse.

### D-012. Market: Four price layers, four venues, contracts
**Chosen:** Layers — base, seasonal, demand shock, micro-noise. Venues — Local, Regional Buyers, Rail Depot (mid-game), Black Market. Full forward-contract system.
**Rationale:** Rewards information without spreadsheets. Multiple play styles supported. Contracts weld farming pressure to market decisions.

### D-013. Town: Marrow's Cross, 10 named NPCs, 4 festivals
**Chosen:** Marrow's Cross as the town name. Ten NPCs (see CLAUDE.md §4). Four annual festivals with soft-required attendance.
**Rationale:** Small deep cast beats sprawling shallow one. Festivals give the year tentpoles.

### D-014. Vane siblings: Three-truth randomizer
**Chosen:** Ambrose and Meredith are blood siblings. Which of three truths (spy, third Vane exists, Meredith is a vessel) is real is randomized per campaign.
**Rationale:** Deep replay hook. Every lineage can uncover something different. Deadwood-adjacent slow-burn subplot.

### D-015. Meta-progression: Vigils, content unlocks, persistent Codex
**Chosen:** Meta-currency called Vigils. Unlocks are new content (archetypes, crops, buildings, arcs) not power. Codex persists across all runs ever played. Marrow's Cross evolves across campaigns. Ascension +1 through +10 modifiers.
**Rationale:** Content-not-power avoids power creep. Persistent Codex is the memorial that makes runs feel meaningful past hour 20.

### D-016. Events: Seven families, choice-card resolution
**Chosen:** Families — weather, pests, wildlife, opportunities, town, personal, reckoning. Universal choice-card grammar. ~120 events at MVP, 250+ at 6 months, 400+ at year 1.
**Rationale:** Card grammar is mobile-perfect, cheap to produce, easy to localize. Seven families give texture without overwhelming.

### D-017. Reckoning: Five tiers of escalation
**Chosen:** Whispers → Warnings → Walkers → The Long Vigil Fails → The Reckoning Proper.
**Rationale:** Slow reveal of horror. Every tier is poetic and mechanically distinct. Poetic escalation, not a bar-fill.

### D-018. Cultural care: No Native American depictions
**Chosen:** Design constraint. No real or thinly-veiled Native American cultures. Bandits are individuals or ideological groups, never ethnic.
**Rationale:** The 1800s frontier setting invites the trap; we avoid it explicitly.

### D-019. Art direction: "The Illustrated Almanac"
**Chosen:** Cross-hatched ink illustration on aged paper backgrounds. Muted color with one seasonal accent per season. Hand-lettered display type + clean serif. Layered paper-cut dioramas.
**Rationale:** Distinctive in the mobile market. Reads dark alt-1800s immediately. Ages well. Scalable art pipeline.

### D-020. UI: Portrait-primary, six-tab bottom bar
**Chosen:** Homestead, Clones, Fields & Stock, Market, Town, Ledger. Full accessibility from day one.
**Rationale:** Mobile-native. No dexterity requirements. Standard mobile grammar.

### D-021. Tech stack: Next.js + Capacitor, no game engine
**Chosen:** Next.js 15 App Router + React + TypeScript + Tailwind + Zustand + Immer + Framer Motion. Content in YAML. Vitest + Playwright.
**Rationale:** The game is text-and-illustration with menus. No game engine tax. One codebase → web + iOS + Android.

### D-022. Backend: Neon + Better Auth + Drizzle + Vercel
**Chosen:** Neon (Postgres) for db including JSON save blobs. Better Auth (self-hosted TypeScript) for auth. Drizzle ORM. Vercel for hosting.
**Rationale:** User-selected. TypeScript-first, modern, self-hostable auth (no vendor lock-in). Native Vercel-Neon integration.

### D-023. No multiplayer at MVP
**Chosen:** Single-player at 1.0. Multiplayer deferred as post-launch consideration.
**Rationale:** Multiplayer triples scope, doesn't obviously benefit this game's personal moral loop, and is the most common indie killer.

---

## Session 2 — Mechanics Bible (core system commitments)

These five were promoted from the Mechanics Bible (`docs/mechanics-bible.md`) because the Balance Model's math and multiple systems depend on them. They are structural, not mere tuning — the numbers around them can move, but these commitments should not without explicit reopening.

### D-024. Labor (clone-days), not coin, is the primary mid-game constraint.
**Chosen:** Coin is the Year-1 bottleneck, but from mid-game on the binding resource is clone-labor (clone-days). Fields need tending/harvest labor; buildings need construction labor; Winter prep competes with harvest labor. Coin becomes plentiful faster than labor does.
**Rationale:** Makes assignment the central decision (per D-009), gives clones intrinsic value beyond their purchase price (deepening the moral hook, D-004/D-011), and creates the ~2-fields-per-clone scaling ratio that caps runaway farms organically (§11). Referenced by §3, §8, §11 and hypotheses H-09, H-32.

### D-025. Cash crops have zero food value — the anti-monoculture Winter gate.
**Chosen:** Cotton, tobacco, and hops are inedible (0 food value). Only grains, roots, and livestock feed the household through Winter (§4).
**Rationale:** This single rule is the load-bearing defense against cash-crop monoculture: a pure high-margin farm must *buy* Winter food at scarcity-peak prices (1.20–1.25×, §2), erasing enough margin that mixed farming stays competitive. Without it, "grow only the most profitable crop" is a dominant strategy (CLAUDE.md concern #2). Referenced by §1, §2, §4 and hypothesis H-16.

### D-026. Reputation is a two-way axis — "pillar" and "outlaw" both viable.
**Chosen:** High town Reputation (Pillar) unlocks discounts, contracts, information, marriage/heir; low Reputation (Outlaw) locks those but opens the Black Market, Weird-crop buyers, and reduced initial scrutiny of the Vat/dark crops. Neither end is a dead state.
**Rationale:** Prevents Reputation from being a one-directional punishment meter and makes cruelty a *playstyle choice* with its own economy rather than a strictly-dominated mistake — while the Reckoning (D-027) still collects on the outlaw path regardless. Referenced by §5, §12 and hypothesis H-34.

### D-027. Reckoning is hidden, concealment-proof, and carries 25% to heirs on the same land.
**Chosen:** The Reckoning meter is never shown as a number (read only through omens/tiers, §6). It is unaffected by secrecy — hiding cruelty from the town (Reputation) does nothing to it. On succession, an heir on the same land inherits **25%** of accrued Reckoning; a wholly new lineage on new land starts at 0.
**Rationale:** Makes the supernatural debt the one axis you can never game or launder — the thematic spine "the land itself remembers" (D-005). Secrecy delays the social bill but never the supernatural one (H-17); succession is not a laundering cheat (H-21). Referenced by §5, §6, §12.

### D-028. Meta-progression is content-not-power; Ascension owns all difficulty scaling.
**Chosen:** Vigils buy *breadth* (new archetypes, crops, buildings, events, arcs) never *strength*. A fully-unlocked account faces the same base difficulty as a fresh one. All escalating challenge lives in the optional Ascension ladder (+1…+10), where each level is a named rule change targeting a different system. (Restates and operationalizes D-015.)
**Rationale:** Avoids roguelite power-creep that would trivialize the base game, and concentrates the "keep it hard for experts" job in one auditable place. Referenced by §14, §15 and hypotheses H-37, H-39, H-40.

---

## Session 3 — World & Lore foundation (GitHub issue #3)

Foundational narrative decisions. Full write-up in `docs/narrative-bible.md` Part 1. Resolves open questions Q-007 and Q-008.

### D-029. The Reckoning's true source is the Marrow — the land keeps the ledger.
**Options considered:** a living God's judgment; the dead's own revenant imprint; an eldritch thing the Vats woke; the land itself keeping accounts.
**Chosen:** The land. Beneath the Sull runs *the Marrow*, an old pale seam that remembers the wronged dead and returns them by name when the account tips. Not a god; a reckoning that balances itself. Cruelty is a debt; rite is payment. The player may never be told outright — we hold the truth.
**Rationale:** Tightest fit for D-004/D-005 ("the land remembers," clones as moral engine) and the title. Un-gameable, poetic, and it explains every §6 mechanic (tiers, atonement, Ghost Roll, Vat drip) from one root.

### D-030. Whether making vessels is itself a sin is a permanently unsettled doctrinal dispute.
**Chosen:** The Church of the Long Vigil preaches the Vat is blasphemy ("quickening what the earth would not"); Old Nan says the land only counts cruelty. The hidden truth leans Nan's way — but the Marrow *does* register a faint stain at vessels (the §6 baseline/Vat drip), so the Church isn't baseless. Neither is wholly right, and no one alive can prove it. The game never fully answers.
**Rationale:** Gives the moral system a genuine argument and keeps the horror ambiguous without being arbitrary — the dispute is grounded in a real, hidden fact and maps directly to the mechanics.

### D-031. Setting: an invented frontier nation — the Commonwealth of Ostrey, western territory the Sull.
**Chosen:** A fictional 1800s-analog charter-republic and its frontier, with invented names, geography, faith, and vessel-trade. The Sull is genuinely unpeopled wildland; the only prior claim on it belongs to the ground (the Marrow), not to any displaced people.
**Rationale:** Matches D-002's "freedom to invent," and sidesteps the D-018 cultural-care trap entirely by making the land's grievance geological, not ethnic.

### D-032. Balance calibration ratified (issue #2).
**Chosen (from the Balance Model's findings):**
- **Food economy — protect the survival weight:** keep the committed §3/§4 consumption (food stays a heavy ongoing burden); close the annual gap on the *production* side — starter plot **4 small fields** (was 3), a **+10% quick-ground yield** (D-029), roots fertility decay softened to **0.18** (was 0.25).
- **Mortgage:** a **2-year establishment grace** before the 150/yr payment begins (§13).
- **Bone-root:** base price **30 → 4** (hits the 1.5–2× wheat target; H-02 CONFIRMED) and Reckoning-per-harvest **4 → 6**.
**Rationale:** Preserves the survival-horror weight of "mouths to feed" and the winter crunch while making the economy solvable; removes bone-root's runaway raw margin without relying solely on unproven risk. Live tuned source: `docs/balance-model/config.py`. **Still open (Q-003):** the long-game ceiling and Year-1 feeding scarcity need the smarter/adversarial bots (#6) and the paper playtest (#11).

### D-033. MVP scope ratified (issue #1).
**Chosen:** Ship the full moral-survival core loop over a 4-year first lifetime — all 10 NPCs, 4 festivals, ~120 events, the full reckoning arc, the lineage meta — with the market, clones, contracts, building, roster, arcs, and meta shipped in *simplified* form. **Defer to post-launch:** the Vat, Ascension, Black Market + Rail Depot venues, fancy contract types, Season Arcs 5–10, the deep unlock catalog, and Longhouse-tier roster. Full table in `docs/scope-mvp.md`.
**Rationale:** Ship *safe* (the Vat and Ascension are the most exploit-prone, least-validated systems — defer until the model proves them) and *complete* (the 1.0 loop is a whole game, not a demo). Deferred systems form a clean post-launch content roadmap. Resolves Q-001.

---

*Add new decisions below with the next session number.*
