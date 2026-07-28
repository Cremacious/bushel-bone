import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { boot } from "./helpers.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(here, "..", "year1.html");

// Distinctive phrases from beats spread across the whole year. Once extracted,
// these live only in the generated SCRIPT block; the hand-written source (flow
// functions, systemic events, year-end) must not contain them as inline literals.
const EXTRACTED_PHRASES = [
  "reins up at your gate",            // silas_welcome.body
  "makes an expansive welcome",       // fair.body
  "brings his wagon up the track",    // vane_wagon.body
  "does not speak for a day",         // moral_fork.work.result
  "square in the crunch",             // harvest_home.body
  "comes up the frozen track",        // ruth_basket.body
  "Watch the night through with them",// long_vigil.watch.text
  "I survived another year",          // yearend.headline
  "The crows leave insulted",         // ev_crows.scare.result
  "wary and grateful at once",        // ev_foundling.take.result
];

describe("script dialogue (#46)", () => {
  it("SCRIPT is populated and the game reads beats from it", () => {
    const { T } = boot();
    expect(Object.keys(T.SCRIPT).length).toBeGreaterThan(150);
    expect(T.SCRIPT["silas_welcome.body"]).toContain("reins up at your gate");
  });

  it("L() returns lines, fills {slots}, and flags a missing id", () => {
    const { T } = boot();
    expect(T.L("spring_open.title")).toBe("Your uncle's ground");
    expect(T.L("fair.attend.result", { field: "the east field", blessing: "" }))
      .toContain("walks the east field and says");
    expect(T.L("fair.attend.result", { field: "X", blessing: "" })).not.toContain("{field}");
    expect(T.L("nope.nope")).toBe("{nope.nope}");
  });

  it("renders a beat's title and body from the script, tokens resolved", () => {
    const { doc, T } = boot();
    // first card is spring_open
    expect(doc.querySelector("#stage h2").textContent).toBe("Your uncle's ground");
    const body = doc.querySelector("#stage .prose").textContent;
    expect(body).toContain("Malachi worked this ground"); // {{npc.malachi}} resolved
    expect(body).not.toContain("{{");
  });

  it("an edit to the script propagates to what renders", () => {
    const { doc, T } = boot();
    T.SCRIPT["spring_open.title"] = "A New Heading";
    T.beginNewGame("Mackall"); // re-render the opening beat
    expect(doc.querySelector("#stage h2").textContent).toBe("A New Heading");
  });

  it("leaks no token or unfilled slot across a full year, forcing every event", () => {
    const { doc, T } = boot();
    // tok every SCRIPT value: nothing should be left unresolved
    for (const id of Object.keys(T.SCRIPT)) {
      const r = T.tok(T.SCRIPT[id]);
      if (typeof r === "string") expect(r, id).not.toContain("{{");
    }
    // play a full year; scan the rendered stage each step
    for (let i = 0; i < 400; i++) {
      if (doc.getElementById("again")) break;
      const btns = [...doc.getElementById("stage").querySelectorAll(".btn[data-c]")].filter(b => !b.hasAttribute("disabled"));
      if (!btns.length) break;
      (btns.find(b => b.classList.contains("primary")) || btns[0]).click();
      expect(doc.getElementById("stage").innerHTML, "step" + i).not.toContain("{{");
    }
    expect(doc.getElementById("again")).toBeTruthy();
  });

  it("no narrative dialogue remains as an inline literal in the source", () => {
    const html = readFileSync(htmlPath, "utf8");
    // strip the two generated blocks (names + script); those legitimately hold the strings
    const source = html
      .replace(/\/\* names:start \*\/[\s\S]*?\/\* names:end \*\//, "")
      .replace(/\/\* script:start \*\/[\s\S]*?\/\* script:end \*\//, "");
    for (const phrase of EXTRACTED_PHRASES) {
      expect(source, `"${phrase}" should be in the script, not inline`).not.toContain(phrase);
    }
  });

  it("year1.html is in sync with content/script.yaml (run `npm run gen:script`)", () => {
    expect(() => execFileSync("node", ["gen-script.mjs", "--check"], { cwd: join(here, ".."), stdio: "pipe" })).not.toThrow();
  });
});
