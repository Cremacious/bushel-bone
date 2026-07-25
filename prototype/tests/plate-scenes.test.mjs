import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

describe("plate scenes", () => {
  it("shows Silas at the homestead on his welcome", () => {
    const { doc } = boot({ seenIntro: true, guided: false });
    let steps = 0, saw = false;
    while (steps < 10) {
      if (doc.getElementById("plate-nameplate").textContent.includes("Silas")) { saw = true; break; }
      if (!advance(doc)) break;
      steps++;
    }
    expect(saw).toBe(true);
    expect(doc.getElementById("plate-cap").textContent).toContain("Homestead");
  });

  it("no longer renders a stagedir paragraph inside the card body", () => {
    const { doc } = boot({ seenIntro: true, guided: false });
    // the opening card has a dir; it must not appear as a .stagedir in #stage
    expect(doc.querySelectorAll("#stage .stagedir").length).toBe(0);
  });
});
