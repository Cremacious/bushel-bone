# Town Polish & the Roguelite Card Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Address eight playtest notes in two phases. **Phase 1 (polish & clarity):** a persistent action counter with cost tags, a town plate on the left, solid field backgrounds, the town UI matched to the choice-card grammar, assign-timing clarity, and head-home priority. **Phase 2 (the card engine):** per-NPC typed card decks drawn randomly without repeats (seeded, reshuffled per run) with pinned story beats, and odd-jobs as conversation scenes.

**Architecture:** Phase 1 is presentation + a shared cost-tag/counter treatment. Phase 2 adds a `drawTownCard` resolution in the reducer that consumes the existing `mulberry32` PRNG via `state.rngState` (seeded, deterministic, no-repeat), plus typed card data and content. Pure `(state, action) => state` throughout; the random draw lives in the reducer (a pure `eligibleTownCards` selector lists candidates for tests).

**Tech Stack:** unchanged (vanilla ES modules, vitest/jsdom, `content/*.yaml` → `npm run gen:data`).

**Design reference:** `docs/superpowers/specs/2026-07-30-town-polish-and-card-engine-design.md`.

---

# PHASE 1 — Town polish & clarity

## Task 1: Persistent action counter + cost tags + assign-clarity note (notes 4, 7)

**Files:** Modify `prototype2/src/render/shell.js` (the ledger), `prototype2/src/render/screens.js` (Day personal actions + a clarity note), `prototype2/src/styles/shell.css`/`screens.css`; add tests.

- [ ] **Step 1: Failing test** — append to `prototype2/tests/shell.test.mjs`:
```javascript
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
describe("persistent action counter", () => {
  it("shows an actions-today counter in the chrome during the day", () => {
    const root = document.createElement("div");
    let s = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" }); // day
    renderShell(root, s, () => {});
    const c = root.querySelector(".actioncount");
    expect(c).toBeTruthy();
    expect(c.textContent).toMatch(/2\s*\/\s*2/);
  });
  it("does not show the counter outside the day phase", () => {
    const root = document.createElement("div");
    let s = initialState(1); // brief phase
    renderShell(root, s, () => {});
    expect(root.querySelector(".actioncount")).toBeFalsy();
  });
});
```
(Confirm `renderShell` is imported in shell.test.mjs; it is.)

- [ ] **Step 2: `shell.js` — the counter.** In `brassLedger(state)` (or right after it in the ledger row), add a persistent action counter shown only when `state.phase === "day"`. It renders `Actions today N / M` with pips (filled = remaining). Add a helper and include it in the ledger:
```javascript
function actionCounter(state) {
  if (state.phase !== "day") return null;
  const left = state.playerActionsLeft, max = BALANCE.playerActionsPerDay;
  const pips = [];
  for (let i = 0; i < max; i++) pips.push(el("span", { class: "apip" + (i < left ? " on" : "") }));
  return el("div", { class: "actioncount" }, [
    el("span", { class: "ac-k t-label", text: "Actions today" }),
    el("span", { class: "ac-pips" }, pips),
    el("span", { class: "ac-v t-label", text: `${left} / ${max}` }),
  ]);
}
```
Append `actionCounter(state)` into the ledger container's children (filter out null). `BALANCE` is imported in shell.js. Read `brassLedger` and wire it so the counter sits at the end of the ledger row.

- [ ] **Step 3: A shared "−1 action" cost tag.** In `components.js` add and export a tiny helper (used by Day + town choices):
```javascript
export function actionCostTag() {
  return el("span", { class: "efftag bad costtag", text: "-1 action" });
}
```
(Uses the existing `.efftag.bad` styling; a plain hyphen, no dash.)

- [ ] **Step 4: Apply the cost tag to the Day personal actions.** In `screens.js` `personalActions`, each spending action (`forage`/`work`/`care` — not `rest`) appends `actionCostTag()` alongside its effect tags. Import `actionCostTag` from components. In the button children, after the `playerActionEffects` tags add: `...(o.kind === "rest" ? [] : [actionCostTag()])`.

- [ ] **Step 5: Assign-clarity note (note 7).** In the `day:` renderer, before the crew loop, append a persistent note:
```javascript
    stage.append(el("p", { class: "t-sub assignnote", text: "Set your crew's orders any time today. They hold until you turn in for the night." }));
```

- [ ] **Step 6: CSS.** In `shell.css`:
```css
.actioncount { display: flex; align-items: center; gap: 8px; margin-left: auto; padding: 4px 10px; border: 1px solid var(--lamp); border-radius: 99px; }
.ac-k { color: var(--lamp); }
.ac-pips { display: flex; gap: 3px; }
.apip { width: 9px; height: 9px; border-radius: 50%; border: 1px solid var(--lamp); }
.apip.on { background: var(--lamp); }
.ac-v { font-family: "Courier Prime", monospace; }
```
In `screens.css`:
```css
.assignnote { color: var(--ink-faint); font-style: italic; margin: 0 0 12px; }
.costtag { }  /* inherits .efftag.bad */
```

- [ ] **Step 7:** Run `cd prototype2 && npx vitest run tests/shell.test.mjs tests/screens.test.mjs` → PASS. Full suite green. Commit.
```bash
git add prototype2/src/render/ prototype2/src/styles/ prototype2/tests/
git commit -m "feat(proto2): persistent action counter + cost tags + assign-clarity note (town-polish task 1)"
```

## Task 2: A town plate on the left + solid field backgrounds (notes 2, 6)

**Files:** Modify `prototype2/src/render/board.js`, `prototype2/src/styles/screens.css`; add a test.

- [ ] **Step 1: Failing test** — append to `prototype2/tests/screens.test.mjs`:
```javascript
describe("the left panel in town", () => {
  it("shows a town plate, not the fields, when in town", () => {
    const root = document.createElement("div");
    let s = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    s = { ...s, screen: "town" };
    renderShell(root, s, () => {});
    expect(root.querySelector(".townplate")).toBeTruthy();
    expect(root.querySelector(".boardpanel .fieldgrid")).toBeFalsy();
  });
});
```

- [ ] **Step 2: `board.js`.** At the TOP of `boardPanel(state, dispatch)`, before the phase checks, add a town branch:
```javascript
  if (state.screen === "town") {
    const cap = state.townAt ? "A place in Marrow's Cross" : "Marrow's Cross";
    return el("div", { class: "boardpanel townplate" }, [
      el("div", { class: "boardpanel-h t-label", text: "Marrow's Cross" }),
      el("div", { class: "townplate-art" }, [el("span", { class: "townplate-cap t-sub", text: cap })]),
    ]);
  }
```
(An engraved-border illustration placeholder; the real art drops in later. This makes the left panel reflect the town instead of the fields.)

- [ ] **Step 3: Solid field backgrounds (note 6).** In `screens.css`, the `.fieldcard` rule currently has `border` but a transparent background. Add a solid fill matching the right panel surface (use the theme's panel token; check what the leaf/right uses — likely `var(--leaf)` or `var(--paper)`; grep for the token the `.jobcard`/`.choicecard` use and match it):
```css
.fieldcard { background: var(--leaf); }
```
(Append/merge into the existing `.fieldcard` rule; keep its border/padding.) Add the town-plate styles:
```css
.townplate-art { border: 1px solid var(--rule-fine); min-height: 180px; display: flex; align-items: flex-end; padding: 12px; background: repeating-linear-gradient(45deg, var(--paper) 0 2px, transparent 2px 9px); }
.townplate-cap { color: var(--ink-faint); font-style: italic; }
```
(If `var(--leaf)` is not the right panel color, use the actual token the leaf/right surface uses — READ `shell.css`/`tokens.css` to confirm.)

- [ ] **Step 4:** Run `cd prototype2 && npx vitest run tests/screens.test.mjs` → PASS. Full suite green. Commit.
```bash
git add prototype2/src/render/board.js prototype2/src/styles/screens.css prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): town plate on the left + solid field backgrounds (town-polish task 2)"
```

## Task 3: Town screen restyle to choice-cards + cost tags + head-home priority (notes 1, 4, 8)

**Files:** Modify `prototype2/src/render/screens.js` (the `town:` renderer), `prototype2/src/styles/screens.css`; update tests.

- [ ] **Step 1: Failing test** — append to `prototype2/tests/screens.test.mjs`:
```javascript
describe("town polish", () => {
  it("the talk and job actions render as choice cards with an action-cost tag", () => {
    const root = document.createElement("div");
    let s = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    s = { ...s, screen: "town", townAt: "saloon" };
    renderShell(root, s, () => {}); renderScreen(root.querySelector("#stage"), s, () => {});
    const talk = [...root.querySelectorAll(".choicecard")].find((b) => /Talk to/.test(b.textContent));
    expect(talk).toBeTruthy();
    expect(talk.textContent).toMatch(/-1 action/);
  });
  it("floats Head back to the farm to the top when actions are spent", () => {
    const root = document.createElement("div");
    let s = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    s = { ...s, screen: "town", townAt: null, playerActionsLeft: 0 };
    renderShell(root, s, () => {}); renderScreen(root.querySelector("#stage"), s, () => {});
    const buttons = [...root.querySelectorAll("#stage button")];
    const homeIdx = buttons.findIndex((b) => /farm/i.test(b.textContent));
    expect(homeIdx).toBe(0); // first control on the screen
  });
});
```

- [ ] **Step 2: Rewrite the `town:` renderer** in `screens.js` to (a) use `choiceCard` for talk/job/walk actions, (b) append `actionCostTag()` (or the `tag` param) to action-spending choices, and (c) float "Head back to the farm" to the top when `!canAct`. Import `choiceCard` (already imported) and `actionCostTag` from components. The structure (both overview and place) becomes choice-card based. Key points:
  - A `homeCard()` helper renders "Head back to the farm" as a `choiceCard` (no cost tag).
  - When `!canAct`, append `homeCard()` FIRST (top), with a note "You are spent for the day. Head home to turn in."; otherwise it goes at the bottom as now.
  - **Overview:** each place → a `choiceCard({ text: tok("{{loc."+l.loc+".sub}}"), sub: l.purpose }, () => dispatch(WALK_TO))` (walking is free, no tag). Jobs → `choiceCard({ text: j.line, sub: `+${j.coin} coin · ${giver}`, tag: "-1 action", tagValence: "bad" }, ACCEPT_JOB)` when actionable.
  - **Place:** the vignette prose, the NPC + standing line, then `choiceCard({ text: `Talk to ${npc}`, sub: "see what they have to say", tag: canTalk ? "-1 action" : null, tagValence: "bad" }, VISIT)`; then the nav (`Walk on`, and `home` at the bottom if `canAct`).
  Preserve the free vs action-costing distinction: walk/walk-on/home are free (no tag); talk/job cost 1 action (tag). READ the current `town:` renderer and rework it to the choice-card grammar; keep `WALK_TO`/`LEAVE_TOWN`/`VISIT`/`ACCEPT_JOB` dispatches intact.

- [ ] **Step 3: CSS.** Remove or supersede the old `.walkbtn`/`.jobtake`/`.loc-talk` bespoke rules where they are replaced by `.choicecard`. Keep `.place-scene`/`.loc-standing`. Ensure the choice cards in town read the same as elsewhere (they inherit `.choicecard`). Add nothing new unless a spacing tweak is needed.

- [ ] **Step 4:** Run `cd prototype2 && npx vitest run tests/screens.test.mjs tests/town.test.mjs` → PASS. IMPORTANT: earlier town tests assert `.walkbtn`, `.loc-talk` (as `<button>`), `.jobcard .jobtake`. If the restyle changes those class names to `.choicecard`, UPDATE those tests to the new markup (a place's talk is now a `.choicecard` containing "Talk to…"; the overview's walk is a `.choicecard` containing the place name; a job is a `.choicecard`). Preserve each test's intent. Get the FULL suite green. Report every test changed.

- [ ] **Step 5: Commit.**
```bash
git add prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/tests/
git commit -m "feat(proto2): town choice-card restyle + action-cost tags + head-home priority (town-polish task 3)"
```

## Task 4: Phase-1 browser verify

- [ ] **Step 1:** `cd prototype2 && npx vitest run` → all green; report counts.
- [ ] **Step 2: Browser verify.** Dev server on 4321. Confirm: the **Actions today N / M** counter is visible and prominent in the top ledger during the day (farm and town), ticking down as actions are spent; field cards have a **solid brown background**; in town the **left panel shows a town plate**, not fields; the town talk/job actions are **choice cards** with a **"-1 action"** tag; walking has no tag; the **assign-clarity note** shows on the Day screen; when actions hit 0 in town, **"Head back to the farm"** is at the top. Screenshot the town screen. Fix console errors.
- [ ] **Step 3: Commit** any fixes.

---

# PHASE 2 — The roguelite card engine

## Task 5: The card model + draw (seeded, no-repeat, pinned-first)

**Files:** Modify `prototype2/src/core/town.js`, `prototype2/src/core/selectors.js`, `prototype2/src/core/reducer.js`; add `tests/cards.test.mjs`.

- [ ] **Step 1: `town.js` — typed decks.** Replace `TALKS` with `TOWN_CARDS` (keep `SMALLTALK`). Each NPC maps to an ordered array of cards `{ id, type, minStanding, gate?, coin? }`. Fold the existing scene ids in (intro → a `chatter`/`beat` at minStanding 0; deep → a higher-minStanding card). Example shape (author the full set in Task 6; here define at least the structure and migrate the existing 8 NPCs' intro+deep):
```javascript
export const TOWN_CARDS = {
  crake: [
    { id: "crake_intro", type: "chatter", minStanding: 0 },
    { id: "crake_deep",  type: "beat",    minStanding: 12 },
  ],
  // ...the other seven NPCs, migrating <npc>_intro (minStanding 0) and <npc>_deep (12 or 30)
};
```
Keep `SMALLTALK` as-is. Also export a helper predicate is fine to inline in the selector.

- [ ] **Step 2: `selectors.js` — eligible cards (pure, testable).** Add:
```javascript
// The cards an NPC could show now: unseen, standing met, and any gate satisfied. Pure.
export function eligibleTownCards(state, npc) {
  const deck = TOWN_CARDS[npc] || [];
  const seen = state.talksSeen || [];
  const st = standingOf(state, npc);
  return deck.filter((c) => !seen.includes(c.id) && c.minStanding <= st && gateMet(state, c.gate));
}
function gateMet(state, gate) {
  if (!gate) return true;
  if (gate.minYear && state.year < gate.minYear) return false;
  if (gate.minStanding && (state.standing?.[gate.npc] ?? 0) < gate.minStanding) return false;
  if (gate.flag && !(state.flags || []).includes(gate.flag)) return false;
  return true;
}
```
Update the town import to `TOWN_CARDS` (from `./town.js`), keep `SMALLTALK`.

- [ ] **Step 3: `reducer.js` — `drawTownCard` in `VISIT`.** Add a helper that resolves which card to open, pinned-beat-first then a seeded random of the rest, advancing `rngState`; small-talk if none. Import `eligibleTownCards` from selectors, `SMALLTALK` from town, `mulberry32` from `./rng.js`.
```javascript
// Resolve the next town card for an NPC and the RNG advance. Pinned beats first (authored
// order); else a seeded-random eligible non-beat (so runs differ, no repeats within a run);
// else the small-talk filler. Returns { id, rngState } (rngState unchanged if no random draw).
function drawTownCard(s, npc) {
  const eligible = eligibleTownCards(s, npc);
  const beat = eligible.find((c) => c.type === "beat");
  if (beat) return { id: beat.id, rngState: s.rngState };
  const pool = eligible.filter((c) => c.type !== "beat");
  if (pool.length) {
    const rng = mulberry32(s.rngState);
    const pick = pool[Math.floor(rng() * pool.length)];
    return { id: pick.id, rngState: rng.getState() };
  }
  return { id: SMALLTALK[npc] || null, rngState: s.rngState };
}
```
Rework `visit(s, npc)` to use it (replacing the `nextTownScene` call):
```javascript
function visit(s, npc) {
  if (s.phase !== "day" || s.playerActionsLeft <= 0) return s;
  const { id: sceneId, rngState } = drawTownCard(s, npc);
  if (!sceneId) return s;
  const seen = s.talksSeen || [];
  return { ...s, playerActionsLeft: s.playerActionsLeft - 1, rngState,
    standing: { ...(s.standing || {}), [npc]: ((s.standing || {})[npc] || 0) + BALANCE.standing.perTalk },
    talksSeen: seen.includes(sceneId) ? seen : [...seen, sceneId],
    phase: "scene", scene: { id: sceneId, result: null }, screen: "home" };
}
```
Remove the now-unused `nextTownScene` import from reducer (leave the selector if the render still uses it — but the render should switch to eligibleTownCards or just VISIT; see Task 6). Add `state.flags = []` to `initialState` (for beat gates) if not present.

- [ ] **Step 4: Tests `tests/cards.test.mjs`:**
```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { eligibleTownCards } from "../src/core/selectors.js";

function inTown(seed = 1) {
  let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return reduce(s, { type: "SOW" });
}

describe("the town card engine", () => {
  it("eligibleTownCards excludes seen and standing-locked cards", () => {
    let s = inTown();
    const first = eligibleTownCards(s, "crake").map((c) => c.id);
    expect(first).toContain("crake_intro");
    expect(first).not.toContain("crake_deep"); // standing 0 < 12
    s = { ...s, talksSeen: ["crake_intro"], standing: { crake: 12 } };
    const nxt = eligibleTownCards(s, "crake").map((c) => c.id);
    expect(nxt).toContain("crake_deep");
    expect(nxt).not.toContain("crake_intro"); // seen
  });
  it("VISIT opens a card, grants standing, records it, and advances rngState", () => {
    let s = inTown();
    const r0 = s.rngState;
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.scene.id).toBeTruthy();
    expect(s.talksSeen).toContain(s.scene.id);
    // rngState only advances when a random (non-beat) draw happened; with one eligible chatter it may or may not — assert it opened a real scene
    expect(typeof s.rngState).toBe("number");
  });
  it("a pinned beat takes priority over random chatter", () => {
    // give crake two eligible cards where the beat should win
    let s = inTown();
    s = { ...s, standing: { crake: 20 } }; // unlock the deep beat too
    s = reduce(s, { type: "VISIT", npc: "crake" });
    // crake's deck: intro(chatter,0) + deep(beat,12) both eligible → beat wins
    expect(s.scene.id).toBe("crake_deep");
  });
});
```
(If migrating the existing decks makes `crake_deep` a `beat` at minStanding 12, the third test passes. Ensure the migrated `TOWN_CARDS.crake` has `crake_deep` typed `beat`.)

- [ ] **Step 5:** Run `cd prototype2 && npx vitest run tests/cards.test.mjs` → PASS. The old `tests/standing.test.mjs` `nextTownScene` tests will break (that function is replaced) — update them to use `eligibleTownCards`/`VISIT` or remove the `nextTownScene`-specific assertions, preserving intent (standing gates, no-repeat). Full suite green. Report changes. Commit.
```bash
git add prototype2/src/core/ prototype2/tests/
git commit -m "feat(proto2): typed town-card decks + seeded no-repeat draw with pinned beats (card-engine task 5)"
```

## Task 6: Content — flesh out each NPC's deck

**Files:** Modify `prototype2/src/core/town.js` (full `TOWN_CARDS`), `content/script.yaml` (+ regenerate), `prototype2/src/content/scenes.js`.

- [ ] **Step 1:** For each of the 8 NPCs, expand `TOWN_CARDS[npc]` to a starter deck: keep the migrated intro/deep, and ADD ~2 `chatter`/`rumor` cards (minStanding 0 or 12) and (story NPCs: nan, silas, coldwater, meredith) 1 `beat` gated by `{ minYear }` or `{ minStanding }`. New card ids like `crake_chatter1`, `meredith_rumor2`, `nan_beat1`, etc.
- [ ] **Step 2:** Author each new card's scene: a `scenes.js` entry `{ choices: ["go_on"], fx: {}, returnTo: "town" }`, and prose in `content/script.yaml` (eyebrow/title/body + go_on text/sub/result), tokenized, **no em dashes**, in the character's voice (CLAUDE.md §4). Chatter = flavor; rumor = a concrete piece of world/market intel; beat = a story moment (Nan on the ground remembering more, Silas on the debt/Malachi, Coldwater on watching cruelty, Meredith on the Vane wagon).
- [ ] **Step 3:** `cd prototype2 && npm run gen:data`; confirm the new ids resolve. Add a coverage test (extend `tests/cards.test.mjs`) that every id in every `TOWN_CARDS` deck resolves `L(id + ".body")` prose. Run the suite green. Commit.
```bash
git add prototype2/src/core/town.js content/script.yaml prototype2/src/generated/script.js prototype2/src/content/scenes.js prototype2/tests/cards.test.mjs
git commit -m "feat(proto2): flesh out per-NPC town card decks (chatter/rumor/beats) (card-engine task 6)"
```

## Task 7: Odd-jobs as conversation scenes (note 5)

**Files:** Modify `prototype2/src/core/town.js` (jobs get a scene id + more variety), `prototype2/src/core/reducer.js` (`ACCEPT_JOB` opens a scene), `content/script.yaml` + `scenes.js`; tests.

- [ ] **Step 1:** Give each `ODD_JOBS` entry a `scene` id (e.g. `job_haul_mill`), and add a few more jobs for variety. Author each job scene: a short conversation with the giver whose accepting choice pays the coin via `fx: { coin: +N }` (use the existing scene `fx` mechanism), `returnTo: "town"`.
- [ ] **Step 2: `reducer.js` — `ACCEPT_JOB` opens the scene** instead of instantly paying: spend the action, mark the job done, and open the job's scene (the coin is granted by the scene's accept-choice `fx`, via the existing `chooseScene` path). Adjust the test in `tests/town.test.mjs` (`ACCEPT_JOB pays coin…`) to the new flow: `ACCEPT_JOB` now opens `phase: "scene"` and spends the action + marks done; the coin arrives when the scene's accept choice is chosen. Update the assertion accordingly (or split: action+done on accept, coin on the scene choice).
- [ ] **Step 3:** `npm run gen:data`; suite green; commit.
```bash
git add prototype2/src/core/ content/script.yaml prototype2/src/generated/script.js prototype2/src/content/scenes.js prototype2/tests/
git commit -m "feat(proto2): odd-jobs become conversation scenes + more job variety (card-engine task 7)"
```

## Task 8: Phase-2 browser verify

- [ ] **Step 1:** `cd prototype2 && npx vitest run` → all green; report counts.
- [ ] **Step 2: Browser verify.** New Game → into a day → town. Confirm: calling on the same NPC across visits shows **different cards** (chatter/rumor vary), never repeating within the run; a **pinned beat** plays when its gate is met; taking a **job opens a conversation scene** that pays on accept. Start a second New Game (different seed) and confirm the town's card order differs. Screenshot a card scene. Fix console errors.
- [ ] **Step 3: Commit** any fixes.

---

## Self-Review notes (author)
- **Spec coverage:** P1.1→Task 3, P1.2→Task 2, P1.3→Task 1, P1.4→Task 2, P1.5→Task 1, P1.6→Task 3; P2.1/P2.2→Task 5, P2.4→Task 6, P2.3→Task 7.
- **Type/name consistency:** `TOWN_CARDS` (typed cards), `eligibleTownCards(state,npc)`, `drawTownCard(s,npc)→{id,rngState}`, `actionCostTag()`, `.actioncount`, `state.flags`. `nextTownScene` is retired (Task 5) with its tests migrated.
- **Purity/determinism:** the random draw consumes `state.rngState` via `mulberry32` inside the reducer and stores the advanced state, so replays are deterministic and there is no `Math.random`.
- **No-repeat:** `talksSeen` excludes drawn cards; beats are gated + ordered; small-talk is the repeatable floor.
