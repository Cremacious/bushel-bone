import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { renderShell } from "../src/render/shell.js";
import { renderScreen } from "../src/render/screens.js";

describe("scripted scenes — the Ridley greeting", () => {
  it("Year-1 Begin opens the Ridley scene instead of going straight to planting", () => {
    let s = initialState(1);
    // brief renderer wires Begin to OPEN_SCENE for the year-1 opener
    s = reduce(s, { type: "OPEN_SCENE", id: "silas_welcome" });
    expect(s.phase).toBe("scene");
    expect(s.scene).toEqual({ id: "silas_welcome", result: null });
  });

  it("a choice moves regard and records the result; closing falls into planting", () => {
    let s = reduce(initialState(1), { type: "OPEN_SCENE", id: "silas_welcome" });
    const before = s.regard;
    s = reduce(s, { type: "CHOOSE_SCENE", choiceId: "needle" }); // needling the banker costs regard
    expect(s.regard).toBe(before - 3);
    expect(s.scene.result).toBe("needle");
    s = reduce(s, { type: "CLOSE_SCENE" });
    expect(s.scene).toBe(null);
    expect(s.phase).toBe("planting"); // spring → planting via after: BEGIN_SEASON
  });

  it("the obliged choice keeps the peace (regard up)", () => {
    let s = reduce(initialState(1), { type: "OPEN_SCENE", id: "silas_welcome" });
    s = reduce(s, { type: "CHOOSE_SCENE", choiceId: "obliged" });
    expect(s.regard).toBe(22); // 20 + 2
  });

  it("renders the scene: Ridley's title, his line, and two choices; then a result + go on", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1, "Mackall"), { type: "OPEN_SCENE", id: "silas_welcome" });
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.textContent).toContain("Welcome");            // {{npc.silas.first}}'s Welcome
    expect(root.querySelectorAll("#stage .choicecard").length).toBe(2);
    root.querySelector("#stage .choicecard").click();          // take the first choice
    expect(state.scene.result).toBeTruthy();
    // now a single "Go on" primary card
    const go = [...root.querySelectorAll("#stage .choicecard")].find((b) => /Go on/.test(b.textContent));
    expect(go).toBeTruthy();
    go.click();
    expect(state.phase).toBe("planting");
  });
});
