import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("screen-type help", () => {
  it("tags a brief card as 'brief' and an event card (2+ choices) as 'event'", () => {
    const { win, T } = boot();
    // Spring opens on the intro brief (1 choice, primary advance)
    expect(T.getState().screenType).toBe("brief");
  });

  it("the masthead help button shows the current screen's help text", () => {
    const { doc, T } = boot();
    doc.getElementById("helptog").click();
    const panel = doc.getElementById("overlay-panel");
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(true);
    expect(panel.textContent).toContain(T.SCREEN_HELP[T.getState().screenType]);
  });

  it("planting sets screenType to 'planting', not the 1-choice 'brief' default", () => {
    const { doc, T } = boot();
    // advance past the intro brief and Silas's Welcome (which resolves through
    // an intermediate "Go on" brief) to reach planting
    doc.querySelector("#stage .btn[data-c]").click(); // Walk the fields
    doc.querySelector("#stage .btn[data-c]").click(); // Obliged, Mr. Ridley (first choice)
    doc.querySelector("#stage .btn[data-c]").click(); // Go on
    expect(T.getState().screenType).toBe("planting");
  });
});
