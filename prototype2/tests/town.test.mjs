import { describe, it, expect } from "vitest";
import { lookupName, tok } from "../src/content/names.js";
import { L } from "../src/content/script.js";
import { LOCATIONS, ODD_JOBS, TALKS, SMALLTALK } from "../src/core/town.js";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { townOffers } from "../src/core/selectors.js";
import { townOffers as offers2 } from "../src/core/selectors.js";

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
  it("ACCEPT_JOB pays coin, spends one action, and marks the job done", () => {
    let s = inTown(42);
    const job = offers2(s).jobs[0];
    const coin0 = s.coin, acts0 = s.seasonActionsLeft;
    s = reduce(s, { type: "ACCEPT_JOB", id: job.id });
    expect(s.coin).toBe(coin0 + job.coin);
    expect(s.seasonActionsLeft).toBe(acts0 - 1);
    expect(s.jobsDoneThisSeason).toContain(job.id);
  });
  it("ACCEPT_JOB is a no-op with no actions left or off the day phase", () => {
    let s = inTown(42); s = { ...s, seasonActionsLeft: 0 };
    expect(reduce(s, { type: "ACCEPT_JOB", id: offers2(s).jobs[0].id })).toEqual(s);
    let b = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting phase
    expect(reduce(b, { type: "ACCEPT_JOB", id: "haul_mill" })).toEqual(b);
  });
  it("a taken job stays gone across days but is offered fresh next season", () => {
    let s = inTown(42);
    const before = offers2(s).jobs.map((j) => j.id);
    for (const id of before) s = reduce(s, { type: "ACCEPT_JOB", id });
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
    const acts0 = s.seasonActionsLeft;
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.phase).toBe("scene");
    expect(s.scene.id).toBe("crake_intro");
    expect(s.seasonActionsLeft).toBe(acts0 - 1);
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

describe("walking the town", () => {
  it("WALK_TO sets the current place and costs no action", () => {
    let s = inTown(1);
    const acts0 = s.seasonActionsLeft;
    s = reduce(s, { type: "WALK_TO", place: "saloon" });
    expect(s.townAt).toBe("saloon");
    expect(s.seasonActionsLeft).toBe(acts0); // free
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
    const acts0 = s.seasonActionsLeft;
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.seasonActionsLeft).toBe(acts0 - 1);
    expect((s.standing || {}).crake).toBeGreaterThan(0);
  });
  it("a dry talk (deck exhausted) costs no action and no standing", () => {
    let s = inTown(1);
    // exhaust crake's real cards so nextTownScene falls to the filler
    const realIds = (TALKS.crake || []).map((d) => d.id);
    s = { ...s, talksSeen: realIds, standing: { crake: 999 } };
    const acts0 = s.seasonActionsLeft, st0 = (s.standing || {}).crake;
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.scene.id).toBe(SMALLTALK.crake); // the filler opened
    expect(s.seasonActionsLeft).toBe(acts0);  // free
    expect((s.standing || {}).crake).toBe(st0); // no standing gained
  });
});
