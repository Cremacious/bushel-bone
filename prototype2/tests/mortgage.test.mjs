import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { mortgageDue } from "../src/core/selectors.js";

// Drive to winter's dusk so END_SEASON reaches settlement. Winter has no planting phase.
function atWinterDusk(seed = 1, mutate) {
  let s = initialState(seed); s.seasonIndex = 3; // winter
  s = reduce(s, { type: "BEGIN_SEASON" });       // → day phase (winter skips planting)
  for (let i = 0; i < 10; i++) s = reduce(s, { type: "TURN_IN" }); // → dusk
  return mutate ? mutate(s) : s;
}

describe("year-end settlement", () => {
  it("winter's END_SEASON goes to the settlement phase, not game-over", () => {
    let s = reduce(atWinterDusk(), { type: "END_SEASON" });
    expect(s.phase).toBe("settlement");
    expect(s.ended).toBe(false);
  });
  it("Year 1 has no payment; TURN_YEAR advances to Year 2 Spring carrying state", () => {
    let s = reduce(atWinterDusk(1, (s) => ({ ...s, coin: 100 })), { type: "END_SEASON" });
    expect(mortgageDue(s).total).toBe(0);
    s = reduce(s, { type: "TURN_YEAR" });
    expect(s.year).toBe(2);
    expect(s.seasonIndex).toBe(0);
    expect(s.phase).toBe("brief");
    expect(s.coin).toBe(100);
  });
  it("a payment is deducted; a shortfall becomes arrears + a warning (survivable)", () => {
    let s = reduce(atWinterDusk(1, (s) => ({ ...s, year: 3, coin: 10 })), { type: "END_SEASON" });
    s = reduce(s, { type: "TURN_YEAR" });
    expect(s.coin).toBe(0);
    expect(s.mortgage.arrears).toBeGreaterThan(0);
    expect(s.mortgage.warned).toBe(true);
    expect(s.ended).toBe(false);
    expect(s.year).toBe(4);
  });
  it("a full payment clears arrears and resets the warning", () => {
    let s = reduce(atWinterDusk(1, (s) => ({ ...s, year: 3, coin: 500 })), { type: "END_SEASON" });
    s = reduce(s, { type: "TURN_YEAR" });
    expect(s.mortgage.arrears).toBe(0);
    expect(s.mortgage.warned).toBe(false);
    expect(s.coin).toBe(500 - 170); // 150 payment + 20 upkeep
  });
  it("a second consecutive miss forecloses", () => {
    let s = reduce(atWinterDusk(1, (s) => ({ ...s, year: 4, coin: 0, mortgage: { balance: 600, arrears: 170, warned: true } })), { type: "END_SEASON" });
    s = reduce(s, { type: "TURN_YEAR" });
    expect(s.phase).toBe("foreclosed");
    expect(s.ended).toBe(true);
  });
});
