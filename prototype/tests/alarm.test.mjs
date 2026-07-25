import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("reckoning alarm", () => {
  it("fires once when crossing into Warnings, not again within the tier", () => {
    const { T } = boot();
    const S = T.getState();
    S.reckoning = 30;
    expect(T.checkReckoningAlarm()).toBe("Warnings");
    expect(S.alarmedTiers.Warnings).toBe(true);
    S.reckoning = 40;
    expect(T.checkReckoningAlarm()).toBe(null);
  });

  it("fires again when crossing into Walkers", () => {
    const { T } = boot();
    const S = T.getState();
    S.reckoning = 30; T.checkReckoningAlarm();
    S.reckoning = 60;
    expect(T.checkReckoningAlarm()).toBe("Walkers");
    expect(S.alarmedTiers.Walkers).toBe(true);
  });

  it("stays silent in Whispers", () => {
    const { T } = boot();
    T.getState().reckoning = 10;
    expect(T.checkReckoningAlarm()).toBe(null);
  });
});
