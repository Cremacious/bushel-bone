import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { reduce, applyFx } from "../src/core/reducer.js";
import { SCENES } from "../src/content/scenes.js";
import { mulberry32 } from "../src/core/rng.js";
import { initialState } from "./helpers/no-events-state.mjs";
import { ODD_JOBS } from "../src/core/town.js";

// A haggle scene injected only for these tests. Insertion order of `odds` is the bucket order
// the reducer must iterate (win, then hold, then sour).
const TEST_HAGGLE = {
  kind: "haggle", returnTo: "town", choices: ["push", "take"],
  fx: { take: { coin: 6 } },
  haggle: {
    on: "push",
    odds: { win: 0.4, hold: 0.4, sour: 0.2 },
    outcomes: { win: { coin: 12 }, hold: { coin: 6 }, sour: { coin: 2, regard: -2 } },
  },
};

beforeAll(() => { SCENES.test_haggle = TEST_HAGGLE; });
afterAll(() => { delete SCENES.test_haggle; });

// Put a state at a haggle scene with a chosen rngState.
function atHaggle(rngState) {
  return { ...initialState(1), rngState, phase: "scene", scene: { id: "test_haggle", result: null } };
}

// The reducer's cumulative-weight selection, mirrored here so the test derives the expected
// outcome from the same roll the reducer will see.
function expectedOutcome(rngState) {
  const roll = mulberry32(rngState)();
  const order = ["win", "hold", "sour"];
  const odds = TEST_HAGGLE.haggle.odds;
  let acc = 0;
  for (const k of order) { acc += odds[k]; if (roll < acc) return k; }
  return order[order.length - 1];
}

describe("applyFx()", () => {
  it("applies a multi-key fx with the same clamping (coin floors at 0, regard 0..100)", () => {
    const s = { ...initialState(1), coin: 10, regard: 5 };
    const ns = applyFx(s, { coin: -6, regard: 2 });
    expect(ns.coin).toBe(4);
    expect(ns.regard).toBe(7);
    expect(s.coin).toBe(10); // pure: input untouched
  });
  it("floors coin at 0 and clamps regard to the 0..100 band", () => {
    const s = { ...initialState(1), coin: 3, regard: 99 };
    const ns = applyFx(s, { coin: -50, regard: 20 });
    expect(ns.coin).toBe(0);
    expect(ns.regard).toBe(100);
  });
  it("is a no-op for an empty or missing fx", () => {
    const s = initialState(1);
    expect(applyFx(s, {})).toEqual(s);
    expect(applyFx(s, undefined)).toEqual(s);
  });
});

describe("haggle roll in chooseScene", () => {
  it("the risky option rolls a deterministic outcome for a fixed rngState and applies its fx", () => {
    const rngState = 12345;
    const s = atHaggle(rngState);
    const coin0 = s.coin, regard0 = s.regard;
    const out = expectedOutcome(rngState);
    const ns = reduce(s, { type: "CHOOSE_SCENE", choiceId: "push" });
    expect(ns.scene.result).toBe(out);
    const outFx = TEST_HAGGLE.haggle.outcomes[out];
    expect(ns.coin).toBe(Math.max(0, coin0 + (outFx.coin || 0)));
    expect(ns.regard).toBe(Math.max(0, Math.min(100, regard0 + (outFx.regard || 0))));
  });
  it("advances rngState (a replay off the same seed would land the same outcome)", () => {
    const rngState = 777;
    const rng = mulberry32(rngState); rng(); // one roll, matching the reducer
    const ns = reduce(atHaggle(rngState), { type: "CHOOSE_SCENE", choiceId: "push" });
    expect(ns.rngState).toBe(rng.getState());
    expect(ns.rngState).not.toBe(rngState);
  });
  it("a different rngState can yield a different outcome (the roll actually varies it)", () => {
    const seen = new Set();
    for (let rs = 1; rs <= 60; rs++) {
      const ns = reduce(atHaggle(rs), { type: "CHOOSE_SCENE", choiceId: "push" });
      seen.add(ns.scene.result);
    }
    expect(seen.size).toBeGreaterThan(1);
    for (const k of seen) expect(["win", "hold", "sour"]).toContain(k);
  });
  it("the safe option applies its own fx, records result=take, and consumes no roll", () => {
    const rngState = 999;
    const s = atHaggle(rngState);
    const coin0 = s.coin;
    const ns = reduce(s, { type: "CHOOSE_SCENE", choiceId: "take" });
    expect(ns.scene.result).toBe("take");
    expect(ns.coin).toBe(coin0 + 6);
    expect(ns.rngState).toBe(rngState); // no roll on the safe path
  });
  it("a scene with no haggle block behaves exactly as before (flat fx, result=choiceId)", () => {
    let s = reduce(initialState(1), { type: "OPEN_SCENE", id: "silas_welcome" });
    const before = s.regard, rng0 = s.rngState;
    s = reduce(s, { type: "CHOOSE_SCENE", choiceId: "obliged" });
    expect(s.scene.result).toBe("obliged");
    expect(s.regard).toBe(before + 2);
    expect(s.rngState).toBe(rng0); // untouched
  });
});

describe("ACCEPT_JOB opens a scene card (no instant coin)", () => {
  function inTownDay(seed = 42) {
    let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
    return reduce(s, { type: "SOW" });
  }
  it("every odd-job carries a scene id to open", () => {
    for (const j of ODD_JOBS) expect(typeof j.scene).toBe("string");
  });
  it("opens the job's scene, spends an action, marks it done, and pays no coin directly", () => {
    let s = inTownDay();
    const job = ODD_JOBS[0];
    const coin0 = s.coin, acts0 = s.actions;
    s = reduce(s, { type: "ACCEPT_JOB", id: job.id });
    expect(s.phase).toBe("scene");
    expect(s.scene).toEqual({ id: job.scene, result: null });
    expect(s.screen).toBe("home");
    expect(s.actions).toBe(acts0 - 1);
    expect(s.jobsDoneThisSeason).toContain(job.id);
    expect(s.coin).toBe(coin0); // payoff comes from the scene's choices, not the accept
  });
});
