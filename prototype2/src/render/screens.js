import { el } from "./dom.js";
import { seasonLabel } from "../core/state.js";
import { L } from "../content/script.js";
import { tok } from "../content/names.js";
import { choiceCard } from "./components.js";
import { CROPS } from "../core/crops.js";
import { fieldLabel, conditionOf, ripeFields, duskSummary } from "../core/selectors.js";

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
  week: (stage, s, dispatch) => {
    stage.append(el("div", { class: "eyebrow t-label", text: `Week ${s.week} of ${5}` }), el("h2", { class: "t-title", text: "Set the crew to work" }));
    const TASKS = [["rest", "Rest"], ["tend", "Tend"], ["harvest", "Harvest"], ["chop", "Chop wood"]];
    const plantedFields = s.fields.filter((f) => f.crop);
    for (const h of s.hands.filter((x) => x.alive)) {
      const row = el("div", { class: "handrow" }, [
        el("span", { class: "hname t-choice", text: h.name }),
        el("span", { class: "hcond t-sub", text: conditionOf(h) }),
      ]);
      const sel = el("div", { class: "taskpick" }, TASKS.map(([task, label]) =>
        el("button", { class: "taskbtn t-sub" + (h.task === task ? " sel" : ""), text: label,
          onClick: () => dispatch({ type: "ASSIGN", handId: h.id, task,
            targetFieldId: task === "tend" ? (plantedFields[0]?.id) : task === "harvest" ? (ripeFields(s)[0]?.id) : undefined }) })));
      row.append(sel);
      stage.append(row);
    }
    // The player's own week
    stage.append(el("div", { class: "eyebrow t-label", text: "Your own week" }));
    const P = [["rest", "Rest"], ["work", "Work a field"], ["care", "Sit with a hand"]];
    stage.append(el("div", { class: "taskpick" }, P.map(([kind, label]) =>
      el("button", { class: "taskbtn t-sub" + (s.playerAction?.kind === kind ? " sel" : ""), text: label,
        onClick: () => dispatch({ type: "SET_PLAYER_ACTION", kind,
          target: kind === "work" ? (plantedFields[0]?.id) : kind === "care" ? (s.hands.find((x) => x.alive)?.id) : undefined }) }))));
    stage.append(choiceCard({ text: "Put them to work", sub: "let the week play out", primary: true }, () => dispatch({ type: "RESOLVE_WEEK" })));
  },
  dusk: (stage, s, dispatch) => {
    const d = duskSummary(s);
    stage.append(el("div", { class: "eyebrow t-label", text: `Dusk · ${seasonLabel(s)}` }), el("h2", { class: "t-title", text: "The day-book, closed" }));
    const book = el("div", { class: "daybook" }, [
      line("Coin in hand", `${d.coin} m`), line("Larder into next season", `${d.larder} food`),
      line("Fuel laid by", `${d.fuel}`), line("The crew that stands", d.crew.join(", ") || "only you"),
    ]);
    stage.append(book);
    for (const l of d.lostThisSeason) stage.append(el("p", { class: "omen t-sub", text: l }));
    for (const w of d.warnings) stage.append(el("p", { class: "warnline t-sub", text: w }));
    stage.append(choiceCard({ text: "Turn the page", sub: "on to what comes next", primary: true }, () => dispatch({ type: "END_SEASON" })));
  },
  yearend: (stage, s, dispatch) => {
    stage.append(el("div", { class: "verdict t-label", text: "Year One · closed" }),
      el("h2", { class: "t-title", text: "“I survived another year.”" }),
      el("p", { class: "prose t-prose", text: "The Winter broke, and the household woke to the thaw. You made it. Not everyone does." }),
      choiceCard({ text: "Play another first year", sub: "a new seed, a new weather", primary: true }, () => { try { location.reload && location.reload(); } catch { /* jsdom: no-op */ } }));
  },
  // fields, hands, ledger, almanac added in later tasks
};
export { SCREENS };

// The script bodies are HTML (from #46) and carry their own `.prose` wrapper; render
// them as real nodes in a plain typographic container (no second `.prose` to nest).
function htmlProse(html) { const d = el("div", { class: "t-prose" }); d.innerHTML = html; return d; }

function line(label, value) {
  return el("div", { class: "bookline" }, [el("span", { class: "t-sub", text: label }), el("span", { class: "t-choice", text: value })]);
}
