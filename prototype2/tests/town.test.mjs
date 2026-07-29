import { describe, it, expect } from "vitest";
import { lookupName, tok } from "../src/content/names.js";
import { LOCATIONS, ODD_JOBS } from "../src/core/town.js";

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
