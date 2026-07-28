import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

describe("phase flow", () => {
  it("brief → planting in a growing season, brief → week in winter", () => {
    const spring = reduce(initialState(1), { type: "BEGIN_SEASON" });
    expect(spring.phase).toBe("planting");
    const w = initialState(1); w.seasonIndex = 3; // winter
    expect(reduce(w, { type: "BEGIN_SEASON" }).phase).toBe("week");
  });
  it("SOW moves planting → week", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "SOW" });
    expect(s.phase).toBe("week");
    expect(s.week).toBe(1);
  });
});
