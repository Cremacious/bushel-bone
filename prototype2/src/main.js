import { initialState } from "./core/state.js";
import { reduce } from "./core/reducer.js";
import { renderShell } from "./render/shell.js";
import { el } from "./render/dom.js";

export function boot(root, opts = {}) {
  let state = initialState(opts.seed ?? ((Math.random() * 1e9) >>> 0), opts.lineageName ?? "Crane");
  function dispatch(action) { state = reduce(state, action); render(); }
  function render() {
    const stage = renderShell(root, state, dispatch);
    // Placeholder screen content until Plan 2 wires the Morning Brief.
    stage.append(el("h2", { class: "t-title", text: "Morning Brief" }),
      el("button", { class: "t-choice", text: "Advance the week", onClick: () => dispatch({ type: "ADVANCE_WEEK" }) }));
  }
  render();
  return { getState: () => state, dispatch };
}

if (typeof document !== "undefined" && document.getElementById("app")) {
  window.__BB__ = boot(document.getElementById("app"));
}
export const __BOOTED__ = true;
