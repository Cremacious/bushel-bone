# Start Screen and Save System Design (#36)

**Status:** approved, ready for implementation.
**Governs:** `prototype/year1.html` and its new `prototype/assets/` folder.

## Problem

The prototype boots straight into a new Year 1 run on page load (`newGame(...)`, `runStep()`, `tutInit()` called unconditionally at the bottom of the script). There is no title screen, no way to resume a run after closing the browser, and no settings entry point.

## Start screen

Shown before gameplay begins, replacing the current unconditional boot.

**Layout (per mockup review with Chris):** logo image, then four buttons: **New Game**, **Continue**, **How to Play**, **Settings**. New Game is visually primary (filled); the other three are plain outlined, matching the almanac's existing button style.

- **Mobile (below 1100px):** logo small, centered, above the title text and menu, single column.
- **Desktop (1100px and up, matching the #35 breakpoint):** logo larger, to the left of the whole title+menu column.
- **Logo asset:** `prototype/assets/logo.png` (already added to the repo). This is the prototype's first external asset file; it is no longer strictly single-file, which is an accepted, deliberate tradeoff for a real logo rather than an inline placeholder.
- **Continue** is disabled (grayed out, non-interactive) with a one-line reason ("no game in progress") when no save exists.
- **How to Play** and **Settings** open a plain placeholder overlay ("Coming soon") for now; #37 and #38 replace those with real content. Buttons are present and give feedback when tapped, rather than being dead or absent.

## Save system

**Single save slot**, persisted to `localStorage` (the same mechanism already used for `bb_guided`/`bb_seenIntro`), under a new key (e.g. `bb_save`).

**What is saved:** every field of `S` except `flow` (the current season's array of step closures, not serializable, and not needed, see below). A dedicated `saveGame()`/`loadGame()` pair snapshots/restores the known fields explicitly, rather than blindly `JSON.stringify(S)`, so a future field that happens to be non-serializable (a function, a DOM reference) fails loudly in review rather than silently corrupting the save.

**When it saves, and why this sidesteps the serialization problem:** autosave fires from inside `buildSeason()`, which only ever runs at the start of a season (`S.fi` is always `0` at that point, whether it's the very first season of a new game or a season turn from `endSeason()`). Because a save only ever happens at a season boundary, loading a save never needs to reconstruct mid-season position, `loadGame()` restores the plain state, then calls `buildSeason()` (which rebuilds `flow` fresh from the restored `year`/`si`/season data) and `runStep()`. This was Chris's explicit tradeoff over more frequent saving: at most one season of progress is lost if the browser closes mid-season, in exchange for never needing to serialize live closures.

**New Game:** if a save exists, shows a confirmation overlay first ("You have a game in progress. Starting new will erase it.") with an explicit Yes/No choice, reusing the confirm pattern already built for #32 (Stop the Tips). Only on confirmation does it clear the save and start fresh (`newGame(randomSeed)`).

**Continue:** loads the save, rebuilds the season, and renders, skipping `tutInit()` (a returning player has already seen or declined the first-run prompt).

**Taught to the player:** the guided-mode `bar` tip (fires once, right after opting into guided mode, currently a single page: "That bar at the bottom of the screen... is Ask Reuben...") gains a second page explaining autosave: "Your progress saves itself at the turn of each season, so you may close this and come back to find the homestead as you left it." Reuses the existing multi-page `tip()` mechanism from #33; no new tutorial mechanism needed.

## Out of scope

- The actual content of How to Play (#37) and Settings (#38): stub placeholders only.
- Any save beyond a single slot, or cloud/account-based saves.
- Saving mid-season at finer granularity than season boundaries (see tradeoff above).
- The eventual fixed-canvas Steam/mobile scaling work (#47): the start screen uses the same responsive approach as the rest of the prototype for now.

## Cross-references

- Source issue: GitHub #36, milestone "Prototype v0.2: Onboarding & Imagery."
- Reuses the confirm-dialog pattern from #32 and the multi-page tip mechanism from #33.
- Shares the 1100px breakpoint with the #35 desktop layout split.
