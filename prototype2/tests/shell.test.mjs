import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tokens = readFileSync(join(here, "..", "src", "styles", "tokens.css"), "utf8");

describe("design tokens", () => {
  it("defines the V0.3 night palette, lamp, and season accents", () => {
    expect(tokens).toContain("--paper:#17130d");
    expect(tokens).toContain("--lamp:#d9a441");
    expect(tokens).toContain('[data-season="fall"]{ --accent:#a4482a; }');
    expect(tokens).toContain('[data-theme="day"]');
  });
});
