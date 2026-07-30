// Three scripted player policies for the balance sim (economy task 7). Each is a pure
// `policy(state) => action` function: no Math.random, decided entirely from the state the real
// reducer hands back, so a run is fully deterministic for a given seed. `structural(s)` handles
// every phase that isn't a real decision (scene/brief/dusk/settlement); each policy only differs
// in what it does during `planting` (crop choice) and `day` (assignment, personal actions,
// expansion).
import { CROPS, ripe } from "../src/core/crops.js";
import { BALANCE } from "../src/core/balance.js";
import { livingHands, season } from "../src/core/state.js";
import { ripeFields, mouths, burnsFuel, suggestPlan, clearCost, hireCost, mortgageDue } from "../src/core/selectors.js";
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
      return { type: "CHOOSE_SCENE", choiceId: sc.choices[0] };
    }
    return { type: "CLOSE_SCENE" };
  }
  if (s.phase === "dusk") return { type: "END_SEASON" };
  if (s.phase === "settlement") return { type: "TURN_YEAR" };
  return null; // planting/day: the policy decides
}

// --- planting ---------------------------------------------------------------------------------
function affordable(s, cropKey) {
  const c = CROPS[cropKey];
  if (!c) return false;
  const seedSpent = Math.min(s.seed, c.seed);
  const coinSpent = c.seed - seedSpent;
  return coinSpent <= s.coin;
}

// Fill cleared, empty fields one at a time via `chooseCrop(s, field)`. Falls back to the
// cheapest staple (turnip) if the preferred crop is unaffordable, and to SOW (leaving the field
// fallow) if even that can't be afforded, so the policy never asks for a no-op PLANT that would
// wedge the harness.
function plantStep(s, chooseCrop) {
  const field = s.fields.find((f) => f.cleared && !f.crop);
  if (!field) return { type: "SOW" };
  let crop = chooseCrop(s, field);
  if (!affordable(s, crop)) crop = "turnip";
  if (!affordable(s, crop)) return { type: "SOW" };
  return { type: "PLANT", fieldId: field.id, crop };
}

const optimalCrop = (s, field) => {
  const safe = s.larder >= mouths(s) * 15; // well ahead of near-term eating
  if (!safe) return "potato";
  return field.id % 2 === 0 ? "corn" : "cotton"; // bias cash once the table is safely stocked
};
const normalCrop = (s, field) => (field.id % 2 === 0 ? "potato" : "corn"); // a mixed, middling line
const sloppyCrop = () => "potato"; // never diversifies

// --- day: assignment ----------------------------------------------------------------------
// optimal reuses the game's own recommended plan (Reuben's suggestPlan): harvest ripe fields
// first (pairing a second hand onto a two-hand crop), then forage if the larder is going short,
// else chop against the cold, else tend a growing field, else rest.
const optimalAssign = (s) => suggestPlan(s).hands;

// normal: harvest ripe fields but never pairs a second hand onto a two-hand crop (so cotton
// always comes in shorthanded), only reacts to food/fuel once they are fully exhausted.
function normalAssign(s) {
  const living = livingHands(s);
  const ripeList = ripeFields(s);
  const hands = {};
  let i = 0;
  for (const f of ripeList) {
    if (i >= living.length) break;
    hands[living[i++].id] = { task: "harvest", targetFieldId: f.id };
  }
  const growing = s.fields.filter((f) => f.crop && !ripeList.some((r) => r.id === f.id)).map((f) => f.id);
  for (; i < living.length; i++) {
    const h = living[i];
    if (s.larder <= 0) hands[h.id] = { task: "forage", targetFieldId: undefined };
    else if (burnsFuel(s) && s.fuel <= 0) hands[h.id] = { task: "chop", targetFieldId: undefined };
    else if (growing.length) hands[h.id] = { task: "tend", targetFieldId: growing.shift() };
    else hands[h.id] = { task: "rest", targetFieldId: undefined };
  }
  return hands;
}

// sloppy: only bothers to harvest a ripe field once the season is already more than half spent
// (so crops sit ripe and unclaimed for days), ignores fuel entirely until winter actually bites,
// never forages, and otherwise just alternates tend/rest.
function sloppyAssign(s) {
  const living = livingHands(s);
  const hands = {};
  let i = 0;
  if (s.day > 8) {
    for (const f of ripeFields(s)) {
      if (i >= living.length) break;
      hands[living[i++].id] = { task: "harvest", targetFieldId: f.id };
    }
  }
  const growing = s.fields.filter((f) => f.crop).map((f) => f.id);
  for (; i < living.length; i++) {
    const h = living[i];
    if (season(s) === "winter" && s.fuel <= 0) hands[h.id] = { task: "chop", targetFieldId: undefined };
    else if (i % 2 === 0 && growing.length) hands[h.id] = { task: "tend", targetFieldId: growing.shift() };
    else hands[h.id] = { task: "rest", targetFieldId: undefined };
  }
  return hands;
}

// --- day: the player's own personal actions -------------------------------------------------
function optimalPersonal(s) {
  if (s.playerActionsLeft <= 0) return null;
  if (s.day <= 5 && s.larder < mouths(s) * 20) return { type: "DO_PLAYER_ACTION", kind: "forage" };
  const worn = s.hands.find((h) => h.alive && h.strain >= BALANCE.strain.wornAt);
  if (worn) return { type: "DO_PLAYER_ACTION", kind: "care", target: worn.id };
  const growing = s.fields.find((f) => f.crop && !ripe(f));
  if (growing) return { type: "DO_PLAYER_ACTION", kind: "work", target: growing.id };
  return null;
}
function normalPersonal(s) {
  if (s.playerActionsLeft <= 0) return null;
  if (s.larder < mouths(s) * 10 && s.day % 3 === 0) return { type: "DO_PLAYER_ACTION", kind: "forage" };
  return null;
}
const sloppyPersonal = () => null; // never forages, never takes odd jobs

// --- day: expansion (clear a field / hire a hand) -------------------------------------------
function optimalExpand(s) {
  const buffer = mortgageDue(s).total + s.mortgage.arrears + 50; // always keep the mortgage covered, plus a cushion
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
function normalExpand(s) {
  const buffer = mortgageDue(s).total + s.mortgage.arrears + 100; // a bigger cushion than optimal
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

// --- day: assemble one action from assignment → personal → expansion → turn the day in -----
function dayStep(s, { assign, personal, expand }) {
  const desired = assign(s);
  for (const h of livingHands(s)) {
    const want = desired[h.id];
    if (want && (h.task !== want.task || h.targetFieldId !== want.targetFieldId)) {
      return { type: "ASSIGN", handId: h.id, task: want.task, targetFieldId: want.targetFieldId };
    }
  }
  const p = personal(s);
  if (p) return p;
  const e = expand(s);
  if (e) return e;
  return { type: "TURN_IN" };
}

// --- the three exported policies -------------------------------------------------------------
export function optimal(s) {
  const st = structural(s);
  if (st) return st;
  if (s.phase === "planting") return plantStep(s, optimalCrop);
  if (s.phase === "day") return dayStep(s, { assign: optimalAssign, personal: optimalPersonal, expand: optimalExpand });
  return null;
}

export function normal(s) {
  const st = structural(s);
  if (st) return st;
  if (s.phase === "planting") return plantStep(s, normalCrop);
  if (s.phase === "day") return dayStep(s, { assign: normalAssign, personal: normalPersonal, expand: normalExpand });
  return null;
}

export function sloppy(s) {
  const st = structural(s);
  if (st) return st;
  if (s.phase === "planting") return plantStep(s, sloppyCrop);
  if (s.phase === "day") return dayStep(s, { assign: sloppyAssign, personal: sloppyPersonal, expand: sloppyExpand });
  return null;
}
