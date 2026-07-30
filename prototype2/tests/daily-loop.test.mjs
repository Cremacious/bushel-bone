import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { interrupts } from "../src/core/selectors.js";
import { BALANCE } from "../src/core/balance.js";

// Drive to the playing "day" phase with a ripe field to check the fast-forward stopper.
function playing(mutate) {
  let s = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
  s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
  s = reduce(s, { type: "SOW" }); // phase: day, day 1
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

describe("daily phase machine", () => {
  it("SOW enters the day phase on day 1 with a full action budget", () => {
    const s = playing();
    expect(s.phase).toBe("day");
    expect(s.day).toBe(1);
    expect(s.playerActionsLeft).toBe(BALANCE.playerActionsPerDay);
  });
  it("DO_PLAYER_ACTION forage adds food and spends one action", () => {
    let s = playing();
    const before = s.larder;
    s = reduce(s, { type: "DO_PLAYER_ACTION", kind: "forage" });
    expect(s.larder).toBe(before + BALANCE.forageFood);
    expect(s.playerActionsLeft).toBe(BALANCE.playerActionsPerDay - 1);
  });
  it("DO_PLAYER_ACTION is a no-op when no actions remain", () => {
    let s = playing();
    s = { ...s, playerActionsLeft: 0 };
    const r = reduce(s, { type: "DO_PLAYER_ACTION", kind: "forage" });
    expect(r).toEqual(s);
  });
  it("TURN_IN advances the day, resolves labor, and refills the action budget", () => {
    let s = playing((s) => ({ ...s, hands: s.hands.map((h) => ({ ...h, task: "chop" })) }));
    s = reduce(s, { type: "DO_PLAYER_ACTION", kind: "forage" });
    const fuelBefore = s.fuel;
    s = reduce(s, { type: "TURN_IN" });
    expect(s.day).toBe(2);
    expect(s.playerActionsLeft).toBe(BALANCE.playerActionsPerDay); // refilled
    expect(s.fuel).toBe(fuelBefore + BALANCE.fuelPerChopDay);      // Reuben chopped
  });
  it("RUN_DAYS fast-forwards calm days and stops on an interrupt", () => {
    let s = playing((s) => ({ ...s, hands: s.hands.map((h) => ({ ...h, task: "tend", targetFieldId: 0 })) }));
    s = reduce(s, { type: "RUN_DAYS" });
    expect(s.phase).toBe("day");
    expect(s.day).toBeLessThanOrEqual(BALANCE.daysPerSeason);
  });
  it("TURN_IN on the last day moves to dusk", () => {
    let s = playing((s) => ({ ...s, day: BALANCE.daysPerSeason }));
    s = reduce(s, { type: "TURN_IN" });
    expect(s.phase).toBe("dusk");
  });
});
