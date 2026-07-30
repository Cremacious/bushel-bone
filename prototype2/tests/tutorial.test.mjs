import { describe, it, expect } from "vitest";
import { boot } from "../src/main.js";
import { fxTag } from "../src/render/screens.js";
import { pendingTip } from "../src/content/tips.js";
import { initialState } from "../src/core/state.js";

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

describe("Reuben's guided tips", () => {
  function newGameWithTips() {
    const root = document.createElement("div");
    const app = boot(root, { seed: 1, lineageName: "Mackall", tutorialPrompt: true });
    app.dispatch({ type: "SET_TUTORIALS", on: true }); // "Walk me through it"
    return { root, app };
  }

  it("no tip at the opening brief; the orientation tip leans in at Silas's Welcome, then the planting tips at planting", () => {
    const { app } = newGameWithTips();
    expect(app.getState().overlay).toBe(null); // brief: nothing yet
    app.dispatch({ type: "OPEN_SCENE", id: "silas_welcome" });
    // the HUD-orientation tip leans in right at the first screen, before the scene's choices
    expect(app.getState().overlay).toMatchObject({ type: "reuben-tip", tipId: "orient", page: 0 });
    app.dispatch({ type: "DISMISS_TIP", id: "orient" });
    app.dispatch({ type: "CHOOSE_SCENE", choiceId: "obliged" });
    app.dispatch({ type: "CLOSE_SCENE" }); // → planting
    expect(app.getState().phase).toBe("planting");
    expect(app.getState().overlay).toMatchObject({ type: "reuben-tip", tipId: "plant", page: 0 });
  });

  it("a tip pages through and, dismissed, is marked seen and never fires again", () => {
    const { root, app } = newGameWithTips();
    app.dispatch({ type: "OPEN_SCENE", id: "silas_welcome" });
    app.dispatch({ type: "DISMISS_TIP", id: "orient" }); // clear the orientation tip first
    app.dispatch({ type: "CHOOSE_SCENE", choiceId: "obliged" });
    app.dispatch({ type: "CLOSE_SCENE" }); // plant tip shows
    // Reuben is named, and it is a multi-page tip
    expect(root.querySelector(".overlay .ov-name").textContent).toContain("Reuben");
    expect(app.getState().overlay.pages.length).toBeGreaterThan(1);
    [...root.querySelectorAll(".overlay .ov-navbtn")].find((b) => /Next/.test(b.textContent)).click();
    expect(app.getState().overlay.page).toBe(1);
    // jump to the end and dismiss
    app.dispatch({ type: "DISMISS_TIP", id: "plant" });
    expect(app.getState().tipsSeen).toContain("plant");
    expect(app.getState().overlay).toBe(null);
    // sowing into the day now surfaces the assign tip (a different mechanic)
    app.dispatch({ type: "SOW" });
    expect(app.getState().overlay).toMatchObject({ tipId: "assign" });
  });

  it("with tutorials off, no tips ever fire", () => {
    const root = document.createElement("div");
    const app = boot(root, { seed: 1, lineageName: "Mackall" }); // no prompt, tutorials off
    app.dispatch({ type: "OPEN_SCENE", id: "silas_welcome" });
    app.dispatch({ type: "CHOOSE_SCENE", choiceId: "obliged" });
    app.dispatch({ type: "CLOSE_SCENE" });
    expect(app.getState().overlay).toBe(null);
  });
});

describe("tip re-sequencing", () => {
  it("fires the orientation tip when the player first reaches Silas's Welcome", () => {
    const s = { ...initialState(1), tutorialsOn: true, overlay: null, phase: "scene", scene: { id: "silas_welcome", result: null }, tipsSeen: [] };
    const tip = pendingTip(s);
    expect(tip && tip.id).toBe("orient");
    expect(tip.pages[0]).toMatch(/Coin buys seed/);
  });
  it("shows the two planting tips together at planting, without the HUD orientation page", () => {
    const s = { ...initialState(1), tutorialsOn: true, overlay: null, phase: "planting", tipsSeen: [] };
    const tip = pendingTip(s);
    expect(tip && tip.id).toBe("plant");
    expect(tip.pages.length).toBe(2);
    expect(tip.pages.join(" ")).not.toMatch(/Coin buys seed/); // orientation moved out
    expect(tip.pages.join(" ")).toMatch(/season's planting/);
    expect(tip.pages.join(" ")).toMatch(/fertility/);
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
