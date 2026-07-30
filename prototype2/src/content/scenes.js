// Scripted NPC scenes woven into the daily loop. The prose lives in content/script.yaml
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
  crake_intro:    { choices: ["go_on"], fx: {}, returnTo: "town" },
  tolliver_intro: { choices: ["go_on"], fx: {}, returnTo: "town" },
  meredith_rumor: { choices: ["go_on"], fx: {}, returnTo: "town" },

  // Talk-deck scenes for the remaining five townsfolk, plus every NPC's deeper
  // scene and small-talk filler (town-exploration task 2). All single-beat
  // "go_on" cards, same shape as the three intros above.
  silas_town:      { choices: ["go_on"], fx: {}, returnTo: "town" },
  grange_intro:    { choices: ["go_on"], fx: {}, returnTo: "town" },
  bell_intro:      { choices: ["go_on"], fx: {}, returnTo: "town" },
  coldwater_intro: { choices: ["go_on"], fx: {}, returnTo: "town" },
  nan_intro:       { choices: ["go_on"], fx: {}, returnTo: "town" },

  meredith_deep:   { choices: ["go_on"], fx: {}, returnTo: "town" },
  crake_deep:      { choices: ["go_on"], fx: {}, returnTo: "town" },
  tolliver_deep:   { choices: ["go_on"], fx: {}, returnTo: "town" },
  silas_deep:      { choices: ["go_on"], fx: {}, returnTo: "town" },
  grange_deep:     { choices: ["go_on"], fx: {}, returnTo: "town" },
  bell_deep:       { choices: ["go_on"], fx: {}, returnTo: "town" },
  coldwater_deep:  { choices: ["go_on"], fx: {}, returnTo: "town" },
  nan_deep:        { choices: ["go_on"], fx: {}, returnTo: "town" },

  meredith_small:   { choices: ["go_on"], fx: {}, returnTo: "town" },
  crake_small:      { choices: ["go_on"], fx: {}, returnTo: "town" },
  tolliver_small:   { choices: ["go_on"], fx: {}, returnTo: "town" },
  silas_small:      { choices: ["go_on"], fx: {}, returnTo: "town" },
  grange_small:     { choices: ["go_on"], fx: {}, returnTo: "town" },
  bell_small:       { choices: ["go_on"], fx: {}, returnTo: "town" },
  coldwater_small:  { choices: ["go_on"], fx: {}, returnTo: "town" },
  nan_small:        { choices: ["go_on"], fx: {}, returnTo: "town" },
};

// The opening scene for a given state, if any. Year 1's Spring opens on Ridley's call.
export function openingSceneId(state) {
  if (state.year === 1 && state.seasonIndex === 0) return "silas_welcome";
  return null;
}
