// The event deck: each is a scripted scene (choices + fx) tagged with a family and an optional
// gate. Drawn seeded + non-repeating within a run (see reducer.maybeEvent, a later task). Prose
// lives in content/script.yaml; mechanics (choices/fx) in content/scenes.js with `event: true`.
export const EVENTS = [
  { id: "ev_fox",         family: "wildlife" },
  { id: "ev_early_frost", family: "weather", gate: { season: ["fall", "winter"] } },
  { id: "ev_good_rain",   family: "weather", gate: { season: ["spring", "summer"] } },
  { id: "ev_peddler",     family: "opportunity" },
  { id: "ev_sick_hand",   family: "personal", gate: { minHands: 1 } },
  { id: "ev_foundling",   family: "personal" },
  { id: "ev_blight",      family: "pests", gate: { season: ["summer", "fall"] } },
  { id: "ev_omen_field",  family: "reckoning" },
];
export const EVENT_CHANCE = 0.28; // per-day probability a fresh, eligible event fires
