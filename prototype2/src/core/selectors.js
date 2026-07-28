import { BALANCE } from "./balance.js";
import { ripe } from "./crops.js";
import { livingHands, season } from "./state.js";

// The season's closing figures for the Dusk Report (Screen 06). Pure read.
export function duskSummary(s) {
  return {
    season: season(s),
    coin: s.coin,
    larder: Math.floor(s.larder),
    fuel: s.fuel,
    crew: livingHands(s).map((h) => h.name),
    lostThisSeason: s.log.filter((l) => /did not last/.test(l)),
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
