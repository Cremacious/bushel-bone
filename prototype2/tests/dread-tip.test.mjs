import { describe, it, expect } from "vitest";
import { pendingTip } from "../src/content/tips.js";
import { initialState } from "../src/core/state.js";
import { SCENES } from "../src/content/scenes.js";

// A guided player's first brush with an omen-raising event earns Reuben's one-time
// "dread" tip: the reckoning is hidden by design, so he names the feeling, not a number.
describe("Reuben's silent-Dread tip", () => {
  // ev_omen_field.shrug raises the hidden reckoning; confirm the fixture still holds.
  it("ev_omen_field really has a reckoning>0 choice (guards the test's premise)", () => {
    const anyDread = Object.values(SCENES.ev_omen_field.fx).some((d) => d && d.reckoning > 0);
    expect(anyDread).toBe(true);
  });

  function atOmenEvent(extra = {}) {
    return {
      ...initialState(1),
      tutorialsOn: true,
      overlay: null,
      phase: "scene",
      scene: { id: "ev_omen_field", result: null },
      tipsSeen: [],
      ...extra,
    };
  }

  it("fires the dread tip the first time the player meets an omen-raising event", () => {
    const tip = pendingTip(atOmenEvent());
    expect(tip && tip.id).toBe("dread");
    expect(tip.pages[0]).toMatch(/keeps its own ledger/);
    // hidden by design: the tip must not put a number on the reckoning
    expect(tip.pages.join(" ")).not.toMatch(/\d/);
  });

  it("does not fire again once seen", () => {
    const tip = pendingTip(atOmenEvent({ tipsSeen: ["dread"] }));
    expect(tip).toBe(null);
  });

  it("stays silent with tutorials off", () => {
    const tip = pendingTip(atOmenEvent({ tutorialsOn: false }));
    expect(tip).toBe(null);
  });

  it("does not fire on an event that raises no dread (ev_fox)", () => {
    const tip = pendingTip(atOmenEvent({ scene: { id: "ev_fox", result: null } }));
    expect(tip).toBe(null);
  });
});
