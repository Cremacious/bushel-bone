// script-lib.mjs — shared helpers for the script .docx round-trip (#46).
// Loads the canonical files and turns a stored line (HTML + {{name}} tokens) into
// the plain, readable prose that appears in the .docx, so export and import agree
// on exactly what a line's text "is".

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
export const NAMES_PATH = join(here, "..", "content", "names.yaml");
export const SCRIPT_PATH = join(here, "..", "content", "script.yaml");

export function loadNames() { return parse(readFileSync(NAMES_PATH, "utf8")); }
export function loadScript() { return parse(readFileSync(SCRIPT_PATH, "utf8")); }

// Resolve {{npc.id[.field]}} / {{loc.id[.field]}} / {{place.id}} / {{term.id}}
// against names.yaml — the same lookup the game's tok() does, multi-pass so a
// composed name ("Meredith {{term.vane}}") fully resolves.
export function resolveTokens(str, names) {
  if (typeof str !== "string" || !str.includes("{{")) return str;
  const lookup = (path) => {
    const p = path.split(".");
    if (p[0] === "npc") { const c = names.characters?.[p[1]]; return c ? c[p[2] || "name"] : null; }
    if (p[0] === "loc") { const l = names.locations?.[p[1]]; return l ? l[p[2] || "cap"] : null; }
    if (p[0] === "place") { const v = names.places?.[p[1]]; return v == null ? null : v; }
    if (p[0] === "term") { const v = names.terms?.[p[1]]; return v == null ? null : v; }
    if (p[0] === "lineage") return "[your line]";
    return null;
  };
  let s = str, prev;
  for (let i = 0; i < 5 && s.includes("{{") && s !== prev; i++) {
    prev = s;
    s = s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, path) => { const v = lookup(path); return v == null ? m : v; });
  }
  return s;
}

const ENTITIES = { "&ldquo;": "“", "&rdquo;": "”", "&lsquo;": "‘", "&rsquo;": "’", "&amp;": "&", "&nbsp;": " ", "&mdash;": "—", "&hellip;": "…" };

// Turn a stored HTML line into readable plain text: paragraph breaks become blank
// lines; said/em/note/etc. markup is dropped but its words (and the curly quotes
// that already mark speech) are kept. A single-brace {slot} is shown as-is.
export function htmlToText(html) {
  if (typeof html !== "string") return String(html ?? "");
  let s = html
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<hr[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(div|p|span|em|b|i|strong)[^>]*>/gi, "");
  for (const [k, v] of Object.entries(ENTITIES)) s = s.split(k).join(v);
  return s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").replace(/^\s+|\s+$/g, "");
}

// The text of a line as it should read in the .docx (tokens resolved, HTML flattened).
export function displayText(value, names) {
  return htmlToText(resolveTokens(value, names));
}

// Walk a parsed script doc, yielding { id, value } for every dialogue line, in file
// order, grouped per scene. choices flatten to <scene>.<choiceId>.<field>.
export function eachLine(doc) {
  const out = [];
  for (const [sid, scene] of Object.entries(doc.scenes || {})) {
    for (const [k, v] of Object.entries(scene)) {
      if (k === "speaker" || k === "setting") continue;
      if (k === "choices") {
        for (const [cid, ch] of Object.entries(v))
          for (const [ck, cv] of Object.entries(ch)) out.push({ scene: sid, id: `${sid}.${cid}.${ck}`, value: cv });
      } else {
        out.push({ scene: sid, id: `${sid}.${k}`, value: v });
      }
    }
  }
  return out;
}
