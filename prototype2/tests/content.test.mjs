import { describe, it, expect } from "vitest";
import { tok } from "../src/content/names.js";
import { L, SCRIPT } from "../src/content/script.js";

describe("content pipeline", () => {
  it("resolves composed name tokens", () => {
    expect(tok("{{npc.meredith}}")).toBe("Meredith Vane");
    expect(tok("Mr. {{term.ridley}}")).toBe("Mr. Ridley");
  });
  it("resolves {{lineage}} only when supplied via extra (runtime save state, not static content)", () => {
    expect(tok("{{lineage}}", { lineage: "Mackall" })).toBe("Mackall");
    expect(tok("{{lineage}}")).toBe("{{lineage}}");
  });
  it("L returns lines and fills slots", () => {
    expect(Object.keys(SCRIPT).length).toBeGreaterThan(150);
    expect(L("spring_open.title")).toBe("Your uncle's ground");
    expect(L("nope.nope")).toBe("{nope.nope}");
  });
});
