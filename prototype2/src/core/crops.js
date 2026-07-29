import { BALANCE } from "./balance.js";

// tier: "staple" (food floor) | "cash" (coin, no food). Weird tier is deferred (Plan 3).
// seed: seed cost to plant. seasons: how many seasons to ripen. yield: base units at fert 3.
// food: food per unit into the larder. sale: coin per unit sold.
// Three legible tiers (harvest routes food>0 to the larder, food==0 to coin):
//  - quick food: turnip/potato, one season, straight to the larder.
//  - cash grain: wheat/corn, two seasons, grown for the market and sold for coin (more per
//    unit than the quick roots would ever fetch).
//  - premium cash: cotton, two seasons, worth the most of anything.
// Balance values are first-pass, owned by the balance model (Q-003).
export const CROPS = {
  turnip: { name: "Turnip", tier: "staple", seed: 3, seasons: 1, yield: 7, food: 1.5, sale: 2 },
  potato: { name: "Potato", tier: "staple", seed: 6, seasons: 1, yield: 10, food: 2, sale: 2 },
  wheat:  { name: "Wheat", tier: "cash", seed: 4, seasons: 2, yield: 8, food: 0, sale: 6 },
  corn:   { name: "Corn", tier: "cash", seed: 5, seasons: 2, yield: 9, food: 0, sale: 7 },
  cotton: { name: "Cotton", tier: "cash", seed: 10, seasons: 2, yield: 5, food: 0, sale: 12 },
};

export function ripe(field) {
  const c = field.crop && CROPS[field.crop];
  // Epsilon guards against float drift: weeklyGrowth accumulates 0.2/week, so a
  // 2-season crop can land on 1.9999999998 after 10 weeks instead of exactly 2.0.
  return !!c && field.progress >= c.seasons - 1e-9;
}

export function weeklyGrowth(field, weather) {
  if (!field.crop) return 0;
  return BALANCE.growthPerWeek + (field.tended ? BALANCE.tendGrowthBonus : 0) + (weather?.grow || 0);
}
