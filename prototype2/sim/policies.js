// Three scripted player policies for the balance sim (economy task 7; reworked for the v0.4
// beat loop / role model in Phase 1 Task 4). Each is a pure `policy(state) => action` function:
// no Math.random, decided entirely from the state the real reducer hands back, so a run is
// fully deterministic for a given seed. `structural(s)` handles every phase that isn't a real
// decision (scene/brief/dusk/settlement); each policy only differs in what it does during
// `planting` (crop choice) and `day` (standing roles, season actions, expansion).
import { CROPS, ripe } from "../src/core/crops.js";
import { BALANCE } from "../src/core/balance.js";
import { livingHands, season } from "../src/core/state.js";
import { mouths, burnsFuel, clearCost, hireCost, mortgageDue, canBuySeed, townOffers } from "../src/core/selectors.js";
import { SCENES, openingSceneId } from "../src/content/scenes.js";

// --- shared structural step: every phase that isn't a real player decision -----------------
function structural(s) {
  if (s.phase === "brief") {
    const opener = openingSceneId(s);
    return opener ? { type: "OPEN_SCENE", id: opener } : { type: "BEGIN_SEASON" };
  }
  if (s.phase === "scene") {
    const sc = SCENES[s.scene && s.scene.id];
    if (s.scene && s.scene.result == null && sc && sc.choices && sc.choices.length) {
      // Resolve any open scene (incl. a job card) sensibly: on a haggle take the SAFE option
      // rather than gamble; otherwise the first choice, which for the job cards is the fuller,
      // decent payoff. So an accepted job actually pays instead of stalling on choices[0].
      const cid = sc.haggle ? (sc.choices.find((c) => c !== sc.haggle.on) || sc.choices[0]) : sc.choices[0];
      return { type: "CHOOSE_SCENE", choiceId: cid };
    }
    return { type: "CLOSE_SCENE" };
  }
  if (s.phase === "dusk") return { type: "END_SEASON" };
  if (s.phase === "settlement") return { type: "TURN_YEAR" };
  return null; // planting/day: the policy decides
}

// --- planting ---------------------------------------------------------------------------------
// v0.4 phase2: seed is a real coin sink (BUY_SEED at Tolliver's), so affordability is a seed
// check only (no coin fallback).
function affordable(s, cropKey) {
  const c = CROPS[cropKey];
  return !!c && c.seed <= s.seed;
}

// Fill cleared, empty fields one at a time via `chooseCrop(s, field)`. Restocks seed from
// Tolliver's the moment it runs low so the policy can keep planting, falls back to the
// cheapest staple (turnip) if the preferred crop is still unaffordable, and to SOW (leaving
// the field fallow) only if seed truly cannot be bought, so the policy never asks for a
// no-op PLANT that would wedge the harness.
function plantStep(s, chooseCrop) {
  const field = s.fields.find((f) => f.cleared && !f.crop);
  if (!field) return { type: "SOW" };
  if (s.seed < 6 && canBuySeed(s)) return { type: "BUY_SEED" };
  let crop = chooseCrop(s, field);
  if (!affordable(s, crop)) crop = "turnip";
  if (!affordable(s, crop) && canBuySeed(s)) return { type: "BUY_SEED" };
  if (!affordable(s, crop)) return { type: "SOW" };
  return { type: "PLANT", fieldId: field.id, crop };
}

// Keep just enough fields in food to feed the crew (about one potato field per two mouths),
// and put every other field into cash. Coordinated across the dawn's plantings by counting the
// food fields already sown, so the coin crop actually gets grown instead of a larder of unsold
// potatoes. Cotton (two-hand) only when there are hands to pair on it.
const optimalCrop = (s, field) => {
  const foodFieldsWanted = Math.ceil(mouths(s) / 2);
  const foodFieldsSown = s.fields.filter((f) => f.crop === "potato" || f.crop === "turnip").length;
  if (foodFieldsSown < foodFieldsWanted) return "potato";
  return livingHands(s).length >= 2 && field.id % 3 === 0 ? "cotton" : "corn";
};
const normalCrop = (s, field) => (field.id % 2 === 0 ? "potato" : "corn"); // a mixed, middling line
const sloppyCrop = () => "potato"; // never diversifies

// --- day: standing roles ---------------------------------------------------------------------
// A worn hand always rests first, no matter the policy's ambition (past that point they are a
// liability, not labor); the policies differ in what they do with a hand that is fit to work.

// optimal: keeps at most one hand chopping (banks fuel ahead of the cold, or catches up once it
// runs short), sends a hand foraging when the larder is thin, and puts everyone else fit to the
// fields. So a well-played line always has fuel in hand come fall and never starves for it.
function optimalAssign(s) {
  const cold = burnsFuel(s);
  const fuelShort = s.fuel < mouths(s) * BALANCE.fuelPerMouthPerDay * BALANCE.daysPerSeason; // less than a season's worth banked
  const foodShort = s.larder < mouths(s) * BALANCE.foodPerMouthPerDay * 3; // a few days' buffer
  const roles = {};
  let woodAssigned = false;
  for (const h of livingHands(s)) {
    if (h.strain >= BALANCE.strain.wornAt) { roles[h.id] = "rest"; continue; }
    if ((cold || fuelShort) && !woodAssigned) { roles[h.id] = "wood"; woodAssigned = true; continue; }
    if (foodShort) { roles[h.id] = "forage"; continue; }
    roles[h.id] = "field";
  }
  return roles;
}

// normal: a plainer split — the first hand chops through the cold seasons (and only then),
// everyone else fields, no reaction to a thin larder. Rest still comes first for a worn hand.
function normalAssign(s) {
  const cold = burnsFuel(s);
  const roles = {};
  livingHands(s).forEach((h, i) => {
    if (h.strain >= BALANCE.strain.wornAt) { roles[h.id] = "rest"; return; }
    roles[h.id] = cold && i === 0 ? "wood" : "field";
  });
  return roles;
}

// sloppy: everyone stays on the fields, always — never chops, never forages, never rests a
// worn hand — so the fuel store never fills and winter bites exactly as it should.
function sloppyAssign(s) {
  const roles = {};
  livingHands(s).forEach((h) => { roles[h.id] = "field"; });
  return roles;
}

// --- day: the player's own season actions ----------------------------------------------------
function optimalPersonal(s) {
  if (s.seasonActionsLeft <= 0) return null;
  if (s.larder < mouths(s) * 20) return { type: "SPEND_ACTION", kind: "forage" };
  const worn = s.hands.find((h) => h.alive && h.strain >= BALANCE.strain.wornAt);
  if (worn) return { type: "SPEND_ACTION", kind: "care", target: worn.id };
  const growing = s.fields.find((f) => f.crop && !ripe(f));
  if (growing) return { type: "SPEND_ACTION", kind: "work", target: growing.id };
  return null;
}
function normalPersonal(s) {
  if (s.seasonActionsLeft <= 0) return null;
  if (s.larder < mouths(s) * 10 && s.seasonActionsLeft > 2) return { type: "SPEND_ACTION", kind: "forage" };
  return null;
}
const sloppyPersonal = () => null; // never forages, never takes odd jobs

// --- day: expansion (clear a field / hire a hand) -------------------------------------------
function optimalExpand(s) {
  const buffer = mortgageDue(s).total + s.mortgage.arrears + 15; // keep the mortgage covered, thin cushion
  const cc = clearCost(s);
  if (cc != null && s.coin - cc >= buffer) {
    const f = s.fields.find((x) => !x.cleared);
    if (f) return { type: "CLEAR_FIELD", fieldId: f.id };
  }
  // Hire only when genuinely short-handed: you work too, so a hand per field over-hires and
  // just adds a mouth. Bring one on when the fields outrun the workers (you + hands) by two.
  const clearedCount = s.fields.filter((f) => f.cleared).length;
  const workers = s.hands.length + 1; // the hands plus you
  const hc = hireCost(s);
  if (clearedCount >= workers + 1 && s.coin - hc >= buffer) return { type: "HIRE" };
  return null;
}
function normalExpand(s) {
  const buffer = mortgageDue(s).total + s.mortgage.arrears + 25; // a modest cushion
  const cc = clearCost(s);
  if (cc != null && s.coin - cc >= buffer) {
    const f = s.fields.find((x) => !x.cleared);
    if (f) return { type: "CLEAR_FIELD", fieldId: f.id };
  }
  const clearedCount = s.fields.filter((f) => f.cleared).length;
  const hc = hireCost(s);
  if (s.hands.length < clearedCount && s.coin - hc >= buffer) return { type: "HIRE" };
  return null;
}
// sloppy: clears greedily the moment it can afford the sticker price, no mortgage buffer kept,
// and never hires (so the single-hand crew falls further behind as fields pile up uncleared work).
function sloppyExpand(s) {
  const cc = clearCost(s);
  if (cc != null && s.coin >= cc) {
    const f = s.fields.find((x) => !x.cleared);
    if (f) return { type: "CLEAR_FIELD", fieldId: f.id };
  }
  return null;
}

// --- day: paid town work ---------------------------------------------------------------------
// A careful player mops up any leftover season-action on paid town work: if an action remains
// and an un-taken job is on offer, accept it (structural then resolves the job card sensibly).
// Placed LAST in the beat, so it only ever spends SURPLUS actions — never one that essential
// farm work (forage/care/field-tending) wanted first. sloppy skips it (leaves coin on the table).
function takeJob(s) {
  if (s.seasonActionsLeft <= 0) return null;
  const job = townOffers(s).jobs.find((j) => !j.done);
  return job ? { type: "ACCEPT_JOB", id: job.id } : null;
}

// --- day: assemble one action from roles → personal → expansion → paid work → advance --------
function dayStep(s, { assign, personal, expand, jobs }) {
  const desired = assign(s);
  for (const h of livingHands(s)) {
    const want = desired[h.id];
    if (want && h.role !== want) {
      return { type: "SET_ROLE", handId: h.id, role: want };
    }
  }
  const p = personal(s);
  if (p) return p;
  const e = expand(s);
  if (e) return e;
  if (jobs) { const j = jobs(s); if (j) return j; }
  return { type: "CONTINUE" }; // roles and this beat's spending are set — advance to the next beat
}

// --- the three exported policies -------------------------------------------------------------
export function optimal(s) {
  const st = structural(s);
  if (st) return st;
  if (s.phase === "planting") return plantStep(s, optimalCrop);
  if (s.phase === "day") return dayStep(s, { assign: optimalAssign, personal: optimalPersonal, expand: optimalExpand, jobs: takeJob });
  return null;
}

export function normal(s) {
  const st = structural(s);
  if (st) return st;
  if (s.phase === "planting") return plantStep(s, normalCrop);
  if (s.phase === "day") return dayStep(s, { assign: normalAssign, personal: normalPersonal, expand: normalExpand, jobs: takeJob });
  return null;
}

export function sloppy(s) {
  const st = structural(s);
  if (st) return st;
  if (s.phase === "planting") return plantStep(s, sloppyCrop);
  if (s.phase === "day") return dayStep(s, { assign: sloppyAssign, personal: sloppyPersonal, expand: sloppyExpand });
  return null;
}
