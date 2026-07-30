import { describe, it, expect } from "vitest";
import { fxTag } from "../src/render/screens.js";

describe("fxTag — legible, correctly-colored choice tags", () => {
  it("labels tiredness and colors a rise RED (the sick-hand bug)", () => {
    const t = fxTag({ strainOne: 16 });
    expect(t.text).toBe("+16 Tiredness · a hand");
    expect(t.valence).toBe("bad");
  });
  it("colors easing tiredness (a negative) GREEN", () => {
    expect(fxTag({ strainOne: -10 }).valence).toBe("good");
  });
  it("colors the crew's tiredness and rising dread as bad", () => {
    expect(fxTag({ strainAll: 8 }).text).toBe("+8 Tiredness · the crew");
    expect(fxTag({ strainAll: 8 }).valence).toBe("bad");
    expect(fxTag({ reckoning: 4 }).text).toBe("+4 dread");
    expect(fxTag({ reckoning: 4 }).valence).toBe("bad");
  });
  it("maps larder to 'food' and colors a gain green", () => {
    expect(fxTag({ larder: 6 }).text).toBe("+6 food");
    expect(fxTag({ larder: 6 }).valence).toBe("good");
    expect(fxTag({ larder: -8 }).valence).toBe("bad");
  });
  it("renders loseHand as a plain stake, not '+1 loseHand'", () => {
    const t = fxTag({ loseHand: true });
    expect(t.text).toBe("a hand may be lost");
    expect(t.valence).toBe("bad");
  });
  it("marks a mixed cost/benefit choice as neither pure good nor bad", () => {
    expect(fxTag({ coin: -6, larder: 6 }).valence).toBe("");
  });
});
