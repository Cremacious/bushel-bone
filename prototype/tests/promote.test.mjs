import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("promotion on death", () => {
  it("foreman() is null when the foreman dies; needsForeman() is true", () => {
    const { T } = boot();
    const S = T.getState();
    S.hands.push(T.mkHand("della","Della","Grower",3,{}));
    S.hands[0].alive = false;
    expect(T.foreman()).toBe(null);
    expect(T.needsForeman()).toBe(true);
  });

  it("promoteForeman installs a new foreman", () => {
    const { T } = boot();
    const S = T.getState();
    S.hands.push(T.mkHand("della","Della","Grower",3,{}));
    S.hands[0].alive = false;
    T.promoteForeman("della");
    expect(T.foreman().name).toBe("Della");
    expect(T.needsForeman()).toBe(false);
  });
});
