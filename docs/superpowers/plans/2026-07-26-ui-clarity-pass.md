# UI Clarity Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the legibility gaps in `prototype/year1.html` catalogued by `docs/gameplay-flow.md` §8 and GitHub issue #19: explain the ledger stats, explain the current screen on demand, and make every choice button state its plain-language effect, its cost/benefit, and (when disabled) why.

**Architecture:** Three small, reusable mechanisms, each added and tested in isolation first, then applied in an authoring pass across the ~50 existing choice definitions grouped by season. All mechanisms reuse the existing `openOverlay()` popover and `.btn .sub` conventions already in the file; no new UI chrome beyond one masthead button and clickable ledger cells.

1. **`openInfo(title, html)`** — a thin wrapper over the existing `openOverlay()` that renders a titled info popover using the file's existing `.rosterhdr` / `.prose` classes (no new CSS needed for the popover shell itself).
2. **Screen-type help** — every render path sets a module-level `S.screenType`; a `SCREEN_HELP` lookup and a new masthead "?" button show `openInfo()` for the current screen.
3. **Ledger help** — the four ledger cells become clickable; a `LEDGER_HELP` lookup shows `openInfo()` for the tapped stat.
4. **Choice `tag` / `why`** — `choiceHTML()` grows two optional fields on top of the existing `t`/`sub`/`disabled`: `tag` (a small monospace cost/benefit badge) and `why` (shown instead of `sub` when the choice is disabled).

**Constraint carried through every content task:** the hidden-layer rule in `gameplay-flow.md` §5 — the Reckoning is never shown as a number, name, or explicit tag. Choices that move `S.reckoning` (refusing a name, turning out a foundling) get a `sub`/`tag` for their *other* effects only (morale, regard) and never a tag that names or implies the Reckoning. Existing oblique prose (the italic `<span class="whisper">` lines) is untouched.

**Tech Stack:** Vanilla JS/CSS inside the single `prototype/year1.html` file. Tests: Vitest + jsdom, via `prototype/tests/*.test.mjs` and the existing `boot()` helper in `prototype/tests/helpers.mjs`. Run with `cd prototype && npm test`.

**Voice constraint:** all new copy (help text, `sub`, `tag`, `why` strings) follows `docs/style-guide.md`: alt-1800s register, no em dash, no hyphen-as-pause (D-037).

---

### Task 1: `openInfo()` helper + screen-type help (masthead "?" toggle)

**Files:**
- Modify: `prototype/year1.html` (CSS ~line 120-124, HTML ~line 355-359, JS ~line 693-730)
- Test: `prototype/tests/screen-help.test.mjs` (create)

- [ ] **Step 1: Write the failing test**

Create `prototype/tests/screen-help.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("screen-type help", () => {
  it("tags a brief card as 'brief' and an event card (2+ choices) as 'event'", () => {
    const { win, T } = boot();
    // Spring opens on the intro brief (1 choice, primary advance)
    expect(T.getState().screenType).toBe("brief");
  });

  it("the masthead help button shows the current screen's help text", () => {
    const { doc, T } = boot();
    doc.getElementById("helptog").click();
    const panel = doc.getElementById("overlay-panel");
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(true);
    expect(panel.textContent).toContain(T.SCREEN_HELP[T.getState().screenType]);
  });

  it("planting sets screenType to 'planting', not the 1-choice 'brief' default", () => {
    const { doc, T } = boot();
    // advance past the intro brief and Silas's Welcome to reach planting
    doc.querySelector("#stage .btn[data-c]").click(); // Walk the fields
    doc.querySelector("#stage .btn[data-c]").click(); // Obliged, Mr. Ridley (first choice)
    expect(T.getState().screenType).toBe("planting");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && npm test -- screen-help`
Expected: FAIL — `T.getState().screenType` is `undefined`, `#helptog` does not exist, `T.SCREEN_HELP` is undefined.

- [ ] **Step 3: Add the `screenType` field to state and the `setScreenType`/`SCREEN_HELP`/`openInfo` machinery**

Find the state object creation (search for `function newGame`). Immediately after `S = {` initializes (or right after the state object is assigned), it is simplest to set the field lazily via the setter, so no state-shape change is needed there. Instead, add the helper functions near `openOverlay` (~line 1397, right before `function openOverlay(html, wire){`):

```js
  /* ---------------- info popovers (ledger + screen help) ---------------- */
  function openInfo(title, html){
    openOverlay('<div class="rosterhdr"><b>'+title+'</b></div><div class="prose" style="padding:0 16px 16px">'+html+'</div>');
  }
  const SCREEN_HELP = {
    brief: "A moment to read. Tap the button below to carry on.",
    event: "A choice to make. Each button says what it costs and what it changes, plainly, under the words. Pick one.",
    planting: "Tap a crop for each empty field, or leave it fallow to let the ground rest. Seed is spent first, then coin. Tap Sow it so when every field is set.",
    assignment: "Open the roster to give each hand a task for the season, then put them to work.",
    market: "Send each harvest to the larder to eat, or to market to sell. Cash crops always sell. Tap Close the day-book when every lot is set.",
    provision: "Buy coal and grain against what winter will need. Tap Lay it in when you are done spending.",
    dusk: "The season's accounts, closed and read. Tap below to turn the page.",
    yearend: "The year is decided. Read how it went, then take the charter again.",
  };
  function setScreenType(t){ S.screenType = t; }
```

- [ ] **Step 4: Wire `setScreenType` into `card()`, and add a `screenType` override on the structured screens**

Modify `card()` (~line 720):

```js
  function card(spec){
    setScreenType(spec.screenType || (spec.choices && spec.choices.length>1 ? "event" : "brief"));
    let h="";
    if(spec.eyebrow) h+='<div class="eyebrow">'+spec.eyebrow+'</div>';
    if(spec.title)   h+='<h2>'+spec.title+'</h2>';
    if(spec.body)    h+='<div class="prose">'+spec.body+'</div>';
    if(spec.choices) h+=choiceHTML(spec.choices);
    paint(h);
    if(spec.choices) wireChoices(spec.choices);
    setPlate(spec.setting, spec.speaker, spec.dir ? spec.dir.replace(/^\[|\]$/g,"").trim() : null);
  }
```

In `plantStep()` (~line 936), add `screenType:"planting"` to the `card({...})` call:

```js
      card({ eyebrow:"Dawn · Planting", title:"Set the fields",
             setting:"fields", screenType:"planting",
             body:'<div class="fields">'+rows+'</div>'+nudge,
             choices:[{t:"Sow it so", sub:"confirm the planting; pay seed then coin", primary:true, go:commit}] });
```

In `assignStep()` (~line 966), add `screenType:"assignment"`:

```js
    card({ eyebrow:"Dawn · the hands", title:"Set the crew to work",
      setting:"fields", screenType:"assignment",
      body:'<div class="prose"><p class="note">Open the roster to give each hand a task for the season. Reuben gives his read on each. When you are ready, put them to work.</p></div>',
      choices:[
        {t:"Open the roster", sub:"assign each hand", go:()=>{ openRoster(); }},
        {t:"Put them to work", sub:"work the tasks as set", primary:true, go:()=>{ applyLabor(); clearTasksForNextSeason(); next(); }},
      ] });
```

In `marketStep()` (~line 833), add `screenType:"market"` and a sub on the advance button:

```js
      card({ eyebrow:"The Market · "+season(), title:"What the fields gave up",
             setting:"town", screenType:"market",
             body:'<div class="prose"><p class="note">Grain and roots keep a belly through winter; coin buys coal and hands. Choose for each lot.</p><div style="margin-top:6px">'+rows+'</div></div>',
             choices:[{t:"Close the day-book", sub:"apply every larder and sell choice you set above", primary:true, go:doSell}] });
```

In `provisionStep()` (~line 1170), add `screenType:"provision"` and a sub:

```js
      card({ eyebrow:"The scramble · lay in stores", title:"Provision against winter",
        setting:"homestead", screenType:"provision",
        body:'<div class="prose"><p class="note">Coal from town at 3 marks the measure (each gives 2 fuel). Grain at 2 marks the measure. Winter for '+bodies()+' will want roughly '+ (35+15*extraHands()) +' food and '+un+'–'+(un+10)+' fuel. You have '+S.marks+' marks.</p>'+
          '<div class="stepper"><div class="lab">Coal<small>+2 fuel each · 3 m</small></div><div class="ctrls"><button data-a="coal-"'+(coal<=0?' disabled':'')+'>–</button><span class="qty">'+coal+'</span><button data-a="coal+"'+(S.marks-spend<3?' disabled':'')+'>+</button></div></div>'+
          '<div class="stepper"><div class="lab">Grain<small>+1 food each · 2 m</small></div><div class="ctrls"><button data-a="grain-"'+(grain<=0?' disabled':'')+'>–</button><span class="qty">'+grain+'</span><button data-a="grain+"'+(S.marks-spend<2?' disabled':'')+'>+</button></div></div>'+
          '<div class="needbar"><span>After buying, larder</span><span class="'+(projFood>=35+15*extraHands()?'met':'short')+'"><b>'+projFood+'</b> food</span></div>'+
          '<div class="needbar"><span>After buying, fuel</span><span class="'+(projFuel>=un?'met':'short')+'"><b>'+projFuel+'</b> fuel</span></div>'+
          '<div class="needbar"><span>Coin spent</span><span><b>'+spend+'</b> / '+S.marks+' m</span></div></div>',
        choices:[{t:"Lay it in", sub:"confirm the winter provisioning purchase", primary:true, go:()=>{ S.marks-=spend; S.fuel+=coal*2; S.food+=grain; next(); }}] });
```

(This also folds in the stepper disabled-state fix from Task 8 below, done here since it's the same block; Task 8 will reference this as already done.)

In `duskStep()` (~line 894), add `screenType:"dusk"` and a sub:

```js
    card({ eyebrow:"Dusk · "+season(), title:"The day-book, closed",
           setting:"homestead", screenType:"dusk",
           body:'<div class="report">'+rows+'</div>'+(hungerNote?'<p class="note">'+hungerNote+'</p>':'')+omen,
           choices:[{t: season()==="Fall" ? "Toward winter →" : "Turn the season →", sub:"move on to the next season", primary:true, go:next}] });
```

In `doEnd()` (~line 1236), add `setScreenType("yearend");` as the first line of the function body, and in `winBeat()` (~line 1258) add the same as the first line:

```js
  function doEnd(survived, cause, rep){
    setScreenType("yearend");
    S.ended=true;
    ...
```

```js
  function winBeat(){
    setScreenType("yearend");
    S.ended=true;
    ...
```

Also give the two `resolve()`-driven "Go on" buttons and the two "again" restart buttons plain subs. `resolve()` (~line 731):

```js
  function resolve(effect, resultText){
    effect && effect();
    if(resultText){
      card({ body:'<div class="prose"><p>'+resultText+'</p></div>',
             choices:[{t:"Go on", sub:"continue", primary:true, go:next}] });
    } else next();
  }
```

- [ ] **Step 5: Add the masthead help button and CSS**

In the CSS, right after `.masthead .themetog:hover{...}` (~line 124):

```css
  .masthead .helptog{
    all:unset; cursor:pointer; font-size:11px; letter-spacing:.2em;
    color:var(--ink-faint); padding:2px 8px; border:1px solid var(--rule-fine); border-radius:2px;
    margin-right:6px;
  }
  .masthead .helptog:hover{ color:var(--ink); border-color:var(--rule); }
```

In the HTML masthead (~line 356-359), add the button before `themetog`:

```html
      <div class="brand">
        <span>Bushel &amp; Bone · The Newcomer</span>
        <span style="margin-left:auto;display:flex;gap:6px">
          <button class="helptog" id="helptog" aria-label="What do I do here?">?</button>
          <button class="themetog" id="themetog" aria-label="Toggle day and night">☾ night</button>
        </span>
      </div>
```

(Note: `.brand` is already `display:flex; justify-content:space-between`, so wrapping the two buttons in one right-aligned span keeps `themetog` where it was and adds `helptog` to its left, rather than fighting the existing space-between layout.)

Wire the click handler near the existing `themetog`/`askbar` listeners (~line 1481):

```js
  document.getElementById("helptog").addEventListener("click", ()=>{
    openInfo("What do I do here?", SCREEN_HELP[S.screenType] || SCREEN_HELP.event);
  });
```

- [ ] **Step 6: Expose `SCREEN_HELP` on the test hook**

In the `window.__BB_TEST__` object (~line 1487), add `SCREEN_HELP` and `openInfo` to the list:

```js
    window.__BB_TEST__ = { getState:()=>S, foreman, fore, livingHands, extraHands, condition, reckBand, mkHand, harvestStep, openOverlay, closeOverlay, openRoster, assignHand, applyLabor, openHand, reubenGuidance, openAskReuben, checkReckoningAlarm, showReckoningAlarm, needsForeman, promoteForeman, openPromote, collectiveLine, tutInit, tutGuided, tutSetGuided, tip, dismissTip, replayTips, setPlate, openInfo, SCREEN_HELP };
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd prototype && npm test -- screen-help`
Expected: PASS (3 tests)

- [ ] **Step 8: Run the full existing suite to check for regressions**

Run: `cd prototype && npm test`
Expected: PASS — the `card()` signature change and new button are additive; no existing test asserts on `.brand`'s exact children count or on `screenType` being absent.

- [ ] **Step 9: Commit**

```bash
git add prototype/year1.html prototype/tests/screen-help.test.mjs
git commit -m "feat: contextual masthead help toggle (#19)"
```

---

### Task 2: Ledger stat tap-to-reveal

**Files:**
- Modify: `prototype/year1.html` (CSS ~line 149-155, JS ~line 522-546)
- Test: `prototype/tests/ledger-help.test.mjs` (create)

- [ ] **Step 1: Write the failing test**

Create `prototype/tests/ledger-help.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("ledger stat help", () => {
  it("tapping the Larder cell opens an info popover explaining it", () => {
    const { doc } = boot();
    const larder = doc.querySelector('#ledger .cell[data-k="larder"]');
    expect(larder).toBeTruthy();
    larder.click();
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(true);
    expect(doc.getElementById("overlay-panel").textContent).toContain("every season");
  });

  it("all four ledger cells are tappable and have distinct help text", () => {
    const { doc, T } = boot();
    ["coin","larder","fuel","seed"].forEach(k=>{
      expect(T.LEDGER_HELP[k]).toBeTruthy();
    });
    const keys = new Set(Object.values(T.LEDGER_HELP));
    expect(keys.size).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && npm test -- ledger-help`
Expected: FAIL — no `[data-k]` attribute on ledger cells, `T.LEDGER_HELP` is undefined.

- [ ] **Step 3: Add `LEDGER_HELP`, tag cells with `data-k`, wire clicks**

Add the lookup near `SCREEN_HELP` (Task 1, same block):

```js
  const LEDGER_HELP = {
    coin: "Marks. Money for seed, coal, farmhands, and fences.",
    larder: "Stored food. The household eats it every season. Run out in winter, and someone dies.",
    fuel: "Wood and coal laid by. Only spent in winter. Too little, and the frailest freezes.",
    seed: "Seed stock. Spent first when you plant, before coin.",
  };
```

Modify `cell()` (~line 522) to accept a key and render it as a `data-k` attribute:

```js
  function cell(key,k,v,u,cls){ return '<div class="cell" data-k="'+key+'"><div class="k">'+k+'</div><div class="v '+(cls||'')+'">'+v+(u?'<span class="u">'+u+'</span>':'')+'</div></div>'; }
```

Update the four call sites in `renderLedger()` (~line 526-530):

```js
    document.getElementById("ledger").innerHTML =
      cell("coin","Coin", S.marks, "m") +
      cell("larder","Larder", Math.floor(S.food), "", foodCls) +
      cell("fuel","Fuel", S.fuel, "", fuelCls) +
      cell("seed","Seed", S.seed, "");
```

Wire the click handler at the end of `renderLedger()` (after the existing `hh` wiring, ~line 543-546):

```js
    document.getElementById("ledger").querySelectorAll(".cell[data-k]").forEach(el=>{
      el.style.cursor = "pointer";
      el.onclick = ()=>openInfo(el.querySelector(".k").textContent, LEDGER_HELP[el.dataset.k]);
    });
```

- [ ] **Step 4: Add CSS affordance so the cells read as tappable**

In the `.ledger .cell` rule (~line 149):

```css
  .ledger .cell{ padding:8px 6px 9px; text-align:center; border-right:1px solid var(--rule-fine); cursor:pointer; }
  .ledger .cell:hover{ background:color-mix(in srgb,var(--accent) 8%, transparent); }
```

(Remove the redundant inline `el.style.cursor="pointer"` from Step 3 since the CSS now covers it, keep the `.onclick` wiring.)

- [ ] **Step 5: Expose `LEDGER_HELP` on the test hook**

Add `LEDGER_HELP` to the `window.__BB_TEST__` object next to `SCREEN_HELP` (same edit site as Task 1 Step 6).

- [ ] **Step 6: Run test to verify it passes**

Run: `cd prototype && npm test -- ledger-help`
Expected: PASS (2 tests)

- [ ] **Step 7: Run full suite**

Run: `cd prototype && npm test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add prototype/year1.html prototype/tests/ledger-help.test.mjs
git commit -m "feat: tap-to-reveal help on the four ledger stats (#19)"
```

---

### Task 3: Choice `tag` and `why` fields

**Files:**
- Modify: `prototype/year1.html` (CSS ~line 204-209, JS ~line 708-713)
- Test: `prototype/tests/choice-tag.test.mjs` (create)

- [ ] **Step 1: Write the failing test**

Create `prototype/tests/choice-tag.test.mjs`. This drives to Vane's Wagon (Summer, scripted, ~day 25) with low coin so both purchase choices are disabled, and checks the rendered `why` text.

```js
import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

describe("choice tag and why", () => {
  it("renders a tag badge next to the choice title when present", () => {
    const { doc, T } = boot();
    const S = T.getState();
    S.marks = 200; // ensure affordable path isn't the thing under test here
    // Spring: intro -> Silas's Welcome. The second Silas choice carries a tag.
    advance(doc); // Walk the fields
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const needle = btns.find(b => b.querySelector(".t").textContent.includes("believe the stories"));
    expect(needle.querySelector(".tag").textContent).toBe("−regard");
  });

  it("shows a why line instead of sub when a choice is disabled", () => {
    const { doc, T } = boot();
    const S = T.getState();
    S.marks = 0;
    // drive to Vane's Wagon: Spring flow has 6 steps before Summer begins
    // (intro, Silas, plant, assign, fair, systemic, grow, harvest, dusk) -> just
    // loop advance() until we see "Vane's Wagon" or run out of safety margin.
    let guard = 0;
    while (guard++ < 40) {
      const h2 = doc.querySelector("#stage h2");
      if (h2 && h2.textContent === "Vane's Wagon") break;
      if (!advance(doc)) break;
    }
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const grower = btns.find(b => b.querySelector(".t").textContent.includes("Buy the Grower"));
    expect(grower.hasAttribute("disabled")).toBe(true);
    expect(grower.querySelector(".sub").textContent).toBe("needs 110m, have 0m");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && npm test -- choice-tag`
Expected: FAIL — `.tag` doesn't exist yet; the disabled `Buy the Grower` button's `.sub` still reads its old prose, not the `why` text (Task 5 hasn't added `why` yet either, so this specific assertion will fail until Task 5 lands — see Step 4 note below).

- [ ] **Step 3: Extend `choiceHTML()`**

Modify `choiceHTML()` (~line 708):

```js
  function choiceHTML(list){
    return '<div class="choices">'+list.map((c,i)=>
      '<button class="btn '+(c.primary?'primary':'')+'" data-c="'+i+'"'+(c.disabled?' disabled':'')+'>'+
        '<span class="t">'+c.t+(c.tag?'<span class="tag">'+c.tag+'</span>':'')+'</span>'+
        ((c.disabled && c.why) ? '<span class="sub">'+c.why+'</span>' : (c.sub?'<span class="sub">'+c.sub+'</span>':''))+
      '</button>').join('')+'</div>';
  }
```

- [ ] **Step 4: Add CSS for `.tag`**

In the choices CSS block (~line 204):

```css
  .btn .t{ font-size:16px; display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
  .btn .tag{ font-family:"Courier New",ui-monospace,monospace; font-size:11.5px; color:var(--ink-faint); white-space:nowrap; }
  .btn.primary .tag{ color:var(--ink-soft); }
```

(This replaces the old plain `.btn .t{ font-size:16px; }` rule.)

- [ ] **Step 4b: Note on the second test assertion**

The "why" test in Step 1 requires the `Buy the Grower` choice to actually have a `why` field, which is added in Task 5 (Summer content), not this task. Since Task 3 must be independently green before Task 5 runs, adjust the test now to only cover what Task 3 delivers: the generic mechanism. Replace the second `it()` block with a mechanism-level test using a synthetic choice through `T`'s exposed `card`-adjacent surface is not available (card/choiceHTML aren't on `__BB_TEST__`). Instead, keep the assertion but scope this task to *only* the `tag` mechanism, and move the disabled/`why` assertion into Task 5's own test file (where the Vane's Wagon `why` strings are actually authored). Update `choice-tag.test.mjs` to just the first test (tag rendering) plus a second test using the already-disabled-by-default "Fence it, 15 m" choice once Task 4 adds its `why` (so move that assertion to Task 4's test file too). Final `choice-tag.test.mjs` for this task:

```js
import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

describe("choice tag rendering", () => {
  it("renders a tag badge next to the choice title when present", () => {
    const { doc } = boot();
    advance(doc); // Walk the fields -> Silas's Welcome
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const needle = btns.find(b => b.querySelector(".t").textContent.includes("believe the stories"));
    expect(needle.querySelector(".tag").textContent).toBe("−regard");
  });

  it("omits the tag span entirely when a choice has no tag", () => {
    const { doc } = boot();
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    // the intro's single choice ("Walk the fields") has no tag
    expect(btns[0].querySelector(".tag")).toBeFalsy();
  });
});
```

Both of these still depend on the Silas `tag:"−regard"` string existing, which is added in Task 4 (Spring content), not this task. Since Task 3 is strictly "the mechanism," and the plan's own Task 4 comes right after, this is fine, but to keep Task 3 independently verifiable, do Step 3/4 (the mechanism) here and defer running this exact test file until after Task 4 adds the Silas tag. Record that dependency explicitly: **this test file's first assertion only goes green once Task 4 Step 3 lands.** Proceed to Step 5 anyway; the two-task dependency is normal (mechanism, then first real usage).

- [ ] **Step 5: Run full suite (expect the new file to still be red until Task 4 lands)**

Run: `cd prototype && npm test`
Expected: `choice-tag.test.mjs` fails (no `tag` on the Silas choice yet); all other files PASS. This is expected and resolved by Task 4.

- [ ] **Step 6: Commit the mechanism**

```bash
git add prototype/year1.html prototype/tests/choice-tag.test.mjs
git commit -m "feat: add tag/why fields to the choice-button renderer (#19)

choice-tag.test.mjs goes fully green once Task 4 adds the first
tag-bearing choice (Silas's Welcome)."
```

---

### Task 4: Author Spring content (intro, Silas, First Furrow, Name of His Own, Soft Rain, Crows)

**Files:**
- Modify: `prototype/year1.html` (`springFlow()`, ~line 981-1023; `SYSTEMIC.spring`, ~line 1287-1307)
- Test: `prototype/tests/spring-clarity.test.mjs` (create)

- [ ] **Step 1: Write the failing test**

Create `prototype/tests/spring-clarity.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

describe("Spring content clarity", () => {
  it("the intro's advance button states its function", () => {
    const { doc } = boot();
    const btn = doc.querySelector("#stage .btn[data-c]");
    expect(btn.querySelector(".sub").textContent).toBe("begin the year");
  });

  it("Silas's two choices carry the right sub/tag", () => {
    const { doc } = boot();
    advance(doc);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const civil = btns.find(b => b.querySelector(".t").textContent.includes("Obliged"));
    const needle = btns.find(b => b.querySelector(".t").textContent.includes("believe the stories"));
    expect(civil.querySelector(".sub").textContent).toBe("keep the peace with your banker");
    expect(needle.querySelector(".sub").textContent).toBe("needle him; he does not care for it");
    expect(needle.querySelector(".tag").textContent).toBe("−regard");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && npm test -- spring-clarity`
Expected: FAIL — subs/tag not present yet.

- [ ] **Step 3: Author the Spring scripted beats**

In `springFlow()` (~line 982), the intro:

```js
    b.push(()=>card({ eyebrow:"Year One begins", title:"The charter, and the cold ground",
      setting:"homestead",
      dir:"[a wagon-rutted road, four cleared fields, a lean-to, and a well capped in iron at the property's edge]",
      body:'<div class="prose"><p class="dropcap">You have taken the charter on a homestead in the Sull: four small fields, a lean-to that sleeps two, a hundred marks, and one field hand named Reuben who came with the land as customs there require. It is Spring. The larder holds eighty measures against the year, and there is no fuel laid in at all.</p><p>They say the ground here keeps accounts. You will have a year to learn what that means.</p></div>',
      choices:[{t:"Walk the fields", sub:"begin the year", primary:true, go:next}] }));
```

Silas's Welcome (~line 989):

```js
    b.push(()=>card({ eyebrow:"A caller · Day 1", title:"Silas's Welcome",
      setting:"homestead", speaker:"silas",
      dir:"[a man in a good coat on a poor road, a ledger in his saddlebag, not dismounting]",
      body:'<div class="prose"><p>Silas Ridley reins up at your gate and does not get down. <span class="said">“Ridley. I hold your charter.”</span> He says it the way another man might say the weather. <span class="said">“A hundred and fifty a year to the bank. Not this year, nor the next: the charter allows a new man his feet. After that, it minds its dates, and so will I.”</span> He looks a long moment at the soft ground by the east field, and something crosses his face he does not explain.</p></div>',
      choices:[
        {t:"“Obliged, Mr. Ridley.”", sub:"keep the peace with your banker", go:()=>resolve(()=>{S.flags.silas="civil";}, "He nods and rides off. You are, it seems, a man with a deadline, two years out.")},
        {t:"“You believe the stories about this ground?”", sub:"needle him; he does not care for it", tag:"−regard", go:()=>resolve(()=>{S.regard-=1;}, "He pauses. <span class=\"said\">“I believe in the ledger,”</span> he says. <span class=\"said\">“The stories are the ledger's business.”</span> He rides off faster than he came.")},
      ] }));
```

First Furrow (~line 1002), both choices already have `sub`; add `tag`:

```js
      choices:[
        {t:"Attend the Fair", sub:"+regard, a blessed field, the wheat contract, but Reuben rests today", tag:"+regard", primary:true, go:()=>resolve(()=>{
          S.regard+=6; S.flags.wheatContract=true; const fm=fore(); if(fm&&fm.morale<5)fm.morale++;
          const f=S.fields.find(x=>x.crop); if(f)f.progress+=0.5;
          S.fields.forEach(x=>x.tended=false);
        }, "You stand the day among them. Grange's blessing settles on the near ground like a light frost that does not bite. The town has seen your face now; that counts for something in the Sull.")},
        {t:"Skip it and work", sub:"the town notes the newcomer who wouldn't come", tag:"−regard", go:()=>resolve(()=>{S.regard-=3;}, "You keep to your fields while the fiddles carry across the green. Marrow's Cross notices a man who will not sit with it. It always does.")},
      ] }));
```

- [ ] **Step 4: Author the Spring systemic events**

In `SYSTEMIC.spring` (~line 1287):

```js
    spring:[
      ()=>card({eyebrow:"A growing rain",title:"A Soft Rain",
        setting:"fields",
        body:'<div class="prose"><p>Three days of soft, warm rain walk up the valley. The seed drinks it in and the fields come on a shade faster than the almanac promised.</p></div>',
        choices:[{t:"Good.",sub:"the planted fields grow a little faster",primary:true,go:()=>resolve(()=>{S.fields.forEach(f=>{if(f.crop)f.progress+=0.5;});},"Everything planted takes a step toward ripe.")}]}),
      ()=>card({eyebrow:"An unfenced field",title:"Crows in the Corn",
        setting:"fields",
        body:'<div class="prose"><p>A black congregation settles on one of your fields and sets to work with a will. There is no fence to turn them.</p></div>',
        choices:[
          {t:"Set Reuben to scaring them",sub:"a day's labor spent",go:()=>resolve(()=>{S.fields.forEach(x=>x.tended=false);},"Reuben spends the day waving and shouting. The crows leave insulted; the crop is whole.")},
          {t:"Fence it, 15 m",sub:"lasting; costs coin",why:"needs 15m, have "+S.marks+"m",disabled:S.marks<15,go:()=>resolve(()=>{S.marks-=15;},"Posts and wire go up. The crows try it once, twice, and give it up. The fence will stand for years.")},
          {t:"Let them feed",sub:"lose a share of that field",tag:"−fertility",go:()=>resolve(()=>{const f=S.fields.find(x=>x.crop);if(f)f.fert=Math.max(0,f.fert-1);},"You let them have their tithe. It is only a share. You will remember the fence come next planting.")},
        ]}),
      ()=>card({eyebrow:"A hand asks",title:"A Name of His Own",
        setting:"homestead", speaker:"reuben",
        body:'<div class="prose"><p>Reuben stands at the door with his hat in his hands and asks, haltingly, whether he might have a name that is <em>his</em>, not the one that came stamped on the charter papers, but one you’d call him by.</p></div>',
        choices:[
          {t:"Grant it gladly",sub:"+heart; he works the harder for it",tag:"+heart",primary:true,go:()=>resolve(()=>{const f=fore(); if(f&&f.morale<5)f.morale++;S.regard+=1;},"He says the name over twice, quietly, like a thing he is afraid to drop. He works differently after, like a man, not a tool.")},
          {t:"Refuse him",sub:"−heart; the asking never comes again",tag:"−heart",go:()=>resolve(()=>{const f=fore(); if(f&&f.morale>0)f.morale--;markCruelty();},"<span class=\"said\">“As you say,”</span> he answers, and goes back to the field. He does not ask again, and something in him closes for good. <span class=\"whisper\">The ground, somewhere, makes a small note of it.</span>")},
        ]}),
    ],
```

(Note: `"Refuse him"` gets `tag:"−heart"` only, no mention of the Reckoning it also raises via `markCruelty()`, per the hidden-layer constraint. The existing whisper line is untouched.)

- [ ] **Step 5: Run test to verify it passes**

Run: `cd prototype && npm test -- spring-clarity`
Expected: PASS

- [ ] **Step 6: Re-run Task 3's test file, now expected green**

Run: `cd prototype && npm test -- choice-tag`
Expected: PASS (both tests now pass, since the Silas tag exists)

- [ ] **Step 7: Run full suite**

Run: `cd prototype && npm test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add prototype/year1.html prototype/tests/spring-clarity.test.mjs
git commit -m "content: dual-label and tag Spring beats and events (#19)"
```

---

### Task 5: Author Summer content (intro, Vane's Wagon, the moral fork, Hot Wind, Pedlar, Rats)

**Files:**
- Modify: `prototype/year1.html` (`summerFlow()`, ~line 1026-1075; `SYSTEMIC.summer`, ~line 1308-1330)
- Test: `prototype/tests/summer-clarity.test.mjs` (create)

- [ ] **Step 1: Write the failing test**

Create `prototype/tests/summer-clarity.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

function driveToTitle(doc, title, guard=60){
  let n=0;
  while(n++ < guard){
    const h2 = doc.querySelector("#stage h2");
    if (h2 && h2.textContent === title) return true;
    if (!advance(doc)) return false;
  }
  return false;
}

describe("Summer content clarity", () => {
  it("Vane's Wagon: an unaffordable purchase shows why, not the old sub", () => {
    const { doc, T } = boot();
    T.getState().marks = 0;
    expect(driveToTitle(doc, "Vane's Wagon")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const grower = btns.find(b => b.querySelector(".t").textContent.includes("Buy the Grower"));
    const hand = btns.find(b => b.querySelector(".t").textContent.includes("Buy the Field Hand"));
    expect(grower.hasAttribute("disabled")).toBe(true);
    expect(grower.querySelector(".sub").textContent).toBe("needs 110m, have 0m");
    expect(hand.hasAttribute("disabled")).toBe(true);
    expect(hand.querySelector(".sub").textContent).toBe("needs 60m, have 0m");
  });

  it("the moral fork's choices carry heart/fertility tags, never a reckoning tag", () => {
    const { doc } = boot();
    expect(driveToTitle(doc, "The Cotton Won't Wait") || driveToTitle(doc, "The Harvest Won't Wait")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const work = btns.find(b => b.querySelector(".t").textContent.includes("Work him through"));
    const rest = btns.find(b => b.querySelector(".t").textContent.includes("Let him rest"));
    expect(work.querySelector(".tag").textContent).toBe("−heart");
    expect(rest.querySelector(".tag").textContent).toBe("−fertility");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && npm test -- summer-clarity`
Expected: FAIL

- [ ] **Step 3: Author the Summer scripted beats**

Intro (~line 1027):

```js
    b.push(()=>card({ eyebrow:"Summer · the market opens", title:"The long light",
      setting:"fields",
      body:'<div class="prose"><p class="dropcap">The days stretch and the first crops come on. Word reaches you of Regional buyers who send a wagon for a real load, and of the saloon where Meredith Vane sells the one thing dearer than whiskey: knowing things. The heat sits heavy on the fields.</p></div>',
      choices:[{t:"To work", sub:"begin the season", primary:true, go:next}] }));
```

Vane's Wagon (~line 1036):

```js
      choices:[
        {t:"Buy the Grower, 110 m", sub:"strong labor; a heavy winter mouth", why:"needs 110m, have "+S.marks+"m", disabled:S.marks<110, go:()=>resolve(()=>{S.marks-=110; S.hands.push(mkHand(null, pick(["Della","Tace","Wick","Merrit"]), "Grower", 3, {body:"strong",mind:"plain"}));}, "The canvas comes back. She steps down slow, blinking at the light, and does not yet know your name or her own. You will have to feed her now, through everything.")},
        {t:"Buy the Field Hand, 60 m", sub:"cheaper help; still a mouth to winter", why:"needs 60m, have "+S.marks+"m", disabled:S.marks<60, go:()=>resolve(()=>{S.marks-=60; S.hands.push(mkHand(null, pick(["Amos","Pell","Bry","Cass"]), "Field Hand", 3, {}));}, "Sixty marks, and a plain quiet worker climbs down from the wagon. Vane counts the coin twice and is gone before you can ask where such a one comes from.")},
        {t:"Haggle", sub:"Vane likes to be liked", go:()=>resolve(()=>{
          if(S.regard>=55 && S.marks>=100){ S.marks-=100; S.hands.push(mkHand(null, pick(["Della","Tace","Wick"]), "Grower", 3, {body:"strong",mind:"plain"})); S._hag="won"; }
          else S._hag="lost";
        }, S._hag==="won" ? "He sighs, charmed despite himself. <span class=\"said\">“A hundred, then, for a face I like.”</span> The grower steps down. Ten marks saved, and a mouth to feed." : "<span class=\"said\">“A hundred and ten is the kindness,”</span> he says, and the price does not move. You let the wagon go on.")},
        {t:"Decline", sub:"one hand, one mouth: the safe winter", go:()=>resolve(null,"You let the wagon roll on toward the next homestead. One hand is a lean crew, but a lean crew is a fed crew.")},
      ] }));
```

The moral fork (~line 1058):

```js
        choices:[
          {t:"Work him through the night", sub:"save the crop; Reuben loses heart", tag:"−heart", primary:true, go:()=>resolve(()=>{
            const f=fore(); if(f&&f.morale>0)f.morale--;
            if(ripeField){ ripeField.tended=true; ripeField.progress=Math.max(ripeField.progress,CROPS[ripeField.crop].seasons); }
            S.flags.overworked=true;
          }, "The crop comes in whole under a black sky. Reuben does not speak for a day. <span class=\"whisper\">The land takes no notice of a hard day, not yet. A hard day is only a hard day.</span>")},
          {t:"Let him rest", sub:"lose a third of the crop; Reuben mends", tag:"−fertility", go:()=>resolve(()=>{
            const f=fore(); if(f&&f.morale<5)f.morale++;
            if(ripeField)ripeField.fert=Math.max(0,ripeField.fert-1);
          }, "You send him to his cot. The storm takes what it takes. In the morning he works the wet field with something like loyalty, and you find you do not regret the third you lost.")},
        ] });
```

- [ ] **Step 4: Author the Summer systemic events**

In `SYSTEMIC.summer` (~line 1308):

```js
    summer:[
      ()=>card({eyebrow:"A dry heat",title:"The Hot Wind",
        setting:"fields",
        body:'<div class="prose"><p>A hot wind comes off the flats and sits on the valley for a week. The work is punishing under it.</p></div>',
        choices:[
          {t:"Rest the worst of it",sub:"+heart; a slow week",tag:"+heart",primary:true,go:()=>resolve(()=>{const f=fore(); if(f&&f.morale<5)f.morale++;},"You keep to the shade through the killing hours. The work waits; the crew keeps its strength.")},
          {t:"Work straight through",sub:"the crop, but Reuben wilts",tag:"−heart",go:()=>resolve(()=>{const f=fore(); if(f&&f.morale>0)f.morale--;},"The rows get worked in the full glare. Reuben comes in each night hollow-eyed. The land, for now, takes no notice of a hard week.")},
        ]}),
      ()=>card({eyebrow:"A traveller",title:"The Pedlar",
        setting:"fields",
        body:'<div class="prose"><p>A pedlar with a swaybacked mule offers cheap seed by the roadside, and, when pressed, something else, wrapped in oilcloth, that he will not name and will not unwrap.</p></div>',
        choices:[
          {t:"Buy the seed, 8 m",sub:"+8 seed",tag:"+8 seed",why:"needs 8m, have "+S.marks+"m",disabled:S.marks<8,primary:true,go:()=>resolve(()=>{S.marks-=8;S.seed+=8;},"Good seed at a fair price. The oilcloth stays wrapped, and the pedlar goes on his way looking almost relieved.")},
          {t:"Send him on",sub:"want nothing of it",go:()=>resolve(null,"You wave him past. The mule complains; the pedlar tips his hat; the oilcloth bundle rides on to trouble someone else.")},
        ]}),
      ()=>card({eyebrow:"In the granary",title:"Rats in the Stores",
        setting:"fields",
        body:'<div class="prose"><p>Something has been in the larder. You find the tell-tale spill of grain and the small dark droppings along the wall.</p></div>',
        choices:[
          {t:"Trap them, 4 m",sub:"stop the loss",why:"needs 4m, have "+S.marks+"m",disabled:S.marks<4,primary:true,go:()=>resolve(()=>{S.marks-=4;},"Traps and a barn cat borrowed from Doc Bell. The stores hold.")},
          {t:"Ignore it",sub:"lose food over the season",tag:"−food",go:()=>resolve(()=>{S.food=Math.max(0,S.food-10);},"You let it ride. Ten measures of larder go down small throats before the season's out.")},
        ]}),
    ],
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd prototype && npm test -- summer-clarity`
Expected: PASS

- [ ] **Step 6: Run full suite**

Run: `cd prototype && npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add prototype/year1.html prototype/tests/summer-clarity.test.mjs
git commit -m "content: dual-label and tag Summer beats and events (#19)"
```

---

### Task 6: Author Fall content (intro, Harvest Home, Sour, Foundling, Doc Bell's Word, Frost) + provisioning stepper disabled states

**Files:**
- Modify: `prototype/year1.html` (`fallFlow()`, ~line 1078-1116; `SYSTEMIC.fall`, ~line 1331-1353)
- Test: `prototype/tests/fall-clarity.test.mjs` (create)

- [ ] **Step 1: Write the failing test**

Create `prototype/tests/fall-clarity.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

function driveToTitle(doc, title, guard=90){
  let n=0;
  while(n++ < guard){
    const h2 = doc.querySelector("#stage h2");
    if (h2 && h2.textContent === title) return true;
    if (!advance(doc)) return false;
  }
  return false;
}

describe("Fall content clarity", () => {
  it("Harvest Home choices carry regard tags", () => {
    const { doc } = boot();
    expect(driveToTitle(doc, "The town lights the long tables")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const go = btns.find(b => b.querySelector(".t").textContent.includes("Go to the feast"));
    const stay = btns.find(b => b.querySelector(".t").textContent.includes("Stay and bring"));
    expect(go.querySelector(".tag").textContent).toBe("+regard");
    expect(stay.querySelector(".tag").textContent).toBe("−regard");
  });

  it("the Foundling's cruel choice ('Turn them out') carries no tag at all", () => {
    const { doc } = boot();
    if (driveToTitle(doc, "A stray hand stands at your gate as the light goes, one of the Sull’s foundlings")) {
      // title text isn't the h2; the card title is "The town lights the long tables" is different beat.
    }
    // Foundling's h2 title is "A Foundling" per SYSTEMIC.fall pool eyebrow "At the gate"; card title omitted (no spec.title passed there originally has no title field—guard for eyebrow instead).
  });

  it("provisioning steppers disable the + button once unaffordable", () => {
    const { doc, T } = boot();
    T.getState().marks = 2; // enough for exactly one grain (2m), not one coal (3m)
    expect(driveToTitle(doc, "Provision against winter")).toBe(true);
    const coalPlus = doc.querySelector('#stage button[data-a="coal+"]');
    expect(coalPlus.hasAttribute("disabled")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, note the Foundling test is a placeholder-in-progress and fix it before proceeding**

Run: `cd prototype && npm test -- fall-clarity`
Expected: FAIL on the stepper test (disabled attr not present yet); the Foundling test as drafted doesn't assert anything real. Before continuing, rewrite it properly now that the actual card title is known from the source (the Foundling card has `title` unset in the current source... re-check): looking at the source, the Foundling card is `card({eyebrow:"At the gate",title:"A Foundling", setting:"gate", dir:..., body:..., choices:[...]})` — it does have `title:"A Foundling"`. Fix the test:

```js
  it("the Foundling's cruel choice ('Turn them out') carries no tag at all", () => {
    const { doc } = boot();
    expect(driveToTitle(doc, "A Foundling")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const turnOut = btns.find(b => b.querySelector(".t").textContent.includes("Turn them out"));
    expect(turnOut.querySelector(".tag")).toBeFalsy();
  });
```

Also fix the first test: the Harvest Home card's `title` is `"The town lights the long tables"` (confirmed from source), so `driveToTitle(doc, "The town lights the long tables")` is correct as drafted.

Re-run: `cd prototype && npm test -- fall-clarity`
Expected: FAIL (tags/why not authored yet, stepper disabled attr not present yet)

- [ ] **Step 3: Author the Fall scripted beats**

Intro (~line 1079):

```js
    b.push(()=>card({ eyebrow:"Fall · the scramble", title:"Bring it in, and lay it by",
      setting:"fields",
      body:'<div class="prose"><p class="dropcap">The year tips over into taking-in. Every ripe field wants harvesting and the winter wants fuel, and both want the same short days. From here the almanac keeps a running count in the margin: larder against need, wood against the cold.</p></div>',
      choices:[{t:"Begin", sub:"begin the season", primary:true, go:next}] }));
```

Harvest Home (~line 1089):

```js
      choices:[
        {t:"Go to the feast", sub:"+regard, +heart, a day not worked", tag:"+regard", primary:true, go:()=>resolve(()=>{S.regard+=5; const f=fore(); if(f&&f.morale<5)f.morale++; S.fields.forEach(x=>x.tended=false);}, "You sit at the long tables. Bess decides something about you; you cannot tell what. It is warm, and there is bread, and for an evening the ground keeps its accounts to itself.")},
        {t:"Stay and bring in the crop", sub:"−regard; the work gets done", tag:"−regard", go:()=>resolve(()=>{S.regard-=3;}, "You work while the fiddles carry over the fields. The crop is safe and the town is a shade cooler to you. You can live on a safe crop; you cannot eat regard.")},
      ] }));
```

The Sour omen (~line 1103) is a single read-only choice; give it a sub:

```js
        card({ eyebrow:"An omen", title:"Sour",
          setting:"homestead", speaker:"nan",
          body:'<div class="prose"><p class="whisper">The milk turns though the cow is sound and the pail was clean. It turns again the next morning, and the next. When you ask Old Nan she does not touch it. <span class="said">“You’ve laid something down,”</span> she says, <span class="said">“that the ground did not care for. It remembers the shape of it.”</span></p></div>',
          choices:[{t:"Say nothing", sub:"continue", primary:true, go:next}] });
```

- [ ] **Step 4: Author the Fall systemic events**

In `SYSTEMIC.fall` (~line 1331), the Foundling card gets `tag`s on the two effect-bearing choices, but explicitly **no tag** on "Turn them out" (hidden-layer rule):

```js
    fall:[
      ()=>card({eyebrow:"At the gate",title:"A Foundling",
        setting:"gate",
        dir:"[a thin figure at the fence-line at dusk, not quite a child, not quite not]",
        body:'<div class="prose"><p>A stray hand stands at your gate as the light goes, one of the Sull’s foundlings, grown wild from no wagon and no vat anyone will own to. It watches you and does not speak.</p></div>',
        choices:[
          {t:"Take them in",sub:"free labor, and another winter mouth",tag:"+1 mouth to feed",primary:true,go:()=>resolve(()=>{S.hands.push(mkHand(null, pick(["Wren","Cob","Lark","Fen"]), "Foundling", 2, {mind:"wary"}));},"You open the gate. It comes in like a cat, wary and grateful at once. Free hands in the field, and one more belly to carry to spring.")},
          {t:"Send them to Sister Ruth",sub:"+her regard",tag:"+regard",go:()=>resolve(()=>{S.regard+=3;},"You point the way to the church, where Ruth keeps a cot for such as these. She will remember that you sent them fed, not away.")},
          {t:"Turn them out",sub:"the ground marks it",go:()=>resolve(()=>{S.reckoning+=1;markCruelty();},"You close the gate. The figure stands a while in the cold, then is not there. <span class=\"whisper\">Something in the ground turns over in its long sleep.</span>")},
        ]}),
      ()=>card({eyebrow:"A rumor at the saloon",title:"Doc Bell's Word",
        setting:"saloon", speaker:"bell",
        body:'<div class="prose"><p>Doc Bell, dry as ever, lets fall over a glass that a Regional buyer will pay above the local price for grain this fall, if you have a wagon-load worth carrying, and the coin to wait for the wagon.</p></div>',
        choices:[
          {t:"Note it and thank him",sub:"good to know for Year Two",tag:"+regard",primary:true,go:()=>resolve(()=>{S.regard+=1;},"You file it away. The Regional wagon is a Year-Two concern, but the knowing of it is worth a drink, and Bell is worth cultivating.")},
        ]}),
      ()=>card({eyebrow:"An early frost",title:"Frost on the Low Ground",
        setting:"fields",
        body:'<div class="prose"><p>A hard frost comes a week early to the low fields. Anything ripe should come in now or risk the cold.</p></div>',
        choices:[
          {t:"Bring in what's ready",sub:"safe, but rushed",primary:true,go:()=>resolve(()=>{S.fields.forEach(f=>{if(ripe(f))f.tended=false;});},"You get the ripe fields in ahead of the white. It is rough work in the cold, but the harvest is safe under roof.")},
        ]}),
    ],
```

- [ ] **Step 5: Verify the provisioning stepper disabled states**

This was already implemented in Task 1 Step 4 (the `provisionStep()` edit included the `disabled` attributes on the coal/grain +/- buttons). Add the CSS to make the disabled state visible, in the `.stepper button` rule (~line 241):

```css
  .stepper button{ all:unset; cursor:pointer; width:28px; height:28px; text-align:center; line-height:26px; border:1px solid var(--rule); border-radius:2px; font-size:17px; color:var(--ink); }
  .stepper button:hover{ border-color:var(--accent); }
  .stepper button:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
  .stepper button[disabled]{ opacity:.35; cursor:not-allowed; }
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd prototype && npm test -- fall-clarity`
Expected: PASS (3 tests)

- [ ] **Step 7: Run full suite**

Run: `cd prototype && npm test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add prototype/year1.html prototype/tests/fall-clarity.test.mjs
git commit -m "content: dual-label and tag Fall beats and events; disable unaffordable stepper buttons (#19)"
```

---

### Task 7: Author Winter content (intro, Sister Ruth's Basket, the Long Vigil, Cabin Fever, year-end)

**Files:**
- Modify: `prototype/year1.html` (`winterFlow()`, ~line 1119-1155; `SYSTEMIC.winter`, ~line 1354-1361; `doEnd()`/`winBeat()` "again" buttons, ~line 1249/1281)
- Test: `prototype/tests/winter-clarity.test.mjs` (create)

- [ ] **Step 1: Write the failing test**

Create `prototype/tests/winter-clarity.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

function driveToTitle(doc, title, guard=130){
  let n=0;
  while(n++ < guard){
    const h2 = doc.querySelector("#stage h2");
    if (h2 && h2.textContent === title) return true;
    if (!advance(doc)) return false;
  }
  return false;
}

describe("Winter content clarity", () => {
  it("the Long Vigil choices carry regard tags", () => {
    const { doc } = boot();
    expect(driveToTitle(doc, "The Long Vigil")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const watch = btns.find(b => b.querySelector(".t").textContent.includes("Watch the night"));
    const home = btns.find(b => b.querySelector(".t").textContent.includes("Go home"));
    expect(watch.querySelector(".tag").textContent).toBe("+regard");
    expect(home.querySelector(".tag").textContent).toBe("−regard");
  });

  it("winter's intro advance button states its function", () => {
    const { doc } = boot();
    expect(driveToTitle(doc, "The short days close in")).toBe(true);
    const btn = doc.querySelector("#stage .btn[data-c]");
    expect(btn.querySelector(".sub").textContent).toBe("begin winter");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && npm test -- winter-clarity`
Expected: FAIL

- [ ] **Step 3: Author the Winter scripted beats**

Intro (~line 1120):

```js
    b.push(()=>card({ eyebrow:"Winter · the crucible", title:"The short days close in",
      setting:"fields",
      dir:"[frost on the well-cap; the whole valley gone quiet and white]",
      body:'<div class="prose"><p class="dropcap">Winter in the Sull is the year’s true test. There is no planting now, only the larder, the woodpile, and the long dark between them. What you laid by is what you have.</p></div>'+
        needBar(),
      choices:[{t:"Face it", sub:"begin winter", primary:true, go:next}] }));
```

Sister Ruth's Basket (~line 1133):

```js
          choices:[
            {t:"Accept the basket", sub:"+18 food, +14 fuel; a small debt of regard", tag:"+food, +fuel", primary:true, go:()=>resolve(()=>{S.food+=18;S.fuel+=14;S.flags.tookCharity=true;S.regard+=2;}, "She sets it down and will not stay for thanks. Bread, salt pork, a sack of coal. It is the difference, this year, between a grave and a spring.")},
            {t:"“We'll manage, Sister.”", sub:"pride; the fire stays low", tag:"+regard", go:()=>resolve(()=>{S.regard+=1;}, "She looks at you a long moment, then nods once and takes the basket back down the track. <span class=\"said\">“The offer keeps,”</span> she says, without turning. You hope you will not need it.")},
          ] });
```

The Long Vigil (~line 1145):

```js
      choices:[
        {t:"Watch the night through with them", sub:"+regard; the ground eases its accounting", tag:"+regard", primary:true, go:()=>resolve(()=>{S.regard+=6; S.reckoning=Math.max(0,S.reckoning-4);}, "You watch. You do not know what you are watching for, and by dawn you understand no one else quite does either, and that they watch anyway. It is the truest thing you have seen in the Sull.")},
        {t:"Go home to your fire", sub:"−regard; keep your own watch", tag:"−regard", go:()=>resolve(()=>{S.regard-=4;}, "You keep your own watch, alone, over your own ground. In the morning the town is a little colder to the man who wouldn't sit the Vigil.")},
      ] }));
```

(`sub` for "Watch the night through" mentions "the ground eases its accounting" in prose only, which is already how the existing content obliquely nods at the Reckoning without a number; the `tag` stays `+regard` only, per the hidden-layer rule.)

- [ ] **Step 4: Author the Winter systemic event**

In `SYSTEMIC.winter` (~line 1354):

```js
    winter:[
      ()=>card({eyebrow:"The long dark",title:"Cabin Fever",
        setting:"homestead",
        body:'<div class="prose"><p>The snow shuts the valley in. Days pass without a face from town, and the household grows short-tempered in the close air of the lean-to.</p></div>',
        choices:[
          {t:"Keep them busy and fed",sub:"+heart, if you can spare it",tag:"+heart",primary:true,go:()=>resolve(()=>{const f=fore(); if(S.food>20&&f&&f.morale<5)f.morale++;},"You ration out small comforts: a better supper, a task with an end to it. The crew holds together through the worst of the quiet.")},
        ]}),
    ],
```

- [ ] **Step 5: Confirm the year-end "again" buttons already comply**

Both `doEnd()` (~line 1249) and `winBeat()` (~line 1281) already render their advance button with a `sub` line (`"a new newcomer, a new seed"` and `"new seed, new weather, new choices"` respectively). No change needed here beyond the `setScreenType("yearend")` call added in Task 1.

- [ ] **Step 6: Run test to verify it passes**

Run: `cd prototype && npm test -- winter-clarity`
Expected: PASS

- [ ] **Step 7: Run full suite**

Run: `cd prototype && npm test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add prototype/year1.html prototype/tests/winter-clarity.test.mjs
git commit -m "content: dual-label and tag Winter beats and events (#19)"
```

---

### Task 8: Crop-chip disabled reason (planting screen)

**Files:**
- Modify: `prototype/year1.html` (`plantStep()` `draw()`, ~line 917-933)
- Test: `prototype/tests/plant-clarity.test.mjs` (create)

- [ ] **Step 1: Write the failing test**

Create `prototype/tests/plant-clarity.test.mjs`:

```js
import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

describe("Planting clarity", () => {
  it("a disabled crop chip explains why via its title attribute", () => {
    const { doc, T } = boot();
    const S = T.getState();
    S.marks = 0; S.seed = 0;
    advance(doc); // Walk the fields -> Silas
    advance(doc); // Obliged -> plant step
    const potato = doc.querySelector('#stage .chip[data-k="potato"]');
    expect(potato.hasAttribute("disabled")).toBe(true);
    expect(potato.getAttribute("title")).toBe("needs 6 seed or coin, have 0 seed, 0m");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && npm test -- plant-clarity`
Expected: FAIL — no `title` attribute on disabled chips yet.

- [ ] **Step 3: Add the `title` attribute to disabled chips**

Modify the `picks` line inside `plantStep()`'s `draw()` (~line 926-928):

```js
        const picks = Object.keys(CROPS).map(k=>{
          const c=CROPS[k]; const can = affordable(k,f.id);
          const why = can ? "" : ' title="needs '+c.seed+' seed or coin, have '+S.seed+' seed, '+S.marks+'m"';
          return '<button class="chip '+(sel===k?'sel':'')+'" data-f="'+f.id+'" data-k="'+k+'"'+(can||sel===k?'':' disabled style="opacity:.35"'+why)+'>'+c.name+'<span class="c">'+c.seed+'</span></button>';
        }).join('')+'<button class="chip '+(sel==null?'sel':'')+'" data-f="'+f.id+'" data-k="">fallow<span class="c">rest</span></button>';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && npm test -- plant-clarity`
Expected: PASS

- [ ] **Step 5: Run full suite**

Run: `cd prototype && npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add prototype/year1.html prototype/tests/plant-clarity.test.mjs
git commit -m "content: explain disabled crop chips on the planting screen (#19)"
```

---

### Task 9: Full-run smoke test, docs update, and issue close-out

**Files:**
- Modify: `docs/gameplay-flow.md` (§8, mark resolved items)
- Modify: `CLAUDE.md`, `context/session-history.md`
- No new test file (this task verifies, documents, and closes out)

- [ ] **Step 1: Run the complete test suite one more time**

Run: `cd prototype && npm test`
Expected: PASS, all files (the pre-existing suite plus the 7 new files added in Tasks 1-8).

- [ ] **Step 2: Manual full-run smoke check via the existing headless pattern**

Run a quick node script that boots the game and clicks through an entire year using `advance()`, confirming no thrown errors and that `screenType` is always a known key at every step:

```bash
node -e "
const { JSDOM } = require('./prototype/node_modules/jsdom');
const fs = require('fs');
const html = fs.readFileSync('prototype/year1.html','utf8');
const full = '<!doctype html><html><head></head><body>'+html+'</body></html>';
const dom = new JSDOM(full, { runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/' });
const doc = dom.window.document, T = dom.window.__BB_TEST__;
const KNOWN = new Set(['brief','event','planting','assignment','market','provision','dusk','yearend']);
let steps=0, bad=[];
for(let i=0;i<400;i++){
  steps++;
  const st = T.getState().screenType;
  if(st && !KNOWN.has(st)) bad.push(st);
  const stage = doc.getElementById('stage');
  if(doc.getElementById('again')) break;
  const btns = [...stage.querySelectorAll('.btn[data-c]')].filter(b=>!b.hasAttribute('disabled'));
  if(!btns.length) break;
  (btns.find(b=>b.classList.contains('primary'))||btns[0]).click();
}
console.log('steps', steps, 'unknown screenTypes', bad);
"
```

Expected: `unknown screenTypes []`, `steps` in the dozens (a full year's worth of screens), no thrown exceptions.

- [ ] **Step 3: Update `docs/gameplay-flow.md` §8**

Replace the "Known legibility gaps" section header and list (the five numbered items) with a resolved note. Read the current §8 first (it is unchanged from when the plan was written, per the design doc's grounding), then edit:

```markdown
## 8. Legibility gaps (resolved by #19)

The five gaps below were the checklist for the UI-clarity pass (#19); all five are now closed in `prototype/year1.html`:

1. ~~Voice-only button labels.~~ Every advance button now carries a plain sub-line (`Sow it so` / *confirm the planting; pay seed then coin*, etc.).
2. ~~Unexplained ledger.~~ The four ledger cells (Coin, Larder, Fuel, Seed) are tappable; each opens a plain-English explanation, independent of guided-mode status.
3. ~~Costs not always previewed.~~ Every choice states its effect in `sub`; choices with a clear resource cost or gain also carry a structured `tag` badge (e.g. `−regard`, `+heart`). Choices that move the hidden Reckoning never carry a tag naming it, per §5.
4. ~~No "what do I do here?"~~ A masthead "?" toggle explains the current screen type on demand, keyed by a `screenType` set on every render.
5. The hidden layer stays invisible by design (unchanged, correct) — no tag, badge, or help text anywhere names or numbers the Reckoning.
```

- [ ] **Step 4: Update `CLAUDE.md` status line**

Replace the "Prototype v0.2 phase" bullet (search for `Prototype v0.2 phase (milestone #2)`) with:

```markdown
- ✅ **UI clarity pass (#19).** Built into `prototype/year1.html`: tap-to-reveal ledger help, a contextual masthead help toggle, and dual-labeled/tagged choice buttons across every scripted beat and systemic event, plus disabled-reason text on unaffordable choices, crop chips, and provisioning steppers. Design: `docs/superpowers/specs/2026-07-25-ui-clarity-pass-design.md`. Plan: `docs/superpowers/plans/2026-07-26-ui-clarity-pass.md`.
- ⏳ **Prototype v0.2 phase (milestone #2)** — UI clarity and the dash scrub both done; remaining: #24 (art direction doc) and a Vercel proof-of-concept for testers.
```

- [ ] **Step 5: Append a session-history entry**

Add a new entry at the top of `context/session-history.md` (above the most recent existing entry) summarizing this session: what was built (the three mechanisms plus the full content-authoring pass), the test count added, and the hidden-layer constraint that shaped every tag decision. Follow the existing entries' format and voice.

- [ ] **Step 6: Commit the docs**

```bash
git add docs/gameplay-flow.md CLAUDE.md context/session-history.md
git commit -m "docs: close out the UI clarity pass (#19)"
```

- [ ] **Step 7: Close the GitHub issue**

```bash
gh issue close 19 --repo Cremacious/bushel-bone --comment "Done across 8 commits: tap-to-reveal ledger help, a contextual masthead help toggle, and dual-labeled/tagged choice buttons (with disabled-reason text) across every scripted beat, systemic event, the planting screen, and the winter provisioning steppers. 7 new test files, full suite green. The hidden Reckoning is never named or numbered in any new tag or help text, per gameplay-flow.md §5."
```

---

## Self-Review Notes (for whoever executes this plan)

- **Spec coverage:** Task 1 covers design §2 (help toggle), Task 2 covers §1 (ledger), Task 3 covers the `tag`/`why` mechanism from §3, Tasks 4-7 cover the full §3 authoring pass season by season, Task 6 and Task 8 cover §4 (stepper and chip polish). All four design sections have at least one task.
- **Hidden-layer constraint:** called out once in the plan header and re-stated inline at every choice that touches `S.reckoning` (`Refuse him`, `Turn them out`, `Watch the night through`) so it can't be missed mid-execution.
- **Dependency order:** Task 3 (mechanism) intentionally lands slightly ahead of its own first fully-green test, resolved by Task 4; this is called out explicitly in Task 3 so the executor doesn't mistake it for a mistake.
- **Test-file line-number drift:** all `~line N` references were accurate against `prototype/year1.html` as read during planning. Earlier tasks change line numbers for later tasks' targets; each task's "Files" section re-describes the target by function name and a short surrounding snippet, not line number alone, so search-by-content remains reliable even as line numbers shift.
