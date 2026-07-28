# Prototype Rebuild — Plan 1: Foundation & the V0.3 Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a new, modular, frameworkless prototype (`prototype2/`) that renders the Claude Design **V0.3** shell (masthead, brass ledger, six-tab nav, night/day, phone + desktop) driven by a pure `(state, action) => state` core, with the existing YAML content pipeline ported to ES-module data. No game systems yet — this is the skeleton every later plan hangs on.

**Architecture:** Pure logic in `src/core/` (state factory + reducer, zero DOM, unit-tested in node). A thin render layer in `src/render/` builds DOM from state against the V0.3 design tokens (jsdom-tested). Content (`content/names.yaml`, `content/script.yaml`) is compiled by `tools/gen-data.mjs` into `src/generated/*.js` ES modules and resolved by `src/content/` (`tok()`, `L()`), reusing the #45/#46 single sources of truth. The old `prototype/year1.html` is untouched and keeps working.

**Tech Stack:** Vanilla ES modules (no framework, no bundler); `yaml` for the generator; `vitest` + `jsdom` for tests; a static dev server (`http-server`) for the browser, wired via `.claude/launch.json`. This ports cleanly to the Next.js production build later (the `src/core/` reducer lifts out unchanged).

**Design tokens (V0.3, from `design/version-1/Bushel and Bone UI.dc.html`):**
- Night (default): `paper #17130d`, `leaf #1f1a12`, `paper-3 #2f2718`, `ink #e9dcbe`, `ink-soft #c3b087`, `ink-faint #8f7e5c`, `rule #4b3f2b`, `rule-fine #38301f`.
- Day: `paper #e7dcc2`, `leaf #ddd0b1`, `ink #2a2216`, `ink-soft #5f5138`, `ink-faint #8a795a`, `rule #a3906c`, `rule-fine #bcab86`.
- Seasons: Spring `#6f8a3f`, Summer `#c0892a`, Fall `#a4482a`, Winter `#5a7d99`. Omen `#a892c4`. **Lamp `#d9a441`** — the *only* interaction color (focus rings, nameplates, touchable things).
- Type ramp (rem of a root; **desktop root 20px, mobile root 17px**): season plate 48/32, scene title 36/26, prose 22/18, choice label 22/18, choice sub 17/15, ledger figure 34/24, label/eyebrow 14/12, seed tag 13/11. Nothing renders under 11px; nothing meaningful under 14px.
- Fonts: **IM Fell English SC** (mastheads/plates/titles), **Spectral** (body/choices), **Courier Prime** (the seed tag only). Ship as local `@font-face` (woff2) — no CDN.
- Spacing spine (px): 4, 8, 12, 20 (card padding / mobile gutter), 32 (desktop gutter), 56 (desktop column separation).

---

## File Structure

```
prototype2/
  index.html                  # app root; loads src/main.js as a module
  package.json                # scripts: test, gen:data, dev
  vitest.config.mjs           # jsdom environment
  tools/
    gen-data.mjs              # content/*.yaml -> src/generated/*.js
  src/
    main.js                   # boot: build initial state, render, wire events
    core/
      state.js                # initialState(seed, lineageName) -> State (pure)
      reducer.js              # reduce(state, action) -> State (pure, no DOM)
      rng.js                  # seeded PRNG (ported from year1.html mulberry32)
    content/
      names.js                # tok()/resolveTokens() over generated NAMES
      script.js               # L(id, vars) over generated SCRIPT
    generated/                # written by gen-data.mjs (gitignored? no — committed)
      names.js
      script.js
    render/
      dom.js                  # el(), clear(), mount() helpers
      shell.js                # renderShell(root, state): masthead, ledger, nav
    styles/
      tokens.css              # :root vars (night/day/season), type ramp, fonts
      shell.css               # shell layout (phone + desktop)
  assets/
    logo.png                  # copied from design/version-1/assets
    fonts/                    # imfell-*.woff2, spectral-*.woff2, courierprime.woff2
  tests/
    core-state.test.mjs
    core-reducer.test.mjs
    content.test.mjs
    shell.test.mjs
    smoke.test.mjs
```

Responsibility boundaries: `core/` is pure and DOM-free (the game truth). `render/` reads state and writes DOM, never mutates state. `content/` resolves tokens/lines. `generated/` is machine-written and never hand-edited. `main.js` is the only place the three meet.

---

## Task 1: Scaffold `prototype2/` with tests and a dev server

**Files:**
- Create: `prototype2/package.json`
- Create: `prototype2/vitest.config.mjs`
- Create: `prototype2/index.html`
- Create: `prototype2/src/main.js`
- Create: `prototype2/tests/smoke.test.mjs`
- Modify: `.claude/launch.json` (add a static-server entry; create the file if absent)

- [ ] **Step 1: Create `prototype2/package.json`**

```json
{
  "name": "bushel-bone-prototype2",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "gen:data": "node tools/gen-data.mjs",
    "dev": "http-server . -p 4321 -c-1"
  },
  "devDependencies": {
    "http-server": "^14.1.1",
    "jsdom": "^24.0.0",
    "vitest": "^2.0.0",
    "yaml": "^2.9.0"
  }
}
```

- [ ] **Step 2: Install deps**

Run: `cd prototype2 && npm install`
Expected: creates `node_modules/`, no errors.

- [ ] **Step 3: Create `prototype2/vitest.config.mjs`**

```javascript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "jsdom", include: ["tests/**/*.test.mjs"] },
});
```

- [ ] **Step 4: Create `prototype2/index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Bushel &amp; Bone</title>
  <link rel="stylesheet" href="src/styles/tokens.css" />
  <link rel="stylesheet" href="src/styles/shell.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create `prototype2/src/main.js` (temporary boot marker)**

```javascript
// Entry point. Fleshed out in Task 7; for now it proves the module loads.
const app = document.getElementById("app");
if (app) app.textContent = "Bushel & Bone — prototype2 booting.";
export const __BOOTED__ = true;
```

- [ ] **Step 6: Create `prototype2/tests/smoke.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";

describe("scaffold", () => {
  it("loads the entry module", async () => {
    const mod = await import("../src/main.js");
    expect(mod.__BOOTED__).toBe(true);
  });
});
```

- [ ] **Step 7: Run the smoke test**

Run: `cd prototype2 && npm test`
Expected: 1 passing test.

- [ ] **Step 8: Add a dev-server entry to `.claude/launch.json`**

Create `.claude/launch.json` if it does not exist; otherwise add the configuration to the `configurations` array:

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "prototype2", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 4321 }
  ]
}
```

- [ ] **Step 9: Commit**

```bash
git add prototype2/package.json prototype2/package-lock.json prototype2/vitest.config.mjs prototype2/index.html prototype2/src/main.js prototype2/tests/smoke.test.mjs .claude/launch.json
git commit -m "feat(proto2): scaffold modular vanilla prototype with vitest + dev server"
```

---

## Task 2: Design tokens & fonts (V0.3)

**Files:**
- Create: `prototype2/src/styles/tokens.css`
- Create: `prototype2/assets/fonts/` (font files)
- Test: `prototype2/tests/shell.test.mjs` (token presence check added here, expanded in Task 6)

- [ ] **Step 1: Add the font files**

Obtain woff2 for **IM Fell English SC**, **Spectral** (400/500/600 + italic), **Courier Prime** (Google Fonts / open licenses) and place them in `prototype2/assets/fonts/`. If not readily available offline, use the closest already-bundled serif as a temporary `@font-face src` and leave a `/* TODO: swap to IM Fell/Spectral woff2 */` comment — the ramp and roles below do not change.

- [ ] **Step 2: Create `prototype2/src/styles/tokens.css`**

```css
@font-face { font-family: "Fell SC"; src: url("../../assets/fonts/imfell-sc.woff2") format("woff2"); font-display: swap; }
@font-face { font-family: "Spectral"; src: url("../../assets/fonts/spectral-400.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: "Spectral"; src: url("../../assets/fonts/spectral-500.woff2") format("woff2"); font-weight: 500; }
@font-face { font-family: "Spectral"; src: url("../../assets/fonts/spectral-italic.woff2") format("woff2"); font-style: italic; }
@font-face { font-family: "Courier Prime"; src: url("../../assets/fonts/courierprime.woff2") format("woff2"); }

:root {
  color-scheme: dark light;
  --paper:#17130d; --leaf:#1f1a12; --paper-3:#2f2718;
  --ink:#e9dcbe; --ink-soft:#c3b087; --ink-faint:#8f7e5c;
  --rule:#4b3f2b; --rule-fine:#38301f;
  --omen:#a892c4; --lamp:#d9a441; --bad:#cf6a4e;
  --accent:#6f8a3f;                 /* season accent, set per data-season */
  --root: 17px;                     /* mobile default */
}
:root[data-theme="day"] {
  --paper:#e7dcc2; --leaf:#ddd0b1; --paper-3:#d3c4a1;
  --ink:#2a2216; --ink-soft:#5f5138; --ink-faint:#8a795a;
  --rule:#a3906c; --rule-fine:#bcab86;
}
[data-season="spring"]{ --accent:#6f8a3f; }
[data-season="summer"]{ --accent:#c0892a; }
[data-season="fall"]  { --accent:#a4482a; }
[data-season="winter"]{ --accent:#5a7d99; }

@media (min-width: 1100px) { :root { --root: 20px; } }

html { font-size: var(--root); }
body {
  margin:0; background:var(--paper); color:var(--ink);
  font-family:"Spectral", Georgia, serif;
}
/* type ramp — rem of --root (mobile shown; desktop scales via --root bump) */
.t-plate  { font-family:"Fell SC", serif; font-size:1.88rem; }   /* 32 / 48 */
.t-title  { font-family:"Fell SC", serif; font-size:1.53rem; }   /* 26 / 36 */
.t-prose  { font-size:1.06rem; line-height:1.6; }                /* 18 / 22 */
.t-choice { font-weight:500; font-size:1.06rem; }                /* 18 / 22 */
.t-sub    { font-style:italic; font-size:0.88rem; color:var(--ink-soft); } /* 15 / 17 */
.t-fig    { font-weight:500; font-variant-numeric:tabular-nums; font-size:1.41rem; } /* 24 / 34 */
.t-label  { font-size:0.82rem; letter-spacing:.22em; text-transform:uppercase; color:var(--ink-faint); } /* 12 / 14 */
```

- [ ] **Step 3: Create `prototype2/tests/shell.test.mjs` with a token smoke check**

```javascript
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tokens = readFileSync(join(here, "..", "src", "styles", "tokens.css"), "utf8");

describe("design tokens", () => {
  it("defines the V0.3 night palette, lamp, and season accents", () => {
    expect(tokens).toContain("--paper:#17130d");
    expect(tokens).toContain("--lamp:#d9a441");
    expect(tokens).toContain('[data-season="fall"]{ --accent:#a4482a; }');
    expect(tokens).toContain('[data-theme="day"]');
  });
});
```

- [ ] **Step 4: Run the test**

Run: `cd prototype2 && npm test tests/shell.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/styles/tokens.css prototype2/assets/fonts prototype2/tests/shell.test.mjs
git commit -m "feat(proto2): V0.3 design tokens (night/day, seasons, lamp, type ramp)"
```

---

## Task 3: Port the content pipeline to ES-module data

**Files:**
- Create: `prototype2/tools/gen-data.mjs`
- Create: `prototype2/src/content/names.js`
- Create: `prototype2/src/content/script.js`
- Create: `prototype2/src/generated/names.js`, `prototype2/src/generated/script.js` (via the generator)
- Test: `prototype2/tests/content.test.mjs`

- [ ] **Step 1: Create `prototype2/tools/gen-data.mjs`**

```javascript
// Compile content/*.yaml into ES-module data. Single source of truth stays the
// YAML (#45 names, #46 script); this replaces year1.html's inline injection.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
const content = join(here, "..", "..", "content");
const out = join(here, "..", "src", "generated");
mkdirSync(out, { recursive: true });

// names.yaml -> { places, terms, characters, locations }
const names = parse(readFileSync(join(content, "names.yaml"), "utf8"));
writeFileSync(join(out, "names.js"), "export default " + JSON.stringify(names, null, 2) + ";\n");

// script.yaml -> flat { "<scene>.<field>": string, "<scene>.<choice>.<field>": string }
const script = parse(readFileSync(join(content, "script.yaml"), "utf8"));
const flat = {};
for (const [sid, scene] of Object.entries(script.scenes || {})) {
  for (const [k, v] of Object.entries(scene)) {
    if (k === "speaker" || k === "setting") continue;
    if (k === "choices") for (const [cid, ch] of Object.entries(v)) for (const [ck, cv] of Object.entries(ch)) flat[`${sid}.${cid}.${ck}`] = cv;
    else flat[`${sid}.${k}`] = v;
  }
}
writeFileSync(join(out, "script.js"), "export default " + JSON.stringify(flat, null, 2) + ";\n");
console.log(`gen:data — ${Object.keys(names.characters || {}).length} characters, ${Object.keys(flat).length} script lines.`);
```

- [ ] **Step 2: Run the generator**

Run: `cd prototype2 && npm run gen:data`
Expected: writes `src/generated/names.js` and `src/generated/script.js`; logs counts.

- [ ] **Step 3: Create `prototype2/src/content/names.js` (the resolver, ported from year1.html tok/lookupName)**

```javascript
import NAMES from "../generated/names.js";

export function lookupName(path) {
  const p = path.split(".");
  if (p[0] === "npc")   { const c = NAMES.characters[p[1]]; return c ? c[p[2] || "name"] : null; }
  if (p[0] === "loc")   { const l = NAMES.locations[p[1]]; return l ? l[p[2] || "cap"] : null; }
  if (p[0] === "place") { const v = NAMES.places[p[1]]; return v == null ? null : v; }
  if (p[0] === "term")  { const v = NAMES.terms[p[1]]; return v == null ? null : v; }
  return null;
}

// Multi-pass so composed names ("Meredith {{term.vane}}") fully resolve.
export function tok(s, extra) {
  if (typeof s !== "string" || s.indexOf("{{") < 0) return s;
  let prev;
  for (let i = 0; i < 5 && s.indexOf("{{") >= 0 && s !== prev; i++) {
    prev = s;
    s = s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, path) => {
      if (extra && path in extra) return extra[path];
      const v = lookupName(path);
      return v == null ? m : v;
    });
  }
  return s;
}
export { NAMES };
```

- [ ] **Step 4: Create `prototype2/src/content/script.js`**

```javascript
import SCRIPT from "../generated/script.js";

// L(id[, vars]) returns a dialogue line; {{name}} tokens resolve later at render
// via tok(); single-brace {slot}s (runtime values) are filled here.
export function L(id, vars) {
  let s = SCRIPT[id];
  if (s == null) return "{" + id + "}";
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}
export { SCRIPT };
```

- [ ] **Step 5: Create `prototype2/tests/content.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { tok } from "../src/content/names.js";
import { L, SCRIPT } from "../src/content/script.js";

describe("content pipeline", () => {
  it("resolves composed name tokens", () => {
    expect(tok("{{npc.meredith}}")).toBe("Meredith Vane");
    expect(tok("Mr. {{term.ridley}}")).toBe("Mr. Ridley");
  });
  it("L returns lines and fills slots", () => {
    expect(Object.keys(SCRIPT).length).toBeGreaterThan(150);
    expect(L("spring_open.title")).toBe("Your uncle's ground");
    expect(L("nope.nope")).toBe("{nope.nope}");
  });
});
```

- [ ] **Step 6: Run the tests**

Run: `cd prototype2 && npm test tests/content.test.mjs`
Expected: PASS (proves the YAML ported and resolves).

- [ ] **Step 7: Commit**

```bash
git add prototype2/tools/gen-data.mjs prototype2/src/content prototype2/src/generated prototype2/tests/content.test.mjs
git commit -m "feat(proto2): port names/script YAML to ES-module data + resolvers"
```

---

## Task 4: The state model

**Files:**
- Create: `prototype2/src/core/rng.js`
- Create: `prototype2/src/core/state.js`
- Test: `prototype2/tests/core-state.test.mjs`

- [ ] **Step 1: Create `prototype2/src/core/rng.js` (ported mulberry32)**

```javascript
export function mulberry32(seed) {
  let state = seed | 0;
  const fn = () => {
    state |= 0; state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  fn.state = () => state;
  return fn;
}
```

- [ ] **Step 2: Create `prototype2/src/core/state.js`**

```javascript
// The whole game state is one plain, serializable object (per project convention).
// This is the Year-1 starting state; later plans extend it (events, town, years).
export function makeHand(id, name, { body = "average", mind = "average" } = {}) {
  return { id, name, body, mind, task: "rest", condition: "steady", morale: 4, alive: true, traits: [] };
}

export function initialState(seed = 1, lineageName = "Crane") {
  return {
    seed: seed >>> 0,
    rngState: seed >>> 0,
    lineageName,
    year: 1,
    seasonIndex: 0,          // 0=spring..3=winter
    week: 1,                 // 1..5
    theme: "night",
    weather: { key: "cold-rain", label: "Cold rain", grow: 0 },
    coin: 100, larder: 80, fuel: 0, seed: 20,
    regard: 20,
    reckoning: 0,            // hidden
    fields: [0, 1, 2, 3].map((i) => ({ id: i, crop: null, progress: 0, fert: 3, taint: 0 })),
    hands: [makeHand("reuben", "Reuben")],
    foremanId: "reuben",
    log: [],
    screen: "morning-brief",
    ended: false,
  };
}

export const SEASONS = ["spring", "summer", "fall", "winter"];
export const WEEKS_PER_SEASON = 5;
export const season = (s) => SEASONS[s.seasonIndex];
export const livingHands = (s) => s.hands.filter((h) => h.alive);
```

- [ ] **Step 3: Create `prototype2/tests/core-state.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState, season, livingHands, WEEKS_PER_SEASON } from "../src/core/state.js";

describe("initial state", () => {
  it("starts a Year-1 spring homestead with Reuben and the four resources", () => {
    const s = initialState(123, "Mackall");
    expect(s.year).toBe(1);
    expect(season(s)).toBe("spring");
    expect(s.week).toBe(1);
    expect(WEEKS_PER_SEASON).toBe(5);
    expect(s.coin).toBe(100);
    expect(s.larder).toBe(80);
    expect(livingHands(s).map((h) => h.name)).toEqual(["Reuben"]);
    expect(s.lineageName).toBe("Mackall");
  });
  it("is JSON-serializable (no functions/cycles)", () => {
    const s = initialState(1);
    expect(() => JSON.parse(JSON.stringify(s))).not.toThrow();
  });
});
```

- [ ] **Step 4: Run the tests**

Run: `cd prototype2 && npm test tests/core-state.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/core/rng.js prototype2/src/core/state.js prototype2/tests/core-state.test.mjs
git commit -m "feat(proto2): serializable game state model + seeded rng"
```

---

## Task 5: The reducer & `advanceWeek` skeleton

**Files:**
- Create: `prototype2/src/core/reducer.js`
- Test: `prototype2/tests/core-reducer.test.mjs`

- [ ] **Step 1: Create `prototype2/src/core/reducer.js`**

```javascript
import { SEASONS, WEEKS_PER_SEASON } from "./state.js";

// Pure: (state, action) => nextState. Never mutates the input.
// Later plans add cases (assign, plant, resolveEvent, ...). For now: theme + the
// week/season/year clock, which the shell needs to render and advance.
export function reduce(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.theme === "day" ? "day" : "night" };
    case "ADVANCE_WEEK":
      return advanceWeek(state);
    default:
      return state;
  }
}

function advanceWeek(s) {
  let { week, seasonIndex, year } = s;
  week += 1;
  if (week > WEEKS_PER_SEASON) {
    week = 1;
    seasonIndex += 1;
    if (seasonIndex > SEASONS.length - 1) { seasonIndex = 0; year += 1; }
  }
  return { ...s, week, seasonIndex, year };
}
```

- [ ] **Step 2: Create `prototype2/tests/core-reducer.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { initialState, season } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

describe("reducer", () => {
  it("SET_THEME toggles without mutating the input", () => {
    const s = initialState(1);
    const next = reduce(s, { type: "SET_THEME", theme: "day" });
    expect(next.theme).toBe("day");
    expect(s.theme).toBe("night"); // input untouched
  });
  it("ADVANCE_WEEK rolls weeks, then seasons, then the year", () => {
    let s = initialState(1);
    for (let i = 0; i < 4; i++) s = reduce(s, { type: "ADVANCE_WEEK" });
    expect(s.week).toBe(5);
    expect(season(s)).toBe("spring");
    s = reduce(s, { type: "ADVANCE_WEEK" }); // week 5 -> next season
    expect(s.week).toBe(1);
    expect(season(s)).toBe("summer");
    for (let i = 0; i < 15; i++) s = reduce(s, { type: "ADVANCE_WEEK" }); // through winter into Year 2
    expect(s.year).toBe(2);
    expect(season(s)).toBe("spring");
  });
});
```

- [ ] **Step 3: Run the tests**

Run: `cd prototype2 && npm test tests/core-reducer.test.mjs`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add prototype2/src/core/reducer.js prototype2/tests/core-reducer.test.mjs
git commit -m "feat(proto2): pure reducer with theme + week/season/year clock"
```

---

## Task 6: Render the V0.3 shell (masthead, ledger, six-tab nav)

**Files:**
- Create: `prototype2/src/render/dom.js`
- Create: `prototype2/src/render/shell.js`
- Create: `prototype2/src/styles/shell.css`
- Modify: `prototype2/tests/shell.test.mjs`

- [ ] **Step 1: Create `prototype2/src/render/dom.js`**

```javascript
// Tiny DOM helpers so render code stays declarative and framework-free.
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v != null) node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c != null) node.append(c);
  return node;
}
export const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };
```

- [ ] **Step 2: Create `prototype2/src/render/shell.js`**

```javascript
import { el, clear } from "./dom.js";
import { season, livingHands } from "../core/state.js";

const SEASON_LABEL = { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" };
const YEAR_WORD = ["One", "Two", "Three", "Four"];
const TABS = ["Home", "Fields", "Hands", "Town", "Ledger", "Almanac"];

// Renders the persistent chrome around whatever screen is active. Reads state,
// writes DOM into `root`, and calls back on dispatchable UI (theme, tabs, advance).
export function renderShell(root, state, dispatch) {
  root.setAttribute("data-theme", state.theme);
  root.setAttribute("data-season", season(state));
  clear(root);

  const dayOf20 = (state.week - 1) * 4 + 1; // week 1 -> day 1; a week is 4 days
  const masthead = el("header", { class: "masthead" }, [
    el("span", { class: "brand t-plate", text: "Bushel & Bone" }),
    el("span", { class: "season t-title", text: SEASON_LABEL[season(state)] }),
    el("span", { class: "when t-label", text: `Year ${YEAR_WORD[state.year - 1] || state.year} · Day ${dayOf20} of 20` }),
    el("span", { class: "weather t-label", text: state.weather.label }),
    el("button", { class: "themetog", "aria-label": "Toggle day and night",
      onClick: () => dispatch({ type: "SET_THEME", theme: state.theme === "night" ? "day" : "night" }), text: "☾" }),
  ]);

  const ledger = el("div", { class: "ledger" }, [
    cell("Coin", state.coin, "m"), cell("Larder", Math.floor(state.larder)),
    cell("Fuel", state.fuel), cell("Seed", state.seed),
  ]);

  const stage = el("main", { class: "stage", id: "stage" });

  const nav = el("nav", { class: "tabbar" }, TABS.map((t) =>
    el("button", { class: "tab" + (t.toLowerCase() === (state.screen === "morning-brief" ? "home" : state.screen) ? " sel" : ""),
      "data-tab": t.toLowerCase(), text: t })));

  root.append(masthead, ledger, stage, nav);
  return stage;
}

function cell(label, value, unit) {
  return el("div", { class: "cell" }, [
    el("div", { class: "t-label", text: label }),
    el("div", { class: "t-fig", text: unit ? `${value}${unit}` : String(value) }),
  ]);
}
export { TABS };
```

- [ ] **Step 3: Create `prototype2/src/styles/shell.css`**

```css
#app { min-height: 100dvh; display: flex; flex-direction: column; background: var(--paper); }
.masthead { display: flex; align-items: baseline; gap: 12px; padding: 12px 20px; border-bottom: 1px solid var(--rule-fine); background: var(--leaf); }
.masthead .brand { font-size: 1.2rem; }
.masthead .when, .masthead .weather { margin-left: auto; }
.masthead .themetog { all: unset; cursor: pointer; color: var(--ink-faint); padding: 2px 8px; border: 1px solid var(--rule-fine); border-radius: 2px; }
.masthead .themetog:hover, .masthead .themetog:focus-visible { color: var(--ink); border-color: var(--lamp); outline: none; }
.ledger { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 10px 20px; border-bottom: 1px solid var(--rule-fine); background: var(--paper-3); }
.ledger .cell { text-align: left; }
.stage { flex: 1; padding: 20px; overflow-y: auto; }
.tabbar { display: grid; grid-template-columns: repeat(6, 1fr); border-top: 1px solid var(--rule); background: var(--leaf); }
.tabbar .tab { all: unset; cursor: pointer; text-align: center; padding: 14px 4px; min-height: 56px; box-sizing: border-box; color: var(--ink-faint); font-size: 0.82rem; letter-spacing: .08em; }
.tabbar .tab.sel { color: var(--lamp); }
.tabbar .tab:focus-visible { outline: 2px solid var(--lamp); outline-offset: -2px; }
@media (min-width: 1100px) {
  .tabbar { grid-template-columns: repeat(6, max-content); justify-content: center; gap: 56px; border-top: none; border-bottom: 1px solid var(--rule); order: -1; }
  .stage { max-width: 1004px; margin: 0 auto; width: 100%; }
}
```

- [ ] **Step 4: Add shell render tests to `prototype2/tests/shell.test.mjs`**

Append to the existing file:

```javascript
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { renderShell, TABS } from "../src/render/shell.js";

describe("shell render", () => {
  it("renders masthead, four ledger cells, six named tabs, and the day counter", () => {
    const root = document.createElement("div");
    let state = initialState(1, "Mackall");
    renderShell(root, state, () => {});
    expect(root.querySelectorAll(".ledger .cell").length).toBe(4);
    expect([...root.querySelectorAll(".tabbar .tab")].map((t) => t.textContent)).toEqual(TABS);
    expect(root.querySelector(".when").textContent).toContain("Day 1 of 20");
    expect(root.getAttribute("data-season")).toBe("spring");
  });
  it("the theme toggle dispatches SET_THEME and re-renders to day", () => {
    const root = document.createElement("div");
    let state = initialState(1);
    const dispatch = (action) => { state = reduce(state, action); renderShell(root, state, dispatch); };
    renderShell(root, state, dispatch);
    root.querySelector(".themetog").click();
    expect(state.theme).toBe("day");
    expect(root.getAttribute("data-theme")).toBe("day");
  });
});
```

- [ ] **Step 5: Run the tests**

Run: `cd prototype2 && npm test tests/shell.test.mjs`
Expected: PASS (token check from Task 2 + these two).

- [ ] **Step 6: Commit**

```bash
git add prototype2/src/render prototype2/src/styles/shell.css prototype2/tests/shell.test.mjs
git commit -m "feat(proto2): render the V0.3 shell (masthead, ledger, six-tab nav)"
```

---

## Task 7: Boot & wire (`main.js`)

**Files:**
- Modify: `prototype2/src/main.js`
- Test: `prototype2/tests/smoke.test.mjs`

- [ ] **Step 1: Replace `prototype2/src/main.js`**

```javascript
import { initialState } from "./core/state.js";
import { reduce } from "./core/reducer.js";
import { renderShell } from "./render/shell.js";
import { el } from "./render/dom.js";

export function boot(root, opts = {}) {
  let state = initialState(opts.seed ?? ((Math.random() * 1e9) >>> 0), opts.lineageName ?? "Crane");
  function dispatch(action) { state = reduce(state, action); render(); }
  function render() {
    const stage = renderShell(root, state, dispatch);
    // Placeholder screen content until Plan 2 wires the Morning Brief.
    stage.append(el("h2", { class: "t-title", text: "Morning Brief" }),
      el("button", { class: "t-choice", text: "Advance the week", onClick: () => dispatch({ type: "ADVANCE_WEEK" }) }));
  }
  render();
  return { getState: () => state, dispatch };
}

if (typeof document !== "undefined" && document.getElementById("app")) {
  window.__BB__ = boot(document.getElementById("app"));
}
export const __BOOTED__ = true;
```

- [ ] **Step 2: Update `prototype2/tests/smoke.test.mjs`**

```javascript
import { describe, it, expect } from "vitest";
import { boot } from "../src/main.js";

describe("boot", () => {
  it("renders the shell into a root and advances the week on click", () => {
    const root = document.createElement("div");
    const app = boot(root, { seed: 1, lineageName: "Mackall" });
    expect(root.querySelector(".masthead")).toBeTruthy();
    expect(app.getState().week).toBe(1);
    root.querySelector(".stage button").click();
    expect(app.getState().week).toBe(2);
  });
});
```

- [ ] **Step 3: Run the full suite**

Run: `cd prototype2 && npm test`
Expected: all tests pass (smoke, tokens, shell, content, state, reducer).

- [ ] **Step 4: Verify in the browser**

Start the `prototype2` dev server (preview) and confirm the V0.3 shell renders (masthead, ledger, six tabs), the theme toggle flips night/day, and "Advance the week" moves the Day counter.

- [ ] **Step 5: Commit**

```bash
git add prototype2/src/main.js prototype2/tests/smoke.test.mjs
git commit -m "feat(proto2): boot + wire the shell, theme, and week clock"
```

---

## Self-Review

**Spec coverage (this plan is Plan 1 = §9 rebuild foundation + the shell only):**
- V0.3 two form factors + six-tab bar (§9) → Tasks 2, 6 (tokens, `.tabbar`, the desktop media query, `TABS`).
- Content pipeline reuse (#45/#46) → Task 3 (`gen-data.mjs`, `content/` resolvers, `content.test`).
- Pure `(state, action) => state` core (tech conventions) → Tasks 4–5 (`state.js`, `reducer.js`, unit tests).
- The weekly clock underpinning §10's beat → Task 5 (`ADVANCE_WEEK`) and the "Day X of 20" reconciliation (D-047) → Task 6 (`dayOf20`).
- **Deferred to later plans (not gaps):** the weekly loop content, hands/crops/resources (§10) → Plan 2; town (§2) → Plan 3; the squeeze/years (§3) → Plan 4; Almanac/legacy/letter (§4, §9) → Plan 5.

**Placeholder scan:** the only soft spot is Task 2 Step 1 (font files) — flagged with an explicit fallback and a `TODO` comment because the woff2 assets may not be fetchable offline; the ramp/roles are fully specified regardless. No other placeholders.

**Type consistency:** `reduce(state, action)` signature, action types (`SET_THEME`, `ADVANCE_WEEK`), `initialState(seed, lineageName)`, `renderShell(root, state, dispatch)`, `el/clear`, `tok`/`L`, `season`/`livingHands`/`WEEKS_PER_SEASON` are used identically across Tasks 4–7 and their tests.

---

## Next plans (written after this one lands)

Plan 2 — the weekly loop & the hands; Plan 3 — the town; Plan 4 — the year & the squeeze; Plan 5 — polish, the Almanac, the hybrid opening letter. Each produces working, tested software on its own.
