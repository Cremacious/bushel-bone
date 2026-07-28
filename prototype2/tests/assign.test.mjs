import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

describe("assignment", () => {
  it("ASSIGN sets a living hand's weekly task (with an optional field target)", () => {
    let s = initialState(1);
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "tend", targetFieldId: 0 });
    const h = s.hands.find((x) => x.id === "reuben");
    expect(h.task).toBe("tend");
    expect(h.targetFieldId).toBe(0);
  });
  it("ASSIGN ignores an unknown or dead hand", () => {
    const s = initialState(1);
    expect(reduce(s, { type: "ASSIGN", handId: "ghost", task: "chop" })).toBe(s);
  });
  it("SET_PLAYER_ACTION records the player's own week", () => {
    let s = reduce(initialState(1), { type: "SET_PLAYER_ACTION", kind: "work", target: 0 });
    expect(s.playerAction).toEqual({ kind: "work", target: 0 });
  });
});
