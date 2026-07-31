import { describe, it, expect } from "vitest";
import { initialState } from "./helpers/no-events-state.mjs";
import { reduce } from "../src/core/reducer.js";
import { interrupts } from "../src/core/selectors.js";
import { BALANCE } from "../src/core/balance.js";

// Drive to the playing "day" phase, day 1, with a growing (not yet ripe) field, constructed
// directly rather than via SOW (which now auto-runs to the first beat, and with only one
// field-role hand would harvest this very potato well before day 1 could be observed).
function playing(mutate) {
  let s = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
  s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
  s = { ...s, phase: "day", day: 1, actions: BALANCE.actionsPerDay };
  return mutate ? mutate(s) : s;
}

describe("interrupts()", () => {
  it("is empty on a calm early day", () => {
    expect(interrupts(playing())).toEqual([]);
  });
  it("flags a ripe crop when no field-role hand is left to bring it in", () => {
    const s = playing((s) => ({
      ...s,
      fields: s.fields.map((f) => (f.id === 0 ? { ...f, progress: 1 } : f)),
      hands: s.hands.map((h) => ({ ...h, role: "rest" })), // no one is set to the fields
    }));
    expect(interrupts(s).some((r) => /ripe/i.test(r))).toBe(true);
  });
  it("does not flag a ripe crop a field-role hand will bring in on its own", () => {
    const s = playing((s) => ({ ...s, fields: s.fields.map((f) => (f.id === 0 ? { ...f, progress: 1 } : f)) }));
    expect(interrupts(s).some((r) => /ripe/i.test(r))).toBe(false);
  });
  it("flags a hand who has crossed Failing", () => {
    const s = playing((s) => ({ ...s, hands: s.hands.map((h) => ({ ...h, strain: 60 })) }));
    expect(interrupts(s).some((r) => /failing/i.test(r))).toBe(true);
  });
  it("flags the last day of the season", () => {
    const s = playing((s) => ({ ...s, day: 10 }));
    expect(interrupts(s).some((r) => /last day/i.test(r))).toBe(true);
  });
});

describe("daily phase machine", () => {
  it("SPEND_ACTION forage adds food and spends the day's action point", () => {
    let s = playing();
    const before = s.larder;
    s = reduce(s, { type: "SPEND_ACTION", kind: "forage" });
    expect(s.larder).toBe(before + BALANCE.forageFood);
    expect(s.actions).toBe(BALANCE.actionsPerDay - 1);
  });
  it("SPEND_ACTION is a no-op when no action points remain", () => {
    let s = playing();
    s = { ...s, actions: 0 };
    const r = reduce(s, { type: "SPEND_ACTION", kind: "forage" });
    expect(r).toEqual(s);
  });
  it("TURN_IN advances the day, resolves labor, and renews the day's action point", () => {
    let s = playing((s) => ({ ...s, hands: s.hands.map((h) => ({ ...h, role: "wood" })) }));
    s = reduce(s, { type: "SPEND_ACTION", kind: "forage" }); // spend the day's one point (1 -> 0)
    const fuelBefore = s.fuel;
    s = reduce(s, { type: "TURN_IN" });
    expect(s.day).toBe(2);
    expect(s.actions).toBe(Math.min(BALANCE.actionsCarryCap, 0 + BALANCE.actionsPerDay)); // the new day renews a point
    expect(s.fuel).toBe(fuelBefore + BALANCE.fuelPerChopDay); // Reuben chopped
  });
  it("CONTINUE fast-forwards calm days and stops on an interrupt", () => {
    let s = playing(); // Reuben stays on "field", tending the potato
    s = reduce(s, { type: "CONTINUE" });
    expect(s.phase).toBe("day");
    expect(s.day).toBeLessThanOrEqual(BALANCE.daysPerSeason);
  });
  it("TURN_IN on the last day moves to dusk", () => {
    let s = playing((s) => ({ ...s, day: BALANCE.daysPerSeason }));
    s = reduce(s, { type: "TURN_IN" });
    expect(s.phase).toBe("dusk");
  });
});
