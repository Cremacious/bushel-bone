import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";
import { yearNeeds, suggestPlan } from "../src/core/selectors.js";

function inWeek(seed = 1) {
  let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return reduce(s, { type: "SOW" });
}

describe("forage", () => {
  it("a hand set to forage adds food to the larder (net of the week's eating)", () => {
    let s = inWeek();
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "forage" });
    const before = s.larder;
    s = reduce(s, { type: "RESOLVE_WEEK" });
    // gained forageFood, then the household ate 2 mouths x food/week
    expect(s.larder).toBe(before + BALANCE.forageFood - 2 * BALANCE.foodPerMouthPerWeek);
  });
  it("the player foraging adds food too", () => {
    let s = inWeek();
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "rest" });
    s = reduce(s, { type: "SET_PLAYER_ACTION", kind: "forage" });
    const before = s.larder;
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.larder).toBe(before + BALANCE.forageFood - 2 * BALANCE.foodPerMouthPerWeek);
  });
});

describe("yearNeeds (goal foreshadowing)", () => {
  it("in spring, foreshadows the fall+winter fuel and food the household must lay in", () => {
    const s = inWeek(); // spring, week 1
    const n = yearNeeds(s);
    // cold weeks remaining = fall(5) + winter(5) at spring start = 10; 2 mouths
    expect(n.coldWeeks).toBe(10);
    expect(n.fuel.need).toBe(2 * BALANCE.fuelPerMouthPerWeek * 10); // 40
    expect(n.food.need).toBe(2 * BALANCE.foodPerMouthPerWeek * 10); // 60
    expect(n.fuel.have).toBe(s.fuel);
  });
  it("suggestPlan sends a hand to forage when the larder will not carry the season", () => {
    let s = inWeek();
    s = { ...s, larder: 2 }; // far short
    const plan = suggestPlan(s);
    expect(plan.hands.reuben.task).toBe("forage");
  });
});
