import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";

describe("assignment", () => {
  it("SET_ROLE sets a living hand's standing role", () => {
    let s = initialState(1);
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "wood" });
    const h = s.hands.find((x) => x.id === "reuben");
    expect(h.role).toBe("wood");
  });
  it("SET_ROLE ignores an unknown or dead hand", () => {
    const s = initialState(1);
    expect(reduce(s, { type: "SET_ROLE", handId: "ghost", role: "wood" })).toBe(s);
  });
  it("SPEND_ACTION 'forage' spends the day's action point and adds food immediately", () => {
    let s = { ...initialState(1), phase: "day" };
    const before = s.larder;
    s = reduce(s, { type: "SPEND_ACTION", kind: "forage" });
    expect(s.larder).toBe(before + BALANCE.forageFood);
    expect(s.actions).toBe(BALANCE.actionsPerDay - 1);
  });
});
