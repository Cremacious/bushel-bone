import { BALANCE } from "./balance.js";
import { CROPS, ripe } from "./crops.js";
import { livingHands, season, SEASONS, DAYS_PER_SEASON } from "./state.js";
import { LOCATIONS, ODD_JOBS, JOBS_PER_DAY, TALKS, SMALLTALK } from "./town.js";

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

// Plain-language verdict on a hand's tiredness, for the day screen (spec D.1).
export function tirednessAdvice(hand) {
  const c = conditionOf(hand);
  return c === "failing" ? "rest him now" : c === "worn" ? "rest him soon" : "fine to work";
}

// The effect tags shown on a crew task button (spec D.2). Green gains, red costs. Any real
// work tires the crew (matches resolveDay: hard labor adds strain, rest recovers it), so the
// tag grammar teaches the rest-vs-work tradeoff. Single source of truth for the tag text.
export function actionEffects(task) {
  switch (task) {
    case "rest":    return [{ label: "-Tiredness", valence: "good" }];
    case "tend":    return [{ label: "+Growth", valence: "good" }, { label: "+Tiredness", valence: "bad" }];
    case "harvest": return [{ label: "+Yield", valence: "good" }, { label: "+Tiredness", valence: "bad" }];
    case "forage":  return [{ label: "+Food", valence: "good" }, { label: "+Tiredness", valence: "bad" }];
    case "chop":    return [{ label: "+Wood", valence: "good" }, { label: "+Tiredness", valence: "bad" }];
    default:        return [];
  }
}

// The effect tags for the player's own actions. The player has no tiredness track, so no
// self-cost; "care" eases a hand's tiredness.
export function playerActionEffects(kind) {
  switch (kind) {
    case "forage": return [{ label: `+${BALANCE.forageFood} Food`, valence: "good" }];
    case "work":   return [{ label: "+Growth", valence: "good" }];
    case "care":   return [{ label: "-Tiredness", valence: "good" }];
    default:       return []; // rest: a calm day, no effect
  }
}

// A plain-language read of a planted field: when it ripens and what it will yield, at the
// base growth rate (ignoring tend/weather, which only ever help). Pure. Days are counted
// from the current playing day (or the season's start during planting).
export function fieldProjection(state, field) {
  const c = field.crop && CROPS[field.crop];
  if (!c) return { crop: null };
  const remaining = Math.max(0, c.seasons - field.progress);
  const daysToRipe = remaining <= 1e-9 ? 0 : Math.ceil(remaining / BALANCE.growthPerDay);
  // Days already ELAPSED this season (0 during planting; state.day is the current,
  // not-yet-resolved day, so subtract one). ripenDay is that plus the days still needed.
  const base = state.phase === "day" ? state.day - 1 : 0;
  const ripenDay = base + daysToRipe;
  const units = Math.round(c.yield * (field.fert / 3));
  const y = c.food > 0 ? { amount: Math.round(units * c.food), kind: "food" }
                       : { amount: units * c.sale, kind: "coin" };
  let when;
  if (daysToRipe === 0) when = "ripe";
  else if (ripenDay <= DAYS_PER_SEASON) when = `ripens day ${ripenDay}`;
  else if (c.seasons > 1) when = "ripens next season";
  else when = "won't ripen in time";
  return { crop: field.crop, name: c.name, tier: c.tier, ripe: daysToRipe === 0,
    daysToRipe, when, yield: y, needsTwo: !!c.needsTwo };
}

export const mouths = (s) => 1 + livingHands(s).length; // the farmer + living hands

// The household's survival targets for the cold months (fall + winter) still to come this
// year — what you must lay in — so the daily work has a visible goal instead of chopping or
// foraging blind. Pure. `have` is your current stock, `need` the cold-season consumption.
export function yearNeeds(state) {
  const m = mouths(state);
  const daysLeftInSeason = state.phase === "day" ? DAYS_PER_SEASON - state.day + 1 : DAYS_PER_SEASON;
  let coldDays = 0;
  for (let si = state.seasonIndex; si < SEASONS.length; si++) {
    if (SEASONS[si] !== "fall" && SEASONS[si] !== "winter") continue;
    coldDays += si === state.seasonIndex ? daysLeftInSeason : DAYS_PER_SEASON;
  }
  return {
    coldDays,
    fuel: { have: state.fuel, need: m * BALANCE.fuelPerMouthPerDay * coldDays },
    food: { have: Math.floor(state.larder), need: m * BALANCE.foodPerMouthPerDay * coldDays },
  };
}
export const fieldLabel = (f) => ["The East Field", "The River Strip", "The Near Acre", "The Stone Lot"][f.id] || `Field ${f.id + 1}`;
export const clearedFields = (s) => s.fields.filter((f) => f.cleared);

// The coin price to clear the NEXT field, escalating with how many are already cleared.
// Returns null when every field is cleared. One field cleared at the start, so the first
// price is clearCosts[0].
export function clearCost(state) {
  const already = clearedFields(state).length;
  const idx = already - 1; // 1 cleared → index 0 (the 2nd field's price)
  return idx >= 0 && idx < BALANCE.clearCosts.length ? BALANCE.clearCosts[idx] : null;
}
// The coin price of the NEXT hire (hands start at 1 = Reuben, so hands.length-1 indexes the
// cost of the next one). Pure.
export const hireCost = (s) => { const n = s.hands.length - 1; return BALANCE.hireCosts[n] ?? BALANCE.hireCosts[BALANCE.hireCosts.length - 1]; };
export const canHire = (s) => s.coin >= hireCost(s);

export const isWinter = (s) => season(s) === "winter";
export const burnsFuel = (s) => season(s) === "fall" || season(s) === "winter";
export const ripeFields = (s) => s.fields.filter(ripe);
export const emptyFields = (s) => s.fields.filter((f) => !f.crop);

// Reuben's recommended plan for the current day: a task per living hand. A sane default a
// newcomer can accept, and the baseline the player adjusts from. The player's own day is
// interactive, not pre-filled (see the day-phase screens). Heuristic: bring in what is ripe
// first (pairing a second hand onto a two-hand crop so the whole of it comes in), then chop
// when the cold is coming and fuel is short, then tend a distinct growing field each, else rest.
export function suggestPlan(state) {
  const living = livingHands(state);
  const ripeList = ripeFields(state); // field objects, so we can see needsTwo
  const growingQueue = growingFields(state, ripeList).map((f) => f.id);
  const cold = burnsFuel(state);
  const daysLeft = state.phase === "day" ? DAYS_PER_SEASON - state.day + 1 : DAYS_PER_SEASON;
  const foodShort = state.larder < mouths(state) * BALANCE.foodPerMouthPerDay * daysLeft; // won't carry the season
  const fuelShort = cold && state.fuel < mouths(state) * BALANCE.fuelPerMouthPerDay;
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
  return { hands };
}

// Planted fields that are not yet ripe, least-grown first. `ripeList` is ripeFields(state).
function growingFields(state, ripeList) {
  return state.fields.filter((f) => f.crop && !ripeList.some((r) => r.id === f.id))
    .sort((a, b) => a.progress - b.progress);
}

// Ledger warning lines the V0.3 design shows under the ledger (Screen 04). Strings only.
// Only meaningful during an active playing day: at Dusk (and beyond) the season is
// already settled, so there are no remaining days left to run short on.
export function warnings(s) {
  const out = [];
  const daysLeft = s.phase === "day" ? DAYS_PER_SEASON - s.day + 1 : 0;
  if (daysLeft === 0) return out;
  if (burnsFuel(s)) {
    const need = mouths(s) * BALANCE.fuelPerMouthPerDay * daysLeft;
    if (s.fuel < need) out.push(`Fuel is ${need - s.fuel} short of what the cold wants`);
  }
  const foodNeed = mouths(s) * BALANCE.foodPerMouthPerDay * daysLeft;
  if (s.larder < foodNeed) out.push(`The larder will not carry ${mouths(s)} mouths to the season's end`);
  return out;
}

// The fast-forward stopper. Returns human-readable reasons the "Let the days run"
// control should pause and hand the day back to the player. Empty array = a calm day
// that can be skipped. Phase A reasons only; later phases add events/callers/market.
export function interrupts(state) {
  if (state.phase !== "day") return [];
  const St = BALANCE.strain;
  const reasons = [];
  const harvesting = new Set(
    state.hands.filter((h) => h.alive && h.task === "harvest").map((h) => h.targetFieldId)
  );
  if (state.fields.some((f) => ripe(f) && !harvesting.has(f.id))) reasons.push("A crop stands ripe and no one is set to bring it in.");
  if (state.hands.some((h) => h.alive && h.strain >= St.failingAt)) reasons.push("A hand is failing and needs seeing to.");
  if (state.larder <= 0) reasons.push("The larder is empty.");
  if (state.day >= DAYS_PER_SEASON) reasons.push("It is the last day of the season.");
  return reasons;
}

// The town as it stands today: which odd-jobs are on offer (a deterministic slice of the
// deck, rotating by day so it feels fresh) and their done state, plus the callable locations.
// Pure: same state in, same offers out (no Math.random; the day+seed picks the slice).
export function townOffers(state) {
  const done = state.jobsDoneToday || [];
  const n = ODD_JOBS.length;
  // A deterministic per-day starting index into the deck (day, season, year, and the game
  // seed all feed it, so the offer varies across days and across runs without any RNG call).
  const start = ((state.day + state.seasonIndex * 7 + state.year * 31 + (state.rngSeed % n)) % n + n) % n;
  const jobs = [];
  for (let i = 0; i < Math.min(JOBS_PER_DAY, n); i++) {
    const j = ODD_JOBS[(start + i) % n];
    jobs.push({ ...j, done: done.includes(j.id) });
  }
  return { jobs, locations: LOCATIONS };
}

export const standingOf = (state, npc) => (state.standing && state.standing[npc]) || 0;

export function standingWord(v = 0) {
  const t = BALANCE.standing;
  if (v >= t.close) return "Close";
  if (v >= t.friendly) return "Friendly";
  if (v >= t.known) return "Known";
  return "Stranger";
}

// Which of an NPC's talks plays on the next visit: the first deck entry not yet seen whose
// minStanding is met, else the NPC's small-talk filler (so a visit is never empty). Pure.
export function nextTownScene(state, npc) {
  const deck = TALKS[npc] || [];
  const seen = state.talksSeen || [];
  const st = standingOf(state, npc);
  const next = deck.find((d) => d.minStanding <= st && !seen.includes(d.id));
  return next ? next.id : (SMALLTALK[npc] || null);
}

// True when the NPC has no fresh content left (their next talk would be small-talk filler).
export function talkIsDry(state, npc) {
  return nextTownScene(state, npc) === (SMALLTALK[npc] || null);
}

// The mortgage due at this year's settlement: the scheduled payment + upkeep (with sensible
// defaults past the authored years). Pure.
export function mortgageDue(state) {
  const y = state.year;
  const payment = BALANCE.mortgageSchedule[y] ?? 130;
  const upkeep = BALANCE.upkeepSchedule[y] ?? 35;
  return { payment, upkeep, total: payment + upkeep };
}
