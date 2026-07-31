import { el } from "./dom.js";
import { fieldCard } from "./components.js";
import { fieldProjection, clearCost, cropSummary } from "../core/selectors.js";
import { CROPS } from "../core/crops.js";

// The "place" panel: your fields. On desktop it sits on the LEFT (over the plate); on phone
// it stacks above the leaf. Interactive crop pickers during planting, a read-only projection
// board during the day, and nothing on other phases (the plate shows its art/portrait then).
export function boardPanel(state, dispatch) {
  if (state.screen === "town") {
    const cap = state.townAt ? "A place in Marrow's Cross" : "Marrow's Cross";
    return el("div", { class: "boardpanel townplate" }, [
      el("div", { class: "boardpanel-h t-label", text: "Marrow's Cross" }),
      el("div", { class: "townplate-art" }, [el("span", { class: "townplate-cap t-sub", text: cap })]),
    ]);
  }
  if (state.phase === "planting") {
    return el("div", { class: "boardpanel" }, [
      el("div", { class: "boardpanel-h t-label", text: "The fields" }),
      el("div", { class: "fieldgrid" }, state.fields.map((f) => plantingCell(state, f, dispatch))),
    ]);
  }
  if (state.phase === "day") {
    const planted = state.fields.filter((f) => f.crop);
    if (!planted.length) return null;
    return el("div", { class: "boardpanel" }, [
      el("div", { class: "boardpanel-h t-label", text: "The fields" }),
      el("div", { class: "fieldgrid" }, planted.map((f) => fieldCard(f, fieldProjection(state, f)))),
    ]);
  }
  return null;
}

// One field on the planting grid: its read (fieldCard), plus a crop picker while empty or a
// "clear" while planted. Picking dispatches PLANT; with the beat-only Turn motion only this
// cell repaints, so the grid does not flash.
function plantingCell(s, f, dispatch) {
  const proj = fieldProjection(s, f);
  let extra;
  if (!f.cleared) {
    const cost = clearCost(s);
    const afford = cost != null && s.coin >= cost;
    extra = el("button", { class: "clearbtn t-sub" + (afford ? "" : " disabled"), ...(afford ? {} : { disabled: true }),
      text: cost == null ? "cleared" : `Clear this ground · ${cost}m`,
      onClick: afford ? () => dispatch({ type: "CLEAR_FIELD", fieldId: f.id }) : undefined });
  } else if (f.crop) {
    extra = el("button", { class: "linkbtn t-sub", text: "clear", onClick: () => dispatch({ type: "FALLOW", fieldId: f.id }) });
  } else {
    extra = el("div", { class: "croppick" }, Object.entries(CROPS).map(([key, c]) => {
      const afford = s.seed + s.coin >= c.seed;
      const note = c.needsTwo ? " · two" : "";
      const { days, lean } = cropSummary(key);
      return el("button", { class: "cropchip t-sub" + (afford ? "" : " disabled"), ...(afford ? {} : { disabled: true }),
        onClick: afford ? () => dispatch({ type: "PLANT", fieldId: f.id, crop: key }) : undefined }, [
        el("span", { class: "cropchip-name", text: `${c.name} · ${c.seed}${note}` }),
        el("span", { class: "crop-when", text: `ripens ~${days}d · ${lean}` }),
      ]);
    }));
  }
  return fieldCard(f, proj, extra);
}
