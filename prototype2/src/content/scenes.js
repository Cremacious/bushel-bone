// Scripted NPC scenes woven into the weekly loop. The prose lives in content/script.yaml
// (rendered via L(id + ".field")); this table is the mechanics: which choices a scene
// offers, what each choice does to state, and what happens when the scene closes.
//
// This is the seed of the year1.html narrative layer ported onto the new loop. More
// scenes (the fair, the Vane wagon, harvest home, the Long Vigil) and a real per-day
// schedule land as this grows; for now silas_welcome plays once, on Day 1 of Year 1.
export const SCENES = {
  silas_welcome: {
    choices: ["obliged", "needle"],
    // fx: state deltas applied when the choice is taken. regard is the low-stakes
    // standing meter Ridley introduces (design: kindness/community, not the hidden Reckoning).
    fx: {
      obliged: { regard: 2 },
      needle: { regard: -3 },
    },
    after: "BEGIN_SEASON", // once closed, fall through into the season (planting)
  },
};

// The opening scene for a given state, if any. Year 1's Spring opens on Ridley's call.
export function openingSceneId(state) {
  if (state.year === 1 && state.seasonIndex === 0) return "silas_welcome";
  return null;
}
