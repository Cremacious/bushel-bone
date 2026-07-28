import { el } from "./dom.js";
import { seasonLabel } from "../core/state.js";
import { L } from "../content/script.js";
import { tok } from "../content/names.js";
import { choiceCard } from "./components.js";
import { CROPS } from "../core/crops.js";
import { fieldLabel } from "../core/selectors.js";

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
    const eyebrow = isFirst ? tok(L("spring_open.eyebrow")) : `${seasonLabel(s)} · a new season`;
    const title = isFirst ? tok(L("spring_open.title")) : "The season turns";
    const body = isFirst ? tok(L("spring_open.body")) : `<div class="prose"><p>The work of ${seasonLabel(s)} is on you now.</p></div>`;
    stage.append(
      el("div", { class: "eyebrow t-label", text: eyebrow }),
      el("h2", { class: "t-title", text: title }),
      htmlProse(body),
      choiceCard({ text: "Begin", sub: "set the season to its work", primary: true }, () => dispatch({ type: "BEGIN_SEASON" })),
    );
  },
  planting: (stage, s, dispatch) => {
    stage.append(el("div", { class: "eyebrow t-label", text: "Dawn · Planting" }), el("h2", { class: "t-title", text: "Set the fields" }));
    for (const f of s.fields) {
      const row = el("div", { class: "fieldrow" }, [
        el("div", { class: "fieldname t-choice", text: fieldLabel(f) }),
        el("div", { class: "fert", text: "fert " + "●".repeat(f.fert) + "○".repeat(3 - f.fert) }),
      ]);
      if (f.crop) row.append(el("div", { class: "t-sub", text: `${CROPS[f.crop].name}, in the ground` }),
        el("button", { class: "linkbtn t-sub", text: "clear", onClick: () => dispatch({ type: "FALLOW", fieldId: f.id }) }));
      else {
        const picker = el("div", { class: "croppick" }, Object.entries(CROPS).map(([key, c]) => {
          const cost = c.seed, afford = s.seed + s.coin >= cost;
          return el("button", { class: "cropchip t-sub" + (afford ? "" : " disabled"), ...(afford ? {} : { disabled: true }),
            text: `${c.name} · ${c.seed} seed`, onClick: afford ? () => dispatch({ type: "PLANT", fieldId: f.id, crop: key }) : undefined });
        }));
        row.append(picker);
      }
      stage.append(row);
    }
    stage.append(choiceCard({ text: "Sow it so", sub: "put the season in the ground", primary: true }, () => dispatch({ type: "SOW" })));
  },
  // week, dusk, yearend, fields, hands, ledger, almanac added in later tasks
};
export { SCREENS };

// The script bodies are HTML (from #46) and carry their own `.prose` wrapper; render
// them as real nodes in a plain typographic container (no second `.prose` to nest).
function htmlProse(html) { const d = el("div", { class: "t-prose" }); d.innerHTML = html; return d; }
