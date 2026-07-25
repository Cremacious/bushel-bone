import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("unified clone model", () => {
  it("starts with one hand, Reuben, who is the Foreman", () => {
    const { T } = boot();
    const S = T.getState();
    expect(S.hands.length).toBe(1);
    expect(S.hands[0].id).toBe("reuben");
    expect(S.hands[0].isForeman ?? (S.foremanId === "reuben")).toBeTruthy();
    expect(T.livingHands().length).toBe(1);
    expect(T.extraHands()).toBe(0);
  });

  it("foreman() returns the living foreman, or null if dead", () => {
    const { T } = boot();
    expect(T.foreman().name).toBe("Reuben");
    T.getState().hands[0].alive = false;
    expect(T.foreman()).toBe(null);
  });

  it("condition() derives a word from morale and flags", () => {
    const { T } = boot();
    const h = T.getState().hands[0];
    h.morale = 5; expect(T.condition(h)).toBe("in good heart");
    h.morale = 1; expect(T.condition(h)).toBe("worn");
    h.ill = true; expect(T.condition(h)).toBe("ill");
  });
});
