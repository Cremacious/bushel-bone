# v0.4 Phase 4E — The Scripted Clone Reveal (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax. One subagent per task; each is TDD then reviewed with a fix loop before commit. NEVER use em dashes or hyphen-as-pause in any prose (hard project rule): use periods, commas, "to", or "and". Voice: alt-1800s, dark, restrained, no modern slang. Adult but not gratuitous. This is canon narrative, so write with care.

**Goal:** Introduce the clones, the game's ethical heart, as a scripted Year-1 sequence: a forced early nudge to seek hands in town, a masked wagon (no spoiler), and a reveal scene where the "hired hands" turn out to be grown, not born, which is the first spark of Regard and the moral debt. Settled with Chris: scripted, nudged before the player can stumble onto it, and the town must NOT spoil it (today it reads "Vane's wagon / clone hands, for a price").

**Design reference:** `docs/superpowers/specs/2026-07-30-v04-phase4-clarity-reward-clone-reveal-design.md` Part E (E1-E4).

**Current wagon setup (verified):**
- `town.js` `LOCATIONS`: `{ id:"wagon", npc:"ambrose", loc:"wagon", purpose:"clone hands, for a price" }` (the spoiler line). `names.js` wagon sub = "{{term.vane}}'s wagon".
- `screens.js` town place view (~351): when `l.npc === "ambrose"`, shows a "Hire a hand" / sub "a clone from the wagon" card (spoiler sub), gated by `canHire(s)`, dispatching `HIRE`. `hireCost`/`canHire` in selectors; `reducer.hire` adds a hand.
- `scenes.js` `openingSceneId(state)` returns `"silas_welcome"` for Year 1 Spring (the day-1 caller). A comment notes scripted-beat scheduling is a future thing; this phase adds its first real piece.
- `state.js` `initialState`: the whole state is one serializable object (new fields persist automatically; read them with `|| false` / `|| []` fallbacks for old saves). `SOW` lands the player on the Year-1 Spring day-1 beat (4B).
- NOTE: an OLD `vane_wagon` scene exists in `script.yaml` (frozen `year1.html`). Use a FRESH id `vane_reveal` for proto2's reveal to avoid a DUPLICATE_KEY collision.

**Scope guard (defer):** the Old Well beats, the earned reunion, the Codex truth field (all production-port scope per the founder-story canon). This phase is the Year-1 reveal + a content push only.

---

## Task 1: The reveal mechanism (state, masking, gating, triggers)

**Files:** Modify `prototype2/src/core/state.js`, `reducer.js`, `src/core/town.js`, `src/render/screens.js`; `tests/`. Uses placeholder scene stubs so the mechanism is testable; Task 2 authors the prose.

- [ ] **Step 1: State.** In `initialState` add `cloneRevealed: false` and `scriptSeen: []`. Everywhere they are read, tolerate absence (`s.cloneRevealed === true`, `(s.scriptSeen || [])`).
- [ ] **Step 2: Mask the wagon (E1).** In `town.js`, change the wagon `purpose` to a neutral line, e.g. `"a black wagon, newly come to the Cross"` (no "clone"). In `screens.js`, the wagon place view (`l.npc === "ambrose"`):
  - When `!s.cloneRevealed`: show a single **"Approach the wagon"** card (sub neutral, e.g. "lanterns, and the canvas drawn close"), FREE (no action cost, so the reveal is never blocked), dispatching `{ type:"REVEAL_WAGON" }`. Do NOT show the Hire card, and do not show the "a clone from the wagon" sub.
  - When `s.cloneRevealed`: show the Hire card exactly as today (hireCost, canHire, sub can stay "a clone from the wagon" now that it is known).
- [ ] **Step 3: `REVEAL_WAGON` opens the reveal scene.** Add a reducer case: `REVEAL_WAGON` opens the `vane_reveal` scene (`phase:"scene", scene:{ id:"vane_reveal", result:null }, screen:"home"`). Guard: only if `!s.cloneRevealed`.
- [ ] **Step 4: The reveal sets the flag on close.** In `closeScene`, if the closing scene has `revealsClones: true`, set `cloneRevealed: true` on the returned state. Add `vane_reveal` to `SCENES` with `{ revealsClones: true, returnTo: "town", choices: [...] }` (placeholder choices for now; Task 2 finalizes the choices/fx and the first regard/reckoning framing).
- [ ] **Step 5: The nudge trigger (E2).** Add `pendingScript(state)`: returns `"reuben_hands"` when `state.year === 1 && state.seasonIndex === 0 && !(state.scriptSeen||[]).includes("reuben_hands") && !state.cloneRevealed`, else null. Add `maybeScript(s)` (mirrors `maybeEvent`): if `pendingScript(s)` is owed and `s.phase === "day"`, open that scene (`phase:"scene", scene:{id, result:null}`) and add the id to `scriptSeen` so it fires once. Call `maybeScript` at the END of `SOW` (after it lands on the day-1 beat), so the nudge fires right after planting, before the player rides to town. Add `reuben_hands` to `SCENES` (`{ returnTo:"run", choices:["go_on"] }` placeholder; Task 2 writes it). Its `closeScene` returns to the day beat.
- [ ] **Step 6: Tests** (`tests/clone-reveal.test.mjs`):
  - Masking/gating: with `cloneRevealed:false`, the town wagon view offers "Approach the wagon" and NO hire (assert via the render or a selector); after `REVEAL_WAGON` then closing `vane_reveal`, `cloneRevealed === true` and the hire affordance returns.
  - `REVEAL_WAGON` opens `vane_reveal`; closing a `revealsClones` scene sets the flag.
  - Nudge: after `SOW` in Year 1 Spring, `pendingScript` fired `reuben_hands` (phase scene, scene id reuben_hands, scriptSeen includes it); it does NOT fire again on a later season; it does not fire once `cloneRevealed`.
- [ ] **Step 7:** `cd prototype2 && npx vitest run` -> green (SOW now can open the nudge scene; update any SOW test that asserted phase "day" immediately after SOW to account for the Year-1 Spring nudge, e.g. by testing SOW in a non-nudge state or resolving the nudge). Report changes. Commit.
```bash
git add prototype2/src/core/ prototype2/src/render/screens.js prototype2/tests/clone-reveal.test.mjs
git commit -m "feat(proto2): clone-reveal mechanism (mask, gate, nudge trigger) (v0.4 4E task 1)"
```

## Task 2: Author the nudge and the reveal (content)

**Files:** Modify `prototype2/src/content/scenes.js` (finalize the two scenes' choices/fx), `content/script.yaml` (prose) + regen; `tests/`.

- [ ] **Step 1: `reuben_hands` (the nudge).** A short Reuben scene, fired once early Year 1: the ground is too much for the two of you, and there is a man in town who deals in hands. Reuben's voice (weary, plain, a little wary of the wagon). One choice ("go on"), a `.result` that points the player to town/the wagon. Tokenized, no dashes. It should motivate without over-explaining.
- [ ] **Step 2: `vane_reveal` (the reveal).** The scene where the player, come for hired laborers, meets Dr. Ambrose Vane and his "stock" and understands these are grown, not born. The prose does the ethical work: they have the look of people, they do not yet know their own names, something in the ground shifts. This is the FIRST framing of Regard and the moral debt. Give it a real choice that plants the ethics, e.g.:
  - a **kind** framing (you will treat them as people / meet her eyes): a small `{regard:+2}` and, if you like, easing the hidden reckoning slightly (`{reckoning:-1}`).
  - a **cold** framing (they are stock, bought and fed): `{regard:-2}` and a nudge to the hidden reckoning (`{reckoning:+2}`).
  Keep `revealsClones: true` and `returnTo:"town"`. After it, hiring is open. Do NOT state a reckoning number (D-027); let the prose carry the unease. Eerie, restrained, not gratuitous.
- [ ] **Step 3:** Regen if needed (`npm run gen:data`); confirm the drift guard passes. Verify no `{{` leaks and no dashes.
- [ ] **Step 4: Tests + green.** Both scenes exist in `SCENES` with prose (title, body, per-choice text/result), resolve, and `vane_reveal` sets `cloneRevealed`. The reveal's kind choice applies its regard/reckoning fx. `npx vitest run` -> green. Report. Commit.
```bash
git add prototype2/src/content/scenes.js content/script.yaml prototype2/src/generated/script.js prototype2/tests/
git commit -m "feat(proto2): the clone reveal, its nudge, and the first moral framing (v0.4 4E task 2)"
```

## Task 3: The content push (more events for variety)

**Files:** Modify `prototype2/src/core/events.js` (deck), `src/content/scenes.js` (event mechanics), `content/script.yaml` (prose) + regen; `tests/`.

- [ ] **Step 1: Add 3-4 new event cards** across families to deepen the deck (currently 8), so a run draws a fresher mix and replays vary (note 22). Suggestions (author in voice, modest fx, threats telegraphed where fair): a **wildlife** card (crows on the seed, a deer in the greens), a **town** card (a buyer's rumor, a festival notice), a **weather** card (a dry spell, a hard wind), and one **reckoning** card (a small omen, hidden `+reckoning` on the wrong choice). Follow the existing `EVENTS` entry shape (`{id, family, gate?}`) and the scene shape (`{event:true, returnTo:"run", choices, fx}`), with prose in `script.yaml`. Use fresh ids that do not collide with the frozen `year1.html` scenes in `script.yaml` (grep first).
- [ ] **Step 2: Tests + green.** Each new event id is in `EVENTS`, has a scene in `SCENES` and prose, and is eligible; the no-repeat + gate logic still holds. `npx vitest run` -> green. Report. Commit.
```bash
git add prototype2/src/core/events.js prototype2/src/content/scenes.js content/script.yaml prototype2/src/generated/script.js prototype2/tests/
git commit -m "feat(proto2): more event cards for deck variety (v0.4 4E task 3)"
```

## Task 4: Sim, browser verify, and docs

**Files:** `prototype2/sim/policies.js` (reveal-then-hire), verify; `context/session-history.md`, `CLAUDE.md`.

- [ ] **Step 1: Sim.** The sim policies HIRE at the wagon; hiring is now gated behind the reveal. Update the sim so a policy that wants to hire first triggers `REVEAL_WAGON` and resolves `vane_reveal` (pick a framing) before `HIRE`. Run `node sim/run.js` + `npx vitest run tests/sim.test.mjs`; the curve must hold (the reveal is free, so no economic drift beyond the reveal's small regard/reckoning fx). Do not retune balance.
- [ ] **Step 2: Full suite green.** `cd prototype2 && npx vitest run` -> report counts.
- [ ] **Step 3: Browser verify.** New Game -> after planting/Sow in Spring, confirm the **`reuben_hands` nudge** fires (Reuben points you to town). Ride to town -> the wagon reads a **neutral** line (no "clone hands") and offers **"Approach the wagon"**, NOT hire. Approach -> the **`vane_reveal`** scene plays and lands the clones; pick a framing. Back at the wagon, **hiring is now open** and the label is honest. Confirm the fx tags read right and no `{{` leaks. Screenshot the reveal scene. Fix console errors.
- [ ] **Step 4: Docs.** Add a Session entry to `context/session-history.md` summarizing the whole v0.4 Phase 4 arc (4A vocabulary, 4B pool/timing + opening beat, 4C visual/info, 4D variety grammar, 4E clone reveal). Update the CLAUDE.md status block and its "Last updated" footer. Commit.
```bash
git add prototype2/sim/ context/session-history.md CLAUDE.md
git commit -m "docs(proto2): v0.4 Phase 4 complete (clarity, variety, the clone reveal)"
```

---

## Self-Review notes (author)
- **Spec coverage (Part E):** E1 mask/gate -> Task 1 Steps 2-4; E2 nudge -> Task 1 Step 5 + Task 2 Step 1; E3 reveal -> Task 1 Steps 3-4 + Task 2 Step 2; E4 content push -> Task 3.
- **Reveal is guaranteed:** the wagon is masked and gated, and the nudge fires once on Sow before the player rides to town; approaching the wagon (free) always plays the reveal. A player who ignores the nudge still gets the reveal on their first wagon approach.
- **No spoiler:** the town line and hire sub are gated behind `cloneRevealed`; the word "clone" first appears in the reveal scene.
- **Determinism/economy:** the nudge is scripted (not random), the reveal is free; the sim only needs the reveal-then-hire order, no rebalance.
- **No collisions:** `vane_reveal` / `reuben_hands` and any new event ids are fresh (grep the frozen `year1.html` scenes in `script.yaml` first).
- **Voice + hidden reckoning:** the reveal carries the ethics in prose, no reckoning number surfaced (D-027); alt-1800s, no dashes, tokenized.
