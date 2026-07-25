import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

describe("tutorial flow", () => {
  it("plays a full guided year to an end screen without blocking", () => {
    const { doc } = boot({ seenIntro: true, guided: true });
    let steps = 0;
    while (advance(doc) && steps < 400) steps++;
    expect(steps).toBeLessThan(400);
    expect(doc.getElementById("again")).toBeTruthy();
  });

  it("fires the planting tip on the first planting screen", () => {
    const { doc, T } = boot({ seenIntro: true, guided: true });
    let steps = 0, saw = false;
    while (steps < 40) {
      if (T.getState().tutShown && T.getState().tutShown.plant) { saw = true; break; }
      if (!advance(doc)) break;
      steps++;
    }
    expect(saw).toBe(true);
  });

  it("the Ask Reuben panel offers to stop the tips", () => {
    const { doc, T } = boot({ seenIntro: true, guided: true });
    T.openAskReuben();
    expect(doc.getElementById("overlay-panel").textContent.toLowerCase()).toContain("tips");
  });
});
