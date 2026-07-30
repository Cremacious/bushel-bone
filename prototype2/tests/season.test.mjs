import { describe, it, expect } from "vitest";
import { initialState, season } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

function toDusk(s) {
  s = reduce(s, { type: "BEGIN_SEASON" });
  if (s.phase === "planting") s = reduce(s, { type: "SOW" });
  for (let i = 0; i < 10; i++) s = reduce(s, { type: "TURN_IN" });
  return s; // phase dusk
}

describe("season transition", () => {
  it("END_SEASON from spring's dusk begins summer at the brief", () => {
    let s = toDusk(initialState(1));
    expect(s.phase).toBe("dusk");
    s = reduce(s, { type: "END_SEASON" });
    expect(season(s)).toBe("summer");
    expect(s.phase).toBe("brief");
  });
  it("END_SEASON from winter's dusk reaches the year-end settlement (not game-over)", () => {
    let s = initialState(1); s.seasonIndex = 3; // winter
    s = toDusk(s);
    s = reduce(s, { type: "END_SEASON" });
    expect(s.phase).toBe("settlement");
    expect(s.ended).toBe(false);
  });
});
