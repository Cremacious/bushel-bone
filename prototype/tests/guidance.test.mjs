import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("reubenGuidance", () => {
  it("tells a new player to plant when fields are bare in a planting season", () => {
    const { T } = boot();
    const g = T.reubenGuidance();
    expect(g.toLowerCase()).toMatch(/seed|plant|ground/);
  });

  it("warns about fuel when fall arrives with none laid in", () => {
    const { T } = boot();
    const S = T.getState();
    S.si = 2; S.fuel = 0;
    S.fields.forEach(f=>{ f.crop="potato"; f.progress=1; });
    expect(T.reubenGuidance().toLowerCase()).toMatch(/fuel|wood|winter|cold/);
  });

  it("falls back to a steady line when nothing is urgent", () => {
    const { T } = boot();
    const S = T.getState();
    S.fields.forEach(f=>{ f.crop="potato"; f.progress=0.5; });
    expect(typeof T.reubenGuidance()).toBe("string");
    expect(T.reubenGuidance().length).toBeGreaterThan(0);
  });
});
