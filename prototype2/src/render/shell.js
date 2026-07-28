import { el, clear } from "./dom.js";
import { season } from "../core/state.js";
import { warnings } from "../core/selectors.js";
import { warnLines } from "./components.js";

const SEASON_LABEL = { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" };
const YEAR_WORD = ["One", "Two", "Three", "Four"];
const TABS = ["Home", "Fields", "Hands", "Town", "Ledger", "Almanac"];

// Renders the persistent chrome around whatever screen is active. Reads state,
// writes DOM into `root`, and calls back on dispatchable UI (theme, tabs, advance).
export function renderShell(root, state, dispatch) {
  // Theme/season live on <html> so tokens.css's :root[data-theme=...] and
  // [data-season=...] selectors actually match (:root is always <html>, never `root`).
  document.documentElement.setAttribute("data-theme", state.theme);
  document.documentElement.setAttribute("data-season", season(state));
  clear(root);

  const dayOf20 = (state.week - 1) * 4 + 1; // week 1 -> day 1; a week is 4 days
  const masthead = el("header", { class: "masthead" }, [
    el("span", { class: "brand t-plate", text: "Bushel & Bone" }),
    el("span", { class: "season t-title", text: SEASON_LABEL[season(state)] }),
    el("span", { class: "when t-label", text: `Year ${YEAR_WORD[state.year - 1] || state.year} · Day ${dayOf20} of 20` }),
    el("span", { class: "weather t-label", text: state.weather.label }),
    el("button", { class: "themetog", "aria-label": "Toggle day and night",
      onClick: () => dispatch({ type: "SET_THEME", theme: state.theme === "night" ? "day" : "night" }), text: "☾" }),
  ]);

  const ledger = el("div", { class: "ledger" }, [
    cell("Coin", state.coin, "m"), cell("Larder", Math.floor(state.larder)),
    cell("Fuel", state.fuel), cell("Seed", state.seed),
  ]);
  const warns = warnLines(warnings(state));

  const stage = el("main", { class: "stage", id: "stage" });

  const nav = el("nav", { class: "tabbar" }, TABS.map((t) => {
    const key = t.toLowerCase();
    const active = (state.screen === "home" ? "home" : state.screen) === key;
    return el("button", { class: "tab" + (active ? " sel" : ""), "data-tab": key,
      onClick: () => dispatch({ type: "SET_SCREEN", screen: key }), text: t });
  }));

  root.append(masthead, ledger, ...(warns ? [warns] : []), stage, nav);
  return stage;
}

function cell(label, value, unit) {
  return el("div", { class: "cell" }, [
    el("div", { class: "t-label", text: label }),
    el("div", { class: "t-fig", text: unit ? `${value}${unit}` : String(value) }),
  ]);
}
export { TABS };
