import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";

describe("assignment", () => {
  it("ASSIGN sets a living hand's daily task (with an optional field target)", () => {
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
  it("DO_PLAYER_ACTION 'forage' spends a player action and adds food immediately", () => {
    let s = { ...initialState(1), phase: "day" };
    const before = s.larder;
    s = reduce(s, { type: "DO_PLAYER_ACTION", kind: "forage" });
    expect(s.larder).toBe(before + BALANCE.forageFood);
    expect(s.playerActionsLeft).toBe(1);
  });
});
