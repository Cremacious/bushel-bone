import { describe, it, expect } from "vitest";
import { initialState, SEASONS, DAYS_PER_SEASON } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";
import { SCENES } from "../src/content/scenes.js";

// Event beats (reducer.maybeEvent) can now pause a running day at a scene; resolve any scene
// in the way (choose the first offered choice, then close) so a realistic playthrough keeps
// moving, same as the sim harness's structural() step (sim/policies.js).
function resolveScenes(s) {
  while (s.phase === "scene") {
    const sc = SCENES[s.scene.id];
    s = s.scene.result == null && sc && sc.choices && sc.choices.length
      ? reduce(s, { type: "CHOOSE_SCENE", choiceId: sc.choices[0] })
      : reduce(s, { type: "CLOSE_SCENE" });
  }
  return s;
}

// A cautious full-year line on the beat loop, played beat by beat with real fuel/food
// management: plant food; each beat set the crew's role by the season (field to bring the
// crops in while it's warm, wood to lay in fuel once the cold comes), and spend the season's
// own actions foraging. Starts with NO fuel (per the opening narration), so surviving winter
// genuinely requires chopping, proving both that the loop never wedges and that a sensible,
// resource-managing line survives Year 1.
describe("a full Year-1 daily playthrough", () => {
  it("plays Spring→Winter without wedging and keeps Reuben alive on a fuel-and-food-minding line", () => {
    let s = initialState(12345, "Mackall");
    s = reduce(s, { type: "BEGIN_SEASON" });
    s = resolveScenes(s);
    for (let season = 0; season < SEASONS.length; season++) {
      if (s.phase === "brief") { s = reduce(s, { type: "BEGIN_SEASON" }); s = resolveScenes(s); }
      if (s.phase === "planting") {
        s.fields.forEach((f) => { if (!f.crop) s = reduce(s, { type: "PLANT", fieldId: f.id, crop: "potato" }); });
        s = reduce(s, { type: "SOW" }); // lands on the day-1 opening beat; the loop below runs it on
        s = resolveScenes(s);
      }
      let guard = 0;
      while (s.phase === "day" && guard++ < 50) {
        const cold = s.seasonIndex >= 2; // fall/winter: banking wood matters more than one more field hand
        // Standing orders at each beat: rest a worn hand before anything else, else chop in
        // the cold seasons, else work the fields. Minding the crew's own tiredness, not just
        // the ledger, is what keeps a hand alive on the beat loop's strain track.
        s.hands.filter((h) => h.alive).forEach((h) => {
          const role = h.strain >= BALANCE.strain.wornAt ? "rest" : cold ? "wood" : "field";
          if (h.role !== role) s = reduce(s, { type: "SET_ROLE", handId: h.id, role });
        });
        // The farmer forages with whatever of the season's own actions remain, keeping the
        // larder ahead of the eating.
        if (s.seasonActionsLeft > 0) s = reduce(s, { type: "SPEND_ACTION", kind: "forage" });
        s = reduce(s, { type: "CONTINUE" }); // advance past this beat, toward the next (or dusk)
        s = resolveScenes(s); // an event beat may have interrupted CONTINUE; play through it
      }
      expect(s.phase).toBe("dusk");
      s = reduce(s, { type: "END_SEASON" });
    }
    expect(s.phase).toBe("settlement");
    expect(s.hands.find((h) => h.id === "reuben").alive).toBe(true);
    s = reduce(s, { type: "TURN_YEAR" });
    expect(s.year).toBe(2);
    expect(s.phase).toBe("brief");
    expect(s.hands.find((h) => h.id === "reuben").alive).toBe(true);
  });
});
