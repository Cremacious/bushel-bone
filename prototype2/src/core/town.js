// The town of Marrow's Cross as data: the places you can call at, and the deck of paid
// odd-jobs. Pure content, no state, no DOM. Coin values are a first pass (Q-003). Which talk
// an NPC gives is resolved from their TALKS deck by standing (see selectors.nextTownScene);
// shops (Crake's tools, the depot market) are stubbed and wired in later phases.
export const LOCATIONS = [
  { id: "saloon", npc: "meredith", loc: "saloon", purpose: "gossip, and the day's work going" },
  { id: "smithy", npc: "crake",    loc: "smithy", purpose: "tools and ironwork (soon)" },
  { id: "store",  npc: "tolliver", loc: "store",  purpose: "seed, goods, and sundries (soon)" },
  { id: "bank",   npc: "silas",    loc: "town",   purpose: "the mortgage and the land" },
  { id: "church", npc: "grange",   loc: "church", purpose: "the parish, and the weather of souls" },
  { id: "doc",    npc: "bell",     loc: "doc",    purpose: "medicine, and rumor" },
  { id: "jail",   npc: "coldwater",loc: "jail",   purpose: "the law" },
  { id: "nan",    npc: "nan",      loc: "gate",   purpose: "the old ways" },
  { id: "wagon",  npc: "ambrose",  loc: "wagon",  purpose: "clone hands, for a price" },
];

// The odd-job deck: small paid errands. Each season a deterministic, scarce slice is on
// offer (see selectors.townOffers). giver is an npc id (for flavor); coin is the pay.
export const ODD_JOBS = [
  { id: "haul_mill",   giver: "meredith", coin: 8,  line: "Haul grain sacks for the miller a day." },
  { id: "sit_patient", giver: "bell",     coin: 6,  line: "Sit the night with one of Doc's patients." },
  { id: "mend_fence",  giver: "ostrander",coin: 7,  line: "Mend a stretch of the Ostrander fence." },
  { id: "dig_grave",   giver: "grange",   coin: 5,  line: "Dig and fill for the preacher, quiet work." },
  { id: "load_wagon",  giver: "crake",    coin: 9,  line: "Load and strap the toolwright's wagon." },
];

// How many jobs are on offer across a whole season (a scarce, rotating handful, not a
// daily refill — see selectors.townOffers).
export const JOBS_PER_SEASON = 2;

// Each NPC's talk deck: ordered intro-first, each gated by a minStanding (0 = always). As
// standing rises, deeper scenes unlock. Scene ids match content/script.yaml + scenes.js.
export const TALKS = {
  meredith:  [{ id: "meredith_rumor", minStanding: 0 }, { id: "meredith_deep", minStanding: 12 }],
  crake:     [{ id: "crake_intro",    minStanding: 0 }, { id: "crake_deep",    minStanding: 12 }],
  tolliver:  [{ id: "tolliver_intro", minStanding: 0 }, { id: "tolliver_deep", minStanding: 12 }],
  silas:     [{ id: "silas_town",     minStanding: 0 }, { id: "silas_deep",    minStanding: 30 }],
  grange:    [{ id: "grange_intro",   minStanding: 0 }, { id: "grange_deep",   minStanding: 12 }],
  bell:      [{ id: "bell_intro",     minStanding: 0 }, { id: "bell_deep",      minStanding: 12 }],
  coldwater: [{ id: "coldwater_intro",minStanding: 0 }, { id: "coldwater_deep",minStanding: 30 }],
  nan:       [{ id: "nan_intro",      minStanding: 0 }, { id: "nan_deep",       minStanding: 12 }],
};

// A short "nothing new today" filler per NPC, played when their deck is exhausted at the
// current standing. Keeps a visit from ever being empty. Scene ids in script.yaml/scenes.js.
export const SMALLTALK = {
  meredith: "meredith_small", crake: "crake_small", tolliver: "tolliver_small", silas: "silas_small",
  grange: "grange_small", bell: "bell_small", coldwater: "coldwater_small", nan: "nan_small",
};
