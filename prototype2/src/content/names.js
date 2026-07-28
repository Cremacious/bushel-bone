import NAMES from "../generated/names.js";

export function lookupName(path) {
  const p = path.split(".");
  if (p[0] === "npc")   { const c = NAMES.characters[p[1]]; return c ? c[p[2] || "name"] : null; }
  if (p[0] === "loc")   { const l = NAMES.locations[p[1]]; return l ? l[p[2] || "cap"] : null; }
  if (p[0] === "place") { const v = NAMES.places[p[1]]; return v == null ? null : v; }
  if (p[0] === "term")  { const v = NAMES.terms[p[1]]; return v == null ? null : v; }
  return null;
}

// Multi-pass so composed names ("Meredith {{term.vane}}") fully resolve.
export function tok(s, extra) {
  if (typeof s !== "string" || s.indexOf("{{") < 0) return s;
  let prev;
  for (let i = 0; i < 5 && s.indexOf("{{") >= 0 && s !== prev; i++) {
    prev = s;
    s = s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, path) => {
      if (extra && path in extra) return extra[path];
      const v = lookupName(path);
      return v == null ? m : v;
    });
  }
  return s;
}
export { NAMES };
