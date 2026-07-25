# Bushel & Bone: Reuben the Foreman, the Farmhand Roster, and the Imagery Layer

**Design spec.** Date: 2026-07-25. Status: approved in brainstorm, pending written review.

This spec is written under the new voice rule in Section 9.1: no dash punctuation.

---

## 1. Why this exists

Playtesting the Year 1 prototype (`prototype/year1.html`) surfaced two problems:

1. **The game is hard to learn.** There is no tutor and the controls are unclear.
2. **Reuben had a privileged place in the UI with no reason behind it**, while the extra farmhands were anonymous labor. That is both an inconsistency and a risk: if extra hands are morale-less disposable labor, the whole cruelty engine can be dodged at scale.

This spec resolves both with a single idea: **Reuben becomes the Foreman**, the one human channel between the player and the farmhand collective. It also defines the **imagery layer** (location plates and speaker portraits) so the player always knows where they are and who is speaking.

---

## 2. The load-bearing decision: Reuben is the Foreman

Reuben stops being "the first clone" and becomes the **right hand**: the hand the player puts in charge of the others. In canon and in code he is the same kind of vessel as any other. The player appoints one hand as Foreman, and Reuben holds that post at the start. The Foreman is four things at once:

- **The voice of the collective.** The other hands do not petition the player directly. Their morale and grievances reach the player through the Foreman.
- **The tutor.** The player asks the Foreman what to do next (Section 5).
- **The Reckoning alarm.** When moral debt crosses a tier, the Foreman interrupts the player with a warning, in character, with no number shown (Section 6).
- **Promotable.** If the Foreman dies, the player names a new one from the surviving hands (Section 4.3).

This gives Reuben a real mechanical reason for his first class UI slot, and it turns the collective's suffering into something the player **hears as a voice** rather than reads as a meter.

**Four failure modes check:**
- *Difficulty and fairness:* the Foreman warning is the fix. The Reckoning can no longer feel like it came from nowhere.
- *Dominant strategy:* the Foreman adds information and framing, not power, so it does not create an optimal build.
- *Cheese and exploit:* because every hand now has visible morale and condition and is individually managed, a player can no longer scale on anonymous disposable labor that the moral system ignores.
- *Narrative flatness:* naming hands, hearing them through Reuben, and losing them by name is exactly the interiority the design fears losing.

---

## 3. The farmhand roster

A screen listing every hand as a vertical list, reached from the main navigation.

Each hand row shows:
- A **portrait thumbnail**.
- **Name.**
- **Trait badges** (kept, per the user): the clone's type (Grower, Field Hand, Foundling) and a short body and mind read (for example "Body strong, Mind plain").
- **Heart** (morale), five dots. Visible.
- **The season's task** (Tending the East Field, Chopping wood, Resting, Harvesting).
- A **condition** word with semantic color: in good heart, worn, hungry, ill.

**Reuben's row is set apart:** a gold Foreman badge and border. Under it, the Foreman speaks for the collective (a short line drawn from the hands' current morale and condition), with two actions: **Ask Reuben** and **Hear the hands**.

Housing capacity shows in the header (for example "3 housed, Bunkhouse sleeps 5").

**Design rule:** the roster shows morale and condition, never the Reckoning. The land's judgment stays hidden (Section 9.2).

---

## 4. Managing a hand

### 4.1 Assignment
Tapping a hand opens the assign panel: the hand's details, the Foreman's read on them, and the season's task options (Rest, Tend a field, Chop wood, Harvest). This realizes the locked "per clone assignment at dawn" decision (CLAUDE.md Section 3) for the whole crew, not just Reuben.

The Foreman's read appears above the options (for example "She's willing, but she's spent. Rest would do her good."), so guidance is always in Reuben's voice.

### 4.2 The Foreman's own work
Reuben is still a working hand. He is assigned a task like anyone else. His Foreman duties (voice, tutor, alarm) are always on and cost no labor.

### 4.3 Promotion on death
If the Foreman dies, the next time the player opens the roster or an assign panel they are prompted to name a new Foreman from the surviving hands. Until they do, there is no tutor voice and no alarm, which is itself a felt loss. The promote action is otherwise hidden, so the player does not casually demote a living Foreman.

---

## 5. Ask Reuben: the tutor

A panel the player can open at any time from the persistent **Ask Reuben** bar. His portrait fills the plate, because he is who you are talking to. It offers:

- **What should I be doing?** Context aware next steps based on the current state (bare fields, an empty larder, no fuel before winter, and so on).
- **How are the hands?** The collective's mood, in his words.
- **How does [system] work?** Plain help on any mechanic, on demand.
- **Nothing, carry on.** Dismiss.

The tutorial's core job (issue #20, specced separately) is to teach the player that this panel exists and to come here whenever they are lost. This section defines the surface the tutorial teaches.

---

## 6. Ask Reuben: the Reckoning alarm

The counterpart to the tutor. The player does not open this; it opens itself. When the hidden Reckoning crosses a tier boundary (Whispers to Warnings, Warnings to Walkers), the Foreman interrupts before the player continues, rendered in the night treatment, grim:

- His warning **names the omens** the player has been seeing (soured milk, crows on the rail) and states plainly that the ground has taken against something the player did, and that it will come to collect.
- **No number, ever.** The warning is entirely in his voice.
- Two responses: **heed him** (a beat that acknowledges the chance to make it right) or **press on** (which carries the line "and know that you were told").

This is the fix for the "it came out of nowhere" complaint. The player is always warned, in character, before the land collects, while the Reckoning itself stays unmeasured.

**Escalation:** at low debt the omens stay ambient (dusk flavor only, no interruption). The Foreman interruption is reserved for tier crossings, so it stays rare and heavy.

---

## 7. The imagery layer

### 7.1 The plate
Every scene shows a location illustration, called a **plate** (the almanac word for a printed page illustration struck from a woodcut). The plate sits at the top of the play area inside an engraved woodcut border. Directly under it, an always visible **caption** gives the place name in the almanac hand (for example "Marrow's Cross, the town green"). The caption is UI text, not part of the image, so the place name stays readable once real art replaces the placeholder.

**Rule:** the player always sees a plate and reads a place name, every scene. A scene with no specific place uses the homestead as its default plate.

### 7.2 The speaker portrait
When a character speaks, their portrait (head, neck, shoulders) rises over the plate with a nameplate (name and role), so the player always knows who is talking. When the player is talking to Reuben, his portrait fills the plate.

### 7.3 Placeholders first
Until real art exists, both plates and portraits render as styled placeholders that describe what the image will be, drawn from the prototype's bracketed stage directions and short per character portrait notes. This lets us playtest the whole imagery layer before any art is made (issues #21, #22, #23).

### 7.4 The play screen layout (settled)
Chosen from the mockups (the visual novel stage with a woodcut plate border and the caption below):

1. Masthead (brand, theme toggle).
2. The **plate** with woodcut border; the speaker portrait rises over it when someone speaks.
3. The engraved **place name caption** under the plate.
4. The **ledger strip** (Coin, Larder, Fuel, Seed).
5. The **card** (the day's text and choices).
6. The persistent **Ask Reuben** bar.

---

## 8. How this maps to the existing issues

- **#19 UI clarity:** the Ask Reuben bar and the plain sub labels belong here.
- **#20 Tutorial:** teaches the player to Ask Reuben, and rides on the tutor surface defined in Section 5.
- **#21 setting plates, #22 speaker portraits, #23 placeholders:** this spec sets their layout and the "plate" naming.
- **#24 Art direction:** the woodcut plate and portrait treatment feed the art brief.
- **New work implied:** the Foreman model, the roster screen, per hand assignment, promotion on death, and the Reckoning alarm. These need new issues (Section 11).

---

## 9. Content and voice conventions

### 9.1 No dash punctuation (new hard rule)
No em dashes anywhere, and no hyphen used as a pause, an aside, or a connector between clauses. Use commas, periods, colons, semicolons, parentheses, or a fresh sentence instead. Ordinary hyphenated compound words (belly-filler, two-season, right-hand) are fine, because they read as normal English rather than as an AI tell. This applies to all player facing text and all project docs. The voice guide (`docs/style-guide.md`) carries the rule. Existing content (the prototype prose and the event cards) needs a scrubbing pass (Section 11).

### 9.2 The hidden layer stays hidden
The Reckoning is never a number, never a meter, never a tooltip value. It reaches the player only as omens and through the Foreman's mouth. Morale is visible; the Reckoning is not.

---

## 10. Out of scope

- The full multi year clone economy (the Vat, deeper traits, breeding) stays a later concern.
- Voice or animation for portraits.
- The exact tutorial copy and coach mark treatment (issue #20).
- The Vercel deployment, which is a later step after the tutorial and the image slot land.

---

## 11. Follow up work this spec implies

1. **A new issue for the Foreman and farmhand roster model:** the roster screen, per hand assignment, the collective voice, promotion on death, and the Reckoning alarm.
2. **A content scrub issue:** remove dash punctuation from the prototype prose and the 117 event cards, and add the rule to the voice guide.
3. The **tutorial (#20)** can then be written against the Ask Reuben tutor surface.

---

## 12. Open questions

- Does the Reckoning alarm fire at every tier crossing, or only the first time the player reaches a new tier in a run? (Proposed: the first crossing into each tier, so it stays rare.)
- Do the other hands ever speak in their own portraits during scripted beats (for example Della at Vane's wagon), or only ever through Reuben in the roster and alarm? (Proposed: scripted beats may show a hand's own portrait; the ambient collective voice is always Reuben.)
