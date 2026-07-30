import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

describe("daily pre-fill", () => {
  it("SOW pre-fills each hand's task from Reuben's plan", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });      // planting
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });   // one growing field
    s = reduce(s, { type: "SOW" });                                  // -> day 1
    const reuben = s.hands.find((h) => h.id === "reuben");
    expect(reuben.task).toBe("tend");
    expect(reuben.targetFieldId).toBe(0);
  });
  it("standing orders persist into the next day (no re-suggestion nag)", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    s = reduce(s, { type: "SOW" });
    s = reduce(s, { type: "TURN_IN" }); // -> day 2, orders carry forward
    expect(s.hands.find((h) => h.id === "reuben").task).toBe("tend");
  });
});
