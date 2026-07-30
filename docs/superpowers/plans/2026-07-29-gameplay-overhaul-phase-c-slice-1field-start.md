# Gameplay Overhaul — Phase C (slice): The 1-Field Start & Clearing Land

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Start the homestead with **one cleared field** and three overgrown ones, and let the player **spend coin to clear** each additional field at an **escalating cost**. This is the first rung of the build-up ladder (spec §6): the "more ground than you can work / save up to expand" carrot, and the moment the day's earned coin (crops + odd-jobs) starts buying growth.

**Architecture:** Additive. Fields gain a `cleared` flag; the reducer gains `CLEAR_FIELD` (spend coin, clear a field) and guards planting to cleared fields only; a `clearCost(state)` selector gives the escalating price. The planting field-grid shows a **Clear this ground · Nm** control on an uncleared cell instead of a crop picker. Pure core stays `(state, action) => state`.

**Tech Stack:** unchanged (vanilla ES modules, vitest/jsdom).

**Design reference:** overhaul spec §6 (the ladder — Land row). Costs are first-pass (Q-003).

**Scope guard (defer):** hiring hands, tools/buildings (plow/well/barn), crop unlocks, market venues — the rest of Phase C/D. This slice is ONLY the land rung + the 1-field start.

---

## File Structure

```
prototype2/src/core/
  state.js        # MODIFY — fields[0].cleared=true, fields[1..3].cleared=false
  balance.js      # MODIFY — clearCosts: [40, 90, 150] (cost of the 2nd/3rd/4th field)
  selectors.js    # MODIFY — clearCost(state): next field's price; clearedFields(s)
  reducer.js      # MODIFY — CLEAR_FIELD; plant() guards on cleared
prototype2/src/render/
  board.js        # MODIFY — uncleared cell shows a Clear control; planting/day boards skip uncleared for crops
  components.js   # MODIFY — fieldCard renders an "overgrown" state for an uncleared field
prototype2/tests/
  clearing.test.mjs   # NEW — cleared flags, clearCost escalation, CLEAR_FIELD, plant guard
  (playthrough|planting|core-state|screens).test.mjs # MODIFY — expect 1 cleared field at start
```

---

## Task 1: State, balance, selector, reducer — the land rung

**Files:** Modify `state.js`, `balance.js`, `selectors.js`, `reducer.js`; create `tests/clearing.test.mjs`.

- [ ] **Step 1: Write the failing test `prototype2/tests/clearing.test.mjs`:**

```javascript
import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { clearCost, clearedFields } from "../src/core/selectors.js";
import { BALANCE } from "../src/core/balance.js";

describe("the 1-field start", () => {
  it("starts with exactly one cleared field", () => {
    const s = initialState(1);
    expect(clearedFields(s).length).toBe(1);
    expect(s.fields[0].cleared).toBe(true);
    expect(s.fields[1].cleared).toBe(false);
  });
  it("clearCost escalates with the number of fields already cleared", () => {
    const s = initialState(1);
    expect(clearCost(s)).toBe(BALANCE.clearCosts[0]); // clearing the 2nd field
    const s2 = { ...s, fields: s.fields.map((f, i) => ({ ...f, cleared: i < 2 })) };
    expect(clearCost(s2)).toBe(BALANCE.clearCosts[1]); // clearing the 3rd
  });
});

describe("CLEAR_FIELD", () => {
  it("clears an uncleared field for coin", () => {
    let s = initialState(1); s = { ...s, coin: 100 };
    const cost = clearCost(s);
    s = reduce(s, { type: "CLEAR_FIELD", fieldId: 1 });
    expect(s.fields[1].cleared).toBe(true);
    expect(s.coin).toBe(100 - cost);
  });
  it("is a no-op when it cannot be afforded or the field is already cleared", () => {
    let s = initialState(1); s = { ...s, coin: 0 };
    expect(reduce(s, { type: "CLEAR_FIELD", fieldId: 1 })).toEqual(s); // too poor
    expect(reduce(s, { type: "CLEAR_FIELD", fieldId: 0 })).toEqual(s); // already cleared
  });
  it("planting an uncleared field is refused", () => {
    let s = initialState(1);
    s = reduce(s, { type: "PLANT", fieldId: 1, crop: "potato" }); // field 1 is overgrown
    expect(s.fields[1].crop).toBe(null);
  });
});
```

- [ ] **Step 2: Run to see it fail.** `cd prototype2 && npx vitest run tests/clearing.test.mjs`

- [ ] **Step 3: `state.js`** — set the `cleared` flag on the starting fields. Change the `fields:` line in `initialState`:
```javascript
    fields: [0, 1, 2, 3].map((i) => ({ id: i, crop: null, progress: 0, fert: 3, taint: 0, tended: false, cleared: i === 0 })),
```

- [ ] **Step 4: `balance.js`** — add the escalating clear costs to the `BALANCE` object:
```javascript
  clearCosts: [40, 90, 150], // coin to clear the 2nd, 3rd, 4th field (Q-003 first pass)
```

- [ ] **Step 5: `selectors.js`** — add:
```javascript
export const clearedFields = (s) => s.fields.filter((f) => f.cleared);

// The coin price to clear the NEXT field, escalating with how many are already cleared.
// Returns null when every field is cleared. (One cleared at the start → first price is
// clearCosts[0].) Guards against running off the end of the table.
export function clearCost(state) {
  const already = clearedFields(state).length;
  const idx = already - 1; // 1 cleared → index 0 (the 2nd field's price)
  return idx >= 0 && idx < BALANCE.clearCosts.length ? BALANCE.clearCosts[idx] : null;
}
```
(Confirm `BALANCE` is already imported in selectors.js — it is.)

- [ ] **Step 6: `reducer.js`** — add the case and helper, and guard `plant`.
In the `switch`, add: `case "CLEAR_FIELD": return clearField(state, action.fieldId);`
Add the helper (import `clearCost` from selectors — extend the existing selectors import line):
```javascript
// Clear an overgrown field for coin, at the escalating price. A no-op if the field is
// already cleared, unknown, or unaffordable. Clearing is a capital purchase (coin only),
// not one of the day's actions.
function clearField(s, id) {
  const f = s.fields.find((x) => x.id === id);
  if (!f || f.cleared) return s;
  const cost = clearCost(s);
  if (cost == null || s.coin < cost) return s;
  return { ...mapField(s, id, (x) => ({ ...x, cleared: true })), coin: s.coin - cost };
}
```
In `plant`, add a guard: after fetching `field`, refuse if not cleared. Change the early-return line:
```javascript
  if (!field || field.crop || !crop) return s;           // taken or unknown crop
```
to:
```javascript
  if (!field || !field.cleared || field.crop || !crop) return s; // uncleared, taken, or unknown crop
```

- [ ] **Step 7: Run to see it pass.** `cd prototype2 && npx vitest run tests/clearing.test.mjs` → PASS.

- [ ] **Step 8: Commit.**
```bash
git add prototype2/src/core/ prototype2/tests/clearing.test.mjs
git commit -m "feat(proto2): 1-field start + CLEAR_FIELD land rung (Phase C slice task 1)"
```

---

## Task 2: Render — clear an overgrown field from the planting grid

**Files:** Modify `prototype2/src/render/board.js`, `prototype2/src/render/components.js`; add a render test to `tests/screens.test.mjs`.

- [ ] **Step 1: Write the failing test** (append to `tests/screens.test.mjs`):
```javascript
describe("clearing land on the planting grid", () => {
  it("an overgrown field shows a Clear control that spends coin to clear it", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
    state = { ...state, coin: 100 };
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    // field 0 cleared → has a crop picker; fields 1-3 overgrown → have a clear button
    const clearBtn = root.querySelector(".fieldcard .clearbtn");
    expect(clearBtn).toBeTruthy();
    clearBtn.click();
    expect(state.fields.filter((f) => f.cleared).length).toBe(2);
  });
});
```

- [ ] **Step 2: Run to see it fail.**

- [ ] **Step 3: `components.js`** — in `fieldCard`, render an "overgrown" body when the field is not cleared (before the `proj.crop` branch). At the top of the crop/fallow decision:
```javascript
  if (!field.cleared) {
    body.append(el("div", { class: "fc-crop t-sub overgrown", text: "overgrown, uncleared" }));
    return el("div", { class: "fieldcard uncleared" }, [head, body, ...(extra ? [extra] : [])]);
  }
```
Place this as the first branch inside `fieldCard` after `head`/`body` are built and before the existing `if (proj.crop) … else …`.

- [ ] **Step 4: `board.js`** — in `plantingCell`, when the field is uncleared, show a Clear control instead of the crop picker. Import `clearCost` from selectors (extend the import). Change the `extra` decision:
```javascript
  let extra;
  if (!f.cleared) {
    const cost = clearCost(s);
    const afford = cost != null && s.coin >= cost;
    extra = el("button", { class: "clearbtn t-sub" + (afford ? "" : " disabled"), ...(afford ? {} : { disabled: true }),
      text: cost == null ? "cleared" : `Clear this ground · ${cost}m`,
      onClick: afford ? () => dispatch({ type: "CLEAR_FIELD", fieldId: f.id }) : undefined });
  } else if (f.crop) {
    extra = el("button", { class: "linkbtn t-sub", text: "clear", onClick: () => dispatch({ type: "FALLOW", fieldId: f.id }) });
  } else {
    extra = el("div", { class: "croppick" }, Object.entries(CROPS).map(([key, c]) => { /* unchanged crop-picker code */ }));
  }
```
Keep the existing crop-picker code intact inside the final `else`. (Read the current `plantingCell` and adapt; do not drop the affordability logic already there.)

- [ ] **Step 5: Styles** — append to `screens.css`:
```css
.fieldcard.uncleared { opacity: .8; border-style: dashed; }
.fc-crop.overgrown { color: var(--ink-faint); font-style: italic; }
.clearbtn { all: unset; cursor: pointer; border: 1px solid var(--lamp); color: var(--lamp);
  padding: 6px 10px; text-align: center; letter-spacing: .03em; }
.clearbtn.disabled { opacity: .45; cursor: not-allowed; border-color: var(--rule-fine); color: var(--ink-faint); }
```

- [ ] **Step 6: Run** `cd prototype2 && npx vitest run tests/screens.test.mjs` → PASS. Commit.
```bash
git add prototype2/src/render/ prototype2/src/styles/screens.css prototype2/tests/screens.test.mjs
git commit -m "feat(proto2): clear overgrown fields from the planting grid (Phase C slice task 2)"
```

---

## Task 3: Green the suite (fewer starting fields) + verify

**Files:** Modify `tests/playthrough.test.mjs`, `tests/planting.test.mjs`, `tests/core-state.test.mjs`, and any other test that assumed 4 plantable fields.

- [ ] **Step 1: Run the full suite** `cd prototype2 && npx vitest run` and read failures. Expect breakage where a test planted or counted all four fields.

- [ ] **Step 2: Fix each:**
  - **playthrough.test.mjs** — the cautious line does `s.fields.forEach(...PLANT...)`; planting an uncleared field is now a no-op, so it will simply plant field 0. That still works, but the year yields less food from one field. If the playthrough now loses Reuben, have the cautious line **clear a second field early when it can afford it** (before planting): `s.fields.forEach((f) => { if (!f.cleared && s.coin >= 60) s = reduce(s, { type: "CLEAR_FIELD", fieldId: f.id }); });` then plant cleared fields. Confirm Reuben survives; the foraging + odd-jobs line should carry it. If needed, tune `BALANCE.clearCosts` or starting coin — note any change.
  - **planting.test.mjs / core-state.test.mjs / screens.test.mjs** — update any assertion that expects 4 plantable/fallow fields or that plants field 1+ directly. A test that plants `fieldId: 1` must first clear it (`CLEAR_FIELD`) or use `fieldId: 0`. Update counts (e.g. "four fallow fields" → one cleared-and-fallow + three overgrown) to match the new start. Keep each test's intent.

- [ ] **Step 3: Full suite green.** `cd prototype2 && npx vitest run` → all pass. Report counts.

- [ ] **Step 4: Browser verify.** Dev server on 4321. New Game → planting: confirm one field offers crops and three show **"Clear this ground · 40m"** (the 2nd at 40, then 90, then 150 as you clear); clearing spends coin and turns the field plantable; you cannot plant an overgrown field. Screenshot the planting grid. Fix any console errors.

- [ ] **Step 5: Commit.**
```bash
git add prototype2/tests
git commit -m "test(proto2): adjust the suite to the 1-field start (Phase C slice task 3)"
```

---

## Self-Review notes (author)

- **Spec coverage:** the Land rung of §6 (start small, escalating clear cost) → Tasks 1-2; the rest of the ladder is deferred by the scope guard.
- **Type/name consistency:** `field.cleared` (bool), `clearCost(state)` (number|null), `clearedFields(s)`, action `CLEAR_FIELD {fieldId}`, `BALANCE.clearCosts` (array). Consistent across tasks.
- **Coin, not action:** clearing is a capital purchase (coin only), deliberately not one of the day's 2 personal actions.
