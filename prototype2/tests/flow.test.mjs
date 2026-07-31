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
  it("SOW lands on the day-1 opening beat; TURN_IN advances one day at a time (no auto-run, #49)", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "SOW" });
    expect(s.phase).toBe("day");
    expect(s.day).toBe(1); // the guaranteed opening beat, not fast-forwarded
    // The primary advance is a single day now, never a run to the season's last day.
    s = reduce(s, { type: "TURN_IN" });
    expect(s.phase).toBe("day");
    expect(s.day).toBe(2);
  });

  it("SKIP_QUIET is the opt-in fast-forward: it runs the quiet season to its last day", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "SOW" });
    expect(s.day).toBe(1);
    // Spend today's point so the quiet-skip is in play, then skip: nothing is planted or
    // pressing, so it carries straight to the last-day beat and stops there.
    s = reduce(s, { type: "SPEND_ACTION", kind: "forage" });
    s = reduce(s, { type: "SKIP_QUIET" });
    expect(s.phase).toBe("day");
    expect(s.day).toBe(DAYS_PER_SEASON);
    expect(s.skipped).toBeGreaterThan(0);
  });
});

describe("daily state shape", () => {
  it("starts on day 1 with the day's action point", () => {
    const s = initialState(1);
    expect(s.day).toBe(1);
    expect(s.actions).toBe(BALANCE.actionsPerDay);
    expect(s.phase).toBe("brief");
    expect(DAYS_PER_SEASON).toBe(10);
  });
});
