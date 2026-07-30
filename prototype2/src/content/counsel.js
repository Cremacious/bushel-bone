// Reuben's counsel: always-on, non-blocking guidance shown in Year 1 only (it fades after),
// distinct from the opt-in tutorial tips. It tells a first-timer what to do NOW, before they
// act, so they never plant blind. One short line per beat. The day screen no longer gets a
// counsel block: the stat tags on every task button and the Tiredness read carry that weight
// now, so the wordy walk-through of tend/harvest/forage/chop/rest is redundant (legibility
// task 4).
export function counselFor(state) {
  if (state.year !== 1) return null; // training wheels come off after the first year
  if (state.phase === "planting") {
    return {
      text: "Plant us food to start, a field or two of potato or turnip. The quick crops feed us by the season's end, and a full larder is what carries a new place through. Corn and cotton pay better, but they take two seasons and earn nothing till then, so leave the cash crops till you have food put by. And mind: this is my read for a first spring, not a law. Every season turns different. Learn the why of it, and you will not need me telling you.",
    };
  }
  return null;
}
