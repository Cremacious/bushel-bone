// The whole game state is one plain, serializable object (per project convention).
// This is the Year-1 starting state; later plans extend it (events, town, years).
import { BALANCE } from "./balance.js";

export function makeHand(id, name, { body = "average", mind = "average", role = "field" } = {}) {
  // strain 0..100 drives the condition track (Steady→Worn→Failing→Lost); see selectors.conditionOf.
  return { id, name, body, mind, role, strain: 0, morale: 4, alive: true, traits: [] };
}

// A small alt-1800s name pool for hands hired at Vane's wagon (see reducer.hire).
export const HAND_NAMES = ["Sal", "Enoch", "Del", "Mara", "Gideon", "Tabitha", "Amos", "Lettie"];

export function initialState(seed = 1, lineageName = "Crane") {
  return {
    // rngSeed = the original game seed (for display/restart); rngState = the PRNG's resumable cursor
    rngSeed: seed >>> 0,
    rngState: seed >>> 0,
    lineageName,
    year: 1,
    seasonIndex: 0,          // 0=spring..3=winter
    day: 1,                  // 1..DAYS_PER_SEASON
    seasonActionsLeft: BALANCE.seasonActionsPerSeason, // your own actions this season (reset each season)
    theme: "night",
    weather: { key: "cold-rain", label: "Cold rain", grow: 0 },
    coin: 100, larder: 80, fuel: 0, seed: 8,
    mortgage: { balance: BALANCE.debtStart, arrears: 0, warned: false },
    upgrades: [],              // owned tool/building ids (later phases)
    regard: 20,
    reckoning: 0,            // hidden
    fields: [0, 1, 2, 3].map((i) => ({ id: i, crop: null, progress: 0, fert: 3, taint: 0, tended: false, cleared: i === 0 })),
    hands: [makeHand("reuben", "Reuben")],
    foremanId: "reuben",
    log: [],
    logSeasonStart: 0,        // index into log where the current season's entries begin (dusk scoping)
    phase: "brief",            // brief → planting → day → dusk → (next season) ; winter's dusk → settlement → foreclosed (or the next Spring's brief)
    daylog: [],                // what happened on the current day (shown at dusk of resolve)
    jobsDoneToday: [],         // odd-job ids already claimed today (reset each dawn)
    standing: {},              // per-NPC relationship points (npcId -> number)
    talksSeen: [],             // talk scene ids already played (drives the rotating deck)
    townAt: null,              // the walkable place id the player is standing at in town; null = the street overview
    screen: "home",            // the active tab (home shows the current phase)
    scene: null,               // an active scripted scene: { id, result } (see content/scenes.js)
    overlay: null,             // a modal over the shell: { type, ... } (e.g. a Reuben tutorial prompt)
    tutorialsOn: false,        // Reuben's guided tips, opted into on New Game
    tipsSeen: [],              // ids of guided tips already shown (each fires once)
    ended: false,
  };
}

export const SEASONS = ["spring", "summer", "fall", "winter"];
const SEASON_LABELS = { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" };
export const DAYS_PER_SEASON = BALANCE.daysPerSeason; // single source of truth (balance.js)
export const season = (s) => SEASONS[s.seasonIndex];
export const seasonLabel = (s) => SEASON_LABELS[season(s)]; // "Spring".. (single source; shell + screens share it)
export const livingHands = (s) => s.hands.filter((h) => h.alive);
