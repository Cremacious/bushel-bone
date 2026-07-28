// The whole game state is one plain, serializable object (per project convention).
// This is the Year-1 starting state; later plans extend it (events, town, years).
export function makeHand(id, name, { body = "average", mind = "average" } = {}) {
  return { id, name, body, mind, task: "rest", condition: "steady", morale: 4, alive: true, traits: [] };
}

export function initialState(seed = 1, lineageName = "Crane") {
  return {
    // rngSeed = the original game seed (for display/restart); rngState = the PRNG's resumable cursor
    rngSeed: seed >>> 0,
    rngState: seed >>> 0,
    lineageName,
    year: 1,
    seasonIndex: 0,          // 0=spring..3=winter
    week: 1,                 // 1..5
    theme: "night",
    weather: { key: "cold-rain", label: "Cold rain", grow: 0 },
    coin: 100, larder: 80, fuel: 0, seed: 20,
    regard: 20,
    reckoning: 0,            // hidden
    fields: [0, 1, 2, 3].map((i) => ({ id: i, crop: null, progress: 0, fert: 3, taint: 0 })),
    hands: [makeHand("reuben", "Reuben")],
    foremanId: "reuben",
    log: [],
    screen: "morning-brief",
    ended: false,
  };
}

export const SEASONS = ["spring", "summer", "fall", "winter"];
export const WEEKS_PER_SEASON = 5;
export const season = (s) => SEASONS[s.seasonIndex];
export const livingHands = (s) => s.hands.filter((h) => h.alive);
