import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { renderShell } from "../src/render/shell.js";
import { renderScreen } from "../src/render/screens.js";
import { townOffers } from "../src/core/selectors.js";

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
  it("has no wasted Rest personal action, and reassures unspent time is fine", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    const dispatch = () => {};
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    const labels = [...root.querySelectorAll(".pa-action .pa-label")].map((e) => e.textContent);
    expect(labels).not.toContain("Rest");
    expect(root.textContent).toMatch(/Unspent time is fine/);
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
  it("the overview lists places to walk to and the day's odd-jobs, and taking a job pays coin", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(42), { type: "BEGIN_SEASON" }), { type: "SOW" });
    state = { ...state, screen: "town" };
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    const placeCards = [...root.querySelectorAll(".choicecard")].filter((b) => /gossip|tools and ironwork|seed, goods|mortgage|parish|medicine|the law|the old ways/.test(b.textContent));
    expect(placeCards.length).toBeGreaterThanOrEqual(5);
    const coin0 = state.coin;
    const jobBtn = [...root.querySelectorAll(".choicecard")].find((b) => /coin/.test(b.textContent) && !b.disabled);
    expect(jobBtn).toBeTruthy();
    jobBtn.click();
    expect(state.coin).toBeGreaterThan(coin0);
  });
  it("disables jobs when it is not the day phase", () => {
    const root = document.createElement("div");
    let state = { ...initialState(42), screen: "town", phase: "brief" };
    const dispatch = () => {};
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    const { jobs } = townOffers(state);
    const jobBtn = [...root.querySelectorAll(".choicecard")].find((b) => b.textContent.includes(jobs[0].line));
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

describe("town exploration UI", () => {
  it("the Day screen offers a ride to town", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    const dispatch = (a) => { state = reduce(state, a); };
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    const ride = [...root.querySelectorAll("button")].find((b) => /Ride to|Marrow/i.test(b.textContent));
    expect(ride).toBeTruthy();
    ride.click();
    expect(state.screen).toBe("town");
  });
  it("walking to a place shows the NPC's standing and talking to them opens their talk", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    state = { ...state, screen: "town" };
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    firstPlaceCard(root).click(); // walk to the first place on offer
    expect(root.querySelector(".loc-standing")).toBeTruthy();
    expect(root.querySelector(".place-scene")).toBeTruthy();
    const call = [...root.querySelectorAll(".choicecard")].find((b) => /Talk to/.test(b.textContent));
    expect(call.disabled).toBeFalsy();
    call.click();
    expect(state.phase).toBe("scene");
  });
});

// The overview's place list sits right after the "The town" section label; jobs (which
// come first) always carry a coin/"-1 action" tag, so walking to the next choicecard after
// the label is the reliable way to grab "the first place on offer" regardless of job state.
function firstPlaceCard(root) {
  const label = [...root.querySelectorAll(".townsub")].find((e) => /The town/.test(e.textContent));
  return label.nextElementSibling;
}

describe("the town walk", () => {
  function town(mut) {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    state = { ...state, screen: "town", ...(mut || {}) };
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    return { root, get: () => state };
  }
  it("the overview lists places to walk to and a way home", () => {
    const { root, get } = town();
    const walk = firstPlaceCard(root);
    expect(walk).toBeTruthy();
    expect([...root.querySelectorAll("button")].some((b) => /farm|home/i.test(b.textContent))).toBe(true);
    walk.click();
    expect(get().townAt).toBeTruthy(); // walking set a place
  });
  it("at a place the scene paints and offers a talk", () => {
    const { root } = town({ townAt: "saloon" });
    expect(root.querySelector(".place-scene")).toBeTruthy();
    expect([...root.querySelectorAll(".choicecard")].some((b) => /Talk to/i.test(b.textContent))).toBe(true);
  });
});

describe("clearing land on the planting grid", () => {
  it("an overgrown field shows a Clear control that spends coin to clear it", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
    state = { ...state, coin: 100 };
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    const clearBtn = root.querySelector(".fieldcard .clearbtn");
    expect(clearBtn).toBeTruthy();
    clearBtn.click();
    expect(state.fields.filter((f) => f.cleared).length).toBe(2);
  });
});

describe("the winter goal panel", () => {
  it("shows have/need with a bar and a met/short state", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    const dispatch = () => {};
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    const panel = root.querySelector(".goals");
    expect(panel).toBeTruthy();
    expect(panel.textContent).toMatch(/0\s*\/\s*40/);   // wood have/need
    expect(panel.querySelector(".goalbar")).toBeTruthy();
  });
});

describe("town polish", () => {
  it("the talk action renders as a choice card with an action-cost tag", () => {
    const root = document.createElement("div");
    let s = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    s = { ...s, screen: "town", townAt: "saloon" };
    renderShell(root, s, () => {}); renderScreen(root.querySelector("#stage"), s, () => {});
    const talk = [...root.querySelectorAll(".choicecard")].find((b) => /Talk to/.test(b.textContent));
    expect(talk).toBeTruthy();
    expect(talk.textContent).toMatch(/-1 action/);
  });
  it("floats Head back to the farm to the top when actions are spent", () => {
    const root = document.createElement("div");
    let s = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    s = { ...s, screen: "town", townAt: null, playerActionsLeft: 0 };
    renderShell(root, s, () => {}); renderScreen(root.querySelector("#stage"), s, () => {});
    const buttons = [...root.querySelectorAll("#stage button")];
    const homeIdx = buttons.findIndex((b) => /farm/i.test(b.textContent));
    expect(homeIdx).toBe(0); // the first control on the screen
  });
});

describe("the left panel in town", () => {
  it("shows a town plate, not the fields, when in town", () => {
    const root = document.createElement("div");
    let s = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    s = { ...s, screen: "town" };
    renderShell(root, s, () => {});
    expect(root.querySelector(".townplate")).toBeTruthy();
    expect(root.querySelector(".boardpanel .fieldgrid")).toBeFalsy();
  });
});

describe("dialogue intel highlights", () => {
  it("renders colored intel highlights in dialogue (economy task 3)", () => {
    const root = document.createElement("div");
    let s = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    s = { ...s, phase: "scene", scene: { id: "meredith_rumor", result: null } };
    const stage = renderShell(root, s, () => {}); renderScreen(stage, s, () => {});
    const hl = root.querySelector(".hl.mkt");
    expect(hl).toBeTruthy();
    expect(hl.textContent.length).toBeGreaterThan(0);
  });
});
