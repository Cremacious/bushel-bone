import { describe, it, expect } from "vitest";
import { CROPS, ripe, dailyGrowth } from "../src/core/crops.js";

describe("crops", () => {
  it("defines staple and cash tiers with the fields the loop needs", () => {
    expect(CROPS.potato).toMatchObject({ tier: "staple", seasons: 1, food: expect.any(Number) });
    expect(CROPS.cotton).toMatchObject({ tier: "cash", food: 0, sale: expect.any(Number) });
  });
  it("ripe() is true once progress reaches the crop's season count", () => {
    expect(ripe({ crop: "potato", progress: 1.0 })).toBe(true);
    expect(ripe({ crop: "wheat", progress: 1.0 })).toBe(false); // wheat is 2 seasons
    expect(ripe({ crop: null, progress: 5 })).toBe(false);
  });
  it("dailyGrowth adds a base step, a tended bonus, and the weather modifier", () => {
    const base = dailyGrowth({ crop: "potato", tended: false }, { grow: 0 });
    const tended = dailyGrowth({ crop: "potato", tended: true }, { grow: 0 });
    const rainy = dailyGrowth({ crop: "potato", tended: false }, { grow: 0.1 });
    expect(tended).toBeGreaterThan(base);
    expect(rainy).toBeGreaterThan(base);
    expect(dailyGrowth({ crop: null, tended: false }, { grow: 0 })).toBe(0);
  });
});
