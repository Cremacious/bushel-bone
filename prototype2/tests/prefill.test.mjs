import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

describe("weekly pre-fill", () => {
  it("SOW pre-fills each hand's task from Reuben's plan", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });      // planting
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });   // one growing field
    s = reduce(s, { type: "SOW" });                                  // -> week 1
    const reuben = s.hands.find((h) => h.id === "reuben");
    expect(reuben.task).toBe("tend");
    expect(reuben.targetFieldId).toBe(0);
    expect(s.playerAction).toEqual({ kind: "work", target: 0 });
  });
  it("advancing to the next week re-fills from the new board", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    s = reduce(s, { type: "SOW" });
    s = reduce(s, { type: "RESOLVE_WEEK" }); // -> week 2, re-filled
    expect(s.hands.find((h) => h.id === "reuben").task).toBe("tend");
  });
});
