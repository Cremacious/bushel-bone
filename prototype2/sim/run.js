// The balance-simulation harness (economy task 7). Drives the REAL game core
// (initialState/reduce) with a scripted policy function, day by day, season by season, year by
// year, so it can never drift from the actual game: no shadow model of the rules, just the
// reducer itself under a robot player. Records a per-year metric row and the unlock timeline.
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";

// Drive the real reducer with a policy until the run ends or maxYears elapses. Records a
// per-year metric row and the unlock timeline. Returns { survivedYears, foreclosed, rows, unlocks, coin }.
export function simulate(policy, { seed = 1, maxYears = 4 } = {}) {
  let s = initialState(seed, "Sim");
  const rows = [], unlocks = [];
  let guard = 0, lastYear = 0, lastFields = 1, lastHands = 1;
  while (!s.ended && s.year <= maxYears && guard++ < 50000) {
    const clearedFields = s.fields.filter((f) => f.cleared).length;
    if (clearedFields > lastFields) { unlocks.push({ what: "field", year: s.year, day: s.day }); lastFields = clearedFields; }
    if (s.hands.length > lastHands) { unlocks.push({ what: "hire", year: s.year, day: s.day }); lastHands = s.hands.length; }
    if (s.year !== lastYear) { rows.push({ year: s.year, coin: s.coin, fields: clearedFields, hands: s.hands.length, arrears: s.mortgage.arrears }); lastYear = s.year; }
    const action = policy(s);
    if (!action) break;
    const ns = reduce(s, action);
    if (ns === s) break; // policy returned a no-op → avoid an infinite loop
    s = ns;
  }
  return { survivedYears: s.year - (s.ended ? 1 : 0), foreclosed: s.phase === "foreclosed", rows, unlocks, coin: s.coin, endYear: s.year };
}

// Optional human-readable report. Not run under vitest (guarded below); run it directly with
// `node sim/run.js` from prototype2/ to print the curve for optimal/normal/sloppy.
function printTable(name, r) {
  console.log(`\n${name} — endYear=${r.endYear} foreclosed=${r.foreclosed} finalCoin=${r.coin}`);
  console.log("year  coin  fields  hands  arrears");
  for (const row of r.rows) {
    console.log(`${String(row.year).padEnd(5)} ${String(row.coin).padEnd(5)} ${String(row.fields).padEnd(6)} ${String(row.hands).padEnd(5)}  ${row.arrears}`);
  }
  console.log("unlocks:", r.unlocks.map((u) => `${u.what}@y${u.year}d${u.day}`).join(", ") || "(none)");
}

const isDirectRun = typeof process !== "undefined" && process.argv[1] &&
  /[\\/]run\.js$/.test(process.argv[1]) && !process.argv[1].includes("vitest");

if (isDirectRun) {
  const { optimal, normal, sloppy } = await import("./policies.js");
  printTable("optimal", simulate(optimal, { maxYears: 5 }));
  printTable("normal", simulate(normal, { maxYears: 5 }));
  printTable("sloppy", simulate(sloppy, { maxYears: 5 }));
}
