import { describe, it, expect } from "vitest";
import { initialState, SEASONS, DAYS_PER_SEASON } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

// A cautious full-year line on the daily cadence: plant food, let the days run, harvest,
// turn the season. Proves the loop never wedges and a sensible line survives Year 1.
describe("a full Year-1 daily playthrough", () => {
  it("plays Spring→Winter without wedging and keeps Reuben alive on a cautious line", () => {
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
        s.fields.forEach((f) => {
          if (f.crop && f.progress >= 1) {
            s.hands.filter((h) => h.alive).forEach((h) => { s = reduce(s, { type: "ASSIGN", handId: h.id, task: "harvest", targetFieldId: f.id }); });
          }
        });
        const before = s.day;
        s = reduce(s, { type: "RUN_DAYS" });
        if (s.phase === "day" && s.day === before) s = reduce(s, { type: "TURN_IN" });
      }
      expect(s.phase).toBe("dusk");
      s = reduce(s, { type: "END_SEASON" });
    }
    expect(s.phase).toBe("yearend");
    expect(s.hands.find((h) => h.id === "reuben").alive).toBe(true);
  });
});
