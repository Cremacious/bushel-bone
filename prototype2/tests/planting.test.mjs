import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { CROPS } from "../src/core/crops.js";

describe("planting", () => {
  it("PLANT sets a crop and spends seed only (no coin fallback)", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" }); // phase planting, seed 8
    s = { ...s, seed: 20 };
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" }); // potato seed cost 6
    expect(s.fields[0].crop).toBe("potato");
    expect(s.seed).toBe(20 - CROPS.potato.seed);
  });
  it("PLANT is a no-op if the field is taken or the seed is short, even with coin in hand", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s.seed = 2; s.coin = 999; // seed short; coin no longer covers the gap
    const before = s.fields[0].crop;
    s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
    expect(s.fields[0].crop).toBe(before); // unchanged
    expect(s.seed).toBe(2);
    expect(s.coin).toBe(999); // untouched
  });
  it("FALLOW clears a field's crop back to null", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "PLANT", fieldId: 1, crop: "turnip" });
    s = reduce(s, { type: "FALLOW", fieldId: 1 });
    expect(s.fields[1].crop).toBe(null);
  });
});
