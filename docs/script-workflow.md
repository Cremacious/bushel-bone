# Editing the game's script

All of the game's written dialogue lives in one screenplay file:
[`content/script.yaml`](../content/script.yaml). Every scripted beat, systemic
event, and the year-end verdict reads its prose from there (issue #46). NPC and
location names come through the `{{name}}` tokens defined in
[`content/names.yaml`](../content/names.yaml) (issue #45), so renaming a
character flows into the script automatically.

Run all commands from `prototype/`.

## Change a line directly

1. Edit the line in `content/script.yaml`.
2. `npm run gen:script` — regenerates the `SCRIPT` block inside `year1.html`.
3. Reload the game (or run `npm test`).

The tests fail if you forget step 2 (`year1.html is OUT OF DATE`).

## Tighten the whole script in Word (the .docx round-trip)

For editing the writing as a whole, export it to a Word document, tighten it by
hand, and hand it back.

1. **Export:** `npm run script:docx` → writes `docs/script.docx`, a readable
   screenplay. Each line sits under a small `[scene.field]` label with names
   already filled in.
2. **Edit:** open it in Word and tighten the prose. **Do not change the
   `[...]` labels** — they are how edits are matched back. Leave any `{slot}`
   (like `{field}`) and `[your line]` alone; the game fills those in at run time.
3. **Hand it back:** give Claude the edited file and say *"update the script
   from my docx."* Claude runs `npm run script:import -- <path>`, which lists
   exactly which lines changed (old vs new, with the stable id), then applies
   each change into `content/script.yaml` — preserving the `{{name}}` tokens and
   any inline markup (spoken lines, emphasis) that the readable Word text drops.
4. Claude runs `npm run gen:script` and the tests to confirm.

`npm run script:import` on its own reports the diff without touching anything, so
the change is always reviewed before it lands.

## What stays in code (not in the script)

The mechanical action screens — planting, crew assignment, the market, the dusk
report, and winter provisioning — are procedural UI assembled from game state,
not screenplay, so their labels stay in `year1.html`. Structural fields (which
portrait speaks, which backdrop, resource costs, effects) also stay in code.
