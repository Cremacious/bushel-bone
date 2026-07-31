import { describe, it, expect } from "vitest";
import { initialState } from "./helpers/no-events-state.mjs";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";
import { ODD_JOBS } from "../src/core/town.js";
import { townOffers } from "../src/core/selectors.js";

// Drive to a playing day (day 1), via BEGIN_SEASON then SOW, so the fresh-day action point
// is set the way the loop sets it. The no-events helper keeps SOW landing on the day beat.
function inDay(seed = 1) {
  let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return reduce(s, { type: "SOW" }); // phase: "day", day 1
}

describe("per-day action points", () => {
  it("balance exposes the per-day fields and drops the old season pool", () => {
    expect(BALANCE.actionsPerDay).toBe(1);
    expect(BALANCE.actionsCarryCap).toBe(2);
    expect(BALANCE.seasonActionsPerSeason).toBeUndefined();
  });

  it("a fresh season opens the day with one action point", () => {
    // via SOW
    expect(inDay(1).actions).toBe(BALANCE.actionsPerDay);
    // via BEGIN_SEASON, non-winter (planting) branch
    const planting = reduce(initialState(1), { type: "BEGIN_SEASON" });
    expect(planting.actions).toBe(BALANCE.actionsPerDay);
    // via BEGIN_SEASON, winter branch (auto-runs to the day)
    let w = { ...initialState(1), seasonIndex: 3 };
    w = reduce(w, { type: "BEGIN_SEASON" });
    expect(w.actions).toBe(BALANCE.actionsPerDay);
  });
});

describe("spending action points", () => {
  it("SPEND_ACTION decrements by one and is refused at zero", () => {
    let s = inDay(1);
    expect(s.actions).toBe(1);
    s = reduce(s, { type: "SPEND_ACTION", kind: "forage" });
    expect(s.actions).toBe(0);
    const spent = reduce(s, { type: "SPEND_ACTION", kind: "forage" });
    expect(spent).toEqual(s); // no-op at 0
  });

  it("VISIT spends one point and is refused at zero", () => {
    let s = inDay(42);
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.actions).toBe(0);
    // back to the day, still no points: another real visit is refused
    let dry = { ...inDay(42), actions: 0 };
    expect(reduce(dry, { type: "VISIT", npc: "crake" })).toEqual(dry);
  });

  it("ACCEPT_JOB spends one point and is refused at zero", () => {
    let s = inDay(42);
    const job = townOffers(s).jobs[0];
    const after = reduce(s, { type: "ACCEPT_JOB", id: job.id });
    expect(after.actions).toBe(0);
    const noPts = { ...s, actions: 0 };
    expect(reduce(noPts, { type: "ACCEPT_JOB", id: job.id })).toEqual(noPts);
  });

  it("HIRE costs one point (day phase) and is refused with none left", () => {
    let s = { ...inDay(1), coin: 500, cloneRevealed: true };
    const n0 = s.hands.length;
    s = reduce(s, { type: "HIRE" });
    expect(s.hands.length).toBe(n0 + 1);
    expect(s.actions).toBe(0);
    const noPts = { ...inDay(1), coin: 500, actions: 0 };
    expect(reduce(noPts, { type: "HIRE" })).toEqual(noPts); // refused with no point
  });
});

describe("daily replenishment and carry cap", () => {
  // A calm day that resolves cleanly and advances (no events via the helper).
  it("an unspent day carries +1 to the next day, up to the cap", () => {
    let s = inDay(1);
    expect(s.actions).toBe(1);
    // spend nothing; resolve the day -> next day gains a point (1 + 1 = 2, at the cap)
    s = reduce(s, { type: "TURN_IN" });
    expect(s.day).toBe(2);
    expect(s.actions).toBe(2);
  });

  it("the carry is clamped at actionsCarryCap (2 + 1 stays 2)", () => {
    let s = { ...inDay(1), actions: 2 };
    s = reduce(s, { type: "TURN_IN" });
    expect(s.day).toBe(2);
    expect(s.actions).toBe(BALANCE.actionsCarryCap); // clamped, not 3
  });

  it("spending to zero refills to one the next day", () => {
    let s = { ...inDay(1), actions: 2 };
    s = reduce(s, { type: "SPEND_ACTION", kind: "forage" });
    s = reduce(s, { type: "SPEND_ACTION", kind: "forage" });
    expect(s.actions).toBe(0);
    s = reduce(s, { type: "TURN_IN" });
    expect(s.actions).toBe(1); // 0 + 1
  });
});
