import { BALANCE } from "./balance.js";
import { CROPS, ripe } from "./crops.js";
import { livingHands, season } from "./state.js";

// The one legible condition track (spec §10.4), derived from strain. No stored field:
// steady <25, worn 25..49, failing 50..99, lost at 100 (or !alive).
export function conditionOf(hand) {
  if (!hand.alive || hand.strain >= BALANCE.strain.lostAt) return "lost";
  if (hand.strain >= 50) return "failing";
  if (hand.strain >= 25) return "worn";
  return "steady";
}

export const mouths = (s) => 1 + livingHands(s).length; // the farmer + living hands
export const fieldLabel = (f) => ["The East Field", "The River Strip", "The Near Acre", "The Stone Lot"][f.id] || `Field ${f.id + 1}`;
export const isWinter = (s) => season(s) === "winter";
export const burnsFuel = (s) => season(s) === "fall" || season(s) === "winter";
export const ripeFields = (s) => s.fields.filter(ripe);
export const emptyFields = (s) => s.fields.filter((f) => !f.crop);

// Ledger warning lines the V0.3 design shows under the ledger (Screen 04). Strings only.
export function warnings(s) {
  const out = [];
  if (burnsFuel(s)) {
    const need = mouths(s) * BALANCE.fuelPerMouthPerWeek * (BALANCE.weeksPerSeason - s.week + 1);
    if (s.fuel < need) out.push(`Fuel is ${need - s.fuel} short of what the cold wants`);
  }
  const foodNeed = mouths(s) * BALANCE.foodPerMouthPerWeek * (BALANCE.weeksPerSeason - s.week + 1);
  if (s.larder < foodNeed) out.push(`The larder will not carry ${mouths(s)} mouths to the season's end`);
  return out;
}
export { CROPS };
