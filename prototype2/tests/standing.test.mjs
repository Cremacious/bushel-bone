import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { nextTownScene, standingOf, standingWord } from "../src/core/selectors.js";
import { BALANCE } from "../src/core/balance.js";

function inTown(seed = 1) {
  let s = reduce(initialState(seed), { type: "BEGIN_SEASON" });
  return reduce(s, { type: "SOW" }); // phase: day
}

describe("standing", () => {
  it("starts every NPC at 0 / Stranger", () => {
    const s = inTown();
    expect(standingOf(s, "crake")).toBe(0);
    expect(standingWord(0)).toBe("Stranger");
  });
  it("nextTownScene returns the intro first, then a deeper scene once standing allows", () => {
    let s = inTown();
    expect(nextTownScene(s, "crake")).toBe("crake_intro");
    s = { ...s, talksSeen: ["crake_intro"], standing: { crake: BALANCE.standing.perTalk } };
    expect(nextTownScene(s, "crake")).toBe("crake_deep"); // unlocked at minStanding 12
  });
  it("falls back to small-talk once the available deck is seen", () => {
    const s = { ...inTown(), talksSeen: ["crake_intro"], standing: { crake: 0 } }; // deep still locked
    expect(nextTownScene(s, "crake")).toBe("crake_small");
  });
});

describe("VISIT grants standing and records the talk", () => {
  it("spends an action, opens the resolved scene, raises standing, marks it seen", () => {
    let s = inTown();
    const acts0 = s.playerActionsLeft;
    s = reduce(s, { type: "VISIT", npc: "crake" });
    expect(s.phase).toBe("scene");
    expect(s.scene.id).toBe("crake_intro");
    expect(s.playerActionsLeft).toBe(acts0 - 1);
    expect(standingOf(s, "crake")).toBe(BALANCE.standing.perTalk);
    expect(s.talksSeen).toContain("crake_intro");
  });
  it("is a no-op off the day phase or with no actions", () => {
    let s = inTown(); s = { ...s, playerActionsLeft: 0 };
    expect(reduce(s, { type: "VISIT", npc: "crake" })).toEqual(s);
  });
});
