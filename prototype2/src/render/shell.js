import { el, clear } from "./dom.js";
import { season, seasonLabel, DAYS_PER_SEASON, livingHands } from "../core/state.js";
import { warnings, burnsFuel, mouths } from "../core/selectors.js";
import { BALANCE } from "../core/balance.js";
import { icon, weatherIconName } from "./icons.js";
import { boardPanel } from "./board.js";
import { tok } from "../content/names.js";

const YEAR_WORD = ["One", "Two", "Three", "Four"];
const TABS = [["home", "Home"], ["fields", "Fields"], ["hands", "Hands"], ["town", "Town"], ["ledger", "Ledger"], ["almanac", "Almanac"]];

// The persistent V0.3 chrome. One DOM, two form factors (design reference §10):
//  - phone: a continuous stacked column (plate band, masthead, ledger, reading, tabs).
//  - desktop: a full-bleed plate with the masthead/location as floating chrome, Reuben
//    standing on the plate, and a floating "leaf" (ledger + reading + Ask Reuben) on the right.
// CSS does the arranging; this function just emits every piece in the phone stacking order.
export function renderShell(root, state, dispatch, { animate = true } = {}) {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.documentElement.setAttribute("data-season", season(state));
  clear(root);
  root.className = "shell";

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
        el("span", { class: "when t-label", text: `Year ${YEAR_WORD[state.year - 1] || state.year} · Day ${state.day} of ${DAYS_PER_SEASON}` }),
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
  // A fresh <main> each render; .m-turn (the "Turn" beat motion) is added only when the
  // beat actually changed (see main.js), so in-screen interactions do not re-animate.
  const stage = el("main", { class: "stage" + (animate ? " m-turn" : ""), id: "stage" });

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

  // The "place" panel: your fields. On desktop it floats on the left over the plate; on
  // phone it stacks. Null on non-field phases (brief/scene/dusk), where the plate shows art.
  const board = boardPanel(state, dispatch);

  // Order for the phone stack: masthead/location, then the plate band, then the fields, then
  // the leaf, then the tab bar. On desktop these are absolutely positioned, so z-index (not
  // DOM order) decides the stack: plate behind (0), chrome (2), board + leaf (3).
  root.append(chrome, plate, ...(board ? [board] : []), leaf, nav);
  return stage;
}

// ---- pieces ----

function pips(state) {
  const played = state.phase === "brief" || state.phase === "planting" ? 0 : Math.min(state.day, DAYS_PER_SEASON);
  const dots = [];
  for (let i = 0; i < DAYS_PER_SEASON; i++) dots.push(el("span", { class: "pip" + (i < played ? " on" : "") }));
  return el("span", { class: "pips" }, dots);
}

function brassLedger(state) {
  const larderShort = warnings(state).some((w) => /larder/i.test(w));
  const fuelWant = burnsFuel(state) ? mouths(state) * BALANCE.fuelPerMouthPerDay : 0;
  const ac = actionCounter(state);
  return el("div", { class: "ledger" }, [
    cell("Coin", state.coin, { unit: "m" }),
    cell("Larder", Math.floor(state.larder), { valence: state.larder <= 0 ? "bad" : larderShort ? "warn" : null }),
    cell("Fuel", state.fuel, { valence: fuelWant > state.fuel ? "bad" : null }),
    cell("Seed", state.seed),
    ...(ac ? [ac] : []),
  ]);
}

// The persistent season-actions counter: a plain "left / max" readout plus pips, visible in
// the brass ledger only during the day phase (when spending an action actually means
// something). Answers "how many of the season's actions are left" without opening a screen.
function actionCounter(state) {
  if (state.phase !== "day") return null;
  const left = state.actions, max = BALANCE.actionsCarryCap; // TASK 2: redesign the counter for the per-day action-point model
  const pips = [];
  for (let i = 0; i < max; i++) pips.push(el("span", { class: "apip" + (i < left ? " on" : "") }));
  return el("div", { class: "actioncount" }, [
    el("span", { class: "ac-k t-label", text: "Actions today" }),
    el("span", { class: "ac-pips" }, pips),
    el("span", { class: "ac-v t-label", text: `${left} / ${max}` }),
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

// The standing speaker portrait + lamp nameplate (reference §8.5). It appears ONLY when a
// character is actually addressing the player — a scripted scene — so the plate is not
// showing a silhouette during a quiet planting or day screen. Real art drops in later.
const SCENE_SPEAKER = { silas_welcome: { name: "{{npc.silas}}", role: "the banker" } };
function portrait(state) {
  const spk = state.phase === "scene" && state.scene && SCENE_SPEAKER[state.scene.id];
  if (!spk) return el("div", { class: "portrait empty" });
  return el("div", { class: "portrait" }, [
    el("div", { class: "sil" }, [el("span", { class: "sil-head" }), el("span", { class: "sil-body" })]),
    el("div", { class: "nameplate" }, [
      el("div", { class: "np-name t-title", text: tok(spk.name) }),
      el("div", { class: "np-role", text: spk.role }),
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
