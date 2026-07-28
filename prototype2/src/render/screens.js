import { el } from "./dom.js";
import { season } from "../core/state.js";
import { L } from "../content/script.js";
import { tok } from "../content/names.js";
import { choiceCard } from "./components.js";

// Fleshed out across Tasks 8-12. Renders the active screen into the shell's stage.
export function renderScreen(stage, state, dispatch) {
  const view = state.screen === "home" ? state.phase : state.screen;
  const fn = SCREENS[view] || SCREENS.unknown;
  fn(stage, state, dispatch);
}

const SCREENS = {
  unknown: (stage, s) => stage.append(el("p", { class: "t-prose", text: `(${s.screen}/${s.phase})` })),

  brief: (stage, s, dispatch) => {
    const isFirst = s.year === 1 && s.seasonIndex === 0;
    const eyebrow = isFirst ? tok(L("spring_open.eyebrow")) : `${cap(s)} · a new season`;
    const title = isFirst ? tok(L("spring_open.title")) : "The season turns";
    const body = isFirst ? tok(L("spring_open.body")) : `<p>The work of ${cap(s)} is on you now.</p>`;
    stage.append(
      el("div", { class: "eyebrow t-label", text: eyebrow }),
      el("h2", { class: "t-title", text: title }),
      htmlProse(body),
      choiceCard({ text: "Begin", sub: "set the season to its work", primary: true }, () => dispatch({ type: "BEGIN_SEASON" })),
    );
  },
  // planting, week, dusk, yearend, fields, hands, ledger, almanac added in later tasks
};
export { SCREENS };

function cap(s) { return { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" }[season(s)]; }
// The script bodies are HTML (from #46). Render them as real nodes.
function htmlProse(html) { const d = el("div", { class: "prose t-prose" }); d.innerHTML = html; return d; }
