import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

// jsdom does not compute real CSS layout, transforms, or viewport-driven
// scaling (see the #47 design doc's verification note), so this only
// exercises applyDesktopScale()'s pure arithmetic and the inline style
// string it writes, not what actually renders on screen.
function setViewport(win, width, height){
  Object.defineProperty(win, "innerWidth", { value: width, configurable: true });
  Object.defineProperty(win, "innerHeight", { value: height, configurable: true });
}

describe("fixed-size desktop canvas (#47 phase 1)", () => {
  it("clears the transform below the 1100px breakpoint", () => {
    const { win, doc, T } = boot({ atStartScreen: true });
    setViewport(win, 800, 600);
    T.applyDesktopScale();
    expect(doc.getElementById("almanac").style.transform).toBe("");
  });

  it("scales to fit a 1920x1080 viewport at exactly scale 1", () => {
    const { win, doc, T } = boot({ atStartScreen: true });
    setViewport(win, 1920, 1080);
    T.applyDesktopScale();
    expect(doc.getElementById("almanac").style.transform).toBe("translate(-50%,-50%) scale(1)");
  });

  it("uses the smaller of the two ratios, so a non-16:9 window letterboxes instead of overflowing", () => {
    const { win, doc, T } = boot({ atStartScreen: true });
    // 1600 wide would alone give scale 1600/1920 ≈ 0.833, but a short 800px
    // height gives 800/1080 ≈ 0.741, the binding constraint. The canvas must
    // shrink to the smaller figure so it never overflows either dimension.
    setViewport(win, 1600, 800);
    T.applyDesktopScale();
    const expected = Math.min(1600/1920, 800/1080);
    expect(doc.getElementById("almanac").style.transform).toBe("translate(-50%,-50%) scale("+expected+")");
  });
});
