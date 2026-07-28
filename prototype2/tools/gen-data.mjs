// Compile content/*.yaml into ES-module data. Single source of truth stays the
// YAML (#45 names, #46 script); this replaces year1.html's inline injection.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
const content = join(here, "..", "..", "content");
const out = join(here, "..", "src", "generated");
mkdirSync(out, { recursive: true });

// names.yaml -> { places, terms, characters, locations }
const names = parse(readFileSync(join(content, "names.yaml"), "utf8"));
writeFileSync(join(out, "names.js"), "export default " + JSON.stringify(names, null, 2) + ";\n");

// script.yaml -> flat { "<scene>.<field>": string, "<scene>.<choice>.<field>": string }
const script = parse(readFileSync(join(content, "script.yaml"), "utf8"));
const flat = {};
for (const [sid, scene] of Object.entries(script.scenes || {})) {
  for (const [k, v] of Object.entries(scene)) {
    if (k === "speaker" || k === "setting") continue;
    if (k === "choices") for (const [cid, ch] of Object.entries(v)) for (const [ck, cv] of Object.entries(ch)) flat[`${sid}.${cid}.${ck}`] = cv;
    else flat[`${sid}.${k}`] = v;
  }
}
writeFileSync(join(out, "script.js"), "export default " + JSON.stringify(flat, null, 2) + ";\n");
console.log(`gen:data — ${Object.keys(names.characters || {}).length} characters, ${Object.keys(flat).length} script lines.`);
