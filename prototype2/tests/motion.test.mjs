import { describe, it, expect } from "vitest";
import { boot } from "../src/main.js";

describe("Turn motion", () => {
  it("plays on the first render and on a beat change, not on a same-view re-render", () => {
    const root = document.createElement("div");
    const app = boot(root, { seed: 1, lineageName: "Mackall" });
    // first paint is a beat change (null -> brief): animated
    expect(root.querySelector(".stage").classList.contains("m-turn")).toBe(true);
    // a same-view re-render (toggle theme; still the brief) must NOT re-animate
    app.dispatch({ type: "SET_THEME", theme: "day" });
    expect(root.querySelector(".stage").classList.contains("m-turn")).toBe(false);
    // a real beat change (into planting) animates again
    app.dispatch({ type: "BEGIN_SEASON" });
    expect(root.querySelector(".stage").classList.contains("m-turn")).toBe(true);
  });
});
