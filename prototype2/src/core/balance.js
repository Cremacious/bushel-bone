// First-pass tuning, owned by the balance model (Q-003). One place for every number.
// DAILY model (Phase A): a season is `daysPerSeason` days; growth, eating, cold, and
// strain are all per-day. The player has `seasonActionsPerSeason` personal actions each
// season (v0.4: the beat loop's shared pool, spent at a beat rather than every single day).
//
// Curve validated by the sim (`sim/run.js`, three policies over the real reducer) after the
// v0.4 Phase-2 tightening (seed a coin sink, scarce jobs, cut abundance, a Y1 note):
//   optimal  — must clear a 2nd field fast to escape the 1-field trap; expands to ~4 fields,
//              survives 4 years on a knife-edge (a near-miss in Y3), then the debt catches it.
//   normal   — 2 fields + a hire, forecloses Y4 by a hair.
//   sloppy   — never leaves the fields, starves/overspends, forecloses by Year 2.
// So the early game genuinely bites (a careless line loses the farm in Y1-2) while a careful
// line survives, tight. KNOWN follow-ups: 1-field start is a hard trap (the player MUST reach
// 2 fields early); cash income is lumpy (2-season crops + no winter planting). Re-run
// `node sim/run.js` after any number change here.
export const BALANCE = {
  daysPerSeason: 10,          // a season is 10 days (updates the old 20; tunable in playtest)
  seasonActionsPerSeason: 5,  // the proprietor's own actions per season (v0.4: replaces the per-day pool)
  foodPerMouthPerDay: 0.75,   // larder eaten per mouth per day (tuned via sim)
  fuelPerMouthPerDay: 1,      // fuel burned per mouth per day (fall/winter only)
  fuelPerChopDay: 4,          // fuel a hand lays in per day of chopping
  forageFood: 3,              // food a hand/you gather per day of foraging
  growthPerDay: 0.1,          // a 1-season crop ripens in ~10 days
  tendGrowthBonus: 0.1,       // extra progress when a crop was tended that day (doubles growthPerDay, so tending is always felt: Q-003)
  strain: {
    hardLabor: 4,             // per day of real work
    restRecovery: 8,          // per day of rest
    careRecovery: 5,          // when you sit with a hand (a personal action)
    hungerPerDay: 5,          // per day the larder can't feed the household
    coldPerDay: 5,            // per cold day with no fuel
    wornAt: 25, failingAt: 50, lostAt: 100,
  },
  seedPrice: 1,               // coin per seed unit at Tolliver (tuned via sim)
  seedBundle: 10,              // seed units per purchase
  clearCosts: [30, 70, 120], // coin to clear the 2nd/3rd/4th field (tuned via sim)
  hireCosts: [60, 110, 300], // coin to hire the 2nd, 3rd, 4th hand (the last repeats past that)
  standing: { perTalk: 12, known: 15, friendly: 40, close: 70 }, // town relationships (Q-003)
  debtStart: 600,                                    // the inherited mortgage balance (m)
  mortgageSchedule: { 1: 20, 2: 30, 3: 80, 4: 110 }, // payment due at each year-end; a light Y1 note, then 130 default 5+ (tuned via sim)
  upkeepSchedule:   { 1: 0, 2: 0, 3: 10, 4: 20 },    // flat yearly upkeep, rising; 30 default 5+ (tuned via sim)
};
