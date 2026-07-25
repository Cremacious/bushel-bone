# Imagery Layer: Plates and Speaker Portraits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Give every scene a location "plate" (a woodcut illustration in an engraved border with an always-visible place-name caption) and, when a character speaks, a portrait over it, so the player always knows where they are and who is talking. Real art comes later; for now each plate and portrait renders as a described placeholder.

**Architecture:** A persistent plate area in the frame (between the masthead and the ledger). A `SETTINGS` manifest maps a setting id to a caption and a placeholder description; an `NPCS` manifest maps a speaker id to a name, role, and portrait description. `setPlate(settingId, speakerId)` updates the area. Scenes declare their `setting` and optional `speaker`; `card()` calls `setPlate` when it renders. Until art exists, the plate shows the description text (from the scene's bracketed stage-direction or the manifest) inside the woodcut frame.

**Tech Stack:** Single-file `prototype/year1.html`, Vitest + jsdom. Source of truth: `docs/superpowers/specs/2026-07-25-reuben-foreman-and-imagery-design.md` section 7. No-dash rule applies. Chosen play-screen layout (spec 7.4): masthead, then plate with caption (and portrait when someone speaks), then ledger, then the card, then the Ask Reuben bar.

**Branch:** `feat/imagery-plates` off `main`.

**Task order:** Task 1 adds the plate slot, manifests, and placeholder rendering (additive, defaults to the homestead, changes nothing else). Task 2 moves the bracketed stage-direction into the plate and annotates the six scripted beats with setting and speaker. Task 3 annotates the systemic events and any remaining scenes. Task 4 is the final review and merge.

---

## Task 1: The plate slot, the manifests, and placeholder rendering

**Files:** Modify `prototype/year1.html`; Create `prototype/tests/plate.test.mjs`.

- [ ] **Step 1: Create `prototype/tests/plate.test.mjs`:**
```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("plate", () => {
  it("defaults to the homestead caption on boot", () => {
    const { doc } = boot();
    expect(doc.getElementById("plate-cap").textContent).toContain("Homestead");
    expect(doc.getElementById("plate-desc").textContent.length).toBeGreaterThan(0);
  });

  it("setPlate updates the caption and shows a described placeholder", () => {
    const { doc, T } = boot();
    T.setPlate("town", null);
    expect(doc.getElementById("plate-cap").textContent).toContain("Marrow's Cross");
    expect(doc.getElementById("plate-portrait").hidden).toBe(true);
  });

  it("a speaker shows a portrait with a nameplate", () => {
    const { doc, T } = boot();
    T.setPlate("town", "silas");
    expect(doc.getElementById("plate-portrait").hidden).toBe(false);
    expect(doc.getElementById("plate-nameplate").textContent).toContain("Silas");
  });
});
```

- [ ] **Step 2: Run** `cd prototype && npm test -- plate` and confirm FAIL.

- [ ] **Step 3: Add the markup** immediately AFTER the masthead block and BEFORE the ledger (read the file to place it correctly):
```html
    <div class="plate-wrap" id="plate-wrap">
      <div class="plate" id="plate">
        <div class="plate-tag">plate</div>
        <div class="plate-desc" id="plate-desc"></div>
        <div class="plate-portrait" id="plate-portrait" hidden>
          <div class="silh"><div class="head"></div><div class="neck"></div><div class="shoulders"></div></div>
          <div class="nameplate" id="plate-nameplate"></div>
        </div>
      </div>
      <div class="plate-cap" id="plate-cap"></div>
    </div>
```

- [ ] **Step 4: Add CSS** in the `<style>` block:
```css
  .plate-wrap{ padding:8px 12px 0; }
  .plate{ position:relative; height:120px; border:2px solid var(--rule); border-radius:2px; box-shadow:0 0 0 2px var(--paper-2), 0 0 0 3px var(--rule); overflow:hidden; background:repeating-linear-gradient(135deg,#26201a 0 3px,#2e2720 3px 6px),#2a2420; }
  .plate-tag{ position:absolute; top:5px; left:5px; font-size:8px; letter-spacing:.12em; text-transform:uppercase; color:#b09a63; border:1px solid #6a5a34; border-radius:8px; padding:1px 6px; }
  .plate-desc{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; text-align:center; padding:14px; font-size:12px; font-style:italic; color:#b09a63; line-height:1.4; }
  .plate-portrait{ position:absolute; bottom:0; right:10px; width:66px; height:78px; background:linear-gradient(#3a3229,#241d15); border:1px solid var(--accent); border-bottom:0; border-radius:8px 8px 0 0; }
  .plate-portrait[hidden]{ display:none; }
  .plate-portrait .silh .head{ position:absolute; bottom:20px; left:50%; transform:translateX(-50%); width:26px; height:27px; border-radius:50% 50% 47% 47%; background:#0d0b07; }
  .plate-portrait .silh .neck{ position:absolute; bottom:16px; left:50%; transform:translateX(-50%); width:13px; height:8px; background:#0d0b07; }
  .plate-portrait .silh .shoulders{ position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:54px; height:24px; background:#0d0b07; border-radius:26px 26px 0 0; }
  .plate-nameplate{ position:absolute; bottom:6px; left:-2px; background:rgba(20,16,10,.85); border:1px solid var(--accent); border-radius:4px; padding:2px 7px; transform:translateX(calc(-100% - 4px)); white-space:nowrap; }
  .plate-nameplate b{ font-size:10px; color:#e9d19a; display:block; } .plate-nameplate span{ font-size:8px; color:#b09a63; }
  .plate-cap{ text-align:center; padding:5px 0 6px; border-bottom:3px double var(--rule); }
  .plate-cap b{ font-size:14px; letter-spacing:.06em; color:var(--ink); font-variant:small-caps; } .plate-cap span{ font-size:11px; color:var(--ink-soft); font-style:italic; }
```

- [ ] **Step 5: Add the manifests and `setPlate`** inside the IIFE:
```js
  const SETTINGS = {
    homestead:{ cap:"The Homestead", sub:"the yard", desc:"the homestead: four cleared fields, a lean-to, and a well capped in iron at the property's edge" },
    fields:{ cap:"The Homestead", sub:"the fields", desc:"the four fields under an open sky" },
    town:{ cap:"Marrow's Cross", sub:"the town green", desc:"a green between a white church and a low saloon, the town gathered" },
    church:{ cap:"Marrow's Cross", sub:"the church", desc:"the church at midnight, every candle lit, a capped well through the open door" },
    saloon:{ cap:"Marrow's Cross", sub:"the saloon", desc:"the saloon by lamplight, Meredith Vane behind the bar" },
    wagon:{ cap:"The Track", sub:"Vane's wagon", desc:"a black wagon hung with lanterns on the property track" },
    gate:{ cap:"The Homestead", sub:"the gate at dusk", desc:"the gate at the fence-line as the light goes" },
  };
  const NPCS = {
    farmer:{ name:"You", role:"the newcomer", desc:"the newcomer, weathered and wary" },
    reuben:{ name:"Reuben", role:"your foreman", desc:"Reuben, a field hand with a steady, tired face" },
    silas:{ name:"Silas Ridley", role:"the banker", desc:"lean and correct, a good coat gone a little shabby" },
    halloway:{ name:"Mayor Halloway", role:"the mayor", desc:"expansive and florid, a politician's warmth" },
    grange:{ name:"Preacher Grange", role:"the preacher", desc:"gaunt and grave" },
    meredith:{ name:"Meredith Vane", role:"the saloonkeeper", desc:"sharp-eyed and knowing" },
    bell:{ name:"Doc Bell", role:"the doctor", desc:"dry and watchful behind spectacles" },
    bess:{ name:"Bess Halloway", role:"the mayor's daughter", desc:"young and direct, quick to read a face" },
    ruth:{ name:"Sister Ruth", role:"the church's charity", desc:"plain and kind, and misses nothing" },
    coldwater:{ name:"Sheriff Coldwater", role:"the law", desc:"cool and still, a long stare" },
    ambrose:{ name:"Dr. Ambrose Vane", role:"the clone merchant", desc:"courteous, and does not quite meet the eye" },
    nan:{ name:"Old Nan", role:"the folk-magic woman", desc:"old and watchful, at the edge of things" },
  };
  function setPlate(settingId, speakerId, descOverride){
    if(settingId) S.currentSetting = settingId;
    const s = SETTINGS[S.currentSetting] || SETTINGS.homestead;
    document.getElementById("plate-desc").textContent = "[ " + (descOverride || s.desc) + " ]";
    document.getElementById("plate-cap").innerHTML = '<b>'+s.cap+'</b> · <span>'+s.sub+'</span>';
    const pp = document.getElementById("plate-portrait"), np = document.getElementById("plate-nameplate");
    const n = speakerId && NPCS[speakerId];
    if(n){ np.innerHTML = '<b>'+n.name+'</b><span>'+n.role+'</span>'; pp.hidden = false; }
    else { pp.hidden = true; }
  }
```

- [ ] **Step 6: Default the setting.** In `newGame`, add `currentSetting:"homestead",` to the state object.

- [ ] **Step 7: Drive the plate from `card()`.** Find the `card(spec)` function. After it paints, call:
```js
    setPlate(spec.setting, spec.speaker, spec.dir ? spec.dir.replace(/^\[|\]$/g,"").trim() : null);
```
Place this at the END of `card()` (after `paint(...)` and any wiring), so the plate reflects the scene. When a card omits `setting`, `setPlate(undefined,...)` keeps the current setting (so sub-screens of one place do not reset it). If `spec.dir` is present it becomes the placeholder description (the bracketed stage-directions are our plate briefs); otherwise the manifest description is used.

- [ ] **Step 8: Call `setPlate("homestead")` once at boot** after the first render, so the plate is populated on load (if `card()` already fired for the first screen, this is covered; add an explicit `setPlate("homestead", null)` right before `tutInit()` at the boot tail to be safe).

- [ ] **Step 9: Add `setPlate` to `window.__BB_TEST__`.**

- [ ] **Step 10: Run** `cd prototype && npm test`. The plate tests pass and ALL existing tests still pass. In particular the smoke playthrough is unaffected (the plate is display only).

- [ ] **Step 11: Commit**
```bash
git add prototype/year1.html prototype/tests/plate.test.mjs
git commit -m "feat: location plate slot with placeholder rendering and portraits"
```
End the body with the Co-Authored-By trailer.

**Constraint:** all manifest text is dash-free. The plate is purely presentational; it must not change game state or the flow.

---

## Task 2: Move the stage-direction into the plate; annotate the six scripted beats

**Files:** Modify `prototype/year1.html`; Create `prototype/tests/plate-scenes.test.mjs`.

- [ ] **Step 1: Stop rendering `dir` inside the card body** (it now lives in the plate). In `card()`, remove the line that renders `spec.dir` as a `.stagedir` paragraph. The plate already shows it (Task 1 Step 7). Keep passing `dir` in specs; it is now the plate description source.

- [ ] **Step 2: Annotate the six scripted beats** with `setting` and `speaker`. Add the fields to each `card({...})` spec:
  - Silas's Welcome: `setting:"homestead", speaker:"silas"`
  - First Furrow: `setting:"town", speaker:"halloway"`
  - Vane's Wagon: `setting:"wagon", speaker:"ambrose"`
  - The moral fork: `setting:"fields", speaker:"reuben"`
  - Harvest Home: `setting:"town", speaker:"bess"`
  - The Long Vigil: `setting:"church", speaker:"grange"`

- [ ] **Step 3: Write `prototype/tests/plate-scenes.test.mjs`** that drives the game to the Silas beat and asserts the plate shows the banker and the homestead. (Advance from boot until `plate-nameplate` contains "Silas"; assert within a step budget.)

- [ ] **Step 4: Run** `cd prototype && npm test`. All pass.

- [ ] **Step 5: Commit** (`feat: move stage-directions into the plate; annotate scripted beats`), Co-Authored-By trailer.

---

## Task 3: Annotate systemic events and remaining scenes

**Files:** Modify `prototype/year1.html`.

- [ ] **Step 1: Give each systemic event and each brief/dusk card a `setting`** (and `speaker` where a named NPC speaks): the Foundling at `gate`, Doc Bell's rumor at `saloon` speaker `bell`, Sister Ruth's basket at `homestead` speaker `ruth`, the Sour omen at `homestead` speaker `nan`, weather and field events at `fields`, dusk reports at `homestead`. Anything unspecified defaults to the current setting, which is acceptable.

- [ ] **Step 2: Manual check + smoke.** Run the full suite; play a year in a browser and confirm the plate changes with the scene and the right speaker appears.

- [ ] **Step 3: Commit** (`content: set plate settings and speakers across the Year-1 scenes`), Co-Authored-By trailer.

---

## Task 4: Final review and merge

- [ ] Dispatch a code-quality reviewer over `main...feat/imagery-plates` (focus: the plate never affects game state or the flow; the `dir` removal did not drop any needed text; no duplicate ids; dash rule; the portrait nameplate placement is sane; the smoke and all suites pass).
- [ ] Fix any Important issues, re-run tests.
- [ ] Merge `--no-ff` to `main`, verify tests, delete the branch.

---

## Self-Review

**Spec coverage (section 7):** the plate with woodcut border and always-visible caption (Task 1), the speaker portrait over it (Task 1), placeholders from the stage-directions (Tasks 1 to 2), and the play-screen layout order (Task 1 markup placement). Covered.

**Placeholder scan:** none; every step has real code or a concrete annotation list.

**Type consistency:** `setPlate(settingId, speakerId, descOverride)` is called the same way from `card()` and the tests. `SETTINGS`/`NPCS` ids used in annotations (Tasks 2 to 3) all exist in the Task 1 manifests. `S.currentSetting` is created in `newGame` and read by `setPlate`.

**Risk:** removing the `.stagedir` render from `card()` (Task 2) changes how scenes look. It is within the approved layout (spec 7.4) and the text is preserved in the plate. If a scene relied on `dir` for something other than a stage-direction, catch it in the Task 4 review.
