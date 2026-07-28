import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";

function inWeek(seed = 1) {
  let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return reduce(s, { type: "SOW" }); // phase week, week 1
}

describe("resolve week", () => {
  it("eating drains the larder by mouths × food/week", () => {
    let s = inWeek();
    const before = s.larder;
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.larder).toBe(before - 2 * BALANCE.foodPerMouthPerWeek); // 2 mouths
    expect(s.week).toBe(2);
  });
  it("a tended crop grows more than an untended one", () => {
    let s = inWeek();
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" }); // note: PLANT allowed pre-week too; here just seeds a field
    // field 0 planted, field 1 planted untended:
    s = reduce(s, { type: "PLANT", fieldId: 1, crop: "potato" });
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "tend", targetFieldId: 0 });
    s = reduce(s, { type: "RESOLVE_WEEK" });
    const f0 = s.fields.find((f) => f.id === 0), f1 = s.fields.find((f) => f.id === 1);
    expect(f0.progress).toBeGreaterThan(f1.progress);
    expect(f0.tended).toBe(false); // reset after the week
  });
  it("harvest of a ripe field adds food to the larder and clears the field", () => {
    let s = inWeek();
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 1.0, fert: 3 }; // ripe
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "harvest", targetFieldId: 0 });
    const before = s.larder;
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.larder).toBeGreaterThan(before - 2 * BALANCE.foodPerMouthPerWeek); // gained > it ate
    expect(s.fields.find((f) => f.id === 0).crop).toBe(null);
  });
  it("a starving hand accrues strain and can be lost", () => {
    let s = inWeek();
    s.larder = 0;
    // Off "rest" so restRecovery (18/wk) doesn't outpace hungerPerWeek (12/wk) and mask
    // the starvation entirely; an idle, unfed hand should still be able to starve.
    s.hands[0] = { ...s.hands[0], task: "idle" };
    for (let i = 0; i < 12 && s.hands[0].alive; i++) s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.hands[0].alive).toBe(false); // Reuben starved
    expect(s.log.some((l) => /Reuben/.test(l))).toBe(true);
  });
  it("resting recovers strain", () => {
    let s = inWeek();
    s.hands[0] = { ...s.hands[0], strain: 40, task: "rest" };
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.hands[0].strain).toBeLessThan(40);
  });
  it("after week 5 the phase becomes dusk", () => {
    let s = inWeek();
    for (let i = 0; i < 5; i++) s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.phase).toBe("dusk");
  });
});
