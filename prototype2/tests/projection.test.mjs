import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { fieldProjection, suggestPlan } from "../src/core/selectors.js";

function planted(crop, progress, fert = 3) {
  const s = reduce(initialState(1), { type: "BEGIN_SEASON" }); // spring, phase planting
  s.fields[0] = { ...s.fields[0], crop, progress, fert, tended: false };
  return { s, f: s.fields[0] };
}

describe("fieldProjection", () => {
  it("an empty field projects nothing", () => {
    const s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    expect(fieldProjection(s, s.fields[0]).crop).toBe(null);
  });
  it("a fresh 1-season crop ripens within the season and projects a food yield", () => {
    const { s, f } = planted("potato", 0);
    const p = fieldProjection(s, f);
    expect(p.ripe).toBe(false);
    expect(p.weeksToRipe).toBe(5);      // 1 season / 0.2 per week
    expect(p.when).toBe("ripens wk 5");
    expect(p.yield).toEqual({ amount: 20, kind: "food" }); // 10 units * 2 food at fert 3
  });
  it("a 2-season crop reads as ripening next season and projects a coin yield", () => {
    const { s, f } = planted("corn", 0);
    const p = fieldProjection(s, f);
    expect(p.when).toBe("ripens next season");
    expect(p.yield.kind).toBe("coin");
    expect(p.needsTwo).toBe(false);
  });
  it("a ripe field reads as ripe", () => {
    const { s, f } = planted("potato", 1);
    const p = fieldProjection(s, f);
    expect(p.ripe).toBe(true);
    expect(p.when).toBe("ripe");
  });
});

describe("suggestPlan", () => {
  function week(seed = 1) {
    let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
    return reduce(s, { type: "SOW" }); // phase week, nothing planted
  }
  it("recommends harvesting a ripe field first", () => {
    let s = week();
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 1, fert: 3 };
    const plan = suggestPlan(s);
    expect(plan.hands.reuben).toEqual({ task: "harvest", targetFieldId: 0 });
  });
  it("recommends tending a growing crop when nothing is ripe", () => {
    let s = week();
    s.fields[1] = { ...s.fields[1], crop: "potato", progress: 0.2, fert: 3 };
    const plan = suggestPlan(s);
    expect(plan.hands.reuben).toEqual({ task: "tend", targetFieldId: 1 });
  });
  it("recommends resting when there is no field work to do", () => {
    const s = week(); // nothing planted
    expect(suggestPlan(s).hands.reuben.task).toBe("rest");
  });
});
