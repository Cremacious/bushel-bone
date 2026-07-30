import { describe, it, expect } from "vitest";
import { initialState, makeHand } from "../src/core/state.js";
import { conditionOf, mouths, warnings } from "../src/core/selectors.js";

describe("selectors", () => {
  it("condition track bands on strain", () => {
    expect(conditionOf({ alive: true, strain: 0 })).toBe("steady");
    expect(conditionOf({ alive: true, strain: 30 })).toBe("worn");
    expect(conditionOf({ alive: true, strain: 60 })).toBe("failing");
    expect(conditionOf({ alive: false, strain: 100 })).toBe("lost");
  });
  it("condition track boundaries land on the correct side of each cut point", () => {
    expect(conditionOf({ alive: true, strain: 24 })).toBe("steady");
    expect(conditionOf({ alive: true, strain: 25 })).toBe("worn");
    expect(conditionOf({ alive: true, strain: 49 })).toBe("worn");
    expect(conditionOf({ alive: true, strain: 50 })).toBe("failing");
    expect(conditionOf({ alive: true, strain: 99 })).toBe("failing");
    expect(conditionOf({ alive: true, strain: 100 })).toBe("lost");
  });
  it("mouths counts the farmer plus living hands", () => {
    const s = initialState(1);
    expect(mouths(s)).toBe(2); // you + Reuben
    s.hands.push(makeHand("h2", "Del"));
    expect(mouths(s)).toBe(3);
  });
  it("warnings flag a short larder during an active day", () => {
    const s = initialState(1);
    s.phase = "day";
    s.larder = 1;
    expect(warnings(s).some((w) => w.includes("larder"))).toBe(true);
  });
  it("warnings are empty at dusk even with a low larder (the season is already settled)", () => {
    const s = initialState(1);
    s.phase = "dusk";
    s.larder = 0;
    s.fuel = 0;
    expect(warnings(s)).toEqual([]);
  });
});
