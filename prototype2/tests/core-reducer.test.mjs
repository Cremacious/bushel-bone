import { describe, it, expect } from "vitest";
import { initialState, season } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

describe("reducer", () => {
  it("SET_THEME toggles without mutating the input", () => {
    const s = initialState(1);
    const next = reduce(s, { type: "SET_THEME", theme: "day" });
    expect(next.theme).toBe("day");
    expect(s.theme).toBe("night"); // input untouched
  });
  it("ADVANCE_WEEK rolls weeks, then seasons, then the year", () => {
    let s = initialState(1);
    for (let i = 0; i < 4; i++) s = reduce(s, { type: "ADVANCE_WEEK" });
    expect(s.week).toBe(5);
    expect(season(s)).toBe("spring");
    s = reduce(s, { type: "ADVANCE_WEEK" }); // week 5 -> next season
    expect(s.week).toBe(1);
    expect(season(s)).toBe("summer");
    for (let i = 0; i < 15; i++) s = reduce(s, { type: "ADVANCE_WEEK" }); // through winter into Year 2
    expect(s.year).toBe(2);
    expect(season(s)).toBe("spring");
  });
});
