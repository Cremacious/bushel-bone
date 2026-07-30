# Prototype2 — V0.3 Visual-Fidelity Pass

**Goal:** Make `prototype2/` *look like* the Claude Design V0.3 (`design/version-1/`), not a wireframe. Apply the full visual language — the real fonts (done), the engraved almanac leaf, the brass ledger bar, location plates with weather + omen, drop-caps, the four rule styles, the six motions, portraits/nameplates, and the two form factors (portrait-phone shell + desktop floating-leaf-on-full-bleed-plate) — to the screens that already exist from Plan 2.

**Source of truth:** `docs/design/v03-reference.md` (a complete transcription of the design file). Every hex, size, and component spec is there. When a value is needed, quote it from the reference.

**Scope reality (important):** The design mockups depict features from later plans (a standing NPC portrait, weather variety, the omen stain, a multi-hand roster with morale dots, Ask-Reuben, the town). Those are **placeholdered** here, matching the design's own "[ art drops in here ]" convention, and wired to real data as Plans 3–5 build the systems. This pass changes **presentation only** — no game logic, no reducer, no selectors. `prototype/year1.html` stays untouched.

**Form-factor priority:** The game is portrait-primary (locked). Build the **portrait-phone shell to full fidelity first** (Stages 1–4), then the **desktop floating-leaf treatment** (Stage 5). Verify each stage in the browser at the real breakpoints.

**Files:** almost entirely `prototype2/src/styles/*.css` plus small, presentational render-structure additions in `prototype2/src/render/*.js` (wrapper elements for the leaf/plate/portrait, a drop-cap span, motion classes, the engraver SVG icons). Tests stay green; a couple of new DOM-presence tests guard the new structure.

**Execution:** Implemented directly with browser verification at each stage (visual work needs eyes on the result), committed per stage on branch `feat/prototype2-v03-visual` (the font quick-win already lives there). The full test suite must stay green after every stage.

---

## Stage 0 — Fonts (DONE)

Committed (`ea62ad5`): the three faces load from Google Fonts via `index.html`; the type ramp points at `IM Fell English SC` / `Spectral` / `Courier Prime`; added `--good`/`--warn`/`--ink-hi` tokens. This is the biggest single fidelity jump and it is already live.

---

## Stage 1 — Foundation: page ground, leaf surface, rules, drop-cap, the six motions

**Files:** `tokens.css` (finish tokens), new `motion.css`, `shell.css`/`screens.css` foundations. Link `motion.css` in `index.html`.

- [ ] **True page ground.** The real page background is `#0b0906` (darker than `--paper #17130d`, which is the *surface*). Add `--ground:#0b0906` and set it behind the app; `--paper` stays the leaf/desk surface. Add the observed load-bearing tokens from reference §2: `--card:#12100b`, `--card-2:#171309`, `--card-rule:#2f2718`, `--leaf-top:#221c13`, `--leaf-bot:#1b1610`, `--ledger-top:#2a2216`, `--ledger-bot:#211a11`, `--rule-hair:#3a3020`, `--dialogue:#f4ead0`, `--gold-2:#a4842a`, `--art-brief:#b09a63`. Day-theme equivalents per reference §2.
- [ ] **The four rules** (reference §5) as utility classes: `.rule-hair` (1px `--rule`), `.rule-double` (3px, top+bottom 1px `--rule`), `.rule-hatch` (9px `repeating-linear-gradient(45deg,var(--rule) 0 1px,transparent 1px 5px)`), and `.spine` (4px season accent, used on the leaf/shell binding edge). Eyebrows above titles already use `.t-label`.
- [ ] **Drop-cap.** A `.prose .dropcap:first-letter` (or a `<span class="dropcap">`) treatment: Fell SC, ~3 lines tall, float left, season-accent or ink-hi, per the Morning Brief's dropped "T". The script bodies already carry `.dropcap` on the first para (from #46) — style it.
- [ ] **The six motions** → `motion.css`: all keyframes verbatim from reference §7 (`bb-turn, bb-rule, bb-tick, bb-rain, bb-snow, bb-stain, bb-crow, bb-line, bb-bleed, bb-lamp, bb-dot`), plus the global `@media (prefers-reduced-motion:reduce){ *{animation:none!important;transition:none!important} }`. Utility classes: `.m-turn` (on a screen/leaf mount), `.m-line` (day-book/ledger line reveal, staggerable via `--i`). Wire `.m-turn` onto the stage on each render and `.m-line` onto Dusk day-book lines. Never animate body prose or scene titles.
- [ ] Full suite green. **Commit** `feat(proto2): V0.3 foundation — ground/leaf tokens, rules, drop-cap, motion vocabulary`.

**Verify:** the Morning Brief shows a drop-cap and a hatch rule under the eyebrow; a screen change plays the Turn; reduced-motion kills it.

---

## Stage 2 — The portrait shell: spine, masthead, brass ledger bar, six-tab bar

**Files:** `shell.js` (structure), `shell.css` (the portrait shell per reference §10 + §8.6 + §8.1 + §8.7).

- [ ] **Masthead** (reference §8.6 mobile): a 4px season-spine bar on top, then a row (wordmark `.t-label` + weather glyph + help/settings icon buttons, 34×34, `1px solid --rule`), then a `border-bottom:3px double --rule` season + "Year One · Day X of 20" row with the **five season pips** (filled = weeks elapsed in season, in season accent; empty = `1px solid --rule`). Wordmark "Bushel & Bone" in `.t-label`; season name in `.t-plate` (Fell SC); day-count in season accent.
- [ ] **Brass ledger bar** (reference §8.1 mobile): replace the flat 4-cell strip with the brass bar — `background:linear-gradient(var(--ledger-top),var(--ledger-bot)); border-bottom:1px solid var(--rule)`, four flex cells each `flex:1; text-align:center; border-right:1px solid var(--rule-hair)` (last none), label `.t-label` 11/14, value 24px tnum, **valence override** on value color (Larder low → `--warn`, Fuel critical → `--bad`, via a class the render sets from `warnings`/thresholds). Coin carries a faint "m" unit. Folds to a 2×2 wrapped grid at 150% type.
- [ ] **Warnings band** (reference §8.1): its own row below the figures, `background:color-mix(in srgb,var(--bad) 7%,transparent)`, each line `border-left:3px solid` its tier color + `padding-left:10px`, and **column layout when 2+ fire** so none truncates.
- [ ] **Six-tab bottom bar** (reference §8.7): `border-top:1px solid --rule; background:var(--card)`, each tab a column (engraver SVG icon 24×24 + label 10px .1em uppercase), **selected tab** gets `border-top:2px solid` season accent and its icon+label in the season accent; unselected in `--ink-faint`. Add the six engraver icons (reference §6) as inline SVG. `padding-bottom:14px` safe-area.
- [ ] Full suite green (update the shell test's assertions for the new structure; keep them meaningful). **Commit** `feat(proto2): V0.3 portrait shell — masthead, season pips, brass ledger, engraved tab bar`.

**Verify at 390px:** masthead reads like the design (spine, double rule, pips), the ledger is a brass bar with a valence-colored figure when short, the tab bar has engraver icons and a season-accent selected state.

---

## Stage 3 — Components: choice card (bleed + valence tag + arithmetic), crop chip, plate + caption

**Files:** `components.js`, `screens.js` (planting/weekly), `screens.css`.

- [ ] **Choice card** (reference §8.2): primary = `1px solid var(--lamp)` + `rgba(217,164,65,.13)` fill; plain = `1px solid var(--rule)`; disabled = `1px solid var(--card-rule); opacity:.55` with the **arithmetic line** in `--bad` (the disabled `why` already exists — restyle it). Title row `justify-content:space-between`; the Courier **tag colored by valence** (good `--good` / bad `--bad` / neutral `--ink-soft`); sub-line in **IM Fell English italic**. On selection, the **ink-bleed dot**: a lamp dot at the left margin animating `bb-bleed .4s`, border warming to lamp, a 180ms hold, then the Turn. (A `data-`/class hook the click sets before dispatch.)
- [ ] **Crop chip** (reference §8.4/§9 Screen 05): fixed grid, `min-height:56px`, name over cost, **selected takes the season accent** border+tint; unaffordable `opacity:.45` plain border; "Just set" chip on a freshly-planted field gets a lamp background with dark text. Planting is the densest screen — match the field-row/expand treatment as close as the current single-column data allows (defer the full 2×2 field-map to the desktop stage / a later pass; note it).
- [ ] **Location plate + caption** (reference §8.4): a plate band above the reading area — `repeating-linear-gradient(135deg,#26201a 0 4px,#2e2720 4px 8px)` texture, a radial vignette, the **art-brief placeholder** in IM Fell italic `--art-brief` (`[ the four fallow fields, and the woodpile behind the house ]` style, per screen), an **engraved double border** (`box-shadow:0 0 0 2px var(--leaf),0 0 0 3px var(--rule)`), and the location caption below (name in Fell SC + italic aside). The plate is where weather/omen live (Stage 4).
- [ ] Suite green (+ a test: a disabled choice card shows its arithmetic; a plate renders on a beat screen). **Commit** `feat(proto2): V0.3 choice cards, crop chips, location plate + caption`.

**Verify:** choice cards match the design (valence tag, italic sub, arithmetic on disabled, bleed on click); the brief/weekly screens show a framed plate with an art-brief caption.

---

## Stage 4 — Atmosphere: weather particles, the omen stain, portrait + nameplate

**Files:** `screens.js` (plate contents), `screens.css`, a small `weather.js`/`atmosphere.js` render helper.

- [ ] **Weather particles** over the plate (reference §8.4 + §7): from `state.weather.key`, render `bb-rain` streaks (cold rain/rain) or `bb-snow` dots (winter), staggered, low opacity, **over the plate only, never over type**. Dry/clear → no particles (optional heat shimmer later). Honor reduced-motion (hold a mid-frame).
- [ ] **Omen stain + crow** (reference §8.4): only when the hidden `reckoning` is past a first threshold (it is 0 in the Plan-2 slice, so this is dormant/rarely visible now, but wire it): a violet `radial-gradient` stain breathing on `bb-stain` (cycle shortens as reckoning rises) and a crow glyph blinking on `bb-crow`. No number, no red, no shake.
- [ ] **Speaker portrait + nameplate** (reference §8.5): when a beat has a speaker (the brief/weekly are player-facing; Reuben speaks in the tutor/Ask context later) show the silhouette block + **lamp nameplate** (name in Fell SC, role/epithet in lamp). For the Plan-2 screens that have no on-plate speaker, this stays absent — structure ready, not forced. Placeholder silhouette per the design (stacked dark shapes).
- [ ] Suite green. **Commit** `feat(proto2): V0.3 atmosphere — weather particles, omen stain, portrait/nameplate`.

**Verify:** Spring/cold-rain shows rain over the plate; switch weather to winter → snow; type is never under the particles; reduced-motion stills them.

---

## Stage 5 — Desktop: full-bleed plate + floating leaf, and per-screen polish

**Files:** `shell.css`/`screens.css` desktop `@media (min-width:1100px)`, small `shell.js` structure.

- [ ] **Desktop layout** (reference §10 + §9): at ≥1100px, the plate becomes the **full-bleed canvas** (texture+vignette+weather+omen across the whole stage), the masthead + a **location band** become translucent chrome floating over it, and the reading/ledger content sits in a **floating almanac leaf** — `linear-gradient(var(--leaf-top),var(--leaf-bot)); border:1px solid var(--rule); box-shadow:0 30px 80px rgba(0,0,0,.6)`, pinned right, with the **5px season spine on its left binding edge** and a `bb-turn` on beat change. Desktop has **no bottom tab bar** (the reference confirms it is mobile-only); provide a minimal desktop nav affordance for Fields/Hands/Ledger/Almanac (a small header row or the masthead icons — a judgment call the reference leaves open; keep it quiet and lamp-on-hover).
- [ ] **Per-screen polish** against reference §9: Morning Brief drop-cap + dialogue color; Dusk **day-book** as the six-line table with the **Rule reveal** (`.m-line` staggered) and the omen block arriving last and alone; the Year-1 verdict; the Fields/Hands/Ledger/Almanac tabs restyled to the leaf language.
- [ ] Suite green; browser-verify a full Year-1 walk at both 390px and 1280px. **Commit** `feat(proto2): V0.3 desktop floating-leaf layout + per-screen polish`.

**Verify:** at desktop width the plate is full-bleed with the leaf floating on it (the design's signature look); at phone width the continuous shell; both play a full year cleanly.

---

## Stage 6 — Review, merge

- [ ] A visual self-review against each design screen (side-by-side in the browser); fix the gaps.
- [ ] Full suite green; no console errors at either breakpoint.
- [ ] Merge `feat/prototype2-v03-visual` to `main`; update `CLAUDE.md` + `context/session-history.md`.

---

## Deferred (not this pass, noted so scope is honest)

The full 2×2 planting field-map (desktop), the real illustrated plate art and NPC portraits (art production), the multi-hand roster modal with morale dots, the Ask-Reuben bar behavior, the Town tab, the "tap any figure" ledger popover, and the Motion: Full/Reduced/None settings tier — these are Plan 3–5 systems or art deliverables. This pass installs the visual *slots* and language they drop into.
