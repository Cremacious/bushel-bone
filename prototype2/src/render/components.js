import { el } from "./dom.js";
import { tok } from "../content/names.js";
import { fieldLabel } from "../core/selectors.js";

// A dual-label choice card: title line + optional mechanical tag (Courier, valence-colored)
// + optional sub line; disabled shows the arithmetic instead of a hover. Matches Screen 04.
export function choiceCard(choice, onPick) {
  const disabled = !!choice.disabled;
  // The mechanical tag (Courier), colored by valence: `tagValence` is "good" | "bad" | "".
  const tag = choice.tag ? el("span", { class: "ctag" + (choice.tagValence ? " " + choice.tagValence : ""), text: tok(choice.tag) }) : null;
  const title = el("span", { class: "ctitle t-choice", text: tok(choice.text) }, tag ? [tag] : []);
  const sub = (disabled && choice.why) || choice.sub
    ? el("span", { class: "csub t-sub", text: tok((disabled && choice.why) || choice.sub) })
    : null;
  return el("button", {
    class: "choicecard" + (choice.primary ? " primary" : "") + (disabled ? " disabled" : ""),
    ...(disabled ? { disabled: true } : {}),
    onClick: disabled ? undefined : onPick,
  }, [title, sub]);
}

// A field's read: name + fertility, and either its crop with a growth bar and projection,
// or "fallow". `proj` is fieldProjection(state, field). `extra` (optional) appends controls
// (a crop picker on the planting grid, a task chip on the weekly board).
export function fieldCard(field, proj, extra) {
  const fert = el("span", { class: "fc-fert", text: "●".repeat(field.fert) + "○".repeat(3 - field.fert) });
  const head = el("div", { class: "fc-head" }, [
    el("span", { class: "fc-name t-choice", text: fieldLabel(field) }), fert,
  ]);
  const body = el("div", { class: "fc-body" });
  if (proj.crop) {
    const total = proj.ripe ? field.progress : field.progress + proj.weeksToRipe * 0.2; // approx seasons to full
    const pct = Math.max(4, Math.min(100, Math.round((field.progress / (total || 1)) * 100)));
    body.append(
      el("div", { class: "fc-crop t-sub", text: proj.name + (proj.needsTwo ? " · two hands" : "") }),
      el("div", { class: "fc-bar" }, [el("div", { class: "fc-fill" + (proj.ripe ? " ripe" : ""), style: `width:${pct}%` })]),
      el("div", { class: "fc-proj" }, [
        el("span", { class: "t-sub" + (proj.ripe ? " good" : ""), text: proj.when }),
        el("span", { class: "fc-yield t-sub", text: `${proj.yield.amount} ${proj.yield.kind}` }),
      ]),
    );
  } else {
    body.append(el("div", { class: "fc-crop t-sub", text: "fallow" }));
  }
  return el("div", { class: "fieldcard" + (proj.ripe ? " ripe" : "") }, [head, body, ...(extra ? [extra] : [])]);
}

export function warnLines(list) {
  return list.length ? el("div", { class: "warnlines" }, list.map((w) => el("div", { class: "warnline t-sub", text: w }))) : null;
}
