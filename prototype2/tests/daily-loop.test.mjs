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
  it("TURN_IN on the last day moves to dusk", () => {
    let s = playing((s) => ({ ...s, day: BALANCE.daysPerSeason }));
    s = reduce(s, { type: "TURN_IN" });
    expect(s.phase).toBe("dusk");
  });
});

// The retired auto-run (#49) is replaced by SKIP_QUIET: an opt-in fast-forward, gated so it
// only runs genuinely quiet days and never past a beat the player should see.
describe("SKIP_QUIET (the opt-in fast-forward)", () => {
  it("advances multiple days and records how many passed, from a quiet points-spent state", () => {
    let s = playing((s) => ({ ...s, actions: 0 })); // point spent, Reuben tending the potato, nothing pressing
    expect(interrupts(s)).toEqual([]);
    s = reduce(s, { type: "SKIP_QUIET" });
    expect(s.phase).toBe("day");
    expect(s.day).toBeGreaterThan(1);                       // it passed several days
    expect(s.day).toBeLessThanOrEqual(BALANCE.daysPerSeason);
    expect(s.skipped).toBeGreaterThan(0);
  });
  it("stops at the last-day beat, not past it into dusk", () => {
    let s = playing((s) => ({ ...s, actions: 0 }));
    s = reduce(s, { type: "SKIP_QUIET" });
    expect(s.phase).toBe("day");
    expect(s.day).toBe(BALANCE.daysPerSeason); // handed back at the last-day beat
  });
  it("is a no-op while the player still has a point to spend", () => {
    const s = playing((s) => ({ ...s, actions: 1 })); // a point remains — nothing to skip
    const r = reduce(s, { type: "SKIP_QUIET" });
    expect(r).toEqual(s);
  });
  it("does not skip when a ripe crop has no field hand to bring it in", () => {
    const s = playing((s) => ({
      ...s, actions: 0,
      fields: s.fields.map((f) => (f.id === 0 ? { ...f, progress: 1 } : f)),
      hands: s.hands.map((h) => ({ ...h, role: "rest" })), // no one set to the fields
    }));
    expect(interrupts(s).some((r) => /ripe/i.test(r))).toBe(true);
    const r = reduce(s, { type: "SKIP_QUIET" });
    expect(r).toEqual(s); // the interrupt holds it in place
  });
  it("does not skip when a hand has crossed Failing", () => {
    const s = playing((s) => ({ ...s, actions: 0, hands: s.hands.map((h) => ({ ...h, strain: 60 })) }));
    expect(interrupts(s).some((r) => /failing/i.test(r))).toBe(true);
    const r = reduce(s, { type: "SKIP_QUIET" });
    expect(r).toEqual(s);
  });
});
