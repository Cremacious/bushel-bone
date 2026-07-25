import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

// Regression guard: cotton needs two hands. With a lone hand the harvest is
// halved; with two it is whole. This broke once when livingHands() changed
// from a count to an array and `handCount < 2` silently coerced.
function cottonLot(T, handCount) {
  const S = T.getState();
  // ensure exactly `handCount` living hands
  if (handCount === 2) S.hands.push(T.mkHand("della", "Della", "Grower", 3, {}));
  // one ripe, untended, full-fertility cotton field; clear the rest
  S.fields.forEach((f, i) => {
    if (i === 0) { f.crop = "cotton"; f.progress = 2; f.fert = 3; f.tended = false; }
    else { f.crop = null; }
  });
  T.harvestStep();
  return S.lots.find(l => l.crop === "cotton");
}

describe("cotton two-hand penalty", () => {
  it("halves the cotton harvest with a single hand", () => {
    const { T } = boot();
    const lot = cottonLot(T, 1);
    // base yield 5 at full fertility, untended; halved and rounded => 3 (round(2.5))
    expect(lot.units).toBe(3);
  });

  it("brings in the whole cotton harvest with two hands", () => {
    const { T } = boot();
    const lot = cottonLot(T, 2);
    expect(lot.units).toBe(5);
  });
});
