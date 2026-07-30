# Bushel & Bone — Design Language V0.3 Reference

Transcribed verbatim from `design/version-1/Bushel and Bone UI.dc.html` (a Claude design-canvas doc, ~1818 lines). This is the single source of truth for a visual-fidelity CSS rebuild. All hex values, px sizes, and inline styles below are quoted directly from the source file. Where the source explored A/B/C variants, the **chosen** variant is transcribed in full; the rejected variants get one line each.

Tagline from the doc header: *"The Illustrated Almanac, made commercial. Two form factors, one language."*

Format badges shown in the doc: `Steam 1920 × 1080` · `Portrait 390 × 844` · `Light + Dark`.

---

## 1. Fonts

Google Fonts `<link>` (exact, from `<helmet>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&family=IM+Fell+English:ital@0;1&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Courier+Prime:ital@0;1&display=swap" rel="stylesheet">
```

Base body style: `body{ margin:0; background:#0b0906; }` — `#0b0906` is the true page background (darker than the "paper" token `#17130d`; the paper token is the *screen/desk* surface, `#0b0906` is behind everything).

Link default: `a{ color:#d9a441; text-decoration:none; } a:hover{ color:#f0e4c6; }`

### Face-to-role mapping

| Face | Role |
|---|---|
| **IM Fell English SC** (`'IM Fell English SC',serif`) | Display: masthead wordmark, season name, scene/card titles, letterhead, NPC name on nameplates, field names, choice-card primary label is Spectral not this — see below |
| **IM Fell English** italic (`'IM Fell English',serif; font-style:italic`) | Sub-labels under titles, choice-card sub-line, omen text, NPC dialogue framing text ("your foreman", "the mayor's daughter"), plate captions, letter signature line |
| **Spectral** (`Spectral,serif` / `Spectral,Georgia,serif`) | Body prose (400), choice-card primary label (500), eyebrows/labels (600, wide tracking), general UI text |
| **Courier Prime** (`'Courier Prime',monospace`) | Mechanical/numeric tags only: choice-card cost tags ("6 seed", "80 m"), "spent so far" tallies, the seed-hash footer tag ("seed 3f10a2") |

Rationale quoted from the doc: *"IM Fell English SC is a real 1600s Oxford hand: foxed, hand-set, and period without pastiche. Spectral carries the body because it was cut for screens, has a tall x-height, and holds up at 20px and at 150 percent."*

Licensing note (verbatim): *"IM Fell English SC and IM Fell English are public-domain revivals under the SIL Open Font License. Spectral and Courier Prime are also OFL. All three can be self-hosted and shipped inside a Steam or Capacitor build with no attribution requirement beyond the license file."*

### Rejected type pairings (one line each)

- **A · Didone masthead** (Georgia serif) — *"too polite. reads as a wine label"*
- **C · Heavy slab** (Courier Prime bold) — *"reads Western saloon, not almanac"*

---

## 2. Color tokens

### Night (default)

| Token | Hex |
|---|---|
| paper | `#17130d` |
| leaf | `#1f1a12` |
| ink | `#e9dcbe` |
| ink soft | `#c3b087` |
| rule | `#4b3f2b` |

### Day

| Token | Hex |
|---|---|
| paper | `#e7dcc2` |
| leaf | `#ddd0b1` |
| ink | `#2a2216` |
| ink soft | `#5f5138` |
| rule | `#a3906c` |

Day-theme border weight is heavier: the Day swatch group uses `border:1px solid #bcab86` vs Night's `border:1px solid #2f2718`.

### Season accents (locked, exact)

| Season | Hex |
|---|---|
| Spring | `#6f8a3f` |
| Summer | `#c0892a` |
| Fall | `#a4482a` |
| Winter | `#5a7d99` |

### Semantic colors

| Role | Hex |
|---|---|
| good | `#9fb262` |
| warn | `#d0a54a` |
| bad | `#cf6a4e` |
| omen | `#a892c4` |
| **lamp** | `#d9a441` |

**Lamp is the only interaction color** — focus rings, nameplates, the thing you may touch. Quoted: *"One addition: lamp (#d9a441), lifted from the sun behind the crow in the logo. It is the only interaction color: focus rings, nameplates, the thing you may touch. The seasonal accent keeps rules, labels and glyphs, so accent no longer has to mean both 'it is Fall' and 'press this.'"*

### Additional colors observed in the real screens (not in the section-03 swatch grid, but load-bearing — needed for CSS)

These appear consistently across every mockup and should be treated as tokens too:

| Token (suggested name) | Hex | Where used |
|---|---|---|
| page background | `#0b0906` | `<body>` background, behind the whole desk/plate |
| ink bright | `#f0e4c6` | headings/titles that need to pop above `ink` (masthead wordmark, scene titles, "Just set" text, NPC names on nameplates) |
| ink faint | `#8f7e5c` | eyebrows, secondary labels, disabled/placeholder text (night) |
| ink faint (day) | `#8a795a` | same role, day theme |
| dialogue quote | `#f4ead0` | spoken NPC lines inside prose (brighter than ink, used only for quoted speech) |
| card bg (outer) | `#12100b` | outer card/section backgrounds in the language-spec doc itself |
| card bg (nested) | `#171309` | nested swatch backgrounds |
| card border | `#2f2718` | card/section borders (distinct from `rule` `#4b3f2b`, slightly darker) |
| leaf gradient (top) | `#221c13` | the almanac leaf's actual background in real screens is `linear-gradient(#221c13,#1b1610)`, not flat `#1f1a12` |
| leaf gradient (bottom) | `#1b1610` | see above |
| ledger header gradient (top) | `#2a2216` | the leaf's ledger-bar/household-row background: `linear-gradient(#2a2216,#211a11)` |
| ledger header gradient (bottom) | `#211a11` | see above |
| divider (fine) | `#3a3020` / `#38301f` | hairlines between ledger cells and household chips inside the leaf |
| back-button disabled ink | `#4b4130` | disabled "Back" control text |
| footer copyright text | `#5c4f36` | "Sallows Charter Company · MDCCCXLI" bottom-left, version/Quit bottom-right |
| annotation/meta text | `#6f5f42` | small captions like "chosen", "shown at 60%" in the design doc itself (not in-game) |
| gold-amber (secondary) | `#a4842a` | a secondary, slightly deeper amber distinct from `lamp` `#d9a441`; used for "chosen" example borders, the day-theme CTA border (`Turn the year` button: `border:1px solid #a4842a; background:rgba(169,121,31,.16)`), and the "Just set" planting-chip label background is `#d9a441` (lamp) itself — the two ambers coexist, `#a4842a` reads slightly more antique/day-safe |
| art-brief placeholder text | `#b09a63` | italic bracketed text inside an empty location plate, e.g. `[ art drops in here ]` |

### Day-theme derived semantic colors (observed, not restated in the palette grid)

The Dusk Report screen (day theme) does **not** reuse the night semantic hexes as-is — it darkens them for paper contrast:

| Semantic | Night | Day |
|---|---|---|
| good | `#9fb262` | `#5f7a34` |
| warn | `#d0a54a` | `#a9791f` |
| bad | `#cf6a4e` | `#99381f` |
| omen | `#a892c4` | `#6f5c86` |
| winter accent (as UI text, not the swatch) | `#5a7d99` | `#3f5b71` |
| dotted rule | `#38301f` | `#bcab86` |

Contrast figures stated in the doc: *"ink on leaf is 11.4:1 in day and 12.1:1 in night. The softest text in the system, ink-faint on paper, is 4.7:1, so even the labels clear AA at 14px."*

---

## 3. Type ramp

Root sizing rule (verbatim): *"Every size below is a rem multiple of a 16px root. Desktop sets root to 20px, mobile to 17px, so one ramp serves both and an accessibility bump is a single root change. Body never falls under 17px on a phone or 20px on a desktop."*

| Role | Desktop px | Phone px | Face |
|---|---|---|---|
| Season plate | 48 | 32 | Fell SC |
| Scene title | 36 | 26 | Fell SC |
| Prose | 22 | 18 | Spectral 400 |
| Choice label | 22 | 18 | Spectral 500 |
| Choice sub | 17 | 15 | Spectral italic |
| Ledger figure | 34 | 24 | Spectral 500, tabular-nums |
| Label / eyebrow | 14 | 12 | Spectral 600, `.22em` tracking |
| Seed tag only | 13 | 11 | Courier Prime |

**Hard floor, verbatim: *"The old build had 9.5px ledger keys and 8px plate tags. Both are gone. Nothing under 11px survives anywhere in the system, and nothing under 14px carries meaning a player must read."***

Note: actual screen mockups run somewhat larger than this base ramp at points (e.g. desktop scene title in Morning Brief renders at 44px, in Harvest Home at 34px, in the crowded Screen 08 case at 46px; desktop prose renders at 21-22px matching the ramp). Treat the table as the canonical ramp; screen-specific variance below is transcribed as observed.

---

## 4. Spacing spine

| Step | Use |
|---|---|
| 4 | hairline gaps, dot spacing |
| 8 | inside a chip or badge |
| 12 | between choice cards |
| 20 | card padding, mobile gutter |
| 32 | desktop gutter, block breaks |
| 56 | column separation on desktop |

**56px is also the mandatory minimum touch-target height** — every mobile menu row, choice card, and tab-bar cell in the mockups carries `min-height:56px`.

---

## 5. Rules (dividers)

Framed as *"the almanac's punctuation."* Four exact treatments:

```css
/* hairline — inside a group */
height:1px; background:#4b3f2b;

/* double — a section ends */
height:3px; border-top:1px solid #4b3f2b; border-bottom:1px solid #4b3f2b;

/* hatch — a beat ends */
height:9px; background:repeating-linear-gradient(45deg,#4b3f2b 0 1px,transparent 1px 5px);

/* spine — the season, always on the leaf's binding edge */
height:4px; background:#6f8a3f; /* swap for the active season accent */
```

The season spine is used as: (a) a 4-5px top bar the full width of the desktop screen, always the season accent at `opacity:.9`; (b) a 4px flush-left bar on the portrait shell (`height:4px; background:#6f8a3f`); (c) a 5px left-edge bar on the floating leaf itself (`position:absolute;left:0;top:0;bottom:0;width:5px;background:#6f8a3f`) — this is literally the "binding edge."

Day-theme hairline/dotted-rule color is `#a3906c` / `#bcab86` (dotted) instead of `#4b3f2b`/`#38301f`.

---

## 6. Iconography

Style rule, verbatim: *"Single-weight 1.6px stroked line, open ends, no fills, no rounded cartoon corners: an engraver's outline, not an app icon. Drawn on a 30px grid at 1.5x for desktop. Weather and resources only. Never a glyph where a word will do."*

Swatch presentation: each icon sits in a `52×52` box, `border:1px solid #2f2718`, `display:grid;place-items:center`, holding a `30×30` (`viewBox="0 0 30 30"`) SVG. In real screens, icons are drawn at `44×44` (desktop weather glyph) or `24×24`/`26×26`/`30×30` (mobile header / nav bar) but keep the same `viewBox="0 0 30 30"` and `1.6`–`1.8` stroke-width.

Stroke color is always the current season accent (or a UI neutral like `#8f7e5c`/`#c3b087` for chrome icons). All below use `stroke-width="1.6"` (desktop weather icons in the reference swatches) unless noted; nav-bar icons in real screens use `stroke-width="1.8"`.

### Weather / resource icon set (the 8-icon swatch row, section 04)

**1 — Sun / clear (rays)**
```svg
<svg width="30" height="30" viewBox="0 0 30 30">
  <circle cx="15" cy="15" r="5.5" stroke="#6f8a3f" stroke-width="1.6" fill="none"/>
  <g stroke="#6f8a3f" stroke-width="1.6" stroke-linecap="round">
    <line x1="15" y1="3.5" x2="15" y2="7"/>
    <line x1="15" y1="23" x2="15" y2="26.5"/>
    <line x1="3.5" y1="15" x2="7" y2="15"/>
    <line x1="23" y1="15" x2="26.5" y2="15"/>
    <line x1="7" y1="7" x2="9.5" y2="9.5"/>
    <line x1="20.5" y1="20.5" x2="23" y2="23"/>
    <line x1="20.5" y1="9.5" x2="23" y2="7"/>
    <line x1="7" y1="23" x2="9.5" y2="20.5"/>
  </g>
</svg>
```
Reused as the "Dry" weather glyph in Screen 05 (Planting, Summer), at 44×44, stroke `#c0892a`.

**2 — Cloud (dry/overcast, no rain)**
```svg
<svg width="30" height="30" viewBox="0 0 30 30">
  <path d="M7 20 h14 a4.5 4.5 0 0 0 0-9 a5.5 5.5 0 0 0-10.5-1.6 A4.5 4.5 0 0 0 7 20 Z" stroke="#6f8a3f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
</svg>
```
Reused as "Dry and still" in Screen 04 (Fall), 44×44, stroke `#a4482a`.

**3 — Cloud + rain ("cold rain")**
```svg
<svg width="30" height="30" viewBox="0 0 30 30">
  <path d="M7 15 h14 a4.5 4.5 0 0 0 0-9 a5.5 5.5 0 0 0-10.5-1.6 A4.5 4.5 0 0 0 7 15 Z" stroke="#6f8a3f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <g stroke="#6f8a3f" stroke-width="1.6" stroke-linecap="round">
    <line x1="10" y1="19" x2="8.5" y2="25"/>
    <line x1="15" y1="19" x2="13.5" y2="25"/>
    <line x1="20" y1="19" x2="18.5" y2="25"/>
  </g>
</svg>
```
Reused as "Cold rain" in Screen 03 (Morning Brief, Spring), 44×44 desktop / 30×30 mobile, stroke `#6f8a3f`.

**4 — Wind/snowflake (asterisk, three crossing strokes)**
```svg
<svg width="30" height="30" viewBox="0 0 30 30">
  <g stroke="#6f8a3f" stroke-width="1.6" stroke-linecap="round">
    <line x1="15" y1="5" x2="15" y2="25"/>
    <line x1="6.5" y1="9.8" x2="23.5" y2="20.2"/>
    <line x1="23.5" y1="9.8" x2="6.5" y2="20.2"/>
  </g>
</svg>
```
Reused as "Cold snap" in Screen 06 (Winter, day theme), 44×44 desktop / 26×26 mobile, stroke `#3f5b71` (day-theme winter text color).

**5 — Circle with "H" mark** (resource glyph, exact role unlabeled in source — grid position 5)
```svg
<svg width="30" height="30" viewBox="0 0 30 30">
  <circle cx="15" cy="15" r="8.5" stroke="#6f8a3f" stroke-width="1.6" fill="none"/>
  <path d="M12 12.5 h6 M12 17.5 h6 M15 10 v10" stroke="#6f8a3f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
</svg>
```

**6 — Basket / bushel (trapezoid with slats)**
```svg
<svg width="30" height="30" viewBox="0 0 30 30">
  <path d="M7.5 11 h15 l-2 12 h-11 Z M6 11 h18" stroke="#6f8a3f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M11 11 v12 M15 11 v12 M19 11 v12" stroke="#6f8a3f" stroke-width="1.1" fill="none" opacity=".7"/>
</svg>
```

**7 — Three ascending peaks over a baseline** (fields/grain glyph)
```svg
<svg width="30" height="30" viewBox="0 0 30 30">
  <path d="M6 23 l7-14 M11 23 l7-14 M16 23 l7-14" stroke="#6f8a3f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M5 23 h20" stroke="#6f8a3f" stroke-width="1.6" stroke-linecap="round"/>
</svg>
```

**8 — Bone/antler curve over an ellipse**
```svg
<svg width="30" height="30" viewBox="0 0 30 30">
  <ellipse cx="15" cy="19" rx="7" ry="5" stroke="#6f8a3f" stroke-width="1.6" fill="none"/>
  <path d="M15 14 c0-4 3-6 3-8 M15 14 c0-3-3-4-3-6" stroke="#6f8a3f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
</svg>
```

**Judgment call needed:** icons 5, 6, 7, 8 appear only in the language-spec swatch grid, never assigned a label or reused in a real screen. Their intended resource mapping (fuel/hearth, larder/bushel, fields/grain, hands/bone?) is not stated in the source and must be inferred or re-confirmed before wiring them to specific UI slots.

### Six-tab bottom-bar icons (mobile only — real screens, `viewBox="0 0 30 30"`, `stroke-width="1.8"`, size 24×24)

```svg
<!-- Home -->
<path d="M5 15 L15 6 L25 15 M8 13 v11 h14 v-11" stroke="#6f8a3f" stroke-width="1.8" fill="none" stroke-linecap="round"/>

<!-- Fields -->
<path d="M4 22 h22 M6 22 v-8 h5 v8 M13 22 v-12 h5 v12 M20 22 v-6 h4 v6" stroke="#8f7e5c" stroke-width="1.8" fill="none" stroke-linecap="round"/>

<!-- Hands -->
<circle cx="11" cy="11" r="4" stroke="#8f7e5c" stroke-width="1.8" fill="none"/>
<circle cx="20" cy="12" r="3.2" stroke="#8f7e5c" stroke-width="1.8" fill="none"/>
<path d="M4 24 c0-5 4-7 7-7 s7 2 7 7 M18 24 c0-4 2-6 4-6 s4 2 4 6" stroke="#8f7e5c" stroke-width="1.8" fill="none" stroke-linecap="round"/>

<!-- Town -->
<path d="M4 24 h22 M7 24 v-9 l4-3 4 3 v9 M17 24 v-13 l4-2 4 2 v13" stroke="#8f7e5c" stroke-width="1.8" fill="none" stroke-linecap="round"/>

<!-- Ledger -->
<path d="M6 5 h18 v20 h-18 Z M10 11 h10 M10 15 h10 M10 19 h6" stroke="#8f7e5c" stroke-width="1.8" fill="none" stroke-linecap="round"/>

<!-- Almanac -->
<path d="M15 7 c-3-3-9-3-9 0 v16 c0 3 6 3 9 0 c3 3 9 3 9 0 v-16 c0-3-6-3-9 0 Z M15 7 v18" stroke="#8f7e5c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
```

The selected tab's icon and label switch to the season accent color; unselected tabs use `#8f7e5c` (ink faint). Only the Home icon is drawn stroke-colored in the reference mock (season accent); the other five are shown in their unselected/neutral state since Home is the active tab in every screen mock. Desktop screens never show this bar — it is portrait/mobile-only chrome (see §10).

---

## 7. Motion vocabulary

Global keyframes (verbatim, from the `<helmet><style>` block — these are the complete, canonical definitions):

```css
@keyframes bb-turn{ from{ opacity:0; transform:translateY(10px) rotateX(3deg); } to{ opacity:1; transform:none; } }
@keyframes bb-rule{ from{ transform:scaleX(0); } to{ transform:scaleX(1); } }
@keyframes bb-tick{ 0%{ transform:translateY(0); opacity:1; } 40%{ transform:translateY(-7px); opacity:0; } 41%{ transform:translateY(7px); } 100%{ transform:translateY(0); opacity:1; } }
@keyframes bb-rain{ from{ transform:translateY(-40px); } to{ transform:translateY(160px); } }
@keyframes bb-snow{ from{ transform:translateY(-30px) translateX(0); } to{ transform:translateY(170px) translateX(14px); } }
@keyframes bb-stain{ 0%,100%{ opacity:.30; transform:scale(1); } 50%{ opacity:.62; transform:scale(1.06); } }
@keyframes bb-crow{ 0%,92%,100%{ opacity:1; } 94%,98%{ opacity:.15; } }
@keyframes bb-line{ from{ opacity:0; transform:translateX(-8px); } to{ opacity:1; transform:none; } }
@keyframes bb-bleed{ from{ opacity:0; transform:scale(.7); } to{ opacity:1; transform:scale(1); } }
@keyframes bb-lamp{ 0%,100%{ opacity:.55; } 50%{ opacity:.9; } }
@keyframes bb-dot{ from{ transform:scale(0); } to{ transform:scale(1); } }
```

Global reduced-motion escape hatch (verbatim, applies regardless of the in-game Settings toggle):
```css
@media (prefers-reduced-motion:reduce){
  *{ animation:none !important; transition:none !important; }
}
```

Section title, verbatim: *"Six motions, and no more."* The doc presents six **named motion concepts** as demo cards (Turn, Tick, Bleed, Rule, Weather, Omen); these map onto the 11 keyframes as follows. `bb-dot` is defined but not invoked anywhere in the source — reserved for a future dot-appear use (candidate: the choice-card selection dot, which today uses `bb-bleed` instead).

| Motion | Trigger | Keyframes used | Duration / easing | Reduced-motion behavior |
|---|---|---|---|---|
| **Turn** | Beat to beat (a new leaf/screen arrives) | `bb-turn` on the leaf, `bb-rule` on its header rule | `bb-turn .5s cubic-bezier(.2,.7,.2,1) both`; rule `.6s .25s ease-out both` | 120ms opacity crossfade |
| **Tick** | A resource number changes | `bb-tick` on the figure, `bb-line` on the signed delta | figure `.42s ease-in-out both`; delta `.5s .3s ease-out both`, delta text visible ~1.6s total | instant state change (no roll, no delta fade) |
| **Bleed** | A choice card is selected | `bb-bleed` on the ink-drop dot | `.4s ease-out both`; card holds 180ms before the Turn to the result | instant state change |
| **Rule** | The Dusk reveal (day-book lines writing in) | `bb-line`, staggered ~160ms apart per line | `.3s <offset>s ease-out both`, offsets `0, .16, .32, .48s` (demo); Dusk Report screen staggers six lines `0, .16, .32, .48, .64, .8s`. The omen block (if present) fades in separately and last — 400ms after the leaf settles on a Play scene, 1.1s after the final figure on the Dusk Report | prints the whole page/leaf at once |
| **Weather** | Ambient, plays continuously while a location plate with weather is on screen | `bb-rain` (rain streaks, `.95s`–`2.6s linear infinite`, staggered start delays) or `bb-snow` (`7s`–`10s linear infinite`, staggered) | particle wash under 6% opacity of movement, "noticed second, not first," over the plate only, **never over type** | loop stops entirely, holds mid-cycle frame |
| **Omen** | Ambient dread while Reckoning is active | `bb-stain` (violet stain "breathes"), `bb-crow` (single crow blinks) | stain default `5.5s ease-in-out infinite` (configurable prop `dreadCycle`, min 1.5s/max 12s/step .5); crow `6s`–`7s linear infinite`. As Reckoning rises the stain cycle **shortens** and the stain **widens** — the Screen-08 "crowded case" example uses a fast cycle computed as `dreadCycle * 0.62` (e.g. default 5.5s → ~3.4s) | loop stops, holds mid-cycle frame (Reduced); **None** setting additionally stops the omen loop outright |
| *(unnamed, ambient)* | The New Game surname-input cursor blink | `bb-lamp` | `1.1s steps(1) infinite` | n/a (simple opacity blink, not distance-based motion) |

Additional stated triggers not tied to a demo card:
- **Paging** (New Game letter, Previous/Next): *"Paging Previous and Next slides the leaf 24px horizontally and crossfades in 280ms, so the two pages feel like one document."*
- **New Game transition**: *"On New Game the whole screen dims to black over 400ms before the letter."*
- **Title-screen glow**: *"the glow breathes on a 9s cycle at low amplitude. Nothing else moves."*
- **Choice → result**: *"choosing plays Bleed on the card, then Turn to the result."*
- **Planting chip select**: *"selecting a crop plays Bleed on the chip and Ticks the spend figure in the ledger bar. No layout shift, because the chip grid is fixed."*
- **Roster overlay open**: uses `bb-turn .45s cubic-bezier(.2,.7,.2,1) both` (same easing as the leaf Turn, slightly faster).

### The third Settings tier

Verbatim: *"Settings carries Motion: Full, Reduced, None, defaulted from the system preference rather than overriding it. None also stops the omen loop, for players who find the breathing stain unpleasant."*

### Never animated (hard rule)

Verbatim: *"Body prose never types on, and a scene title never writes itself. The player reads at their own pace; making them wait for words is the one motion sin this game cannot afford."*

---

## 8. Components

### 8.1 Brass ledger bar

Exploration result: **C is chosen** — *"A brass ledger bar pinned to the leaf's head, figures on the left where reading starts, warnings allowed to grow into a full line without breaking a four-cell grid."*

Reference-swatch (language-spec) exact markup/CSS:
```css
/* outer bar */
border:1px solid #4b3f2b;
background:linear-gradient(#241d13,#1c170f);

/* figure row */
display:flex; align-items:center; gap:26px; padding:11px 14px;
/* each figure */
display:flex; align-items:baseline; gap:7px;
/* label */
font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:#8f7e5c;
/* value */
font-size:21px; color:#e9dcbe; font-variant-numeric:tabular-nums;
/* (Coin only) unit suffix */
font-size:12px; color:#8f7e5c;

/* warnings row, below the figures, wraps */
display:flex; gap:8px; padding:0 14px 11px; flex-wrap:wrap;
/* each warning */
font-size:13px; color:#cf6a4e; /* or #d0a54a for the softer tier */
border-left:2px solid #cf6a4e; padding-left:8px;
```

**In real screens** (the actual leaf header, e.g. Morning Brief) the gradient/coloring differs slightly and is the version to build from — treat this as the load-bearing version, the section-07 swatch above as the conceptual proof:
```css
/* leaf ledger header */
display:flex; align-items:center;
border-bottom:1px solid #4b3f2b;
background:linear-gradient(#2a2216,#211a11);
padding:0 30px 0 34px; height:92px;

/* each figure block */
display:flex; flex-direction:column; gap:2px;
padding:0 34px; /* first cell: padding-right:34px only */
border-right:1px solid #3a3020; /* omitted on the last cell */

/* label */
font-size:14px; letter-spacing:.2em; text-transform:uppercase; color:#8f7e5c; font-weight:600;
/* value */
font-size:34px; line-height:1; color:#e9dcbe; font-variant-numeric:tabular-nums;
/* Coin's trailing "m" unit */
font-size:17px; color:#8f7e5c; margin-left:4px;

/* valence overrides on the value color: Larder low → #d0a54a (warn); Fuel critical → #cf6a4e (bad) */

/* the "tap any figure" affordance chip, right-aligned */
margin-left:auto; font-size:15px; letter-spacing:.14em; text-transform:uppercase; color:#8f7e5c;
border:1px solid #4b3f2b; padding:9px 14px;

/* warnings sub-band (its own row, below the 92px figure row) */
display:flex; gap:26px; padding:12px 34px; border-bottom:1px solid #3a3020;
background:rgba(207,106,78,.07); /* tinted by the worst-tier warning present */
/* each warning line */
font-size:17px; color:#cf6a4e; /* or #d0a54a */
border-left:3px solid #cf6a4e; padding-left:10px;
/* when 2+ warnings fire, this band becomes column layout (flex-direction:column) so each gets a full line — the crowded Screen 08 case stacks 3 */

/* mobile equivalent: 4-cell (or 2×2 at 150% type) flex row */
display:flex; background:linear-gradient(#2a2216,#211a11); border-bottom:1px solid #4b3f2b;
/* each cell */ flex:1; padding:9px 6px; text-align:center; border-right:1px solid #38301f; /* last cell no border */
/* label */ font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:#8f7e5c; font-weight:600; display:block;
/* value */ font-size:24px; color:#e9dcbe; font-variant-numeric:tabular-nums;
```

At 150% type / crowded density: the bar becomes a `flex-wrap:wrap` grid of `width:50%` cells (2×2), each `box-sizing:border-box`, label 14px / value 28px.

### 8.2 Choice card

Component-catalog exact spec:
```css
/* primary (selectable / recommended default) */
border:1px solid #d9a441; background:rgba(217,164,65,.13); padding:12px 14px; /* desktop: 14px 26px or 10px 24px depending on density */
/* title row */
display:flex; justify-content:space-between; align-items:baseline; gap:10px;
/* title */ font-size:17px; font-weight:500; color:#f0e4c6; /* desktop scale: 22px */
/* mechanical tag */ font-family:'Courier Prime',monospace; font-size:13px; color:#9fb262; /* colored by valence: good=#9fb262, bad=#cf6a4e, neutral=#c3b087 */
/* sub-line */ font-family:'IM Fell English',serif; font-style:italic; font-size:14px; color:#8f7e5c; margin-top:2px; /* desktop: 16-17px */

/* plain (available, not highlighted) */
border:1px solid #4b3f2b; padding: /* same as above */;
/* title color:#e9dcbe instead of #f0e4c6 */

/* disabled (unaffordable) */
border:1px solid #2f2718; padding: /* same */; opacity:.55;
/* title color:#8f7e5c */
/* cost tag color:#8f7e5c */
/* an extra line below stating the arithmetic in plain language: */
font-size:13px; color:#cf6a4e; margin-top:2px; /* e.g. "You have 61 marks. This wants 80." */

/* the ink-bleed selection dot (appears on the chosen card at selection time) */
position:absolute; left:8-9px; top:50%; width:8-9px; height:8-9px; border-radius:50%;
background:#d9a441; transform:translateY(-50%);
animation:bb-bleed .4s ease-out both;
```

Verbatim: *"Primary, plain and disabled. The tag is always Courier Prime and always colored by valence. Disabled states carry the arithmetic."* And: *"Unaffordable choices state the arithmetic... No hover, no info glyph, no 40 percent opacity guessing game."*

### 8.3 The almanac leaf

The leaf is the single floating "paper" object holding the ledger bar, household line, and reading column. Exact real-screen CSS (desktop):
```css
position:absolute; /* right:56px; top:195px (Morning Brief) or top:136px (Planting/other beats); bottom:52px */
width:1004px; /* 860px on Planting (paired with the field-map panel); 1360px in the crowded 9-hand case; 1180px for the roster overlay */
background:linear-gradient(#221c13,#1b1610);
border:1px solid #4b3f2b;
box-shadow:0 30px 80px rgba(0,0,0,.6); /* roster overlay: 0 40px 100px rgba(0,0,0,.7) */
display:flex; flex-direction:column;
animation:bb-turn .55s cubic-bezier(.2,.7,.2,1) both; /* on the Morning Brief; not always re-triggered — Harvest Home's leaf mock does not include the animation attribute, treat Turn as the default beat-change behavior generally */

/* the season spine, on the binding edge (always left) */
position:absolute; left:0; top:0; bottom:0; width:5px; background:#6f8a3f; /* swap per season */
```
Day theme leaf: `background:linear-gradient(#efe5cd,#e2d6ba); border:1px solid #a3906c; box-shadow:0 30px 80px rgba(42,34,22,.35);`

Mobile: the leaf concept collapses into the whole-screen flex column (masthead → weather band → plate → caption → ledger → reading area → Ask Reuben → tab bar); there is no separate floating-leaf treatment on phone, see §10.

### 8.4 Location plate

Full-bleed illustration area carrying weather particles and the omen stain — **never text**. Component-catalog framed variant:
```css
height:118px; /* catalog swatch; real screens: 96-130px mobile header band, or the FULL 1920×1080 canvas on desktop */
border:2px solid #4b3f2b;
box-shadow:0 0 0 2px #1f1a12, 0 0 0 3px #4b3f2b; /* the "engraved double border," framed variant only */
background:repeating-linear-gradient(135deg,#26201a 0 4px,#2e2720 4px 8px); /* the canvas texture, always present under everything else on the plate */
position:relative; overflow:hidden;

/* vignette, always present */
position:absolute; inset:0;
background:radial-gradient(120% 110% at 50% 40%, transparent 46%, rgba(0,0,0,.66) 100%);

/* art-brief placeholder (until real art exists) */
position:absolute; inset:0; display:grid; place-items:center; padding:16px; text-align:center;
font-family:'IM Fell English',serif; font-style:italic; font-size:14px; color:#b09a63;
/* content: "[ art drops in here ]" or a scene-specific bracketed brief, e.g. "[ frost on the well-cap, and the whole valley gone quiet and white ]" */
```
Full-bleed (desktop stage) variant drops the framed double-border and instead runs the texture + vignette across the entire `1920×1080` canvas, with the season-accent top bar (`height:5px`) as its only "frame."

Weather layer sits above the texture/vignette, below the leaf/HUD: `bb-rain` lines (`width:1-2px`, varying `height:14-34px`, `background:` season accent or `#5a7d99` for cold rain, low opacity `.20-.55`, staggered) or `bb-snow` dots (`width/height:3-5px`, `border-radius:50%`, `background:#f3ecdb`/`#f6f0e0`).

Omen layer, also above texture/vignette:
```css
/* the violet "stain" */
position:absolute; width:120-300px; height:70-170px; /* grows with Reckoning tier */
transform:translate(-50%,-50%); border-radius:50%;
background:radial-gradient(circle,#a892c4 0%,transparent 66-68%);
animation:bb-stain <dreadCycle>s ease-in-out infinite;

/* the crow */
position:absolute; font-size:20-44px; color:#0d0b07; /* a filled circle glyph, ● U+25CF, standing in for crow art */
animation:bb-crow 6-7s linear infinite;
```

### 8.5 Speaker portrait / nameplate

```css
/* portrait silhouette block, right-anchored to the plate */
position:absolute; /* left:406-410px; bottom:0; width:372-376px; height:560-620px (desktop); or right:12-16px;bottom:0;width:82-104px;height:98-126px (mobile/catalog) */
background:linear-gradient(#3a3229,#1d1710);
border:1px solid <season accent, or lamp #d9a441 for a highlighted NPC scene>;
border-bottom:0;

/* silhouette shape: three stacked divs forming head/neck/shoulders, all background:#0d0b07 */
/* head: border-radius:50% 50% 47% 47% */
/* neck: plain rect */
/* shoulders: border-radius: <half-width>px <half-width>px 0 0 */

/* nameplate — ALWAYS lamp, never the seasonal accent */
position:absolute; left:12-14px; bottom:8-14px;
background:rgba(11,9,6,.9); border:1px solid #d9a441; padding:5-10px 10-18px;
/* name */ font-family:'IM Fell English SC',serif; font-size:15-28px; color:#f0e4c6;
/* role/epithet */ font-size:11-16px; letter-spacing:.08-.1em; color:#d9a441;
```

Verbatim: *"Nameplate always in lamp, never the seasonal accent, so the speaker reads the same in every season. Desktop scales the portrait to 520px."* (the catalog swatch is smaller for display; real screens run the portrait taller, up to 620px total block height).

### 8.6 The masthead

Top HUD band, desktop:
```css
position:absolute; left:0; right:0; top:5px; height:96px; /* sits just below the 5px season-spine top bar */
background:linear-gradient(rgba(11,9,6,.88),rgba(11,9,6,.55));
border-bottom:1px solid rgba(75,63,43,.9);
display:flex; align-items:center; padding:0 56px; gap:44px;

/* wordmark */
font-size:15px; letter-spacing:.34em; text-transform:uppercase; color:#8f7e5c; font-weight:600; /* "Bushel & Bone" */
/* divider */
width:1px; height:44px; background:#3a3020;
/* season name */
font-family:'IM Fell English SC',serif; font-size:48px; line-height:1; color:#f0e4c6;
/* year/day */
font-size:14px; letter-spacing:.26em; text-transform:uppercase; color:<season accent>; font-weight:600; /* "Year One · Day 1 of 20" */
/* 5 season-progress pips */
display:flex; gap:5px; margin-left:6px;
/* filled pip */ width:9px; height:9px; background:<season accent>;
/* empty pip */ width:9px; height:9px; border:1px solid #4b3f2b;

/* right side: weather glyph + label, divider, help(?) + settings(moon) icon buttons */
margin-left:auto; display:flex; align-items:center; gap:34px;
/* weather label */ font-size:20px; letter-spacing:.14em; text-transform:uppercase; color:#c3b087;
/* icon buttons */ display:grid; place-items:center; width:52px; height:52px; border:1px solid #4b3f2b; font-size:20-22px; color:#c3b087;
```

Below the masthead, a second band (desktop only) names the current location:
```css
position:absolute; left:0; right:0; top:101px; height:78px;
background:linear-gradient(rgba(11,9,6,.82),rgba(11,9,6,.42));
border-bottom:1px solid rgba(75,63,43,.9);
display:flex; align-items:center; gap:22px; padding:0 56px;
/* left accent bar */ width:5px; height:44px; background:<season accent>; flex:0 0 auto;
/* location name */ font-family:'IM Fell English SC',serif; font-size:34px; letter-spacing:.05em; color:#f0e4c6;
/* location caption */ font-family:'IM Fell English',serif; font-style:italic; font-size:21px; color:#c3b087;
```

Mobile masthead is compressed into a flex column: a 4px season-spine bar, then a row (wordmark + help/settings icon buttons at 34×34), then a `border-bottom:3px double #4b3f2b` season/day-count row, all inside `padding:12px 20px`.

### 8.7 Six-tab bottom bar (mobile only)

```css
display:flex; border-top:1px solid #4b3f2b; background:#12100b; flex:0 0 auto; padding-bottom:14px; /* safe-area padding */

/* each tab */
flex:1; display:flex; flex-direction:column; align-items:center; gap:3-4px; padding:9px 0 6px;

/* selected tab only */
border-top:2px solid <season accent>;
/* icon stroke + label color: <season accent> */
font-weight:600; /* label */

/* unselected tab */
/* icon stroke + label color: #8f7e5c, no top border, no font-weight override */

/* label */
font-size:10px; letter-spacing:.08-.1em; text-transform:uppercase;
```
Tabs, in order: **Home, Fields, Hands, Town, Ledger, Almanac**. At 150% type, labels grow to 12px and icons are implied to drop (per the density notes: *"the tab bar drops its icons and keeps its labels"* — not shown built in a mockup, a stated rule only).

---

## 9. Per-screen layouts

### Screen 01 — The title screen

*"The crow is the only illustration that carries the brand. It gets the whole left half."*

**Desktop (1920×1080):** Background `#0b0906` with a soft radial glow `radial-gradient(58% 62% at 27% 46%, rgba(217,164,65,.16), transparent 70%)`. Left-center: a 720px-tall crow/logo illustration (`assets/logo.png`, `filter:drop-shadow(0 40px 60px rgba(0,0,0,.7))`). Right of it, a 560px column:
- Eyebrow: `A Dark Homestead Survival Game` (16px, `.4em` tracking, `#8f7e5c`)
- Wordmark: `Bushel&Bone` at 92px Fell SC, `&` colored lamp `#d9a441`, color `#f0e4c6`
- Double rule (3px)
- Tagline (italic Fell, 26px, `#c3b087`): *"You inherit a plot of land and a promise. The land keeps its own ledger."*
- Menu stack: **New Game** (primary, lamp border + `rgba(217,164,65,.14)` fill, 20-24px padding, `▶` glyph), **Continue** (disabled, `opacity:.45`, states its disabled reason inline: *"no game in progress"*), then a two-up row of **How to Play** / **Settings**
- Footer: bottom-left `Sallows Charter Company · MDCCCXLI` (17px, `.16em` tracking, `#5c4f36`); bottom-right `v0.3` / `Quit`

**Portrait (390×844):** Same content, stacked and centered: 176px logo, 36px wordmark, 11px eyebrow, double rule, then the same 4-item menu pinned to the bottom (`margin-top:auto`) with `min-height:56px` rows, footer text below.

**Motion:** *"the glow breathes on a 9s cycle at low amplitude. Nothing else moves. On New Game the whole screen dims to black over 400ms before the letter."*

### Screen 02 — New Game (naming + the letter)

*"Name the line, then read the letter. A black screen in both themes, on purpose."*

**Portrait step 1 — "Name your line":** black background, centered column, eyebrow *"Before the letter comes"*, Fell SC title "Name your line" (34px), italic body: *"A family holds this land, season on season, and gives it their name. What is the name they will carry?"* — a hatch rule — label "Family surname" — a lamp-bordered input showing the current value (`Crane` in the mock) with a blinking `bb-lamp` cursor bar — helper text — Back/Continue buttons (56px min-height) pinned to bottom.

**Desktop — the letter, page 1 of 2:** A real paper document (not a UI card) centered on black, `width:1000px`, `background:#efe3c6; color:#2a2216; border:1px solid #6b5a3c; box-shadow:0 30px 90px rgba(0,0,0,.72); padding:64px 72px 58px`, with a 5px left accent bar in Fall red `#a4482a` at `opacity:.5` (chosen deliberately over the seasonal accent — see notes). Centered letterhead block (bottom-bordered): "Sallows Charter Company" (Fell SC 32px), "Office of Lands and Settlement, Marrow's Cross" (italic, `#5f5138`), date "The Fourteenth of March, 1841" (18px tabular). Body at 23px/1.64 line-height, full verbatim letter text:

> To the heir of Malachi Crane, greeting.
>
> It falls to this office to inform you that the homestead held in your uncle's name, being one hundred and sixty acres upon the west bank of the Sallows, has passed to you entire, together with the mortgage upon it, which is not discharged.
>
> Your uncle is not dead in law. He is absent. The distinction is the Company's, not ours to argue, and the ground does not wait upon paperwork. There is a hand still living on the place, one Reuben, who was kept on at your uncle's cost and has stayed at no one's.
>
> You will find the fields fallow, the woodpile low, and the neighbours civil. What you make of it is the Company's interest and your own.
>
> *Yours in the matter, S. Ridley, for the Company*

Below the letter: Previous / "PAGE ONE OF TWO" / Next paging row.

**Portrait — page 2 ("And so you came"):** plain cream-on-black narration, eyebrow, 18px/1.78 body, verbatim:

> You came up the west road in the last week of March with a paper in your coat and no clear picture of the man who left it to you.
>
> The house was cold and swept. Someone had swept it. Four fields, all of them fallow, and a woodpile that would not last a fortnight.
>
> A man was waiting at the gate with his hat in his hands, and he did not look surprised to see you. *"You'll be the one, then,"* he said. *"I'm Reuben. I worked for your uncle. I'll work for you, if you'll have me."*
>
> Behind him the ground went flat and grey to the treeline, and somewhere past it a crow said one thing, once.

Paging row: Previous / "TWO OF TWO" / **Begin** (lamp primary).

**Notes, verbatim:** *"The letter is a real document at 23px, not a card of UI text... The spine on the letter is Fall red rather than the seasonal accent: this beat happens before the calendar starts, so the season system has nothing to say yet... Motion: the letter arrives with a single Turn. Paging Previous and Next slides the leaf 24px horizontally and crossfades in 280ms, so the two pages feel like one document."*

### Screen 03 — Morning Brief

*"The shell. Full-bleed plate, floating leaf, chrome on glass, Spring accent."*

Full shell breakdown (this is the canonical shell used by every subsequent beat screen): masthead (§8.6) + location band ("The Homestead · four fields, a house, and a woodpile that will not do") + full-bleed plate with Reuben's portrait standing at left-center (`left:410px`) + the floating leaf (§8.3, 1004px wide) on the right containing: ledger bar (Coin 100m / Larder 80 / **Fuel 0 in bad color** / Seed 20) → household strip (Reuben tagged "Foreman," morale dots, Regard "Stranger," "Show roster" button) → reading column (eyebrow "Morning Brief," title "Your uncle's ground," hatch rule, prose with a drop-cap "T," dialogue in `#f4ead0`) → two choice cards ("Set the fields" primary / "Walk the place first" plain) → footer Ask-Reuben bar → a Courier seed-hash tag bottom-right of the whole canvas (`seed 3f10a2`).

Verbatim body text: *"The thaw is a week old and the ground is open. Four fields lie fallow, and the woodpile behind the house would not see a cat through a cold night. What you put in the ground now is what stands between this household and the dark end of the year."* Reuben: *"Ground's ready when you are... I'd not leave it long."*

Mobile: identical content, single scrolling column (masthead → weather band with plate+Reuben inset 82×100px → location caption → 4-cell ledger → reading area → 2 choice cards → Ask Reuben bar → 6-tab bar).

**Notes, verbatim, key ones:** *"The place is a banner, not a panel"* — *"The leaf floats, and it is wide. One object, 1004px..."* — *"The roster is a button, not a panel"* — *"'Day 1 of 20' plus five season pips, which the old build never showed"* — *"Six tabs, named. Home, Fields, Hands, Town, Ledger, Almanac... every row clears 56px."*

### Screen 04 — A play scene ("Harvest Home")

*"Harvest Home, in Fall, with four choices, one of them unaffordable, and the omen already at the edge."*

Same shell as Screen 03, Fall accent (`#a4482a`), location = Marrow's Cross ("lanterns strung over the green, and Old Nan at the dark edge of it"), speaker = Bess Halloway ("the mayor's daughter"). Plate carries an active `bb-stain` omen (positioned `left:23%;top:32%`) and a blinking crow glyph at `left:9%;top:16%`.

Leaf: ledger shows Larder in warn color, Fuel in bad color, **two warnings stacked** ("Fuel is 33 short of the winter need" / "The larder will not carry three mouths to spring"), household row shows two hands with color-coded morale dots. Reading area: eyebrow "Harvest Home · the Fall feast," title "The town lights the long tables," body: *"Harvest Home falls square in the crunch. To stay away is to be the man who wouldn't."*

Four choice cards: **Go to the feast** (primary, tag "+regard · a day not worked"), **Stay and bring in the crop** (plain, tag "−regard"), **Send Reuben in your place** (plain, tag "a hand's day"), **Buy a table's worth of drink** (disabled, `opacity:.55`, cost "80 m", arithmetic line "You have 61 marks. This wants 80."). Below the choices, an omen footer block (left-border `#a892c4`, background `rgba(168,146,196,.08)`): *"Crows line the far fence at dusk and do not call. You count nine, then eight, though none fly off."*

**Notes, verbatim, key ones:** *"Choice cards keep the dual label... but the mechanical tag moves to Courier Prime at 16px and is colored by valence"* — *"Warnings live under the ledger, not inside the four figures. Two can fire at once and neither truncates"* — *"The omen is a footer, not a banner... it never carries a number"* — *"The plate is the room. The illustration is the whole 1920 canvas... so weather and omens have somewhere to happen and the speaker can stand 580px tall instead of 154px."*

### Screen 05 — Planting

*"The densest screen in the game. Four fields, six options each, fertility, and a running spend."*

Summer accent (`#c0892a`). Layout diverges from the standard shell: **left side (870px) becomes a 2×2 field map** instead of the plate — each field is its own textured card (`repeating-linear-gradient` furrow direction unique per field) showing: field name (Fell SC 28px) + fertility dots (`fert ●●●`, colored/hollow by remaining fertility), and either (a) an in-progress crop with a growth bar and "In the ground · not yours to set" if mid-cycle, (b) a "Just set" chip (lamp background `#d9a441`, dark text) + crop name + seed cost + flavor line if freshly chosen this session, or (c) the Stone Lot's spent-fertility treatment: grey furrow texture, hollow fertility circles (`○○○` in bad color), "Left fallow" outline chip in good color, "Resting a season" / "harvested dry. it mends one point on its own."

**Right side (860px leaf):** ledger bar's last cell replaced with a right-aligned "Spent so far" readout (`9 of 9 seed, plus 6 m` in Summer accent color) instead of a Seed figure. Below: eyebrow "Dawn · Planting," title "Set the fields," then one row per field — the field NOT being actively set collapses to a single dimmed (`opacity:.75`) line with name + status + fertility; the field BEING set expands to a bordered block (Summer-accent border) with a **6-chip grid** (`grid-template-columns:repeat(6,1fr)`) of crop options: Potato/Turnip/Wheat/Corn/Cotton/Fallow, each chip showing name (18px) + seed cost (15px), selected chip gets the season-accent border + tinted background, unaffordable chips (e.g. Cotton at 10 seed when short) get `opacity:.45` and a plain border. A spent field (Stone Lot) shows all its crop chips at `opacity:.5` except Fallow, which is promoted to a green (`#9fb262`) selected state reading "mends 1". Bottom of leaf: a full-width primary CTA "Sow it so" / "pay 9 seed, then 6 marks" / `▶`.

**Mobile:** one field expanded at a time, others collapsed to a one-line summary; chip grid becomes `repeat(3,1fr)` (3×2) instead of 6-across, still `min-height:56px` per chip.

**Notes, verbatim, key ones:** *"The plate became the field map"* — *"The running spend moved into the ledger bar"* — *"A spent field says so in words... the row carries the consequence in a full sentence and the Fallow chip is promoted to green"* — *"Mobile does not shrink this, it folds it... Six chips become a 3 × 2 grid at 56px minimum, never a single-file column."*

### Screen 06 — The Dusk Report

*"Winter, and the day theme. Same components, inverted, to prove both themes ship."*

This is the only screen shown in **Day** theme. Winter accent (`#5a7d99` night-token / `#3f5b71` as rendered UI text on day paper). Background texture becomes `repeating-linear-gradient(135deg,#cfc3a4 0 4px,#d8cbac 4px 8px)` with falling `bb-snow` dots. Plate (left column, framed variant, `height:420px`, double engraved border `box-shadow:0 0 0 3px #ddd0b1,0 0 0 4px #a3906c`) shows the art-brief placeholder `[ frost on the well-cap, and the whole valley gone quiet and white ]`, with the location caption card below it (not overlaid, a separate bordered block: "The Homestead" / "the year's last day, and the woodpile holding").

Leaf (right, day palette `linear-gradient(#efe5cd,#e2d6ba)`): ledger bar (Coin 142m, Larder 19 in warn, Fuel 61, Seed 14) → eyebrow "Dusk · Winter," title "The day-book, closed" (Fell SC 50px) → double rule → a six-line day-book table, each line `bb-line`-staggered 160ms apart:

| Line | Value |
|---|---|
| Weather | Cold snap |
| Brought to market | +54 m (good) |
| Into the larder | +22 food (good) |
| The household ate | −50 food (bad) |
| The fires burned | −53 fuel (bad) |
| Larder now | 19 food (warn) |

Then, 1.1s later, the omen block alone on its own violet rule: *"There are footprints in the frost that begin at the graves and end at your door, and do not turn back."* Footer CTA: "Turn the year" / "the thaw comes, and you survived it" / `▶`, bordered in the secondary gold `#a4842a` with `rgba(169,121,31,.16)` fill (day-theme CTA treatment, distinct from the lamp `#d9a441` used at night).

**Notes, verbatim, key ones:** *"Day mode is not a light-mode afterthought. The desk becomes foxed paper, the leaf becomes brighter paper, and the plate keeps its engraved double border because on light paper a framed illustration needs the frame."* — contrast figures (see §2) — *"The report gains two lines the old build folded away: what the fires burned, and the weather that caused it."* — *"The omen arrives last and alone, 1.1s after the final figure... it still gets no number, no icon, no sound sting."*

### Screen 07 — The roster (Hands)

*"On desktop an overlay on the leaf. On mobile the Hands tab, which is a place rather than a modal."*

**Desktop:** a true centered modal (`width:1180px`) over a dimmed scrim (`rgba(11,9,6,.74)` over a `opacity:.5` backdrop of the dimmed beat), `bb-turn .45s cubic-bezier(.2,.7,.2,1) both`, season-spine left edge. Header: title "The Hands," count "4 housed · 1 marked grave," `✕` close (52×52). Below: a Reuben quote block (left-border season accent, tinted bg): *"We will hold, but Josephine is in a bad way. A kind word, or a full plate, would not go amiss."* Then a **2-column grid of hand cards** — each: name (21px) + role badge (Foreman: filled season-accent chip) + condition badge (outlined chip, e.g. "Sullen," "Willing," "Quick"/"Mind sharp" as a second badge) + morale dots (right-aligned, 20px, 5px letter-spacing, colored by band: good=season/green, warn=amber, bad=red) + task chip + italic condition word (colored to match). A separate "In the ground" row below the grid lists dead hands by name with epitaph-style italic text ("a marked grave, the first winter"). Footer: helper text ("Tap a hand to set their task. The foreman gives you his read first.") + lamp "Close" button.

**Mobile:** same content as a persistent tab (not a modal) — single column of hand cards, Reuben's quote block pinned near the top, graves section at the bottom before the tab bar.

**Notes, verbatim, key ones:** *"A true modal. Centered on the whole canvas over a scrim... The panel never touches an edge"* — *"Two columns on desktop because a 1180px overlay with one column of hands wastes half the panel"* — *"The graves get their own section, headed 'In the ground.' In the old build a dead hand was a span in the same household row as the living, which read as a bug."* — *"Morale dots are 20px with 5px tracking and are colored by band: green in good heart, amber worn, red spent."* — *"On mobile it is a tab, not a modal... removes the open-close-reopen loop the overlay forced."*

### Screen 08 — Density and accessibility (stress test)

*"Nine hands, three graves, names at their longest, three warnings firing, and the same beat at 150 percent type."*

Not a new screen design — a stress test of the Morning-Brief/Play-scene shell under load. Fall accent, Year Four Day 18, a **faster** omen cycle (`{{ dreadFast }}`, 300×170px stain — the largest shown). Adds a **household rail** as a standalone left panel (404px, `rgba(11,9,6,.84)` bg) instead of folding the roster into the leaf's household strip: header "The household" / "9 housed · 3 graves," then a scrolling list of 44px rows (name, optional Foreman badge, morale dots pinned `flex:0 0 auto`, names allowed to `text-overflow:ellipsis` — demonstrated on "Thomasina Ashgrove-Pike"), a final row listing the three graves ("Ellis, Sarah, Hollis" / "three marked graves"), footer Regard readout + "Show roster" button.

Leaf widens to **1360px** to compensate for the rail. Ledger shows Coin `1 284` (comma/space-grouped thousands via a literal space per the markup, i.e. non-breaking space grouping), Larder + Fuel both bad, Seed warn. **Three warnings stack** in a column (not wrapped inline): *"Fuel is 109 short of what nine mouths will burn through a cold snap,"* *"The larder covers eleven days of the twenty left in the season,"* *"Two hands are spent, and one is ill. Work will go undone."* Scene: "The Sheriff's rounds" / "A tall man at the fence line," body splits into a 2-column layout (`1fr 460px`) once past ~600 characters, so prose and the 3-choice + 1-disabled column sit side by side rather than choices pushed below the fold. Choices: "Answer him plain" (primary, no cost), "Show him the graves" (plain, +regard), "Say nothing at all" (plain, −regard), "Buy the man's silence" (disabled, 200m, arithmetic line: *"Coldwater does not take money. This is here so you know that."*). Omen footer: *"A corner of the near field blighted overnight in the shape of a hand. Nothing grows there again this year."*

**Portrait, at 150% type:** same beat, ledger folds to a 2×2 wrapped grid (`flex-wrap:wrap`, `width:50%` cells), warnings stack as two full lines, choice rows grow to `min-height:58px`, tab-bar labels grow to 12px. Nothing clips.

**Notes, verbatim, key ones:** *"Many hands. The household becomes a scrolling rail on the left... Above nine hands the rail scrolls."* — *"Long names. Rows are flex with the name allowed to ellipsis and the morale dots pinned with flex:0 0 auto."* — *"Stacked warnings. The warning band is a column, not a row: three fire here and each gets a full line."* — *"Long scene text. Past roughly 600 characters the desktop stage splits into prose and a choice column, so the reading measure never exceeds 74 characters."* — *"150 percent type. Nothing is clipped... The ledger folds from four cells to a 2 × 2 grid, warnings wrap to two lines, choice rows grow to 64px, and the tab bar drops its icons and keeps its labels."* (Note: this last line says choice rows grow to "64px" in the prose while the actual mockup CSS shows `min-height:58px` — flag as a minor inconsistency in the source, use 56-64px as the acceptable touch-target range at high type scale.) — *"Dread scales too. At Warnings tier the stain's cycle drops from 5.5s to 3.4s and it grows by half."*

### The component set (closing catalog page)

A dedicated section (*"Seven blocks. Everything above is built from these and nothing else."*) recaps: Ledger readout, Hand row, Choice card, Crop chip, Location plate + caption, Portrait + nameplate, Popover, and Omen block — all already transcribed in §8 above, plus one component not shown in any full screen mock:

**Popover** (new, catalog-only):
```css
border:1px solid #4b3f2b; background:#1f1a12; box-shadow:0 16px 40px rgba(0,0,0,.6); padding:16px 18px;
/* label */ font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:#8f7e5c; font-weight:600;
/* plain-language title */ font-family:'IM Fell English SC',serif; font-size:20px; color:#f0e4c6; margin-top:4px;
/* two sentences of consequence, never a formula */ font-size:15px; line-height:1.55; color:#c3b087;
/* dismiss control — a real 44px control, not a scrim tap */
border:1px solid #d9a441; color:#f0e4c6; font-size:14px; text-align:center; padding:9px; margin-top:14px;
```
Example content shown: label "Fuel," title "Firewood, and what it buys you," body *"The fires burn through winter whether you laid wood in or not. Come up short and the household takes the cold, and the cold takes hands."*, button "Understood." This is what "tap any figure" in the ledger bar opens.

**Crop chip**, isolated spec: *"Fixed grid, never wrapping. 56px minimum on touch. Name above cost, selected takes the seasonal accent."*

Closing implementation notes (verbatim, important for the rebuild):
- *"Dropping this back into year1.html: Every block above is one element with border, padding and inline-safe rules. The existing class names survive: `.ledger` becomes the brass bar, `.hand` keeps its shape, `.btn` keeps its dual label, `.plate-cap` and `.plate-nameplate` are unchanged in structure. The seasonal accent stays a single custom property on the almanac, and lamp joins it as one more."*
- *"What is not answered here: The Town, Ledger and Almanac tabs are named but not designed, since none of them exists in the prototype yet. The market screen reuses the choice card and stepper wholesale. Festival and Long Vigil beats use the play scene with no changes."*

---

## 10. Two form factors

### Portrait phone (390×844)

A single `flex-direction:column` shell, top to bottom, every band `flex:0 0 auto` except the scrolling content region (`flex:1; overflow:hidden` — actually scrollable in the real app, shown clipped here):

1. 4px season-spine bar
2. Masthead row (wordmark + help/settings icon buttons, 34×34)
3. Season/day-count row (`border-bottom:3px double #4b3f2b`)
4. Weather/plate band (96-130px tall, texture + vignette + weather particles + inset portrait/nameplate if a speaker is present)
5. Location caption (centered, name + italic aside)
6. Ledger strip (4-cell flex row, folds to 2×2 at 150% type)
7. Optional warnings band (stacked lines, tinted background)
8. Reading/choice content (scrolls)
9. Ask-Reuben bar (fixed above the tab bar)
10. Optional omen footer (fixed, above Ask-Reuben or the tab bar depending on screen)
11. Six-tab bottom bar (`padding-bottom:14px` for safe area)

The floating-leaf metaphor does **not** exist on phone — there is one continuous surface, `background:#17130d` (or day paper), no separate card-within-card for the leaf. The plate is a fixed-height band, not full-bleed, on every screen except it dominates less of the viewport than on desktop.

### Desktop (1920×1080) — "full-bleed plate with a floating leaf"

Chosen over two rejected options in the exploration (section 06 of the language spec):
- **A (rejected)** — *"today's 40/60 split, restyled. Safe. The plate is still a postcard."*
- **B (rejected)** — *"roster rail, reading column, ledger rail. Legible, but three rails of chrome squeeze the prose."*
- **C (chosen)** — *"full-bleed plate, floating leaf, chrome on glass. Weather and omens finally have room to happen."*

Structure: the location plate/illustration is the **entire canvas background** (`1920×1080`, texture + vignette + weather + omen), with all other UI drawn as translucent/opaque chrome floating on top of it:
1. 5px season-spine top bar (full width)
2. Masthead band (96px, semi-transparent dark gradient over the plate)
3. Location-name band (78px, lighter transparency)
4. The speaker portrait, standing directly on the plate (no card), bottom-anchored, roughly a third of the way from the left
5. The floating leaf (§8.3) — the one genuinely opaque, paper-textured object — pinned to the right side, `top:136-195px; bottom:52px`, width varying `860-1360px` by screen density
6. A Courier seed-hash tag, bottom-right of the canvas, outside the leaf

There is **no bottom tab bar on desktop** — none of the eight screen mockups show one at 1920×1080; the six-tab nav is confirmed mobile-only chrome (see §8.7). Desktop navigation between Fields/Hands/Town/Ledger/Almanac is unspecified in this source ("named but not designed" per the closing notes) and is a judgment call for implementation.

Component adaptation summary:
| Component | Phone | Desktop |
|---|---|---|
| Location plate | Fixed-height band (96-130px), framed if not full-bleed | The entire canvas, full-bleed, no frame |
| Leaf/ledger | No separate leaf; one continuous column | A distinct floating card, 860-1360px wide |
| Household/roster | A tab (Hands) — a place | A modal overlay OR a collapsed one-line strip inside the leaf + "Show roster" button |
| Choice cards | Full-width, stacked, `min-height:56px` | Same shape, wider, inside the leaf's reading column (or a dedicated 460px choice column when prose splits) |
| Nav | Six-tab bottom bar | Not designed in this source |
| Portrait+nameplate | Small inset (82-104px) within the weather band | Full-height figure (up to ~620px) standing on the plate |

---

## Report notes for the requester

- The source file is 1819 lines total; all of it was read and transcribed.
- Section numbering in the language-spec preserved: 01 Type pairing, 02 The scale, 03 Color roles, 04 Spacing & rules, 05 Motion vocabulary, 06 Exploration/desktop layout, 07 Exploration/the ledger — then Screens 01–08, then "The component set."
