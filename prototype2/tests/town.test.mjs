import { describe, it, expect } from "vitest";
import { lookupName, tok } from "../src/content/names.js";
import { L } from "../src/content/script.js";
import { LOCATIONS, ODD_JOBS } from "../src/core/town.js";
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
  it("offers JOBS_PER_DAY jobs, deterministically for a given day+seed", () => {
    const s = inTown(42);
    const a = townOffers(s).jobs.map((j) => j.id);
    const b = townOffers(s).jobs.map((j) => j.id);
    expect(a).toEqual(b);            // pure
    expect(a.length).toBe(2);
  });
  it("marks a job done once it is in jobsDoneToday", () => {
    let s = inTown(42);
    const first = townOffers(s).jobs[0].id;
    s = { ...s, jobsDoneToday: [first] };
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
    const coin0 = s.coin, acts0 = s.playerActionsLeft;
    s = reduce(s, { type: "ACCEPT_JOB", id: job.id });
    expect(s.coin).toBe(coin0 + job.coin);
    expect(s.playerActionsLeft).toBe(acts0 - 1);
    expect(s.jobsDoneToday).toContain(job.id);
  });
  it("ACCEPT_JOB is a no-op with no actions left or off the day phase", () => {
    let s = inTown(42); s = { ...s, playerActionsLeft: 0 };
    expect(reduce(s, { type: "ACCEPT_JOB", id: offers2(s).jobs[0].id })).toEqual(s);
    let b = reduce(initialState(1), { type: "BEGIN_SEASON" }); // planting phase
    expect(reduce(b, { type: "ACCEPT_JOB", id: "haul_mill" })).toEqual(b);
  });
  it("VISIT spends an action and opens the location's talk scene", () => {
    let s = inTown(42);
    const acts0 = s.playerActionsLeft;
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.phase).toBe("scene");
    expect(s.scene.id).toBe("crake_intro");
    expect(s.playerActionsLeft).toBe(acts0 - 1);
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
