# v0.4 Phase 4C — Visual & Info Fixes (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax. One subagent per task; each is TDD (where testable) then reviewed with a fix loop before commit. NEVER use em dashes or hyphen-as-pause in any text you write (hard project rule): use periods, commas, "to", or "and". The Unicode minus in numeric tags is fine.

**Goal:** Four legibility fixes from the playtest. (C1) Kill the highlight line-break / spacing bug, whose ROOT CAUSE is now known: the dialogue highlight classes collide with bare UI utility classes. (C2) Turn the faint resource line into a real status strip that goes amber when short. (C3) Show crop grow-time on the planting chips. Plus (C4, the deferred 4A item) surface how the crew fared in the Dusk day-book so Rest/Care visibly pays off.

**Design reference:** `docs/superpowers/specs/2026-07-30-v04-phase4-clarity-reward-clone-reveal-design.md` Part C (C1-C3) and Part A (A5, the day-book surfacing).

**ROOT CAUSE of C1 (diagnosed live, do not re-investigate):** highlight spans are `<span class="hl wx">`, `<span class="hl omen">`, etc. The category modifiers collide with unrelated bare utility rules:
- `shell.css:45` `.wx { display: flex; ... }` (the masthead weather widget) makes the `hl wx` span `display:flex`, forcing "warm rain comes" onto its own line (note 7).
- `screens.css:209` `.omen { border-left: 4px solid ...; background: ...; padding: 10px 14px; ... }` (an omen callout block) gives the `hl omen` span a border/background/padding, pushing line spacing on "fever and a shake" (note 15).
Both are fixed by making `.prose .hl` (specificity 0,2,0) reset the leaked properties, since it outranks any bare single-class utility (0,1,0). Category COLORS come from `.prose .hl.wx` / `.prose .hl.omen` (0,3,0) and still win, so colors are unaffected.

**Key current code (verified):**
- `screens.css:35` `.prose .hl { font-style: normal; font-weight: 600; }` then `.prose .hl.mkt|.wx|.omen|.ppl|.off { color: ... }`.
- `screens.js` `day:` renderer ~103-105: `let status = \`Larder ${Math.floor(s.larder)} · Fuel ${s.fuel}\`; if (burnsFuel(s) || short) status += ...; stage.append(el("p", { class: "beat-status", text: status }));` where `const n = yearNeeds(s);` gives `{ fuel:{have,need}, food:{have,need} }` and `const short = n.fuel.have < n.fuel.need || n.food.have < n.food.need;`.
- `screens.js` planting renderer: the crop chips render `name · seedcost` per crop from `CROPS`.
- `crops.js`: `CROPS[k].seasons` and `ripe()` at `progress >= seasons`; `dailyGrowth` base `BALANCE.growthPerDay` (0.1). Untended baseline to ripen ≈ `seasons / growthPerDay` = `seasons * 10` days.
- `selectors.js` `duskSummary(s)` and `conditionOf(hand)` (steady/worn/failing/lost); `livingHands(s)`.
- `screens.js` `dusk:` renderer (~148) builds a `.daybook` from `duskSummary`.

**Scope guard (defer):** the variety grammar (4D); the clone reveal (4E). No balance changes.

---

## Task 1: Fix the highlight collision (C1)

**Files:** Modify `prototype2/src/styles/screens.css` (and optionally `shell.css`); add a source-guard test.

- [ ] **Step 1: Reset the highlight span so utility classes cannot leak into it.** Change `screens.css:35` to explicitly reset the properties bare utilities leak (display, border, background, padding), keeping weight/style:
  ```css
  .prose .hl { display: inline; font-style: normal; font-weight: 600; border: 0; background: none; padding: 0; }
  ```
  `.prose .hl` (0,2,0) beats bare `.wx` / `.omen` (0,1,0) for these props; the `.prose .hl.<cat>` color rules (0,3,0) still win for color. This fixes BOTH the `wx` line-break and the `omen` spacing, and immunizes the span against any future category/utility collision.
- [ ] **Step 2 (hardening, recommended): scope the footgun utilities.** In `shell.css`, scope the bare `.wx` masthead rule to its real parent (e.g. `.masthead .wx` or whatever wraps it, check `shell.js` for the element) so a bare `.wx` no longer matches arbitrary spans. Likewise, if trivial, scope the `screens.css:209` `.omen` callout to its real usage (e.g. `.prose .omen` if it is only used inside prose blocks, or a distinct class). If scoping `.omen` risks changing an existing callout's look, leave it (Step 1 already neutralizes the leak) and just note it. Do not rename the highlight categories (that would touch all content spans).
- [ ] **Step 3: A guard test.** jsdom does not compute stylesheet cascade, so a computed-`display` unit test will not work. Instead add a lightweight source guard, e.g. `tests/hl-style.test.mjs` that reads `src/styles/screens.css` and asserts the `.prose .hl` rule contains `display: inline` and `padding: 0` (guards against a regression that reintroduces the leak). Keep it simple.
- [ ] **Step 4:** `cd prototype2 && npx vitest run` -> green. The real proof is the browser step in Task 3. Commit.
```bash
git add prototype2/src/styles/ prototype2/tests/hl-style.test.mjs
git commit -m "fix(proto2): highlight spans no longer collide with .wx/.omen utilities (v0.4 4C task 1)"
```

## Task 2: Status strip, crop grow-time, and the Dusk crew snapshot (C2, C3, C4)

**Files:** Modify `prototype2/src/render/screens.js`, `src/styles/screens.css`; `src/core/selectors.js` (a small crop-summary + maybe a crew-condition read); tests.

- [ ] **Step 1 (C2): The resource status strip.** Replace the single `beat-status` `<p>` (screens.js ~103-105) with a structured strip: a bordered/tinted row of labeled cells. Always show **Larder** and **Fuel** (value + label); in the cold months or when short, also show the winter targets as **have/need** (wood and food). Each cell goes **amber** when that figure is short (reuse the shell's `valence` idea: a `warn`/`bad` class). Add a `.beat-strip` + `.beat-cell` (+ `.beat-cell.warn`) style in `screens.css`, tinted and readable (not the faint mono line). Keep it compact (one row that wraps on narrow screens). Pull the numbers from `yearNeeds(s)` (already in scope) and `s.larder`/`s.fuel`.
- [ ] **Step 2 (C3): Crop grow-time on the planting chips.** Add a small `cropSummary(cropKey)` selector in `selectors.js` (or a helper in crops.js) returning `{ days, lean }` where `days = Math.round(CROPS[cropKey].seasons / BALANCE.growthPerDay)` (the untended baseline, e.g. turnip 10, wheat 20) and `lean = CROPS[cropKey].food > 0 ? "food" : "coin"`. In the planting crop chip render, append a small sub-label to each crop option: `ripens ~${days}d · ${lean}` (e.g. "ripens ~10d · food"). Style it muted/small so the chip stays scannable. No dashes.
- [ ] **Step 3 (C4): The Dusk crew snapshot.** In the `dusk:` renderer, add a short "The crew" section to the day-book: one line per living hand with their end-of-season condition, worded and colored (Steady = good/green, Worn = neutral, Failing = bad/amber), e.g. "Reuben, steady." or "Reuben, worn." This makes a season of Rest/Care visibly pay off (a hand you rested ends Steady) without dumping the raw per-day log. Keep the existing lost-hand lines. Reuse `livingHands(s)` + `conditionOf(h)` and the day-book `line()` helper. (This is the deferred A5 surfacing.)
- [ ] **Step 4: Tests.** With jsdom render tests (see `tests/screens.test.mjs`):
  - C2: a `day:` render shows a `.beat-strip` with Larder and Fuel; when `yearNeeds` reports a shortfall, the short cell carries the `warn`/`bad` class. Construct a short state and an ample state.
  - C3: a planting render includes "ripens ~10d" for turnip and "ripens ~20d" for wheat (and the food/coin lean). Unit-test `cropSummary` directly too (`cropSummary("turnip").days === 10`, `.lean === "food"`; `cropSummary("wheat").days === 20`, `.lean === "coin"`).
  - C4: a `dusk:` render lists a living hand with its condition word.
- [ ] **Step 5:** `npx vitest run` -> green; report counts. Commit.
```bash
git add prototype2/src/render/screens.js prototype2/src/styles/screens.css prototype2/src/core/ prototype2/tests/
git commit -m "feat(proto2): resource status strip, crop grow-time, Dusk crew snapshot (v0.4 4C task 2)"
```

## Task 3: Full suite + browser verify

- [ ] **Step 1:** `cd prototype2 && npx vitest run` -> all green; report counts.
- [ ] **Step 2: Browser verify** (dev server at http://localhost:4321, prototype at `/`).
  - **C1:** trigger or inspect the `ev_good_rain` and `ev_sick_hand` prose (you can inject the body HTML into a `.t-prose` container to inspect, or reach the events): confirm the highlighted phrase now flows **inline** (no "A" alone on a line, no border/background box on "fever and a shake"). Check the computed `display` of a `.prose .hl` span is `inline` and it has no padding/border.
  - **C2:** on the day-1 beat, confirm the resource strip renders as a tinted labeled row and goes amber when a figure is short (a winter beat, or a short larder).
  - **C3:** on the planting screen, confirm each crop chip shows "ripens ~Nd" and the food/coin lean.
  - **C4:** play or fast-forward to a Dusk and confirm the "The crew" condition lines appear.
  - Screenshot the fixed event prose and the status strip. Fix any console errors.
- [ ] **Step 3:** Commit any verify fixes.
```bash
git add -A && git commit -m "fix(proto2): 4C browser-verify fixes"
```

---

## Self-Review notes (author)
- **Spec coverage:** C1 -> Task 1 (root cause is the class collision, fixed by the `.prose .hl` reset); C2 status strip -> Task 2 Step 1; C3 grow-time -> Task 2 Step 2; A5 day-book surfacing -> Task 2 Step 3.
- **C1 is a specificity fix, not a content change:** `.prose .hl` (0,2,0) outranks bare `.wx`/`.omen` (0,1,0) for display/border/background/padding; category colors at (0,3,0) are untouched. No YAML span edits needed.
- **jsdom limit:** it cannot verify computed CSS cascade, so C1's real proof is the browser step; the unit guard is source-level.
- **No balance/logic drift:** C2/C3/C4 are render + one pure selector; no reducer or balance change.
- **No-dash voice:** all new copy avoids em dashes and hyphen-as-pause.
