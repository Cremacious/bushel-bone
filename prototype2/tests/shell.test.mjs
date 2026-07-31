import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tokens = readFileSync(join(here, "..", "src", "styles", "tokens.css"), "utf8");

describe("design tokens", () => {
  it("defines the V0.3 night palette, lamp, and season accents", () => {
    expect(tokens).toContain("--paper:#17130d");
    expect(tokens).toContain("--lamp:#d9a441");
    expect(tokens).toContain('[data-season="fall"]{ --accent:#a4482a; }');
    expect(tokens).toContain('[data-theme="day"]');
  });
});

import { initialState } from "./helpers/no-events-state.mjs";
import { reduce } from "../src/core/reducer.js";
import { renderShell, TABS } from "../src/render/shell.js";

describe("shell render", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-season");
  });

  it("renders masthead, four ledger cells, six named tabs, and the day counter", () => {
    const root = document.createElement("div");
    let state = initialState(1, "Mackall");
    renderShell(root, state, () => {});
    expect(root.querySelectorAll(".ledger .cell").length).toBe(4);
    expect([...root.querySelectorAll(".tabbar .tab .tab-label")].map((t) => t.textContent)).toEqual(TABS.map((t) => t[1]));
    expect(root.querySelector(".when").textContent).toContain("Day 1 of 10");
    expect(document.documentElement.getAttribute("data-season")).toBe("spring");
  });
  it("the theme toggle dispatches SET_THEME and re-renders to day", () => {
    const root = document.createElement("div");
    let state = initialState(1);
    const dispatch = (action) => { state = reduce(state, action); renderShell(root, state, dispatch); };
    renderShell(root, state, dispatch);
    root.querySelector(".iconbtn").click();
    expect(state.theme).toBe("day");
    expect(document.documentElement.getAttribute("data-theme")).toBe("day");
  });
});

describe("persistent action counter", () => {
  it("shows the action-point counter in the chrome during the day", () => {
    const root = document.createElement("div");
    let s = reduce(reduce(initialState(1), { type: "BEGIN_SEASON" }), { type: "SOW" }); // day, one point of two
    renderShell(root, s, () => {});
    const c = root.querySelector(".actioncount");
    expect(c).toBeTruthy();
    expect(c.textContent).toMatch(/1\s*\/\s*2/); // TASK 2: redesign the counter for the per-day action-point model
  });
  it("does not show the counter outside the day phase", () => {
    const root = document.createElement("div");
    let s = initialState(1); // brief phase
    renderShell(root, s, () => {});
    expect(root.querySelector(".actioncount")).toBeFalsy();
  });
});
