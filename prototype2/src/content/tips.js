// Reuben's guided tips (ported/adapted from year1.html's curated set). Each fires once,
// the first time the player reaches the mechanic it explains, and only when tutorials are
// on. Multi-page tips are an array of strings. Tokens ({{npc.reuben}} etc.) are resolved
// at render time. Reuben's voice throughout; he is always shown with his name and avatar.
export const TIPS = {
  plant: [
    "Now then. Coin buys seed and fuel. The larder feeds us through to spring. Fuel keeps the cold out come winter. Seed goes in the ground before coin ever does. Tap any of those four figures, any time, and I will tell you plain what it means. And that row of dots up by my name is how the hands are holding up; the Regard beside it is how the town has come to look at you.",
    "This is the season's planting. Turnip and potato are quick, ready in a single season, and go straight to the larder to feed us. Wheat and corn take two full seasons, but they are grown for the market, not the table: sold for coin, and worth more of it than the quick roots ever fetch. Cotton is slower still and the best-paying of anything we grow, coin and nothing else. Plant enough to feed us, and something over to sell.",
    "Mind the fertility dots on each field. Only the harvest wears them down, so a field brought in with none left gives back nothing for the season's work. To mend a point, leave that field fallow and let it rest the season.",
  ],
  assign: [
    "It is only me for now, so there is little to divide. Set me to tend a planted field, or chop wood against the winter, or rest if I am worn. The day is yours to spend as well: forage for food, work a field beside me, or sit with a hand who is failing. When you are set, turn in for the night and the day plays out. If a run of quiet days lies ahead, let them run and I will wake you when something wants you. Mind the cotton, if you sowed any: it takes two of us working it together to bring in the whole crop, and one hand alone gets only half.",
  ],
  dusk: [
    "This is the day-book, the season closed and counted: what came in, what we ate, what the cold burned. Read it, then turn the page. What you laid by is what carries us into the next season.",
  ],
  winter: [
    "Winter is the test. Every mouth needs food in the larder and wood on the pile, every day of it. Watch those two figures close. Come up short on wood, and the frailest of us freezes first.",
  ],
};

// The tip owed for the current context, or null. Fires once each (tracked in tipsSeen),
// only when tutorials are on, and never on top of another overlay.
export function pendingTip(state) {
  if (!state.tutorialsOn || state.overlay) return null;
  const seen = state.tipsSeen || [];
  const isWinter = state.seasonIndex === 3;
  const cands = [];
  if (state.phase === "planting") cands.push("plant");
  if (state.phase === "day") cands.push("assign");
  if (isWinter && (state.phase === "day" || state.phase === "brief")) cands.push("winter");
  if (state.phase === "dusk") cands.push("dusk");
  const id = cands.find((c) => !seen.includes(c));
  return id ? { id, pages: TIPS[id] } : null;
}
