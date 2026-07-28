import { initialState } from "./core/state.js";
import { reduce } from "./core/reducer.js";
import { renderShell } from "./render/shell.js";
import { renderScreen } from "./render/screens.js";

export function boot(root, opts = {}) {
  let state = initialState(opts.seed ?? ((Math.random() * 1e9) >>> 0), opts.lineageName ?? "Crane");
  function dispatch(action) { state = reduce(state, action); render(); }
  function render() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
  render();
  return { getState: () => state, dispatch };
}

if (typeof document !== "undefined" && document.getElementById("app")) {
  window.__BB__ = boot(document.getElementById("app"));
}
export const __BOOTED__ = true;
