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
  it("mouths counts the farmer plus living hands", () => {
    const s = initialState(1);
    expect(mouths(s)).toBe(2); // you + Reuben
    s.hands.push(makeHand("h2", "Del"));
    expect(mouths(s)).toBe(3);
  });
  it("warnings flag a short larder", () => {
    const s = initialState(1);
    s.larder = 1;
    expect(warnings(s).some((w) => w.includes("larder"))).toBe(true);
  });
});
