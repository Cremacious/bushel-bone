import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { seedBundleCost } from "../src/core/selectors.js";

describe("the seed economy", () => {
  it("planting consumes seed and is refused when short (no coin fallback)", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = { ...s, seed: 5, coin: 999, phase: "planting" };
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" }); // potato seed 6 > 5
    expect(s.fields[0].crop).toBe(null);
    s = { ...s, seed: 6 };
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    expect(s.fields[0].crop).toBe("potato");
    expect(s.seed).toBe(0);
  });
  it("BUY_SEED trades coin for a seed bundle", () => {
    let s = { ...initialState(1), coin: 100, seed: 2 };
    const cost = seedBundleCost();
    s = reduce(s, { type: "BUY_SEED" });
    expect(s.coin).toBe(100 - cost);
    expect(s.seed).toBe(12);
  });
  it("BUY_SEED is a no-op when it cannot be afforded", () => {
    let s = { ...initialState(1), coin: 0 };
    expect(reduce(s, { type: "BUY_SEED" })).toEqual(s);
  });
});
