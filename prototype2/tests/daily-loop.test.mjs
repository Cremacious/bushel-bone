import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { interrupts } from "../src/core/selectors.js";

// Drive to the playing "day" phase with a ripe field to check the fast-forward stopper.
function playing(mutate) {
  let s = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
  s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
  s = reduce(s, { type: "SOW" });
  // Task 3 runs before the reducer's daily phase machine (Task 4); normalize to the
  // day phase so interrupts() can be unit-tested in isolation.
  s = { ...s, phase: "day", day: s.day || 1 };
  return mutate ? mutate(s) : s;
}

describe("interrupts()", () => {
  it("is empty on a calm early day", () => {
    expect(interrupts(playing())).toEqual([]);
  });
  it("flags a ripe crop that no one is set to harvest", () => {
    const s = playing((s) => ({ ...s, fields: s.fields.map((f) => f.id === 0 ? { ...f, progress: 1 } : f) }));
    expect(interrupts(s).some((r) => /ripe/i.test(r))).toBe(true);
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
