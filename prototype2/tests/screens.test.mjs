import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { renderShell } from "../src/render/shell.js";
import { renderScreen } from "../src/render/screens.js";

function mount(state) {
  const root = document.createElement("div");
  const dispatch = () => {};
  const stage = renderShell(root, state, dispatch);
  renderScreen(stage, state, dispatch);
  return root;
}

describe("shell + router", () => {
  it("clicking a tab dispatches SET_SCREEN", () => {
    const root = document.createElement("div");
    let state = initialState(1);
    const dispatch = (a) => { state = reduce(state, a); };
    renderShell(root, state, dispatch);
    root.querySelector('.tab[data-tab="hands"]').click();
    expect(state.screen).toBe("hands");
  });
  it("renders a ledger warning line when the larder is short", () => {
    // warnings() only speaks during an active playing week (selectors.js gates on
    // phase === "week"); drive state past the brief/planting gate before checking it.
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    if (s.phase === "planting") s = reduce(s, { type: "SOW" });
    s.larder = 0;
    const root = mount(s);
    expect(root.querySelector(".warnline")).toBeTruthy();
  });
});

describe("morning brief", () => {
  it("year-1 spring shows the uncle's-ground brief and Begin advances to planting", () => {
    const root = document.createElement("div");
    let state = initialState(1, "Mackall");
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch);
    renderScreen(stage, state, dispatch);
    expect(root.textContent).toContain("Your uncle's ground");
    expect(root.textContent).toContain("Malachi"); // {{npc.malachi}} resolved
    root.querySelector(".choicecard").click();
    expect(state.phase).toBe("planting");
  });
});

describe("planting screen", () => {
  it("plants a crop from the picker and sows into the week", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelectorAll(".fieldrow").length).toBe(4);
    root.querySelector(".cropchip:not(.disabled)").click(); // plant field 0
    expect(state.fields[0].crop).toBeTruthy();
    [...root.querySelectorAll(".choicecard")].find((b) => /Sow/.test(b.textContent)).click();
    expect(state.phase).toBe("week");
  });
});
