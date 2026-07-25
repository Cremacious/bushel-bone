# Foreman, Farmhand Roster, and Ask Reuben Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Reuben the Foreman (the single voice of the farmhand collective, the tutor, and the Reckoning alarm), give every hand a first-class roster with per-hand assignment, and let the player promote a new Foreman if Reuben dies. Built into the existing single-file prototype.

**Architecture:** Refactor the prototype's split clone model (`S.reuben` plus `S.hands[]`) into one unified `S.hands[]` array with a `S.foremanId`. Add a lightweight overlay layer over the existing linear card flow so the roster and the Ask Reuben panels can open at any time without losing the current card. Add three pure logic units (guidance selection, Reckoning-tier alarm detection, Foreman promotion) that are unit-tested, plus jsdom smoke tests that drive the real UI.

**Tech Stack:** Plain HTML/CSS/JS single file (`prototype/year1.html`, no framework, no build), tested with Vitest + jsdom. A minimal test-only hook (`window.__BB_TEST__`) exposes internals to tests without affecting gameplay.

**Source of truth:** `docs/superpowers/specs/2026-07-25-reuben-foreman-and-imagery-design.md`. All new in-game text obeys the no-dash rule in `docs/style-guide.md` (no em dash, no hyphen-as-pause).

**Scope note:** This plan covers the Foreman, the roster, per-hand assignment, promotion-on-death, and the Ask Reuben tutor and alarm. The imagery layer (location plates and speaker portraits) and the tutorial are separate plans. This plan uses a simple placeholder portrait silhouette for the Ask Reuben panel; the real portrait treatment comes with the imagery plan.

---

## Task 0: Test harness

**Files:**
- Create: `prototype/package.json`
- Create: `prototype/tests/helpers.mjs`
- Create: `prototype/tests/smoke.test.mjs`
- Create: `prototype/.gitignore` (ignore `node_modules`)

- [ ] **Step 1: Create `prototype/package.json`**

```json
{
  "name": "bushel-bone-prototype",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "jsdom": "^24.0.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create `prototype/.gitignore`**

```
node_modules/
```

- [ ] **Step 3: Create `prototype/tests/helpers.mjs`** (loads the game in jsdom and exposes the test hook)

```js
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";

const here = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(here, "..", "year1.html");

// Boot a fresh game in jsdom. Returns { dom, win, doc, T } where
// T === window.__BB_TEST__ (the internals hook added in Task 1).
export function boot() {
  const html = readFileSync(htmlPath, "utf8");
  const full = "<!doctype html><html><head></head><body>" + html + "</body></html>";
  const dom = new JSDOM(full, { runScripts: "dangerously", pretendToBeVisual: true });
  const win = dom.window;
  const doc = win.document;
  const T = win.__BB_TEST__;
  if (!T) throw new Error("window.__BB_TEST__ hook missing (Task 1 not done)");
  return { dom, win, doc, T };
}

// Click the first enabled advance button on the current card. Returns false
// when an end screen is reached (no advance button).
export function advance(doc) {
  const stage = doc.getElementById("stage");
  if (doc.getElementById("again")) return false;
  const btns = [...stage.querySelectorAll(".btn[data-c]")].filter(b => !b.hasAttribute("disabled"));
  if (!btns.length) return false;
  (btns.find(b => b.classList.contains("primary")) || btns[0]).click();
  return true;
}
```

- [ ] **Step 4: Create `prototype/tests/smoke.test.mjs`** (guards that the game still runs end to end)

```js
import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

describe("smoke", () => {
  it("boots with the test hook and a starting Foreman named Reuben", () => {
    const { T } = boot();
    const S = T.getState();
    expect(S.foremanId).toBeTruthy();
    expect(T.foreman().name).toBe("Reuben");
  });

  it("plays a full year to an end screen without crashing", () => {
    const { doc } = boot();
    let steps = 0;
    while (advance(doc) && steps < 400) steps++;
    expect(steps).toBeLessThan(400);
    expect(doc.getElementById("again")).toBeTruthy();
  });
});
```

- [ ] **Step 5: Install and run**

Run: `cd prototype && npm install && npm test`
Expected: FAIL on the first test ("window.__BB_TEST__ hook missing") because Task 1 has not run yet. This confirms the harness is wired.

- [ ] **Step 6: Commit**

```bash
git add prototype/package.json prototype/.gitignore prototype/tests/
git commit -m "test: add vitest+jsdom harness for the prototype"
```

---

## Task 1: Unify the clone model and add the test hook

Replace the `S.reuben` special case with a single `S.hands[]` array plus `S.foremanId`. Keep gameplay identical. Add the `window.__BB_TEST__` hook.

**Files:**
- Modify: `prototype/year1.html` (the `<script>`: `newGame`, the `bodies/livingHands/extraHands/allHands` helpers, `renderLedger`, `assignStep`, `winterResolve`, and every `S.reuben` reference in the scripted beats and systemic events)

- [ ] **Step 1: Write failing tests** in `prototype/tests/model.test.mjs`

```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("unified clone model", () => {
  it("starts with one hand, Reuben, who is the Foreman", () => {
    const { T } = boot();
    const S = T.getState();
    expect(S.hands.length).toBe(1);
    expect(S.hands[0].id).toBe("reuben");
    expect(S.hands[0].isForeman ?? (S.foremanId === "reuben")).toBeTruthy();
    expect(T.livingHands().length).toBe(1);
    expect(T.extraHands()).toBe(0);
  });

  it("foreman() returns the living foreman, or null if dead", () => {
    const { T } = boot();
    expect(T.foreman().name).toBe("Reuben");
    T.getState().hands[0].alive = false;
    expect(T.foreman()).toBe(null);
  });

  it("condition() derives a word from morale and flags", () => {
    const { T } = boot();
    const h = T.getState().hands[0];
    h.morale = 5; expect(T.condition(h)).toBe("in good heart");
    h.morale = 1; expect(T.condition(h)).toBe("worn");
    h.ill = true; expect(T.condition(h)).toBe("ill");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd prototype && npm test -- model`
Expected: FAIL (hands array and helpers not in new shape).

- [ ] **Step 3: Rewrite the state shape in `newGame`**

Replace the `reuben` and `hands` fields with a unified array. In `newGame`, change:

```js
      reuben:{ name:"Reuben", morale:3, alive:true, ill:false },
      hands:[],                     // extra clones {name,morale,alive}
```

to:

```js
      hands:[ mkHand("reuben","Reuben","Field Hand",3,{body:"average",mind:"average"}) ],
      foremanId:"reuben",
      alarmedTiers:{ Warnings:false, Walkers:false },
```

- [ ] **Step 4: Add the hand factory and helpers** (near the other helpers, replacing `bodies/livingHands/extraHands/allHands` and adding `mkHand/foreman/handById/condition`)

```js
  let HAND_SEQ = 0;
  function mkHand(id, name, trait, morale, extra){
    return Object.assign({ id: id || ("h"+(++HAND_SEQ)), name, trait, morale, alive:true, ill:false, task:null,
                           body:"average", mind:"average", hungry:false }, extra||{});
  }
  function livingHands(){ return S.hands.filter(h=>h.alive); }
  function foreman(){ return S.hands.find(h=>h.id===S.foremanId && h.alive) || null; }
  function handById(id){ return S.hands.find(h=>h.id===id); }
  function bodies(){ return 1 + livingHands().length; }         // farmer + living hands
  function extraHands(){ return Math.max(0, livingHands().length - 1); }
  function allHands(){ return livingHands(); }
  function condition(h){
    if(!h.alive) return "lost";
    if(h.ill) return "ill";
    if(h.hungry) return "hungry";
    if(h.morale<=1) return "worn";
    if(h.morale>=4) return "in good heart";
    return "steady";
  }
```

- [ ] **Step 5: Replace every `S.reuben` reference.** In the scripted beats and systemic events, `S.reuben` becomes `foreman()` (the pivotal hand in Year 1 is the Foreman). Use a safe accessor so a dead Foreman never throws:

```js
  function fore(){ return foreman() || livingHands()[0] || null; }
```

Then mechanically replace `S.reuben.morale`, `S.reuben.alive`, etc. with `const f=fore(); if(f) f.morale...`. Concretely, in each beat that did `if(S.reuben.morale<5)S.reuben.morale++;`, replace with `const f=fore(); if(f&&f.morale<5)f.morale++;`. Apply to: First Furrow, the moral fork (both choices), Harvest Home, the Hot Wind, A Name of His Own, Cabin Fever, and the Sister Ruth / winter beats. The moral fork's field logic is unchanged.

- [ ] **Step 6: Update `renderLedger` household row** to iterate `S.hands` and mark the Foreman:

```js
    let hh = "";
    livingHands().forEach(h=>{
      const fore = h.id===S.foremanId ? ' <span style="font-size:9px;color:var(--accent)">(foreman)</span>' : '';
      hh += '<span><span class="lab">'+h.name+'</span>'+dots(h.morale)+fore+'</span>';
    });
    S.hands.filter(h=>!h.alive).forEach(h=>{ hh += '<span><span class="lab">'+h.name+'</span><span style="color:var(--bad)">a marked grave</span></span>'; });
    hh += '<span><span class="lab">Regard</span><span class="regard">'+regardWord()+'</span></span>';
    document.getElementById("household").innerHTML = hh;
```

- [ ] **Step 7: Update `winterResolve`** to operate on `S.hands`. Replace the `S.reuben`/`S.hands` split logic: the farmer is implicit (not in `S.hands`); freeze/starve loops iterate `livingHands()` sorted by morale. Replace the two references (`allHands()` already returns `livingHands()`; the food loop's `S.hands.filter(...).concat(S.reuben...)` becomes `livingHands()`).

```js
    // FUEL: freeze frailest hands first; farmer last
    let clones = livingHands().slice().sort((a,b)=>a.morale-b.morale);
    // ... existing freeze loop, but frail.alive=false on the hand objects ...

    // FOOD: farmer eats first, then hands strongest-first
    let fed = livingHands().slice().sort((a,b)=>b.morale-a.morale);
    fed.forEach(h=>{ /* existing 15 / 7 / starve logic on h */ });
```

- [ ] **Step 8: Update Vane's Wagon and Foundling** to push unified hands:

```js
// Grower:
S.hands.push(mkHand(null, pick(["Della","Tace","Wick","Merrit"]), "Grower", 3, {body:"strong",mind:"plain"}));
// Field Hand:
S.hands.push(mkHand(null, pick(["Amos","Pell","Bry","Cass"]), "Field Hand", 3, {}));
// Foundling:
S.hands.push(mkHand(null, pick(["Wren","Cob","Lark","Fen"]), "Foundling", 2, {mind:"wary"}));
```

- [ ] **Step 9: Add the test hook** at the very end of the IIFE, before `runStep()`:

```js
  if (typeof window !== "undefined") {
    window.__BB_TEST__ = { getState:()=>S, foreman, fore, livingHands, extraHands, condition,
                           reckBand, reubenGuidance:()=>reubenGuidance(), checkReckoningAlarm,
                           promoteForeman, assignHand };
  }
```

(Some of these are defined in later tasks; add them to the hook as those tasks land. For Task 1, include only what exists: `getState, foreman, fore, livingHands, extraHands, condition, reckBand`.)

- [ ] **Step 10: Run tests**

Run: `cd prototype && npm test`
Expected: PASS for `model` and `smoke` (the game still plays a full year, now on the unified model).

- [ ] **Step 11: Commit**

```bash
git add prototype/year1.html prototype/tests/model.test.mjs
git commit -m "refactor: unify clone model into hands[] + foremanId (behavior unchanged)"
```

---

## Task 2: Overlay layer and the persistent Ask Reuben bar

Add a reusable overlay (a panel that opens over the current card and closes back to it) and a persistent Ask Reuben bar under the stage.

**Files:**
- Modify: `prototype/year1.html` (CSS: add `.overlay`, `.askbar`; markup: add the bar and an overlay root; JS: `openOverlay(html, wire)`, `closeOverlay()`)

- [ ] **Step 1: Write failing test** `prototype/tests/overlay.test.mjs`

```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("overlay + ask bar", () => {
  it("has a persistent Ask Reuben bar", () => {
    const { doc } = boot();
    expect(doc.getElementById("askbar")).toBeTruthy();
    expect(doc.getElementById("askbar").textContent.toLowerCase()).toContain("ask reuben");
  });

  it("opens and closes an overlay without disturbing the stage", () => {
    const { doc, T } = boot();
    const before = doc.getElementById("stage").innerHTML;
    T.openOverlay("<p id='probe'>hello</p>");
    expect(doc.getElementById("probe")).toBeTruthy();
    T.closeOverlay();
    expect(doc.getElementById("probe")).toBeFalsy();
    expect(doc.getElementById("stage").innerHTML).toBe(before);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd prototype && npm test -- overlay`
Expected: FAIL (no askbar, no openOverlay).

- [ ] **Step 3: Add CSS** (in the `<style>` block)

```css
  .overlay-root{ position:fixed; inset:0; display:none; z-index:50; }
  .overlay-root.on{ display:block; }
  .overlay-scrim{ position:absolute; inset:0; background:rgba(20,16,10,.55); }
  .overlay-panel{ position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
    width:min(94vw,480px); max-height:88vh; overflow:auto;
    background:var(--paper-2); border:1px solid var(--rule); border-radius:6px;
    box-shadow:0 24px 60px -18px var(--shadow); }
  .askbar{ display:flex; align-items:center; gap:8px; padding:8px 20px; border-top:1px solid var(--rule);
    background:color-mix(in srgb,var(--paper-3) 45%, transparent); cursor:pointer; }
  .askbar .rdot{ width:18px; height:18px; border-radius:50%; background:#0e0c09; border:1px solid var(--accent); flex:0 0 auto; }
  .askbar .rtx{ font-size:13px; color:var(--ink-soft); } .askbar .rtx b{ color:var(--ink); }
  .askbar .rq{ margin-left:auto; font-size:15px; color:var(--accent); }
  .askbar[hidden]{ display:none; }
```

- [ ] **Step 4: Add markup** right after the `</main>` (the stage) and before the colophon:

```html
    <div class="askbar" id="askbar" role="button" tabindex="0" aria-label="Ask Reuben">
      <span class="rdot"></span><span class="rtx"><b>Ask Reuben</b> what to do</span><span class="rq">?</span>
    </div>
```

And add the overlay root just before the closing `</div>` of `#almanac`:

```html
    <div class="overlay-root" id="overlay"><div class="overlay-scrim" id="overlay-scrim"></div><div class="overlay-panel" id="overlay-panel"></div></div>
```

- [ ] **Step 5: Add JS**

```js
  function openOverlay(html, wire){
    const root=document.getElementById("overlay"), panel=document.getElementById("overlay-panel");
    panel.innerHTML = html; root.classList.add("on");
    if(wire) wire(panel);
  }
  function closeOverlay(){ document.getElementById("overlay").classList.remove("on"); document.getElementById("overlay-panel").innerHTML=""; }
  document.getElementById("overlay-scrim").addEventListener("click", closeOverlay);
  document.getElementById("askbar").addEventListener("click", openAskReuben); // defined in Task 5
```

Add `openOverlay, closeOverlay` to the `__BB_TEST__` hook. Guard the askbar handler so it no-ops until Task 5 defines `openAskReuben` (define a temporary `function openAskReuben(){ openOverlay("<div style=\"padding:18px\">Reuben is here.</div>"); }` now; Task 5 replaces it).

- [ ] **Step 6: Run tests**

Run: `cd prototype && npm test -- overlay`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add prototype/year1.html prototype/tests/overlay.test.mjs
git commit -m "feat: overlay layer + persistent Ask Reuben bar"
```

---

## Task 3: The farmhand roster overlay

A roster listing every hand with morale, condition, task, and trait badges, the Foreman set apart, opened from the ledger household row (tap to view the crew).

**Files:**
- Modify: `prototype/year1.html` (CSS for `.roster*`; JS `renderRoster()`, `openRoster()`; wire the household row to open it)

- [ ] **Step 1: Write failing test** `prototype/tests/roster.test.mjs`

```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("roster", () => {
  it("lists every living hand and marks the Foreman", () => {
    const { doc, T } = boot();
    T.getState().hands.push(T.mkHand(null, "Della", "Grower", 2, { body:"strong" }));
    T.openRoster();
    const txt = doc.getElementById("overlay-panel").textContent;
    expect(txt).toContain("Reuben");
    expect(txt).toContain("Della");
    expect(txt.toLowerCase()).toContain("foreman");
    expect(txt.toLowerCase()).toContain("grower");
  });
});
```

(Expose `mkHand` and `openRoster` on the hook.)

- [ ] **Step 2: Run to verify failure**

Run: `cd prototype && npm test -- roster`
Expected: FAIL.

- [ ] **Step 3: Add `renderRoster()` and `openRoster()`**

```js
  function moraleDots(n){ return '<span class="dots">'+"●".repeat(Math.max(0,n))+'<span class="off">'+"●".repeat(Math.max(0,5-n))+'</span></span>'; }
  function taskLabel(h){
    if(!h.task) return "no task set";
    return { rest:"Resting", chop:"Chopping wood", harvest:"Harvesting",
             tend:"Tending "+(h.task.fieldId!=null?fieldName(S.fields[h.task.fieldId]):"a field") }[h.task.type] || "at work";
  }
  function renderRoster(){
    const fm = foreman();
    let rows = livingHands().map(h=>{
      const isF = h.id===S.foremanId;
      const traits = [h.trait].concat(h.body&&h.body!=="average"?["Body "+h.body]:[]).concat(h.mind&&h.mind!=="average"?["Mind "+h.mind]:[]);
      return '<div class="hand'+(isF?' foreman':'')+'" data-hand="'+h.id+'">'+
        '<div class="htop"><div class="hn"><span class="nm">'+h.name+'</span>'+
          (isF?'<span class="badge fore">Foreman</span>':'')+
          traits.map(t=>'<span class="badge trait">'+t+'</span>').join('')+
        '</div><div class="hmorale">'+moraleDots(h.morale)+'</div></div>'+
        '<div class="hmeta"><span class="task">'+taskLabel(h)+'</span> <span class="cond">'+condition(h)+'</span></div>'+
      '</div>';
    }).join('');
    const voice = fm ? '<div class="voice"><span class="who">'+fm.name+' speaks for the hands</span><p>'+collectiveLine()+'</p></div>' : '<div class="voice"><p>There is no foreman to speak for them.</p></div>';
    return '<div class="rosterhdr"><b>The Hands</b><span>'+livingHands().length+' housed</span></div>'+voice+rows;
  }
  function openRoster(){
    openOverlay(renderRoster(), panel=>{
      panel.querySelectorAll('.hand[data-hand]').forEach(el=>{
        el.addEventListener('click',()=>openHand(el.dataset.hand)); // openHand: Task 4
      });
    });
  }
```

`collectiveLine()` is defined in Task 8; add a temporary `function collectiveLine(){ return "The crew holds."; }` now.

- [ ] **Step 4: Add CSS** for `.hand`, `.foreman`, `.badge`, `.hmeta`, `.task`, `.cond`, `.voice`, `.rosterhdr` (port the styles from the approved roster mockup, adapting the phone-scale sizes up to full size; keep semantic condition colors: `.cond` uses `--ink-soft`, and add `.cond.worn{color:var(--warn)} .cond.hungry{color:var(--bad)} .cond.ill{color:var(--bad)}` by tagging the span with the condition class).

- [ ] **Step 5: Wire the household row** to open the roster. In `renderLedger`, wrap the household content so the row is clickable:

```js
    document.getElementById("household").style.cursor = "pointer";
    document.getElementById("household").onclick = openRoster;
```

- [ ] **Step 6: Run tests**

Run: `cd prototype && npm test -- roster`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add prototype/year1.html prototype/tests/roster.test.mjs
git commit -m "feat: farmhand roster overlay with Foreman treatment"
```

---

## Task 4: Per-hand assignment

Tapping a hand in the roster opens an assign panel; the Foreman offers a read first. Route the dawn assignment through this so the whole crew is assignable.

**Files:**
- Modify: `prototype/year1.html` (JS: `openHand(id)`, `assignHand(id, task)`; refactor `assignStep` to assign every hand via the roster)

- [ ] **Step 1: Write failing test** `prototype/tests/assign.test.mjs`

```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("assignment", () => {
  it("assignHand sets a hand's task", () => {
    const { T } = boot();
    T.assignHand("reuben", { type:"chop" });
    expect(T.getState().hands[0].task).toEqual({ type:"chop" });
  });

  it("chopping lays in fuel at resolution", () => {
    const { T } = boot();
    const fuel0 = T.getState().fuel;
    T.assignHand("reuben", { type:"chop" });
    T.applyLabor();               // applies each hand's task effects for the season
    expect(T.getState().fuel).toBe(fuel0 + 16);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd prototype && npm test -- assign`
Expected: FAIL.

- [ ] **Step 3: Add `assignHand`, `openHand`, and `applyLabor`**

```js
  function assignHand(id, task){ const h=handById(id); if(h&&h.alive) h.task=task; }
  function openHand(id){
    const h=handById(id); if(!h) return;
    const fm=foreman();
    const advice = (fm && fm.id!==id) ? '<div class="foreadvice"><span class="who">'+fm.name+"'s read</span>"+foremanReadOf(h)+'</div>' : '';
    const planted = S.fields.filter(f=>f.crop);
    const opts = [
      {t:"Let them rest", sub:"their heart mends", task:{type:"rest"}},
      planted.length?{t:"Tend a field", sub:"+2 yield on it", task:{type:"tend", fieldId:planted[0].id}}:null,
      {t:"Chop wood", sub:"+16 fuel", task:{type:"chop"}},
      {t:"Harvest", sub:"bring in the ripe fields", task:{type:"harvest"}},
    ].filter(Boolean);
    const html = '<div class="rosterhdr"><b>'+h.name+'</b><span>'+condition(h)+'</span></div>'+advice+
      opts.map((o,i)=>'<div class="aopt" data-i="'+i+'"><div>'+o.t+'<small>'+o.sub+'</small></div><span class="arrow">▸</span></div>').join('');
    openOverlay(html, panel=>{
      panel.querySelectorAll('.aopt[data-i]').forEach(el=>{
        el.addEventListener('click',()=>{ assignHand(id, opts[+el.dataset.i].task); openRoster(); });
      });
    });
  }
  function applyLabor(){
    livingHands().forEach(h=>{
      if(!h.task) return;
      if(h.task.type==="chop") S.fuel += 16;
      else if(h.task.type==="rest"){ if(h.morale<5)h.morale++; }
      else if(h.task.type==="tend"){ const f=S.fields[h.task.fieldId]; if(f&&f.crop) f.tended=true; }
      // harvest handled by the existing harvestStep (labor availability)
    });
  }
  function foremanReadOf(h){
    if(h.ill) return '"'+h.name+"'s poorly. Rest, or lose them.\"";
    if(h.morale<=1) return '"'+h.name+" is spent. Rest'd do them good.\"";
    if(condition(h)==="hungry") return '"'+h.name+" is going hungry. Feed them before you spend them.\"";
    return '"'+h.name+" is willing. Put them where you need them.\"";
  }
```

- [ ] **Step 4: Refactor `assignStep`** to assign the whole crew through the roster instead of only Reuben. Replace the body of `assignStep` with a card that opens the roster for assignment, then advances:

```js
  function assignStep(opts){
    // opts kept for compatibility; the season's allowed tasks are the roster's.
    card({ eyebrow:"Dawn · the hands", title:"Set the crew to work",
      body:'<div class="prose"><p class="note">Tap the roster to give each hand a task for the season. Reuben gives his read on each.</p></div>',
      choices:[{t:"Open the roster", primary:true, go:()=>{ openRoster(); }},
               {t:"Work it as set", sub:"keep the tasks you have chosen", go:()=>{ applyLabor(); clearTasksForNextSeason(); next(); }}] });
  }
  function clearTasksForNextSeason(){ livingHands().forEach(h=>h.task=null); }
```

Note: `applyLabor` must run exactly once per season, at the moment the player leaves assignment. Move any fuel/tend/rest effects out of the old per-choice handlers (they now live in `applyLabor`). Verify the smoke test still reaches an end screen (labor still happens).

- [ ] **Step 5: Add to the test hook:** `assignHand, applyLabor, openHand, mkHand, openRoster`.

- [ ] **Step 6: Run tests**

Run: `cd prototype && npm test`
Expected: PASS (assign, roster, model, overlay, smoke).

- [ ] **Step 7: Commit**

```bash
git add prototype/year1.html prototype/tests/assign.test.mjs
git commit -m "feat: per-hand assignment through the roster"
```

---

## Task 5: Ask Reuben, the tutor

The Ask Reuben bar opens a panel: a context-aware "what should I be doing?" plus "how are the hands?" and dismiss.

**Files:**
- Modify: `prototype/year1.html` (JS: `reubenGuidance()`, `openAskReuben()`, replace the temporary bar handler)

- [ ] **Step 1: Write failing test** `prototype/tests/guidance.test.mjs`

```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("reubenGuidance", () => {
  it("tells a new player to plant when fields are bare in a planting season", () => {
    const { T } = boot();
    const g = T.reubenGuidance();
    expect(g.toLowerCase()).toMatch(/seed|plant|ground/);
  });

  it("warns about fuel when fall arrives with none laid in", () => {
    const { T } = boot();
    const S = T.getState();
    S.si = 2; S.fuel = 0;                       // Fall, no fuel
    S.fields.forEach(f=>{ f.crop="potato"; f.progress=1; });
    expect(T.reubenGuidance().toLowerCase()).toMatch(/fuel|wood|winter|cold/);
  });

  it("falls back to a steady line when nothing is urgent", () => {
    const { T } = boot();
    const S = T.getState();
    S.fields.forEach(f=>{ f.crop="potato"; f.progress=0.5; });
    expect(typeof T.reubenGuidance()).toBe("string");
    expect(T.reubenGuidance().length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd prototype && npm test -- guidance`
Expected: FAIL.

- [ ] **Step 3: Implement `reubenGuidance()`** (priority-ordered, no dashes, in his voice)

```js
  function reubenGuidance(){
    const s = season();
    const bare = S.fields.filter(f=>!f.crop).length;
    const planting = (s==="Spring"||s==="Summer"||s==="Fall");
    const low = livingHands().filter(h=>h.morale<=1 || h.hungry || h.ill);
    // 1. bare fields in a planting season
    if(planting && bare>0)
      return "You have "+bare+" field"+(bare>1?"s":"")+" lying bare and a larder that will not see us to spring on its own. Get seed in the ground. Potatoes fill a belly.";
    // 2. no fuel heading into the cold
    if((s==="Fall"||s==="Winter") && S.fuel < winterFuelNeed())
      return "There is not near enough wood laid in for the cold. Put a hand on the woodline, or buy coal in town, before winter closes the road.";
    // 3. the hands are suffering
    if(low.length)
      return "The hands are low. "+low[0].name+" most of all. A rest, or a full supper, and they will work the better for it.";
    // 4. thin larder
    if(S.food < 25)
      return "The larder is running thin. Sell less and keep more of what the fields give, or we go hungry come the dark months.";
    // 5. steady
    return "We are holding for now. Keep the fields worked and the larder filling, and mind the town's regard. I will speak up if the ground turns.";
  }
```

- [ ] **Step 4: Implement `openAskReuben()`** (replace the temporary handler from Task 2)

```js
  function openAskReuben(){
    const fm = foreman();
    if(!fm){ openOverlay('<div class="rosterhdr"><b>No foreman</b></div><div class="prose" style="padding:0 16px 16px"><p>You have named no one to speak for the hands. Open the roster and make one your foreman.</p></div>'); return; }
    const port = '<div class="talkport"><div class="silh"><div class="head"></div><div class="neck"></div><div class="shoulders"></div></div><div class="nameplate"><b>'+fm.name+'</b><span>your foreman</span></div></div>';
    const answer = '<div class="answer" id="reuben-answer">'+reubenGuidance()+'</div>';
    const asks = [
      {t:"What should I be doing?", fn:()=>{ document.getElementById("reuben-answer").innerHTML = reubenGuidance(); }},
      {t:"How are the hands?", fn:()=>{ document.getElementById("reuben-answer").innerHTML = collectiveLine(); }},
      {t:"Nothing, carry on", fn:closeOverlay},
    ];
    const html = port + '<div class="body">'+answer + asks.map((a,i)=>'<div class="ask" data-i="'+i+'">'+a.t+'</div>').join('') + '</div>';
    openOverlay(html, panel=>{ panel.querySelectorAll('.ask[data-i]').forEach(el=>el.addEventListener('click',()=>asks[+el.dataset.i].fn())); });
  }
```

Add CSS for `.talkport`, `.silh`, `.answer`, `.ask` (port from the approved Ask Reuben mockup). Add `reubenGuidance, openAskReuben` to the hook.

- [ ] **Step 5: Run tests**

Run: `cd prototype && npm test -- guidance`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add prototype/year1.html prototype/tests/guidance.test.mjs
git commit -m "feat: Ask Reuben tutor panel with context-aware guidance"
```

---

## Task 6: The Reckoning alarm (first-only per tier)

When the hidden Reckoning crosses into a new tier for the first time this run, Reuben interrupts with a warning. No number shown.

**Files:**
- Modify: `prototype/year1.html` (JS: `checkReckoningAlarm()`, `showReckoningAlarm(band)`, call after Reckoning increases)

- [ ] **Step 1: Write failing test** `prototype/tests/alarm.test.mjs`

```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("reckoning alarm", () => {
  it("fires once when crossing into Warnings, not again within the tier", () => {
    const { T } = boot();
    const S = T.getState();
    S.reckoning = 30;                 // Warnings band
    expect(T.checkReckoningAlarm()).toBe("Warnings");
    expect(S.alarmedTiers.Warnings).toBe(true);
    S.reckoning = 40;                 // still Warnings
    expect(T.checkReckoningAlarm()).toBe(null);
  });

  it("fires again when crossing into Walkers", () => {
    const { T } = boot();
    const S = T.getState();
    S.reckoning = 30; T.checkReckoningAlarm();
    S.reckoning = 60;                 // Walkers
    expect(T.checkReckoningAlarm()).toBe("Walkers");
    expect(S.alarmedTiers.Walkers).toBe(true);
  });

  it("stays silent in Whispers", () => {
    const { T } = boot();
    T.getState().reckoning = 10;
    expect(T.checkReckoningAlarm()).toBe(null);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd prototype && npm test -- alarm`
Expected: FAIL.

- [ ] **Step 3: Implement the detector** (pure; returns the tier just crossed, or null)

```js
  function checkReckoningAlarm(){
    const band = reckBand();
    if(band==="Warnings" && !S.alarmedTiers.Warnings){ S.alarmedTiers.Warnings = true; return "Warnings"; }
    if(band==="Walkers" && !S.alarmedTiers.Walkers){ S.alarmedTiers.Walkers = true; return "Walkers"; }
    return null;
  }
```

- [ ] **Step 4: Implement the alarm overlay**

```js
  const ALARM_TEXT = {
    Warnings: "Hold a moment. The hands feel it and now so do I. The ground has took against something you have done. Milk turns though the cow is sound, and the crows will not leave the rail. Ease off, or it will come to collect. I would not see it collect from us.",
    Walkers:  "You will want to hear this. What we laid down is not staying down. There are prints in the frost that start at the graves and end at our door. I have seen this before, on a place that is not there anymore. Make it right while there is still a right to make.",
  };
  function showReckoningAlarm(band){
    const html = '<div class="alarm"><div class="talkport warn"><div class="silh"><div class="head"></div><div class="neck"></div><div class="shoulders"></div></div><div class="nameplate"><b>'+foreman().name+'</b><span>grim</span></div></div>'+
      '<div class="warnlabel">a word from your foreman</div>'+
      '<div class="warntext">'+ALARM_TEXT[band]+'</div>'+
      '<div class="warnacts"><div class="wbtn pri" data-a="heed">I hear you.</div><div class="wbtn" data-a="press">The work comes first.</div></div></div>';
    openOverlay(html, panel=>{ panel.querySelectorAll('.wbtn[data-a]').forEach(el=>el.addEventListener('click',closeOverlay)); });
  }
  function maybeAlarm(){ if(!foreman()) return; const b=checkReckoningAlarm(); if(b) showReckoningAlarm(b); }
```

- [ ] **Step 5: Call `maybeAlarm()` after the Reckoning can rise.** In `duskStep`, right after the drift line `if(S.flags.crueltyThisSeason) S.reckoning += 2; ...`, and after any immediate cruelty (`markCruelty` sites that also bump reckoning, e.g. turning out the foundling), call `maybeAlarm()`. Simplest single hook: call `maybeAlarm()` at the start of the Dusk render, before the omen is chosen, so the warning lands before the season closes.

- [ ] **Step 6: Add CSS** for `.talkport.warn` (the dread glow), `.warnlabel`, `.warntext`, `.warnacts`, `.wbtn` (port from the approved alarm mockup). Add `checkReckoningAlarm, showReckoningAlarm` to the hook.

- [ ] **Step 7: Run tests**

Run: `cd prototype && npm test`
Expected: PASS across all files.

- [ ] **Step 8: Commit**

```bash
git add prototype/year1.html prototype/tests/alarm.test.mjs
git commit -m "feat: Reuben's Reckoning alarm (first-only per tier per run)"
```

---

## Task 7: Promotion on death

If the Foreman dies, prompt the player to name a new one from the surviving hands. Until they do, no guidance and no alarm.

**Files:**
- Modify: `prototype/year1.html` (JS: `promoteForeman(id)`, `needsForeman()`, a promotion prompt shown when opening the roster or Ask Reuben with a dead Foreman)

- [ ] **Step 1: Write failing test** `prototype/tests/promote.test.mjs`

```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("promotion on death", () => {
  it("foreman() is null when the foreman dies, guidance is unavailable", () => {
    const { T } = boot();
    const S = T.getState();
    S.hands.push(T.mkHand("della","Della","Grower",3,{}));
    S.hands[0].alive = false;                 // Reuben dies
    expect(T.foreman()).toBe(null);
    expect(T.needsForeman()).toBe(true);
  });

  it("promoteForeman installs a new foreman", () => {
    const { T } = boot();
    const S = T.getState();
    S.hands.push(T.mkHand("della","Della","Grower",3,{}));
    S.hands[0].alive = false;
    T.promoteForeman("della");
    expect(T.foreman().name).toBe("Della");
    expect(T.needsForeman()).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd prototype && npm test -- promote`
Expected: FAIL.

- [ ] **Step 3: Implement**

```js
  function needsForeman(){ return !foreman() && livingHands().length>0; }
  function promoteForeman(id){ const h=handById(id); if(h&&h.alive){ S.foremanId=id; } }
  function openPromote(){
    const html = '<div class="rosterhdr"><b>Name a new foreman</b></div><div class="prose" style="padding:0 16px 8px"><p>Reuben is in the ground. The hands need one of their own to speak for them, and you need a right hand. Choose.</p></div>'+
      livingHands().map(h=>'<div class="aopt" data-id="'+h.id+'"><div>'+h.name+'<small>'+h.trait+'</small></div><span class="arrow">▸</span></div>').join('');
    openOverlay(html, panel=>{ panel.querySelectorAll('.aopt[data-id]').forEach(el=>el.addEventListener('click',()=>{ promoteForeman(el.dataset.id); closeOverlay(); })); });
  }
```

- [ ] **Step 4: Gate the roster and Ask Reuben** on `needsForeman()`: in `openRoster` and `openAskReuben`, if `needsForeman()` call `openPromote()` instead. The bar text updates to "Name a new foreman" while `needsForeman()`.

- [ ] **Step 5: Add to hook:** `promoteForeman, needsForeman, openPromote`.

- [ ] **Step 6: Run tests**

Run: `cd prototype && npm test`
Expected: PASS across all files.

- [ ] **Step 7: Commit**

```bash
git add prototype/year1.html prototype/tests/promote.test.mjs
git commit -m "feat: promote a new Foreman when Reuben dies"
```

---

## Task 8: The collective voice line

Replace the temporary `collectiveLine()` with one derived from the hands' current morale and condition, spoken by the Foreman.

**Files:**
- Modify: `prototype/year1.html` (JS: `collectiveLine()`)

- [ ] **Step 1: Write failing test** `prototype/tests/collective.test.mjs`

```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("collectiveLine", () => {
  it("names the lowest hand when someone is suffering", () => {
    const { T } = boot();
    const S = T.getState();
    S.hands.push(T.mkHand("della","Della","Grower",1,{}));
    expect(T.collectiveLine()).toContain("Della");
  });

  it("gives a contented line when all are in good heart", () => {
    const { T } = boot();
    T.getState().hands[0].morale = 5;
    expect(typeof T.collectiveLine()).toBe("string");
    expect(T.collectiveLine().length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd prototype && npm test -- collective`
Expected: FAIL (temporary stub returns a fixed string, so the first test fails).

- [ ] **Step 3: Implement**

```js
  function collectiveLine(){
    const hands = livingHands();
    const others = hands.filter(h=>h.id!==S.foremanId);
    const low = hands.slice().sort((a,b)=>a.morale-b.morale)[0];
    if(low && (low.morale<=1 || low.hungry || low.ill))
      return "We will hold, but "+low.name+" is in a bad way. A kind word, or a full plate, would not go amiss.";
    if(others.length===0)
      return "It is just me for now. I will tell you true when the ground turns or the work gets past one pair of hands.";
    if(hands.every(h=>h.morale>=4))
      return "The crew is in good heart. Fed, rested, and willing. Long may it last.";
    return "The hands are steady enough. No complaints worth carrying to you, not today.";
  }
```

Add `collectiveLine` to the hook.

- [ ] **Step 4: Run tests**

Run: `cd prototype && npm test`
Expected: PASS across all files.

- [ ] **Step 5: Commit**

```bash
git add prototype/year1.html prototype/tests/collective.test.mjs
git commit -m "feat: collective voice line derived from the hands' state"
```

---

## Task 9: Full playthrough guard and manual check

- [ ] **Step 1: Extend the smoke test** to open the roster and Ask Reuben mid-run and assert no crash, in `prototype/tests/smoke.test.mjs`:

```js
  it("can open the roster and Ask Reuben mid-run", () => {
    const { doc, T } = boot();
    T.openRoster(); expect(doc.getElementById("overlay").classList.contains("on")).toBe(true);
    T.closeOverlay();
    T.openAskReuben(); expect(doc.getElementById("overlay-panel").textContent.length).toBeGreaterThan(0);
    T.closeOverlay();
  });
```

- [ ] **Step 2: Run the whole suite**

Run: `cd prototype && npm test`
Expected: PASS across model, overlay, roster, assign, guidance, alarm, promote, collective, smoke.

- [ ] **Step 3: Manual smoke in a browser.** Open `prototype/year1.html`, play into Summer, buy a second hand at Vane's wagon, open the roster (tap the household row), assign the new hand a task, open Ask Reuben, and confirm the panels read correctly and the game still advances.

- [ ] **Step 4: Commit**

```bash
git add prototype/tests/smoke.test.mjs
git commit -m "test: roster + Ask Reuben covered in the smoke run"
```

---

## Self-Review

**Spec coverage:**
- Foreman role (voice, tutor, alarm, promotable): Tasks 1, 5, 6, 7, 8. Covered.
- Farmhand roster with morale, condition, task, traits, Foreman set apart: Task 3. Covered.
- Per-hand assignment realizing per-clone-assignment: Task 4. Covered.
- Ask Reuben tutor (context-aware next step, how are the hands): Task 5. Covered.
- Reckoning alarm, first-only per tier, no number: Task 6. Covered.
- Promotion on death, no guidance until promoted: Task 7. Covered.
- Hidden-layer rule (Reckoning never a number): honored, the alarm shows text only. Covered.
- No-dash rule in all new strings: verify in review (grep for the em dash and hyphen-as-pause in the diff).
- Imagery layer (plates, real portraits, play-screen restructure): out of scope for this plan, uses a placeholder silhouette. Deferred to the imagery plan by design.

**Placeholder scan:** the temporary stubs (`collectiveLine`, `openAskReuben` bar handler) are introduced and then replaced within this plan; no stub survives to the end.

**Type consistency:** hand shape `{id,name,trait,morale,alive,ill,task,body,mind,hungry}` is created by `mkHand` (Task 1) and read the same way in Tasks 3 to 8. `task` is `{type, fieldId?}` throughout. `checkReckoningAlarm` returns a tier string or null in Task 6 and its test.

**Final check:** run `cd prototype && npm test` (all green) and grep the diff for dash punctuation before the last commit.
