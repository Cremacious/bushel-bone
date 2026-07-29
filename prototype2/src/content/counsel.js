// Reuben's counsel: always-on, non-blocking guidance shown in Year 1 only (it fades after),
// distinct from the opt-in tutorial tips. It tells a first-timer what to do NOW, before they
// act, so they never plant or set the crew blind. One short line per beat.
export function counselFor(state) {
  if (state.year !== 1) return null; // training wheels come off after the first year
  if (state.phase === "planting") {
    return {
      text: "Plant us food to start, a field or two of potato or turnip. The quick crops feed us by the season's end, and a full larder is what carries a new place through. Corn and cotton pay better, but they take two seasons and earn nothing till then, so leave the cash crops till you have food put by. And mind: this is my read for a first spring, not a law. Every season turns different. Learn the why of it, and you will not need me telling you.",
    };
  }
  if (state.phase === "week") {
    return {
      text: "I have set us to the work the way I would do it. Look it over before you commit. Tend pushes a crop along faster; harvest brings in what has stood ripe; forage gathers food from the wild when the larder runs thin; chop lays wood by for winter; rest mends a hand who is worn. Change any of it, or just put us to work and trust my hand for now.",
    };
  }
  return null;
}
