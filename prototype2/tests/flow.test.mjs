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
  it("SOW runs to the first beat (the season's last day, since nothing is planted to interrupt sooner)", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "SOW" });
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
