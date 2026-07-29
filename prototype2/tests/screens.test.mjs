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
    // warnings() only speaks during an active playing day (selectors.js gates on
    // phase === "day"); drive state past the brief/planting gate before checking it.
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
  it("plants a crop from the picker and sows into the day", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelectorAll(".fieldgrid .fieldcard").length).toBe(4);
    root.querySelector(".fieldcard .cropchip:not(.disabled)").click(); // plant field 0
    expect(state.fields[0].crop).toBeTruthy();
    [...root.querySelectorAll(".plant-bar .choicecard")].find((b) => /Sow it so/.test(b.textContent)).click();
    expect(state.phase).toBe("day");
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

  it("the spend figure counts only crops sown this dawn, not a carried-over growing crop", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" });
    state.fields[1] = { ...state.fields[1], crop: "corn", progress: 0.4 }; // carried from last season
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    // sow potato (seed 6) this dawn in field 0 (the first card)
    [...root.querySelectorAll(".fieldcard")][0].querySelectorAll(".cropchip")
      .forEach((b) => { if (/Potato/.test(b.textContent)) b.click(); });
    const bar = root.querySelector(".plant-bar .t-sub").textContent;
    expect(bar).toContain("costs 6");     // potato only
    expect(bar).not.toContain("costs 11"); // not potato + carried corn (would be 6 + 5)
  });

  it("the clear control on a planted cell fallows the field", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" });
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    root.querySelector(".fieldcard .cropchip:not(.disabled)").click(); // plant field 0
    expect(state.fields[0].crop).toBeTruthy();
    [...root.querySelectorAll(".fieldcard .linkbtn")].find((b) => /clear/.test(b.textContent)).click();
    expect(state.fields[0].crop).toBe(null);
  });
});

describe("the day screen", () => {
  it("shows the crew's standing orders, the personal action budget, and Turn in / Let the days run", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" });
    state = reduce(state, { type: "PLANT", fieldId: 0, crop: "potato" });
    state = reduce(state, { type: "SOW" }); // phase: day
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    expect(root.querySelector(".handrow")).toBeTruthy();
    expect(root.textContent).toMatch(/2 (actions|left)/i);
    expect([...root.querySelectorAll(".choicecard")].some((b) => /Turn in/i.test(b.textContent))).toBe(true);
    expect([...root.querySelectorAll("button")].some((b) => /Let the days run/i.test(b.textContent))).toBe(true);
  });
  it("spending a personal action decrements the budget", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    [...root.querySelectorAll(".pa-action")].find((b) => /Forage/i.test(b.textContent)).click();
    expect(state.playerActionsLeft).toBe(1);
  });
  it("disables Harvest when nothing is ripe, and lists only living hands", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    state = { ...state, hands: [...state.hands, { id: "del", name: "Del", alive: false, strain: 100, task: "rest", morale: 0, traits: [] }] };
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    const harvest = [...root.querySelectorAll(".handrow .taskbtn")].find((b) => b.textContent === "Harvest");
    expect(harvest.disabled).toBe(true);
    expect(root.querySelectorAll(".handrow").length).toBe(1); // only Reuben stands
  });
});

describe("dusk + year end", () => {
  it("shows the day-book at dusk and turns the page to the next season", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    for (let i = 0; i < 10; i++) state = reduce(state, { type: "TURN_IN" });
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
    for (let i = 0; i < 10; i++) state = reduce(state, { type: "TURN_IN" });
    const dispatch = (a) => { state = reduce(state, a); };
    let stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    [...root.querySelectorAll(".choicecard")].find((b) => /Turn the page/.test(b.textContent)).click();
    expect(state.phase).toBe("yearend");
    stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    expect(root.textContent).toContain("survived another year");
    expect([...root.querySelectorAll(".choicecard")].some((b) => /another first year/.test(b.textContent))).toBe(true);
  });
});

describe("the town screen", () => {
  it("lists locations and the day's odd-jobs, and taking a job pays coin", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(42), { type: "BEGIN_SEASON" }), { type: "SOW" });
    state = { ...state, screen: "town" };
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelectorAll(".townloc").length).toBeGreaterThanOrEqual(5);
    const coin0 = state.coin;
    const jobBtn = root.querySelector(".jobcard .jobtake");
    expect(jobBtn).toBeTruthy();
    jobBtn.click();
    expect(state.coin).toBeGreaterThan(coin0);
  });
  it("disables jobs when it is not the day phase", () => {
    const root = document.createElement("div");
    let state = { ...initialState(42), screen: "town", phase: "brief" };
    const dispatch = () => {};
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    const jobBtn = root.querySelector(".jobcard .jobtake");
    expect(jobBtn.disabled).toBe(true);
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
