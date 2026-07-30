import { describe, it, expect } from "vitest";
import { initialState } from "./helpers/no-events-state.mjs";
import { reduce } from "../src/core/reducer.js";
import { BALANCE } from "../src/core/balance.js";
import { conditionOf } from "../src/core/selectors.js";

// Day 1, constructed directly (not via SOW, which auto-runs to the first beat) so a single
// day's recovery can be exercised in isolation. Mirrors resolve-day.test.mjs's inDay().
function inDay(seed = 1) {
  const s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return { ...s, phase: "day", day: 1, seasonActionsLeft: BALANCE.seasonActionsPerSeason };
}

describe("rest visibly steps a hand's condition (playtest: Rest looked like a no-op)", () => {
  it("a Failing hand on Rest recovers strain and steps toward Worn in one day", () => {
    let s = inDay();
    s.hands[0] = { ...s.hands[0], strain: 60, role: "rest" }; // Failing (50..99)
    expect(conditionOf(s.hands[0])).toBe("failing");
    s = reduce(s, { type: "TURN_IN" });
    expect(s.hands[0].strain).toBe(60 - BALANCE.strain.restRecovery); // 60 - 14 = 46
    expect(conditionOf(s.hands[0])).toBe("worn"); // the condition VISIBLY stepped in one rest day
  });

  it("the day-log names the improvement so the player SEES the rest pay off", () => {
    let s = inDay();
    s.hands[0] = { ...s.hands[0], strain: 60, role: "rest" };
    s = reduce(s, { type: "TURN_IN" });
    expect(s.daylog).toContain("Reuben rested. Failing to Worn.");
    expect(s.log).toContain("Reuben rested. Failing to Worn.");
  });

  it("a hand worked hard while unfed trends up and the day-log names the worsening", () => {
    // Winter, empty larder, no fuel: a fielding hand racks up hunger (5) + cold (5) with no
    // labor recovery, so a Steady hand crosses into Worn and the log says so.
    let s = initialState(1); s.seasonIndex = 3; // winter
    s = { ...s, phase: "day", day: 1, seasonActionsLeft: BALANCE.seasonActionsPerSeason };
    s.larder = 0; s.fuel = 0;
    s.hands[0] = { ...s.hands[0], strain: 22, role: "field" }; // Steady, just under the 25 cut
    s = reduce(s, { type: "TURN_IN" });
    expect(s.hands[0].strain).toBeGreaterThan(22);
    expect(conditionOf(s.hands[0])).toBe("worn");
    expect(s.daylog).toContain("Reuben is worn thin. Steady to Worn.");
  });

  it("SPEND_ACTION 'care' eases a Failing hand to Worn in one sit, and names it in the log", () => {
    let s = inDay();
    s.hands[0] = { ...s.hands[0], strain: 55 }; // Failing; role stays "field"
    expect(conditionOf(s.hands[0])).toBe("failing");
    s = reduce(s, { type: "SPEND_ACTION", kind: "care", target: "reuben" });
    expect(s.hands[0].strain).toBe(55 - BALANCE.strain.careRecovery); // 55 - 10 = 45
    expect(conditionOf(s.hands[0])).toBe("worn");
    expect(s.log).toContain("Reuben eased. Failing to Worn.");
  });

  it("a rest that does not cross a band shows no false condition line", () => {
    let s = inDay();
    s.hands[0] = { ...s.hands[0], strain: 40, role: "rest" }; // Worn; 40 - 14 = 26, still Worn
    s = reduce(s, { type: "TURN_IN" });
    expect(conditionOf(s.hands[0])).toBe("worn");
    expect(s.daylog.some((l) => /Reuben/.test(l))).toBe(false);
  });
});
