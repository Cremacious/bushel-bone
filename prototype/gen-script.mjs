// gen-script.mjs — inject content/script.yaml into year1.html as the generated
// SCRIPT map (#46). script.yaml is the single source of truth for the game's
// narrative dialogue; this flattens its screenplay-shaped scenes into id -> string
// pairs and injects them, the same way gen-names.mjs handles names (the single-file
// prototype can't fetch at runtime).
//
//   node gen-script.mjs          rewrite the block in year1.html
//   node gen-script.mjs --check  exit 1 if year1.html is out of date (for CI/tests)
//
// Flattened id shape:
//   <scene>.<field>              eyebrow | title | dir | body | ...
//   <scene>.<choiceId>.<field>   text | sub | why | result | ...
// The game reads these via L("<id>"); {{name}} tokens inside the values resolve at
// render time (see gen-names.mjs / tok()).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(here, "..", "content", "script.yaml");
const htmlPath = join(here, "year1.html");

// Fields that are structural (not dialogue) and never belong in the flat map.
const STRUCTURAL = new Set(["speaker", "setting"]);

export function flatten(doc) {
  const flat = {};
  const scenes = (doc && doc.scenes) || {};
  for (const [sid, scene] of Object.entries(scenes)) {
    for (const [k, v] of Object.entries(scene)) {
      if (STRUCTURAL.has(k)) continue;
      if (k === "choices") {
        for (const [cid, ch] of Object.entries(v)) {
          for (const [ck, cv] of Object.entries(ch)) flat[`${sid}.${cid}.${ck}`] = cv;
        }
      } else {
        flat[`${sid}.${k}`] = v;
      }
    }
  }
  return flat;
}

function buildBlock(flat, nl) {
  const body = "const SCRIPT = " + JSON.stringify(flat, null, 2) + ";";
  const indented = body.split("\n").map((l) => "  " + l).join(nl);
  return "  /* script:start */" + nl + indented + nl + "  /* script:end */";
}
function inject(html, block) {
  const re = / *\/\* script:start \*\/[\s\S]*? *\/\* script:end \*\//;
  if (!re.test(html)) throw new Error("year1.html: script:start/script:end markers not found");
  return html.replace(re, block);
}

const flat = flatten(parse(readFileSync(scriptPath, "utf8")));
const html = readFileSync(htmlPath, "utf8");
const nl = html.includes("\r\n") ? "\r\n" : "\n";
const next = inject(html, buildBlock(flat, nl));
const check = process.argv.includes("--check");

if (next === html) {
  console.log("script: year1.html is up to date.");
} else if (check) {
  console.error("script: year1.html is OUT OF DATE. Run `npm run gen:script`.");
  process.exit(1);
} else {
  writeFileSync(htmlPath, next);
  console.log(`script: regenerated block in year1.html (${Object.keys(flat).length} lines).`);
}
