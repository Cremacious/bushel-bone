# Gameplay Overhaul — Phase B: The Living Town Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the placeholder **Town** tab into a living menu-map of Marrow's Cross where, during a day, the player spends their personal actions on **paid odd-jobs** (the second coin engine) and **talks with the townsfolk** — including four new economy NPCs. This gives the day something to *do* beyond the farm, which is what makes the daily loop worth playing.

**Architecture:** Additive on Phase A. The pure core gains a **town data module** (locations + a rotating odd-job deck) and reducer actions `ACCEPT_JOB` and `VISIT` (each spends one of the day's personal actions), plus a small extension to scene-closing so a town scene returns to the Town screen instead of the brief. The render layer fleshes out the `town:` screen (a location menu-map + the day's odd-jobs), gated to the `day` phase and the action budget. New NPCs and town scenes flow through the existing `content/*.yaml` → `npm run gen:data` pipeline (#45/#46). Everything stays pure `(state, action) => state`, DOM-free, unit-tested.

**Tech Stack:** Same as Phase A — vanilla ES modules, `vitest`/`jsdom`, the `content/*.yaml` pipeline. No new dependencies.

**Design reference:** overhaul spec §9 (the town and travel) and §10 (NPC roster). The four new NPCs (Chris-approved): **Hollis Crake** (toolwright), **Prudence Tolliver** (shopkeep), **Mr. Fenwick** (rail agent, mid-game), **the Ostranders** (rival farm).

**Action-economy decision (this plan, flagged):** browsing the Town tab is **free**; each **odd-job** or **meaningful talk** costs **one** of the day's 2 personal actions and is only enabled during the `day` phase with actions left. The spec's "riding in costs an action" is folded into the per-encounter cost (no separate ride step) for simpler accounting. Revisit if it feels off.

**Scope guard (defer, do NOT build here):** the build-up ladder / vendors actually *selling* upgrades (Crake's tools, land deeds) and hiring (Phase C); the crop market price model + the depot venue (Phase D); the 1-field start (a separate follow-up after this). Crake/Tolliver/Fenwick get *intro talks and flavor* here; their shops are Phase C/D. Odd-jobs are the only coin mechanic added now.

---

## The town model (what we're building)

- **The Town tab** renders a **menu-map**: one card per location, each naming its NPC and purpose. Always viewable.
- **Odd-jobs**: a small deck (`content/town.js`). Each day, a deterministic 1–2 jobs are "on offer" (chosen by day+seed). Taking one spends a personal action and pays coin. A job taken is marked done for that day.
- **Talks**: some locations offer a **talk** — a short scripted scene (reuses the scene engine). Taking a talk spends a personal action and opens the scene; closing it returns to the Town screen.
- **Gating (D-039)**: outside the `day` phase, or with no actions left, jobs/talks are shown **disabled with a plain reason** ("come back during the day", "you're spent for the day"). Reuben nudges on the first town visit.

---

## File Structure (Phase B)

```
content/
  names.yaml            # MODIFY — add crake/tolliver/fenwick/ostrander characters + smithy/store/depot locations
  script.yaml           # MODIFY — add town intro talks (crake_intro, tolliver_intro, meredith_rumor)
prototype2/src/core/
  town.js               # NEW — LOCATIONS list + ODD_JOBS deck (pure data)
  selectors.js          # MODIFY — townOffers(state): today's jobs + which locations have a talk
  reducer.js            # MODIFY — ACCEPT_JOB, VISIT (spend an action); scene-close returns to town
  state.js              # MODIFY — jobsDoneToday: [] (reset each day in resolveDay)
prototype2/src/content/
  scenes.js             # MODIFY — crake_intro / tolliver_intro / meredith_rumor scene entries (returnTo: "town")
  tips.js               # MODIFY — a "town" first-visit tip
prototype2/src/render/
  screens.js            # MODIFY — flesh out the town: renderer (menu-map + odd-jobs), gated to day + actions
prototype2/src/styles/
  screens.css           # MODIFY — town map + job card styles
prototype2/tests/
  town.test.mjs         # NEW — offers/deck determinism, ACCEPT_JOB + VISIT action-spend, gating, scene return
```

---

## Task 1: New NPCs and locations in the content config

**Files:** Modify `content/names.yaml`; run the generator.

- [ ] **Step 1: Add the four new characters** to `content/names.yaml` under `characters:` (match the existing formatting; no em dashes per the house voice rule):

```yaml
  crake:     { name: "Hollis Crake",            first: "Hollis",   role: "the toolwright",     desc: "a one-armed smith, sleeve pinned, sizing you up over the forge" }
  tolliver:  { name: "Prudence Tolliver",       first: "Prudence", role: "the shopkeep",       desc: "tight-mouthed behind a tidy counter, missing nothing" }
  fenwick:   { name: "Mr. Fenwick",             role: "the rail agent",     desc: "a company man in a good hat, all ledger and no warmth" }
  ostrander: { name: "Old Ostrander",           first: "Ostrander", role: "the rival farmer",  desc: "broad and weathered, a hard man who works his hands harder" }
```

- [ ] **Step 2: Add the new town locations** under `locations:` (used for the menu-map plates and captions):

```yaml
  smithy:    { cap: "{{place.town}}", sub: "the smithy",       desc: "the smithy: a low forge, iron stacked, {{npc.crake}} at the anvil" }
  store:     { cap: "{{place.town}}", sub: "the general store", desc: "the general store, shelves close and orderly, {{npc.tolliver}} at the counter" }
  depot:     { cap: "{{place.town}}", sub: "the rail depot",    desc: "a raw plank depot at the end of the new line, a chalk price-board by the door" }
  jail:      { cap: "{{place.town}}", sub: "the jail",          desc: "the sheriff's office, a lamp low in the window" }
  doc:       { cap: "{{place.town}}", sub: "the doctor's rooms", desc: "{{npc.bell}}'s rooms, bottles ranked on a shelf" }
```

- [ ] **Step 3: Regenerate the content modules.** Run: `cd prototype2 && npm run gen:data`
Expected: `prototype2/src/generated/names.js` updates (no errors). Confirm it contains `crake` and `smithy`.

- [ ] **Step 4: Write a test `prototype2/tests/town.test.mjs`** (first block; more added in later tasks):

```javascript
import { describe, it, expect } from "vitest";
import { lookupName, tok } from "../src/content/names.js";

describe("town names", () => {
  it("resolves the four new NPCs and the new locations", () => {
    expect(lookupName("npc.crake")).toBe("Hollis Crake");
    expect(lookupName("npc.tolliver")).toBe("Prudence Tolliver");
    expect(lookupName("npc.fenwick")).toBe("Mr. Fenwick");
    expect(lookupName("loc.smithy.sub")).toBe("the smithy");
    expect(tok("{{npc.crake}} at {{loc.smithy.sub}}")).toBe("Hollis Crake at the smithy");
  });
});
```

- [ ] **Step 5: Run + commit.**
Run: `cd prototype2 && npx vitest run tests/town.test.mjs` → PASS.
```bash
git add content/names.yaml prototype2/src/generated/names.js prototype2/tests/town.test.mjs
git commit -m "feat(proto2): add the four town NPCs + town locations to the names config (Phase B task 1)"
```

---

## Task 2: Town data — locations + the odd-job deck

**Files:** Create `prototype2/src/core/town.js`; add tests to `tests/town.test.mjs`.

- [ ] **Step 1: Write the failing test** (append to `tests/town.test.mjs`):

```javascript
import { LOCATIONS, ODD_JOBS } from "../src/core/town.js";

describe("town data", () => {
  it("defines locations with an id, npc, and purpose", () => {
    const saloon = LOCATIONS.find((l) => l.id === "saloon");
    expect(saloon).toMatchObject({ id: "saloon", npc: "meredith", purpose: expect.any(String) });
    // every location names a real place id (for the plate) and either a talk scene or a shop stub
    for (const l of LOCATIONS) expect(typeof l.loc).toBe("string");
  });
  it("defines odd-jobs with a giver, coin, and a line", () => {
    expect(ODD_JOBS.length).toBeGreaterThanOrEqual(3);
    for (const j of ODD_JOBS) {
      expect(j).toMatchObject({ id: expect.any(String), giver: expect.any(String), coin: expect.any(Number) });
      expect(j.coin).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run to see it fail** (`town.js` missing).

- [ ] **Step 3: Create `prototype2/src/core/town.js`:**

```javascript
// The town of Marrow's Cross as data: the places you can call at, and the deck of paid
// odd-jobs. Pure content — no state, no DOM. Coin values are a first pass (Q-003). Talks
// are scripted scenes (see content/scenes.js); shops (Crake's tools, the depot market) are
// stubbed here and wired in Phases C/D.
export const LOCATIONS = [
  { id: "saloon", npc: "meredith", loc: "saloon", purpose: "gossip, and the day's work going", talk: "meredith_rumor" },
  { id: "smithy", npc: "crake",    loc: "smithy", purpose: "tools and ironwork (soon)",         talk: "crake_intro" },
  { id: "store",  npc: "tolliver", loc: "store",  purpose: "seed, goods, and sundries (soon)",  talk: "tolliver_intro" },
  { id: "bank",   npc: "silas",    loc: "town",   purpose: "the mortgage and the land",         talk: null },
  { id: "church", npc: "grange",   loc: "church", purpose: "the parish, and the weather of souls", talk: null },
  { id: "doc",    npc: "bell",     loc: "doc",    purpose: "medicine, and rumor",               talk: null },
  { id: "jail",   npc: "coldwater",loc: "jail",   purpose: "the law",                           talk: null },
  { id: "nan",    npc: "nan",      loc: "gate",   purpose: "the old ways",                       talk: null },
];

// The odd-job deck: small paid errands. Each day a deterministic slice is on offer
// (see selectors.townOffers). giver is an npc id (for flavor); coin is the pay.
export const ODD_JOBS = [
  { id: "haul_mill",   giver: "meredith", coin: 8,  line: "Haul grain sacks for the miller a day." },
  { id: "sit_patient", giver: "bell",     coin: 6,  line: "Sit the night with one of Doc's patients." },
  { id: "mend_fence",  giver: "ostrander",coin: 7,  line: "Mend a stretch of the Ostrander fence." },
  { id: "dig_grave",   giver: "grange",   coin: 5,  line: "Dig and fill for the preacher, quiet work." },
  { id: "load_wagon",  giver: "crake",    coin: 9,  line: "Load and strap the toolwright's wagon." },
];

// How many jobs are on offer on a given day.
export const JOBS_PER_DAY = 2;
```

- [ ] **Step 4: Run to see it pass. Commit.**
```bash
git add prototype2/src/core/town.js prototype2/tests/town.test.mjs
git commit -m "feat(proto2): town data — locations + the odd-job deck (Phase B task 2)"
```

---

## Task 3: Selectors — today's town offers

**Files:** Modify `prototype2/src/core/selectors.js`; add tests to `tests/town.test.mjs`.

- [ ] **Step 1: Write the failing test** (append):

```javascript
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { townOffers } from "../src/core/selectors.js";

function inTown(seed = 1) {
  let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  s = reduce(s, { type: "SOW" }); // phase: day
  return s;
}

describe("townOffers()", () => {
  it("offers JOBS_PER_DAY jobs, deterministically for a given day+seed", () => {
    const s = inTown(42);
    const a = townOffers(s).jobs.map((j) => j.id);
    const b = townOffers(s).jobs.map((j) => j.id);
    expect(a).toEqual(b);            // pure
    expect(a.length).toBe(2);
  });
  it("marks a job done once it is in jobsDoneToday", () => {
    let s = inTown(42);
    const first = townOffers(s).jobs[0].id;
    s = { ...s, jobsDoneToday: [first] };
    expect(townOffers(s).jobs.find((j) => j.id === first).done).toBe(true);
  });
});
```

- [ ] **Step 2: Run to see it fail.**

- [ ] **Step 3: Add `townOffers` to `selectors.js`** (import the town data at the top: `import { LOCATIONS, ODD_JOBS, JOBS_PER_DAY } from "./town.js";`):

```javascript
// The town as it stands today: which odd-jobs are on offer (a deterministic slice of the
// deck, rotating by day so it feels fresh) and their done state, plus the callable locations.
// Pure: same state in, same offers out (no Math.random — the day+seed picks the slice).
export function townOffers(state) {
  const done = state.jobsDoneToday || [];
  const n = ODD_JOBS.length;
  // A deterministic per-day starting index into the deck (day, season, year, and the game
  // seed all feed it, so the offer varies across days and across runs without any RNG call).
  const start = ((state.day + state.seasonIndex * 7 + state.year * 31 + (state.rngSeed % n)) % n + n) % n;
  const jobs = [];
  for (let i = 0; i < Math.min(JOBS_PER_DAY, n); i++) {
    const j = ODD_JOBS[(start + i) % n];
    jobs.push({ ...j, done: done.includes(j.id) });
  }
  return { jobs, locations: LOCATIONS };
}
```

- [ ] **Step 4: Run to see it pass. Commit.**
```bash
git add prototype2/src/core/selectors.js prototype2/tests/town.test.mjs
git commit -m "feat(proto2): townOffers() — the day's odd-jobs + locations (Phase B task 3)"
```

---

## Task 4: Reducer — accept a job, visit a talk, and return from a town scene

**Files:** Modify `prototype2/src/core/state.js`, `prototype2/src/core/reducer.js`, `prototype2/src/content/scenes.js`; add tests to `tests/town.test.mjs`.

- [ ] **Step 1: Add `jobsDoneToday: []` to `initialState`** in `state.js` (next to `daylog: []`).

- [ ] **Step 2: In `resolveDay` (reducer.js)**, reset the day's jobs when the day advances: in the object it returns, add `jobsDoneToday: []` alongside `daylog`.

- [ ] **Step 3: Write the failing tests** (append to `tests/town.test.mjs`):

```javascript
import { townOffers as offers2 } from "../src/core/selectors.js";

describe("town actions", () => {
  it("ACCEPT_JOB pays coin, spends one action, and marks the job done", () => {
    let s = inTown(42);
    const job = offers2(s).jobs[0];
    const coin0 = s.coin, acts0 = s.playerActionsLeft;
    s = reduce(s, { type: "ACCEPT_JOB", id: job.id });
    expect(s.coin).toBe(coin0 + job.coin);
    expect(s.playerActionsLeft).toBe(acts0 - 1);
    expect(s.jobsDoneToday).toContain(job.id);
  });
  it("ACCEPT_JOB is a no-op with no actions left or off the day phase", () => {
    let s = inTown(42); s = { ...s, playerActionsLeft: 0 };
    expect(reduce(s, { type: "ACCEPT_JOB", id: offers2(s).jobs[0].id })).toEqual(s);
    let b = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting phase
    expect(reduce(b, { type: "ACCEPT_JOB", id: "haul_mill" })).toEqual(b);
  });
  it("VISIT spends an action and opens the location's talk scene", () => {
    let s = inTown(42);
    const acts0 = s.playerActionsLeft;
    s = reduce(s, { type: "VISIT", sceneId: "crake_intro" });
    expect(s.phase).toBe("scene");
    expect(s.scene.id).toBe("crake_intro");
    expect(s.playerActionsLeft).toBe(acts0 - 1);
  });
  it("closing a town scene returns to the Town screen, not the brief", () => {
    let s = inTown(42);
    s = reduce(s, { type: "VISIT", sceneId: "crake_intro" });
    s = reduce(s, { type: "CLOSE_SCENE" });
    expect(s.screen).toBe("town");
    expect(s.phase).toBe("day"); // back in the day, town tab
  });
});
```

- [ ] **Step 4: Add scene entries** in `content/scenes.js` for the town talks, with a `returnTo: "town"` marker and no `after`:

```javascript
  crake_intro:    { choices: ["go_on"], fx: {}, returnTo: "town" },
  tolliver_intro: { choices: ["go_on"], fx: {}, returnTo: "town" },
  meredith_rumor: { choices: ["go_on"], fx: {}, returnTo: "town" },
```
(Use the existing choice/fx shape; `go_on` is a single acknowledging choice. The prose is added in Task 6 via script.yaml; scenes.js is only the mechanics.)

- [ ] **Step 5: Add the reducer cases + helpers.** In the `switch`, add:
```javascript
    case "ACCEPT_JOB":
      return acceptJob(state, action.id);
    case "VISIT":
      return visit(state, action.sceneId);
```
Add the helpers (note the day-phase + action gate, matching `doPlayerAction`):
```javascript
import { ODD_JOBS } from "./town.js"; // add near the other imports

// Take a paid odd-job: spend one of the day's actions, take the coin, mark it done so it
// cannot be double-claimed. A no-op off the day phase, with no actions, or if already done.
function acceptJob(s, id) {
  if (s.phase !== "day" || s.playerActionsLeft <= 0) return s;
  const job = ODD_JOBS.find((j) => j.id === id);
  if (!job || (s.jobsDoneToday || []).includes(id)) return s;
  return { ...s, coin: s.coin + job.coin, playerActionsLeft: s.playerActionsLeft - 1,
    jobsDoneToday: [...(s.jobsDoneToday || []), id] };
}

// Call on a townsperson: spend one action and open their talk scene. A no-op off the day
// phase or with no actions left. The scene remembers to return to the Town screen on close.
function visit(s, sceneId) {
  if (s.phase !== "day" || s.playerActionsLeft <= 0) return s;
  return { ...s, playerActionsLeft: s.playerActionsLeft - 1,
    phase: "scene", scene: { id: sceneId, result: null }, screen: "home" };
}
```

- [ ] **Step 6: Extend `closeScene`** to honor `returnTo`. Replace the current body:
```javascript
function closeScene(s) {
  const sc = SCENES[s.scene && s.scene.id];
  const base = { ...s, scene: null };
  if (sc && sc.after === "BEGIN_SEASON") return beginSeason(base);
  if (sc && sc.returnTo) return { ...base, screen: sc.returnTo, phase: "day" }; // back to town, mid-day
  return { ...base, phase: "brief" };
}
```
Note: `VISIT` sets `screen: "home"` so the scene renders on the Home stage (the scene renderer keys on phase, not screen); on close, `returnTo: "town"` puts the player back on the Town tab. Confirm the scene router still shows the scene while `phase === "scene"` regardless of screen (it does: `renderScreen` uses `state.screen === "home" ? state.phase : state.screen`, and VISIT sets screen home, so it routes to the `scene` phase renderer).

- [ ] **Step 7: Run + commit.**
Run: `cd prototype2 && npx vitest run tests/town.test.mjs` → PASS.
```bash
git add prototype2/src/core/state.js prototype2/src/core/reducer.js prototype2/src/content/scenes.js prototype2/tests/town.test.mjs
git commit -m "feat(proto2): town actions — ACCEPT_JOB, VISIT, and town-scene return (Phase B task 4)"
```

---

## Task 5: The Town screen — the menu-map + the day's odd-jobs

**Files:** Modify `prototype2/src/render/screens.js`, `prototype2/src/styles/screens.css`; add a render test to `tests/screens.test.mjs`.

- [ ] **Step 1: Write the failing test** (append to `tests/screens.test.mjs`):

```javascript
describe("the town screen", () => {
  function townView(mutate) {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(42), { type: "BEGIN_SEASON" }), { type: "SOW" }); // day phase
    state = { ...state, screen: "town" };
    if (mutate) state = mutate(state);
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    return { root, get: () => state, dispatch: (a) => { state = reduce(state, a); } };
  }
  it("lists locations and the day's odd-jobs, and taking a job pays coin", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(42), { type: "BEGIN_SEASON" }), { type: "SOW" });
    state = { ...state, screen: "town" };
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelectorAll(".townloc").length).toBeGreaterThanOrEqual(5);
    const coin0 = state.coin;
    const jobBtn = root.querySelector(".jobcard .jobtake");
    expect(jobBtn).toBeTruthy();
    jobBtn.click();
    expect(state.coin).toBeGreaterThan(coin0);
  });
  it("disables jobs when it is not the day phase", () => {
    const root = document.createElement("div");
    let state = { ...initialState(42), screen: "town", phase: "brief" };
    const dispatch = () => {};
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    const jobBtn = root.querySelector(".jobcard .jobtake");
    expect(jobBtn.disabled).toBe(true);
  });
});
```

- [ ] **Step 2: Run to see it fail** (the current `town:` renderer is a placeholder).

- [ ] **Step 3: Replace the `town:` renderer** in `screens.js`'s `SCREENS` object. Import the town selector + data at the top: `import { townOffers } from "../core/selectors.js";` (extend the existing selectors import) and `import { LOCATIONS } from "../core/town.js";` is not needed (townOffers returns them). Use `tok`, `L` (already imported):

```javascript
  town: (stage, s, dispatch) => {
    const { jobs, locations } = townOffers(s);
    const canAct = s.phase === "day" && s.playerActionsLeft > 0;
    const why = s.phase !== "day" ? "Come back during the day." : s.playerActionsLeft <= 0 ? "You are spent for the day." : null;
    stage.append(
      el("div", { class: "eyebrow t-label", text: "Marrow's Cross" }),
      el("h2", { class: "t-title", text: "The town at the crossroads" }),
      el("p", { class: "t-sub townhint", text: canAct
        ? `You have ${s.playerActionsLeft} of the day to spend here.`
        : (why || "The town is quiet.") }),
    );
    // The day's paid work.
    stage.append(el("div", { class: "eyebrow t-label townsub", text: "Work going" }));
    for (const j of jobs) {
      const blocked = !canAct || j.done;
      const sub = j.done ? "done today" : (why || `+${j.coin} coin · ${tok("{{npc." + j.giver + "}}")}`);
      stage.append(el("div", { class: "jobcard" }, [
        el("div", { class: "jobline t-choice", text: j.line }),
        el("div", { class: "jobmeta t-sub", text: sub }),
        el("button", { class: "jobtake t-label" + (blocked ? " disabled" : ""), ...(blocked ? { disabled: true } : {}),
          text: j.done ? "done" : `Take it (+${j.coin})`,
          onClick: blocked ? undefined : () => dispatch({ type: "ACCEPT_JOB", id: j.id }) }),
      ]));
    }
    // The places you can call at.
    stage.append(el("div", { class: "eyebrow t-label townsub", text: "The town" }));
    for (const l of locations) {
      const canTalk = !!l.talk && canAct;
      stage.append(el("div", { class: "townloc" }, [
        el("div", { class: "loc-head" }, [
          el("span", { class: "loc-who t-choice", text: tok("{{npc." + l.npc + "}}") }),
          el("span", { class: "loc-why t-sub", text: l.purpose }),
        ]),
        l.talk
          ? el("button", { class: "loc-talk t-label" + (canTalk ? "" : " disabled"), ...(canTalk ? {} : { disabled: true }),
              text: "Call on them", onClick: canTalk ? () => dispatch({ type: "VISIT", sceneId: l.talk }) : undefined })
          : el("span", { class: "loc-soon t-sub", text: "not today" }),
      ]));
    }
  },
```

- [ ] **Step 4: Add town styles** to `screens.css` (reuse existing tokens `--rule-fine`, `--lamp`, `--ink-faint`, `--good`):
```css
/* --- the Town tab: the menu-map + the day's odd-jobs --- */
.townhint { margin-bottom: 14px; }
.townsub { margin: 14px 0 8px; }
.jobcard { border: 1px solid var(--rule-fine); border-left: 3px solid var(--lamp); padding: 10px 12px; margin-bottom: 8px; }
.jobline { margin-bottom: 2px; }
.jobmeta { color: var(--ink-faint); }
.jobtake { display: inline-block; margin-top: 8px; cursor: pointer; border: 1px solid var(--lamp);
  color: var(--lamp); background: none; padding: 5px 12px; letter-spacing: .03em; }
.jobtake.disabled { opacity: .45; cursor: default; border-color: var(--rule-fine); color: var(--ink-faint); }
.townloc { display: flex; justify-content: space-between; align-items: center; gap: 12px;
  border-bottom: 1px solid var(--rule-fine); padding: 10px 0; }
.loc-head { display: flex; flex-direction: column; gap: 2px; }
.loc-why { color: var(--ink-faint); }
.loc-talk { cursor: pointer; border: 1px solid var(--rule-fine); background: none; color: inherit; padding: 5px 12px; }
.loc-talk:hover:not(.disabled) { border-color: var(--lamp); }
.loc-talk.disabled { opacity: .45; cursor: default; }
.loc-soon { color: var(--ink-faint); font-style: italic; }
```

- [ ] **Step 5: Run + commit.**
Run: `cd prototype2 && npx vitest run tests/screens.test.mjs tests/town.test.mjs` → PASS.
```bash
git add prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): the Town screen — menu-map + the day's odd-jobs (Phase B task 5)"
```

---

## Task 6: Town scenes, Reuben's town tip, full suite + browser verify

**Files:** Modify `content/script.yaml` (+ regenerate), `prototype2/src/content/tips.js`; verify.

- [ ] **Step 1: Add the three town talk scenes to `content/script.yaml`.** Match the existing entry shape (each scene id has `eyebrow`, `title`, `body`, and per-choice `text`/`sub`/`result`). Tokenized, no em dashes. For each of `crake_intro`, `tolliver_intro`, `meredith_rumor` add an eyebrow/title/body and a single `go_on` choice with `text`, `sub`, and `result`. Example for `crake_intro`:
```yaml
crake_intro:
  eyebrow: "The smithy"
  title: "Hollis Crake"
  body: >
    <div class="prose"><p>{{npc.crake}} does not stop his hammer at once. When he does, he sets the piece down with the one hand he has and looks you over. "You would be the one took the old {{lineage}} place," he says. "Ground like that eats tools. When you are ready to work it proper, a plow, a well, a barn raised, you come to me. I do not give credit, mind."</p></div>
  go_on:
    text: "“I will remember that.”"
    sub: "leave the smith to his iron"
    result: "He is already back at the anvil before you reach the door."
```
Write `tolliver_intro` (Prudence at the store, tight with credit, sizes up your seed money) and `meredith_rumor` (Meredith at the saloon passes a piece of market gossip, e.g. grain talk from the rail) in the same shape and voice. Keep each body 2 to 4 sentences.

- [ ] **Step 2: Regenerate.** Run: `cd prototype2 && npm run gen:data` and confirm `src/generated/script.js` now contains `crake_intro.body`.

- [ ] **Step 3: Add a first-visit town tip** to `prototype2/src/content/tips.js`. Add a `town` entry to `TIPS` and a candidate in `pendingTip`:
```javascript
  town: [
    "This is Marrow's Cross. Riding in is how a day gets spent when the fields can spare you. There is paid work going most days, coin in hand by dusk, and folk worth knowing. Each errand or call costs you a piece of the day, same as work at home, so choose what is worth your while.",
  ],
```
In `pendingTip`, add: `if (state.screen === "town") cands.push("town");` (place it so it can fire when the player first opens the Town tab with tutorials on).

- [ ] **Step 4: Run the FULL suite.** Run: `cd prototype2 && npx vitest run` → ALL green. Report counts.

- [ ] **Step 5: Browser verify.** Ensure the dev server runs (`preview_start` name `prototype2`, or it may already be up on 4321). Walk: New Game → into a day → open the **Town** tab. Confirm: locations list with NPC names and purposes; the day's 2 odd-jobs; **Take it** pays coin and spends an action (the masthead Coin rises, the day's action budget drops); **Call on them** at the smithy opens Crake's talk and **Go on** returns to the Town tab; jobs/talks are disabled with a reason outside the day phase. Fix any console errors. Screenshot the Town tab as proof.

- [ ] **Step 6: Commit.**
```bash
git add content/script.yaml prototype2/src/generated/script.js prototype2/src/content/tips.js
git commit -m "feat(proto2): town talk scenes + Reuben's first-town tip (Phase B task 6)"
```

---

## Self-Review notes (author)

- **Spec coverage (Phase B):** menu-map town (§9) → Tasks 2/5; travel/action-cost (§9, simplified per the flag) → Task 4 gating; odd-jobs = coin engine 2 (§7) → Tasks 2–5; the four new NPCs (§10) → Task 1; town talks + Reuben onboarding (§9/§11) → Task 6. Deferred by the scope guard: vendors selling (Phase C), the market price model + depot (Phase D).
- **Type/name consistency:** `townOffers` returns `{ jobs, locations }`; jobs carry `{id, giver, coin, line, done}`; reducer `ACCEPT_JOB {id}` / `VISIT {sceneId}`; scenes use `returnTo: "town"`; new state field `jobsDoneToday` reset in `resolveDay`. All match across tasks.
- **Purity:** `townOffers` derives the day's slice from `state.day/seasonIndex/year/rngSeed` with no RNG call, so it stays a pure selector (and deterministic per the test).
- **Gating (D-039):** jobs/talks disable with a plain reason off the day phase or out of actions.

---

*Next after Phase B: fold in the 1-field start (a small follow-up that begins Phase C — start with one cleared field and the rest needing clearing), then Phase C proper (the build-up ladder / vendors) and Phase D (the market).*
