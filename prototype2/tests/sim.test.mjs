import { describe, it, expect } from "vitest";
import { simulate } from "../sim/run.js";
import { optimal, normal, sloppy } from "../sim/policies.js";

describe("the economy curve (sim on the real core)", () => {
  it("the harness runs a full multi-year game without wedging", () => {
    const r = simulate(optimal, { maxYears: 4 });
    expect(r.endYear).toBeGreaterThanOrEqual(2); // it advanced past year 1
    expect(Array.isArray(r.rows)).toBe(true);
  });
  it("optimal play survives four years without foreclosing", () => {
    const r = simulate(optimal, { maxYears: 4 });
    expect(r.foreclosed).toBe(false);
  });
  it("sloppy play struggles more than optimal", () => {
    const opt = simulate(optimal, { maxYears: 5 });
    const slop = simulate(sloppy, { maxYears: 5 });
    expect(slop.survivedYears).toBeLessThanOrEqual(opt.survivedYears);
    expect(slop.coin).toBeLessThanOrEqual(opt.coin + 1);
  });
});
