import { describe, it, expect } from "vitest";
import { DAYS_PER_SEASON } from "../src/core/state.js";
import { initialState } from "./helpers/no-events-state.mjs";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";

describe("phase flow", () => {
  it("brief → planting in a growing season, brief → day in winter", () => {
    const spring = reduce(initialState(1), { type: "BEGIN_SEASON" });
    expect(spring.phase).toBe("planting");
    const w = initialState(1); w.seasonIndex = 3; // winter
    expect(reduce(w, { type: "BEGIN_SEASON" }).phase).toBe("day");
  });
  it("SOW lands on the day-1 opening beat; CONTINUE then runs the season to its last day", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "SOW" });
    expect(s.phase).toBe("day");
    expect(s.day).toBe(1); // the guaranteed opening beat, not fast-forwarded
    // Nothing is planted to interrupt, so the first CONTINUE carries straight to the last-day beat.
    s = reduce(s, { type: "CONTINUE" });
    expect(s.phase).toBe("day");
    expect(s.day).toBe(DAYS_PER_SEASON);
  });
});

describe("daily state shape", () => {
  it("starts on day 1 with a full season action budget", () => {
    const s = initialState(1);
    expect(s.day).toBe(1);
    expect(s.seasonActionsLeft).toBe(BALANCE.seasonActionsPerSeason);
    expect(s.phase).toBe("brief");
    expect(DAYS_PER_SEASON).toBe(10);
  });
});
