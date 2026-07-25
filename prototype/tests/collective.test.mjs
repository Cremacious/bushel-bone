import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("collectiveLine", () => {
  it("names the lowest hand when someone is suffering", () => {
    const { T } = boot();
    const S = T.getState();
    S.hands.push(T.mkHand("della","Della","Grower",1,{}));
    expect(T.collectiveLine()).toContain("Della");
  });

  it("gives a contented line when all are in good heart", () => {
    const { T } = boot();
    T.getState().hands[0].morale = 5;
    expect(typeof T.collectiveLine()).toBe("string");
    expect(T.collectiveLine().length).toBeGreaterThan(0);
  });
});
