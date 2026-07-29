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
  it("year-1 spring shows the uncle's-ground brief and Begin opens the Ridley scene", () => {
    const root = document.createElement("div");
    let state = initialState(1, "Mackall");
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch);
    renderScreen(stage, state, dispatch);
    expect(root.textContent).toContain("Your uncle's ground");
    expect(root.textContent).toContain("Malachi"); // {{npc.malachi}} resolved
    root.querySelector("#stage .choicecard").click();
    // Year 1 opens on Ridley's call before planting (the scripted scene layer)
    expect(state.phase).toBe("scene");
    expect(state.scene.id).toBe("silas_welcome");
  });
});

describe("planting grid", () => {
  it("plants a crop from the picker and sows into the week", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelectorAll(".fieldgrid .fieldcard").length).toBe(4);
    root.querySelector(".fieldcard .cropchip:not(.disabled)").click(); // plant field 0
    expect(state.fields[0].crop).toBeTruthy();
    [...root.querySelectorAll(".plant-bar .choicecard")].find((b) => /Sow it so/.test(b.textContent)).click();
    expect(state.phase).toBe("week");
  });

  it("shows four field cards and Sow is present before scrolling; a pick fills the cell", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" });
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelectorAll(".fieldgrid .fieldcard").length).toBe(4);
    expect([...root.querySelectorAll(".plant-bar .choicecard")].some((b) => /Sow/.test(b.textContent))).toBe(true);
    root.querySelector(".fieldcard .cropchip:not(.disabled)").click();
    expect(state.fields[0].crop).toBeTruthy();
    expect(root.querySelector(".fieldcard").textContent).toContain("ripens");
  });
});

describe("readable weekly plan", () => {
  it("shows the field board with a projection and the pre-filled crew task", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" });
    state = reduce(state, { type: "PLANT", fieldId: 0, crop: "potato" });
    state = reduce(state, { type: "SOW" }); // week, pre-filled to tend field 0
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    expect(root.querySelector(".weekboard .fieldcard")).toBeTruthy();
    expect(root.textContent).toContain("ripens wk 5");
    // Reuben's row shows Tend selected (the pre-filled suggestion)
    const reubenRow = root.querySelector(".handrow");
    expect(reubenRow.querySelector(".taskbtn.sel").textContent).toBe("Tend");
  });
});

describe("weekly plan screen", () => {
  it("assigns a hand and resolves the week", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" }); // phase week
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelectorAll(".handrow").length).toBe(1); // Reuben
    root.querySelector('.handrow .taskbtn').click(); // pick a task
    [...root.querySelectorAll(".choicecard")].find((b) => /Put them/.test(b.textContent)).click();
    expect(state.week).toBe(2);
  });
});

describe("dusk + year end", () => {
  it("shows the day-book at dusk and turns the page to the next season", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    for (let i = 0; i < 5; i++) state = reduce(state, { type: "RESOLVE_WEEK" });
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    expect(root.querySelector(".daybook")).toBeTruthy();
    [...root.querySelectorAll(".choicecard")].find((b) => /Turn the page/.test(b.textContent)).click();
    expect(state.phase).toBe("brief");
  });

  it("winter's end reaches the year-1 verdict screen with a replay control", () => {
    const root = document.createElement("div");
    let state = initialState(1); state.seasonIndex = 3; // winter (no planting phase)
    state = reduce(state, { type: "BEGIN_SEASON" });
    for (let i = 0; i < 5; i++) state = reduce(state, { type: "RESOLVE_WEEK" });
    const dispatch = (a) => { state = reduce(state, a); };
    let stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    [...root.querySelectorAll(".choicecard")].find((b) => /Turn the page/.test(b.textContent)).click();
    expect(state.phase).toBe("yearend");
    stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    expect(root.textContent).toContain("survived another year");
    expect([...root.querySelectorAll(".choicecard")].some((b) => /another first year/.test(b.textContent))).toBe(true);
  });
});

describe("tab views", () => {
  it("the Hands tab lists each living hand with a condition", () => {
    const root = document.createElement("div");
    let state = initialState(1);
    state = { ...state, screen: "hands" };
    const dispatch = () => {};
    const stage = renderShell(root, state, dispatch);
    renderScreen(stage, state, dispatch);
    const rows = root.querySelectorAll(".handrow");
    expect(rows.length).toBe(1); // Reuben, the only living hand at the start
    expect(root.querySelector(".hname").textContent).toContain("Reuben");
    expect(root.querySelector(".hcond").textContent).toBe("steady");
  });

  it("the Fields tab lists all four fields", () => {
    const root = document.createElement("div");
    let state = initialState(1);
    state = { ...state, screen: "fields" };
    const dispatch = () => {};
    const stage = renderShell(root, state, dispatch);
    renderScreen(stage, state, dispatch);
    const rows = root.querySelectorAll(".fieldrow");
    expect(rows.length).toBe(4);
    expect(root.textContent).toContain("fallow");
  });
});

describe("weekly plan — dead tasks and lost hands", () => {
  function weekView(mutate) {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" }); // phase week, nothing planted
    if (mutate) state = mutate(state);
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    return { root, get: () => state };
  }
  it("disables Harvest (and Tend) when nothing is ripe or planted, and the button will not assign", () => {
    const { root, get } = weekView();
    const harvest = [...root.querySelectorAll(".handrow .taskbtn")].find((b) => b.textContent === "Harvest");
    expect(harvest.disabled).toBe(true);
    expect(harvest.getAttribute("title")).toMatch(/ripe/);
    harvest.click(); // no-op: no onClick wired
    expect(get().hands[0].task).toBe("rest"); // unchanged from the default
  });
  it("lists only living hands", () => {
    const { root } = weekView((s) => ({ ...s, hands: [...s.hands, { id: "del", name: "Del", alive: false, strain: 100, task: "rest", morale: 0, traits: [] }] }));
    expect(root.querySelectorAll(".handrow").length).toBe(1); // Del is lost, only Reuben stands
  });
});
