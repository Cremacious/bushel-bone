import { SEASONS, WEEKS_PER_SEASON, season } from "./state.js";
import { CROPS, ripe, weeklyGrowth } from "./crops.js";
import { BALANCE } from "./balance.js";
import { burnsFuel, fieldLabel } from "./selectors.js";

// Pure: (state, action) => nextState. Never mutates the input.
// Later plans add cases (resolveEvent, ...). For now: theme + the week/season/year
// clock (ADVANCE_WEEK, superseded in play by RESOLVE_WEEK), plus the weekly-loop
// phase machine (season open, planting, assignment, resolution, season close).
export function reduce(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.theme === "day" ? "day" : "night" };
    case "ADVANCE_WEEK":
      return advanceWeek(state);
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "BEGIN_SEASON":
      return { ...state, phase: season(state) === "winter" ? "week" : "planting", week: 1, logSeasonStart: state.log.length };
    case "PLANT":
      return plant(state, action.fieldId, action.crop);
    case "FALLOW":
      return mapField(state, action.fieldId, (f) => ({ ...f, crop: null, progress: 0 }));
    case "SOW":
      return { ...state, phase: "week", week: 1 };
    case "ASSIGN":
      return mapHand(state, action.handId, (h) => ({ ...h, task: action.task, targetFieldId: action.targetFieldId }));
    case "SET_PLAYER_ACTION":
      return { ...state, playerAction: { kind: action.kind, target: action.target } };
    case "RESOLVE_WEEK":
      return resolveWeek(state);
    case "END_SEASON":
      return endSeason(state);
    default:
      return state;
  }
}

function advanceWeek(s) {
  let { week, seasonIndex, year } = s;
  week += 1;
  if (week > WEEKS_PER_SEASON) {
    week = 1;
    seasonIndex += 1;
    if (seasonIndex > SEASONS.length - 1) { seasonIndex = 0; year += 1; }
  }
  return { ...s, week, seasonIndex, year };
}

function mapField(s, id, fn) {
  return { ...s, fields: s.fields.map((f) => (f.id === id ? fn(f) : f)) };
}

function mapHand(s, id, fn) {
  const h = s.hands.find((x) => x.id === id && x.alive);
  if (!h) return s;
  return { ...s, hands: s.hands.map((x) => (x.id === id ? fn(x) : x)) };
}

function resolveWeek(s) {
  if (s.phase !== "week") return s; // guard against a stray double-dispatch applying an extra week
  let hands = s.hands.map((h) => ({ ...h }));       // work on copies
  let fields = s.fields.map((f) => ({ ...f }));
  let { larder, fuel, coin, seed } = s;
  const log = [];
  const St = BALANCE.strain;
  const byId = (id) => fields.find((f) => f.id === id);

  // 1) Labor: each living hand does its task; the player does theirs.
  const doLabor = (task, targetFieldId) => {
    if (task === "tend" && targetFieldId != null) { const f = byId(targetFieldId); if (f && f.crop) f.tended = true; }
    else if (task === "chop") { fuel += BALANCE.fuelPerChopWeek; }
    else if (task === "harvest" && targetFieldId != null) {
      const f = byId(targetFieldId);
      if (f && ripe(f)) {
        const c = CROPS[f.crop];
        const units = Math.round(c.yield * (f.fert / 3));
        if (c.food > 0) larder += units * c.food; else coin += units * c.sale;
        log.push(`Brought in ${f.crop === "cotton" ? "cotton" : c.name.toLowerCase()} from ${fieldLabel(f).toLowerCase()}.`);
        f.crop = null; f.progress = 0; f.fert = Math.max(0, f.fert - 1);
      }
    }
    return task === "tend" || task === "chop" || task === "harvest";
  };
  for (const h of hands) if (h.alive) { const hard = doLabor(h.task, h.targetFieldId); h.strain += hard ? St.hardLabor : (h.task === "rest" ? -St.restRecovery : 0); }
  // The player's own week:
  const pa = s.playerAction || { kind: "rest" };
  if (pa.kind === "work") doLabor("tend", pa.target);
  if (pa.kind === "care") { const h = hands.find((x) => x.id === pa.target && x.alive); if (h) h.strain -= St.careRecovery; }

  // 2) Crop growth (uses the tended flags set above), then reset tended.
  for (const f of fields) { if (f.crop) f.progress += weeklyGrowth(f, s.weather); f.tended = false; }

  // 3) Eating: the household eats; a shortfall strains everyone alike. The already-worn
  // are the ones who then cross the loss threshold first, per the clamp/loss step below.
  const eaters = 1 + hands.filter((h) => h.alive).length;
  const foodWant = eaters * BALANCE.foodPerMouthPerWeek;
  if (larder >= foodWant) { larder -= foodWant; }
  else { larder = 0; strainHungry(hands, St.hungerPerWeek); }

  // 4) Winter/fall cold: fuel burns; a shortfall strains everyone.
  if (burnsFuel(s)) {
    const fuelWant = eaters * BALANCE.fuelPerMouthPerWeek;
    if (fuel >= fuelWant) fuel -= fuelWant;
    else { fuel = 0; for (const h of hands) if (h.alive) h.strain += St.coldPerWeek; }
  }

  // 5) Loss: clamp strain, and lose anyone past the threshold.
  for (const h of hands) {
    h.strain = Math.max(0, Math.min(St.lostAt, h.strain));
    if (h.alive && h.strain >= St.lostAt) { h.alive = false; log.push(`${h.name} did not last the week.`); }
  }

  // 6) Advance the week / into Dusk.
  let week = s.week + 1, phase = s.phase;
  if (week > BALANCE.weeksPerSeason) { week = BALANCE.weeksPerSeason; phase = "dusk"; }

  return { ...s, hands, fields, larder, fuel, coin, seed, week, phase, log: [...s.log, ...log] };
}

// A shared shortfall bites every living hand equally; the already-worn are the ones
// who then cross the loss threshold first (emergent from the equal add, not from order).
function strainHungry(hands, amount) {
  for (const h of hands) if (h.alive) h.strain += amount;
}

function endSeason(s) {
  if (season(s) === "winter") return { ...s, phase: "yearend", ended: true }; // Year-1 slice ends here (multi-year = Plan 5)
  let seasonIndex = s.seasonIndex + 1;
  return { ...s, seasonIndex, week: 1, phase: "brief" };
}

function plant(s, id, cropKey) {
  const field = s.fields.find((f) => f.id === id);
  const crop = CROPS[cropKey];
  if (!field || field.crop || !crop) return s;           // taken or unknown crop
  const seedSpent = Math.min(s.seed, crop.seed);
  const coinSpent = crop.seed - seedSpent;               // seed first, then coin
  if (coinSpent > s.coin) return s;                      // cannot afford
  return {
    ...mapField(s, id, (f) => ({ ...f, crop: cropKey, progress: 0, tended: false })),
    seed: s.seed - seedSpent,
    coin: s.coin - coinSpent,
  };
}
