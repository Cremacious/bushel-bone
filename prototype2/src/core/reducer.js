import { SEASONS, WEEKS_PER_SEASON, season } from "./state.js";
import { CROPS, ripe, weeklyGrowth } from "./crops.js";
import { BALANCE } from "./balance.js";
import { burnsFuel, fieldLabel, suggestPlan } from "./selectors.js";
import { SCENES } from "../content/scenes.js";

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
    case "SET_OVERLAY":
      return { ...state, overlay: action.overlay };
    case "CLOSE_OVERLAY":
      return { ...state, overlay: null };
    case "SET_TUTORIALS":
      return { ...state, tutorialsOn: !!action.on, overlay: null };
    case "DISMISS_TIP":
      return { ...state, overlay: null,
        tipsSeen: state.tipsSeen.includes(action.id) ? state.tipsSeen : [...state.tipsSeen, action.id] };
    case "BEGIN_SEASON":
      return beginSeason(state);
    case "OPEN_SCENE":
      return { ...state, phase: "scene", scene: { id: action.id, result: null } };
    case "CHOOSE_SCENE":
      return chooseScene(state, action.choiceId);
    case "CLOSE_SCENE":
      return closeScene(state);
    case "PLANT":
      return plant(state, action.fieldId, action.crop);
    case "FALLOW":
      return mapField(state, action.fieldId, (f) => ({ ...f, crop: null, progress: 0 }));
    case "SOW":
      return withSuggestedPlan({ ...state, phase: "week", week: 1 });
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

// Open the season into its first playable phase (planting, or straight to the week in
// winter). Shared by BEGIN_SEASON and a scene closing with after: "BEGIN_SEASON".
function beginSeason(s) {
  return { ...s, phase: season(s) === "winter" ? "week" : "planting", week: 1, logSeasonStart: s.log.length };
}

// Pre-fill the crew's tasks and the player's own week from Reuben's recommendation for the
// board as it stands. Called whenever a fresh week starts; the player overrides via ASSIGN.
function withSuggestedPlan(s) {
  const plan = suggestPlan(s);
  const hands = s.hands.map((h) => (h.alive && plan.hands[h.id])
    ? { ...h, task: plan.hands[h.id].task, targetFieldId: plan.hands[h.id].targetFieldId } : h);
  return { ...s, hands, playerAction: plan.player };
}

// A scripted scene: apply the chosen option's state deltas and record the choice, so the
// renderer can show the result prose and a "go on" that closes the scene.
function chooseScene(s, choiceId) {
  const sc = SCENES[s.scene && s.scene.id];
  if (!sc || !sc.choices.includes(choiceId)) return s;
  const fx = (sc.fx && sc.fx[choiceId]) || {};
  let ns = { ...s };
  if (fx.regard != null) ns.regard = Math.max(0, Math.min(100, ns.regard + fx.regard));
  if (fx.coin != null) ns.coin = Math.max(0, ns.coin + fx.coin);
  if (fx.reckoning != null) ns.reckoning = Math.max(0, ns.reckoning + fx.reckoning);
  return { ...ns, scene: { ...s.scene, result: choiceId } };
}

function closeScene(s) {
  const sc = SCENES[s.scene && s.scene.id];
  const base = { ...s, scene: null };
  return sc && sc.after === "BEGIN_SEASON" ? beginSeason(base) : { ...base, phase: "brief" };
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

  // 1) Labor: each living hand does its task; the player does theirs. Strain follows
  // REAL work — a hand told to tend bare ground or harvest an unripe field did nothing,
  // so it must not pay the hard-labor strain for empty motion.

  // 1a) Harvest is a field-level job: hands assigned to the same ripe field work it
  // together, and the field is brought in once. A crop that needs two hands (cotton)
  // yields only HALF when a single hand works it; two or more bring in the whole crop.
  const harvestCrews = {};
  for (const h of hands) {
    if (h.alive && h.task === "harvest" && h.targetFieldId != null) {
      (harvestCrews[h.targetFieldId] = harvestCrews[h.targetFieldId] || []).push(h.id);
    }
  }
  const workedHarvest = new Set();
  for (const fid of Object.keys(harvestCrews)) {
    const crew = harvestCrews[fid];
    const f = byId(Number(fid));
    if (!f || !ripe(f)) continue; // nothing to bring in → no work, no strain
    const c = CROPS[f.crop];
    let units = Math.round(c.yield * (f.fert / 3));
    const shorthanded = c.needsTwo && crew.length < 2;
    if (shorthanded) units = Math.floor(units / 2); // one pair of hands, half the crop
    if (c.food > 0) larder += units * c.food; else coin += units * c.sale;
    log.push(`Brought in ${c.name.toLowerCase()} from ${fieldLabel(f).toLowerCase()}${shorthanded ? ", but a single hand got only half of it" : ""}.`);
    f.crop = null; f.progress = 0; f.fert = Math.max(0, f.fert - 1);
    crew.forEach((id) => workedHarvest.add(id));
  }

  // 1b) Tend and chop are per-hand.
  const doLabor = (task, targetFieldId) => {
    if (task === "tend" && targetFieldId != null) {
      const f = byId(targetFieldId);
      if (f && f.crop) { f.tended = true; return true; }
    } else if (task === "chop") {
      fuel += BALANCE.fuelPerChopWeek; return true;
    } else if (task === "forage") {
      larder += BALANCE.forageFood; return true; // gather wild food onto the table now
    }
    return false;
  };
  for (const h of hands) {
    if (!h.alive) continue;
    const hard = h.task === "harvest" ? workedHarvest.has(h.id) : doLabor(h.task, h.targetFieldId);
    h.strain += hard ? St.hardLabor : (h.task === "rest" ? -St.restRecovery : 0);
  }
  // The player's own week:
  const pa = s.playerAction || { kind: "rest" };
  if (pa.kind === "work") doLabor("tend", pa.target);
  if (pa.kind === "forage") larder += BALANCE.forageFood; // the player gathers food too
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

  const next = { ...s, hands, fields, larder, fuel, coin, seed, week, phase, log: [...s.log, ...log] };
  return phase === "week" ? withSuggestedPlan(next) : next;
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
