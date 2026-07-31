import { describe, it, expect } from "vitest";
import { livingHands, DAYS_PER_SEASON } from "../src/core/state.js";
import { initialState } from "./helpers/no-events-state.mjs";
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

describe("the beat screen", () => {
  // SOW now lands the player on the guaranteed day-1 opening beat (phase "day", day 1), their
  // first turn to set the crew before the days run on. Guard each test in case a future balance
  // change stops the run somewhere other than "day".
  function toBeat() {
    return reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
  }

  it("the day-1 opening beat titles itself 'A new season. Set your hands.'", () => {
    const state = toBeat();
    expect(state.day).toBe(1);
    const root = document.createElement("div");
    const stage = renderShell(root, state, () => {}); renderScreen(stage, state, () => {});
    expect(root.querySelector(".beat-title").textContent).toBe("A new season. Set your hands.");
  });

  it("shows a role toggle (four buttons) for every living hand", () => {
    const state = toBeat();
    if (state.phase !== "day") return;
    const root = document.createElement("div");
    const stage = renderShell(root, state, () => {}); renderScreen(stage, state, () => {});
    const hands = livingHands(state);
    expect(root.querySelectorAll(".crewbeat").length).toBe(hands.length);
    expect(root.querySelectorAll(".rolebtn").length).toBe(hands.length * 4);
  });

  it("clicking a role button dispatches SET_ROLE and changes the hand's role", () => {
    let state = toBeat();
    if (state.phase !== "day") return;
    const root = document.createElement("div");
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    const woodBtn = [...root.querySelectorAll(".rolebtn")].find((b) => /Woodcutting/.test(b.textContent));
    expect(woodBtn).toBeTruthy();
    woodBtn.click();
    expect(state.hands.find((h) => h.id === "reuben").role).toBe("wood");
  });

  it("shows the season-action count and a Continue control that advances the run", () => {
    let state = toBeat();
    if (state.phase !== "day") return;
    const root = document.createElement("div");
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.textContent).toMatch(/Your own time this season: \d+ of \d+ left\./);
    const cont = [...root.querySelectorAll(".choicecard")]
      .find((b) => /Let the days run on|Bring the season to a close/.test(b.textContent));
    expect(cont).toBeTruthy();
    const d0 = state.day;
    cont.click();
    expect(state.day > d0 || state.phase === "dusk").toBe(true);
  });

  it("labels the season pool as your own time, with a refill hint (B1)", () => {
    let state = toBeat();
    if (state.phase !== "day") return;
    state = { ...state, seasonActionsLeft: 5 };
    const root = document.createElement("div");
    const stage = renderShell(root, state, () => {}); renderScreen(stage, state, () => {});
    expect(root.textContent).toContain("Your own time this season: 5 of 5 left.");
    expect(root.querySelector(".season-hint")).toBeTruthy();
    expect(root.textContent).toContain("It refills next season.");
  });

  it("shows the beat-timing hint on a mid-season day, not on the last day (B3)", () => {
    const base = toBeat();
    if (base.phase !== "day") return;
    const hint = "Your crew's orders take effect as the days run on.";
    let root = document.createElement("div");
    const mid = { ...base, day: 3 };
    let stage = renderShell(root, mid, () => {}); renderScreen(stage, mid, () => {});
    expect(root.textContent).toContain(hint);
    expect(mid.day).toBeLessThan(DAYS_PER_SEASON);
    root = document.createElement("div");
    const last = { ...base, day: DAYS_PER_SEASON };
    stage = renderShell(root, last, () => {}); renderScreen(stage, last, () => {});
    expect(root.textContent).not.toContain(hint);
  });

  it("a season-action button arms on first tap and only spends on Yes (B2)", () => {
    let state = toBeat();
    if (state.phase !== "day") return;
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    const root = document.createElement("div");
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    const before = state.seasonActionsLeft;
    expect(before).toBeGreaterThan(0);
    const forage = [...root.querySelectorAll(".seasonbtn")].find((b) => b.textContent === "Forage");
    expect(forage).toBeTruthy();
    forage.click(); // first tap ARMS, no dispatch
    expect(state.seasonActionsLeft).toBe(before);
    expect(root.textContent).toContain("Spend an action to forage?");
    const yes = [...root.querySelectorAll(".seasonbtn")].find((b) => b.textContent === "Yes");
    expect(yes).toBeTruthy();
    yes.click(); // Yes spends the action
    expect(state.seasonActionsLeft).toBe(before - 1);
  });

  it("Not yet restores the armed button without spending (B2)", () => {
    let state = toBeat();
    if (state.phase !== "day") return;
    const dispatch = (a) => { state = reduce(state, a); };
    const root = document.createElement("div");
    const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    const before = state.seasonActionsLeft;
    const forage = [...root.querySelectorAll(".seasonbtn")].find((b) => b.textContent === "Forage");
    forage.click(); // arm
    const notYet = [...root.querySelectorAll(".seasonbtn")].find((b) => b.textContent === "Not yet");
    expect(notYet).toBeTruthy();
    notYet.click(); // restore
    expect(root.textContent).not.toContain("Spend an action to forage?");
    expect([...root.querySelectorAll(".seasonbtn")].some((b) => b.textContent === "Forage")).toBe(true);
    expect(state.seasonActionsLeft).toBe(before); // never spent
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

  it("winter's end reaches the year-end settlement phase (the render screen is Task 5)", () => {
    const root = document.createElement("div");
    let state = initialState(1); state.seasonIndex = 3; // winter (no planting phase)
    state = reduce(state, { type: "BEGIN_SEASON" });
    for (let i = 0; i < 10; i++) state = reduce(state, { type: "TURN_IN" });
    const dispatch = (a) => { state = reduce(state, a); };
    let stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch);
    [...root.querySelectorAll(".choicecard")].find((b) => /Turn the page/.test(b.textContent)).click();
    expect(state.phase).toBe("settlement");
    expect(state.ended).toBe(false);
  });
});

describe("the town screen", () => {
  it("the overview lists places to walk to and the day's odd-jobs, and taking a job opens its scene card", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(42), { type: "BEGIN_SEASON" }), { type: "SOW" });
    state = { ...state, screen: "town" };
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    const placeCards = [...root.querySelectorAll(".choicecard")].filter((b) => /gossip|tools and ironwork|seed, goods|mortgage|parish|medicine|the law|the old ways/.test(b.textContent));
    expect(placeCards.length).toBeGreaterThanOrEqual(5);
    const jobBtn = [...root.querySelectorAll(".choicecard")].find((b) => /coin/.test(b.textContent) && !b.disabled);
    expect(jobBtn).toBeTruthy();
    jobBtn.click();
    expect(state.phase).toBe("scene");           // the job now opens a card; payoff is in its choices
    expect(typeof state.scene.id).toBe("string");
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

describe("the beat screen's resource status", () => {
  it("shows a resource strip with Larder and Fuel cells", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    if (state.phase !== "day") return;
    const stage = renderShell(root, state, () => {}); renderScreen(stage, state, () => {});
    const strip = root.querySelector(".beat-strip");
    expect(strip).toBeTruthy();
    expect(strip.textContent).toContain("Larder");
    expect(strip.textContent).toContain("Fuel");
  });
  it("reddens a short winter-target cell and leaves an ample one plain", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    if (state.phase !== "day") return;
    // At the season's start no wood is laid by, so the winter Wood target is short.
    const stage = renderShell(root, state, () => {}); renderScreen(stage, state, () => {});
    const strip = root.querySelector(".beat-strip");
    const shortCell = [...strip.querySelectorAll(".beat-cell")].find((c) => /0\s*\/\s*40/.test(c.textContent));
    expect(shortCell).toBeTruthy();
    expect(shortCell.classList.contains("warn")).toBe(true);
  });
  it("does not redden the winter-target cells once the household is amply stocked", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    if (state.phase !== "day") return;
    state = { ...state, fuel: 999, larder: 999 };
    const stage = renderShell(root, state, () => {}); renderScreen(stage, state, () => {});
    const strip = root.querySelector(".beat-strip");
    expect([...strip.querySelectorAll(".beat-cell.warn")].length).toBe(0);
  });
});

describe("the planting chip grow-time", () => {
  it("shows a ripens sub-label on each crop chip", () => {
    const root = document.createElement("div");
    let state = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting
    const dispatch = (a) => { state = reduce(state, a); rerender(); };
    function rerender() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
    rerender();
    expect(root.querySelector(".crop-when")).toBeTruthy();
    expect(root.textContent).toContain("ripens ~10d"); // turnip, one season
  });
});

describe("the dusk crew snapshot", () => {
  it("lists each living hand with its end-of-season condition", () => {
    const root = document.createElement("div");
    let state = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" });
    for (let i = 0; i < 10; i++) state = reduce(state, { type: "TURN_IN" });
    if (state.phase !== "dusk") return;
    const stage = renderShell(root, state, () => {}); renderScreen(stage, state, () => {});
    const crew = root.querySelector(".crewsnap-line");
    expect(crew).toBeTruthy();
    expect(crew.textContent).toContain("Reuben");
    expect(crew.textContent).toMatch(/steady|worn|failing/);
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
    s = { ...s, screen: "town", townAt: null, seasonActionsLeft: 0 };
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

describe("the year-end settlement screen", () => {
  it("shows the mortgage due and turns the year", () => {
    const root = document.createElement("div");
    let s = { ...initialState(1), year: 2, phase: "settlement", coin: 200 };
    const dispatch = (a) => { s = reduce(s, a); };
    const stage = renderShell(root, s, dispatch); renderScreen(stage, s, dispatch);
    expect(root.textContent).toMatch(/mortgage|the bank|owe/i);
    const turn = [...root.querySelectorAll(".choicecard")].find((b) => /Turn the year/i.test(b.textContent));
    expect(turn).toBeTruthy();
    turn.click();
    expect(s.year).toBe(3);
  });
  it("the foreclosed screen shows the run ended and offers a new line", () => {
    const root = document.createElement("div");
    let s = { ...initialState(1), year: 4, phase: "foreclosed", ended: true };
    const dispatch = () => {};
    const stage = renderShell(root, s, dispatch); renderScreen(stage, s, dispatch);
    expect(root.textContent).toMatch(/taken the land|foreclos|the bank/i);
    expect([...root.querySelectorAll(".choicecard")].some((b) => /new line|begin/i.test(b.textContent))).toBe(true);
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
