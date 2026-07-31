import { describe, it, expect } from "vitest";
import { initialState, season } from "../src/core/state.js";
import { initialState as noEventsState } from "./helpers/no-events-state.mjs";
import { reduce } from "../src/core/reducer.js";

describe("reducer", () => {
  it("SET_THEME toggles without mutating the input", () => {
    const s = initialState(1);
    const next = reduce(s, { type: "SET_THEME", theme: "day" });
    expect(next.theme).toBe("day");
    expect(s.theme).toBe("night"); // input untouched
  });
  it("TURN_IN rolls days to dusk, then END_SEASON advances the season", () => {
    // No-events state so this test exercises TURN_IN's own day-by-day mechanics without an
    // event beat interrupting the run mid-count.
    let s = noEventsState(1);
    s = reduce(s, { type: "BEGIN_SEASON" });
    if (s.phase === "planting") s = reduce(s, { type: "SOW" }); // SOW now lands on the day-1 beat
    expect(s.phase).toBe("day");
    expect(s.day).toBe(1);
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

  it("SOW lands the player on the day-1 opening beat, not a fast-forwarded day", () => {
    let s = reduce(noEventsState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "SOW" });
    expect(s.phase).toBe("day");
    expect(s.day).toBe(1);
  });

  it("a winter BEGIN_SEASON also opens on the day-1 beat (no planting to auto-run past)", () => {
    const w = { ...noEventsState(1), seasonIndex: 3 }; // winter
    const s = reduce(w, { type: "BEGIN_SEASON" });
    expect(season(s)).toBe("winter");
    expect(s.phase).toBe("day");
    expect(s.day).toBe(1);
  });

  it("CONTINUE from the day-1 beat begins the run, advancing the day", () => {
    let s = reduce(noEventsState(1), { type: "BEGIN_SEASON" });
    s = reduce(s, { type: "SOW" });
    expect(s.day).toBe(1);
    s = reduce(s, { type: "CONTINUE" });
    expect(s.phase === "day" ? s.day > 1 : s.phase === "dusk").toBe(true);
  });
});
