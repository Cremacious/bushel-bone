import { BALANCE } from "./balance.js";
import { CROPS, ripe } from "./crops.js";
import { livingHands, season } from "./state.js";

// The season's closing figures for the Dusk Report (Screen 06). Pure read.
export function duskSummary(s) {
  return {
    season: season(s),
    coin: s.coin,
    larder: Math.floor(s.larder),
    fuel: s.fuel,
    crew: livingHands(s).map((h) => h.name),
    lostThisSeason: s.log.slice(s.logSeasonStart).filter((l) => /did not last/.test(l)),
    warnings: warnings(s),
  };
}

// The one legible condition track (spec §10.4), derived from strain. No stored field:
// steady <25, worn 25..49, failing 50..99, lost at 100 (or !alive). Cut points live in
// balance.js so tuning is a single-file edit.
export function conditionOf(hand) {
  if (!hand.alive || hand.strain >= BALANCE.strain.lostAt) return "lost";
  if (hand.strain >= BALANCE.strain.failingAt) return "failing";
  if (hand.strain >= BALANCE.strain.wornAt) return "worn";
  return "steady";
}

// A plain-language read of a planted field: when it ripens and what it will yield, at the
// base growth rate (ignoring tend/weather, which only ever help). Pure. Weeks are counted
// from the current playing week (or the season's start during planting).
export function fieldProjection(state, field) {
  const c = field.crop && CROPS[field.crop];
  if (!c) return { crop: null };
  const remaining = Math.max(0, c.seasons - field.progress);
  const weeksToRipe = remaining <= 1e-9 ? 0 : Math.ceil(remaining / BALANCE.growthPerWeek);
  const base = state.phase === "week" ? state.week : 0;   // planting: from week 0
  const ripenWeek = base + weeksToRipe;
  const units = Math.round(c.yield * (field.fert / 3));
  const y = c.food > 0 ? { amount: Math.round(units * c.food), kind: "food" }
                       : { amount: units * c.sale, kind: "coin" };
  let when;
  if (weeksToRipe === 0) when = "ripe";
  else if (ripenWeek <= BALANCE.weeksPerSeason) when = `ripens wk ${ripenWeek}`;
  else if (c.seasons > 1) when = "ripens next season";
  else when = "won't ripen in time";
  return { crop: field.crop, name: c.name, tier: c.tier, ripe: weeksToRipe === 0,
    weeksToRipe, when, yield: y, needsTwo: !!c.needsTwo };
}

export const mouths = (s) => 1 + livingHands(s).length; // the farmer + living hands
export const fieldLabel = (f) => ["The East Field", "The River Strip", "The Near Acre", "The Stone Lot"][f.id] || `Field ${f.id + 1}`;
export const isWinter = (s) => season(s) === "winter";
export const burnsFuel = (s) => season(s) === "fall" || season(s) === "winter";
export const ripeFields = (s) => s.fields.filter(ripe);
export const emptyFields = (s) => s.fields.filter((f) => !f.crop);

// Ledger warning lines the V0.3 design shows under the ledger (Screen 04). Strings only.
// Only meaningful during an active playing week: at Dusk (and beyond) the season is
// already settled, so there are no remaining weeks left to run short on.
export function warnings(s) {
  const out = [];
  const weeksLeft = s.phase === "week" ? BALANCE.weeksPerSeason - s.week + 1 : 0;
  if (weeksLeft === 0) return out;
  if (burnsFuel(s)) {
    const need = mouths(s) * BALANCE.fuelPerMouthPerWeek * weeksLeft;
    if (s.fuel < need) out.push(`Fuel is ${need - s.fuel} short of what the cold wants`);
  }
  const foodNeed = mouths(s) * BALANCE.foodPerMouthPerWeek * weeksLeft;
  if (s.larder < foodNeed) out.push(`The larder will not carry ${mouths(s)} mouths to the season's end`);
  return out;
}
