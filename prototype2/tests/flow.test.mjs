import { describe, it, expect } from "vitest";
import { initialState, DAYS_PER_SEASON } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

describe("phase flow", () => {
  it("brief → planting in a growing season, brief → day in winter", () => {
    const spring = reduce(initialState(1), { type: "BEGIN_SEASON" });
    expect(spring.phase).toBe("planting");
    const w = initialState(1); w.seasonIndex = 3; // winter
    expect(reduce(w, { type: "BEGIN_SEASON" }).phase).toBe("day");
  });
  it("SOW moves planting → day", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "SOW" });
    expect(s.phase).toBe("day");
    expect(s.day).toBe(1);
  });
});

describe("daily state shape", () => {
  it("starts on day 1 with a full personal action budget", () => {
    const s = initialState(1);
    expect(s.day).toBe(1);
    expect(s.playerActionsLeft).toBe(2);
    expect(s.phase).toBe("brief");
    expect(DAYS_PER_SEASON).toBe(10);
  });
});
