import { el, clear } from "./dom.js";
import { season, seasonLabel, WEEKS_PER_SEASON, livingHands } from "../core/state.js";
import { warnings, burnsFuel, mouths } from "../core/selectors.js";
import { BALANCE } from "../core/balance.js";
import { icon, weatherIconName } from "./icons.js";

const YEAR_WORD = ["One", "Two", "Three", "Four"];
const TABS = [["home", "Home"], ["fields", "Fields"], ["hands", "Hands"], ["town", "Town"], ["ledger", "Ledger"], ["almanac", "Almanac"]];

// The persistent V0.3 chrome. One DOM, two form factors (design reference §10):
//  - phone: a continuous stacked column (plate band, masthead, ledger, reading, tabs).
//  - desktop: a full-bleed plate with the masthead/location as floating chrome, Reuben
//    standing on the plate, and a floating "leaf" (ledger + reading + Ask Reuben) on the right.
// CSS does the arranging; this function just emits every piece in the phone stacking order.
export function renderShell(root, state, dispatch) {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.documentElement.setAttribute("data-season", season(state));
  clear(root);
  root.className = "shell";

  const dayOf20 = (state.week - 1) * 4 + 1; // week 1 -> day 1; a week is 4 days
  const loc = locationFor(state);

  // ---- the illustration plate (full-bleed on desktop, a band on phone) ----
  const plate = el("div", { class: "plate" }, [
    el("div", { class: "plate-tex" }),
    el("div", { class: "plate-vignette" }),
    el("div", { class: "plate-art t-sub", text: loc.brief }), // art-brief placeholder until real art
    portrait(state),
  ]);

  // ---- masthead + location band (floating chrome over the plate on desktop) ----
  const chrome = el("div", { class: "chrome" }, [
    el("header", { class: "masthead" }, [
      el("div", { class: "spine" }),
      el("div", { class: "mast-inner" }, [
        el("span", { class: "brand t-label", text: "Bushel & Bone" }),
        el("span", { class: "season t-plate", text: seasonLabel(state) }),
        el("span", { class: "when t-label", text: `Year ${YEAR_WORD[state.year - 1] || state.year} · Day ${dayOf20} of 20` }),
        pips(state),
        el("span", { class: "mast-tools" }, [
          el("span", { class: "wx" }, [icon(weatherIconName(state.weather), { size: 20, sw: 1.6 }),
            el("span", { class: "wx-label t-label", text: state.weather.label })]),
          el("button", { class: "iconbtn", "aria-label": "Toggle day and night",
            onClick: () => dispatch({ type: "SET_THEME", theme: state.theme === "night" ? "day" : "night" }),
            text: state.theme === "night" ? "☾" : "☀" }),
        ]),
      ]),
    ]),
    el("div", { class: "locband" }, [
      el("span", { class: "loc-spine" }),
      el("span", { class: "loc-name t-title", text: loc.name }),
      el("span", { class: "loc-cap", text: loc.caption }),
    ]),
  ]);

  // ---- the leaf: ledger + household + reading stage + Ask Reuben ----
  const ledger = brassLedger(state);
  const warns = warnBand(warnings(state));
  const stage = el("main", { class: "stage m-turn", id: "stage" }); // fresh element → Turn replays

  const leaf = el("div", { class: "leaf" }, [
    ledger,
    household(state, dispatch),
    ...(warns ? [warns] : []),
    el("div", { class: "leaf-scroll" }, [stage]),
    askReuben(dispatch),
  ]);

  const nav = el("nav", { class: "tabbar" }, TABS.map(([key, label]) => {
    const active = state.screen === key;
    return el("button", { class: "tab" + (active ? " sel" : ""), "data-tab": key,
      onClick: () => dispatch({ type: "SET_SCREEN", screen: key }) }, [
      icon(key, { size: 24, sw: 1.8 }),
      el("span", { class: "tab-label", text: label }),
    ]);
  }));

  // Order for the phone stack: masthead/location, then the plate band, then the leaf,
  // then the tab bar. On desktop these are absolutely positioned, so z-index (not DOM
  // order) decides the stack: plate behind (0), chrome (2), leaf (3).
  root.append(chrome, plate, leaf, nav);
  return stage;
}

// ---- pieces ----

function pips(state) {
  const played = state.phase === "brief" || state.phase === "planting" ? 0 : Math.min(state.week, WEEKS_PER_SEASON);
  const dots = [];
  for (let i = 0; i < WEEKS_PER_SEASON; i++) dots.push(el("span", { class: "pip" + (i < played ? " on" : "") }));
  return el("span", { class: "pips" }, dots);
}

function brassLedger(state) {
  const larderShort = warnings(state).some((w) => /larder/i.test(w));
  const fuelWant = burnsFuel(state) ? mouths(state) * BALANCE.fuelPerMouthPerWeek : 0;
  return el("div", { class: "ledger" }, [
    cell("Coin", state.coin, { unit: "m" }),
    cell("Larder", Math.floor(state.larder), { valence: state.larder <= 0 ? "bad" : larderShort ? "warn" : null }),
    cell("Fuel", state.fuel, { valence: fuelWant > state.fuel ? "bad" : null }),
    cell("Seed", state.seed),
  ]);
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

// The household strip: the foreman, morale dots, your standing (Regard), a roster button.
function household(state, dispatch) {
  const foreman = state.hands.find((h) => h.id === state.foremanId && h.alive) || livingHands(state)[0];
  const kids = [el("span", { class: "hh-k t-label", text: "Household" })];
  if (foreman) {
    kids.push(el("span", { class: "hh-name t-choice", text: foreman.name }), moraleDots(foreman.morale));
  }
  kids.push(
    el("span", { class: "hh-regard" }, [
      el("span", { class: "hh-k t-label", text: "Regard" }),
      el("span", { class: "hh-regard-v t-title", text: regardWord(state.regard) }),
    ]),
    el("button", { class: "rosterbtn t-label", text: "Show roster",
      onClick: () => dispatch({ type: "SET_SCREEN", screen: "hands" }) }),
  );
  return el("div", { class: "household" }, kids);
}

function moraleDots(morale = 0) {
  const dots = [];
  const band = morale >= 4 ? "good" : morale >= 2 ? "warn" : "bad";
  for (let i = 0; i < 5; i++) dots.push(el("span", { class: "mdot" + (i < morale ? " on " + band : "") }));
  return el("span", { class: "morale" }, dots);
}

// The standing speaker portrait + lamp nameplate (reference §8.5). Reuben, the foreman,
// stands on the plate through the Plan-2 beats; real art and other speakers drop in later.
function portrait(state) {
  const foreman = state.hands.find((h) => h.id === state.foremanId && h.alive) || livingHands(state)[0];
  if (!foreman) return el("div", { class: "portrait empty" });
  return el("div", { class: "portrait" }, [
    el("div", { class: "sil" }, [el("span", { class: "sil-head" }), el("span", { class: "sil-body" })]),
    el("div", { class: "nameplate" }, [
      el("div", { class: "np-name t-title", text: foreman.name }),
      el("div", { class: "np-role", text: state.foremanId === foreman.id ? "your foreman" : "a hand" }),
    ]),
  ]);
}

// The Ask Reuben bar (a placeholder affordance until the tutor feature ports over).
function askReuben(dispatch) {
  return el("div", { class: "askbar", title: "Ask Reuben (coming soon)" }, [
    el("span", { class: "ask-dot" }),
    el("span", { class: "ask-label", text: "Ask Reuben " }),
    el("span", { class: "ask-hint t-sub", text: "what to do" }),
    el("span", { class: "ask-q", text: "?" }),
  ]);
}

function warnBand(list) {
  if (!list.length) return null;
  return el("div", { class: "warnband" + (list.length > 1 ? " stacked" : "") },
    list.map((w) => el("div", { class: "warnline t-sub", text: w })));
}

function regardWord(r = 0) {
  if (r < 15) return "Stranger";
  if (r < 35) return "Known";
  if (r < 55) return "Familiar";
  if (r < 75) return "Trusted";
  return "Kin";
}

// The place the current beat happens. Plan-2 beats are all at the homestead; the Town
// tab names Marrow's Cross. Real per-scene locations arrive with the town/events plans.
function locationFor(state) {
  if (state.screen === "town") return { name: "Marrow's Cross", caption: "the town at the crossroads", brief: "[ the town green, lanterns strung between the low roofs ]" };
  return { name: "The Homestead", caption: "four fields, a house, and a woodpile that will not do",
    brief: "[ the four fallow fields, the lean-to, and the low woodpile behind the house ]" };
}

export { TABS };
