# Bushel & Bone — Content Data Schema

**Status: WRITTEN** (GitHub issue #12). The data contract for runtime content — the format event cards (#16) are authored in and the engine loads at runtime. This is the bridge between the design docs and code.

**Principles** (from CLAUDE.md working conventions):
- **Data-driven, no code in content.** An event is pure data; all logic lives in the engine. Writers never write TypeScript.
- **Declarative conditions & effects.** Gating and outcomes are expressed in a small DSL (below), not scripts.
- **YAML for authoring, loaded at runtime.** One file per event (or a folder of them); the engine parses to plain objects.
- **Deterministic.** Every roll draws from the seeded PRNG (D-021); the same seed + same choice ⇒ same result.
- **Hidden axes shown as omen, never number.** The schema *records* Reckoning/Ghost-Roll effects; the UI renders them as prose (style-guide rule), never as a value.

*Engine side (TypeScript, per the stack): a JSON Schema (or generated TS types) validates every file at build time; content that references an unknown crop/building/npc/flag fails the build. Game state stays one plain-JS object; event resolution is a pure `(state, event, choiceId, rng) => newState`.*

---

## 1. The event object

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string (kebab-case) | ✅ | Stable unique id, e.g. `sour-milk`. |
| `title` | string | ✅ | 2–4 word noun phrase (style-guide). |
| `family` | enum | ✅ | One of the 7 families (§2). |
| `severity` | enum | ✅ | `flavor` \| `minor` \| `major` \| `crisis` (§2). |
| `illustration` | string | ✅ | One-line art prompt (cross-hatched ink on aged paper, D-019). |
| `setup` | string | ✅ | 1–3 sentences, in voice. Never states the mechanic. |
| `weight` | int | – | Base draw weight; defaults to the family weight (§9). |
| `conditions` | Condition[] | – | When the event is ELIGIBLE to be drawn (ANDed). Omit = always eligible. |
| `crisis_gate` | Condition[] | – | Required for `severity: crisis` — the pre-existing vulnerability (§9 rule). |
| `recency_suppress` | int | – | Draws suppressed after firing (default 12, §9). |
| `once` | bool | – | `true` ⇒ fires at most once per lineage. Default false. |
| `on_ignore` | enum | – | `worst` (auto-resolve to worst option — required for `major`+) \| `dismiss` (flavor/minor). |
| `choices` | Choice[] | ✅¹ | 2–4 options. ¹`flavor` events may omit choices (auto-dismiss). |

### 2. Enums

- **family:** `weather` · `pests` · `wildlife` · `opportunities` · `town` · `personal` · `reckoning`
- **severity:** `flavor` (no effect) · `minor` (small swing) · `major` (real stakes, ≥2 choices) · `crisis` (run-threatening, state-gated)
- **reckoning_tier:** `whispers` · `warnings` · `walkers` · `vigil_fails` · `proper`
- **reputation_band:** `pariah` (0–19) · `suspect` (20–39) · `neutral` (40–69) · `pillar` (70–100)
- **relationship_tier:** `cold` · `neutral` · `warm` · `bonded`
- **vane_truth:** `spy` · `third_vane` · `vessel`
- **odds:** `certain` · `likely` (~75%) · `even` (~50%) · `unlikely` (~25%) · `long_shot` (~10%)  *(exact hidden; UI shows the band)*

---

## 3. The Condition DSL

A **Condition** is one predicate object. A list of conditions is **ANDed**. Boolean composition via `any` / `all` / `not`. Predicates:

```yaml
- season: Fall                      # or a list: [Spring, Fall]
- year: { min: 3 }                  # {min?, max?}
- reckoning_tier: { min: warnings } # {min?, max?} by tier order
- reputation: { max: 39 }           # {min?, max?} 0–100  (or reputation_band: suspect)
- coin: { min: 40 }
- clones: { min: 2 }                 # count of living clones
- has_building: vat                  # or a list (all present)
- has_vat: true
- relationship: { npc: old_nan, min: warm }
- vane_truth: vessel                 # only if that truth is seeded this lineage
- flag: { name: rail-came, is: true }   # world/arc flags set by other events/arcs
- field_taint: { min: 0.5 }          # any field meets it
- ghost_roll: { min: 1 }             # named dead exist
- has_item: almanac
# composition:
- any: [ <cond>, <cond> ]
- all: [ <cond>, <cond> ]
- not: <cond>
```

*Tier/band comparisons use the enum order above. Unknown names fail validation.*

---

## 4. The Choice object

```yaml
- id: turn-her-away                 # unique within the event
  text: "Turn her away."           # the stance, in voice (imperative)
  requires: [ <Condition> ]        # optional — greyed/hidden if unmet
  cost: { coin: 40, labor: 1.0 }   # optional — also enforced as affordability
  # THEN either a direct result, OR probabilistic outcomes:
  result: "She goes back into the cold. The dog won't cross the yard where she stood."
  effects: [ <Effect> ]
  # --- OR ---
  outcomes:
    - odds: likely
      result: "..."
      effects: [ <Effect> ]
    - odds: unlikely
      result: "..."
      effects: [ <Effect> ]
```

- `requires` gates **availability** (unmet ⇒ option greyed with the reason, or hidden).
- `cost` is spent on selection; insufficient resources auto-gate the option.
- Exactly one of `result`+`effects` (deterministic) **or** `outcomes` (seeded roll over weighted branches; `odds` are the display bands, resolved against the PRNG).

---

## 5. The Effect DSL

A list of effect objects applied on resolution. Targets: `household` (all clones), `this` (the clone/field the event is about), or a named ref.

```yaml
- coin: -40
- food: +10
- fuel: -5
- seed: { crop: wheat, amount: +8 }
- morale: { target: household, amount: -10 }     # or target: this
- reputation: -3
- reckoning: +6                                   # hidden — rendered as omen only
- ghost_roll: { add: this }                       # or { remove: 1 } (a funeral)
- taint: { field: this, amount: +0.5 }
- crop: { field: this, blight: true }             # wipe growth (Walker blight)
- clone: { add: { archetype: grower, body: average, mind: sharp } }
- clone: { kill: this, disposal: unmarked }       # disposal ∈ marked|unmarked|sell|vat|funeral
- clone: { take: this }                            # the Marrow takes one (no disposal)
- item: { grant: almanac }
- flag: { set: rail-came, to: true }
- unlock: { venue: rail_depot }                   # or { building: ... } | { arc: ... } | { archetype: ... }
- relationship: { npc: old_nan, delta: +1 }
- contract: { offer: crop_supply }                # surfaces a contract (§7)
```

*Every ledger axis in the Mechanics Bible (§1–§6) has an effect verb here; the engine applies them against the plain-JS state.*

---

## 6. Draw & pacing metadata (the §9 engine reads these)

- `weight` + `conditions` decide **eligibility & likelihood** in the family draw (§9 weighting). The **Reckoning-tier weight bonus** (0/10/30/50/70) is applied by the engine to `family: reckoning` events, not authored per-card.
- `crisis_gate` (required for `severity: crisis`) is the vulnerability that must already exist — the engine will not draw a crisis whose gate is unmet (the "no bolt-from-the-blue" rule, §9 / H-28).
- `recency_suppress` and `once` prevent repetition.
- `on_ignore: worst` makes a Major/Crisis auto-resolve to its worst option if dismissed (§9).

---

## 7. Example events (validate against the schema)

### `events/reckoning/sour-milk.yaml`
```yaml
id: sour-milk
title: "Sour"
family: reckoning
severity: minor
illustration: "a scalded tin pail, the milk in it turned grey; a crow on the rail behind"
setup: >
  The morning milk came out of the pail already turned, though the cow is sound and
  the pail was scalded clean. Josephine won't say it. She only sets it down by the
  east field, where the ground stays warm through the frost, and goes back to her work.
weight: 8
conditions:
  - reckoning_tier: { min: warnings }
  - ghost_roll: { min: 1 }
recency_suppress: 12
on_ignore: dismiss
choices:
  - id: pour-out
    text: "Pour it out and say nothing."
    result: "You pour it in the yard. The dog won't cross where it soaked in."
  - id: ask-nan
    text: "Ask Old Nan what it means."
    requires:
      - relationship: { npc: old_nan, min: warm }
    result: >
      She doesn't look up from her mending. "Milk sours where the ground's started
      listening," she says. "You've laid something down it didn't care for."
  - id: ignore
    text: "It's nothing. Work the day."
    result: "You work the day. The pail sours again at dusk."
    effects:
      - morale: { target: household, amount: -1 }
```

### `events/opportunities/vanes-wagon.yaml`
```yaml
id: vanes-wagon
title: "Vane's Wagon"
family: opportunities
severity: major
illustration: "a painted wagon halted on the dusk road, one lantern lit, a tarp over shapes"
setup: >
  Ambrose Vane's wagon stops at your gate as the light goes. "A Grower," he says, warm
  as a parlor. "Sharp-minded, strong-backed. I'd not sell her cheap to just anyone — but
  you've a kind look about you." Under the tarp, something shifts, and is still.
weight: 18
conditions:
  - year: { min: 1 }
recency_suppress: 20
on_ignore: dismiss
choices:
  - id: buy
    text: "Buy her. (110 marks)"
    cost: { coin: 110 }
    result: "She steps down when he says her name. She has a name; he tells it to you like a courtesy, and moves straight to the price."
    effects:
      - clone: { add: { archetype: grower, body: average, mind: sharp } }
  - id: haggle
    text: "Haggle."
    requires:
      - relationship: { npc: ambrose_vane, min: warm }
    cost: { coin: 100 }
    result: '"For you — a hundred, and you didn''t rob me, understand." (100 marks)'
    effects:
      - clone: { add: { archetype: grower, body: average, mind: sharp } }
  - id: decline
    text: "Not tonight."
    result: '"Another season, then. The ground''s only getting quicker." He tips his hat, and the wagon rolls on into the dark.'
```

### `events/reckoning/she-comes-back.yaml`
```yaml
id: she-comes-back
title: "She Comes Back to the Rows"
family: reckoning
severity: crisis
illustration: "a figure standing among the night barley, faced away, where a field was buried into"
setup: >
  You put her in the east field in the spring — unmarked, to spare the forty marks and
  the day of work. Tonight she is standing in it. She is not doing anything. She is only
  standing where you left her, in the rows, faced away, as though waiting for the morning's task.
weight: 12
crisis_gate:
  - reckoning_tier: { min: walkers }
  - ghost_roll: { min: 1 }
recency_suppress: 8
on_ignore: worst
choices:
  - id: name-her
    text: "Give her the naming now. (40 marks, a rest day)"
    cost: { coin: 40, rest_day: true }
    result: "Grange comes and speaks her name over the ground until dawn. The field is quiet after. It is not forgiveness. It is a debt paid late."
    effects:
      - reckoning: -8
      - ghost_roll: { remove: 1 }
      - morale: { target: household, amount: +4 }
  - id: bar-the-doors
    text: "Bar the doors and wait for light."
    result: "At dawn the barley is trampled flat in a wide ring, and she is gone back down. The household does not speak of it. She will come again."
    effects:
      - crop: { field: this, blight: true }
      - morale: { target: household, amount: -8 }
  - id: speak
    text: "Go out and speak to her."
    requires:
      - relationship: { npc: old_nan, min: bonded }
    outcomes:
      - odds: even
        result: "[a truth of the Marrow surfaces — see reveal-pacing]"
        effects:
          - flag: { set: marrow-truth-glimpsed, to: true }
      - odds: even
        result: "She turns. You do not sleep again that season."
        effects:
          - morale: { target: household, amount: -10 }
```

---

## 8. Other content types (same pattern)

Events are the richest schema; the same **data-driven, validated-YAML** approach extends to the rest (each gets its own small schema, out of scope for #12 but noted):
- **crops / buildings / clone-archetypes** — stat tables (the Mechanics Bible §1/§3/§8 numbers) as data, so tuning is a data edit (the balance model already treats them this way in `config.py`).
- **season arcs** — a scripted sequence of gated event refs (Setup/Escalation/Climax) with branch flags (Part 4).
- **npcs** — relationship tracks, gated services, dialogue sets (Part 2 / #16).

## Cross-references
- Card grammar & the 7 families / 4 severities: **Mechanics Bible §9** and **`docs/style-guide.md`**.
- Ledger axes the effects touch: **Mechanics Bible §1–§6**.
- Seeded determinism: **D-021**.
- **Unblocks #16** — the ~120-card event library is authored against this schema.
