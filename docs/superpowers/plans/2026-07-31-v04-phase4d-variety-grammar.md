# v0.4 Phase 4D — The NPC & Job Variety Grammar (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax. One subagent per task; each is TDD then reviewed with a fix loop before commit. NEVER use em dashes or hyphen-as-pause in any prose or dialogue you write (hard project rule): use periods, commas, "to", or "and". Alt-1800s voice, no modern slang (project convention). The Unicode minus in numeric tags is fine.

**Goal:** No talk or job is ever a dead action. Every one resolves to a payoff, a choice that matters, or free flavor that costs nothing. Built on the existing scene engine, with four resolution `kind`s (payload / question / haggle / moral) and a deeper, rotating pool so replays vary. This is where the NPCs get more to say and the town stops being "pick the biggest coin."

**Design reference:** `docs/superpowers/specs/2026-07-30-v04-phase4-clarity-reward-clone-reveal-design.md` Part D (D1-D4). Settled with Chris: the hybrid (simple payloads + light interactions), applied broadly (talks, jobs, and beyond), with a deep pool for replay variety.

**Current system (verified):**
- **Talks:** `reducer.visit(s, npc)` opens `nextTownScene(s, npc)` (first unseen deck entry by standing, else the free small-talk filler), spends an action, grants `BALANCE.standing.perTalk` (12) standing. Each talk scene in `content/scenes.js` is `{ choices: ["go_on"], fx: {}, returnTo: "town" }` (a single dead choice, no payoff). Decks: `town.TALKS` (intro `minStanding:0`, deep `minStanding:12/30`); fillers: `town.SMALLTALK`.
- **Jobs:** `reducer.acceptJob(s, id)` adds `job.coin` and spends an action. No card, no choice. `town.ODD_JOBS` (id, giver, coin, line); `town.JOBS_PER_SEASON = 2`; `selectors.townOffers` surfaces a scarce, season-stable slice.
- **The scene engine** (`reducer.chooseScene`) applies per-choice `fx` (regard/coin/reckoning/larder/fuel/seed/strainAll/strainOne/loseHand) and sets `scene.result = choiceId`. `closeScene` routes `returnTo` ("town"/"run"). The `scene:` renderer shows the beat, the choices (with `fxTag`), then `L(id + "." + result + ".result")` after a choice. Prose lives in `content/script.yaml` (tokenized), read by `L("<id>.<field>")`.

**Design insight:** payload / question / moral kinds need NO new engine. They are just scenes with 2-4 real choices and meaningful `fx`. Only two things are genuinely new: (1) **haggle** (a seeded win/hold/sour roll on a choice), and (2) **jobs must open a card** (a scene) instead of instantly paying coin. Everything else is content authoring + rotation.

**Scope (this phase = the system + a solid first batch, deepenable as data later):**
- The engine additions (haggle roll; jobs-open-a-scene). 
- Every existing NPC talk reworked from a dead `go_on` into a real payoff/choice.
- A batch of NEW cards: at least one extra talk card per NPC and 5-6 job cards, spread across the four kinds.
- Rotation so a run shows a slice and replays reshuffle.
Deepening the pool further is ongoing data work (note 22), not blocked by this phase.

**Scope guard (defer):** the clone reveal (4E); a true event-telegraph coupling for "intel" (treat intel as a payload with a genuinely useful line + small reward for now); the market (no price system yet, so "market tip" intel is flavor).

---

## Task 1: The engine, the haggle roll and jobs-as-cards

**Files:** Modify `prototype2/src/core/reducer.js`, `src/core/state.js` (if a flag is needed); `tests/`.

- [ ] **Step 1: The haggle roll in `chooseScene`.** Support a scene whose chosen option gambles: a seeded roll picks an outcome (win/hold/sour), and THAT outcome's fx is applied and stored as the result. Add to the scene shape a `haggle` block, e.g.
  ```javascript
  // scenes.js entry:
  // some_haggle: { kind:"haggle", returnTo:"town", choices:["push","take"],
  //   fx:{ take:{coin:6} },
  //   haggle:{ on:"push", odds:{win:0.4, hold:0.4, sour:0.2},
  //            outcomes:{ win:{coin:12}, hold:{coin:6}, sour:{coin:2, regard:-2} } } }
  ```
  In `chooseScene`, when the chosen `choiceId === sc.haggle?.on`: consume `s.rngState` via `mulberry32` (mirror `maybeEvent`), pick an outcome by the `odds` weights, apply that outcome's `fx` (reuse the SAME fx application code, so factor it into a helper `applyFx(state, fx)` used by both the normal path and the haggle outcome), set `scene.result` to the OUTCOME id (e.g. "win"), and persist the new `rngState`. Non-haggle choices behave exactly as today. This keeps determinism (seed replays identically) and lets the renderer show `L(id + "." + outcome + ".result")`.
- [ ] **Step 2: Factor `applyFx`.** Extract the per-key fx application from `chooseScene` (regard/coin/reckoning/larder/fuel/seed/strainAll/strainOne/loseHand) into a pure helper `applyFx(state, fx) => state`, and call it from both the normal choice and the haggle outcome. No behavior change for existing scenes.
- [ ] **Step 3: Jobs open a card.** Change `acceptJob(s, id)` so that, instead of `coin += job.coin`, it OPENS the job's scene: spend the action, mark `jobsDoneThisSeason`, and set `phase:"scene", scene:{ id: job.scene, result:null }, screen:"home"`. The job's payoff now comes from that scene's choices (Task 2). Each `ODD_JOBS` entry gains a `scene` id (the job card). Keep the guards (day phase, actions left, not already done). `closeScene` for a job scene returns `returnTo:"town"`.
- [ ] **Step 4: Tests** (`tests/haggle.test.mjs`, extend `tests/town.test.mjs`):
  - Haggle: with a fixed seed, choosing the `on` option applies a deterministic outcome's fx and sets `scene.result` to that outcome id; a different seed can produce a different outcome; the safe option applies its own fx with no roll. Assert `rngState` advances.
  - `applyFx`: a direct unit test that it applies a multi-key fx correctly (e.g. `{coin:-6, regard:2}`), clamped like before.
  - Jobs: `acceptJob` now sets `phase:"scene"` with the job's scene id, spends an action, marks the job done, and does NOT add coin directly (the scene does). Update the old acceptJob test that asserted instant coin.
- [ ] **Step 5:** `cd prototype2 && npx vitest run` -> green (update the old acceptJob coin test). Report changes. Commit.
```bash
git add prototype2/src/core/ prototype2/tests/
git commit -m "feat(proto2): haggle roll + jobs open a card (variety-grammar engine) (v0.4 4D task 1)"
```

## Task 2: Jobs become tradeoff cards (content)

**Files:** Modify `prototype2/src/core/town.js` (ODD_JOBS gain `scene` + more jobs), `src/content/scenes.js` (job scenes), `content/script.yaml` (prose) + regen (`npm run gen:data` if it feeds script; NOTE scenes.js is hand-authored, script.yaml is prose read by `L`); `tests/`.

- [ ] **Step 1: Author 5-6 job cards across the kinds**, each a real tradeoff (not "pick the biggest coin"). Give each `ODD_JOBS` entry a `scene`. Spread across kinds:
  - **coin vs tiredness** (payload): pays well but a hand does the labor, so `+coin` and `+strainOne` (Tiredness, red). A "take it / leave it" choice.
  - **coin vs standing** (moral or payload): a job that pays less but earns standing with the giver, vs a colder option.
  - **a haggle**: dicker for the price (win = more coin, hold = the offer, sour = less or a bit of lost standing).
  - **a moral fork**: profit vs kindness (e.g. grave-digging done decently vs quick and disrespectful): the greedy branch pays more but nudges the reckoning (`+reckoning`) or costs regard; the kind branch pays less or costs but eases it.
  - Keep one or two simple **payload** jobs (a clean small payoff) so not every job is heavy.
- [ ] **Step 2: Write the job scenes** in `scenes.js` (choices + fx, `kind`, `returnTo:"town"`, the haggle block where used) and the prose in `content/script.yaml` (eyebrow/title/body + per-choice text/sub/result, tokenized, no dashes, alt-1800s voice). Bump `JOBS_PER_SEASON` if 2 feels too scarce now that jobs are richer (2-3, tune in Task 4).
- [ ] **Step 3:** Regen data if needed; wire the town render so accepting a job opens its card (should already work via `acceptJob` -> scene; verify the town job list still shows the `line` and cost tag).
- [ ] **Step 4: Tests + green.** Add a test that each `ODD_JOBS` entry has a `scene` that exists in `SCENES`, and that a job card's choices resolve (a haggle job produces an outcome). `npx vitest run` -> green. Report. Commit.
```bash
git add prototype2/src/core/town.js prototype2/src/content/scenes.js content/script.yaml prototype2/src/generated/ prototype2/tests/
git commit -m "feat(proto2): jobs become tradeoff cards across the four kinds (v0.4 4D task 2)"
```

## Task 3: Talks carry payoffs, and the deck deepens (content)

**Files:** Modify `prototype2/src/content/scenes.js` (rework talk scenes + add cards), `content/script.yaml` (prose), `src/core/town.js` (deeper TALKS decks); `tests/`.

- [ ] **Step 1: Rework every existing NPC talk** (the `*_intro` / `*_deep` scenes, currently `choices:["go_on"], fx:{}`) into a real payoff or choice. Options per NPC, matched to character:
  - a **payload**: intel you can act on (a genuinely useful line about the season, a hand, or the land) plus a small gift or standing.
  - a **question**: a prompt with 2-4 answers where a right answer pays (a bit of coin/seed/standing) and a wrong one is neutral or a small sour note (e.g. Old Nan's riddle, Doc's guess, the Preacher's test).
  - a **moral**: a small profit-vs-kindness fork in ordinary town life (the ethics surfacing before the clones).
  Keep the standing grant from `visit()`; the payoff is ON TOP. Keep the free small-talk fillers as the floor.
- [ ] **Step 2: Add a batch of NEW talk cards** to deepen the decks (at least one extra per NPC, gated by standing), in `town.TALKS`, `scenes.js`, and `script.yaml`. Use a mix of kinds so the town varies. New content only (locked roster, no new NPCs).
- [ ] **Step 3: Rotation for replay variety.** So a single run shows a slice and replays reshuffle: `nextTownScene` currently returns the first unseen by standing. Add a light rotation so which unseen same-standing card comes next varies by run (seed) rather than always deck order. Keep it deterministic (seed-based) and keep the no-repeat-within-a-run (`talksSeen`). Keep small-talk as the exhausted-deck floor.
- [ ] **Step 4: Tests + green.** Extend `tests/town.test.mjs` / talk tests: every talk scene id in `TALKS`/`SMALLTALK` exists in `SCENES` and has prose; a reworked talk applies its payoff fx on the paying choice; the rotation is deterministic for a fixed seed and never repeats within a run. `npx vitest run` -> green. Report. Commit.
```bash
git add prototype2/src/core/town.js prototype2/src/content/scenes.js content/script.yaml prototype2/src/generated/ prototype2/tests/
git commit -m "feat(proto2): talks carry payoffs, deeper rotating deck (v0.4 4D task 3)"
```

## Task 4: Render polish, sim, and browser verify

**Files:** `prototype2/src/render/screens.js` (scene renderer polish for the kinds), `sim/` if needed; verify.

- [ ] **Step 1: Render the kinds cleanly.** The `scene:` renderer already shows choices + `fxTag` + a result line, which covers payload/question/moral. For **haggle**, confirm the outcome result prose shows (the roll set `scene.result` to the outcome id, so `L(id + "." + outcome + ".result")` must exist for each outcome). If a haggle needs the stakes shown up front (odds as a hint), add a small line. Keep it within the existing scene screen (no new full screens).
- [ ] **Step 2: Sim.** Jobs now pay via scenes (coin moved into fx) and some cost tiredness / nudge reckoning. Run `node sim/run.js` + `npx vitest run tests/sim.test.mjs`. The economy must stay in band (careful survives, careless fails). If the sim policies accept jobs, they must now resolve the job SCENE (pick a choice) to get paid; update the policy to choose a sensible job-card option. Re-tune `JOBS_PER_SEASON` / job payoffs if coin drifts. Do not break the curve.
- [ ] **Step 3: Full suite green.** `npx vitest run` -> report counts.
- [ ] **Step 4: Browser verify.** New Game -> ride to town -> confirm: a talk now gives a real payoff or a choice that matters (not a dead "go on"); accepting a job opens a CARD with a tradeoff (try the haggle, see win/hold/sour; try the moral fork); the fx tags read correctly (4A) and the town no longer feels like "pick the biggest coin." Visit a few NPCs and confirm variety. Screenshot a job haggle card and a reworked talk. Fix console errors.
- [ ] **Step 5:** Commit verify fixes.
```bash
git add -A && git commit -m "fix(proto2): 4D render/sim/verify fixes"
```

---

## Self-Review notes (author)
- **Spec coverage (Part D):** D1 the four kinds -> Tasks 1-3 (haggle engine in 1; payload/question/moral are authored scenes in 2-3); D2 job tradeoffs -> Task 2; D3 deep rotating pool -> Task 3; D4 lull-fill -> richer jobs/talks give the season-pool somewhere to go.
- **Reuse over new machinery:** only haggle + jobs-as-scenes touch the engine; everything else is content on the existing scene grammar. `applyFx` is factored so haggle and normal choices share one code path.
- **Determinism:** the haggle roll and the talk rotation are seeded (rngState / seed), so runs replay identically and the sim stays deterministic.
- **Economy safety:** moving job coin into scene fx and adding tiredness/reckoning costs must go through the sim (Task 4) so the curve holds.
- **Voice:** all new dialogue is alt-1800s, no modern slang, no em dashes or hyphen-as-pause; tokenized so it flows through #45 names and the #46 docx round-trip.
- **Scope honesty:** this delivers the grammar + a first content batch; deepening the pool further is ongoing data work (note 22), not a blocker.
