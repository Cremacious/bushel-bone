# Minute-to-Minute Gameplay — the Weekly Loop, Planting, and the Year-1 On-Ramp

**Status:** validated design (brainstormed with Chris, 2026-07-29). Refines and extends the
gameplay-depth spec (`2026-07-28-gameplay-depth-design.md`), especially §10's weekly loop,
which was implemented as a bare skeleton in prototype2 Plan 2 and needs the "read" and
"resolve" halves it never got.

**Scope:** the moment-to-moment of a season in `prototype2/` — from arriving and sowing,
through the five weeks, to harvest and the season turning. Also the planting screen and the
Year-1 onboarding ramp. This is presentation + loop design; it reuses the existing pure core
(reducer, crops, hands, `resolveWeek`), the scene engine, and the tutorial/tips system.

---

## 1. The problem

The current loop — plant, then each "week" pick a task for each hand and your own action from
a menu, "Put them to work", repeat five times until harvest — is **boring and confusing**:

- **No information to plan with.** You choose blind: no forecast, no sense of when a crop will
  ripen or what it will yield, no warning that the larder won't stretch.
- **Repetitive menu selection.** You re-make the same assignment five times even when nothing
  changed. With one hand, "assign everyone" is barely a decision.
- **No in-the-moment tension or feedback.** Nothing varies week to week; the resolution is a
  terse figure change, not a payoff you watch.

A first-time player with only Reuben and themselves faces a five-week labor-allocation screen
and thinks *"I have one hand and myself; if I go work a field, nothing else gets done"* — and
quits. The true hook lives in this stretch, so dry, blind, repetitive play is fatal.

## 2. Design principles (locked this session)

1. **Execute a plan.** A week is: read the board → adjust Reuben's pre-filled plan → watch it
   resolve with clear feedback. (Chosen over "react to a situation" and "plan from scratch".)
2. **Planning must matter.** Real pressures punish mindless play and reward reading the board.
   Coasting is a losing habit the game is honest about.
3. **Reuben pre-fills a sane default,** so a newcomer is never staring at a blank menu; but the
   forecast and projections give real, information-driven reasons to override him.
4. **Events are fair.** Minor, usually mitigable by a good plan, never catastrophic. They nudge;
   they don't wreck the farm.
5. **Year 1 is a teaching year.** One new layer per season; Spring nearly hands-off; Reuben
   openly explains the training wheels and warns against autopilot. Stakes near-zero in Year 1,
   rising after. (Upholds D-039 gradual onboarding and D-045 economic-squeeze curve.)
6. **No dominant crop.** Interlocking tradeoffs plus situational re-weighting mean the best crop
   is always "it depends" — there is no fixed meta to solve once and coast on. (Directly targets
   the "dominant strategy convergence" failure mode.)

## 3. The season shape

A season is **5 weeks**. The flow: **plant once** at the season open → **five weekly turns**
(read → adjust → resolve) → **Dusk** (the season's accounts) → the next season. Planting is a
single upfront decision; the five weeks after it are the game. Two-season crops sown now do not
finish until the following season — sowing them commits that ground for a long bet.

Phase machine (extends the existing one): `brief → planting → week ×5 → dusk → (next season)`.

## 4. The information layer (the missing half)

Before deciding, the player can **read the board**:

- **Weather forecast** — this week plus two-to-three weeks ahead, as glyphs + labels (cold rain,
  fair, storm, cold snap). The forecast is the single biggest new affordance.
- **Per-field projection** — for each field: crop, a growth bar, a plain-language read ("ripens
  wk 5" / "ripens next season"), a projected yield ("~20 food" / "~63 coin"), and fertility.
- **Warnings** — the live pressures surfaced as sentences, not hidden: "the larder covers 3 of
  the 5 weeks left", "storm forecast week 4 — bring ripe crops in first", "no fuel laid in for
  winter", "the Stone Lot is spent — fallow it to mend".
- **Resolution feedback** — Dusk's day-book already reads what came in, what was eaten, what the
  cold burned; the weekly resolve should surface the same at its scale (what grew, what was
  brought in, what it cost) so the plan visibly paid off or fell short.

## 5. The weekly loop

Each of the five weekly turns:

1. **Read** — forecast, fields, crew condition, warnings (§4), all on one screen.
2. **Reuben's plan is pre-filled** — a task per living hand and a suggested "your own week",
   computed from the state (bring in what's ripe, tend what's growing, chop when winter nears,
   rest a worn hand).
3. **Adjust or confirm** — the player overrides any assignment; the forecast/projections justify
   doing so. "Put them to work" is **always visible** (no scrolling to find it).
4. **Resolve** — the existing `resolveWeek` order (labor → growth → eating → cold → strain →
   loss), extended with weather effects (§6) and an occasional event (§7), shown with feedback.

**Crew tasks:** tend (speed a growing crop), harvest (bring in a ripe field; cotton needs two
hands — already built), chop (bank fuel), rest / care. **Your own week:** early on an optional
bonus ("lend Reuben a hand"), never a slot you are punished for spending; it becomes a genuine
second economy only once the crew and the demands have grown (disclosed gradually — §8).

## 6. Pressures and the weather mechanic

Six pressures make a plan a real puzzle (a thoughtless plan runs afoul of them; a read one does
not):

1. **Season clock vs crop timing** — a two-season crop sown too late never ripens; the seed and
   coin are lost. Projections show "won't ripen in time".
2. **Weather** — see below.
3. **Scarce labor, competing urgencies** — never enough hands for tend + harvest + chop + rest;
   spread thin and nothing gets done, prioritize the urgent thing and you are fine.
4. **Food vs cash balance** — all cash and you starve, all food and you cannot pay Ridley; the
   larder projection and the mortgage clock make the gap visible before it bites.
5. **Winter prep (plan-ahead)** — food and fuel must be laid in during fall; the winter need is
   shown in fall so a planner prepares and a procrastinator takes a cold, thin, survivable winter.
6. **Fertility / rotation** — harvest wears a field down; over-farm one and it gives nothing.
   Fallow to mend. (Already in the core.)

**The weather mechanic (precise):** weather only threatens a crop that is **ripe and still
standing in the field**. A ripe crop left out through a **storm** loses part of its yield (target
one-third to one-half; balance-owned). A crop that is **not yet ripe weathers it fine** — it is
still growing in the ground. The forecast shows a storm two-plus weeks out, so there is **always
time to harvest a ripe crop before it hits**. The punishment for ignoring the forecast is small
and specific: you lose part of one crop, never the farm. Gentler weather is continuous, not
binary: **cold rain** slows growth a little; a **dry spell** makes tending count for more.

## 7. Events

Events ride on top of the pressures and are **fair**: minor, usually mitigable by the plan, never
catastrophic.

- Examples: a **pest** nibbles an *untended* field (tend it and it is fine); a hand comes back
  **worn** (rest them next week); a **pedlar** offers a deal (take it or not); crows at the field
  (an omen, not a wound).
- They **reward good planning and punish carelessness only minorly**. No "your barn burned down".
- **Cadence:** occasional, not every week — roughly one in two or three weeks, tuned so the loop
  breathes without feeling random. (Reuses/extends the `content/events/*.yaml` families.)

## 8. The planting redesign

Planting is one upfront decision per season, but not the tedious one-field-at-a-time-with-full-
refreshes it is now:

- **One field-grid screen** — all four fields visible at once (a 2×2 grid), each cell showing its
  name, fertility, and either its planted crop or a crop picker.
- **Live per-field info** — as you set a field, its cell updates in place to show the chosen crop
  and a live projection ("Corn · ripens next season · ~63 coin"). Selecting a crop updates only
  that field's cell, **not a full-panel re-render** (the current 4-refresh problem).
- **Sow always visible** — the running seed/coin spend and the "Sow it so" action stay on screen;
  no scrolling to find the button.
- The **core decision** is the season-clock tradeoff (a two-season cash crop commits the ground
  and pays later; quick food feeds now but earns nothing), plus the food/cash balance and which
  fields to rest.

This shares one visual language with the weekly board (the same field-card component).

## 9. Year-1 graduated onboarding

Year 1 is a **teaching year** that introduces one layer per season. Difficulty rises within the
year (Spring simplest → Winter the gentle test) and the game opens up afterward.

- **Spring — learn the rhythm.** Only the two food crops (turnip, potato) are offered, so there
  is no food/cash dilemma yet. Reuben sets the crew himself, pre-filled and essentially always
  right; most weeks the player just confirms and watches it grow. Your own labor is an optional
  bonus. The task menu shows only tend/harvest. Stakes near-zero. **Reuben says the quiet part
  out loud** — that this is first-season help, that it falls to the player soon, and that coasting
  on autopilot is how you lose the place (see the copy note below).
- **Summer — learn to earn.** The market opens: cash crops appear, and the food-vs-coin choice
  with them. A **second hand joins** (the Vane wagon), so assigning two hands becomes a real,
  small decision. Weather starts to matter for harvest timing.
- **Fall — learn to prepare.** Chop wood and lay in food before the cold — a deadline you can see
  coming. Fields tire and want rotating. Harvest Home.
- **Winter — the gentle test.** Food and fuel for every mouth, every week; survivable even if
  imperfect, but it shows the stakes for next year.
- **After Year 1:** the training wheels come off; the mortgage comes due, the budget stays flat,
  and one new pressure arrives each year through Year 4 — the vise (D-045).

Mechanics disclose progressively: a task option appears only when the player has a reason to
understand it, and the hand-holding fades gradually, never abruptly (D-039).

Reuben's Spring training-wheels line (locked intent, exact wording tuned in content): *"First
season, I'll set us to our work myself, so you can watch how it goes. But don't get comfortable —
come summer and the years after, more of this falls to you, and a man who lets his foreman do all
his thinking loses the place by and by. Watch what I do, and why."*

## 10. Crop tradeoffs — no dominant meta

No crop is universally best; the best crop is a function of the situation. Each is strong on some
axes and weak on others:

| Crop | Speed | Food | Coin | Hardy | Kind to soil | Shines when |
|---|---|---|---|---|---|---|
| Turnip | fast | mid | — | high | high | fast food, poor field, cold |
| Potato | fast | high | — | mid | low | max food fast, but exhausts soil |
| Wheat | slow | — | mid | mid | high | steady coin, gentle crop |
| Corn | slow | — | high | mid | low | summer coin, hungry crop |
| Cotton | slow | — | highest | low (fragile) | mid | big coin with two hands + good weather; risky |

Four forces re-weight which crop is right, every season, so there is no fixed answer:

- **Food vs coin are different goals** — great for one is useless for the other, and which you
  need shifts with the larder and the mortgage clock.
- **Season and weather fit** — corn wants summer heat, turnip shrugs off cold; sow off-season and
  it yields poorly, so the right crop moves with the calendar and forecast.
- **Market swings** — cash prices drift year to year, and dumping a glut of one crop drops its own
  price, so monocropping crashes your own market; spreading and reading prices wins.
- **Fertility** — heavy feeders exhaust a field, so you cannot sow the same thing in the same
  ground forever.

New crops arrive on the Year-1 schedule (2 food → cash → hardier → the Weird crops in later
years), each adding an axis. Exact yields/prices are the **balance model's job (Q-003)**: the
prototype builds the tradeoff *structure*; the model tunes the numbers until no crop is a fixed
winner.

## 11. What changes, what is reused

- **Reused:** the pure `(state, action) => state` core, `resolveWeek`, crops/hands, the phase
  machine, the scene engine, the tutorial/tips system, the V0.3 shell and components.
- **New / changed:** the information layer (forecast, per-field projections, warnings); Reuben's
  pre-filled weekly plan; the planting-grid screen; weather variety + the storm mechanic in
  `resolveWeek`; fair events wired into the weekly resolve; per-season onboarding gating (which
  crops/tasks are offered, Reuben's framing); crop expansion + situational modifiers (season fit,
  market swings). The two-economy (crew + your week) stays but is disclosed gradually.

## 12. Suggested phasing (for the implementation plan)

This is large; the implementation plan should stage it so each stage is playable:

- **Phase A — the readable week + planting grid.** The information layer (forecast state,
  per-field projections, warnings) and Reuben's pre-filled weekly plan; the planting-grid
  redesign (live per-field info, Sow always visible, per-cell updates). *This alone fixes the
  core "blind and repetitive" complaint.*
- **Phase B — weather + the storm + events.** Weather variety and the multi-week forecast; the
  storm/ripe-crop mechanic in `resolveWeek`; fair, minor, mitigable events on the weekly cadence.
- **Phase C — the Year-1 on-ramp.** Per-season gating of crops and task options; Spring's
  hands-off framing and Reuben's training-wheels line; the "your week is optional early" framing.
- **Phase D — crops + situational value + balance.** More crops; season-fit and market-swing
  modifiers; a first balance pass toward "no dominant crop" (with the balance model).

## 13. Deferred / open

- Exact balance numbers — the balance model (Q-003).
- Forage/hunt as a food task (spec §10) — deferred; not required for this loop.
- A real market screen with swinging prices — cash crops currently auto-sell at harvest; the
  price-swing anti-meta lever needs a market, which is Phase D or a later plan. Until then, market
  swings are a design intent, not yet a mechanic.
- The multi-year economic squeeze (Y2→Y4) beyond Year 1 — D-045, a later plan.

## 14. Four-failure-mode audit (project convention)

- **Difficulty miscalibration** — the Year-1 graduated on-ramp plus the post-Y1 economic-squeeze
  curve; the balance model validates the numbers.
- **Dominant strategy convergence** — crop tradeoffs, situational re-weighting (season/weather/
  market/fertility), and market gluts prevent a fixed meta; there is no crop that always wins.
- **Cheese and exploits** — the forecast rewards foresight but cannot be gamed for free (you still
  need the hands to act on it); monocropping is countered by fertility drain and market gluts;
  Reuben's autopilot is explicitly framed as a losing habit and the stakes rise after Year 1.
- **Emotional flatness** — the information layer, fair events, Reuben's voice and framing, and
  visible stakes give the week tension and payoff instead of a terse figure change.
