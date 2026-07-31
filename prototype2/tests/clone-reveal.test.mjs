import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce, pendingScript } from "../src/core/reducer.js";
import { EVENTS } from "../src/core/events.js";
import { el } from "../src/render/dom.js";
import { L } from "../src/content/script.js";
import { tok } from "../src/content/names.js";
import { SCENES } from "../src/content/scenes.js";

// A Year-1 Spring state parked on the planting phase, with events suppressed so nothing but
// the scripted nudge can interrupt SOW.
function planting(seed = 1) {
  let s = { ...initialState(seed), eventsSeen: EVENTS.map((e) => e.id) };
  return reduce(s, { type: "BEGIN_SEASON" }); // phase: planting
}

describe("the Year-1 Spring hands nudge", () => {
  it("SOW opens the reuben_hands nudge and marks it seen", () => {
    const s = reduce(planting(), { type: "SOW" });
    expect(s.phase).toBe("scene");
    expect(s.scene.id).toBe("reuben_hands");
    expect(s.scriptSeen).toContain("reuben_hands");
  });

  it("closing the nudge returns to the day beat (phase day, day 1)", () => {
    let s = reduce(planting(), { type: "SOW" });
    s = reduce(s, { type: "CLOSE_SCENE" });
    expect(s.phase).toBe("day");
    expect(s.day).toBe(1);
  });

  it("does not fire again once seen (fires exactly once)", () => {
    // A day-phase Year-1 Spring state that has already seen the nudge.
    const s = { ...initialState(1), phase: "day", day: 1, scriptSeen: ["reuben_hands"] };
    expect(pendingScript(s)).toBe(null);
  });

  it("does not fire outside Year-1 Spring", () => {
    const summer = { ...initialState(1), seasonIndex: 1 };
    expect(pendingScript(summer)).toBe(null);
    const year2 = { ...initialState(1), year: 2 };
    expect(pendingScript(year2)).toBe(null);
  });

  it("does not fire once the clones are revealed", () => {
    const s = { ...initialState(1), cloneRevealed: true };
    expect(pendingScript(s)).toBe(null);
  });

  it("fires only for the fresh Year-1 Spring state", () => {
    expect(pendingScript(initialState(1))).toBe("reuben_hands");
  });
});

describe("the wagon reveal", () => {
  it("REVEAL_WAGON opens the vane_reveal scene", () => {
    const s = reduce({ ...initialState(1), screen: "town", townAt: "wagon" }, { type: "REVEAL_WAGON" });
    expect(s.phase).toBe("scene");
    expect(s.scene.id).toBe("vane_reveal");
    expect(s.cloneRevealed).toBe(false); // not yet: the flag flips only when the scene closes
  });

  it("REVEAL_WAGON is a no-op once the clones are revealed", () => {
    const s = { ...initialState(1), cloneRevealed: true };
    expect(reduce(s, { type: "REVEAL_WAGON" })).toEqual(s);
  });

  it("closing a revealsClones scene sets cloneRevealed", () => {
    let s = reduce({ ...initialState(1), screen: "town", townAt: "wagon" }, { type: "REVEAL_WAGON" });
    s = reduce(s, { type: "CLOSE_SCENE" });
    expect(s.cloneRevealed).toBe(true);
    expect(s.scene).toBe(null);
  });
});

// The town-wagon render branch: mask before the reveal (an "Approach the wagon" card, no
// hire), unmask after (the hire card returns). Renders the town place view into jsdom
// following tests/screens.test.mjs patterns.
async function renderTown(s) {
  const { renderScreen } = await import("../src/render/screens.js");
  const stage = el("div");
  renderScreen(stage, { ...s, screen: "town", townAt: "wagon" }, () => {});
  return stage.textContent;
}

describe("the town masks and gates the wagon", () => {
  it("before the reveal: offers Approach the wagon, not a hire", async () => {
    const text = await renderTown({ ...initialState(1), phase: "day", day: 1 });
    expect(text).toContain("Approach the wagon");
    expect(text).not.toContain("Hire a hand");
  });

  it("after the reveal: the hire card returns", async () => {
    const text = await renderTown({ ...initialState(1), phase: "day", day: 1, cloneRevealed: true, coin: 500 });
    expect(text).toContain("Hire a hand");
    expect(text).not.toContain("Approach the wagon");
  });

  it("the wagon's town line never says clone before the reveal", async () => {
    // The street overview line (LOCATIONS purpose) is neutral, no spoiler.
    const { townOffers } = await import("../src/core/selectors.js");
    const wagon = townOffers(initialState(1)).locations.find((l) => l.id === "wagon");
    expect(wagon.purpose).not.toMatch(/clone/i);
  });
});

describe("the reveal and nudge carry authored prose and the moral framing", () => {
  const inReveal = () => reduce({ ...initialState(1), screen: "town", townAt: "wagon" }, { type: "REVEAL_WAGON" });

  it("both scenes resolve real prose with no token leak", () => {
    for (const id of ["reuben_hands", "vane_reveal"]) {
      const title = tok(L(id + ".title"));
      const body = tok(L(id + ".body"));
      expect(title.length).toBeGreaterThan(0);
      expect(body.length).toBeGreaterThan(20);
      expect(title + body).not.toMatch(/\{\{/); // names resolved
      for (const cid of SCENES[id].choices) {
        expect(tok(L(`${id}.${cid}.text`)).length).toBeGreaterThan(0);
        expect(tok(L(`${id}.${cid}.result`)).length).toBeGreaterThan(0);
      }
    }
  });

  it("the fair framing raises regard and eases the hidden reckoning", () => {
    const s0 = inReveal();
    const s = reduce(s0, { type: "CHOOSE_SCENE", choiceId: "fair" });
    expect(s.regard).toBe(s0.regard + 2);
    expect(s.reckoning).toBe(Math.max(0, s0.reckoning - 1));
  });

  it("the stock framing costs regard and stirs the reckoning", () => {
    const s0 = inReveal();
    const s = reduce(s0, { type: "CHOOSE_SCENE", choiceId: "stock" });
    expect(s.regard).toBe(s0.regard - 2);
    expect(s.reckoning).toBe(s0.reckoning + 2);
  });
});
