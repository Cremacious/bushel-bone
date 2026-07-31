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
  // ─── Town talks, reworked from dead "go on" beats into real payoffs and choices. Each is
  // tagged with its KIND (documentation, not code): payload = a single accept that pays a
  // useful line plus a small reward; question = one considered answer pays, the others go
  // neutral or a touch sour; moral = both branches legitimate, one kinder and one colder;
  // haggle = the risky option rolls a seeded win/hold/sour (see chooseScene). fx are kept
  // modest on purpose — a talk warms a face, it is not a coin faucet. Prose in script.yaml.

  // meredith — the saloon, the town's ear. Payloads: the rumor is the goods, plus a little.
  meredith_rumor: { returnTo: "town", choices: ["go_on"], fx: { go_on: { coin: 2 } } },
  meredith_deep:  { returnTo: "town", choices: ["go_on"], fx: { go_on: { regard: 2 } } },

  // crake — the smith. Payloads: a practical word, and a little goodwill for taking it well.
  crake_intro: { returnTo: "town", choices: ["go_on"], fx: { go_on: { regard: 2 } } },
  crake_deep:  { returnTo: "town", choices: ["go_on"], fx: { go_on: { regard: 2 } } },

  // tolliver — the store. A seed-goodwill payload, then a haggle over a sack of seed.
  tolliver_intro: { returnTo: "town", choices: ["go_on"], fx: { go_on: { seed: 2 } } },
  tolliver_deep:  { kind: "haggle", returnTo: "town", choices: ["dicker", "fair"],
    fx: { fair: { seed: 2 } },
    haggle: { on: "dicker", odds: { win: 0.4, hold: 0.4, sour: 0.2 },
      outcomes: { win: { seed: 4 }, hold: { seed: 2 }, sour: { seed: 1, regard: -1 } } } },

  // silas — the banker. Moral forks: press him and he cools, keep it civil and he warms. No coin.
  silas_town: { returnTo: "town", choices: ["press", "civil"],   fx: { press: { regard: -2 }, civil: { regard: 2 } } },
  silas_deep: { returnTo: "town", choices: ["press", "respect"], fx: { press: { regard: -2 }, respect: { regard: 2 } } },

  // grange — the preacher. A question with one right answer, then a moral fork over a prayer.
  grange_intro: { kind: "question", returnTo: "town", choices: ["duty", "trade", "shrug"], fx: { duty: { regard: 3 } } },
  grange_deep:  { returnTo: "town", choices: ["pray", "decline"],        fx: { pray: { regard: 2 }, decline: { regard: -1 } } },

  // bell — the doctor. A question about keeping the crew well, then a payload of real intel.
  bell_intro: { kind: "question", returnTo: "town", choices: ["rest", "drive", "dose"], fx: { rest: { regard: 2 } } },
  bell_deep:  { returnTo: "town", choices: ["go_on"], fx: { go_on: { regard: 2 } } },

  // coldwater — the law. Moral forks: the decent answer, or the cold one that stirs the ground.
  coldwater_intro: { returnTo: "town", choices: ["plain", "cold"], fx: { plain: { regard: 2 }, cold: { regard: -2 } } },
  coldwater_deep:  { returnTo: "town", choices: ["heed", "defy"],  fx: { heed: { regard: 2 }, defy: { reckoning: 1 } } },

  // nan — folk-magic, the reckoning's only reader. Riddles of the ground: the listened answer
  // pays a hint and her regard; the boastful or scornful one sours her. She hints, never states.
  nan_intro: { returnTo: "town", choices: ["listen", "boast", "scoff"],      fx: { listen: { regard: 2 }, scoff: { regard: -1 } } },
  nan_deep:  { returnTo: "town", choices: ["patient", "greedy", "afraid"],   fx: { patient: { regard: 2 }, greedy: { regard: -1 } } },

  // ─── New deck cards, one per NPC, unlocked by standing (see town.TALKS minStanding). Kinds
  // are mixed across the eight so the deepened decks vary: three questions, two morals, a
  // haggle, and two payloads.
  meredith_whisper: { kind: "question", returnTo: "town", choices: ["truthful", "flatter", "dodge"], fx: { truthful: { regard: 2 } } }, // question
  crake_ironwork:   { kind: "haggle", returnTo: "town", choices: ["dicker", "fair"],
    fx: { fair: { coin: 4 } },
    haggle: { on: "dicker", odds: { win: 0.4, hold: 0.4, sour: 0.2 },
      outcomes: { win: { coin: 7 }, hold: { coin: 4 }, sour: { coin: 2, regard: -1 } } } },       // haggle
  tolliver_account: { returnTo: "town", choices: ["go_on"], fx: { go_on: { seed: 3 } } },          // payload
  silas_terms:      { returnTo: "town", choices: ["press", "accept"], fx: { press: { regard: -2 }, accept: { regard: 2 } } }, // moral
  grange_parish:    { returnTo: "town", choices: ["go_on"], fx: { go_on: { regard: 2 } } },        // payload
  bell_notes:       { kind: "question", returnTo: "town", choices: ["cold", "hunger", "haunt"], fx: { cold: { regard: 2 } } }, // question
  coldwater_line:   { returnTo: "town", choices: ["decent", "hard"], fx: { decent: { regard: 2 }, hard: { reckoning: 1 } } }, // moral
  nan_riddle:       { kind: "question", returnTo: "town", choices: ["giving", "taking", "waiting"], fx: { giving: { regard: 2 }, taking: { regard: -1 } } }, // question

  meredith_small:   { choices: ["go_on"], fx: {}, returnTo: "town" },
  crake_small:      { choices: ["go_on"], fx: {}, returnTo: "town" },
  tolliver_small:   { choices: ["go_on"], fx: {}, returnTo: "town" },
  silas_small:      { choices: ["go_on"], fx: {}, returnTo: "town" },
  grange_small:     { choices: ["go_on"], fx: {}, returnTo: "town" },
  bell_small:       { choices: ["go_on"], fx: {}, returnTo: "town" },
  coldwater_small:  { choices: ["go_on"], fx: {}, returnTo: "town" },
  nan_small:        { choices: ["go_on"], fx: {}, returnTo: "town" },

  // The town odd-jobs (v0.4 phase 4D task 2): each is a real tradeoff card, not a flat coin
  // grab. Accepted from the Town screen (ACCEPT_JOB) and returning to it (returnTo: "town").
  // Two "payload" jobs weigh coin against a hand's Tiredness; two "moral" jobs weigh a fuller
  // fee against decency or the reckoning; one is a haggle (a seeded win/hold/sour roll).
  job_haul_mill:   { returnTo: "town", choices: ["all_day", "half_day"], fx: { all_day: { coin: 8, strainOne: 12 }, half_day: { coin: 4, strainOne: 5 } } },
  job_load_wagon:  { returnTo: "town", choices: ["load_full", "load_light"], fx: { load_full: { coin: 9, strainOne: 12 }, load_light: { coin: 5, strainOne: 5 } } },
  job_sit_patient: { returnTo: "town", choices: ["stay", "slip_off"], fx: { stay: { coin: 5, regard: 3 }, slip_off: { coin: 8, regard: -4 } } },
  job_mend_fence:  { kind: "haggle", returnTo: "town", choices: ["dicker", "fair"], fx: { fair: { coin: 7 }, dicker: {} }, haggle: { on: "dicker", odds: { win: 0.4, hold: 0.4, sour: 0.2 }, outcomes: { win: { coin: 11 }, hold: { coin: 7 }, sour: { coin: 4, regard: -2 } } } },
  job_dig_grave:   { returnTo: "town", choices: ["decent", "quick"], fx: { decent: { coin: 5, reckoning: -1 }, quick: { coin: 8, reckoning: 2 } } },

  // The clone reveal (Phase 4E). vane_reveal is the scripted beat that pulls the canvas back
  // on the wagon; closing it sets s.cloneRevealed (see reducer.closeScene), which unmasks the
  // town's wagon line and opens hiring. reuben_hands is the one-time early nudge that fires on
  // Sow, pointing the newcomer to town. Both carry placeholder mechanics only; the prose is
  // authored in a later task.
  vane_reveal:  { revealsClones: true, returnTo: "town", choices: ["fair", "stock"],
    fx: { fair: { regard: 2, reckoning: -1 }, stock: { regard: -2, reckoning: 2 } } },
  reuben_hands: { returnTo: "run", choices: ["go_on"], fx: {} },

  // The event deck's mechanics (core/events.js holds the deck + gating). Each is a real
  // tradeoff: every choice costs something, even the "safe" one. Prose lands in a later task.
  ev_fox:         { event: true, returnTo: "run", choices: ["chase", "leave"], fx: { chase: { strainOne: 12 }, leave: { larder: -8 } } },
  ev_frost_snap:  { event: true, returnTo: "run", choices: ["chop", "gamble"], fx: { chop: { strainAll: 8, fuel: 8 }, gamble: { fuel: -10 } } },
  ev_good_rain:   { event: true, returnTo: "run", choices: ["glad"], fx: { glad: { larder: 6 } } },
  ev_peddler:     { event: true, returnTo: "run", choices: ["buy", "pass"], fx: { buy: { coin: -8, seed: 12 }, pass: {} } },
  ev_sick_hand:   { event: true, returnTo: "run", choices: ["doc", "rest", "work"], fx: { doc: { coin: -12 }, rest: { strainOne: -10 }, work: { strainOne: 16 } } },
  ev_gate_child:  { event: true, returnTo: "run", choices: ["take", "turn_away"], fx: { take: { larder: -6 }, turn_away: { reckoning: 3 } } },
  ev_blight:      { event: true, returnTo: "run", choices: ["treat", "lose"], fx: { treat: { coin: -10 }, lose: { larder: -10 } } },
  ev_omen_field:  { event: true, returnTo: "run", choices: ["heed", "shrug"], fx: { heed: { coin: -6 }, shrug: { reckoning: 4 } } },
};

// The opening scene for a given state, if any. Year 1's Spring opens on Ridley's call.
export function openingSceneId(state) {
  if (state.year === 1 && state.seasonIndex === 0) return "silas_welcome";
  return null;
}
