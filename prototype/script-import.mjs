// script-import.mjs — read an edited script .docx and report which lines changed
// against content/script.yaml (#46). It does NOT write the YAML itself: the edited
// text is plain prose, while the canonical line still carries {{name}} tokens and
// inline markup (said/em), so the change is applied by hand (by Claude) — this tool
// is the reliable matcher that says exactly which ids changed and to what.
//
//   node script-import.mjs [path-to.docx]   default: docs/script.docx
//
// Output: a per-id report (CHANGED / added-in-docx / missing-in-docx) with old and
// new text, plus a JSON block for programmatic apply.

import mammoth from "mammoth";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadNames, loadScript, displayText, eachLine } from "./script-lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const docxPath = process.argv[2] || join(here, "..", "docs", "script.docx");

const norm = (t) => (t || "").replace(/\s+/g, " ").trim();

// Parse the .docx back into an id -> edited-text map, using the [id] labels.
function parseDocx(text, sceneIds) {
  const idLabel = /^\[([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+)\]$/; // dotted, no spaces
  const isBoundary = (l) =>
    sceneIds.has(l) || l.startsWith("Choice —") || l.startsWith("speaker:") ||
    l.startsWith("Bushel & Bone") || l.startsWith("Edit the prose");
  const map = {};
  let cur = null, buf = [];
  const flush = () => { if (cur) map[cur] = buf.join("\n\n").trim(); cur = null; buf = []; };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const m = line.match(idLabel);
    if (m) { flush(); cur = m[1]; buf = []; continue; }
    if (!line) continue;
    if (isBoundary(line)) { flush(); continue; }
    if (cur) buf.push(line);
  }
  flush();
  return map;
}

const names = loadNames();
const doc = loadScript();
const sceneIds = new Set(Object.keys(doc.scenes || {}));
const canon = {}; // id -> { value (raw), display }
for (const { id, value } of eachLine(doc)) canon[id] = { value, display: displayText(value, names) };

const { value: rawText } = await mammoth.extractRawText({ path: docxPath });
const edited = parseDocx(rawText, sceneIds);

const changed = [], missing = [], extra = [];
for (const id of Object.keys(canon)) {
  if (!(id in edited)) { missing.push(id); continue; }
  if (norm(edited[id]) !== norm(canon[id].display)) changed.push({ id, old: canon[id].display, oldRaw: canon[id].value, new: edited[id] });
}
for (const id of Object.keys(edited)) if (!(id in canon)) extra.push(id);

console.log(`script-import: ${Object.keys(edited).length} labelled lines read from ${docxPath}`);
console.log(`  ${changed.length} changed · ${missing.length} not found in docx · ${extra.length} unknown label(s) in docx\n`);
for (const c of changed) {
  console.log(`── ${c.id}`);
  console.log(`   OLD: ${c.old}`);
  console.log(`   NEW: ${c.new}`);
  console.log(`   YAML (still has tokens/markup to preserve): ${JSON.stringify(c.oldRaw)}\n`);
}
if (missing.length) console.log("Not found in docx (label removed or renamed?):\n  " + missing.join(", ") + "\n");
if (extra.length) console.log("Unknown labels in docx (typo or new line?):\n  " + extra.join(", ") + "\n");

// machine-readable, for an assisted apply
console.log("JSON_CHANGES " + JSON.stringify(changed.map(({ id, new: n }) => ({ id, new: n }))));
if (!changed.length && !missing.length && !extra.length) console.log("No changes — the docx matches the script.");
