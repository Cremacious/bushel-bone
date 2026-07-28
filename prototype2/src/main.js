import { initialState } from "./core/state.js";
import { reduce } from "./core/reducer.js";
import { renderShell } from "./render/shell.js";
import { renderScreen } from "./render/screens.js";
import { startFront } from "./front.js";

// Boot the game itself. Tests call this directly with a lineage name, skipping the
// front porch (title/naming/letter), exactly as the year1.html harness does.
export function boot(root, opts = {}) {
  let state = initialState(opts.seed ?? ((Math.random() * 1e9) >>> 0), opts.lineageName ?? "Crane");
  function dispatch(action) { state = reduce(state, action); render(); }
  function render() { const stage = renderShell(root, state, dispatch); renderScreen(stage, state, dispatch); }
  render();
  return { getState: () => state, dispatch };
}

// The real entry point: show the title menu, and boot the game once New Game finishes.
export function start(root) {
  return startFront(root, { onStart: (lineageName) => boot(root, { lineageName }) });
}

if (typeof document !== "undefined" && document.getElementById("app")) {
  window.__BB__ = start(document.getElementById("app"));
}
export const __BOOTED__ = true;
