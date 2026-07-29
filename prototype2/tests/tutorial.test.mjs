import { describe, it, expect } from "vitest";
import { boot } from "../src/main.js";
import { fxTag } from "../src/render/screens.js";

describe("Reuben's tutorial opt-in", () => {
  it("a New Game boots with Reuben's prompt, shown with his name and avatar", () => {
    const root = document.createElement("div");
    const app = boot(root, { seed: 1, lineageName: "Mackall", tutorialPrompt: true });
    expect(root.querySelector(".overlay")).toBeTruthy();
    expect(root.querySelector(".ov-avatar")).toBeTruthy();          // his silhouette
    expect(root.querySelector(".ov-name").textContent).toContain("Reuben");
    expect(app.getState().overlay).toBeTruthy();
  });

  it("choosing 'Walk me through it' turns tutorials on and dismisses the prompt", () => {
    const root = document.createElement("div");
    const app = boot(root, { seed: 1, lineageName: "Mackall", tutorialPrompt: true });
    root.querySelector(".overlay .choicecard").click(); // first choice = walk me through it
    expect(app.getState().tutorialsOn).toBe(true);
    expect(root.querySelector(".overlay")).toBeFalsy();
  });

  it("declining leaves tutorials off and dismisses the prompt", () => {
    const root = document.createElement("div");
    const app = boot(root, { seed: 1, lineageName: "Mackall", tutorialPrompt: true });
    const choices = root.querySelectorAll(".overlay .choicecard");
    choices[1].click(); // "I'll manage"
    expect(app.getState().tutorialsOn).toBe(false);
    expect(root.querySelector(".overlay")).toBeFalsy();
  });

  it("a plain boot (the test/headless path) shows no prompt", () => {
    const root = document.createElement("div");
    boot(root, { seed: 1, lineageName: "Mackall" });
    expect(root.querySelector(".overlay")).toBeFalsy();
  });
});

describe("choice stat tags (fxTag)", () => {
  it("formats a signed, valence-colored tag from state deltas", () => {
    expect(fxTag({ regard: -3 })).toEqual({ text: "−3 regard", valence: "bad" });
    expect(fxTag({ regard: 2 })).toEqual({ text: "+2 regard", valence: "good" });
    expect(fxTag({ coin: -60 })).toEqual({ text: "−60 coin", valence: "bad" });
    expect(fxTag({ reckoning: 1 })).toEqual({ text: "+1 dread", valence: "bad" }); // more dread is bad
    expect(fxTag({})).toEqual({ text: "", valence: "" });
  });
});
