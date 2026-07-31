import { describe, it, expect } from "vitest";
import { initialState } from "./helpers/no-events-state.mjs";
import { reduce } from "../src/core/reducer.js";

function sow(mutate) {
  let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
  s = reduce(s, { type: "PLANT", fieldId: 0, crop: "potato" });
  if (mutate) s = mutate(s);
  return reduce(s, { type: "SOW" });
}

describe("the beat loop", () => {
  it("SOW lands on the guaranteed day-1 opening beat, not fast-forwarded", () => {
    const s = sow();
    expect(s.phase).toBe("day");
    expect(s.day).toBe(1);
  });
  it("CONTINUE from the day-1 beat begins the run (advances the day or reaches dusk)", () => {
    const s = reduce(sow(), { type: "CONTINUE" });
    expect(s.phase === "day" ? s.day > 1 : s.phase === "dusk").toBe(true);
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
