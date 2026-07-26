import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

describe("Planting clarity", () => {
  it("a disabled crop chip is tappable and explains why in a popover", () => {
    const { doc, T } = boot();
    const S = T.getState();
    S.marks = 0; S.seed = 0;
    advance(doc); // Walk the fields -> Silas
    advance(doc); // Obliged -> "Go on" intermediate card (resolve() inserts one)
    advance(doc); // Go on -> plant step
    const potato = doc.querySelector('#stage .chip[data-k="potato"]');
    expect(potato.hasAttribute("disabled")).toBe(false);
    expect(potato.getAttribute("title")).toBeNull();
    expect(potato.classList.contains("chip-disabled")).toBe(true);
    potato.click();
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(true);
    expect(doc.getElementById("overlay-panel").textContent).toContain("needs 6 seed or coin, have 0 seed, 0m");
  });
});
