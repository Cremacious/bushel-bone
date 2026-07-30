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
  it("TURN_IN rolls days to dusk, then END_SEASON advances the season", () => {
    let s = initialState(1);
    s = reduce(s, { type: "BEGIN_SEASON" });
    if (s.phase === "planting") s = reduce(s, { type: "SOW" });
    expect(s.phase).toBe("day");
    expect(season(s)).toBe("spring");
    for (let i = 0; i < 9; i++) s = reduce(s, { type: "TURN_IN" });
    expect(s.phase).toBe("day");
    expect(s.day).toBe(10);
    const before = { day: s.day, seasonIndex: s.seasonIndex, phase: s.phase };
    const next = reduce(s, { type: "TURN_IN" }); // last day -> dusk
    expect(s.day).toBe(before.day);
    expect(s.seasonIndex).toBe(before.seasonIndex);
    expect(s.phase).toBe(before.phase); // input untouched
    s = next;
    expect(s.phase).toBe("dusk");
    s = reduce(s, { type: "END_SEASON" });
    expect(s.seasonIndex).toBe(1);
    expect(season(s)).toBe("summer");
    expect(s.phase).toBe("brief");
    expect(s.day).toBe(1);
  });
});
