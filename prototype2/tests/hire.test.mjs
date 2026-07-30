import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { hireCost } from "../src/core/selectors.js";

describe("hiring a hand", () => {
  it("HIRE adds a living hand for coin", () => {
    let s = { ...initialState(1), coin: 200 };
    const cost = hireCost(s);
    const n0 = s.hands.length;
    s = reduce(s, { type: "HIRE" });
    expect(s.hands.length).toBe(n0 + 1);
    expect(s.coin).toBe(200 - cost);
    const nh = s.hands[s.hands.length - 1];
    expect(nh.alive).toBe(true);
    expect(typeof nh.name).toBe("string");
  });
  it("the second hire costs more than the first (escalating)", () => {
    let s = { ...initialState(1), coin: 1000 };
    const c1 = hireCost(s);
    s = reduce(s, { type: "HIRE" });
    const c2 = hireCost(s);
    expect(c2).toBeGreaterThan(c1);
  });
  it("HIRE is a no-op when it cannot be afforded", () => {
    let s = { ...initialState(1), coin: 0 };
    expect(reduce(s, { type: "HIRE" })).toEqual(s);
  });
});
