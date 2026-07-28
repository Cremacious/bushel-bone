import { describe, it, expect } from "vitest";
import { initialState, season, livingHands, WEEKS_PER_SEASON } from "../src/core/state.js";

describe("initial state", () => {
  it("starts a Year-1 spring homestead with Reuben and the four resources", () => {
    const s = initialState(123, "Mackall");
    expect(s.year).toBe(1);
    expect(season(s)).toBe("spring");
    expect(s.week).toBe(1);
    expect(WEEKS_PER_SEASON).toBe(5);
    expect(s.coin).toBe(100);
    expect(s.larder).toBe(80);
    expect(s.seed).toBe(20); // planting-seed resource, distinct from the rng seed
    expect(s.rngSeed).toBe(123); // the original rng seed survives, unshadowed
    expect(livingHands(s).map((h) => h.name)).toEqual(["Reuben"]);
    expect(s.lineageName).toBe("Mackall");
  });
  it("is JSON-serializable (no functions/cycles)", () => {
    const s = initialState(1);
    expect(() => JSON.parse(JSON.stringify(s))).not.toThrow();
  });
});
