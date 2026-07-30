import { el } from "./dom.js";

// Engraver-outline icons (design reference §6): single-weight stroked line, open ends,
// no fills, 30px grid. Stroke is `currentColor` so CSS colors them (season accent when
// selected, ink-faint otherwise). Built as inline SVG markup on a <span> to sidestep
// the SVG namespace; these are static, trusted strings.
const P = {
  // weather / resource glyphs
  sun:   '<circle cx="15" cy="15" r="5.5"/><g stroke-linecap="round"><line x1="15" y1="3.5" x2="15" y2="7"/><line x1="15" y1="23" x2="15" y2="26.5"/><line x1="3.5" y1="15" x2="7" y2="15"/><line x1="23" y1="15" x2="26.5" y2="15"/><line x1="7" y1="7" x2="9.5" y2="9.5"/><line x1="20.5" y1="20.5" x2="23" y2="23"/><line x1="20.5" y1="9.5" x2="23" y2="7"/><line x1="7" y1="23" x2="9.5" y2="20.5"/></g>',
  cloud: '<path d="M7 20 h14 a4.5 4.5 0 0 0 0-9 a5.5 5.5 0 0 0-10.5-1.6 A4.5 4.5 0 0 0 7 20 Z" stroke-linecap="round"/>',
  rain:  '<path d="M7 15 h14 a4.5 4.5 0 0 0 0-9 a5.5 5.5 0 0 0-10.5-1.6 A4.5 4.5 0 0 0 7 15 Z" stroke-linecap="round"/><g stroke-linecap="round"><line x1="10" y1="19" x2="8.5" y2="25"/><line x1="15" y1="19" x2="13.5" y2="25"/><line x1="20" y1="19" x2="18.5" y2="25"/></g>',
  snow:  '<g stroke-linecap="round"><line x1="15" y1="5" x2="15" y2="25"/><line x1="6.5" y1="9.8" x2="23.5" y2="20.2"/><line x1="23.5" y1="9.8" x2="6.5" y2="20.2"/></g>',
  // six-tab bottom bar
  home:    '<path d="M5 15 L15 6 L25 15 M8 13 v11 h14 v-11" stroke-linecap="round"/>',
  fields:  '<path d="M4 22 h22 M6 22 v-8 h5 v8 M13 22 v-12 h5 v12 M20 22 v-6 h4 v6" stroke-linecap="round"/>',
  hands:   '<circle cx="11" cy="11" r="4"/><circle cx="20" cy="12" r="3.2"/><path d="M4 24 c0-5 4-7 7-7 s7 2 7 7 M18 24 c0-4 2-6 4-6 s4 2 4 6" stroke-linecap="round"/>',
  town:    '<path d="M4 24 h22 M7 24 v-9 l4-3 4 3 v9 M17 24 v-13 l4-2 4 2 v13" stroke-linecap="round"/>',
  ledger:  '<path d="M6 5 h18 v20 h-18 Z M10 11 h10 M10 15 h10 M10 19 h6" stroke-linecap="round"/>',
  almanac: '<path d="M15 7 c-3-3-9-3-9 0 v16 c0 3 6 3 9 0 c3 3 9 3 9 0 v-16 c0-3-6-3-9 0 Z M15 7 v18" stroke-linecap="round"/>',
};

// name → an icon <span>. size in px; stroke width defaults to 1.8 (nav) — pass 1.6 for weather.
export function icon(name, { size = 24, sw = 1.8, cls = "" } = {}) {
  const body = P[name] || "";
  const span = el("span", { class: "icon" + (cls ? " " + cls : "") });
  span.innerHTML =
    `<svg width="${size}" height="${size}" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="${sw}" aria-hidden="true">${body}</svg>`;
  return span;
}

// map a weather key/label to a glyph name (reference §6 weather set).
export function weatherIconName(weather) {
  const k = (weather?.key || weather?.label || "").toLowerCase();
  if (k.includes("snow") || k.includes("cold snap") || k.includes("frost")) return "snow";
  if (k.includes("rain") || k.includes("wet") || k.includes("storm")) return "rain";
  if (k.includes("clear") || k.includes("sun") || k.includes("fair") || k.includes("bright")) return "sun";
  return "cloud"; // dry / overcast / still
}
