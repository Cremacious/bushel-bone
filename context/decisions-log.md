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
**Chosen:** The land. Beneath the Sallows runs *the Marrow*, an old pale seam that remembers the wronged dead and returns them by name when the account tips. Not a god; a reckoning that balances itself. Cruelty is a debt; rite is payment. The player may never be told outright — we hold the truth.
**Rationale:** Tightest fit for D-004/D-005 ("the land remembers," clones as moral engine) and the title. Un-gameable, poetic, and it explains every §6 mechanic (tiers, atonement, Ghost Roll, Vat drip) from one root.

### D-030. Whether making vessels is itself a sin is a permanently unsettled doctrinal dispute.
**Chosen:** The Church of the Long Vigil preaches the Vat is blasphemy ("quickening what the earth would not"); Old Nan says the land only counts cruelty. The hidden truth leans Nan's way — but the Marrow *does* register a faint stain at vessels (the §6 baseline/Vat drip), so the Church isn't baseless. Neither is wholly right, and no one alive can prove it. The game never fully answers.
**Rationale:** Gives the moral system a genuine argument and keeps the horror ambiguous without being arbitrary — the dispute is grounded in a real, hidden fact and maps directly to the mechanics.

### D-031. Setting: an invented frontier nation — the Commonwealth of Ostrey, western territory the Sallows.
**Chosen:** A fictional 1800s-analog charter-republic and its frontier, with invented names, geography, faith, and vessel-trade. The Sallows is genuinely unpeopled wildland; the only prior claim on it belongs to the ground (the Marrow), not to any displaced people.
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

### D-034. Exploit-hardening ratified (issue #6).
**Chosen (from adversarial-bot validation):** hardened the cruelty-debt counters so cruelty provably self-terminates —
- **Morale now drives labor** (§3 bands, per clone: content +5%, unrest −25%, revolt −70%). Previously low morale only caused desertion, so overwork was "free."
- Overwork Morale cost −8→−12, plus a −10 household witness penalty on a worked-to-death clone.
- **Walker-tier teeth** (§6): at Walkers+ the dead blight fields (45%) and take clones (22%), and the Reckoning **accelerates +6/season** — cruelty spirals to the Reckoning Proper instead of plateauing. A narrow road back still exists for a player who stops and atones (H-19).
- **Vat drip 0.5→1.0/day** — running a Vat is the land's deepest offense (D-030), a self-terminating Faustian bargain.
**Rationale:** the model caught two real would-be exploits (overwork and the Vat baron topped the leaderboard); these fixes make the moral thesis TRUE, not just asserted. Result: H-01/H-10/H-11/H-18/H-20 all CONFIRMED — cruelty always costs more than it gives. Live source: `docs/balance-model/config.py`.

### D-035. Monetization: free demo + one-time full unlock; all post-launch content free; mobile-first + PC (issue #17).
**Chosen:**
- **Free to try through Year 1** (the first lifetime, "The Newcomer" — the player learns the loop, meets the town, survives one winter, glimpses the Reckoning), then a **single ~$6 purchase** unlocks the full game. No pay-to-win, no gems, no ads.
- **All post-launch content ships FREE** as updates — the deferred MVP systems (Vat, Ascension, Black Market, Rail Depot, Season Arcs 5–10) plus event/live-ops packs. No paid DLC.
- **Dual-launch: mobile-first** (D-020) **+ PC** (Steam/itch).
**Rationale:** preserves the game's premium integrity and moral tone (F2P nagging would be at war with a moral-survival design; consistent with content-not-power, D-015). The free demo solves mobile discoverability — try the whole first year, then buy to keep the lineage going. Free-content-forever maximizes goodwill and retention and reinforces the anti-monetization-bending ethos (a design concern flagged since Session 1). PC hedges mobile's premium-discovery problem (relates to Q-011).
**Business note:** the single unlock is the ENTIRE revenue model — no recurring or DLC income by choice; retention is served by free content, not sold. A clean creative stance with a real revenue tradeoff, chosen deliberately.
**Resolves Q-002.**

### D-036. Reuben becomes the Foreman; the farmhand roster and the imagery layer (Prototype v0.2).
**Chosen:** From a playtest that found the prototype confusing and Reuben inconsistently privileged, Reuben is made the **Foreman**: the player's right hand and the single human channel to the farmhand collective. He is their voice, the tutor (the player asks him what to do next), and the Reckoning alarm (he interrupts, in character, when moral debt crosses a tier, with no number shown). If he dies, the player names a new Foreman. Every hand is now first-class: a farmhand **roster** lists them all with morale and condition, and each is assigned per season (realizing the locked per-clone-assignment decision). A new **imagery layer** gives every scene a location "plate" (a woodcut illustration inside an engraved border, with an always-visible place-name caption) and a speaker portrait that rises over it. Two review decisions: the alarm fires **first-only** (the first crossing into each tier per run), and the ambient **collective voice is always Reuben** (individual scripted beats may still show a hand's own portrait). Full design: `docs/superpowers/specs/2026-07-25-reuben-foreman-and-imagery-design.md`.
**Rationale:** one idea fixes two problems at once. It gives Reuben a real mechanical reason to exist (closing the inconsistency), and it turns the collective's suffering into a voice the player hears rather than a meter, which keeps the hidden Reckoning hidden while making it fair. The Foreman warning kills the "it came out of nowhere" failure mode; first-class hands close the "scale on anonymous disposable labor" exploit; named hands heard through Reuben answer the narrative-flatness fear. Spawns issue #25 and shapes issues #19 to #24.

### D-037. No dash punctuation in any game text or docs.
**Chosen:** No em dash, and no hyphen used as a pause, an aside, or a clause connector. Replace with a comma, period, colon, semicolon, parentheses, or a fresh sentence. Ordinary hyphenated compound words (belly-filler, two-season) are kept, since they are spelling, not punctuation. Reverses the previous voice guidance, which favored the em dash. Rule lives in `docs/style-guide.md`; existing content is scrubbed under issue #26.
**Rationale:** the em dash is one of the strongest "written by AI" tells, and it makes the game feel AI-made, which is fatal to the alt-1800s almanac voice. Chris chose "ban dash punctuation" over the stricter "ban every hyphen." A voice-integrity decision with almost no downside.

---

## Session 8 — The founder's story (The Inherited Vigil)

Designed collaboratively with Chris in a choice-driven session. Full write-up in `docs/narrative-bible.md` Part 0. Resolves the last narrative gap (Q-013): the player's personal origin and what the endings show.

### D-038. The player's origin is an inheritance: Uncle Malachi and the vigil he died keeping.

**Options considered (opening premise):** a fresh charter (blank-slate newcomer, the old default); fleeing a debt or crime; returning blood (a descendant of the Salting); or inheriting a predecessor's farm.
**Chosen:** **inheritance.** The player is the heir of an uncle they never met, and the opening gesture is standing on someone else's unfinished life. This makes the first thing a new player feels the thing the whole game is about, land passed down and debt carried (D-007, D-027).

**The predecessor (chosen forks):**
- **Who:** **Uncle Malachi**, the player's father's brother (shares the family/lineage name). A quiet man, gentle with his hands, who worked the Sallows homestead about twenty years and came to understand the Marrow alongside Old Nan, keeping a private vigil the town never knew about. (Chosen over: a known parent, a stranger's reverted claim, or a cruel predecessor.)
- **His fate:** he **vanished with no body and no grave**, leaving his journals behind. (Chosen over: an ordinary death, a still-wandering changed thing, or a human crime.)
- **The truth:** the town's Long Vigil was slowly losing against the valley's mounting debt, and Malachi understood that a life freely given is the heaviest payment the Marrow accepts (rite is payment, D-029). He **walked down into the Old Well and spent himself** to buy the Sallows more time. (Chosen over: the town's collective debt taking him, a still-living changed uncle, or a human hand.) Kept **fixed**, not randomized like the Vane truths, as the player's stable personal anchor.

**The narrative to follow:** the player uncovers Malachi four ways, paced across a lifetime: his **journals** (the guide from the grave, the reveal-pacing device), **Old Nan** (the spiritual truth; she taught him), **Sheriff Coldwater** (the cold case he never closed), and **Reuben** the Foreman (the living link, who was Malachi's hand and grieves him). Deliberately lean: the rest of the cast keep their arcs uncluttered.

**The reckoning, made personal:** the seal Malachi bought with his life is wearing thin, and it comes due at Year 7 (The Old Well Opens) and Year 10 (The Long Vigil). The player faces the same shaft and the same choice; his motive is the template for the player's climactic one. No change to the hidden-meter rules (D-027); this is narrative framing over the existing endgame.

**The thesis and the endings (deferral, forever):** you never defeat the land. The best a lineage earns is a longer sleep and a watch passed on, agreeing with the core fantasy "I survived another year" (D-001). Endings: **bittersweet best** (seal renewed, vigil handed to an heir on a loved land with only the lightest debt, a lantern handed over rather than a sunrise), **frayed middle**, and **the Salting repeated** (the seal breaks, the Marrow reclaims the Sallows, land-loss by curse, D-007). (Chosen over: an earnable true peace, a become-the-keeper transformation, or a debt-only-moves cynicism.)

**The reunion (earned, and rare):** only a kind, low-Reckoning lineage that reaches the best ending finds Malachi at peace enough to say one thing, and the player names him at last, giving him the grave he never had. A reward for the kind path. (Chosen over: a reliable voice at the bottom, a Walker who knows your name, or never at all.)

**Meta fit (roguelite):** Malachi's sacrifice is **permanent town canon** (D-015); your first lineage is his heir; later lineages are new blood who rediscover the truth from scratch, with the Codex tracking how much each learned. He is the FIXED personal anchor beside the RANDOMIZED Vane mystery (D-014).

**Enrichment touching D-036:** Reuben, the Foreman met on Day 1, was Malachi's hand. A narrative addition (a "knew Malachi" dialogue thread), not a mechanical change to the Foreman role.

**Rationale:** gives the player a personal narrative to follow (the session's stated goal), welds the opening to the endgame through the Old Well, makes the Reckoning personal without altering the hidden-meter design, reinforces the inheritance-and-debt meta from the first minute, and lands the core fantasy as an emotional thesis (survival, not victory). Every fork was chosen by Chris.

---

## Session 9 · Playtest pass on the onboarding clarity work (#27 to #42)

Working session with Chris, reviewing fixes for GitHub issues #27 to #42 one at a time against fresh playtest notes on the just-shipped onboarding clarity pass. Several rounds surfaced the same underlying pattern: a mechanically correct system (fertility depletion, the Attend the Fair blessed-field bonus, cotton's two-hand yield) produced results that looked like bugs because nothing on screen explained the cause.

### D-039. Onboarding hand-holding fades out gradually, not abruptly.
**Chosen:** a first-time player arrives completely cold and every gameplay element must be explained to them. Explicit explanation stays thick early (Year 1, the tutorial arc, see #40's "Year One as a low-risk, hard-to-fail tutorial arc") and tapers off gradually as the run progresses, rather than stopping at a fixed point. This applies uniformly across the game's explanation mechanisms: guided-mode tips (`tip()`), tap-to-reveal glossaries (`openInfo()`/`*_HELP`), and the result text shown after a choice resolves. Concretely: if a choice or system has a hidden effect that could read as random, unfair, or broken to someone seeing it for the first time (fertility hitting zero, a single field getting an unexplained growth bonus, a crop that still works with one hand but at half yield), the fix is to state the cause in plain language at the point it first matters, not to leave it implicit and let the player infer the mechanic from outcomes.
**Rationale:** the pattern repeated enough times in one playtest pass (issues #27, #28, #33, and the Attend the Fair blessed-field fix) that it is worth locking as a standing principle rather than re-litigating per issue. It keeps future content authors (human or Claude) from reintroducing silent, unexplained mechanical effects, and it gives a clear test for "does this need an explanation": would a first-time player, seeing only the result, reasonably conclude the game is broken?

---

## Session 8 (continued) — Reverted-parcel Reckoning, and the Sallows rename

### D-040. Reckoning is anchored to the land; a reverted parcel carries a residual keyed to how the prior line ended.
**Context:** D-027 fixed two cases (a dignified heir on the same land inherits 25%; a wholly new lineage on new land starts at 0), but left a gap the later-lineage opening (issue #44) makes common: what a NEW family inherits when it takes up a REVERTED parcel a previous line held and lost.
**Chosen:** the Reckoning belongs to the land, not the bloodline (reaffirming D-005/D-029, "the land remembers"), so a reverted parcel does not wipe clean for a new family:
- **Fresh, never-held land:** 0 (unchanged).
- **Dignified heir, same land:** 25% (unchanged, D-027), reflecting the rite and continuity of a proper handoff.
- **New family on a reverted parcel:** a residual keyed to how the prior line ended. **Quiet line-death (no heir) about 40%**; **curse-reclaimed by the Reckoning Proper about 60 to 75%** (and may require Old Nan's cleansing before the ground can be worked); **mundane foreclosure or fire about 15 to 25%** (the debt was financial or physical, not supernatural).
- **Decay:** the residual bleeds off slowly while a parcel sits vacant, so long-abandoned land is safer to take than freshly-emptied cursed ground.
**Rationale:** falls straight out of the locked cosmology (the debt is the ground's), makes reverted land a real and legible gamble (cheap, but haunted to a degree the last family set), and turns a returning player's own past failures into the haunting of their next attempt on that ground. The percentages are a first pass and belong to the Balance Model to tune (Q-003). Resolves the open Reckoning-carry-over item on issue #44.

### D-041. The frontier territory is renamed: the Sull becomes the Sallows.
**Chosen:** the western territory the game is set in, formerly **the Sull** (D-031), is renamed **the Sallows**, for the marsh willows ("sallows") that grow in its wet ground and for "sallow" as in sickly-pale, fitting the low, pale, uneasy country. The nation (the Commonwealth of Ostrey), the town (Marrow's Cross), and the seam (the Marrow) are unchanged.
**Rationale:** "Sull" read blunt and a little flat; "the Sallows" is more evocative, keeps a hint of the old S-sound, and folds the terrain and the dread into one word.
**Propagation:** the living canon docs are updated (narrative-bible, mechanics-bible, gameplay-flow, style-guide, vertical-slice, playtest-kit, open-questions, and this log) and the story issues (#43/#44). Historical logs and dated design artifacts (session-history, the superpowers plans/specs) retain "the Sull" as a period record; map any such reference to "the Sallows."

---

## Session 14 — Gameplay depth: the action economy, exploration, difficulty, and the UI rebuild

*From a brainstorming session addressing "interesting but not fun." Full design: `docs/superpowers/specs/2026-07-28-gameplay-depth-design.md`.*

### D-042. The game is a legacy/dynasty survival sim, not a traditional roguelite.
**Chosen:** the game's framing is refined from "roguelite" (the language in D-007) to a **legacy/dynasty survival sim**. Meta-progression stays content-not-power (D-028): across campaigns you unlock *breadth* and improve by *skill*; you never get *stronger*. The "progression" is a **legacy/longevity score**. The game is endless by design (the economic squeeze compounds until every lineage eventually falls); runs still end only on line-death or land-loss (D-007). The authored narrative peaks (the Old Well opens Year 7, the reunion at Year 10) are milestones along the climb, not a "win."
**Rationale:** a power-creep meta (each run easier via unlocks) would be at war with a game about a debt you can only defer. The playtester's own instinct — "inheriting debt makes a new run harder, so why continue?" — is answered by making the loop about lasting, not winning, and by the succession economics below (D-046). Does not change D-007's mechanics; clarifies its "roguelite" wording.

### D-043. The core loop is a season action-economy (6 discretionary action-days over a 20-day calendar).
**Chosen:** each season keeps its fixed bookends (Morning Brief, planting, the festival beat, Harvest/Dusk) and adds a middle of **~6 discretionary action-days** (start at 6; a tuning lever) spent one at a time on: **work a field · ride to town · tend the hands · handle a live event · rest**. Crops grow in the background; working improves them. **First principle — over-subscription:** the season must always offer more worth doing than the days allow (mild early, brutal late), so the skill is prioritization. The design's **"Day X of 20" counter + season pips** are the calendar display sitting *over* this economy — each action advances the counter several days; fixed beats land on set days (plant ~day 1, festival ~day 14, dusk ~day 20). Realizes the "Play" beat of the three-beat day (D-009).
**Rationale:** the old loop had no scarce resource spent on competing choices, so no real decisions — a year ran out in minutes. Time-as-scarcity creates the decisions *and* is the difficulty dial (D-045).

### D-044. Marrow's Cross is explored as a menu of destinations (the TOWN tab).
**Chosen:** "ride to town" spends one action-day and opens a menu of destinations — one visit per trip (honors D-006, travel is a menu not spatial gameplay; realized as the **TOWN** tab in the six-tab bar). Two layers: a per-NPC **standing** (stranger → known → trusted), separate from the global **Regard** meter, that builds across visits and gates deeper content (better deals, arcs, the Malachi threads); plus a **rotating opportunity deck** so visits stay fresh. Town is where you get the tools to survive the squeeze (contracts, market intel, hiring, a mortgage extension, charity) and where the story lives.
**Rationale:** turns Marrow's Cross from wallpaper into a place with agency and story, and gives the scarce action-day a compelling use with real opportunity cost.

### D-045. Year-over-year difficulty is an economic squeeze: flat budget, one telegraphed pressure per year.
**Chosen:** the spine of the difficulty curve is money. The action budget never grows; each year adds exactly **one** new, scheduled, telegraphed pressure — **Y1** none (learn; safety nets on), **Y2** safety nets fade, **Y3** the mortgage comes due (150 marks/yr, warned Day 1), **Y4** costs and reckoning peak (the vise). The four squeeze knobs: mortgage, mouths to feed (crew you choose to grow), field-fertility depletion, and rising upkeep. The reckoning and weather are overlays, not the spine. The tools to meet each year appear in town the year before you need them.
**Rationale:** rising *demands on a flat budget* make difficulty legible and plannable, never a random spike; the money curve also *manufactures* the moral drama (the years you most need cash are the years cruelty tempts you hardest). Numbers owned by the Balance Model (Q-003).

### D-046. Succession economics and the legacy ledger.
**Chosen:** a farmer's death is not a game-over — an heir takes up the same land and plays on. **Continuing as heir** keeps the improved land, the town's knowledge of your family, and story/Codex progress, and inherits the mortgage plus 25% of *your* reckoning (D-027) — ≈nothing if you were kind, a real weight if cruel. **A new lineage on new land** resets reckoning to 0 but loses everything you built. So the debt is the price of inheriting a *built* farm; the only true handicap is self-inflicted (kind legacy = a gift to your heir, cruelty = a curse). At run-end a **legacy ledger** scores years survived, generations, how much of Malachi's truth was uncovered, the condition of the land passed on, and the moral tenor. **Balance requirement:** for a well-played lineage the inherited capital must visibly outweigh the inherited debt.
**Rationale:** makes continuity a reward rather than a penalty, renders the moral thesis as a mechanic, and gives the endless survival a "last longer, cleaner, deeper" chase.

### D-047. Claude Design V0.3 is the UI rebuild target; two reconciliations locked.
**Chosen:** the prototype will be **rebuilt** against the Claude Design "V0.3" language in `design/version-1/` (two form factors — Steam 1920×1080 + Portrait 390×844; a six-tab phone bar **Home · Fields · Hands · Town · Ledger · Almanac**, which realizes the locked portrait-primary 6-tab decision). The final build follows the same design files. Two conflicts with existing canon were resolved: (1) the **opening letter** becomes a **hybrid** — canon facts (≈1884 to fit Malachi's 1864 journals; the Sallows Charter Company; the mortgage; "absent," no body) plus the design's tighter lines (e.g. "not dead in law, he is absent"); to be drafted for approval. The design's placeholder "1841 / S. Ridley signs for the Company" is *not* adopted (1841 breaks the journal chronology; Silas is the separate banker NPC). (2) The design's **"Day X of 20" counter** is the calendar display *over* the 6-action economy (D-043), not literal per-day play. The screens the spec adds but the design language does not yet detail (the Town exploration screen, the action-day chooser, the Almanac codex/journals screen, the legacy-ledger/run-end screen) will be designed *in* the V0.3 language.
**Rationale:** the design is a large quality step up and already anticipates the spec's Town and Almanac tabs; rebuilding against it (rather than patching `year1.html`) is the cleanest path to a fun prototype, and per the user's standing instruction, any further design/canon mismatches are surfaced and solved together.

### D-048. The minute-to-minute is a weekly homestead loop with two interlocking economies.
**Context:** the depth was designed (Mechanics Bible, 19 systems) but the *loop* that makes it fun moment-to-moment was not; the prototype felt "interesting but not fun." From a second brainstorm, the minute-to-minute is now specified (spec §10):
**Chosen:**
- **Two economies, interlocking:** each week the player assigns the crew's labor (clone-days, one task per hand) *and* spends their own week on one thing only they can do (work alongside, ride to town, handle a caller, sit with a failing hand). Neither is ever enough. (Refines §1/D-043: the flat "6 action-days" becomes ~5 **weekly beats** over the 20-day counter.)
- **Weekly beat:** read the morning report (weather forecast, each hand's condition, fields/crops, the four figures, telegraphed threats) → assign the crew → choose your action → advance and resolve, with events interrupting.
- **Crew tasks (farming + survival), each with yield variability:** tend, harvest, chop/gather, break ground, forage & hunt, preserve/process, rest. Livestock/building layer later.
- **Hands as mortal individuals:** one legible staged condition track (**Steady → Worn → Failing → Lost**) rolling up hunger/cold/overwork/sickness/witnessed-cruelty; needs (fed/warm/rested/fairly-treated); traits surface through play; **death has ritual** (bury proper — a day, eased grief, settled ground — vs discard — save the day, darken the household, feed the reckoning); names and loyalty; cruelty profitable now but witnessed and logged.
- **Crops — three-tier gamble:** staples (safe food), cash (risky coin), Weird (supernatural, need a "sees things" hand, feed the reckoning).
- **The four resources, made alive** (no new top-level numbers): larder spoils unless preserved + winter drain; fuel drains daily in winter and spikes in cold snaps (short = the frailest freeze); coin; seed; cold/sickness per hand, treated by rest/medicine.
- **Events:** forecast + surprise cadence (mostly telegraphed a week out so difficulty is fair, upholding D-045; a minority true shocks); **lasting, compounding consequences** (scarred fields, crippled hands, closed doors, walkers that take a hand) so the run accrues an emergent story.
- **The reckoning bites:** escalating tangible consequences up its tiers (taint spreads, hands see things/break, walkers cost labor/hands, the Proper can take the land), read through omens/Nan/Reuben (never a number, D-027), atonable via the Long Vigil, kind acts, Nan's rites, and proper burials.
**Rationale:** time-and-labor scarcity spent on competing, consequential choices — with people you can lose and a debt in the ground — is the fun the flat prototype lacked; it is Oregon Trail's attrition and hard weeks worn over a farm and a conscience. Surfaces the already-designed systems into a loop rather than inventing new depth. Numbers owned by the balance model (Q-003).

### D-049. The minute-to-minute is a DAY-BY-DAY loop; the season is 10 days (revises D-048, updates the GDD calendar).
**Context:** the built weekly loop (D-048) played "interesting but not fun" and confusing: no information to plan with, repetitive menu selection, no in-the-moment feedback. A ground-up rework (spec `2026-07-29-gameplay-overhaul-daily-loop-economy.md`).
**Chosen:** the atomic unit is a **day**, in three beats — **Dawn** (assign each hand one standing task, Reuben pre-fills), **Day** (the proprietor spends ~2 personal actions: forage, work a field, sit with a hand, or **ride to town**), **Dusk** (turn in; the day resolves: labor → growth → eating → cold → strain → loss). A **"Let the days run"** fast-forward crosses calm days and **auto-stops** on anything that wants a decision (a ripe crop, an event, a caller, a sick hand) via an `interrupts()` check, so the calendar is a reservoir of time, not mandatory turns. The **season is shortened to 10 days (40/year)** — a deliberate change to the GDD-locked 20-day/80-day calendar, tunable in playtest — because a day is now a real assign-and-explore beat, not an abstracted week. The reframe: you are a **proprietor building up a failing homestead, not a laborer**. Carries over unchanged: mortal hands + condition track (D-048), the reckoning, the squeeze (D-045), succession/legacy (D-046), the V0.3 UI (D-047).
**Rationale:** short scaling days + a smart fast-forward answer the "days drag" risk while making each day a legible decision; the shorter season makes each day carry weight. Built and merged to main (Session 16). Numbers owned by Q-003.

### D-050. The spine is a stepped build-up economy (start tiny, save, unlock ever-pricier capacity); three coin engines incl. an optional crop market.
**Chosen:** modeled on TCG Card Shop Simulator + Bookstore Simulator + Stardew — a visible **ladder** of upgrades, each rung dearer than the last, is the carrot: **Land** (start with **one cleared field**; clear more at escalating cost — 40/90/150m first pass), **Hands** (each hire is capacity *and* a mouth + a winter risk), **Tools/buildings** (plow/well/barn), **Crops** (cash grains → cotton → the Weird seed), **Market** (regional buyers → the rail depot). Every rung *raises the stakes*, not just numbers, and the cruelty lever always offers a faster climb the land remembers. Coin comes from three engines: **crops** (base), **town odd-jobs** (the slow-day engine), and an **optional Grand-Exchange-style crop market** (seasonal wave + gossip-telegraphed demand shocks + player-flooding depression + spoilage carrying cost + venues). **The market is optional depth, never a survival tax** (a careful seller always survives; playing it climbs faster) and has no easy exploit. This is the concrete expression of the D-045 squeeze.
**Rationale:** stepped, trickled-out progression is the carrot-on-a-stick the flat prototype lacked; the marriage of a shop-sim's growth pull with B&B's conscience. The 1-field start (the Land rung) is built (Session 16); hands/tools/market are later phases. Numbers owned by Q-003.

### D-051. Town is an explorable menu-map with per-NPC standing + rotating talk decks; four new economy NPCs.
**Chosen:** Marrow's Cross is a **stylized menu-map** (the TOWN tab). Browsing is free; each **odd-job** or **talk** costs one of the day's ~2 actions (the spec's separate "ride cost" is folded into the per-encounter cost — a simplification of D-044). A **"Ride to Marrow's Cross"** affordance sits on the Day screen so the day visibly has somewhere to go. Every NPC has a **talk deck** (intro → deeper scenes gated by `minStanding`); calling on someone raises **per-NPC standing** (Stranger → Known → Friendly → Close), which unlocks deeper scenes, and once a deck is exhausted a rotating **small-talk** filler keeps a visit from ever being empty. **Four new NPCs** were added to the canon roster (Chris-approved) to fill economy roles: **Hollis Crake** (toolwright — the tool/building vendor), **Prudence Tolliver** (shopkeep — seed/goods), **Mr. Fenwick** (rail agent — the mid-game market venue), and **the Ostrander farm** (a cruel rival, market color + moral mirror). Town talks seed the game's threads (Coldwater on cruelty, Nan on the reckoning, Silas on Malachi's debt, Meredith on market rumor) without resolving them.
**Rationale:** turns the town from wallpaper into the thing you explore with your day, and makes building relationships a reason to keep visiting (realizes D-044's standing + rotating deck). Built and browser-verified (Session 16). New NPC names live in `content/names.yaml`; talk prose in `content/script.yaml`.

### D-052. Multi-year continuity + the mortgage squeeze are implemented; the balance model is a JS sim on the real reducer.
**Chosen:** the prototype is now a **continuous multi-year run** (spec `2026-07-30-economy-and-progression-design.md`), not a Year-1 slice. Winter's end goes to a **year-end settlement** (the accounts + the mortgage due); **Turn the year** rolls into the next Spring carrying all state. The **mortgage** (D-045 realized) is due each year-end on a schedule (grace Y1, then rising); a shortfall becomes **arrears + a one-year warning**, and a second consecutive miss **forecloses** (land-loss run-end, D-006). **Hiring hands** (at Dr. Vane's wagon) is the mouth/capacity lever: more hands work more fields but eat more food and burn more winter fuel, so growth raises the stakes. Balance is validated by a **JS simulation that drives the actual `reduce()`** with scripted policies (optimal/normal/sloppy) over 4 years (`prototype2/sim/`), tuned until optimal survives and outlasts a careless line that forecloses by ~Y4, and kept as a **live regression test** (`tests/sim.test.mjs`). **This supersedes the CLAUDE.md "balance model is Python" convention** (which predated the testable JS core): the model can never drift from the game because it *is* the game.
**Rationale:** progression and the squeeze had no room in a one-year slice; coin was meaningless without the debt to contest it. The sim answers the balance questions with math instead of guesses and makes future world levers cheap to rebalance (drop the lever in, re-run). Numbers first-pass, owned by the sim; a noted follow-up is smoothing the lumpy cash income (2-season crops + no winter planting).

### D-053. Town is walked location-first; talks always pay off (or are free); a legibility grammar of Tiredness + stat tags + highlighted intel.
**Chosen (from playtest-driven UX passes):** the town is a **location-first walk** (spec `2026-07-30-legibility-and-town-walk-design.md`): the overview lists places; **walking to a place is free** and paints a scene, then **talking / taking a job costs one of the day's actions**, with an always-present **"Head back to the farm."** A talk with real content costs an action; a **"nothing new today" filler is free** (never a wasted action). Cause-and-effect is made legible: Reuben's condition reads as **Tiredness** with plain advice (fine to work / rest him soon / rest him now); **every action carries +/- stat tags** (all work tires, only rest recovers); and dialogue **intel is color-coded** by category (market gold / weather blue / omen red / people green / offer lamp). A persistent **"Actions today N/M"** counter and **"-1 action"** cost tags keep the action economy visible. The player's own do-nothing **Rest** action was removed (unspent actions carry no penalty).
**Rationale:** the loop was operable but not understandable; players feared wasting actions and could not read what choices did. These make the day legible and the town worth exploring without punishing curiosity.

---

*Add new decisions below with the next session number.*
