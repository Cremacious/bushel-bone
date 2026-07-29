import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { duskSummary } from "../src/core/selectors.js";

describe("duskSummary season scoping", () => {
  it("does not re-report a death from an earlier season", () => {
    // Starve Reuben to death during Fall (burns fuel, so hunger + cold stack fast
    // enough to kill within the 10-day season; "idle" keeps rest recovery from
    // masking the shortfall). Standing orders persist day to day (no re-suggestion),
    // so setting "idle" once after SOW holds for the whole season.
    let s = initialState(1);
    s.seasonIndex = 2; // fall
    s = reduce(s, { type: "BEGIN_SEASON" }); // phase planting
    s = reduce(s, { type: "SOW" }); // phase day
    s.larder = 0;
    s.fuel = 0; // no fuel banked, so fall's cold bites immediately too
    s.hands[0] = { ...s.hands[0], task: "idle" };
    for (let i = 0; i < 10; i++) {
      s = reduce(s, { type: "TURN_IN" });
    }
    expect(s.phase).toBe("dusk");
    expect(s.hands[0].alive).toBe(false);
    expect(duskSummary(s).lostThisSeason).toHaveLength(1); // fall's own dusk reports it

    // Turn the page into Winter: BEGIN_SEASON re-scopes the log window, so even
    // though s.log still holds the fall death, winter's dusk should not repeat it.
    s = reduce(s, { type: "END_SEASON" });
    s = reduce(s, { type: "BEGIN_SEASON" }); // winter: phase "day" directly
    for (let i = 0; i < 10; i++) s = reduce(s, { type: "TURN_IN" });
    expect(s.phase).toBe("dusk");
    expect(s.log.some((l) => /did not last/.test(l))).toBe(true); // still in the cumulative log
    expect(duskSummary(s).lostThisSeason).toEqual([]); // but not this season's report
  });
});
