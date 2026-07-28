import SCRIPT from "../generated/script.js";

// L(id[, vars]) returns a dialogue line; {{name}} tokens resolve later at render
// via tok(); single-brace {slot}s (runtime values) are filled here.
export function L(id, vars) {
  let s = SCRIPT[id];
  if (s == null) return "{" + id + "}";
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}
export { SCRIPT };
