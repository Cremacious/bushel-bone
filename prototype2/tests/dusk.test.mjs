import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { duskSummary } from "../src/core/selectors.js";

describe("duskSummary season scoping", () => {
  it("does not re-report a death from an earlier season", () => {
    // Starve Reuben to death during Fall (burns fuel, so hunger + cold stack fast
    // enough to kill within the 5-week season; "idle" keeps rest recovery from
    // masking the shortfall).
    let s = initialState(1);
    s.seasonIndex = 2; // fall
    s = reduce(s, { type: "BEGIN_SEASON" }); // phase planting
    s = reduce(s, { type: "SOW" }); // phase week
    s.larder = 0;
    // Task 4 pre-fills each hand's task from Reuben's suggested plan after every
    // RESOLVE_WEEK, so "idle" has to be re-asserted each week to keep this hand off
    // both hard labor (which would recover fuel/progress) and "rest" (which would
    // mask the shortfall with recovery) for the whole isolation.
    for (let i = 0; i < 5; i++) {
      s.hands[0] = { ...s.hands[0], task: "idle" };
      s = reduce(s, { type: "RESOLVE_WEEK" });
    }
    expect(s.phase).toBe("dusk");
    expect(s.hands[0].alive).toBe(false);
    expect(duskSummary(s).lostThisSeason).toHaveLength(1); // fall's own dusk reports it

    // Turn the page into Winter: BEGIN_SEASON re-scopes the log window, so even
    // though s.log still holds the fall death, winter's dusk should not repeat it.
    s = reduce(s, { type: "END_SEASON" });
    s = reduce(s, { type: "BEGIN_SEASON" }); // winter: phase "week" directly
    for (let i = 0; i < 5; i++) s = reduce(s, { type: "RESOLVE_WEEK" });
    expect(s.phase).toBe("dusk");
    expect(s.log.some((l) => /did not last/.test(l))).toBe(true); // still in the cumulative log
    expect(duskSummary(s).lostThisSeason).toEqual([]); // but not this season's report
  });
});
