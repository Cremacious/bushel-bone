import { describe, it, expect } from "vitest";
import { initialState } from "./helpers/no-events-state.mjs";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";
import { CROPS, cropYield } from "../src/core/crops.js";
import { fieldCard } from "../src/render/components.js";
import { fieldProjection } from "../src/core/selectors.js";

// Day 1, constructed directly (as resolve-day.test does) so a single day's mechanics run in
// isolation, with the event/script nudges already marked seen by the no-events helper.
function inDay(seed = 1) {
  const s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return { ...s, phase: "day", day: 1, actions: BALANCE.actionsPerDay };
}

describe("tending banks care (#51)", () => {
  it("a field tended N days banks care === min(careCap, N)", () => {
    // Reuben defaults to role "field"; a single growing potato is tended each day (never ripe
    // within the run below, so care keeps accruing rather than resetting at harvest).
    let s = inDay();
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    const days = 3;
    for (let i = 0; i < days; i++) s = reduce(s, { type: "TURN_IN" });
    const f0 = s.fields.find((f) => f.id === 0);
    expect(f0.care).toBe(Math.min(BALANCE.careCap, days));
    expect(f0.crop).toBe("potato"); // still growing, not harvested
  });

  it("care never exceeds careCap however long it is tended", () => {
    let s = inDay();
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "wheat" }); // 2-season, stays growing all season
    for (let i = 0; i < BALANCE.daysPerSeason - 1; i++) s = reduce(s, { type: "TURN_IN" });
    expect(s.fields.find((f) => f.id === 0).care).toBe(BALANCE.careCap);
  });

  it("the player's own 'work' action also banks care", () => {
    let s = inDay();
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    s = reduce(s, { type: "SET_ROLE", handId: "reuben", role: "rest" }); // keep the crew off it
    s = reduce(s, { type: "SPEND_ACTION", kind: "work", target: 0 });
    s = reduce(s, { type: "TURN_IN" });
    expect(s.fields.find((f) => f.id === 0).care).toBe(1);
  });
});

describe("cropYield is the one shared formula (#51)", () => {
  it("cropYield equals the reducer's actual harvest units", () => {
    // A ripe potato with banked care; harvest routes food = units × food into the larder. The
    // larder gain (net of the day's eating, identical across both) must equal cropYield × food.
    const c = CROPS.potato;
    let s = inDay();
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 1, fert: 3, care: 4 };
    const projectedUnits = cropYield(s.fields[0]);
    const before = s.larder;
    s = reduce(s, { type: "TURN_IN" });
    const eaten = 2 * BALANCE.foodPerMouthPerDay; // 2 mouths
    const gained = s.larder - (before - eaten);
    expect(gained).toBe(projectedUnits * c.food);
  });

  it("a tended field harvests MORE than an identical untended one, and matches cropYield", () => {
    const c = CROPS.potato;
    const mk = (care) => {
      let s = inDay();
      s.fields[0] = { ...s.fields[0], crop: "potato", progress: 1, fert: 3, care };
      const before = s.larder;
      const units = cropYield(s.fields[0]);
      s = reduce(s, { type: "TURN_IN" });
      return { gain: s.larder - before, units };
    };
    const untended = mk(0);
    const tended = mk(BALANCE.careCap);
    expect(tended.gain).toBeGreaterThan(untended.gain);
    // Both ate the same, so the harvest delta is exactly the extra units × food.
    expect(tended.gain - untended.gain).toBe((tended.units - untended.units) * c.food);
    // At the cap the projection is +36% units over untended.
    expect(tended.units).toBe(Math.round(untended.units * (1 + BALANCE.careCap * BALANCE.careYieldBonus)));
  });
});

describe("care resets (#51)", () => {
  it("care returns to 0 after harvest", () => {
    let s = inDay();
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 1, fert: 3, care: 5 };
    s = reduce(s, { type: "TURN_IN" });
    const f0 = s.fields.find((f) => f.id === 0);
    expect(f0.crop).toBe(null);
    expect(f0.care).toBe(0);
  });

  it("care returns to 0 on replant", () => {
    let s = inDay();
    // A field that somehow carried care (harvest clears it, but guard the sow path directly).
    s.fields[0] = { ...s.fields[0], crop: null, care: 3, cleared: true };
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "turnip" });
    expect(s.fields.find((f) => f.id === 0).care).toBe(0);
  });
});

describe("tending is surfaced in the harvest log (#51)", () => {
  it("a tended field's harvest line notes the richer crop", () => {
    let s = inDay();
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 1, fert: 3, care: 2 };
    s = reduce(s, { type: "TURN_IN" });
    expect(s.daylog.some((l) => /richer for the tending/.test(l))).toBe(true);
  });
  it("an untended field's harvest line does not", () => {
    let s = inDay();
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 1, fert: 3, care: 0 };
    s = reduce(s, { type: "TURN_IN" });
    expect(s.daylog.some((l) => /richer for the tending/.test(l))).toBe(false);
  });
});

describe("tending is surfaced on the field card (#51)", () => {
  const st = { phase: "day", day: 1 };
  it("a growing field with care > 0 shows its tending state and a higher projection", () => {
    const tended = { id: 0, crop: "potato", progress: 0.3, fert: 3, care: 3, cleared: true };
    const untended = { ...tended, care: 0 };
    const cardT = fieldCard(tended, fieldProjection(st, tended));
    const cardU = fieldCard(untended, fieldProjection(st, untended));
    // The tended card names its banked tending; the untended one does not.
    expect(cardT.querySelector(".fc-care")).not.toBe(null);
    expect(cardT.textContent).toContain("tended 3");
    expect(cardU.querySelector(".fc-care")).toBe(null);
    // And the tended field visibly projects a bigger harvest.
    expect(fieldProjection(st, tended).yield.amount).toBeGreaterThan(fieldProjection(st, untended).yield.amount);
  });
});
