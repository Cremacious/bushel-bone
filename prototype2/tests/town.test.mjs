import { describe, it, expect } from "vitest";
import { lookupName, tok } from "../src/content/names.js";
import { L } from "../src/content/script.js";
import { LOCATIONS, ODD_JOBS, TALKS, SMALLTALK } from "../src/core/town.js";
import { SCENES } from "../src/content/scenes.js";
import { initialState } from "./helpers/no-events-state.mjs";
import { reduce } from "../src/core/reducer.js";
import { townOffers } from "../src/core/selectors.js";
import { townOffers as offers2 } from "../src/core/selectors.js";
import { nextTownScene, standingOf, talkIsDry } from "../src/core/selectors.js";

// Every talk scene id an NPC's deck (or its filler) can surface.
const ALL_TALK_IDS = [...new Set([...Object.values(TALKS).flat().map((d) => d.id), ...Object.values(SMALLTALK)])];
// The eight new third-deck cards added to deepen the decks.
const NEW_CARDS = ["meredith_whisper", "crake_ironwork", "tolliver_account", "silas_terms",
  "grange_parish", "bell_notes", "coldwater_line", "nan_riddle"];

function inTown(seed = 1) {
  let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  s = reduce(s, { type: "SOW" }); // phase: day
  return s;
}

describe("townOffers()", () => {
  it("offers JOBS_PER_SEASON jobs, deterministically for a given season+seed", () => {
    const s = inTown(42);
    const a = townOffers(s).jobs.map((j) => j.id);
    const b = townOffers(s).jobs.map((j) => j.id);
    expect(a).toEqual(b);            // pure
    expect(a.length).toBe(2);
  });
  it("stays the same offer across days within a season", () => {
    let s = inTown(42);
    const a = townOffers(s).jobs.map((j) => j.id);
    s = reduce(s, { type: "TURN_IN" }); // resolve a day, still the same season
    const b = townOffers(s).jobs.map((j) => j.id);
    expect(b).toEqual(a);
  });
  it("marks a job done once it is in jobsDoneThisSeason", () => {
    let s = inTown(42);
    const first = townOffers(s).jobs[0].id;
    s = { ...s, jobsDoneThisSeason: [first] };
    expect(townOffers(s).jobs.find((j) => j.id === first).done).toBe(true);
  });
});

describe("town names", () => {
  it("resolves the four new NPCs and the new locations", () => {
    expect(lookupName("npc.crake")).toBe("Hollis Crake");
    expect(lookupName("npc.tolliver")).toBe("Prudence Tolliver");
    expect(lookupName("npc.fenwick")).toBe("Mr. Fenwick");
    expect(lookupName("loc.smithy.sub")).toBe("the smithy");
    expect(tok("{{npc.crake}} at {{loc.smithy.sub}}")).toBe("Hollis Crake at the smithy");
  });
});

describe("town actions", () => {
  it("ACCEPT_JOB opens the job's scene card, spends an action, marks it done, and pays no coin directly", () => {
    let s = inTown(42);
    const job = offers2(s).jobs[0];
    const coin0 = s.coin, acts0 = s.actions;
    s = reduce(s, { type: "ACCEPT_JOB", id: job.id });
    expect(s.phase).toBe("scene");
    expect(s.scene).toEqual({ id: job.scene, result: null });
    expect(s.screen).toBe("home");
    expect(s.coin).toBe(coin0); // payoff now comes from the scene's choices
    expect(s.actions).toBe(acts0 - 1);
    expect(s.jobsDoneThisSeason).toContain(job.id);
  });
  it("ACCEPT_JOB is a no-op with no actions left or off the day phase", () => {
    let s = inTown(42); s = { ...s, actions: 0 };
    expect(reduce(s, { type: "ACCEPT_JOB", id: offers2(s).jobs[0].id })).toEqual(s);
    let b = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting phase
    expect(reduce(b, { type: "ACCEPT_JOB", id: "haul_mill" })).toEqual(b);
  });
  it("a taken job stays gone across days but is offered fresh next season", () => {
    let s = inTown(42);
    const before = offers2(s).jobs.map((j) => j.id);
    // Take one job via the card-opening action (it marks the job done and opens its scene),
    // then mark the rest done directly. Accepting opens a scene, so we can only dispatch
    // ACCEPT_JOB once before returning to the day; the direct fill stands in for closing out.
    s = reduce(s, { type: "ACCEPT_JOB", id: before[0] });
    expect(s.jobsDoneThisSeason).toContain(before[0]);
    s = { ...s, jobsDoneThisSeason: before, phase: "day", scene: null };
    expect(offers2(s).jobs.every((j) => j.done)).toBe(true);
    // advance days within the same season: still done, not refilled
    s = reduce(s, { type: "TURN_IN" });
    expect(offers2(s).jobs.every((j) => j.done)).toBe(true);
    // close out the season and open the next: jobsDoneThisSeason resets
    s = reduce(s, { type: "END_SEASON" });
    s = reduce(s, { type: "BEGIN_SEASON" });
    expect(s.jobsDoneThisSeason).toEqual([]);
    expect(offers2(s).jobs.every((j) => !j.done)).toBe(true);
  });
  it("VISIT spends an action and opens the location's talk scene", () => {
    let s = inTown(42);
    const acts0 = s.actions;
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.phase).toBe("scene");
    expect(s.scene.id).toBe("crake_intro");
    expect(s.actions).toBe(acts0 - 1);
  });
  it("closing a town scene returns to the Town screen, not the brief", () => {
    let s = inTown(42);
    s = reduce(s, { type: "VISIT", npc: "crake" });
    s = reduce(s, { type: "CLOSE_SCENE" });
    expect(s.screen).toBe("town");
    expect(s.phase).toBe("day");
  });
});

describe("town data", () => {
  it("defines locations with an id, npc, and purpose", () => {
    const saloon = LOCATIONS.find((l) => l.id === "saloon");
    expect(saloon).toMatchObject({ id: "saloon", npc: "meredith", purpose: expect.any(String) });
    for (const l of LOCATIONS) expect(typeof l.loc).toBe("string");
  });
  it("defines odd-jobs with a giver, coin, and a line", () => {
    expect(ODD_JOBS.length).toBeGreaterThanOrEqual(3);
    for (const j of ODD_JOBS) {
      expect(j).toMatchObject({ id: expect.any(String), giver: expect.any(String), coin: expect.any(Number) });
      expect(j.coin).toBeGreaterThan(0);
    }
  });
});

describe("town scenes resolve", () => {
  it("has body prose for each town talk, with names resolving", () => {
    for (const id of ["tolliver_intro", "meredith_rumor"]) {
      const body = tok(L(id + ".body"));
      expect(body.length).toBeGreaterThan(20);
      expect(body).not.toContain("{{");
    }
    const crake = tok(L("crake_intro.body"));
    expect(crake).toContain("Hollis Crake");   // npc token resolved
    expect(crake).toContain("{{lineage}}");     // lineage resolves later, from save state
  });
});

describe("odd-jobs are real tradeoff cards", () => {
  it("every odd-job's scene exists in SCENES with choices, fx, and a town return", () => {
    for (const j of ODD_JOBS) {
      const sc = SCENES[j.scene];
      expect(sc, `missing scene ${j.scene}`).toBeTruthy();
      expect(sc.returnTo).toBe("town");
      expect(sc.choices.length).toBeGreaterThanOrEqual(2);
      // every choice moves at least one resource (no free "safe" option)
      for (const c of sc.choices) {
        const fx = (sc.fx && sc.fx[c]) || {};
        const isHaggleRoll = sc.haggle && sc.haggle.on === c;
        expect(isHaggleRoll || Object.keys(fx).length > 0, `choice ${j.scene}.${c} has no fx`).toBe(true);
      }
    }
  });
  it("every job scene has non-empty title and per-choice text prose, names resolving", () => {
    for (const j of ODD_JOBS) {
      const title = tok(L(j.scene + ".title"));
      expect(title.length, `empty title for ${j.scene}`).toBeGreaterThan(0);
      const body = tok(L(j.scene + ".body"));
      expect(body).not.toContain("{{");
      for (const c of SCENES[j.scene].choices) {
        const text = tok(L(j.scene + "." + c + ".text"));
        expect(text.length, `empty text for ${j.scene}.${c}`).toBeGreaterThan(0);
      }
    }
  });
  it("the haggle job (mend_fence) has result prose for every win/hold/sour outcome", () => {
    const sc = SCENES.job_mend_fence;
    expect(sc.kind).toBe("haggle");
    for (const outcome of Object.keys(sc.haggle.outcomes)) {
      const res = tok(L("job_mend_fence." + outcome + ".result"));
      expect(res.length, `empty result for outcome ${outcome}`).toBeGreaterThan(0);
      expect(res).not.toContain("{{");
    }
  });
  it("dickering the fence resolves to one of its outcomes across seeds", () => {
    const seen = new Set();
    for (let rs = 1; rs <= 40; rs++) {
      const s = { ...initialState(1), rngState: rs, phase: "scene", scene: { id: "job_mend_fence", result: null } };
      const ns = reduce(s, { type: "CHOOSE_SCENE", choiceId: "dicker" });
      expect(["win", "hold", "sour"]).toContain(ns.scene.result);
      seen.add(ns.scene.result);
    }
    expect(seen.size).toBeGreaterThan(1); // the roll actually varies
  });
});

describe("walking the town", () => {
  it("WALK_TO sets the current place and costs no action", () => {
    let s = inTown(1);
    const acts0 = s.actions;
    s = reduce(s, { type: "WALK_TO", place: "saloon" });
    expect(s.townAt).toBe("saloon");
    expect(s.actions).toBe(acts0); // free
    expect(s.screen).toBe("town");
  });
  it("WALK_TO null returns to the town overview", () => {
    let s = reduce(inTown(1), { type: "WALK_TO", place: "saloon" });
    s = reduce(s, { type: "WALK_TO", place: null });
    expect(s.townAt).toBe(null);
  });
  it("LEAVE_TOWN heads home and clears the place", () => {
    let s = reduce(inTown(1), { type: "WALK_TO", place: "saloon" });
    s = reduce(s, { type: "LEAVE_TOWN" });
    expect(s.screen).toBe("home");
    expect(s.townAt).toBe(null);
  });
});

describe("free-if-dry talks", () => {
  it("a fresh NPC's talk costs an action and grants standing", () => {
    let s = inTown(1);
    const acts0 = s.actions;
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.actions).toBe(acts0 - 1);
    expect((s.standing || {}).crake).toBeGreaterThan(0);
  });
  it("a dry talk (deck exhausted) costs no action and no standing", () => {
    let s = inTown(1);
    // exhaust crake's real cards so nextTownScene falls to the filler
    const realIds = (TALKS.crake || []).map((d) => d.id);
    s = { ...s, talksSeen: realIds, standing: { crake: 999 } };
    const acts0 = s.actions, st0 = (s.standing || {}).crake;
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.scene.id).toBe(SMALLTALK.crake); // the filler opened
    expect(s.actions).toBe(acts0);  // free
    expect((s.standing || {}).crake).toBe(st0); // no standing gained
  });
});

describe("every talk scene is authored", () => {
  // {{lineage}} is resolved at render from the save's surname, not by tok(); allow it, catch the rest.
  const resolved = (key) => tok(L(key)).replaceAll("{{lineage}}", "Crane");
  it("each TALKS/SMALLTALK id exists in SCENES with title + body prose and no token leak", () => {
    for (const id of ALL_TALK_IDS) {
      expect(SCENES[id], `no SCENES entry for ${id}`).toBeTruthy();
      const title = resolved(id + ".title");
      const body = resolved(id + ".body");
      expect(title.length, `empty title for ${id}`).toBeGreaterThan(0);
      expect(body.length, `empty body for ${id}`).toBeGreaterThan(15);
      expect(title, `token leak in ${id}.title`).not.toContain("{{");
      expect(body, `token leak in ${id}.body`).not.toContain("{{");
      // every listed choice has a result line, and every haggle outcome does too
      const sc = SCENES[id];
      for (const c of sc.choices) {
        const res = resolved(id + "." + c + ".result");
        expect(res.length, `empty result for ${id}.${c}`).toBeGreaterThan(0);
        expect(res, `token leak in ${id}.${c}.result`).not.toContain("{{");
      }
      if (sc.haggle) for (const o of Object.keys(sc.haggle.outcomes)) {
        const res = resolved(id + "." + o + ".result");
        expect(res.length, `empty result for ${id}.${o}`).toBeGreaterThan(0);
        expect(res, `token leak in ${id}.${o}.result`).not.toContain("{{");
      }
    }
  });
});

describe("reworked talks carry a real payoff", () => {
  it("choosing crake_intro's payload applies its regard reward", () => {
    let s = inTown(1);
    const regard0 = s.regard;
    s = reduce(s, { type: "VISIT", npc: "crake" });     // opens crake_intro
    expect(s.scene.id).toBe("crake_intro");
    s = reduce(s, { type: "CHOOSE_SCENE", choiceId: "go_on" });
    expect(s.regard).toBe(regard0 + 2);                  // the payload's {regard:+2}
    expect(s.scene.result).toBe("go_on");
  });
  it("grange_intro's considered answer pays, a neutral one does not", () => {
    let s = inTown(1);
    const regard0 = s.regard;
    s = reduce(s, { type: "VISIT", npc: "grange" });     // opens grange_intro
    const right = reduce(s, { type: "CHOOSE_SCENE", choiceId: "duty" });
    expect(right.regard).toBe(regard0 + 3);              // the right answer's {regard:+3}
    const neutral = reduce(s, { type: "CHOOSE_SCENE", choiceId: "trade" });
    expect(neutral.regard).toBe(regard0);                // a neutral answer moves nothing
  });
});

describe("the deepened decks", () => {
  it("every NPC deck grew to three cards, and each new card is an authored scene", () => {
    for (const npc of Object.keys(TALKS)) expect(TALKS[npc].length).toBe(3);
    for (const id of NEW_CARDS) {
      expect(SCENES[id], `no SCENES entry for new card ${id}`).toBeTruthy();
      expect(tok(L(id + ".title")).length, `empty title for ${id}`).toBeGreaterThan(0);
      expect(tok(L(id + ".body")).length, `empty body for ${id}`).toBeGreaterThan(15);
    }
    // every new card is actually wired into a deck
    const decked = new Set(Object.values(TALKS).flat().map((d) => d.id));
    for (const id of NEW_CARDS) expect(decked.has(id), `${id} not in any deck`).toBe(true);
  });
});

describe("nextTownScene rotation (replay variety)", () => {
  // A state with crake's whole deck eligible (standing high, nothing seen yet).
  const eligibleState = (seed) => ({ ...inTown(seed), rngSeed: seed, talksSeen: [], standing: { crake: 999 } });

  it("is deterministic for a fixed rngSeed and returns an eligible, unseen id", () => {
    const s = eligibleState(3);
    const a = nextTownScene(s, "crake");
    const b = nextTownScene(s, "crake");
    expect(a).toBe(b); // pure, same seed => same pick
    const deckIds = TALKS.crake.map((d) => d.id);
    expect(deckIds).toContain(a);
    expect(s.talksSeen).not.toContain(a);
  });

  it("varies which eligible card comes first across seeds (not always deck order)", () => {
    const picks = new Set();
    for (let seed = 0; seed < 12; seed++) picks.add(nextTownScene(eligibleState(seed), "crake"));
    expect(picks.size).toBeGreaterThan(1); // the seed actually rotates the order
  });

  it("never returns a card already seen this run", () => {
    let s = eligibleState(3);
    const first = nextTownScene(s, "crake");
    s = { ...s, talksSeen: [first] };
    const second = nextTownScene(s, "crake");
    expect(second).not.toBe(first);
    expect(TALKS.crake.map((d) => d.id)).toContain(second);
  });

  it("falls to the small-talk filler once the eligible deck is exhausted, and talkIsDry agrees", () => {
    const realIds = TALKS.crake.map((d) => d.id);
    const s = { ...inTown(1), rngSeed: 1, talksSeen: realIds, standing: { crake: 999 } };
    expect(nextTownScene(s, "crake")).toBe(SMALLTALK.crake);
    expect(talkIsDry(s, "crake")).toBe(true);
  });
});
