# Onboarding Clarity Pass Design

**Status:** draft, pending review.
**Governs:** `prototype/year1.html` only.

## Problem

Playtest notes surfaced two different kinds of gap:

1. **Baseline UI bugs and missing affordances** that confuse every player, tutorial or not: a sell/larder selection that gives no visible feedback when tapped, an Ask Reuben panel that blurts an answer before asking what you want, a roster row with no visible sign it is tappable, a Regard stat with no explanation anywhere and a tap target that silently misroutes into the Hands roster, and crop costs shown as bare numbers with no unit or context.
2. **Tutorial content gaps** in the guided-mode `tip()` system built for #20: it never explains the stat bar as a whole, never explains that hands get sensible defaults so a new player understands what "open the roster" is for, and never explains the tradeoff on the Attend the Fair choice.

The prototype already has three mechanisms proven out in earlier passes, and this design reuses all three rather than inventing new ones:

- `tip(id, text, selector)` (`prototype/year1.html:1482-1501`): one shot, fires only in guided mode, deduped per save via `S.tutShown[id]`. Used for every item marked **gated** below.
- `openInfo(title, html)` plus a `*_HELP` lookup object, the pattern behind `LEDGER_HELP` (`:1449-1454`) from #19: an on demand popover, available to every player regardless of guided-mode status. Used for every item marked **baseline** below.
- `SCREEN_HELP` (`:1441-1446`): generic per-screen text behind the `?` masthead toggle. Not extended by this pass; left as is.

**Non-goal:** no new UI surface (no glossary tab, no settings screen). Every fix here fills a gap in an existing pattern.

## Baseline fixes (all players, tutorial on or off)

### 1. Reword the intro line

`springFlow()` (`:1007`) currently reads:

> "They say the ground here keeps accounts. You will have a year to learn what that means."

This reads as a promise that something will happen within Year 1. The Reckoning is possible, not scheduled; a fully humane playthrough can keep it near zero and never see it fire. Change the last clause only:

> "They say the ground here keeps accounts. You will have a year to learn what that can mean."

Minimal edit, same rhythm, removes the implied inevitability.

### 2. Fix the sell/larder selection feedback bug

`marketStep()` (`:848-849`) already toggles a `sel` class onto the larder/sell buttons and already updates the `.lab small` text live, but no CSS rule targets a bare `button.sel` in this context, so the class does nothing visible. Add a rule (border and fill, matching the existing `.chip.sel` treatment at `:239`) so the active choice is visibly marked. No behavior change needed: the choice already stays live until "Close the day-book" commits it via `doSell()`, which is the correct select-then-finalize flow already.

### 3. Restructure Ask Reuben to ask before it answers

`openAskReuben()` (`:1463-1479`) currently renders the "What should I be doing?" answer immediately, with the four question rows listed underneath it, so a player who opens the panel gets an answer to a question they did not ask. Change the default render to show only the four rows (What should I be doing? / How are the hands? / Stop the tips / Nothing, carry on) with no answer populated. Clicking a question renders its answer into the existing `#reuben-answer` div, exactly as "How are the hands?" already does today. No change to `reubenGuidance()` or `collectiveLine()` themselves.

### 4. Make the household row look tappable

The whole `#household` div already routes to `openRoster()` (`:558-560`), but the only affordance is a JS-set `cursor:pointer`, which is invisible on touch. Add a hover/focus style matching `.ledger .cell:hover` (`:157`), and add a small, always visible `›` glyph after the Regard word so the row reads as tappable without relying on hover at all.

### 5. Give Regard its own tap target and its own explanation

Currently "Regard " + `regardWord()` (`:556`) is plain text inside the household row, so tapping it opens the Hands roster, which has no Regard content. Wrap it in its own `<span class="regard-tap">`, stop its click from bubbling to the row handler, and wire it to `openInfo("Regard", REGARD_HELP)`, a new constant parallel to `LEDGER_HELP`:

> "Regard is how the town of Marrow's Cross has come to see you, the newcomer. Every choice that touches your neighbors nudges it up or down. For now it marks your standing in your own eyes. In time it can open doors, or close them."

This is written honestly against the current prototype (Regard does not yet gate anything mechanically) while staying true to the Reputation axis it stands in for per the Mechanics Bible.

### 6. Label crop costs and add a per-crop tap card

`plantStep()` (`:949`) renders the bare `c.seed` number on each chip with no unit. Two changes:

- Render it as "3 seed" instead of "3".
- Make the chip tap-to-reveal a short card using fields that already exist on `CROPS` but are otherwise unused on this screen, including the `tag` field (currently dead data, never rendered anywhere):

> "{name}: {seed} seed to plant, ready in {one season / two seasons}. {tag, in prose}."

Example for turnip: *"Turnip: 3 seed to plant, ready in one season. A fast root that fills the larder quick."* Example for cotton: *"Cotton: 10 seed to plant, ready in two seasons and needs two hands. Pays best of anything you can grow, but takes the longest to see a mark of it."*

This reuses the disabled-chip tap-to-reveal pattern from #19, extended to chips that are affordable, not just disabled ones.

### 7. Add a tap-to-reveal tradeoff on Attend the Fair

The Fair choice (`springFlow()` `:1023-1037`) already has `sub` and `tag` (`+regard` / `−regard`), but no numeric or mechanical detail is available anywhere. Add a `why` field per choice, reusing the tag/why mechanism from #19:

- **Attend the Fair**, why: *"Reuben spends the whole day at your side in town. No field gets tended today, but the wheat contract locks in and the town takes note."*
- **Skip it and work**, why: *"Reuben keeps working the fields as usual. You lose nothing today, but Marrow's Cross remembers who stayed away."*

## Gated tutorial content (guided mode only, via `tip()`)

### 8. New `statbar` tip: explain the ledger row

Fires once, immediately after opting into guided mode, alongside the existing `bar` tip (`:1524`). Selector: `#ledger`.

> "Now then. Coin buys seed and coal. The larder feeds us through to spring. Fuel keeps the cold out come winter. Seed goes in the ground before coin ever does. Tap any of those four, any time, and I will tell you plain what it means."

### 9. New `household` tip: explain the household row and point at Regard

Fires once, right after the `statbar` tip. Selector: `#household`.

> "That row is the household. My dots show how the hands are holding up, tap the row to see them each by name. And Regard there, that is how the town has come to look at you. Tap it and I will tell you what it means."

This directly answers your ask that new players be told, in the tutorial, that the household row and Regard are both tappable, on top of the baseline affordance fixes in items 4 and 5.

### 10. Extend the existing `plant` tip: cover the planting decision, not just the picker

`plantStep()` (`:961`) already fires a `plant` tip highlighting `.crop-picks`. This is the first tutorial interjection after the charter/Ridley intro sequence finishes, so it should carry the weight of a real explanation rather than just pointing at the widget. Replace its text:

> "This is the season's planting. Turnip and potato fill bellies quick and cheap. Wheat and corn take longer but keep better and can be sold. Cotton pays best but wants two hands and two seasons before you see a mark of it. Plant enough to feed us, and something left over to sell. Get the balance wrong and a lean winter will find us out."

### 11. Extend the existing `assign` tip: explain the auto-default

`assignStep()` (`:995`) already fires an `assign` tip. `defaultTasks()` (`:675-684`) silently assigns every hand a sensible default before the screen even renders, but nothing tells the player this happens or why they might override it. Replace the tip text:

> "Every hand already has a task, I have seen to that myself: the ones tending what needs tending, the rest chopping wood or resting as I judged best. Open the roster if you would set it otherwise, a hand knows his own field better than my guess does. Otherwise, put them to work as I have laid it out."

## Out of scope

- Any new persistent UI surface (glossary tab, settings screen).
- `content/events/*.yaml` (not loaded by this prototype).
- `SCREEN_HELP` and the masthead `?` toggle: unchanged.
- Any change to how Reckoning itself accrues or is calculated; item 1 is a copy fix only.

## Cross-references

- Prior pass this one extends: `docs/superpowers/specs/2026-07-25-ui-clarity-pass-design.md` (#19).
- Tutorial system this one extends: `docs/superpowers/specs/2026-07-25-tutorial-design.md` (#20).
- Voice rules to preserve in all new copy: `docs/style-guide.md`, including no dash punctuation.
