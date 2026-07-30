// First-pass tuning, owned by the balance model (Q-003). One place for every number.
// DAILY model (Phase A): a season is `daysPerSeason` days; growth, eating, cold, and
// strain are all per-day. The player has `playerActionsPerDay` personal actions each day.
//
// Curve validated by the sim (`sim/run.js`, three policies over the real reducer):
//   optimal  — survives 4 years, expands to ~4 fields / 2-3 hands, then the debt catches it in Y5.
//   normal   — survives to Y4, forecloses on the bubble (short by a little on the Y4 note).
//   sloppy   — potato-only, misses harvests, forecloses by Y4.
// So a well-played line clearly outlasts a careless one; normal is a genuine knife-edge.
// KNOWN follow-up: cash income is lumpy (2-season crops + no winter planting stall the coin
// engine after Y2); smoothing that is the next balance lever. Re-run `node sim/run.js` after
// any number change here.
export const BALANCE = {
  daysPerSeason: 10,          // a season is 10 days (updates the old 20; tunable in playtest)
  playerActionsPerDay: 2,     // the proprietor's own actions per day
  foodPerMouthPerDay: 0.75,   // larder eaten per mouth per day (tuned via sim)
  fuelPerMouthPerDay: 1,      // fuel burned per mouth per day (fall/winter only)
  fuelPerChopDay: 4,          // fuel a hand lays in per day of chopping
  forageFood: 3,              // food a hand/you gather per day of foraging
  growthPerDay: 0.1,          // a 1-season crop ripens in ~10 days
  tendGrowthBonus: 0.1,       // extra progress when a crop was tended that day (doubles growthPerDay, so tending is always felt: Q-003)
  strain: {
    hardLabor: 2,             // per day of real work
    restRecovery: 6,          // per day of rest
    careRecovery: 5,          // when you sit with a hand (a personal action)
    hungerPerDay: 5,          // per day the larder can't feed the household
    coldPerDay: 5,            // per cold day with no fuel
    wornAt: 25, failingAt: 50, lostAt: 100,
  },
  clearCosts: [40, 90, 150], // coin to clear the 2nd, 3rd, 4th field (Q-003 first pass)
  hireCosts: [60, 110, 300], // coin to hire the 2nd, 3rd, 4th hand (the last repeats past that)
  standing: { perTalk: 12, known: 15, friendly: 40, close: 70 }, // town relationships (Q-003)
  debtStart: 600,                                    // the inherited mortgage balance (m)
  mortgageSchedule: { 1: 0, 2: 30, 3: 80, 4: 110 },  // payment due at each year-end; 130 default 5+ (tuned via sim)
  upkeepSchedule:   { 1: 0, 2: 0, 3: 10, 4: 20 },    // flat yearly upkeep, rising; 30 default 5+ (tuned via sim)
};
