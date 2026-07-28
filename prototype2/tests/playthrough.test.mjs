import { describe, it, expect } from "vitest";
import { initialState, season } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { ripeFields, emptyFields } from "../src/core/selectors.js";

// A cautious auto-player: plant potatoes, harvest what's ripe, chop in fall/winter, else tend.
function autoPlay(seed) {
  let s = initialState(seed, "Mackall");
  let guard = 0;
  while (!s.ended && guard++ < 500) {
    if (s.phase === "brief") s = reduce(s, { type: "BEGIN_SEASON" });
    else if (s.phase === "planting") {
      for (const f of emptyFields(s)) s = reduce(s, { type: "PLANT", fieldId: f.id, crop: "potato" });
      s = reduce(s, { type: "SOW" });
    } else if (s.phase === "week") {
      const ripe = ripeFields(s)[0];
      const cold = season(s) === "fall" || season(s) === "winter";
      s = reduce(s, { type: "ASSIGN", handId: "reuben",
        task: ripe ? "harvest" : cold ? "chop" : "tend",
        targetFieldId: ripe ? ripe.id : s.fields.find((f) => f.crop)?.id });
      s = reduce(s, { type: "SET_PLAYER_ACTION", kind: cold ? "rest" : "work", target: s.fields.find((f) => f.crop)?.id });
      s = reduce(s, { type: "RESOLVE_WEEK" });
    } else if (s.phase === "dusk") s = reduce(s, { type: "END_SEASON" });
  }
  return s;
}

describe("year 1 playthrough", () => {
  it("reaches the year's end without wedging, for several seeds", () => {
    for (const seed of [1, 7, 42, 99]) {
      const s = autoPlay(seed);
      expect(s.ended).toBe(true);
      expect(s.phase).toBe("yearend");
      expect(s.year).toBe(1);
    }
  });
  it("a fed, well-managed cautious line keeps Reuben alive to spring", () => {
    const s = autoPlay(7);
    expect(s.hands.find((h) => h.id === "reuben").alive).toBe(true);
  });
});
