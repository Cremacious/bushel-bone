import { el } from "./dom.js";
import { tok } from "../content/names.js";

// A dual-label choice card: title line + optional mechanical tag (Courier, valence-colored)
// + optional sub line; disabled shows the arithmetic instead of a hover. Matches Screen 04.
export function choiceCard(choice, onPick) {
  const disabled = !!choice.disabled;
  const tag = choice.tag ? el("span", { class: "ctag", text: tok(choice.tag) }) : null;
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

export function warnLines(list) {
  return list.length ? el("div", { class: "warnlines" }, list.map((w) => el("div", { class: "warnline t-sub", text: w }))) : null;
}
