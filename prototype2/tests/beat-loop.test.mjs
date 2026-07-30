import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { interrupts } from "../src/core/selectors.js";

function sow(mutate) {
  let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
  s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
  if (mutate) s = mutate(s);
  return reduce(s, { type: "SOW" });
}

describe("the beat loop", () => {
  it("SOW runs forward and stops at the first beat (past day 1) or the season's end", () => {
    const s = sow();
    expect(s.phase === "day" ? interrupts(s).length > 0 : s.phase === "dusk").toBe(true);
    expect(s.day).toBeGreaterThan(1);
  });
  it("SOW resets the season action pool", () => {
    const s = sow();
    expect(s.seasonActionsLeft).toBe(5);
  });
  it("CONTINUE advances past the current beat toward the next or dusk", () => {
    let s = sow();
    const d0 = s.day, p0 = s.phase;
    if (s.phase === "day") s = reduce(s, { type: "CONTINUE" });
    expect(s.day >= d0).toBe(true);
    expect(["day", "dusk"]).toContain(s.phase);
    // it made progress: either advanced a day or reached dusk
    expect(s.day > d0 || s.phase === "dusk" || p0 === "dusk").toBe(true);
  });
  it("repeated CONTINUE closes the season into dusk", () => {
    let s = sow();
    for (let i = 0; i < 15 && s.phase === "day"; i++) s = reduce(s, { type: "CONTINUE" });
    expect(s.phase).toBe("dusk");
  });
});
