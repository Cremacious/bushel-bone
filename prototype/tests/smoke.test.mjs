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

  it("can open the roster and Ask Reuben mid-run", () => {
    const { doc, T } = boot();
    T.openRoster();
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(true);
    expect(doc.getElementById("overlay-panel").textContent).toContain("Reuben");
    T.closeOverlay();
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(false);
    T.openAskReuben();
    expect(doc.getElementById("overlay-panel").textContent.length).toBeGreaterThan(0);
    T.closeOverlay();
  });
});
