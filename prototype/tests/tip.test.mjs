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
});
