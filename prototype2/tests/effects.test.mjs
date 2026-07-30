import { describe, it, expect } from "vitest";
import { actionEffects, playerActionEffects, tirednessAdvice } from "../src/core/selectors.js";

describe("action effect tags", () => {
  it("tags crew tasks with gains and the tiredness cost", () => {
    expect(actionEffects("chop").some((e) => /Wood/.test(e.label) && e.valence === "good")).toBe(true);
    expect(actionEffects("chop").some((e) => /Tiredness/.test(e.label) && e.valence === "bad")).toBe(true);
    expect(actionEffects("rest").some((e) => /Tiredness/.test(e.label) && e.valence === "good")).toBe(true);
  });
  it("tags player actions", () => {
    expect(playerActionEffects("forage").some((e) => /Food/.test(e.label))).toBe(true);
  });
  it("gives a plain tiredness verdict per condition", () => {
    expect(tirednessAdvice({ strain: 0, alive: true })).toMatch(/fine/i);
    expect(tirednessAdvice({ strain: 30, alive: true })).toMatch(/soon/i);
    expect(tirednessAdvice({ strain: 60, alive: true })).toMatch(/now/i);
  });
});
