# Town Exploration & Standing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make Marrow's Cross the thing you *explore* with your day. Surface **"Ride to town"** on the Day screen so your two actions have somewhere to go; give all eight townsfolk talks; and add **per-NPC standing** that rises as you call on people and **unlocks deeper scenes** over time, drawn from a **rotating deck** so repeat visits reveal new lines instead of the same intro.

**Architecture:** Additive on Phase B. The pure core gains a `standing` map and a `talksSeen` list on state, a `nextTownScene(state, npc)` selector that picks which of an NPC's deck to play (first unseen scene at/under current standing, else a rotating small-talk filler), and a reworked `VISIT {npc}` that resolves the scene, grants standing, and records it. Content: each NPC gets a talk deck (`content/town.js` decks + `content/script.yaml` prose + `scenes.js` mechanics). Render: a "Ride to Marrow's Cross" affordance on the Day screen, and per-NPC standing shown on the Town screen. Pure `(state, action) => state` throughout.

**Tech Stack:** unchanged (vanilla ES modules, vitest/jsdom, the `content/*.yaml` → `npm run gen:data` pipeline).

**Design reference:** overhaul spec §9 (town/exploration) and §10 (NPC roster). Standing numbers are first-pass (Q-003): `STANDING_PER_TALK = 12`, tiers Stranger `<15` / Known `<40` / Friendly `<70` / Close `≥70`, deeper scenes gated at `minStanding` 12 and 30.

**Scope guard (defer):** favor requests, multi-visit story threads (Nan's reckoning intel, the Vane mystery), gifts, and standing that gates *shops/prices* — later. This phase is exploration + standing + content only. Odd-jobs (Phase B) are unchanged.

---

## The exploration model

- **Standing** `state.standing[npcId]` (integer, starts 0). Calling on an NPC grants `STANDING_PER_TALK`. Shown to the player as a tier word.
- **Talk decks** (`content/town.js`): `TALKS[npcId] = [{ id, minStanding }, ...]`, ordered intro-first. Every NPC has an intro (`minStanding: 0`) and at least one deeper scene.
- **Picking a scene** (`nextTownScene`): the first deck entry **not** in `state.talksSeen` whose `minStanding <= standing[npc]`. If none (all available seen), a **small-talk filler** scene for that NPC (a short, flavorful "nothing new" line), chosen deterministically by day so it rotates.
- **VISIT {npc}**: spend one day action (gated to the `day` phase, like Phase B), resolve the scene via `nextTownScene`, mark it seen, grant standing, open it. Closing returns to the Town tab (existing `returnTo: "town"`).

---

## File Structure

```
content/
  town.yaml? NO — town decks live in code (src/core/town.js); prose lives in content/script.yaml
  script.yaml      # MODIFY — talk prose for all 8 NPCs (intro + deeper + smalltalk)
prototype2/src/core/
  town.js          # MODIFY — TALKS decks (npc → ordered scene ids + minStanding) + SMALLTALK map
  state.js         # MODIFY — standing: {}, talksSeen: []
  balance.js       # MODIFY — STANDING_PER_TALK, standing tier cut points
  selectors.js     # MODIFY — nextTownScene(state, npc); standingOf(state, npc); standingWord(v)
  reducer.js       # MODIFY — VISIT {npc} resolves scene + grants standing + records seen
prototype2/src/content/
  scenes.js        # MODIFY — every talk scene id present with { choices:["go_on"], returnTo:"town" }
  tips.js          # MODIFY — town tip mentions calling on folk / standing
prototype2/src/render/
  screens.js       # MODIFY — Day screen "Ride to town"; Town screen shows standing + "Call on them" per NPC
prototype2/tests/
  standing.test.mjs   # NEW — standing grant, nextTownScene progression, VISIT-by-npc, tiers
  (town|screens).test.mjs  # MODIFY — VISIT now takes {npc}
```

---

## Task 1: State, balance, selectors — standing + scene selection

**Files:** Modify `state.js`, `balance.js`, `selectors.js`, `town.js`; create `tests/standing.test.mjs`.

- [ ] **Step 1: `town.js`** — add the talk decks and small-talk fillers. Append:
```javascript
// Each NPC's talk deck: ordered intro-first, each gated by a minStanding (0 = always). As
// standing rises, deeper scenes unlock. Scene ids match content/script.yaml + scenes.js.
export const TALKS = {
  meredith:  [{ id: "meredith_rumor", minStanding: 0 }, { id: "meredith_deep", minStanding: 12 }],
  crake:     [{ id: "crake_intro",    minStanding: 0 }, { id: "crake_deep",    minStanding: 12 }],
  tolliver:  [{ id: "tolliver_intro", minStanding: 0 }, { id: "tolliver_deep", minStanding: 12 }],
  silas:     [{ id: "silas_town",     minStanding: 0 }, { id: "silas_deep",    minStanding: 30 }],
  grange:    [{ id: "grange_intro",   minStanding: 0 }, { id: "grange_deep",   minStanding: 12 }],
  bell:      [{ id: "bell_intro",     minStanding: 0 }, { id: "bell_deep",      minStanding: 12 }],
  coldwater: [{ id: "coldwater_intro",minStanding: 0 }, { id: "coldwater_deep",minStanding: 30 }],
  nan:       [{ id: "nan_intro",      minStanding: 0 }, { id: "nan_deep",       minStanding: 12 }],
};

// A short "nothing new today" filler per NPC, played when their deck is exhausted at the
// current standing. Keeps a visit from ever being empty. Scene ids in script.yaml/scenes.js.
export const SMALLTALK = {
  meredith: "meredith_small", crake: "crake_small", tolliver: "tolliver_small", silas: "silas_small",
  grange: "grange_small", bell: "bell_small", coldwater: "coldwater_small", nan: "nan_small",
};
```
Also change each `LOCATIONS` entry to carry `npc` (already present) and remove the now-unused fixed `talk` field, OR keep `talk` but ignore it (the render will use `npc` + `TALKS`). Simplest: leave `LOCATIONS` as-is; the Town render switches to keying on `npc` having a `TALKS` entry.

- [ ] **Step 2: `balance.js`** — add:
```javascript
  standing: { perTalk: 12, known: 15, friendly: 40, close: 70 }, // town relationships (Q-003)
```

- [ ] **Step 3: `state.js`** — add to `initialState` (near `jobsDoneToday`):
```javascript
    standing: {},              // per-NPC relationship points (npcId -> number)
    talksSeen: [],             // talk scene ids already played (drives the rotating deck)
```

- [ ] **Step 4: Write the failing test `prototype2/tests/standing.test.mjs`:**
```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { nextTownScene, standingOf, standingWord } from "../src/core/selectors.js";
import { BALANCE } from "../src/core/balance.js";

function inTown(seed = 1) {
  let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return reduce(s, { type: "SOW" }); // phase: day
}

describe("standing", () => {
  it("starts every NPC at 0 / Stranger", () => {
    const s = inTown();
    expect(standingOf(s, "crake")).toBe(0);
    expect(standingWord(0)).toBe("Stranger");
  });
  it("nextTownScene returns the intro first, then a deeper scene once standing allows", () => {
    let s = inTown();
    expect(nextTownScene(s, "crake")).toBe("crake_intro");
    s = { ...s, talksSeen: ["crake_intro"], standing: { crake: BALANCE.standing.perTalk } };
    expect(nextTownScene(s, "crake")).toBe("crake_deep"); // unlocked at minStanding 12
  });
  it("falls back to small-talk once the available deck is seen", () => {
    const s = { ...inTown(), talksSeen: ["crake_intro"], standing: { crake: 0 } }; // deep still locked
    expect(nextTownScene(s, "crake")).toBe("crake_small");
  });
});

describe("VISIT grants standing and records the talk", () => {
  it("spends an action, opens the resolved scene, raises standing, marks it seen", () => {
    let s = inTown();
    const acts0 = s.playerActionsLeft;
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.phase).toBe("scene");
    expect(s.scene.id).toBe("crake_intro");
    expect(s.playerActionsLeft).toBe(acts0 - 1);
    expect(standingOf(s, "crake")).toBe(BALANCE.standing.perTalk);
    expect(s.talksSeen).toContain("crake_intro");
  });
  it("is a no-op off the day phase or with no actions", () => {
    let s = inTown(); s = { ...s, playerActionsLeft: 0 };
    expect(reduce(s, { type: "VISIT", npc: "crake" })).toEqual(s);
  });
});
```

- [ ] **Step 5: Run to see it fail.**

- [ ] **Step 6: `selectors.js`** — add (import `TALKS`, `SMALLTALK` from `./town.js` — extend the existing town import):
```javascript
export const standingOf = (state, npc) => (state.standing && state.standing[npc]) || 0;

export function standingWord(v = 0) {
  const t = BALANCE.standing;
  if (v >= t.close) return "Close";
  if (v >= t.friendly) return "Friendly";
  if (v >= t.known) return "Known";
  return "Stranger";
}

// Which of an NPC's talks plays on the next visit: the first deck entry not yet seen whose
// minStanding is met, else the NPC's small-talk filler (so a visit is never empty). Pure.
export function nextTownScene(state, npc) {
  const deck = TALKS[npc] || [];
  const seen = state.talksSeen || [];
  const st = standingOf(state, npc);
  const next = deck.find((d) => d.minStanding <= st && !seen.includes(d.id));
  return next ? next.id : (SMALLTALK[npc] || null);
}
```

- [ ] **Step 7: `reducer.js`** — replace the `visit` helper so `VISIT` takes an `npc`, resolves the scene, grants standing, and records it. Update the case:
```javascript
    case "VISIT":
      return visit(state, action.npc);
```
Replace the helper (import `nextTownScene` from selectors and `BALANCE` is already imported):
```javascript
// Call on a townsperson: spend one action, open whichever of their talks comes next (see
// nextTownScene), raise your standing with them, and remember the talk so the deck rotates.
// A no-op off the day phase or with no actions left.
function visit(s, npc) {
  if (s.phase !== "day" || s.playerActionsLeft <= 0) return s;
  const sceneId = nextTownScene(s, npc);
  if (!sceneId) return s;
  const seen = s.talksSeen || [];
  return { ...s, playerActionsLeft: s.playerActionsLeft - 1,
    standing: { ...(s.standing || {}), [npc]: ((s.standing || {})[npc] || 0) + BALANCE.standing.perTalk },
    talksSeen: seen.includes(sceneId) ? seen : [...seen, sceneId],
    phase: "scene", scene: { id: sceneId, result: null }, screen: "home" };
}
```
(Add `import { nextTownScene } from "./selectors.js";` — extend the existing selectors import line rather than duplicating.)

- [ ] **Step 8: Run to see it pass** (`tests/standing.test.mjs`). Note: `tests/town.test.mjs`'s old `VISIT {sceneId}` test will now fail — that is fixed in Task 3. Do NOT fix it here; only `standing.test.mjs` is the gate for this task.

- [ ] **Step 9: Commit.**
```bash
git add prototype2/src/core/ prototype2/tests/standing.test.mjs
git commit -m "feat(proto2): per-NPC standing + nextTownScene deck selection + VISIT by npc (town-exploration task 1)"
```

---

## Task 2: Content — a talk deck for every townsperson

**Files:** Modify `prototype2/src/content/scenes.js`, `content/script.yaml` (+ regenerate).

Every scene id referenced by `TALKS` and `SMALLTALK` (Task 1) needs (a) a mechanics entry in `scenes.js` and (b) prose in `script.yaml`. The three existing intros (`crake_intro`, `tolliver_intro`, `meredith_rumor`) already exist — note `meredith`'s intro id is `meredith_rumor` (already in TALKS). New scene ids to author:
- Intros (tier 0) for the five without one: `silas_town`, `grange_intro`, `bell_intro`, `coldwater_intro`, `nan_intro`.
- Deeper (unlocked) for all eight: `meredith_deep`, `crake_deep`, `tolliver_deep`, `silas_deep`, `grange_deep`, `bell_deep`, `coldwater_deep`, `nan_deep`.
- Small-talk fillers for all eight: `meredith_small`, `crake_small`, `tolliver_small`, `silas_small`, `grange_small`, `bell_small`, `coldwater_small`, `nan_small`.

(`silas_town` is a town-visit talk distinct from the Day-1 `silas_welcome` call.)

- [ ] **Step 1: `scenes.js`** — add a mechanics entry for every new scene id, each:
```javascript
  <scene_id>: { choices: ["go_on"], fx: {}, returnTo: "town" },
```
(21 new entries. The existing `crake_intro`/`tolliver_intro`/`meredith_rumor` already have them.)

- [ ] **Step 2: `content/script.yaml`** — add prose for every new scene id, matching the existing town-scene shape (`eyebrow`, `title`, block-scalar `body` wrapped in `<div class="prose"><p>…</p></div>`, and a `go_on` choice with `text`/`sub`/`result`). VOICE: alt-1800s, restrained, **no em dashes or hyphen-as-pause** (commas/periods only); use `{{npc.<id>}}` / `{{lineage}}` tokens. Keep each `body` 2 to 4 sentences; deeper scenes reveal a little more of the person; small-talk is one or two lines of texture. Seed threads the later phases will use (Nan and the reckoning, Coldwater and cruelty, Silas and the debt, Bell and rumor) but resolve nothing. Write in the established characters (CLAUDE.md §4): Silas (correct, cold, the debt), Grange (grave preacher), Bell (dry doctor), Coldwater (still, watchful sheriff), Nan (folk-magic, edge of things), plus the deeper/small-talk beats for Meredith, Crake, Tolliver.

- [ ] **Step 3: Regenerate.** `cd prototype2 && npm run gen:data`. Confirm `src/generated/script.js` contains e.g. `nan_intro.body` and `silas_deep.body`.

- [ ] **Step 4: Test** — append to `prototype2/tests/standing.test.mjs`:
```javascript
import { L } from "../src/content/script.js";
import { tok } from "../src/content/names.js";
import { TALKS, SMALLTALK } from "../src/core/town.js";

describe("every town talk has prose", () => {
  it("resolves body text for every deck scene and small-talk", () => {
    const ids = [...new Set([...Object.values(TALKS).flat().map((d) => d.id), ...Object.values(SMALLTALK)])];
    for (const id of ids) {
      const body = tok(L(id + ".body"));
      expect(body && body.length, `${id}.body missing`).toBeGreaterThan(15);
    }
  });
});
```

- [ ] **Step 5:** Run `cd prototype2 && npx vitest run tests/standing.test.mjs` → PASS. Commit.
```bash
git add prototype2/src/content/scenes.js content/script.yaml prototype2/src/generated/script.js prototype2/tests/standing.test.mjs
git commit -m "feat(proto2): talk decks for all eight townsfolk (intro + deeper + small-talk) (town-exploration task 2)"
```

---

## Task 3: Render — Ride to town, and standing on the Town screen

**Files:** Modify `prototype2/src/render/screens.js`, `prototype2/src/styles/screens.css`, `prototype2/tests/screens.test.mjs`, `prototype2/tests/town.test.mjs`.

- [ ] **Step 1: Fix the Phase-B `VISIT` test** in `tests/town.test.mjs`: the old tests dispatch `{ type: "VISIT", sceneId: "crake_intro" }`. Change those to `{ type: "VISIT", npc: "crake" }` and update the expectation (the scene opened is `nextTownScene`, which for a fresh state is `crake_intro`, so `s.scene.id` is still `"crake_intro"`). Keep the "returns to Town on close" test.

- [ ] **Step 2: Write the failing render tests** (append to `tests/screens.test.mjs`):
```javascript
describe("town exploration UI", () => {
  it("the Day screen offers a ride to town", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    const ride = [...root.querySelectorAll("button")].find((b) => /Ride to|Marrow/i.test(b.textContent));
    expect(ride).toBeTruthy();
    ride.click();
    expect(state.screen).toBe("town");
  });
  it("the Town screen shows each NPC's standing and calling on one opens their talk", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    state = { ...state, screen: "town" };
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelector(".loc-standing")).toBeTruthy();
    const call = [...root.querySelectorAll(".townloc .loc-talk")].find((b) => !b.disabled);
    call.click();
    expect(state.phase).toBe("scene");
  });
});
```

- [ ] **Step 3: Day screen "Ride to town".** In the `day:` renderer's personal-actions area (the `personalActions` helper in `screens.js`), append a ride affordance below the `day-cta` (or within the personal block), that navigates without spending an action:
```javascript
    el("button", { class: "ridebtn t-label", text: "Ride to Marrow's Cross →",
      onClick: () => dispatch({ type: "SET_SCREEN", screen: "town" }) }),
```
Place it so it reads as an alternative to spending the day at home (e.g. right after the `personal-h` header, or as the first thing under the action grid). Add a one-line hint: the town is where the day's actions can also be spent.

- [ ] **Step 4: Town screen standing + npc-based call.** In the `town:` renderer, replace the per-location talk wiring so it keys on the NPC's deck (import `standingOf`, `standingWord`, `nextTownScene` from selectors; `TALKS` from `../core/town.js`). For each location whose `npc` has a `TALKS` entry, show a standing word and a "Call on them" button dispatching `VISIT {npc}`:
```javascript
    for (const l of locations) {
      const hasTalk = !!TALKS[l.npc];
      const canTalk = hasTalk && canAct;
      stage.append(el("div", { class: "townloc" }, [
        el("div", { class: "loc-head" }, [
          el("span", { class: "loc-who t-choice", text: tok("{{npc." + l.npc + "}}") }),
          el("span", { class: "loc-why t-sub", text: l.purpose }),
        ]),
        el("div", { class: "loc-right" }, [
          hasTalk ? el("span", { class: "loc-standing t-label", text: standingWord(standingOf(s, l.npc)) }) : null,
          hasTalk
            ? el("button", { class: "loc-talk t-label" + (canTalk ? "" : " disabled"), ...(canTalk ? {} : { disabled: true }),
                text: "Call on them", onClick: canTalk ? () => dispatch({ type: "VISIT", npc: l.npc }) : undefined })
            : el("span", { class: "loc-soon t-sub", text: "not today" }),
        ].filter(Boolean)),
      ]));
    }
```
(Every LOCATION now has an npc with a TALKS deck after Task 1/2, so all become callable.)

- [ ] **Step 5: Styles** — append to `screens.css`:
```css
.ridebtn { display: inline-block; margin: 0 0 10px; cursor: pointer; background: none;
  border: 1px solid var(--lamp); color: var(--lamp); padding: 8px 14px; letter-spacing: .03em; }
.loc-right { display: flex; align-items: center; gap: 12px; }
.loc-standing { color: var(--ink-faint); }
```

- [ ] **Step 6:** Run `cd prototype2 && npx vitest run tests/screens.test.mjs tests/town.test.mjs tests/standing.test.mjs` → PASS. Commit.
```bash
git add prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/tests/
git commit -m "feat(proto2): ride-to-town on the Day screen + standing on the Town screen (town-exploration task 3)"
```

---

## Task 4: Reuben's tip, full suite, browser verify

**Files:** Modify `prototype2/src/content/tips.js`; verify.

- [ ] **Step 1: Update the `town` tip** in `tips.js` to mention calling on folk and standing (one paragraph, Reuben's voice, no em dashes): that riding in spends the day, there is paid work and folk worth knowing, and the more you call on someone the more they will tell you.

- [ ] **Step 2: Full suite.** `cd prototype2 && npx vitest run` → ALL green. Report counts.

- [ ] **Step 3: Browser verify.** Dev server on 4321. New Game → into a day → on the Day screen click **"Ride to Marrow's Cross"** (lands on the Town tab). Confirm: every NPC shows a standing word ("Stranger") and "Call on them"; calling on one opens a talk, spends an action, and on close returns to the Town tab; calling on the same NPC again (next day, after standing rises) shows a *different* (deeper) scene, then small-talk once exhausted. Screenshot the Town screen. Fix any console errors.

- [ ] **Step 4: Commit.**
```bash
git add prototype2/src/content/tips.js
git commit -m "feat(proto2): Reuben's town tip mentions standing (town-exploration task 4)"
```

---

## Self-Review notes (author)

- **Spec coverage:** ride-to-town discoverability (fixes the "nothing to spend actions on" gap); all 8 NPCs callable (§9); per-NPC standing + rotating deck unlocking deeper scenes (§9–10, the chosen "+Standing" depth). Deferred by scope guard: favors, story threads, standing-gated shops/prices.
- **Type/name consistency:** `state.standing` (obj), `state.talksSeen` (array), `standingOf`/`standingWord`/`nextTownScene` selectors, `VISIT {npc}`, `TALKS`/`SMALLTALK` in town.js, `BALANCE.standing`. Consistent across tasks. Task 3 updates the Phase-B `VISIT {sceneId}` callers to `{npc}`.
- **Never-empty rule:** `nextTownScene` always returns a scene id (deck entry or small-talk), so a call is never a dead click.
