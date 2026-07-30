import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";

function inDay(seed = 1) {
  let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return reduce(s, { type: "SOW" }); // phase day, day 1
}

describe("resolve day", () => {
  it("eating drains the larder by mouths × food/day", () => {
    let s = inDay();
    const before = s.larder;
    s = reduce(s, { type: "TURN_IN" });
    expect(s.larder).toBe(before - 2 * BALANCE.foodPerMouthPerDay); // 2 mouths
    expect(s.day).toBe(2);
  });
  it("a tended crop grows more than an untended one", () => {
    let s = inDay();
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" }); // note: PLANT allowed pre-day too; here just seeds a field
    // field 0 planted, field 1 planted untended:
    s = reduce(s, { type: "PLANT", fieldId: 1, crop: "potato" });
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "tend", targetFieldId: 0 });
    s = reduce(s, { type: "TURN_IN" });
    const f0 = s.fields.find((f) => f.id === 0), f1 = s.fields.find((f) => f.id === 1);
    expect(f0.progress).toBeGreaterThan(f1.progress);
    expect(f0.tended).toBe(false); // reset after the day
  });
  it("harvest of a ripe field adds food to the larder and clears the field", () => {
    let s = inDay();
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 1.0, fert: 3 }; // ripe
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "harvest", targetFieldId: 0 });
    const before = s.larder;
    s = reduce(s, { type: "TURN_IN" });
    expect(s.larder).toBeGreaterThan(before - 2 * BALANCE.foodPerMouthPerDay); // gained > it ate
    expect(s.fields.find((f) => f.id === 0).crop).toBe(null);
  });
  it("cotton needs two hands: one brings in half the crop, two bring in the whole", () => {
    // cotton yield 6 at fert 3, sale 18; one hand gets floor(6/2)=3, two get 6.
    let one = inDay();
    one.fields[0] = { ...one.fields[0], crop: "cotton", progress: 2, fert: 3 };
    one = reduce(one, { type: "ASSIGN", handId: "reuben", task: "harvest", targetFieldId: 0 });
    const c1 = one.coin;
    one = reduce(one, { type: "TURN_IN" });
    expect(one.coin - c1).toBe(3 * 18);
    expect(one.fields.find((f) => f.id === 0).crop).toBe(null);

    let two = inDay();
    two = { ...two, hands: [...two.hands, { id: "del", name: "Del", body: "average", mind: "average", task: "rest", strain: 0, morale: 4, alive: true, traits: [] }] };
    two.fields[0] = { ...two.fields[0], crop: "cotton", progress: 2, fert: 3 };
    two = reduce(two, { type: "ASSIGN", handId: "reuben", task: "harvest", targetFieldId: 0 });
    two = reduce(two, { type: "ASSIGN", handId: "del", task: "harvest", targetFieldId: 0 });
    const c2 = two.coin;
    two = reduce(two, { type: "TURN_IN" });
    expect(two.coin - c2).toBe(6 * 18); // the whole crop
  });
  it("a starving hand accrues strain and can be lost", () => {
    // Winter: burns fuel too, so an unfed, unwarmed, idle hand racks up hunger
    // (5/day) + cold (5/day) and is lost within the season's 10 days. Off "rest" so
    // restRecovery doesn't outpace hunger alone and mask the starvation entirely.
    // Standing orders persist day to day now (no re-suggestion), so "idle" only
    // needs to be set once, right after BEGIN_SEASON.
    let s = initialState(1); s.seasonIndex = 3; // winter
    s = reduce(s, { type: "BEGIN_SEASON" }); // winter skips planting -> phase "day"
    s.larder = 0;
    s.fuel = 0; // no fuel banked, so the cold bites immediately too
    s.hands[0] = { ...s.hands[0], task: "idle" };
    for (let i = 0; i < 10 && s.hands[0].alive; i++) {
      s = reduce(s, { type: "TURN_IN" });
    }
    expect(s.hands[0].alive).toBe(false); // Reuben starved (and froze)
    expect(s.log.some((l) => /Reuben/.test(l))).toBe(true);
  });
  it("resting recovers strain", () => {
    let s = inDay();
    s.hands[0] = { ...s.hands[0], strain: 40, task: "rest" };
    s = reduce(s, { type: "TURN_IN" });
    expect(s.hands[0].strain).toBeLessThan(40);
  });
  it("after day 10 the phase becomes dusk", () => {
    let s = inDay();
    for (let i = 0; i < 10; i++) s = reduce(s, { type: "TURN_IN" });
    expect(s.phase).toBe("dusk");
  });
  it("chop adds fuelPerChopDay to the fuel store", () => {
    let s = inDay();
    const before = s.fuel;
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "chop" });
    s = reduce(s, { type: "TURN_IN" });
    expect(s.fuel).toBe(before + BALANCE.fuelPerChopDay);
  });
  it("harvesting a cash crop (cotton) adds coin, not larder, and clears the field", () => {
    let s = inDay();
    s.fields[0] = { ...s.fields[0], crop: "cotton", progress: 2.0, fert: 3 }; // ripe (cotton is 2 seasons)
    s = reduce(s, { type: "ASSIGN", handId: "reuben", task: "harvest", targetFieldId: 0 });
    const beforeCoin = s.coin;
    s = reduce(s, { type: "TURN_IN" });
    expect(s.coin).toBeGreaterThan(beforeCoin);
    expect(s.fields.find((f) => f.id === 0).crop).toBe(null);
  });
  it("winter cold strains a hand when fuel runs short", () => {
    let s = initialState(1); s.seasonIndex = 3; // winter
    s = reduce(s, { type: "BEGIN_SEASON" }); // winter skips planting -> phase "day"
    s.fuel = 0;
    s.hands[0] = { ...s.hands[0], task: "idle" }; // off "rest" so recovery doesn't mask it
    s = reduce(s, { type: "TURN_IN" });
    expect(s.hands[0].strain).toBeGreaterThan(0);
    expect(s.fuel).toBe(0);
  });
  it("enough fuel avoids cold strain and drops by mouths × fuel/day", () => {
    let s = initialState(1); s.seasonIndex = 3; // winter
    s = reduce(s, { type: "BEGIN_SEASON" });
    s.fuel = 100; // plenty for the day
    s.hands[0] = { ...s.hands[0], task: "idle" };
    const before = s.fuel;
    s = reduce(s, { type: "TURN_IN" });
    expect(s.fuel).toBe(before - 2 * BALANCE.fuelPerMouthPerDay); // 2 mouths
    expect(s.hands[0].strain).toBe(0); // no cold, and the default larder covers food too
  });
  it("DO_PLAYER_ACTION 'care' recovers strain on the target hand", () => {
    let s = inDay();
    s.hands[0] = { ...s.hands[0], strain: 50, task: "idle" }; // off "rest" to isolate the care recovery
    s = reduce(s, { type: "DO_PLAYER_ACTION", kind: "care", target: "reuben" }); // applies immediately
    s = reduce(s, { type: "TURN_IN" });
    expect(s.hands[0].strain).toBe(50 - BALANCE.strain.careRecovery);
  });
  it("DO_PLAYER_ACTION 'work' tends the targeted field even with no hand assigned to it", () => {
    let s = inDay();
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    s = reduce(s, { type: "DO_PLAYER_ACTION", kind: "work", target: 0 });
    s = reduce(s, { type: "TURN_IN" });
    const f0 = s.fields.find((f) => f.id === 0);
    expect(f0.progress).toBeCloseTo(BALANCE.growthPerDay + BALANCE.tendGrowthBonus, 5);
  });
});
