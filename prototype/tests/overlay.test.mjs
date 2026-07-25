import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("overlay + ask bar", () => {
  it("has a persistent Ask Reuben bar", () => {
    const { doc } = boot();
    expect(doc.getElementById("askbar")).toBeTruthy();
    expect(doc.getElementById("askbar").textContent.toLowerCase()).toContain("ask reuben");
  });

  it("opens and closes an overlay without disturbing the stage", () => {
    const { doc, T } = boot();
    const before = doc.getElementById("stage").innerHTML;
    T.openOverlay("<p id='probe'>hello</p>");
    expect(doc.getElementById("probe")).toBeTruthy();
    T.closeOverlay();
    expect(doc.getElementById("probe")).toBeFalsy();
    expect(doc.getElementById("stage").innerHTML).toBe(before);
  });
});
