import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";

// v0.4: there is no per-day pre-fill anymore. A hand's role is a standing order, set once via
// SET_ROLE, and simply persists (no daily re-suggestion nag, and no reset on SOW/TURN_IN).
describe("standing roles persist", () => {
  it("a fresh hand starts on the field role by default", () => {
    const s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    expect(s.hands.find((h) => h.id === "reuben").role).toBe("field");
  });
  it("a hand's role survives SOW's auto-run into the season's first beat", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "wood" });
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    s = reduce(s, { type: "SOW" });
    expect(s.hands.find((h) => h.id === "reuben").role).toBe("wood");
  });
  it("a hand's role carries from one day to the next (no re-suggestion nag)", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    s = { ...s, phase: "day", day: 1, actions: BALANCE.actionsPerDay }; // day 1, bypassing SOW's auto-run
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "wood" });
    s = reduce(s, { type: "TURN_IN" }); // -> day 2, order carries forward
    expect(s.hands.find((h) => h.id === "reuben").role).toBe("wood");
  });
});
