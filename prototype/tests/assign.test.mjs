import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("assignment", () => {
  it("assignHand sets a hand's task", () => {
    const { T } = boot();
    T.assignHand("reuben", { type:"chop" });
    expect(T.getState().hands[0].task).toEqual({ type:"chop" });
  });

  it("chopping lays in fuel at resolution", () => {
    const { T } = boot();
    const fuel0 = T.getState().fuel;
    T.assignHand("reuben", { type:"chop" });
    T.applyLabor();
    expect(T.getState().fuel).toBe(fuel0 + 16);
  });

  it("resting mends morale", () => {
    const { T } = boot();
    const h = T.getState().hands[0]; h.morale = 2;
    T.assignHand("reuben", { type:"rest" });
    T.applyLabor();
    expect(T.getState().hands[0].morale).toBe(3);
  });
});
