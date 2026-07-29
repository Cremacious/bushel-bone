// First-pass tuning, owned by the balance model (Q-003). One place for every number.
// DAILY model (Phase A): a season is `daysPerSeason` days; growth, eating, cold, and
// strain are all per-day. The player has `playerActionsPerDay` personal actions each day.
export const BALANCE = {
  daysPerSeason: 10,          // a season is 10 days (updates the old 20; tunable in playtest)
  playerActionsPerDay: 2,     // the proprietor's own actions per day
  foodPerMouthPerDay: 1,      // larder eaten per mouth per day
  fuelPerMouthPerDay: 1,      // fuel burned per mouth per day (fall/winter only)
  fuelPerChopDay: 4,          // fuel a hand lays in per day of chopping
  forageFood: 3,              // food a hand/you gather per day of foraging
  growthPerDay: 0.1,          // a 1-season crop ripens in ~10 days
  tendGrowthBonus: 0.05,      // extra progress when a crop was tended that day
  strain: {
    hardLabor: 2,             // per day of real work
    restRecovery: 6,          // per day of rest
    careRecovery: 5,          // when you sit with a hand (a personal action)
    hungerPerDay: 5,          // per day the larder can't feed the household
    coldPerDay: 5,            // per cold day with no fuel
    wornAt: 25, failingAt: 50, lostAt: 100,
  },
};
