import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("tip()", () => {
  it("shows once in guided mode, then no-ops for the same id", () => {
    const { doc, T } = boot({ seenIntro: true, guided: true });
    T.tip("x", "hello there", "#askbar");
    const tb = doc.getElementById("tipbar");
    expect(tb.classList.contains("on")).toBe(true);
    expect(tb.textContent).toContain("hello there");
    T.dismissTip();
    T.tip("x", "again", null);
    expect(doc.getElementById("tipbar").classList.contains("on")).toBe(false);
  });

  it("is silent when guided mode is off", () => {
    const { doc, T } = boot({ seenIntro: true, guided: false });
    T.tip("y", "should not show", "#askbar");
    expect(doc.getElementById("tipbar").classList.contains("on")).toBe(false);
  });

  it("rings the highlight target and clears it on dismiss", () => {
    const { doc, T } = boot({ seenIntro: true, guided: true });
    T.tip("z", "look here", "#askbar");
    expect(doc.getElementById("askbar").classList.contains("tut-highlight")).toBe(true);
    T.dismissTip();
    expect(doc.getElementById("askbar").classList.contains("tut-highlight")).toBe(false);
  });

  it("replayTips re-enables tips after they were off", () => {
    const { doc, T } = boot({ seenIntro: true, guided: false });
    T.replayTips();
    T.tip("q", "back again", "#askbar");
    expect(doc.getElementById("tipbar").classList.contains("on")).toBe(true);
  });

  // Regression: a bar tip and an overlay tip can be open at once (the assign tip
  // tells the player to open the roster). Each Got-it button must be wired within
  // its own container, not by a shared global id.
  it("wires the overlay tip's Got it even when a bar tip is already open", () => {
    const { doc, T } = boot({ seenIntro: true, guided: true });
    T.tip("a", "bar tip", "#askbar");                 // shows in #tipbar
    T.openOverlay("<div class='hand'>x</div>");         // an overlay is now open
    T.tip("b", "overlay tip", null);                    // shows inside the overlay
    expect(doc.querySelectorAll(".tut-tip .got").length).toBe(2);
    const overlayGot = doc.querySelector("#overlay-panel .tut-tip .got");
    overlayGot.click();                                 // its own Got it must dismiss
    expect(doc.querySelector("#overlay-panel .tut-tip")).toBeFalsy();
  });
});
