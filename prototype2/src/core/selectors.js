import { BALANCE } from "./balance.js";
import { CROPS, ripe } from "./crops.js";
import { livingHands, season, SEASONS } from "./state.js";

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
  // Weeks already ELAPSED this season (0 during planting; state.week is the current,
  // not-yet-resolved week, so subtract one). ripenWeek is that plus the weeks still needed.
  const base = state.phase === "week" ? state.week - 1 : 0;
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

// The household's survival targets for the cold months (fall + winter) still to come this
// year — what you must lay in — so the weekly work has a visible goal instead of chopping or
// foraging blind. Pure. `have` is your current stock, `need` the cold-season consumption.
export function yearNeeds(state) {
  const m = mouths(state);
  const weeksLeftInSeason = state.phase === "week" ? BALANCE.weeksPerSeason - state.week + 1 : BALANCE.weeksPerSeason;
  let coldWeeks = 0;
  for (let si = state.seasonIndex; si < SEASONS.length; si++) {
    if (SEASONS[si] !== "fall" && SEASONS[si] !== "winter") continue;
    coldWeeks += si === state.seasonIndex ? weeksLeftInSeason : BALANCE.weeksPerSeason;
  }
  return {
    coldWeeks,
    fuel: { have: state.fuel, need: m * BALANCE.fuelPerMouthPerWeek * coldWeeks },
    food: { have: Math.floor(state.larder), need: m * BALANCE.foodPerMouthPerWeek * coldWeeks },
  };
}
export const fieldLabel = (f) => ["The East Field", "The River Strip", "The Near Acre", "The Stone Lot"][f.id] || `Field ${f.id + 1}`;
export const isWinter = (s) => season(s) === "winter";
export const burnsFuel = (s) => season(s) === "fall" || season(s) === "winter";
export const ripeFields = (s) => s.fields.filter(ripe);
export const emptyFields = (s) => s.fields.filter((f) => !f.crop);

// Reuben's recommended plan for the current week: a task per living hand and the player's
// own week. A sane default a newcomer can accept, and the baseline the player adjusts from.
// Heuristic: bring in what is ripe first (pairing a second hand onto a two-hand crop so the
// whole of it comes in), then chop when the cold is coming and fuel is short, then tend a
// distinct growing field each, else rest.
export function suggestPlan(state) {
  const living = livingHands(state);
  const ripeList = ripeFields(state); // field objects, so we can see needsTwo
  const growingQueue = growingFields(state, ripeList).map((f) => f.id);
  const cold = burnsFuel(state);
  const weeksLeft = state.phase === "week" ? BALANCE.weeksPerSeason - state.week + 1 : BALANCE.weeksPerSeason;
  const foodShort = state.larder < mouths(state) * BALANCE.foodPerMouthPerWeek * weeksLeft; // won't carry the season
  const fuelShort = cold && state.fuel < mouths(state) * BALANCE.fuelPerMouthPerWeek;
  const hands = {};
  let i = 0; // next unassigned living hand
  // Harvest ripe fields first; a two-hand crop (cotton) pairs a second hand onto it.
  for (const f of ripeList) {
    if (i >= living.length) break;
    hands[living[i++].id] = { task: "harvest", targetFieldId: f.id };
    if (CROPS[f.crop].needsTwo && i < living.length) hands[living[i++].id] = { task: "harvest", targetFieldId: f.id };
  }
  // Remaining hands: forage if the table is going short, else chop against the cold, else
  // tend a distinct growing field, else rest.
  for (; i < living.length; i++) {
    const h = living[i];
    if (foodShort) hands[h.id] = { task: "forage", targetFieldId: undefined };
    else if (fuelShort) hands[h.id] = { task: "chop", targetFieldId: undefined };
    else if (growingQueue.length) hands[h.id] = { task: "tend", targetFieldId: growingQueue.shift() };
    else hands[h.id] = { task: "rest", targetFieldId: undefined };
  }
  // The player's own week: lend a hand on the least-grown growing field, else rest (spec §5 —
  // early it is an optional bonus, never a slot the player is punished for spending).
  const growing0 = growingFields(state, ripeList)[0];
  const player = growing0 ? { kind: "work", target: growing0.id } : { kind: "rest", target: undefined };
  return { hands, player };
}

// Planted fields that are not yet ripe, least-grown first. `ripeList` is ripeFields(state).
function growingFields(state, ripeList) {
  return state.fields.filter((f) => f.crop && !ripeList.some((r) => r.id === f.id))
    .sort((a, b) => a.progress - b.progress);
}

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
