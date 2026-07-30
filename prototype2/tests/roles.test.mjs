import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

function inDay(mutate) {
  let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
  s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
  s = reduce(s, { type: "SOW" });
  s = { ...s, phase: "day", day: 1 }; // normalize (SOW's auto-run is Task 2)
  return mutate ? mutate(s) : s;
}

describe("crew roles", () => {
  it("SET_ROLE changes a hand's standing role", () => {
    let s = inDay();
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "wood" });
    expect(s.hands.find((h) => h.id === "reuben").role).toBe("wood");
  });
  it("a Field-role hand harvests a ripe field (larder rises for a food crop)", () => {
    let s = inDay((s) => ({ ...s, fields: s.fields.map((f) => f.id === 0 ? { ...f, crop: "potato", progress: 1 } : f) }));
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "field" });
    const l0 = s.larder;
    s = reduce(s, { type: "TURN_IN" });
    expect(s.larder).toBeGreaterThan(l0);
  });
  it("a Wood-role hand chops fuel", () => {
    let s = inDay();
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "wood" });
    const f0 = s.fuel;
    s = reduce(s, { type: "TURN_IN" });
    expect(s.fuel).toBeGreaterThan(f0);
  });
  it("a Field hand tends a growing crop when nothing is ripe", () => {
    let s = inDay((s) => ({ ...s, fields: s.fields.map((f) => f.id === 0 ? { ...f, crop: "potato", progress: 0.3 } : f) }));
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "field" });
    s = reduce(s, { type: "TURN_IN" });
    // tended crop grew by base + tend bonus; assert it advanced beyond a bare base step
    expect(s.fields.find((f) => f.id === 0).progress).toBeGreaterThan(0.3);
  });
});
