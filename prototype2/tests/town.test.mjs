import { describe, it, expect } from "vitest";
import { lookupName, tok } from "../src/content/names.js";

describe("town names", () => {
  it("resolves the four new NPCs and the new locations", () => {
    expect(lookupName("npc.crake")).toBe("Hollis Crake");
    expect(lookupName("npc.tolliver")).toBe("Prudence Tolliver");
    expect(lookupName("npc.fenwick")).toBe("Mr. Fenwick");
    expect(lookupName("loc.smithy.sub")).toBe("the smithy");
    expect(tok("{{npc.crake}} at {{loc.smithy.sub}}")).toBe("Hollis Crake at the smithy");
  });
});
