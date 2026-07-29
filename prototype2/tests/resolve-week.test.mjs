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
  it("cotton needs two hands: one brings in half the crop, two bring in the whole", () => {
    // cotton yield 5 at fert 3 → 5 units at 12 coin; one hand gets floor(5/2)=2, two get 5.
    let one = inWeek();
    one.fields[0] = { ...one.fields[0], crop: "cotton", progress: 2, fert: 3 };
    one = reduce(one, { type: "ASSIGN", handId: "reuben", task: "harvest", targetFieldId: 0 });
    const c1 = one.coin;
    one = reduce(one, { type: "RESOLVE_WEEK" });
    expect(one.coin - c1).toBe(2 * 12);
    expect(one.fields.find((f) => f.id === 0).crop).toBe(null);

    let two = inWeek();
    two = { ...two, hands: [...two.hands, { id: "del", name: "Del", body: "average", mind: "average", task: "rest", strain: 0, morale: 4, alive: true, traits: [] }] };
    two.fields[0] = { ...two.fields[0], crop: "cotton", progress: 2, fert: 3 };
    two = reduce(two, { type: "ASSIGN", handId: "reuben", task: "harvest", targetFieldId: 0 });
    two = reduce(two, { type: "ASSIGN", handId: "del", task: "harvest", targetFieldId: 0 });
    const c2 = two.coin;
    two = reduce(two, { type: "RESOLVE_WEEK" });
    expect(two.coin - c2).toBe(5 * 12); // the whole crop
  });
  it("a starving hand accrues strain and can be lost", () => {
    // Winter: burns fuel too, so an unfed, unwarmed, idle hand racks up hunger (12/wk)
    // + cold (12/wk) and is lost within the season's 5 weeks. Off "rest" so restRecovery
    // (18/wk) doesn't outpace hunger alone (12/wk) and mask the starvation entirely; a
    // single season's worth of RESOLVE_WEEK calls also respects the RESOLVE_WEEK "week"
    // phase guard (it no-ops past dusk), so the death has to land inside those 5 weeks.
    let s = initialState(1); s.seasonIndex = 3; // winter
    s = reduce(s, { type: "BEGIN_SEASON" }); // winter skips planting -> phase "week"
    s.larder = 0;
    // Task 4 pre-fills each hand's task from Reuben's suggested plan after every
    // RESOLVE_WEEK, so "idle" has to be re-asserted each week: otherwise the fuel-short
    // suggestion would put Reuben on "chop" after week 1, which refuels and masks the
    // cold half of this isolation.
    for (let i = 0; i < 5 && s.hands[0].alive; i++) {
      s.hands[0] = { ...s.hands[0], task: "idle" };
      s = reduce(s, { type: "RESOLVE_WEEK" });
    }
    expect(s.hands[0].alive).toBe(false); // Reuben starved (and froze)
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
  it("chop adds fuelPerChopWeek to the fuel store", () => {
    let s = inWeek();
    const before = s.fuel;
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "chop" });
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.fuel).toBe(before + BALANCE.fuelPerChopWeek);
  });
  it("harvesting a cash crop (cotton) adds coin, not larder, and clears the field", () => {
    let s = inWeek();
    s.fields[0] = { ...s.fields[0], crop: "cotton", progress: 2.0, fert: 3 }; // ripe (cotton is 2 seasons)
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "harvest", targetFieldId: 0 });
    const beforeCoin = s.coin;
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.coin).toBeGreaterThan(beforeCoin);
    expect(s.fields.find((f) => f.id === 0).crop).toBe(null);
  });
  it("winter cold strains a hand when fuel runs short", () => {
    let s = initialState(1); s.seasonIndex = 3; // winter
    s = reduce(s, { type: "BEGIN_SEASON" }); // winter skips planting -> phase "week"
    s.fuel = 0;
    s.hands[0] = { ...s.hands[0], task: "idle" }; // off "rest" so recovery doesn't mask it
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.hands[0].strain).toBeGreaterThan(0);
    expect(s.fuel).toBe(0);
  });
  it("enough fuel avoids cold strain and drops by mouths × fuel/week", () => {
    let s = initialState(1); s.seasonIndex = 3; // winter
    s = reduce(s, { type: "BEGIN_SEASON" });
    s.fuel = 100; // plenty for the week
    s.hands[0] = { ...s.hands[0], task: "idle" };
    const before = s.fuel;
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.fuel).toBe(before - 2 * BALANCE.fuelPerMouthPerWeek); // 2 mouths
    expect(s.hands[0].strain).toBe(0); // no cold, and the default larder covers food too
  });
  it("SET_PLAYER_ACTION 'care' recovers strain on the target hand", () => {
    let s = inWeek();
    s.hands[0] = { ...s.hands[0], strain: 50, task: "idle" }; // off "rest" to isolate the care recovery
    s = reduce(s, { type: "SET_PLAYER_ACTION", kind: "care", target: "reuben" });
    s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.hands[0].strain).toBe(50 - BALANCE.strain.careRecovery);
  });
  it("SET_PLAYER_ACTION 'work' tends the targeted field even with no hand assigned to it", () => {
    let s = inWeek();
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    s = reduce(s, { type: "SET_PLAYER_ACTION", kind: "work", target: 0 });
    s = reduce(s, { type: "RESOLVE_WEEK" });
    const f0 = s.fields.find((f) => f.id === 0);
    expect(f0.progress).toBeCloseTo(BALANCE.growthPerWeek + BALANCE.tendGrowthBonus, 5);
  });
});
