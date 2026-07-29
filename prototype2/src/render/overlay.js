import { el } from "./dom.js";
import { choiceCard } from "./components.js";
import { tok } from "../content/names.js";

// A modal layer over the shell (design reference §8.7 popover / roster overlay). Today it
// carries Reuben's direct address: whenever he speaks TO the player (the New Game tutorial
// offer, and later his tips), he gets his avatar and nameplate so it is unmistakably him.
export function renderOverlay(root, state, dispatch) {
  if (!state.overlay) return;
  const o = state.overlay;
  if (o.type === "reuben") {
    root.append(reubenModal(o, dispatch));
  }
}

// Show a Reuben tutorial-opt-in prompt. Called on New Game.
export function tutorialOptIn() {
  return {
    type: "reuben",
    title: "Reuben has a word",
    body: "First season on the place? I can walk you through the working of it as we go, or stand back and let you find your own feet. Either suits me.",
    choices: [
      { text: "Walk me through it", sub: "Reuben's tips, as each thing first comes up", action: { type: "SET_TUTORIALS", on: true } },
      { text: "I'll manage", sub: "no tips; learn it by doing", action: { type: "SET_TUTORIALS", on: false } },
    ],
  };
}

function reubenModal(o, dispatch) {
  const scrim = el("div", { class: "overlay-scrim" });
  const speaker = el("div", { class: "ov-speaker" }, [
    el("div", { class: "ov-avatar" }, [el("span", { class: "sil-head" }), el("span", { class: "sil-body" })]),
    el("div", { class: "ov-nameplate" }, [
      el("div", { class: "ov-name t-title", text: tok("{{npc.reuben}}") }),
      el("div", { class: "ov-role", text: "your foreman" }),
    ]),
  ]);
  const panel = el("div", { class: "overlay-panel m-turn" }, [
    speaker,
    o.title ? el("div", { class: "eyebrow t-label", text: o.title }) : null,
    el("div", { class: "ov-body t-prose" }, [el("p", { text: tok(o.body) })]),
    el("div", { class: "ov-choices" },
      (o.choices || []).map((c, i) => choiceCard(
        { text: c.text, sub: c.sub, primary: i === 0 },
        () => dispatch(c.action || { type: "CLOSE_OVERLAY" }),
      ))),
  ]);
  return el("div", { class: "overlay" }, [scrim, panel]);
}
