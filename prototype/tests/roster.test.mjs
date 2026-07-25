import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("roster", () => {
  it("lists every living hand and marks the Foreman", () => {
    const { doc, T } = boot();
    T.getState().hands.push(T.mkHand(null, "Della", "Grower", 2, { body:"strong" }));
    T.openRoster();
    const txt = doc.getElementById("overlay-panel").textContent;
    expect(txt).toContain("Reuben");
    expect(txt).toContain("Della");
    expect(txt.toLowerCase()).toContain("foreman");
    expect(txt.toLowerCase()).toContain("grower");
  });
});
