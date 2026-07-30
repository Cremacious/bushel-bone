# Legibility Pass & Town Walking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the daily loop *readable* and give the town a walk-to-a-place feel. Ten playtest notes, grouped: intro/naming polish, tutorial re-timing, a redesigned winter-goal panel, a legibility system (Reuben's Tiredness read + +/− stat tags on every action + visible tending), and a location-first town (walk to a place → scene → talk, with a way home).

**Architecture:** Presentation-heavy, additive on the merged daily loop. New pure selectors give the stat-tag text a single source of truth (`actionEffects`/`playerActionEffects`) and the health verdict (`tirednessAdvice`). The town gains a tiny bit of state (`townAt`) and two free-navigation actions (`WALK_TO`, `LEAVE_TOWN`). Everything else is copy, tips re-sequencing, and render/CSS. Pure `(state, action) => state` throughout.

**Tech Stack:** unchanged (vanilla ES modules, vitest/jsdom, `content/*.yaml` → `npm run gen:data`).

**Design reference:** `docs/superpowers/specs/2026-07-30-legibility-and-town-walk-design.md`. Two phases: **Phase 1 = legibility & onboarding (spec A–D)**, **Phase 2 = the town walk (spec E)**.

**Balance note:** `tendGrowthBonus` may be raised so tending visibly moves a ripen day (Q-003).

---

# PHASE 1 — Legibility & onboarding

## Task 1: Intro & naming polish (spec A)

**Files:** Modify `prototype2/src/front.js`, `prototype2/src/styles/front.css`; update `prototype2/tests/front.test.mjs`.

- [ ] **Step 1: Naming copy.** In `front.js`, the `name` screen:
  - Delete the eyebrow line `el("div", { class: "fr-eyebrow t-label", text: "Before the letter comes" }),`.
  - Delete the hint line `el("p", { class: "fr-hint t-sub", text: "This is the name over the door for as long as your line holds the land." }),`.
  - Replace the body text with: `"This land will carry your family's name for as long as your line holds it. What is it?"`.

- [ ] **Step 2: Shared fixed layout for the two intro pages.** In `front.js`, the `letter` screen renders page 1 (the aged-paper letter) and page 2 (plain narration) via a pager. Ensure BOTH pages render their content into a **single fixed-height reading container** with the **Previous/Next/Begin control row pinned at the bottom** in a constant position. Concretely: wrap the paged content in `el("div", { class: "fr-page-body" }, [...])` (fixed min-height) and the controls in `el("div", { class: "fr-page-nav" }, [...])`, and make page 2's narration render inside the same `.fr-page-body` block the letter uses (same padding/max-width), so text and buttons do not move between pages. Read the current `letter` screen structure and refactor to this shared shell; keep the letter leaf styling for page 1 and the cream-on-dark narration for page 2, but both inside `.fr-page-body`.

- [ ] **Step 3: CSS** in `front.css`:
```css
.fr-page-body { min-height: 60vh; display: flex; flex-direction: column; justify-content: flex-start; }
.fr-page-nav { display: flex; justify-content: space-between; gap: 12px; margin-top: 20px; }
```
(Match existing token/spacing conventions; if `.fr-letterwrap`/`.fr-doc` already impose a width, keep page 2 to the same `max-width` so the text column aligns with the letter.)

- [ ] **Step 4: Update `front.test.mjs`** — if a test asserts the removed strings ("Before the letter comes" / "name over the door"), change it to assert the new prompt text and that the name input + Continue exist. Add an assertion that paging from letter → narration keeps a `.fr-page-nav` present on both.

- [ ] **Step 5:** Run `cd prototype2 && npx vitest run tests/front.test.mjs` → PASS. Commit.
```bash
git add prototype2/src/front.js prototype2/src/styles/front.css prototype2/tests/front.test.mjs
git commit -m "feat(proto2): naming copy trim + stable intro paging (legibility task 1)"
```

## Task 2: Tutorial re-sequencing (spec B)

**Files:** Modify `prototype2/src/content/tips.js`; update `prototype2/tests/tutorial.test.mjs`.

- [ ] **Step 1: Split the orientation tip out of `plant`.** In `tips.js`, the `plant` tip array currently begins with the orientation page ("Now then. Coin buys seed and fuel…"). MOVE that first string into a NEW tip id `orient`:
```javascript
  orient: [
    "Now then. Coin buys seed and fuel. The larder feeds us through to spring. Fuel keeps the cold out come winter. Seed goes in the ground before coin ever does. Tap any of those four figures, any time, and I will tell you plain what it means. And that row of dots up by my name is how the hands are holding up; the Regard beside it is how the town has come to look at you.",
  ],
```
Leave `plant` as the TWO planting pages only ("This is the season's planting…" and "Mind the fertility dots…") so they show together at sowing.

- [ ] **Step 2: Fire `orient` at Silas's Welcome.** In `pendingTip(state)`, add a candidate so `orient` fires when the player first reaches the opening scene:
```javascript
  if (state.phase === "scene" && state.scene && state.scene.id === "silas_welcome") cands.push("orient");
```
Place it FIRST in the candidate order (it is the very first thing to teach). The existing `plant`/`assign`/`winter`/`dusk`/`town` candidates stay.

- [ ] **Step 3: Remove the Day-screen counsel** dependency for tips — none needed here; the counsel removal is Task 4. (This task is tips only.)

- [ ] **Step 4: Update `tutorial.test.mjs`** — add/adjust: with tutorials on, reaching `silas_welcome` yields `pendingTip().id === "orient"`; reaching the planting phase yields `plant` with a 2-page array (both planting strings, no coin/HUD orientation string). Fix any test that assumed `plant`'s first page was the orientation text.

- [ ] **Step 5:** Run `cd prototype2 && npx vitest run tests/tutorial.test.mjs` → PASS. Commit.
```bash
git add prototype2/src/content/tips.js prototype2/tests/tutorial.test.mjs
git commit -m "feat(proto2): orient tip at Silas's welcome; planting tips shown together (legibility task 2)"
```

## Task 3: The winter-goal panel redesign (spec C)

**Files:** Modify `prototype2/src/render/screens.js` (the `goalPanel` helper), `prototype2/src/styles/screens.css`; add a render test to `tests/screens.test.mjs`.

- [ ] **Step 1: Failing test** (append to `tests/screens.test.mjs`):
```javascript
describe("the winter goal panel", () => {
  it("shows have/need with a bar and a met/short state", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    const dispatch = () => {};
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    const panel = root.querySelector(".goals");
    expect(panel).toBeTruthy();
    expect(panel.textContent).toMatch(/0\s*\/\s*40/);   // wood have/need
    expect(panel.querySelector(".goalbar")).toBeTruthy();
  });
});
```

- [ ] **Step 2:** Replace the `goalPanel(s)` helper in `screens.js` with:
```javascript
// The cold-months targets, read plainly: have / need with a bar, green when met, amber short.
function goalPanel(s) {
  const n = yearNeeds(s);
  const row = (label, have, need) => {
    const met = have >= need;
    const pct = Math.max(2, Math.min(100, Math.round((have / (need || 1)) * 100)));
    return el("div", { class: "goalrow2" }, [
      el("div", { class: "goal-line" }, [
        el("span", { class: "goal-k t-choice", text: label }),
        el("span", { class: "goal-fig t-sub" + (met ? " good" : " warn") }, [
          document.createTextNode(`${have} / ${need} `),
          el("span", { class: "goal-note", text: met ? "✓ laid in" : `(${need - have} to go)` }),
        ]),
      ]),
      el("div", { class: "goalbar" }, [el("div", { class: "goalbar-fill" + (met ? " good" : " warn"), style: `width:${pct}%` })]),
    ]);
  };
  return el("div", { class: "goals" }, [
    el("div", { class: "goals-h t-label", text: "To last the winter, lay in —" }),
    row("Wood", n.fuel.have, n.fuel.need),
    row("Food", n.food.have, n.food.need),
  ]);
}
```

- [ ] **Step 3: CSS** (replace/extend the `.goals` rules in `screens.css`):
```css
.goals { border: 1px solid var(--rule-fine); padding: 12px 14px; margin-bottom: 14px; }
.goals-h { margin-bottom: 10px; }
.goalrow2 { margin-bottom: 12px; }
.goalrow2:last-child { margin-bottom: 0; }
.goal-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
.goal-fig { font-family: "Courier Prime", monospace; font-style: normal; }
.goal-fig.good { color: var(--good); }
.goal-fig.warn { color: var(--warn); }
.goal-note { font-size: .82rem; }
.goalbar { height: 8px; background: var(--paper); border: 1px solid var(--rule-fine); border-radius: 3px; overflow: hidden; }
.goalbar-fill { height: 100%; }
.goalbar-fill.good { background: var(--good); }
.goalbar-fill.warn { background: var(--warn); }
```
(Remove the now-unused old `.goalrow`/`.goal-v` rules if nothing else uses them.)

- [ ] **Step 4:** Run `cd prototype2 && npx vitest run tests/screens.test.mjs -t "winter goal panel"` → PASS. Commit.
```bash
git add prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): redesign the winter-goal panel — have/need bars (legibility task 3)"
```

## Task 4: Legibility — Tiredness read + stat tags + remove counsel (spec D.1, D.2, B.4)

**Files:** Modify `prototype2/src/core/selectors.js`, `prototype2/src/render/screens.js`, `prototype2/src/styles/screens.css`; add tests.

- [ ] **Step 1: Failing tests.** In `tests/standing.test.mjs` or a new `tests/effects.test.mjs`, add:
```javascript
import { actionEffects, playerActionEffects, tirednessAdvice } from "../src/core/selectors.js";
describe("action effect tags", () => {
  it("tags crew tasks with gains and the tiredness cost", () => {
    expect(actionEffects("chop").some((e) => /Wood/.test(e.label) && e.valence === "good")).toBe(true);
    expect(actionEffects("chop").some((e) => /Tiredness/.test(e.label) && e.valence === "bad")).toBe(true);
    expect(actionEffects("rest").some((e) => /Tiredness/.test(e.label) && e.valence === "good")).toBe(true);
  });
  it("tags player actions", () => {
    expect(playerActionEffects("forage").some((e) => /Food/.test(e.label))).toBe(true);
  });
  it("gives a plain tiredness verdict per condition", () => {
    expect(tirednessAdvice({ strain: 0, alive: true })).toMatch(/fine/i);
    expect(tirednessAdvice({ strain: 30, alive: true })).toMatch(/soon/i);
    expect(tirednessAdvice({ strain: 60, alive: true })).toMatch(/now/i);
  });
});
```

- [ ] **Step 2: `selectors.js`** — add (near `conditionOf`):
```javascript
// Plain-language verdict on a hand's tiredness, for the day screen (spec D.1).
export function tirednessAdvice(hand) {
  const c = conditionOf(hand);
  return c === "failing" ? "rest him now" : c === "worn" ? "rest him soon" : "fine to work";
}

// The effect tags shown on a crew task button (spec D.2). Green gains, red costs. Any real
// work tires the crew (matches resolveDay: hard labor adds strain, rest recovers it), so the
// tag grammar teaches the rest-vs-work tradeoff. Single source of truth for the tag text.
export function actionEffects(task) {
  switch (task) {
    case "rest":    return [{ label: "−Tiredness", valence: "good" }];
    case "tend":    return [{ label: "+Growth", valence: "good" }, { label: "+Tiredness", valence: "bad" }];
    case "harvest": return [{ label: "+Yield", valence: "good" }, { label: "+Tiredness", valence: "bad" }];
    case "forage":  return [{ label: "+Food", valence: "good" }, { label: "+Tiredness", valence: "bad" }];
    case "chop":    return [{ label: "+Wood", valence: "good" }, { label: "+Tiredness", valence: "bad" }];
    default:        return [];
  }
}

// The effect tags for the player's own actions. The player has no tiredness track, so no
// self-cost; "care" eases a hand's tiredness.
export function playerActionEffects(kind) {
  switch (kind) {
    case "forage": return [{ label: `+${BALANCE.forageFood} Food`, valence: "good" }];
    case "work":   return [{ label: "+Growth", valence: "good" }];
    case "care":   return [{ label: "−Tiredness", valence: "good" }];
    default:       return []; // rest: a calm day, no effect
  }
}
```

- [ ] **Step 3: `screens.js` — the Tiredness read.** Replace the `strainMeter(h)` helper so it reads "Tiredness" with the verdict (import `tirednessAdvice`):
```javascript
function strainMeter(h) {
  const cond = conditionOf(h);
  const pct = Math.min(100, Math.round((h.strain / BALANCE.strain.lostAt) * 100));
  return el("div", { class: "strain cond-" + cond }, [
    el("span", { class: "strain-word t-label", text: "Tiredness" }),
    el("div", { class: "strain-bar" }, [el("div", { class: "strain-fill", style: `width:${Math.max(3, pct)}%` })]),
    el("span", { class: "strain-advice t-sub", text: tirednessAdvice(h) }),
  ]);
}
```

- [ ] **Step 4: `screens.js` — stat tags on crew tasks.** In the `day:` renderer's crew loop, the task buttons currently show just a label. Add the effect tags into each button. Import `actionEffects`. Replace the taskbtn creation so a valid (unblocked) task appends its tags:
```javascript
      const sel = el("div", { class: "taskpick" }, TASKS.map(([task, label]) => {
        const blocked = !!why[task];
        const tags = blocked ? [] : actionEffects(task).map((e) =>
          el("span", { class: "efftag " + e.valence, text: e.label }));
        return el("button", { class: "taskbtn t-sub" + (h.task === task ? " sel" : "") + (blocked ? " disabled" : ""),
          ...(blocked ? { disabled: true, title: why[task] } : {}),
          onClick: blocked ? undefined : () => dispatch({ type: "ASSIGN", handId: h.id, task,
            targetFieldId: task === "tend" ? plantedFields[0].id : task === "harvest" ? ripeList[0].id : undefined }) },
          [el("span", { class: "tb-label", text: label }), ...tags]);
      }));
```
Remove the now-redundant `TASK_DESC` line under each row (the tags replace it), OR keep a short description; prefer removing `TASK_DESC` to avoid duplication.

- [ ] **Step 5: `screens.js` — stat tags on player actions + remove counsel.** In `personalActions`, add the tags to each `.pa-action` (import `playerActionEffects`), appending after the label/desc:
```javascript
        ...playerActionEffects(o.kind).map((e) => el("span", { class: "efftag " + e.valence, text: e.label })),
```
And in the `day:` renderer, **remove the `stage.append(...counsel(s));` line** (spec B.4 — delete the "I have set us to the work…" block). Leave `counsel` used by the planting screen if it still calls it; if `counselFor` returns text for the `day` phase, drop that branch in `content/counsel.js` so no day counsel is produced.

- [ ] **Step 6: CSS** — add to `screens.css`:
```css
.efftag { font-family: "Courier Prime", monospace; font-style: normal; font-size: .72rem; margin-left: 6px; }
.efftag.good { color: var(--good); }
.efftag.bad { color: var(--bad); }
.taskbtn .tb-label { font-style: normal; }
.strain-advice { margin-left: 8px; }
```

- [ ] **Step 7:** Run `cd prototype2 && npx vitest run tests/effects.test.mjs tests/screens.test.mjs` → PASS. Then full suite; fix any test that asserted `TASK_DESC` text or the old counsel on the day screen. Commit.
```bash
git add prototype2/src/core/selectors.js prototype2/src/render/screens.js prototype2/src/content/counsel.js prototype2/src/styles/screens.css prototype2/tests/
git commit -m "feat(proto2): Tiredness read + stat tags on every action; drop day counsel (legibility task 4)"
```

## Task 5: Tending made visible + Phase-1 verify (spec D.3)

**Files:** Modify `prototype2/src/render/components.js`, possibly `prototype2/src/core/balance.js`; verify.

- [ ] **Step 1:** In `components.js` `fieldCard`, extend the existing tended badge to name the effect: change the `field.tended` badge text from `"worked today ✓"` to `"tended today ✓ · +growth"`.

- [ ] **Step 2: Make the bonus large enough to feel.** Check `BALANCE.tendGrowthBonus` (currently 0.05/day on a 0.1/day base). Over a season a tended potato should ripen at least ONE day sooner than untended. If 0.05 never moves the integer ripen-day in `fieldProjection`, raise `tendGrowthBonus` (e.g. to 0.1, doubling a tended day's growth) so tending demonstrably pulls a harvest in. Confirm with a quick unit check in `tests/projection.test.mjs` (add: a field tended N days projects an earlier `daysToRipe` than untended). Q-003 owns the final value; the requirement is that tending visibly pays off.

- [ ] **Step 3: Full suite.** `cd prototype2 && npx vitest run` → all green. Report counts.

- [ ] **Step 4: Browser verify Phase 1.** Dev server on 4321. Confirm: naming screen trimmed; intro paging doesn't jump; the orientation tip appears at Silas's Welcome (with tutorials on) and the two planting tips together at sowing; the Day screen has NO counsel block; the goal panel reads "Wood 0 / 40 (40 to go)" with bars; Reuben's row says "Tiredness … fine to work"; every task/action shows green/red tags; tending a field shows "+growth" and the bar moves. Screenshot the Day screen. Fix console errors.

- [ ] **Step 5: Commit.**
```bash
git add prototype2/src/render/components.js prototype2/src/core/balance.js prototype2/tests/projection.test.mjs
git commit -m "feat(proto2): visible tending (+growth badge, felt bonus) + Phase-1 verify (legibility task 5)"
```

---

# PHASE 2 — The town walk (spec E)

## Task 6: State + reducer — walk to a place, leave town

**Files:** Modify `prototype2/src/core/state.js`, `prototype2/src/core/reducer.js`; add tests to `tests/town.test.mjs`.

- [ ] **Step 1:** Add `townAt: null` to `initialState` (the current walkable place id, null = the town overview).

- [ ] **Step 2: Failing tests** (append to `tests/town.test.mjs`):
```javascript
describe("walking the town", () => {
  it("WALK_TO sets the current place and costs no action", () => {
    let s = inTown(1);
    const acts0 = s.playerActionsLeft;
    s = reduce(s, { type: "WALK_TO", place: "saloon" });
    expect(s.townAt).toBe("saloon");
    expect(s.playerActionsLeft).toBe(acts0); // free
    expect(s.screen).toBe("town");
  });
  it("WALK_TO null returns to the town overview", () => {
    let s = reduce(inTown(1), { type: "WALK_TO", place: "saloon" });
    s = reduce(s, { type: "WALK_TO", place: null });
    expect(s.townAt).toBe(null);
  });
  it("LEAVE_TOWN heads home and clears the place", () => {
    let s = reduce(inTown(1), { type: "WALK_TO", place: "saloon" });
    s = reduce(s, { type: "LEAVE_TOWN" });
    expect(s.screen).toBe("home");
    expect(s.townAt).toBe(null);
  });
});
```
(`inTown` already exists in this file; it puts state in the day phase.)

- [ ] **Step 3: Reducer.** Add cases + keep them trivial/pure:
```javascript
    case "WALK_TO":
      return { ...state, screen: "town", townAt: action.place || null };
    case "LEAVE_TOWN":
      return { ...state, screen: "home", townAt: null };
```
Also: when the player leaves the town tab by other means it's fine for `townAt` to persist; but `closeScene`'s `returnTo: "town"` should keep the player at the place they were. Since a talk is opened from a place, on close returning to `screen: "town"` with `townAt` intact lands them back at that place — good, no change needed (townAt is untouched by VISIT/closeScene).

- [ ] **Step 4:** Run `cd prototype2 && npx vitest run tests/town.test.mjs` → PASS. Commit.
```bash
git add prototype2/src/core/state.js prototype2/src/core/reducer.js prototype2/tests/town.test.mjs
git commit -m "feat(proto2): WALK_TO / LEAVE_TOWN town navigation state (town-walk task 6)"
```

## Task 7: The town-walk renderer (overview → place → talk → home)

**Files:** Modify `prototype2/src/render/screens.js`, `prototype2/src/styles/screens.css`; add render tests to `tests/screens.test.mjs`.

- [ ] **Step 1: Failing tests** (append to `tests/screens.test.mjs`):
```javascript
describe("the town walk", () => {
  function town(mut) {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    state = { ...state, screen: "town", ...(mut || {}) };
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    return { root, get: () => state };
  }
  it("the overview lists places to walk to and a way home", () => {
    const { root, get } = town();
    const walk = root.querySelector(".walkbtn");
    expect(walk).toBeTruthy();
    expect([...root.querySelectorAll("button")].some((b) => /farm|home/i.test(b.textContent))).toBe(true);
    walk.click();
    expect(get().townAt).toBeTruthy(); // walking set a place
  });
  it("at a place the scene paints and offers a talk", () => {
    const { root } = town({ townAt: "saloon" });
    expect(root.querySelector(".place-scene")).toBeTruthy();
    expect([...root.querySelectorAll(".loc-talk")].some((b) => /Talk to/i.test(b.textContent))).toBe(true);
  });
});
```

- [ ] **Step 2:** Rewrite the `town:` renderer in `screens.js`. Imports needed (extend existing): `townOffers, standingOf, standingWord, nextTownScene` from selectors, `LOCATIONS` from `../core/town.js`, `tok`, `L`. Structure — overview when `!s.townAt`, else the place:
```javascript
  town: (stage, s, dispatch) => {
    const canAct = s.phase === "day" && s.playerActionsLeft > 0;
    const why = s.phase !== "day" ? "Come back during the day." : s.playerActionsLeft <= 0 ? "You are spent for the day." : null;
    const home = () => el("button", { class: "homebtn t-label", text: "← Head back to the farm",
      onClick: () => dispatch({ type: "LEAVE_TOWN" }) });

    if (!s.townAt) {
      // Overview: the day's paid work, then the places you can walk to.
      const { jobs } = townOffers(s);
      stage.append(
        el("div", { class: "eyebrow t-label", text: "Marrow's Cross" }),
        el("h2", { class: "t-title", text: "Where to?" }),
        el("p", { class: "t-sub townhint", text: canAct ? `You have ${s.playerActionsLeft} of the day to spend here.` : (why || "The town is quiet.") }),
      );
      stage.append(el("div", { class: "eyebrow t-label townsub", text: "Work going" }));
      for (const j of jobs) {
        const blocked = !canAct || j.done;
        stage.append(el("div", { class: "jobcard" }, [
          el("div", { class: "jobline t-choice", text: j.line }),
          el("div", { class: "jobmeta t-sub", text: j.done ? "done today" : (why || `+${j.coin} coin · ${tok("{{npc." + j.giver + "}}")}`) }),
          el("button", { class: "jobtake t-label" + (blocked ? " disabled" : ""), ...(blocked ? { disabled: true } : {}),
            text: j.done ? "done" : `Take it (+${j.coin})`, onClick: blocked ? undefined : () => dispatch({ type: "ACCEPT_JOB", id: j.id }) }),
        ]));
      }
      stage.append(el("div", { class: "eyebrow t-label townsub", text: "The town" }));
      for (const l of LOCATIONS) {
        stage.append(el("div", { class: "townloc" }, [
          el("div", { class: "loc-head" }, [
            el("span", { class: "loc-who t-choice", text: tok("{{loc." + l.loc + ".sub}}") }),
            el("span", { class: "loc-why t-sub", text: l.purpose }),
          ]),
          el("button", { class: "walkbtn t-label", text: "Walk there →", onClick: () => dispatch({ type: "WALK_TO", place: l.id }) }),
        ]));
      }
      stage.append(home());
      return;
    }

    // At a place: paint the scene, then the encounters (talk; a job if this NPC gives one).
    const l = LOCATIONS.find((x) => x.id === s.townAt) || LOCATIONS[0];
    const canTalk = canAct;
    stage.append(
      el("div", { class: "eyebrow t-label", text: tok("{{loc." + l.loc + ".cap}}") }),
      el("h2", { class: "t-title", text: tok("{{loc." + l.loc + ".sub}}") }),
      el("p", { class: "place-scene t-prose", text: tok("{{loc." + l.loc + ".desc}}") }),
      el("div", { class: "loc-standing t-label", text: `${tok("{{npc." + l.npc + "}}")} · ${standingWord(standingOf(s, l.npc))}` }),
      el("button", { class: "loc-talk t-choice" + (canTalk ? "" : " disabled"), ...(canTalk ? {} : { disabled: true }),
        text: `Talk to ${tok("{{npc." + l.npc + "}}")}`, onClick: canTalk ? () => dispatch({ type: "VISIT", npc: l.npc }) : undefined }),
      ...(canTalk ? [] : [el("p", { class: "t-sub", text: why })]),
      el("div", { class: "place-nav" }, [
        el("button", { class: "walkbtn t-label", text: "← Walk on", onClick: () => dispatch({ type: "WALK_TO", place: null }) }),
        home(),
      ]),
    );
  },
```
(The place vignette reuses the location's `desc` from `names.yaml` — already evocative scene-setting prose, so no new content is required for this task.)

- [ ] **Step 3: CSS** — add to `screens.css`:
```css
.walkbtn, .homebtn { cursor: pointer; background: none; border: 1px solid var(--rule-fine); color: var(--lamp); padding: 6px 12px; letter-spacing: .03em; }
.walkbtn:hover, .homebtn:hover { border-color: var(--lamp); }
.homebtn { margin-top: 16px; }
.place-scene { margin: 6px 0 12px; }
.place-nav { display: flex; gap: 10px; margin-top: 16px; }
.townloc { align-items: center; }
```
(Keep the existing `.townloc`/`.jobcard`/`.loc-*` rules; `.loc-standing` already exists.)

- [ ] **Step 4:** Run `cd prototype2 && npx vitest run tests/screens.test.mjs tests/town.test.mjs` → PASS. Full suite green. Commit.
```bash
git add prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): the town walk — overview → place scene → talk, with a way home (town-walk task 7)"
```

## Task 8: Reuben's town tip + full verify

**Files:** Modify `prototype2/src/content/tips.js`; verify.

- [ ] **Step 1:** Update the `town` tip to reflect walking (Reuben's voice, no em dashes): riding in shows the places; walking about is free; calling on a body or taking work spends a piece of the day; the more you call on someone the more they tell you; head home when you are done.

- [ ] **Step 2: Full suite.** `cd prototype2 && npx vitest run` → all green. Report counts.

- [ ] **Step 3: Browser verify Phase 2.** New Game → into a day → "Ride to Marrow's Cross" → the overview lists places + "Work going" + "Head back to the farm". **Walk to the Saloon** (free — action count unchanged), the scene paints, **Talk to Meredith** opens her talk (spends an action) and returns to the place; **Walk on** returns to the overview; **Head back to the farm** returns to the Day screen. Screenshot the place scene. Fix console errors.

- [ ] **Step 4: Commit.**
```bash
git add prototype2/src/content/tips.js
git commit -m "feat(proto2): Reuben's town tip reflects walking (town-walk task 8)"
```

---

## Self-Review notes (author)

- **Spec coverage:** A (Task 1), B (Tasks 2 + 4-counsel), C (Task 3), D.1/D.2 (Task 4), D.3 (Task 5), E incl. return-home (Tasks 6-7). Note 9 (no way home) → the `homebtn` in Task 7.
- **Type/name consistency:** `actionEffects`/`playerActionEffects` return `{label,valence}[]`; `tirednessAdvice(hand)→string`; `WALK_TO {place}` / `LEAVE_TOWN`; `state.townAt`. The tag valence reuses the `good`/`bad` classes already in the CSS. Consistent across tasks.
- **Single source of truth:** the stat tags derive from `actionEffects`/`playerActionEffects`, which mirror `resolveDay`'s actual effects (all hard labor tires; rest recovers) — a drift test could be added later.
- **No content lift for town-walk:** place vignettes reuse the existing `names.yaml` location `desc`.
