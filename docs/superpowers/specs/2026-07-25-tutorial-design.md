# Bushel & Bone: The First-Run Tutorial

**Design spec.** Date: 2026-07-25. Status: approved in brainstorm, pending written review.

Written under the no-dash rule (`docs/style-guide.md`): no em dash, no hyphen-as-pause.

Implements GitHub issue #20. Builds on the Foreman feature (D-036): the tutorial is Reuben.

---

## 1. Intent

Year 1 ("The Newcomer") is designed as the tutorial lifetime: a forgiving year that teaches the whole loop at low stakes. This spec makes that explicit with an opt-in, in-context guide. The guide is Reuben, the foreman, so the tutorial and the Ask Reuben tutor are the same thing: guidance grows out of the control the player will use for the rest of the game.

The playtest problem this solves: the game is faithful but opaque, and a new player does not know what the controls do.

---

## 2. The first-run prompt

On the player's first ever session (a `localStorage` flag), before the opening card, Reuben introduces himself in an overlay and offers to guide:

> **Reuben, your foreman.** "I am Reuben, and I will be your foreman. New to the Sull, are you. The first year is the hard one. Let me walk you through it and you will have the way of it by spring."

Two choices:
- **Walk me through it** (turns guided mode on)
- **I will find my own way** (guided mode off)

After this, the flag is set so the prompt never appears again. The choice is remembered.

---

## 3. The coach-mark treatment (chosen: "Reuben leans in from the bar")

A tip is delivered by the persistent **Ask Reuben bar**, which expands into Reuben's voice, and the on-screen control the tip is about gets a highlight ring. A **Got it** button collapses the bar back to its normal state.

Why this treatment: one anchor, no floating placement to maintain, and it teaches where Reuben lives so the player knows to tap the bar for help once the tips are gone.

**Anatomy of a tip:**
- The bar expands above its normal row into a panel: a small Reuben mark, the label "Reuben", the tip text (italic, almanac voice), and a **Got it** button.
- The tip names a **highlight target** (a CSS selector for the relevant control, for example the crop chips, the roster button, the market toggles, or the bar itself). That target gets a `.tut-highlight` ring while the tip is open.
- Dismissing (Got it, or acting on the control) collapses the bar and clears the highlight.

---

## 4. When tips fire

Guided mode fires each tip once per run, on the **first encounter** of the mechanic it teaches. The curated Year-1 set (Reuben's voice, no dashes):

1. **The bar itself** (immediately after choosing "Walk me through it"). Highlights the Ask Reuben bar.
   > "See this. That is me, always here at the foot of the page. Tap it any time you are unsure and I will tell you the next thing that matters."
2. **Planting** (first planting screen). Highlights the crop chips.
   > "Plant your bellies first. Potatoes and turnips fill a larder, and you will want it full come winter. Tap a crop for each field, then sow."
3. **Assignment** (first dawn assignment). Highlights the "Open the roster" button.
   > "This is the day's work. Open the roster and set each hand a task. Set me to tending and I will make a field give more."
4. **The roster** (first time it opens). Highlights a hand row.
   > "Here are the hands, each with a name and a heart. Keep them fed and rested and they work the better. Tap one to set their task."
5. **The market** (first market screen). Highlights the larder and sell toggles.
   > "Now the market. Grain and roots can go to the larder to eat, or to town for coin. Coin buys much, but a full belly is what carries you through the dark months. Choose careful."
6. **Winter readiness** (first time the winter need appears, in Fall). Highlights the food and fuel figures.
   > "Winter is the test. You need food and wood laid by for every mouth. Watch these two. Come up short on wood and the frailest will freeze."
7. **The first omen** (first Dusk that prints an omen). No highlight.
   > "The land keeps its own accounts of how we treat our own. It will not show you a number. It shows you signs, a soured pail, crows that will not leave. Mind them, and mind me. I will warn you before it comes to collect."

Tip 7 gestures at the hidden Reckoning and the alarm without ever revealing a number, per the hidden-layer rule.

---

## 5. Turning tips off and on

- **Dismiss one:** the Got it button.
- **Stop them all:** the Ask Reuben panel gains an option, "Stop the tips", which turns guided mode off (remembered).
- **Replay:** the Ask Reuben panel gains "Walk me through the basics again", which turns guided mode on and clears the shown-tip record, so the tips fire again from the next encounter.

A player who chose "I will find my own way" gets no automatic tips, but Ask Reuben is still available on demand (it already exists), and the replay option lets them opt in later.

---

## 6. State and persistence

- **`localStorage` keys:** `bb_seenIntro` (has the first-run prompt been shown ever) and `bb_guided` (is guided mode on). Both survive across games and sessions.
- **Per-run state on `S`:** `S.tutShown` (a set or object of tip ids already shown this run), reset each `newGame`. Guided mode reads `bb_guided`.
- No other tutorial state. No branching. No progress tracking beyond "which tips have shown this run".

---

## 7. Components and boundaries

- **`tutorial` unit** (a few functions inside the prototype IIFE):
  - `tutInit()` on boot: read `localStorage`; if `!bb_seenIntro`, show the first-run overlay and set the flag on choice.
  - `tip(id, text, selector)`: if `bb_guided` and `id` not in `S.tutShown`, expand the bar into the tip, ring the `selector` target, mark shown. Otherwise no-op.
  - `dismissTip()`: collapse the bar, clear the highlight.
  - `setGuided(bool)` and `replayTips()`: the panel controls.
- **Call sites (one line each):** `tip("plant", ...)` at the top of the planting render, `tip("assign", ...)` in the assignment card, `tip("roster", ...)` in `openRoster`, `tip("market", ...)` in the market render, `tip("winter", ...)` where the winter need first shows, `tip("omen", ...)` where the Dusk omen is printed.
- **Reuses:** the Ask Reuben bar (Task 2 of the Foreman work), the overlay system, and the existing palette and voice.

Each call site is a single self-contained line so the tutorial does not tangle the game logic. The tip content lives in one place (a small table or inline at each call site, keyed by id).

---

## 8. Testing (Vitest + jsdom)

- `tip()` shows once: calling `tip("plant", ...)` twice in guided mode expands the bar the first time and no-ops the second (id recorded in `S.tutShown`).
- `tip()` is silent when guided is off.
- The first-run overlay appears when `bb_seenIntro` is unset and not when it is set; choosing "Walk me through it" sets `bb_guided` true, the other choice sets it false, and both set `bb_seenIntro`.
- `replayTips()` clears `S.tutShown` and sets guided on; `setGuided(false)` stops further tips.
- Smoke: a full guided playthrough reaches an end screen without the tips blocking the auto-advancer (tips render in the bar, not in `#stage`, so they never intercept the flow).

Expose the tutorial functions and the localStorage-backed flags on `window.__BB_TEST__` so tests can drive them. jsdom provides `localStorage`.

---

## 9. Out of scope

- Tips beyond Year 1 (later lifetimes assume competence).
- Teaching the imagery layer (plates and portraits), which does not exist yet.
- Any tutorial for the moral fork or Vane's wagon beyond their own scripted prose. Those beats already explain themselves; adding tips there risks over-teaching.
- Analytics or completion tracking.

---

## 10. Open questions

None blocking. If a tip proves too wordy in play, it gets trimmed during the playtest pass, which is a content change, not a design change.
