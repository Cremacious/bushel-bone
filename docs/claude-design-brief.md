# Bushel & Bone — Claude Design Brief

*Paste this whole document into a Claude Design project as the opening prompt. It tells Claude Design what the game is, where the real files live, what data has to fit on screen, and where it is free to change things.*

---

## 1. What you are designing

**Bushel & Bone** is a mobile-first, dark alternate-1800s survival and management game with a Weird West undertow. The player inherits a rooted homestead worked by farmhand "clones" grown by strange 1800s pseudo-science, and can treat those hands kindly or cruelly. Cruelty raises yields but calls down a supernatural reckoning the land remembers.

Elevator pitch: *Stardew Valley × Oregon Trail × ethical horror.* Emotional core: grit and survival, "I survived another year."

The game is turn-based. A day runs in three beats: **Morning Brief → Play → Dusk Report**. The calendar is 20 days per season, 80 days per year. There is no walking map; the homestead is a static 2D diorama and the town is reached through cards, not travel.

You are designing the **in-game UI and screen layouts**, and a **single consistent design language** that carries across two form factors (see Section 3). You are not designing store marketing pages.

---

## 2. Where the real files are (this is a prototype, not a React app)

The game today is a **single self-contained HTML file**, not a framework project. There is no React, no build step for the UI. Treat these as the source of truth for what exists:

- `prototype/year1.html` — the entire playable Year-1 prototype. All markup, all CSS (one inline `<style>` block, lines ~10 to ~576), and all game logic live in this one file. This is the thing to look at to see the current UI.
- `prototype/assets/logo.png` — the start-screen logo.
- `content/names.yaml` — the single source of truth for every NPC and location name.
- `content/events/*.yaml` — event and dialogue content (the words shown on the cards).
- `docs/style-guide.md` — the prose voice rules.
- `docs/narrative-bible.md` and `docs/GDD_v0.1.pdf` — the world, the tone, and the full design.
- `CLAUDE.md` — the project's living context file.

Because it is one static file, any design you produce should be expressible as plain HTML and CSS (with light vanilla JS for animation), so it can drop straight back into `prototype/year1.html`. No component framework is required or assumed yet. A production Next.js scaffold comes later; for now, design for hand-written HTML/CSS.

---

## 3. Two form factors, one design language

Produce the same design in two layouts, sharing one type scale, one palette, one component set:

1. **Full-screen desktop (Steam build).** The game will ship on Steam for PC, so it needs to fill a wide 16:9 screen and look like a finished commercial product, not a phone app stretched wide. The current prototype centers a narrow ~520px "almanac leaf" on a dark desk. On desktop you have a large canvas to use well: give the reading column, the location art, the ledger, and the roster room to breathe instead of leaving dead space.
2. **Mobile app (App Store / Play Store build).** Portrait-primary. A locked project decision already sets this as portrait with a 6-tab bottom bar and full accessibility from day one. Design the mobile layout around that frame.

The two should read as obviously the same game. Same fonts, same colors, same iconography, same components, re-flowed for the screen.

---

## 4. The look to build on: "The Illustrated Almanac"

The locked art direction is **"The Illustrated Almanac"**: cross-hatched ink illustration, aged foxed paper, engraved borders, seasonal accent colors. Keep this soul. Make it more polished and more professional, not more generic. Restraint over spectacle is a core tone rule: a crow at the window beats an army of ghosts.

Current design tokens already in the prototype (you may refine these, keep the spirit):

- **Type:** a serif stack (Iowan Old Style, Palatino, Book Antiqua, Georgia) for all body and headings; a monospace only for a tiny debug seed tag. You are explicitly asked to **improve the fonts.** Propose a professional, legible, license-appropriate type pairing (a display/heading face with real period character, and a highly readable body face) and a full type scale.
- **Palette (light / day):** paper `#e7dcc2`, ink `#2a2216`, soft ink `#5f5138`, rules `#a3906c`. **Dark / night** inverts to paper `#17130d`, ink `#e9dcbe`. Semantic colors: good `#5f7a34`, warn `#a9791f`, bad `#99381f`, omen `#6f5c86` (the omen color is used for supernatural dread). Full **light and dark themes** are required, and the design must ship both.
- **Seasonal accent** (one hue that shifts with the season, used on rules, labels, glyphs): Spring `#6f8a3f`, Summer `#c0892a`, Fall `#a4482a`, Winter `#5a7d99`.
- **Container:** currently a single "leaf" with an accent spine down the left edge and a subtle page-turn animation between beats.

---

## 5. Every piece of data that must have a home

The design "needs to know how to handle all the data on screen." Here is the full inventory currently shown, so nothing gets orphaned. You decide where each lives and how it scales, but all of it must fit legibly in both form factors.

**Persistent top chrome**
- Game title / masthead, a **theme toggle** (light/dark), and a **help toggle**.
- **Season and time:** the season name, "Year One," and the day within the season.
- **Weather:** a weather glyph plus a text label (for example "Cold rain").

**The ledger (resources).** Four running numbers, each tappable for a plain-language help popover:
- **Coin** (marks, unit "m").
- **Larder** (stored food; turns amber when low, red when critical).
- **Fuel** (firewood; warns in Fall and Winter when below the winter need).
- **Seed** (planting stock).

**The household row (the labor force and standing)**
- Each **living hand:** their name and a **morale** reading of 5 dots (filled vs. empty). The **foreman** carries a tag.
- Each **dead hand:** their name and "a marked grave."
- **Regard:** a single word for the player's reputation with the hands.
- A **"Show roster"** button.

**The location plate (the illustration slot).** For each scene:
- A framed, engraved-border **illustration area** (art drops in later; today it is a placeholder with a tag chip in the corner and an italic scene description).
- A **place-name caption** below it (small-caps) with an italic sub-caption.
- An optional **speaker portrait** (an NPC avatar, today a silhouette placeholder) with a **nameplate** showing the character's name and role.

**The stage (the reading column, where play happens)**
- An **eyebrow** label, a scene **title (h2)**, and body **prose**.
- **Choice cards:** buttons that carry a short action label, a descriptive second line, and small tags; unaffordable choices show a disabled reason; planting choices show per-crop chips.
- **Crop data** for planting (5 crops today): name, seed cost, seasons to ripen, yield, food value, and a one-line tag (for example "cash · 2 hands").

**The Dusk Report:** the day's results and consequences.

**The roster overlay (full labor detail):** a header with how many hands are housed; the foreman's "voice" line speaking for the hands; and one row per hand carrying name, badges (Foreman, a personality trait, Body rating, Mind rating), morale dots, the current task ("Tending the east field," "Chopping wood," "Resting"), and a condition word (worn, hungry, ill).

**The opening (New Game):** a lineage-naming step (the player types their family surname), then a self-paced two-page inheritance letter (page one an aged-paper letter, page two plain narration), then a Begin control into the first Morning Brief.

**Hidden axes surfaced as omens:** Reckoning and a "Ghost Roll" are hidden numbers. They never show as a bar, but their pressure surfaces as **omens** rendered in the omen color. The design should have a restrained visual language for dread (a bird, a stain, a wrongness at the edge), not a horror-movie treatment.

---

## 6. What to improve (the actual ask)

1. **A professional, finished look.** Raise the whole thing from "strong prototype" to "commercial game UI," while keeping the Illustrated Almanac identity.
2. **New animations.** Propose motion for beat transitions, resource changes, choice selection, the Dusk reveal, weather, and omens. Keep them tasteful and in tone. Everything must honor `prefers-reduced-motion` and have a reduced or off state.
3. **Improved fonts.** A real type pairing and a full type scale (see Section 4).
4. **Consistent, large-enough text.** A disciplined type scale with a comfortable minimum body size that is readable for all users, including older players and low-vision users. Strong contrast in both themes. Assume the type may need to scale up further for accessibility without breaking any layout.
5. **A real answer for data density.** Show how the layout holds up when there are many hands, long names, long scene text, and warnings firing at once. Design for the crowded case, not just the empty one.

---

## 7. What you are free to change

The current layout is **not final.** You are explicitly welcome to improve it wherever the change is genuinely better. In particular you may:

- **Rework the overall layout** of any screen in either form factor.
- **Move the images:** the location plate and the NPC portrait can go wherever they serve the composition best.
- **Move the resource UI:** Coin, Larder, Fuel, and Seed do not have to stay a four-cell strip. Relocate, regroup, or restyle them.
- **Rescale the NPC avatars:** the portrait size and placement are open. Make them as large or small, and as prominent, as the design wants.

Keep intact: the Illustrated Almanac art direction, both light and dark themes, the seasonal accent system, portrait-primary framing on mobile with a bottom tab bar, and full accessibility.

---

## 8. Voice rule for any copy you write

If you write or restyle any in-game text, follow the house voice: **alternate-1800s, no modern slang, restraint over spectacle,** and a hard typographic rule for this project: **never use an em dash, and never use a hyphen as a pause.** Use periods, commas, colons, and parentheses instead. Hyphenated compound words (for example "cross-hatched") are fine. This rule matters because the em dash reads as machine-written and breaks the period voice.

---

## 9. What to deliver

1. A **design-language spec:** type pairing and full scale, color roles for both themes, spacing system, iconography direction, and a motion vocabulary.
2. **High-fidelity mockups of every screen** in Section 5, in **both** the desktop (Steam) and mobile (App Store) form factors: the New Game letter, the Morning Brief, a Play scene with choice cards, the Dusk Report, and the roster.
3. A **component set** (ledger readout, hand row, choice card, location plate, portrait + nameplate, popover) built as reusable HTML/CSS blocks that could drop back into `prototype/year1.html`.
4. A short note on **data density and accessibility:** how the layout behaves under a full roster, long text, stacked warnings, and enlarged type.
