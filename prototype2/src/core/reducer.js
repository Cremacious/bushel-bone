import { season, makeHand, HAND_NAMES, livingHands } from "./state.js";
import { CROPS, ripe, dailyGrowth } from "./crops.js";
import { BALANCE } from "./balance.js";
import { burnsFuel, fieldLabel, interrupts, clearCost, nextTownScene, mortgageDue, hireCost, conditionOf } from "./selectors.js";
import { SCENES } from "../content/scenes.js";
import { ODD_JOBS, SMALLTALK } from "./town.js";
import { mulberry32 } from "./rng.js";
import { EVENTS, EVENT_CHANCE } from "./events.js";

// Condition wording for the day-log (spec §10.4). Rank orders the track so a change reads as
// better (a lower rank) or worse (a higher rank); capWord titles a condition for the "X to Y" line.
const CONDITION_RANK = { steady: 0, worn: 1, failing: 2, lost: 3 };
const capWord = (w) => w.charAt(0).toUpperCase() + w.slice(1);

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
      // Land the player on the guaranteed day-1 opening beat, not fast-forwarded. Their first
      // "Let the day pass" (TURN_IN) begins the run, one day at a time. A scripted nudge
      // (Reuben on hands) may lean in first, on the very first Sow of a run.
      return maybeScript({ ...withInitialRoles({ ...state, phase: "day", day: 1 }),
        actions: BALANCE.actionsPerDay });
    case "SET_ROLE":
      return mapHand(state, action.handId, (h) => ({ ...h, role: action.role }));
    case "SPEND_ACTION":
      return spendAction(state, action);
    // The day-screen's primary advance: exactly one day (resolveDay). The old CONTINUE
    // auto-run-to-beat is retired (#49); CONTINUE is kept only as a one-day alias so any
    // remaining caller (a sim policy, a test) advances a single day, never many silently.
    case "TURN_IN":
    case "CONTINUE":
      return resolveDay(state);
    case "SKIP_QUIET":
      return skipQuiet(state);
    case "END_SEASON":
      return endSeason(state);
    case "TURN_YEAR":
      return turnYear(state);
    case "ACCEPT_JOB":
      return acceptJob(state, action.id);
    case "VISIT":
      return visit(state, action.npc);
    case "WALK_TO":
      return { ...state, screen: "town", townAt: action.place || null };
    case "LEAVE_TOWN":
      return { ...state, screen: "home", townAt: null };
    case "CLEAR_FIELD":
      return clearField(state, action.fieldId);
    case "REVEAL_WAGON":
      // Pull the canvas back on Vane's wagon: open the scripted reveal. A no-op once the
      // clones are already revealed. closeScene sets s.cloneRevealed when the scene closes.
      if (state.cloneRevealed) return state;
      return { ...state, phase: "scene", scene: { id: "vane_reveal", result: null }, screen: "home" };
    case "HIRE":
      return hire(state);
    case "BUY_SEED":
      return buySeed(state);
    default:
      return state;
  }
}

// Open the season into its first playable phase (planting, or straight to the days in
// winter). Shared by BEGIN_SEASON and a scene closing with after: "BEGIN_SEASON".
function beginSeason(s) {
  return season(s) === "winter"
    ? { ...withInitialRoles({ ...s, phase: "day", day: 1 }), actions: BALANCE.actionsPerDay, logSeasonStart: s.log.length, jobsDoneThisSeason: [] }
    : { ...s, phase: "planting", day: 1, actions: BALANCE.actionsPerDay, logSeasonStart: s.log.length, jobsDoneThisSeason: [] };
}

// Roles persist across days (set once via SET_ROLE), so opening a season needs no per-day
// pre-fill. Kept as a seam for future season-open setup.
function withInitialRoles(s) { return s; }

// The proprietor spends one of the season's actions on their own labor at a beat. Applied at
// once. A no-op with none left.
function spendAction(s, { kind, target }) {
  if (s.actions <= 0) return s;
  const St = BALANCE.strain;
  let ns = { ...s, actions: s.actions - 1 };
  if (kind === "forage") ns.larder = s.larder + BALANCE.forageFood;
  else if (kind === "work" && target != null) ns.fields = s.fields.map((f) => (f.id === target && f.crop) ? { ...f, tended: true } : f);
  else if (kind === "care" && target != null) {
    // Care resolves outside resolveDay (no daylog here), so report any condition step straight
    // into the run log the moment you sit with the hand.
    const h = s.hands.find((x) => x.id === target && x.alive);
    if (h) {
      const before = conditionOf(h);
      const eased = { ...h, strain: Math.max(0, h.strain - St.careRecovery) };
      const after = conditionOf(eased);
      ns.hands = s.hands.map((x) => (x.id === target ? eased : x));
      if (after !== before) ns.log = [...s.log, `${h.name} eased. ${capWord(before)} to ${capWord(after)}.`];
    }
  }
  return ns;
}

// Take a paid odd-job: spend one of the season's actions, take the coin, mark it done so it
// cannot be double-claimed. The offer rolls to a fresh job every jobRespawnDays days (see
// selectors.townOffers): once taken, a job stays done for the rest of the season, not just the
// day. A no-op off the day phase, with no actions, or if already done this season.
function acceptJob(s, id) {
  if (s.phase !== "day" || s.actions <= 0) return s;
  const job = ODD_JOBS.find((j) => j.id === id);
  if (!job || (s.jobsDoneThisSeason || []).includes(id)) return s;
  const base = { ...s, actions: s.actions - 1,
    jobsDoneThisSeason: [...(s.jobsDoneThisSeason || []), id] };
  // The payoff now comes from the job's scene card (its choices, authored in Task 2). Open it
  // instead of paying straight away. Until a job has a scene, fall back to the flat coin so the
  // loop stays playable pre-content.
  if (!job.scene) return { ...base, coin: s.coin + job.coin };
  return { ...base, phase: "scene", scene: { id: job.scene, result: null }, screen: "home" };
}

// Call on a townsperson: open whichever of their talks comes next (see nextTownScene). A
// talk with real content still spends one of the season's actions and raises standing; once
// the deck is exhausted at the current standing, the small-talk filler is free (no action,
// no standing) so a visit is never a wasted action. Either way the talk is remembered so
// the deck rotates. A no-op off the day phase; real talks still need an action.
function visit(s, npc) {
  if (s.phase !== "day") return s;
  const sceneId = nextTownScene(s, npc);
  if (!sceneId) return s;
  const dry = sceneId === (SMALLTALK[npc] || null);
  if (!dry && s.actions <= 0) return s; // real talks still need an action
  const seen = s.talksSeen || [];
  return { ...s,
    actions: dry ? s.actions : s.actions - 1,
    standing: dry ? s.standing : { ...(s.standing || {}), [npc]: ((s.standing || {})[npc] || 0) + BALANCE.standing.perTalk },
    talksSeen: seen.includes(sceneId) ? seen : [...seen, sceneId],
    phase: "scene", scene: { id: sceneId, result: null }, screen: "home" };
}

// Apply a scene/event/outcome's fx block to state. Pure: never mutates the input, returns a
// fresh state. Each key clamps the way the loop expects (coin/larder/fuel/seed floor at 0,
// regard 0..100, strain 0..lostAt). Shared by chooseScene's flat and haggle paths (and any
// future fx sink).
export function applyFx(s, fx) {
  let ns = { ...s };
  if (!fx) return ns;
  if (fx.regard != null) ns.regard = Math.max(0, Math.min(100, ns.regard + fx.regard));
  if (fx.coin != null) ns.coin = Math.max(0, ns.coin + fx.coin);
  if (fx.reckoning != null) ns.reckoning = Math.max(0, ns.reckoning + fx.reckoning);
  if (fx.larder != null) ns.larder = Math.max(0, ns.larder + fx.larder);
  if (fx.fuel != null) ns.fuel = Math.max(0, ns.fuel + fx.fuel);
  if (fx.seed != null) ns.seed = Math.max(0, ns.seed + fx.seed);
  if (fx.strainAll != null) ns.hands = ns.hands.map((h) => h.alive ? { ...h, strain: Math.max(0, Math.min(BALANCE.strain.lostAt, h.strain + fx.strainAll)) } : h);
  if (fx.strainOne != null) { const w = ns.hands.find((h) => h.alive); if (w) ns.hands = ns.hands.map((h) => h.id === w.id ? { ...h, strain: Math.max(0, Math.min(BALANCE.strain.lostAt, h.strain + fx.strainOne)) } : h); }
  if (fx.loseHand) { const v = ns.hands.find((h) => h.alive && h.id !== "reuben"); if (v) ns.hands = ns.hands.map((h) => h.id === v.id ? { ...h, alive: false } : h); }
  return ns;
}

// Cumulative-weight pick over an odds map, given a roll in [0,1). Iterates the map's own key
// order (the outcome ids). Robust if the weights do not sum to exactly 1: the last bucket
// catches any remainder, so a roll past the summed weight still lands somewhere.
function pickWeighted(odds, roll) {
  const keys = Object.keys(odds);
  let acc = 0;
  for (const k of keys) { acc += odds[k]; if (roll < acc) return k; }
  return keys[keys.length - 1];
}

// A scripted scene: apply the chosen option's state deltas and record the choice, so the
// renderer can show the result prose and a "go on" that closes the scene. A haggle scene's
// risky option (sc.haggle.on) instead rolls a seeded outcome from sc.haggle.odds and records
// that OUTCOME id as the result; every other option, and every non-haggle scene, resolves flat.
function chooseScene(s, choiceId) {
  const sc = SCENES[s.scene && s.scene.id];
  if (!sc || !sc.choices.includes(choiceId)) return s;
  if (sc.haggle && sc.haggle.on === choiceId) {
    const rng = mulberry32(s.rngState);
    const roll = rng();
    const rngState = rng.getState();
    const outcomeId = pickWeighted(sc.haggle.odds, roll);
    const outFx = (sc.haggle.outcomes && sc.haggle.outcomes[outcomeId]) || {};
    const ns = applyFx({ ...s, rngState }, outFx);
    return { ...ns, scene: { ...s.scene, result: outcomeId } };
  }
  const fx = (sc.fx && sc.fx[choiceId]) || {};
  return { ...applyFx(s, fx), scene: { ...s.scene, result: choiceId } };
}

function closeScene(s) {
  const sc = SCENES[s.scene && s.scene.id];
  // A scene flagged revealsClones (the wagon reveal) sets the run-long flag as it closes: from
  // here on the town's wagon line is unmasked and hiring is open.
  const base = sc && sc.revealsClones ? { ...s, scene: null, cloneRevealed: true } : { ...s, scene: null };
  if (sc && sc.after === "BEGIN_SEASON") return beginSeason(base);
  if (sc && sc.returnTo === "run") return { ...base, phase: "day", skipped: 0 }; // an event beat: resume the running day (no stale "N days pass")
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
  // Each living hand's condition BEFORE the day's strain, so we can name any step it takes.
  const condBefore = {};
  for (const h of hands) if (h.alive) condBefore[h.id] = conditionOf(h);

  // 1) Labor by role. Field hands bring in what is ripe (pooling on a field; a two-hand crop
  // needs two), else tend the least-grown crop. Wood/forage are direct; rest recovers. Only
  // real work charges strain.
  const ripeList = fields.filter((f) => f.crop && ripe(f)).sort((a, b) => a.id - b.id);
  const growing = fields.filter((f) => f.crop && !ripe(f)).sort((a, b) => a.progress - b.progress);
  const fieldHands = hands.filter((h) => h.alive && h.role === "field");
  const harvestCrews = {}; let hi = 0;
  for (const f of ripeList) {
    const need = CROPS[f.crop].needsTwo ? 2 : 1;
    const crew = [];
    while (crew.length < need && hi < fieldHands.length) crew.push(fieldHands[hi++]);
    if (crew.length) harvestCrews[f.id] = crew.map((h) => h.id);
  }
  const tenders = fieldHands.slice(hi);
  const workedHarvest = new Set();
  for (const fid of Object.keys(harvestCrews)) {
    const crew = harvestCrews[fid]; const f = byId(Number(fid)); if (!f || !ripe(f)) continue;
    const c = CROPS[f.crop];
    let units = Math.round(c.yield * (f.fert / 3));
    const shorthanded = c.needsTwo && crew.length < 2; if (shorthanded) units = Math.floor(units / 2);
    if (c.food > 0) larder += units * c.food; else coin += units * c.sale;
    daylog.push(`Brought in ${c.name.toLowerCase()} from ${fieldLabel(f).toLowerCase()}${shorthanded ? ", a single hand getting only half" : ""}.`);
    f.crop = null; f.progress = 0; f.fert = Math.max(0, f.fert - 1);
    crew.forEach((id) => workedHarvest.add(id));
  }
  let gi = 0;
  for (const h of hands) {
    if (!h.alive) continue;
    let worked = false;
    if (h.role === "field") {
      if (workedHarvest.has(h.id)) worked = true;
      else if (tenders.includes(h) && gi < growing.length) { growing[gi++].tended = true; worked = true; }
    } else if (h.role === "wood") { fuel += BALANCE.fuelPerChopDay; worked = true; }
    else if (h.role === "forage") { larder += BALANCE.forageFood; worked = true; }
    h.strain += worked ? St.hardLabor : (h.role === "rest" ? -St.restRecovery : 0);
  }

  // 2) Crop growth (uses today's tended flags, set above and by SPEND_ACTION "work"), then reset tended.
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

  // 5b) Report any condition step, so a rest visibly pays off (playtest: Rest looked like a
  // no-op) and a bad day reads plainly. A lost hand already got its "did not last" line above.
  for (const h of hands) {
    if (!h.alive) continue;
    const before = condBefore[h.id];
    if (before == null) continue;
    const after = conditionOf(h);
    if (after === before) continue;
    daylog.push(CONDITION_RANK[after] < CONDITION_RANK[before]
      ? `${h.name} rested. ${capWord(before)} to ${capWord(after)}.`
      : `${h.name} is worn thin. ${capWord(before)} to ${capWord(after)}.`);
  }

  // 6) Advance one day, or into Dusk after the last day. Standing orders persist (no
  // re-suggestion here — the player's ASSIGN choices carry forward). The new day renews the
  // proprietor's action points: +actionsPerDay, unspent carrying over up to actionsCarryCap.
  let day = s.day + 1, phase = s.phase;
  let actions = s.actions;
  if (day > BALANCE.daysPerSeason) { day = BALANCE.daysPerSeason; phase = "dusk"; }
  else actions = Math.min(BALANCE.actionsCarryCap, s.actions + BALANCE.actionsPerDay);

  const next = { ...s, hands, fields, larder, fuel, coin, seed, day, phase, actions,
    daylog, skipped: 0, // a single manual advance passes no "quiet days"; only SKIP_QUIET sets this
    log: [...s.log, ...daylog] };
  return maybeEvent(next);
}

// After a day resolves, maybe an event stirs: a seeded roll; if it fires, pick a fresh,
// eligible event and pause the run at its scene (the scene IS the beat). Consumes rngState so
// a seed replays identically. Never fires on the last day (that beat is the season's close).
function maybeEvent(s) {
  if (s.phase !== "day" || s.day >= BALANCE.daysPerSeason) return s;
  const rng = mulberry32(s.rngState);
  const roll = rng();
  let rngState = rng.getState();
  if (roll >= EVENT_CHANCE) return { ...s, rngState };
  const seen = s.eventsSeen || [];
  const eligible = EVENTS.filter((e) => !seen.includes(e.id) && eventEligible(s, e));
  if (!eligible.length) return { ...s, rngState };
  const rng2 = mulberry32(rngState);
  const pick = eligible[Math.floor(rng2() * eligible.length)];
  rngState = rng2.getState();
  return { ...s, rngState, eventsSeen: [...seen, pick.id],
    phase: "scene", scene: { id: pick.id, result: null } };
}
// A scripted (deterministic, non-random) nudge owed at this exact moment, or null. Unlike
// maybeEvent this rolls no dice: Year-1 Spring points a newcomer to town about hands, once,
// and only before the wagon has been revealed. Pure; reads flags defensively for old saves.
export function pendingScript(state) {
  if (state.year === 1 && state.seasonIndex === 0
      && !(state.scriptSeen || []).includes("reuben_hands")
      && state.cloneRevealed !== true) return "reuben_hands";
  return null;
}

// If a scripted nudge is owed while on a playing day, open it as a scene AND mark it seen (so
// it fires exactly once, even if the player abandons the scene). Otherwise pass the state
// through untouched.
function maybeScript(s) {
  if (s.phase !== "day") return s;
  const id = pendingScript(s);
  if (!id) return s;
  return { ...s, scriptSeen: [...(s.scriptSeen || []), id],
    phase: "scene", scene: { id, result: null } };
}

function eventEligible(s, e) {
  const g = e.gate; if (!g) return true;
  if (g.season && !g.season.includes(season(s))) return false;
  if (g.minHands && livingHands(s).length <= g.minHands) return false; // needs a hand beyond Reuben
  return true;
}

// "Let the quiet days pass": the opt-in convenience that replaces the retired auto-run (#49).
// Only meaningful once the player has spent today's point (actions === 0) and nothing presses
// (interrupts empty) — the day-screen shows it under exactly those conditions. Advances day by
// day while it stays genuinely quiet, stopping the moment an interrupt appears, an event fires
// (resolveDay flips the phase off "day"), or the season closes. Counts the days passed into
// `skipped`, so the beat it lands on can say "N days pass." A no-op if the player still has a
// point to decide today or something already wants them. A hard cap guards against a logic error.
function skipQuiet(s) {
  if (s.phase !== "day") return s;
  if (s.actions > 0) return s;            // a point is still yours to spend — nothing to skip
  if (interrupts(s).length) return s;     // something already wants attention this day
  let cur = s, n = 0;
  for (let guard = 0; guard <= BALANCE.daysPerSeason; guard++) {
    const next = resolveDay(cur);
    n++;
    cur = next;
    if (next.phase !== "day") break;      // an event fired, or the season rolled into Dusk
    if (interrupts(next).length) break;   // a beat wants the player — hand it back here
  }
  return { ...cur, skipped: n };
}

function endSeason(s) {
  if (season(s) === "winter") return { ...s, phase: "settlement" }; // year-end accounts, not game-over
  return { ...s, seasonIndex: s.seasonIndex + 1, day: 1, phase: "brief" };
}

// Settle the year's mortgage and either roll into the next Spring or foreclose. Payment +
// upkeep + any arrears come out of coin; a shortfall accrues as arrears and a warning. A
// second consecutive short year (already warned, still short) loses the land.
function turnYear(s) {
  const due = mortgageDue(s);
  let coin = s.coin;
  let { arrears, warned, balance } = s.mortgage;
  const owed = due.total + arrears;
  if (coin >= owed) {
    coin -= owed; arrears = 0; warned = false; balance = Math.max(0, balance - due.payment);
  } else {
    const short = owed - coin; coin = 0; arrears = short;
    balance = Math.max(0, balance - Math.max(0, due.payment - short));
    if (warned) return { ...s, phase: "foreclosed", ended: true, coin, mortgage: { balance, arrears, warned: true } };
    warned = true;
  }
  return { ...s, coin, mortgage: { balance, arrears, warned },
    year: s.year + 1, seasonIndex: 0, day: 1, phase: "brief" };
}

// Clear an overgrown field for coin, at the escalating price. A no-op if the field is
// already cleared, unknown, or unaffordable. Clearing is a capital purchase (coin only),
// not one of the day's actions.
function clearField(s, id) {
  const f = s.fields.find((x) => x.id === id);
  if (!f || f.cleared) return s;
  const cost = clearCost(s);
  if (cost == null || s.coin < cost) return s;
  return { ...mapField(s, id, (x) => ({ ...x, cleared: true })), coin: s.coin - cost };
}

// Hire a clone hand from Vane's wagon for coin. A hire is one town errand, so it costs one
// action point (day phase only). A no-op off the day, with no action point, or if unaffordable.
// The new hand is a fresh mouth (food + winter fuel scale with the crew already), so hiring
// raises running costs.
function hire(s) {
  if (s.phase !== "day" || s.actions <= 0) return s;
  const cost = hireCost(s);
  if (s.coin < cost) return s;
  const used = new Set(s.hands.map((h) => h.name));
  const name = HAND_NAMES.find((n) => !used.has(n)) || `Hand ${s.hands.length + 1}`;
  const id = "hand" + s.hands.length;
  return { ...s, actions: s.actions - 1, coin: s.coin - cost, hands: [...s.hands, makeHand(id, name)] };
}

function plant(s, id, cropKey) {
  const field = s.fields.find((f) => f.id === id);
  const crop = CROPS[cropKey];
  if (!field || !field.cleared || field.crop || !crop) return s; // uncleared, taken, or unknown crop
  if (s.seed < crop.seed) return s;               // must have the seed; buy it at the store
  return { ...mapField(s, id, (f) => ({ ...f, crop: cropKey, progress: 0, tended: false })), seed: s.seed - crop.seed };
}

// Buy a bundle of seed from Tolliver's store. Coin -> seed: the sink that makes coin matter
// and turns planting into a budgeted choice. A no-op if the bundle can't be afforded.
function buySeed(s) {
  const cost = BALANCE.seedBundle * BALANCE.seedPrice;
  if (s.coin < cost) return s;
  return { ...s, coin: s.coin - cost, seed: s.seed + BALANCE.seedBundle };
}
