import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Guards the C1 fix: the dialogue highlight span (`.prose .hl`) must reset the properties that
// bare utility classes (`.wx { display:flex }`, `.omen { border/background/padding }`) would
// otherwise leak into it, which broke highlighted phrases onto their own line or grew a box.
// jsdom does not compute stylesheet cascade, so this is a source-level regression guard.
describe("highlight spans stay plain inline (C1 collision guard)", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/screens.css"), "utf8");
  const rule = css.split("\n").find((l) => l.trim().startsWith(".prose .hl {")) || "";

  it("the .prose .hl rule forces inline display", () => {
    expect(rule).toMatch(/display:\s*inline/);
  });
  it("the .prose .hl rule strips leaked box properties", () => {
    expect(rule).toMatch(/padding:\s*0/);
    expect(rule).toMatch(/border:\s*0/);
    expect(rule).toMatch(/background:\s*none/);
  });
});
