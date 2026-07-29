import { describe, it, expect } from "vitest";
import { lookupName, tok } from "../src/content/names.js";
import { LOCATIONS, ODD_JOBS } from "../src/core/town.js";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { townOffers } from "../src/core/selectors.js";

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
