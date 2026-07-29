import { initialState } from "./core/state.js";
import { reduce } from "./core/reducer.js";
import { renderShell } from "./render/shell.js";
import { renderScreen } from "./render/screens.js";
import { renderOverlay, tutorialOptIn } from "./render/overlay.js";
import { pendingTip } from "./content/tips.js";
import { startFront } from "./front.js";

// Boot the game itself. Tests call this directly with a lineage name, skipping the
// front porch (title/naming/letter), exactly as the year1.html harness does.
export function boot(root, opts = {}) {
  let state = initialState(opts.seed ?? ((Math.random() * 1e9) >>> 0), opts.lineageName ?? "Crane");
  let lastView = null; // the beat currently on screen; a change replays the Turn motion
  function dispatch(action) {
    state = reduce(state, action);
    // If tutorials are on and this move reached a mechanic Reuben hasn't explained yet,
    // he leans in with a tip before the player acts (once per mechanic).
    const tip = pendingTip(state);
    if (tip) state = { ...state, overlay: { type: "reuben-tip", tipId: tip.id, pages: tip.pages, page: 0 } };
    render();
  }
  function render() {
    const view = viewKey(state);
    const animate = view !== lastView;
    lastView = view;
    const stage = renderShell(root, state, dispatch, { animate });
    renderScreen(stage, state, dispatch);
    renderOverlay(root, state, dispatch); // modal layer (Reuben's direct address) on top
  }
  // Every New Game opens with Reuben offering to walk the player through it.
  if (opts.tutorialPrompt) state = { ...state, overlay: tutorialOptIn() };
  render();
  return { getState: () => state, dispatch };
}

// The "beat" on screen: the active tab, or the phase when on Home. Overlays and in-screen
// interactions (planting picks, day adjustments) keep the same key, so they do not re-animate.
function viewKey(s) { return s.screen === "home" ? s.phase : s.screen; }

// The real entry point: show the title menu, and boot the game once New Game finishes.
export function start(root) {
  return startFront(root, { onStart: (lineageName) => boot(root, { lineageName, tutorialPrompt: true }) });
}

if (typeof document !== "undefined" && document.getElementById("app")) {
  window.__BB__ = start(document.getElementById("app"));
}
export const __BOOTED__ = true;
