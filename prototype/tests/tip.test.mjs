import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("tip()", () => {
  it("shows once in guided mode as a modal, then no-ops for the same id", () => {
    const { doc, T } = boot({ seenIntro: true, guided: true });
    T.tip("x", "hello there", "#askbar");
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(true);
    expect(doc.getElementById("overlay-panel").textContent).toContain("hello there");
    doc.getElementById("tip-close").click();
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(false);
    T.tip("x", "again", null);
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(false);
  });

  it("is silent when guided mode is off", () => {
    const { doc, T } = boot({ seenIntro: true, guided: false });
    T.tip("y", "should not show", "#askbar");
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(false);
  });

  it("rings the highlight target and clears it on dismiss", () => {
    const { doc, T } = boot({ seenIntro: true, guided: true });
    T.tip("z", "look here", "#askbar");
    expect(doc.getElementById("askbar").classList.contains("tut-highlight")).toBe(true);
    doc.getElementById("tip-close").click();
    expect(doc.getElementById("askbar").classList.contains("tut-highlight")).toBe(false);
  });

  it("replayTips re-enables tips after they were off", () => {
    const { doc, T } = boot({ seenIntro: true, guided: false });
    T.replayTips();
    T.tip("q", "back again", "#askbar");
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(true);
  });

  it("folds a tip into an already-open overlay instead of replacing it", () => {
    const { doc, T } = boot({ seenIntro: true, guided: true });
    T.openOverlay("<div class='hand'>x</div>"); // an overlay is already open (e.g. the roster)
    T.tip("b", "overlay tip", null); // should fold into the same panel, not replace it
    expect(doc.querySelector("#overlay-panel .hand")).toBeTruthy();
    const got = doc.querySelector("#overlay-panel .tut-tip .got");
    expect(got).toBeTruthy();
    got.click(); // dismiss just the folded-in tip
    expect(doc.querySelector("#overlay-panel .tut-tip")).toBeFalsy();
    expect(doc.querySelector("#overlay-panel .hand")).toBeTruthy(); // the roster survives
  });

  it("supports multi-page tips with Next/Previous, swapping the highlight per page", () => {
    const { doc, T } = boot({ seenIntro: true, guided: true });
    T.tip("multi", ["page one", "page two"], ["#askbar", "#ledger"]);
    expect(doc.getElementById("overlay-panel").textContent).toContain("page one");
    expect(doc.getElementById("tip-prev")).toBeFalsy();
    expect(doc.getElementById("askbar").classList.contains("tut-highlight")).toBe(true);

    doc.getElementById("tip-next").click();
    expect(doc.getElementById("overlay-panel").textContent).toContain("page two");
    expect(doc.getElementById("tip-next")).toBeFalsy();
    expect(doc.getElementById("askbar").classList.contains("tut-highlight")).toBe(false);
    expect(doc.getElementById("ledger").classList.contains("tut-highlight")).toBe(true);

    doc.getElementById("tip-prev").click();
    expect(doc.getElementById("overlay-panel").textContent).toContain("page one");

    doc.getElementById("tip-next").click();
    doc.getElementById("tip-close").click();
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(false);
    expect(doc.getElementById("ledger").classList.contains("tut-highlight")).toBe(false);
  });
});
