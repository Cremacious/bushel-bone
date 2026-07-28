import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { boot } from "./helpers.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(here, "..", "year1.html");

// The canonical full-name / place literals that must NOT appear anywhere in the
// prototype outside the generated config block: prose references them by token.
const HARDCODED = [
  "Meredith Vane", "Silas Ridley", "Mayor Halloway", "Bess Halloway",
  "Preacher Grange", "Dr. Ambrose Vane", "Doc Bell", "Old Nan",
  "Sheriff Coldwater", "Marrow's Cross", "Sister Ruth",
];

describe("names config (#45)", () => {
  it("NPCS and SETTINGS are the generated config, not a second copy", () => {
    const { T } = boot();
    expect(T.NPCS).toBe(T.NAMES.characters);
    expect(T.SETTINGS).toBe(T.NAMES.locations);
    expect(T.NAMES.characters.meredith.name).toBe("Meredith {{term.vane}}");
  });

  it("resolves every token namespace, including composed multi-pass names", () => {
    const { T } = boot();
    expect(T.tok("{{npc.meredith}}")).toBe("Meredith Vane"); // composed from term.vane
    expect(T.tok("{{npc.silas.first}}")).toBe("Silas");
    expect(T.tok("Mr. {{term.ridley}}")).toBe("Mr. Ridley");
    expect(T.tok("the town of {{place.town}}")).toBe("the town of Marrow's Cross");
    expect(T.tok("{{loc.saloon.sub}}")).toBe("the saloon");
    expect(T.tok("no tokens here")).toBe("no tokens here");
    expect(T.tok("{{npc.nope}}")).toBe("{{npc.nope}}"); // unknown left untouched
  });

  it("a rename flows through the single resolver every render path uses", () => {
    const { T } = boot();
    // simulate editing names.yaml: a family surname and a solo character
    T.NAMES.terms.vane = "Crowe";
    T.NAMES.characters.reuben.name = "Bram";
    expect(T.tok("{{npc.meredith}}")).toBe("Meredith Crowe"); // composed name follows the term
    expect(T.tok("{{npc.ambrose}}")).toBe("Dr. Ambrose Crowe");
    expect(T.tok("{{term.vane}}'s wagon")).toBe("Crowe's wagon");
    expect(T.tok("Ask {{npc.reuben}}")).toBe("Ask Bram");
  });

  it("resolves names in the static chrome (askbar, colophon)", () => {
    const { doc } = boot();
    const ask = doc.getElementById("askbar").innerHTML;
    expect(ask).toContain("Reuben");
    expect(ask).not.toContain("{{");
    const colo = doc.querySelector(".colophon").innerHTML;
    expect(colo).toContain("Sallows");
    expect(colo).not.toContain("{{");
  });

  it("leaks no name token through a full year of rendering", () => {
    const { doc, T } = boot();
    const sinks = () => [
      doc.getElementById("stage").innerHTML,
      doc.getElementById("plate-cap").innerHTML,
      doc.getElementById("plate-desc").textContent,
      doc.getElementById("plate-nameplate").innerHTML,
      doc.getElementById("overlay-panel").innerHTML,
    ].join(" ");
    const noLeak = (where) => expect(sinks(), where).not.toContain("{{");
    T.openAskReuben(); noLeak("askReuben"); T.closeOverlay();
    T.showHowToPlay(); noLeak("howToPlay"); T.closeOverlay();
    for (let i = 0; i < 400; i++) {
      if (doc.getElementById("again")) break;
      const btns = [...doc.getElementById("stage").querySelectorAll(".btn[data-c]")].filter(b => !b.hasAttribute("disabled"));
      if (!btns.length) break;
      (btns.find(b => b.classList.contains("primary")) || btns[0]).click();
      noLeak("step" + i);
    }
    expect(doc.getElementById("again")).toBeTruthy(); // reached an end screen
  });

  it("has no hardcoded NPC/location name outside the generated config block", () => {
    const html = readFileSync(htmlPath, "utf8");
    const body = html.replace(/\/\* names:start \*\/[\s\S]*?\/\* names:end \*\//, "");
    for (const name of HARDCODED) {
      expect(body, `"${name}" should be a token, not a literal`).not.toContain(name);
    }
  });

  it("year1.html is in sync with content/names.yaml (run `npm run gen:names`)", () => {
    // exits 0 when up to date, 1 when the generated block is stale
    expect(() => execFileSync("node", ["gen-names.mjs", "--check"], { cwd: join(here, ".."), stdio: "pipe" })).not.toThrow();
  });
});
