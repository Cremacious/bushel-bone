// First-pass tuning, owned by the balance model (Q-003). One place for every number.
// DAILY model (Phase A): a season is `daysPerSeason` days; growth, eating, cold, and
// strain are all per-day. The player gets `actionsPerDay` personal action point each day;
// unspent points carry over up to `actionsCarryCap` (a per-day renewing economy, not a
// season pool).
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
//
// Recovery retune (rest visibly steps a condition): restRecovery 8 to 14, careRecovery 5 to 10.
// A Failing hand (strain 50..99) put on Rest returns toward Worn within a normal rest stretch,
// and one Care action is a real one-shot nudge. Sim-validated: the curve above is unchanged
// (optimal survives 4 years then forecloses Y5, now reaching 3 fields; sloppy still forecloses
// Y2). Safe because hands were never the economic bottleneck and a careless line never rests,
// so faster recovery buys no free ground.
export const BALANCE = {
  daysPerSeason: 10,          // a season is 10 days (updates the old 20; tunable in playtest)
  actionsPerDay: 1,           // the proprietor's own action points, renewed +1 each day (see resolveDay)
  actionsCarryCap: 2,         // unspent action points carry over up to this cap
  foodPerMouthPerDay: 0.75,   // larder eaten per mouth per day (tuned via sim)
  fuelPerMouthPerDay: 1,      // fuel burned per mouth per day (fall/winter only)
  fuelPerChopDay: 4,          // fuel a hand lays in per day of chopping
  forageFood: 3,              // food a hand/you gather per day of foraging
  growthPerDay: 0.1,          // a 1-season crop ripens in ~10 days
  tendGrowthBonus: 0.1,       // extra progress when a crop was tended that day (doubles growthPerDay, so tending is always felt: Q-003)
  careCap: 6,                 // most tended-days a field can bank toward its harvest
  careYieldBonus: 0.06,       // each tended day banks 6% more harvest, up to +36% at the cap; makes field work a real choice, not just speed (#51)
  strain: {
    hardLabor: 4,             // per day of real work
    restRecovery: 14,         // per day of rest (tuned up from 8 so a rest stretch VISIBLY steps a hand's condition; sim-validated below)
    careRecovery: 10,         // when you sit with a hand (a personal action): a stronger one-shot nudge (up from 5)
    hungerPerDay: 5,          // per day the larder can't feed the household
    coldPerDay: 5,            // per cold day with no fuel
    wornAt: 25, failingAt: 50, lostAt: 100,
  },
  jobRespawnDays: 3,          // a fresh town job comes on offer every ~3 days (a rolling offer, not a season dump)
  seedPrice: 1,               // coin per seed unit at Tolliver (tuned via sim)
  seedBundle: 10,              // seed units per purchase
  clearCosts: [30, 70, 120], // coin to clear the 2nd/3rd/4th field (tuned via sim)
  hireCosts: [60, 110, 300], // coin to hire the 2nd, 3rd, 4th hand (the last repeats past that)
  standing: { perTalk: 12, known: 15, friendly: 40, close: 70 }, // town relationships (Q-003)
  debtStart: 600,                                    // the inherited mortgage balance (m)
  mortgageSchedule: { 1: 20, 2: 30, 3: 80, 4: 110 }, // payment due at each year-end; a light Y1 note, then 130 default 5+ (tuned via sim)
  upkeepSchedule:   { 1: 0, 2: 0, 3: 10, 4: 20 },    // flat yearly upkeep, rising; 30 default 5+ (tuned via sim)
};
