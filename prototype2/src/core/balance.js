// First-pass tuning constants — ALL owned by the balance model (Q-003). One place
// so tuning is a single-file edit and the loop code reads as intent, not magic numbers.
//
// hardLabor and fuelPerChopWeek were nudged from their original first-pass values
// (6 and 5) after the Task 13 headless playthrough (tests/playthrough.test.mjs)
// showed a solo hand working every single week of a Year-1 calendar, with no rest
// turn ever offered by the cautious auto-player, crossed the loss threshold on
// hardLabor alone (6 strain x 20 weeks = 120, past lostAt=100) before any event or
// mismanagement entered into it. hardLabor 6->4 keeps a full year of continuous
// solo labor under the loss threshold (4x20=80) with a margin for the ordinary cold
// and hunger shortfalls a lone hand's task backlog produces (see below). Once that
// alone still weren't enough (a lone hand chopping only opportunistically, between
// a backlog of harvests, could still hit two or three weeks with no fuel banked),
// fuelPerChopWeek 5->10 was raised so a single chopping week reliably bridges the
// weeks a solo hand cannot spare for the woodpile. Neither is a new system, both
// are within the model's own single-file tuning surface.
export const BALANCE = {
  weeksPerSeason: 5,
  foodPerMouthPerWeek: 3,        // farmer + each living hand
  fuelPerMouthPerWeek: 2,        // burned in fall & winter only
  fuelPerChopWeek: 10,           // one hand chopping adds this much fuel per week
  growthPerWeek: 0.2,            // a crop advances 0.2 "seasons" a week (1.0 over a 5-week season)
  tendGrowthBonus: 0.1,          // an assigned tend adds this to that field's growth this week
  strain: {
    hardLabor: 4,                // tend/chop/harvest cost this much strain per week
    restRecovery: 18,            // resting removes this much
    careRecovery: 12,            // the player spending their week caring for one hand
    hungerPerWeek: 12,           // added to a hand short of food
    coldPerWeek: 12,             // added to a hand short of fuel (fall/winter)
    wornAt: 25,                  // strain >= this → condition track reads "worn"
    failingAt: 50,               // strain >= this → condition track reads "failing"
    lostAt: 100,                 // strain >= this → the hand is lost
  },
};
