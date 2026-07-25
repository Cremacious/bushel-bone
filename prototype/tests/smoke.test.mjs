import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

describe("smoke", () => {
  it("boots with the test hook and a starting Foreman named Reuben", () => {
    const { T } = boot();
    const S = T.getState();
    expect(S.foremanId).toBeTruthy();
    expect(T.foreman().name).toBe("Reuben");
  });

  it("plays a full year to an end screen without crashing", () => {
    const { doc } = boot();
    let steps = 0;
    while (advance(doc) && steps < 400) steps++;
    expect(steps).toBeLessThan(400);
    expect(doc.getElementById("again")).toBeTruthy();
  });
});
