import { describe, it, expect } from "vitest";
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

import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { renderShell, TABS } from "../src/render/shell.js";

describe("shell render", () => {
  it("renders masthead, four ledger cells, six named tabs, and the day counter", () => {
    const root = document.createElement("div");
    let state = initialState(1, "Mackall");
    renderShell(root, state, () => {});
    expect(root.querySelectorAll(".ledger .cell").length).toBe(4);
    expect([...root.querySelectorAll(".tabbar .tab")].map((t) => t.textContent)).toEqual(TABS);
    expect(root.querySelector(".when").textContent).toContain("Day 1 of 20");
    expect(document.documentElement.getAttribute("data-season")).toBe("spring");
  });
  it("the theme toggle dispatches SET_THEME and re-renders to day", () => {
    const root = document.createElement("div");
    let state = initialState(1);
    const dispatch = (action) => { state = reduce(state, action); renderShell(root, state, dispatch); };
    renderShell(root, state, dispatch);
    root.querySelector(".themetog").click();
    expect(state.theme).toBe("day");
    expect(document.documentElement.getAttribute("data-theme")).toBe("day");
  });
});
