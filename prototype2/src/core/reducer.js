import { season } from "./state.js";
import { CROPS, ripe, dailyGrowth } from "./crops.js";
import { BALANCE } from "./balance.js";
import { burnsFuel, fieldLabel, suggestPlan, interrupts } from "./selectors.js";
import { SCENES } from "../content/scenes.js";
import { ODD_JOBS } from "./town.js";

// Pure: (state, action) => nextState. Never mutates the input.
// Later plans add cases (resolveEvent, ...). For now: theme + the day/season/year
// clock, plus the daily-loop phase machine (season open, planting, standing orders,
// personal actions, day resolution, season close).
export function reduce(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.theme === "day" ? "day" : "night" };
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
      return { ...withStandingOrders({ ...state, phase: "day", day: 1 }),
        playerActionsLeft: BALANCE.playerActionsPerDay };
    case "ASSIGN":
      return mapHand(state, action.handId, (h) => ({ ...h, task: action.task, targetFieldId: action.targetFieldId }));
    case "DO_PLAYER_ACTION":
      return doPlayerAction(state, action);
    case "TURN_IN":
      return resolveDay(state);
    case "RUN_DAYS":
      return runDays(state);
    case "END_SEASON":
      return endSeason(state);
    case "ACCEPT_JOB":
      return acceptJob(state, action.id);
    case "VISIT":
      return visit(state, action.sceneId);
    default:
      return state;
  }
}

// Open the season into its first playable phase (planting, or straight to the days in
// winter). Shared by BEGIN_SEASON and a scene closing with after: "BEGIN_SEASON".
function beginSeason(s) {
  return season(s) === "winter"
    ? { ...withStandingOrders({ ...s, phase: "day", day: 1 }), playerActionsLeft: BALANCE.playerActionsPerDay, logSeasonStart: s.log.length }
    : { ...s, phase: "planting", day: 1, logSeasonStart: s.log.length };
}

// Pre-fill the crew's standing orders from Reuben's recommendation for the board as it
// stands. Called once when the season's play begins (SOW); the player overrides via ASSIGN,
// and the orders then PERSIST day to day (no nagging re-assignment each dawn).
function withStandingOrders(s) {
  const plan = suggestPlan(s);
  const hands = s.hands.map((h) => (h.alive && plan.hands[h.id])
    ? { ...h, task: plan.hands[h.id].task, targetFieldId: plan.hands[h.id].targetFieldId } : h);
  return { ...s, hands };
}

// The proprietor spends one of their day's actions on their own labor. Applied at once for
// instant feedback. work → help a field along; forage → food on the table; care → ease a hand.
function doPlayerAction(s, { kind, target }) {
  if (s.phase !== "day" || s.playerActionsLeft <= 0) return s;
  const St = BALANCE.strain;
  let ns = { ...s, playerActionsLeft: s.playerActionsLeft - 1 };
  if (kind === "forage") ns.larder = s.larder + BALANCE.forageFood;
  else if (kind === "work" && target != null) ns.fields = s.fields.map((f) => (f.id === target && f.crop) ? { ...f, tended: true } : f);
  else if (kind === "care" && target != null) ns.hands = s.hands.map((h) => (h.id === target && h.alive) ? { ...h, strain: Math.max(0, h.strain - St.careRecovery) } : h);
  // kind === "rest": spends the action, no effect (a quiet day)
  return ns;
}

// Take a paid odd-job: spend one of the day's actions, take the coin, mark it done so it
// cannot be double-claimed. A no-op off the day phase, with no actions, or if already done.
function acceptJob(s, id) {
  if (s.phase !== "day" || s.playerActionsLeft <= 0) return s;
  const job = ODD_JOBS.find((j) => j.id === id);
  if (!job || (s.jobsDoneToday || []).includes(id)) return s;
  return { ...s, coin: s.coin + job.coin, playerActionsLeft: s.playerActionsLeft - 1,
    jobsDoneToday: [...(s.jobsDoneToday || []), id] };
}

// Call on a townsperson: spend one action and open their talk scene. A no-op off the day
// phase or with no actions left. The scene remembers to return to the Town screen on close.
function visit(s, sceneId) {
  if (s.phase !== "day" || s.playerActionsLeft <= 0) return s;
  return { ...s, playerActionsLeft: s.playerActionsLeft - 1,
    phase: "scene", scene: { id: sceneId, result: null }, screen: "home" };
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
  if (sc && sc.after === "BEGIN_SEASON") return beginSeason(base);
  if (sc && sc.returnTo) return { ...base, screen: sc.returnTo, phase: "day" }; // back to town, mid-day
  return { ...base, phase: "brief" };
}

function mapField(s, id, fn) {
  return { ...s, fields: s.fields.map((f) => (f.id === id ? fn(f) : f)) };
}

function mapHand(s, id, fn) {
  const h = s.hands.find((x) => x.id === id && x.alive);
  if (!h) return s;
  return { ...s, hands: s.hands.map((x) => (x.id === id ? fn(x) : x)) };
}

// Resolve one day: crew labor, crop growth, the household eats, the cold bites, strain and
// loss — then advance to the next day (refilling personal actions) or into Dusk after the
// last day. Standing orders persist day to day; no re-assignment nag.
function resolveDay(s) {
  if (s.phase !== "day") return s; // guard against a stray double-dispatch applying an extra day
  let hands = s.hands.map((h) => ({ ...h }));       // work on copies
  let fields = s.fields.map((f) => ({ ...f }));
  let { larder, fuel, coin, seed } = s;
  const daylog = [];
  const St = BALANCE.strain;
  const byId = (id) => fields.find((f) => f.id === id);

  // 1) Labor: each living hand does its task. Strain follows REAL work — a hand told to
  // tend bare ground or harvest an unripe field did nothing, so it must not pay the
  // hard-labor strain for empty motion.

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
    daylog.push(`Brought in ${c.name.toLowerCase()} from ${fieldLabel(f).toLowerCase()}${shorthanded ? ", but a single hand got only half of it" : ""}.`);
    f.crop = null; f.progress = 0; f.fert = Math.max(0, f.fert - 1);
    crew.forEach((id) => workedHarvest.add(id));
  }

  // 1b) Tend / chop / forage are per-hand.
  const doLabor = (task, targetFieldId) => {
    if (task === "tend" && targetFieldId != null) {
      const f = byId(targetFieldId);
      if (f && f.crop) { f.tended = true; return true; }
    } else if (task === "chop") {
      fuel += BALANCE.fuelPerChopDay; return true;
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

  // 2) Crop growth (uses today's tended flags, set above and by DO_PLAYER_ACTION "work"), then reset tended.
  for (const f of fields) { if (f.crop) f.progress += dailyGrowth(f, s.weather); f.tended = false; }

  // 3) Eating: the household eats; a shortfall strains everyone alike. The already-worn
  // are the ones who then cross the loss threshold first, per the clamp/loss step below.
  const eaters = 1 + hands.filter((h) => h.alive).length;
  const foodWant = eaters * BALANCE.foodPerMouthPerDay;
  if (larder >= foodWant) { larder -= foodWant; }
  else { larder = 0; for (const h of hands) if (h.alive) h.strain += St.hungerPerDay; }

  // 4) Fall/winter cold: fuel burns; a shortfall strains everyone.
  if (burnsFuel(s)) {
    const fuelWant = eaters * BALANCE.fuelPerMouthPerDay;
    if (fuel >= fuelWant) fuel -= fuelWant;
    else { fuel = 0; for (const h of hands) if (h.alive) h.strain += St.coldPerDay; }
  }

  // 5) Loss: clamp strain, and lose anyone past the threshold.
  for (const h of hands) {
    h.strain = Math.max(0, Math.min(St.lostAt, h.strain));
    if (h.alive && h.strain >= St.lostAt) { h.alive = false; daylog.push(`${h.name} did not last the night.`); }
  }

  // 6) Advance one day, or into Dusk after the last day. Standing orders persist (no
  // re-suggestion here — the player's ASSIGN choices carry forward).
  let day = s.day + 1, phase = s.phase;
  if (day > BALANCE.daysPerSeason) { day = BALANCE.daysPerSeason; phase = "dusk"; }

  return { ...s, hands, fields, larder, fuel, coin, seed, day, phase,
    playerActionsLeft: BALANCE.playerActionsPerDay, daylog, jobsDoneToday: [],
    log: [...s.log, ...daylog] };
}

// "Let the days run": resolve day after day while nothing wants the player, stopping the
// moment interrupts() reports a reason (or the season ends into Dusk). A hard cap guards
// against a logic error looping forever.
function runDays(s) {
  let cur = s;
  for (let guard = 0; guard < BALANCE.daysPerSeason + 1; guard++) {
    if (cur.phase !== "day") break;               // reached dusk
    if (interrupts(cur).length) break;             // something wants attention
    cur = resolveDay(cur);
  }
  return cur;
}

function endSeason(s) {
  if (season(s) === "winter") return { ...s, phase: "yearend", ended: true }; // Year-1 slice ends here (multi-year = Plan 5)
  let seasonIndex = s.seasonIndex + 1;
  return { ...s, seasonIndex, day: 1, phase: "brief" };
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
