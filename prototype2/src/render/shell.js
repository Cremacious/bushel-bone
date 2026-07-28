import { el, clear } from "./dom.js";
import { season, seasonLabel, WEEKS_PER_SEASON } from "../core/state.js";
import { warnings, burnsFuel, mouths } from "../core/selectors.js";
import { BALANCE } from "../core/balance.js";
import { icon, weatherIconName } from "./icons.js";

const YEAR_WORD = ["One", "Two", "Three", "Four"];
const TABS = [["home", "Home"], ["fields", "Fields"], ["hands", "Hands"], ["town", "Town"], ["ledger", "Ledger"], ["almanac", "Almanac"]];

// The persistent V0.3 chrome (design reference §8.6/§8.1/§8.7, portrait shell §10):
// season spine, masthead, brass ledger bar, optional warnings band, stage, six-tab bar.
export function renderShell(root, state, dispatch) {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.documentElement.setAttribute("data-season", season(state));
  clear(root);

  const dayOf20 = (state.week - 1) * 4 + 1; // week 1 -> day 1; a week is 4 days

  const masthead = el("header", { class: "masthead" }, [
    el("div", { class: "spine" }), // the season, on the shell's binding edge
    el("div", { class: "mast-row" }, [
      el("span", { class: "brand t-label", text: "Bushel & Bone" }),
      el("span", { class: "mast-tools" }, [
        el("span", { class: "wx" }, [icon(weatherIconName(state.weather), { size: 20, sw: 1.6 }),
          el("span", { class: "wx-label t-label", text: state.weather.label })]),
        el("button", { class: "iconbtn", "aria-label": "Toggle day and night",
          onClick: () => dispatch({ type: "SET_THEME", theme: state.theme === "night" ? "day" : "night" }),
          text: state.theme === "night" ? "☾" : "☀" }),
      ]),
    ]),
    el("div", { class: "mast-when" }, [
      el("span", { class: "season t-plate", text: seasonLabel(state) }),
      el("span", { class: "when t-label", text: `Year ${YEAR_WORD[state.year - 1] || state.year} · Day ${dayOf20} of 20` }),
      pips(state),
    ]),
  ]);

  const ledger = brassLedger(state);
  const warns = warnBand(warnings(state));

  // A fresh <main> each render, so .m-turn replays the beat "Turn" on every screen change.
  const stage = el("main", { class: "stage m-turn", id: "stage" });

  const nav = el("nav", { class: "tabbar" }, TABS.map(([key, label]) => {
    const active = state.screen === key;
    return el("button", { class: "tab" + (active ? " sel" : ""), "data-tab": key,
      onClick: () => dispatch({ type: "SET_SCREEN", screen: key }) }, [
      icon(key, { size: 24, sw: 1.8 }),
      el("span", { class: "tab-label", text: label }),
    ]);
  }));

  root.append(masthead, ledger, ...(warns ? [warns] : []), stage, nav);
  return stage;
}

// Five season pips; filled = weeks under way (1..5 once the season is being played).
function pips(state) {
  const played = state.phase === "brief" || state.phase === "planting" ? 0 : Math.min(state.week, WEEKS_PER_SEASON);
  const dots = [];
  for (let i = 0; i < WEEKS_PER_SEASON; i++) dots.push(el("span", { class: "pip" + (i < played ? " on" : "") }));
  return el("span", { class: "pips" }, dots);
}

// The brass ledger bar (reference §8.1): four figures, a value colored by valence when
// the resource runs short (larder → warn, fuel → bad), then the warnings band below.
function brassLedger(state) {
  const larderShort = warnings(state).some((w) => /larder/i.test(w));
  const fuelWant = burnsFuel(state) ? mouths(state) * BALANCE.fuelPerMouthPerWeek : 0;
  const cells = [
    cell("Coin", state.coin, { unit: "m" }),
    cell("Larder", Math.floor(state.larder), { valence: state.larder <= 0 ? "bad" : larderShort ? "warn" : null }),
    cell("Fuel", state.fuel, { valence: fuelWant > state.fuel ? "bad" : null }),
    cell("Seed", state.seed),
  ];
  return el("div", { class: "ledger" }, cells);
}

function cell(label, value, { unit, valence } = {}) {
  return el("div", { class: "cell" }, [
    el("div", { class: "cell-k t-label", text: label }),
    el("div", { class: "cell-v" + (valence ? " " + valence : "") }, [
      document.createTextNode(String(value)),
      ...(unit ? [el("span", { class: "unit", text: unit })] : []),
    ]),
  ]);
}

// Warnings ride under the ledger, one full line each, tier-colored left border.
function warnBand(list) {
  if (!list.length) return null;
  return el("div", { class: "warnband" + (list.length > 1 ? " stacked" : "") },
    list.map((w) => el("div", { class: "warnline t-sub", text: w })));
}

export { TABS };
