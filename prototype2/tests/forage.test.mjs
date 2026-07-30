import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";
import { yearNeeds, suggestPlan } from "../src/core/selectors.js";

// Day 1, constructed directly rather than via SOW (which now auto-runs to the first beat) so
// these tests can exercise a single day's mechanics in isolation.
function inDay(seed = 1) {
  const s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return { ...s, phase: "day", day: 1, seasonActionsLeft: BALANCE.seasonActionsPerSeason };
}

describe("forage", () => {
  it("a hand set to forage adds food to the larder (net of the day's eating)", () => {
    let s = inDay();
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "forage" });
    const before = s.larder;
    s = reduce(s, { type: "TURN_IN" });
    // gained forageFood, then the household ate 2 mouths x food/day
    expect(s.larder).toBe(before + BALANCE.forageFood - 2 * BALANCE.foodPerMouthPerDay);
  });
  it("the player foraging adds food too", () => {
    let s = inDay();
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "rest" });
    const before = s.larder;
    s = reduce(s, { type: "SPEND_ACTION", kind: "forage" }); // applies immediately
    s = reduce(s, { type: "TURN_IN" });
    expect(s.larder).toBe(before + BALANCE.forageFood - 2 * BALANCE.foodPerMouthPerDay);
  });
});

describe("yearNeeds (goal foreshadowing)", () => {
  it("in spring, foreshadows the fall+winter fuel and food the household must lay in", () => {
    const s = inDay(); // spring, day 1
    const n = yearNeeds(s);
    // cold days remaining = fall(10) + winter(10) at spring start = 20; 2 mouths
    expect(n.coldDays).toBe(20);
    expect(n.fuel.need).toBe(2 * BALANCE.fuelPerMouthPerDay * 20); // 40
    expect(n.food.need).toBe(2 * BALANCE.foodPerMouthPerDay * 20); // 40
    expect(n.fuel.have).toBe(s.fuel);
  });
  it("suggestPlan sends a hand to forage when the larder will not carry the season", () => {
    let s = inDay();
    s = { ...s, larder: 2 }; // far short
    const plan = suggestPlan(s);
    expect(plan.hands.reuben.task).toBe("forage");
  });
});
