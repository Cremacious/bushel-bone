import { describe, it, expect } from "vitest";
import { initialState, season, livingHands, DAYS_PER_SEASON } from "../src/core/state.js";
import { BALANCE } from "../src/core/balance.js";

describe("initial state", () => {
  it("starts a Year-1 spring homestead with Reuben and the four resources", () => {
    const s = initialState(123, "Mackall");
    expect(s.year).toBe(1);
    expect(season(s)).toBe("spring");
    expect(s.day).toBe(1);
    expect(DAYS_PER_SEASON).toBe(10);
    expect(s.coin).toBe(75);
    expect(s.larder).toBe(55);
    expect(s.seed).toBe(8); // planting-seed resource, distinct from the rng seed (v0.4 phase2: seed is a real coin sink)
    expect(s.rngSeed).toBe(123); // the original rng seed survives, unshadowed
    expect(livingHands(s).map((h) => h.name)).toEqual(["Reuben"]);
    expect(s.lineageName).toBe("Mackall");
  });
  it("starts the loop scaffolding: brief phase, the day's action point, home tab", () => {
    const s = initialState(1);
    expect(s.phase).toBe("brief");
    expect(s.actions).toBe(BALANCE.actionsPerDay);
    expect(s.screen).toBe("home");
  });
  it("hands start with a zero strain track and no fields are tended", () => {
    const s = initialState(1);
    expect(s.hands[0].strain).toBe(0);
    expect(s.hands[0].condition).toBeUndefined(); // condition is now derived, not stored
    expect(s.fields.every((f) => f.tended === false)).toBe(true);
  });
  it("is JSON-serializable (no functions/cycles)", () => {
    const s = initialState(1);
    expect(() => JSON.parse(JSON.stringify(s))).not.toThrow();
  });
});
