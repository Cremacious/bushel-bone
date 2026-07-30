# v0.4 Playtest Notes — Triage & Solutions

**Status:** captured 2026-07-30 from Chris's second v0.4 playtest ("moving in the right direction"). Every player note below with a proposed solution. Feeds a Phase-4 spec/plan ("clarity, content & the clone reveal"). Grouped by theme.

---

## Theme 1 — The mechanical vocabulary is unreadable (the biggest cluster)
Raw fx keys leak into the UI and their color/valence is wrong, so event choices are confusing.

- **`strainOne` / `strainAll` shown raw** ("+12 strainOne", "+8 strainAll") — players have no idea what these mean.
  - **Fix:** human labels. `strainOne` -> "Tiredness (a hand)", `strainAll` -> "Tiredness (the crew)". A minus reads "Rest" / "eases".
- **Valence is inverted for bad things.** "Work them through it **+16 strainOne**" is shown **green** (looks good) but it is the *worst* option.
  - **Fix (a real bug):** in `fxTag`, tiredness UP is **bad (red)**, tiredness DOWN is good (green); Dread (reckoning) UP is bad. (Currently any `+` reads green.)
- **The sick-hand choice set is opaque** (Doc costs coin but no lost work; Rest loses work but recovers; Work-through is worst). Players don't understand it, or whether a hand can **die** from the fever.
  - **Fix:** clearer labels + valence (above) + a sub line that names the stakes ("push them and they may not last the winter"). Confirm hands *can* be lost, and telegraph it.
- **`+Dread` (reckoning) has no visible stat** — players can't judge their own dread.
  - **Fix:** teach (a first-time tip) that dread/the reckoning is **deliberately hidden** ("the land keeps its own ledger; you will feel it before you see it"). Keep it hidden by design (D-027), but tell the player it's hidden on purpose so a +Dread tag isn't baffling.

## Theme 2 — Reuben's Tiredness must feel real (notes 8, "sit with a hand", "rest makes no difference")
- **Resting Reuben (status "rest him now") makes no noticeable difference.** **Sitting with a hand** — players don't see the benefit.
  - **Fix:** make the Tiredness meter/word visibly move on rest/care (a clear before/after), and surface strain recovery in the day-book/beat feedback. Possibly increase `restRecovery`/`careRecovery` so a night's rest is a visible step, and show "Reuben rested: Failing -> Worn" in the log.

## Theme 3 — The season action pool is confusing (notes 2, 9, 10, 12)
- **"You have 5 of the season to spend" was confusing.** Players didn't know it was 5 *actions per season*, used them too early.
  - **Fix:** relabel clearly: "**Your own time this season: 5 actions**" with a one-line hint ("spend them on town, foraging, or a hand; they refill next season"). A **tutorial tip** on the beat screen explaining the pool.
- **Confirm before spending an action** (Forage / Sit with / Ride) to prevent accidental clicks.
  - **Fix:** a lightweight confirm on the action-spending buttons.

## Theme 4 — The beat loop's timing (note 11)
- Before "Let the days run on," players don't know Reuben's task only runs **when the day resolves**.
  - **Fix:** a persistent one-line hint on the beat screen ("your crew's orders take effect as the days run") + a first-time tip.

## Theme 5 — Talks & jobs feel pointless / no hard choices (notes 13-17)
- **Grange and Doc talks felt pointless** — no reward, felt like a wasted action.
  - **Fix (design):** every talk should give **a reward or a chance of one** — intel you can act on, a small gift, a question with a right answer (standing/coin/an item), or a trade. Pure-flavor talks become the free small-talk filler. Rework the deeper NPC cards to carry a payload.
- **"Work Going" jobs have no hard choices** — players pick the highest pay.
  - **Fix (design):** job variety with tradeoffs — a job that pays more but **tires the hand who does it**, a risky job (a chance of a bad outcome), a job that trades coin for standing, a moral job (help vs profit). Make the choice interesting, not just "pick the biggest number."
- **Between harvest and season's end there is nothing to do / spend actions on.**
  - **Fix:** fill the lull with more frequent town opportunities / events in the back half of a season, and give the season-pool actions somewhere to go (town errands, relationship beats).

## Theme 6 — Visual bugs (notes 18, 19)
- **The `A / warm rain comes / ...` line-break bug** and **"fever and a shake" highlight pushing line spacing.**
  - **Fix:** the `.hl` highlight span CSS is affecting line layout (likely `font-weight`/`line-height`/an inherited block context, or the `>` block-scalar in YAML inserting newlines around the span). Make `.hl` a pure inline span (no line-height change), and check the YAML body block scalars don't wrap mid-sentence. Verify the prose renders as one flowing paragraph.

## Theme 7 — The resource status row (note 1)
- The "Larder 50 · Fuel 0 · winter wants: wood 0/40, food 50/30" row needs to be **more visually distinct** so players notice it.
  - **Fix:** restyle it as a proper status bar (a bordered/tinted strip, icons or bold labels, amber when short), not a faint mono line.

## Theme 8 — Crop grow-time in the picker (note 20)
- Players should know **how many days a crop takes to grow** before choosing it.
  - **Fix:** add "ripens in ~N days" (and food vs coin) to each crop chip on the planting grid.

## Theme 9 — The clone reveal (note 21) — the big new narrative design
- Need **story/exposition about the clones.** A story beat: an eerie nudge to "visit the town for help"; the player goes looking to buy farmhands and is **surprised to be introduced to clones** (Dr. Vane's wagon). This is the **first spark of the ethics** — where Regard and the moral debt begin. It doubles as a natural onboarding to exploration + the hiring mechanic.
  - **Design (to brainstorm):** a scripted Year-1 beat that sends you to town for labor, the wagon reveal, and the first regard/reckoning framing. See the question below.

## Theme 10 — Ongoing fleshing (note 22)
- More dialog, more NPCs, more choices in the event deck. (Continuous; each pass adds cards/scenes.)

---

## The design decisions to settle (before the spec)
1. **The clone reveal (Theme 9):** how the beat plays and how early (a scripted Day-1/early-Year-1 sequence vs an organic first-town-visit trigger).
2. **Reward-talks & job variety (Theme 5):** how deep the reward system goes (simple payloads vs question/trade minigames).

Everything else (Themes 1-4, 6-8, 10) is a clear clarity/polish/content pass.
