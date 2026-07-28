// First-pass tuning constants — ALL owned by the balance model (Q-003). One place
// so tuning is a single-file edit and the loop code reads as intent, not magic numbers.
export const BALANCE = {
  weeksPerSeason: 5,
  foodPerMouthPerWeek: 3,        // farmer + each living hand
  fuelPerMouthPerWeek: 2,        // burned in fall & winter only
  fuelPerChopWeek: 5,            // one hand chopping adds this much fuel per week
  growthPerWeek: 0.2,            // a crop advances 0.2 "seasons" a week (1.0 over a 5-week season)
  tendGrowthBonus: 0.1,          // an assigned tend adds this to that field's growth this week
  strain: {
    hardLabor: 6,               // tend/chop/harvest cost this much strain per week
    restRecovery: 18,           // resting removes this much
    careRecovery: 12,           // the player spending their week caring for one hand
    hungerPerWeek: 12,          // added to a hand short of food
    coldPerWeek: 12,            // added to a hand short of fuel (fall/winter)
    lostAt: 100,                // strain >= this → the hand is lost
  },
};
