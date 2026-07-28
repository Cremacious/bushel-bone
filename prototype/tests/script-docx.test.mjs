import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import mammoth from "mammoth";

const here = dirname(fileURLToPath(import.meta.url));
const proto = join(here, "..");
const docxPath = join(proto, "..", "docs", "script.docx");
const run = (script, args = []) => execFileSync("node", [script, ...args], { cwd: proto, encoding: "utf8" });

describe("script .docx round-trip (#46)", () => {
  it("exports a readable screenplay .docx with id labels and resolved names", async () => {
    run("script-docx.mjs");
    expect(existsSync(docxPath)).toBe(true);
    const { value: text } = await mammoth.extractRawText({ path: docxPath });
    expect(text).toContain("[silas_welcome.body]");        // stable id label
    expect(text).toContain("Silas Ridley reins up");        // {{npc.silas}} resolved
    expect(text).toContain("[ev_foundling.turn.result]");   // a systemic-event line
    expect(text).not.toContain("{{npc.");                   // no raw tokens leak into the doc
  });

  it("imports the freshly-exported docx with zero changes", () => {
    run("script-docx.mjs");
    const out = run("script-import.mjs");
    expect(out).toMatch(/\d+ labelled lines/);
    expect(out).toContain("No changes");
  });
});
