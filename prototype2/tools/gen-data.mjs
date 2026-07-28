// Compile content/*.yaml into ES-module data. Single source of truth stays the
// YAML (#45 names, #46 script); this replaces year1.html's inline injection.
//
//   node gen-data.mjs          write src/generated/{names,script}.js
//   node gen-data.mjs --check  exit 1 if the generated files are out of date (for CI/tests)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
const content = join(here, "..", "..", "content");
const out = join(here, "..", "src", "generated");
const namesOutPath = join(out, "names.js");
const scriptOutPath = join(out, "script.js");

// Fields that are structural (not dialogue) and never belong in the flat script map.
const STRUCTURAL = new Set(["speaker", "setting"]);

// names.yaml -> { places, terms, characters, locations }
const names = parse(readFileSync(join(content, "names.yaml"), "utf8"));
const namesOut = "export default " + JSON.stringify(names, null, 2) + ";\n";

// script.yaml -> flat { "<scene>.<field>": string, "<scene>.<choice>.<field>": string }
const script = parse(readFileSync(join(content, "script.yaml"), "utf8"));
const flat = {};
for (const [sid, scene] of Object.entries(script.scenes || {})) {
  for (const [k, v] of Object.entries(scene)) {
    if (STRUCTURAL.has(k)) continue;
    if (k === "choices") for (const [cid, ch] of Object.entries(v)) for (const [ck, cv] of Object.entries(ch)) flat[`${sid}.${cid}.${ck}`] = cv;
    else flat[`${sid}.${k}`] = v;
  }
}
const scriptOut = "export default " + JSON.stringify(flat, null, 2) + ";\n";

const check = process.argv.includes("--check");

if (check) {
  // Newline-aware comparison so CRLF/LF checkouts don't false-positive as stale.
  const norm = (s) => s.replace(/\r\n/g, "\n");
  const namesCurrent = existsSync(namesOutPath) ? readFileSync(namesOutPath, "utf8") : null;
  const scriptCurrent = existsSync(scriptOutPath) ? readFileSync(scriptOutPath, "utf8") : null;
  const stale = namesCurrent === null || scriptCurrent === null
    || norm(namesCurrent) !== norm(namesOut) || norm(scriptCurrent) !== norm(scriptOut);
  if (stale) {
    console.error("gen-data: src/generated/{names,script}.js are OUT OF DATE — run `npm run gen:data`.");
    process.exit(1);
  }
  console.log("gen-data: src/generated/{names,script}.js are up to date.");
} else {
  mkdirSync(out, { recursive: true });
  writeFileSync(namesOutPath, namesOut);
  writeFileSync(scriptOutPath, scriptOut);
  console.log(`gen:data — ${Object.keys(names.characters || {}).length} characters, ${Object.keys(flat).length} script lines.`);
}
