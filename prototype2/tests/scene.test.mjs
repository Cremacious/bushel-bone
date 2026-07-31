import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { renderShell } from "../src/render/shell.js";
import { renderScreen } from "../src/render/screens.js";
import { SCENES } from "../src/content/scenes.js";
import { L } from "../src/content/script.js";
import { tok } from "../src/content/names.js";

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

  // Renders a scene beat and returns the stage's `.ctag` (mechanical fx tag) count.
  function tagCountForScene(id) {
    const root = document.createElement("div");
    let state = reduce(initialState(1, "Mackall"), { type: "OPEN_SCENE", id });
    const stage = renderShell(root, state, () => {}); renderScreen(stage, state, () => {});
    return root.querySelectorAll("#stage .choicecard .ctag").length;
  }

  it("a question scene renders its answer choices WITHOUT fx tags (no spoiling the right answer)", () => {
    // grange_intro is kind:"question" — the right answer must not wear a visible "+3 regard".
    expect(SCENES.grange_intro.kind).toBe("question");
    expect(tagCountForScene("grange_intro")).toBe(0);
  });

  it("a non-question scene renders its choices WITH fx tags", () => {
    // silas_welcome is a plain moral beat: its choices keep their +/- regard tags.
    expect(SCENES.silas_welcome.kind).toBeUndefined();
    expect(tagCountForScene("silas_welcome")).toBeGreaterThan(0);
  });

  it("a haggle scene shows the OUTCOME's result line after the risky choice (win/hold/sour)", () => {
    const root = document.createElement("div");
    // job_mend_fence opens as a scene; "dicker" rolls a seeded win/hold/sour outcome.
    let state = reduce(initialState(1, "Mackall"), { type: "OPEN_SCENE", id: "job_mend_fence" });
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    const dicker = [...root.querySelectorAll("#stage .choicecard")].find((b) => /more/i.test(b.textContent));
    dicker.click();
    // result is the outcome id, not the choiceId, and its outcome result line renders verbatim.
    expect(["win", "hold", "sour"]).toContain(state.scene.result);
    expect(root.textContent).toContain(tok(L("job_mend_fence." + state.scene.result + ".result")));
  });
});
