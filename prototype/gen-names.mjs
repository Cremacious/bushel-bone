// gen-names.mjs — inject content/names.yaml into year1.html as the generated
// NAMES config (#45). names.yaml is the single source of truth; this script is
// how the single-file prototype (which can't fetch at runtime) consumes it.
//
//   node gen-names.mjs          rewrite the block in year1.html
//   node gen-names.mjs --check  exit 1 if year1.html is out of date (for CI/tests)
//
// The YAML reader here is deliberately minimal: it accepts only the shape used by
// names.yaml (top-level sections, then `id: "scalar"` or `id: { k: "v", ... }`)
// and throws on anything else, so a malformed edit fails loudly rather than
// silently dropping a name. The Next.js port will load the same YAML with a real
// parser per docs/content-schema.md.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const yamlPath = join(here, "..", "content", "names.yaml");
const htmlPath = join(here, "year1.html");
const SECTIONS = ["places", "terms", "characters", "locations"];

function stripComment(line) {
  let inQ = false, out = "";
  for (const c of line) {
    if (c === '"') inQ = !inQ;
    if (c === "#" && !inQ) break;
    out += c;
  }
  return out;
}
function parseScalar(v, raw) {
  const m = v.match(/^"([^"]*)"$/);
  if (!m) throw new Error(`names.yaml: expected a "quoted" value, got: ${raw}`);
  return m[1];
}
function parseFlow(v, raw) {
  if (!/^\{.*\}$/.test(v)) throw new Error(`names.yaml: malformed { } entry: ${raw}`);
  const obj = {};
  const re = /([A-Za-z_]+):\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(v))) obj[m[1]] = m[2];
  if (!Object.keys(obj).length) throw new Error(`names.yaml: no key: "value" pairs in: ${raw}`);
  return obj;
}
function parseNames(src) {
  const out = { places: {}, terms: {}, characters: {}, locations: {} };
  let section = null;
  for (const raw of src.split(/\r?\n/)) {
    const line = stripComment(raw);
    if (!line.trim()) continue;
    const sec = line.match(/^([A-Za-z_]+):\s*$/);
    if (sec) {
      section = sec[1];
      if (!SECTIONS.includes(section)) throw new Error(`names.yaml: unknown section "${section}"`);
      continue;
    }
    const entry = line.match(/^\s+([A-Za-z_]+):\s+(.*\S)\s*$/);
    if (!entry) throw new Error(`names.yaml: cannot parse line: ${raw}`);
    if (!section) throw new Error(`names.yaml: entry before any section: ${raw}`);
    const [, key, val] = entry;
    out[section][key] = val.startsWith("{") ? parseFlow(val, raw) : parseScalar(val, raw);
  }
  return out;
}

function buildBlock(names, nl) {
  const body = "const NAMES = " + JSON.stringify(names, null, 2) + ";";
  const indented = body.split("\n").map((l) => "  " + l).join(nl);
  return "  /* names:start */" + nl + indented + nl + "  /* names:end */";
}
function inject(html, block) {
  const re = / *\/\* names:start \*\/[\s\S]*? *\/\* names:end \*\//;
  if (!re.test(html)) throw new Error("year1.html: names:start/names:end markers not found");
  return html.replace(re, block);
}

const names = parseNames(readFileSync(yamlPath, "utf8"));
const html = readFileSync(htmlPath, "utf8");
const nl = html.includes("\r\n") ? "\r\n" : "\n"; // match the file's line endings so --check is stable
const next = inject(html, buildBlock(names, nl));
const check = process.argv.includes("--check");

if (next === html) {
  console.log("names: year1.html is up to date.");
} else if (check) {
  console.error("names: year1.html is OUT OF DATE. Run `npm run gen:names`.");
  process.exit(1);
} else {
  writeFileSync(htmlPath, next);
  const n = Object.keys(names.characters).length + Object.keys(names.locations).length;
  console.log(`names: regenerated block in year1.html (${n} entries).`);
}
