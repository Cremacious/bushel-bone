// The town of Marrow's Cross as data: the places you can call at, and the deck of paid
// odd-jobs. Pure content, no state, no DOM. Coin values are a first pass (Q-003). Talks
// are scripted scenes (see content/scenes.js); shops (Crake's tools, the depot market) are
// stubbed here and wired in Phases C/D.
export const LOCATIONS = [
  { id: "saloon", npc: "meredith", loc: "saloon", purpose: "gossip, and the day's work going", talk: "meredith_rumor" },
  { id: "smithy", npc: "crake",    loc: "smithy", purpose: "tools and ironwork (soon)",         talk: "crake_intro" },
  { id: "store",  npc: "tolliver", loc: "store",  purpose: "seed, goods, and sundries (soon)",  talk: "tolliver_intro" },
  { id: "bank",   npc: "silas",    loc: "town",   purpose: "the mortgage and the land",         talk: null },
  { id: "church", npc: "grange",   loc: "church", purpose: "the parish, and the weather of souls", talk: null },
  { id: "doc",    npc: "bell",     loc: "doc",    purpose: "medicine, and rumor",               talk: null },
  { id: "jail",   npc: "coldwater",loc: "jail",   purpose: "the law",                           talk: null },
  { id: "nan",    npc: "nan",      loc: "gate",   purpose: "the old ways",                       talk: null },
];

// The odd-job deck: small paid errands. Each day a deterministic slice is on offer
// (see selectors.townOffers). giver is an npc id (for flavor); coin is the pay.
export const ODD_JOBS = [
  { id: "haul_mill",   giver: "meredith", coin: 8,  line: "Haul grain sacks for the miller a day." },
  { id: "sit_patient", giver: "bell",     coin: 6,  line: "Sit the night with one of Doc's patients." },
  { id: "mend_fence",  giver: "ostrander",coin: 7,  line: "Mend a stretch of the Ostrander fence." },
  { id: "dig_grave",   giver: "grange",   coin: 5,  line: "Dig and fill for the preacher, quiet work." },
  { id: "load_wagon",  giver: "crake",    coin: 9,  line: "Load and strap the toolwright's wagon." },
];

// How many jobs are on offer on a given day.
export const JOBS_PER_DAY = 2;
