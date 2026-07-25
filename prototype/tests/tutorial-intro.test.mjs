import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("first-run prompt", () => {
  it("shows the intro overlay only when unseen", () => {
    const a = boot({ seenIntro: false });
    expect(a.doc.getElementById("overlay").classList.contains("on")).toBe(true);
    expect(a.doc.getElementById("overlay-panel").textContent.toLowerCase()).toContain("foreman");
    const b = boot({ seenIntro: true });
    expect(b.doc.getElementById("overlay").classList.contains("on")).toBe(false);
  });

  it("'walk me through it' turns guided mode on and marks intro seen", () => {
    const { doc, win } = boot({ seenIntro: false });
    doc.getElementById("tut-yes").click();
    expect(win.localStorage.getItem("bb_guided")).toBe("1");
    expect(win.localStorage.getItem("bb_seenIntro")).toBe("1");
  });

  it("'find my own way' leaves guided off", () => {
    const { doc, win } = boot({ seenIntro: false });
    doc.getElementById("tut-no").click();
    expect(win.localStorage.getItem("bb_guided")).toBe("0");
  });
});
