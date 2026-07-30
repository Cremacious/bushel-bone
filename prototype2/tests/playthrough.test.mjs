import { describe, it, expect } from "vitest";
import { initialState, SEASONS, DAYS_PER_SEASON } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

// A cautious full-year line on the daily cadence, played day by day with real fuel/food
// management: plant food; each day bring in what's ripe, lay in wood against the cold, and
// forage for the table. Starts with NO fuel (per the opening narration), so surviving winter
// genuinely requires chopping — proving both that the loop never wedges and that a sensible,
// resource-managing line survives Year 1.
describe("a full Year-1 daily playthrough", () => {
  it("plays Spring→Winter without wedging and keeps Reuben alive on a fuel-and-food-minding line", () => {
    let s = initialState(12345, "Mackall");
    s = reduce(s, { type: "BEGIN_SEASON" });
    if (s.phase === "scene") s = reduce(s, { type: "CLOSE_SCENE" });
    for (let season = 0; season < SEASONS.length; season++) {
      if (s.phase === "brief") s = reduce(s, { type: "BEGIN_SEASON" });
      if (s.phase === "planting") {
        s.fields.forEach((f) => { if (!f.crop) s = reduce(s, { type: "PLANT", fieldId: f.id, crop: "potato" }); });
        s = reduce(s, { type: "SOW" });
      }
      let guard = 0;
      while (s.phase === "day" && guard++ < 50) {
        const cold = s.seasonIndex >= 2; // fall/winter: banking wood matters
        // Standing orders for the day: harvest anything ripe, else chop in the cold seasons,
        // else tend a growing field.
        const ripeField = s.fields.find((f) => f.crop && f.progress >= 1);
        const growing = s.fields.find((f) => f.crop && f.progress < 1);
        s.hands.filter((h) => h.alive).forEach((h) => {
          const task = ripeField ? "harvest" : cold ? "chop" : growing ? "tend" : "rest";
          const targetFieldId = task === "harvest" ? ripeField.id : task === "tend" ? growing.id : undefined;
          s = reduce(s, { type: "ASSIGN", handId: h.id, task, targetFieldId });
        });
        // The farmer forages for the table each day (keeps the larder ahead of the eating).
        if (s.playerActionsLeft > 0) s = reduce(s, { type: "DO_PLAYER_ACTION", kind: "forage" });
        s = reduce(s, { type: "TURN_IN" }); // day by day, so the daily forage actually lands
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
