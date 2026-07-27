import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

function driveToTitle(doc, title, guard=90){
  let n=0;
  while(n++ < guard){
    const h2 = doc.querySelector("#stage h2");
    if (h2 && h2.textContent === title) return true;
    if (!advance(doc)) return false;
  }
  return false;
}

// advance() alone never plants anything (it just clicks "Sow it so" on an
// empty selection), so S.lots would be empty by harvest time and the market
// screen would show no larder/sell toggles at all. Drives to the planting
// screen and plants turnip (a 1-season crop) in field 0 before continuing.
// Also forces mild weather (growStep()'s g = 1 + weather.grow), since a
// randomly-rolled "Dry" week (grow:-0.5) would leave turnip's progress under
// its seasons:1 threshold and it would not be ripe in time, an intermittent
// flake this test must not have.
function plantTurnipAndDriveToMarket(doc, T) {
  T.getState().weather = { key:"mild", label:"Mild", grow:0, glyph:"cloud" };
  expect(driveToTitle(doc, "Set the fields")).toBe(true);
  const chip = doc.querySelector('.chip[data-f="0"][data-k="turnip"]');
  expect(chip).toBeTruthy();
  chip.click();
  expect(driveToTitle(doc, "What the fields gave up")).toBe(true);
}

describe("Market screen operating-cost preview (#42)", () => {
  it("states the season's food need before the player commits any larder/sell choice", () => {
    const { doc, T } = boot();
    plantTurnipAndDriveToMarket(doc, T);
    const need = 30; // seasonFoodNeed() with the default single hand: 30 + 10*extraHands()
    const text = doc.getElementById("stage").textContent;
    expect(text).toContain("eat about " + need + " food this season");
  });

  it("the shortfall/surplus figure updates live when a lot is toggled between larder and sell", () => {
    const { doc, T } = boot();
    plantTurnipAndDriveToMarket(doc, T);
    const stage = doc.getElementById("stage");
    const sellBtn = stage.querySelector('button[data-t="turnip"][data-v="sell"]');
    expect(sellBtn).toBeTruthy();
    const before = stage.textContent;
    sellBtn.click(); // move the turnip lot from larder to sell
    const after = stage.textContent;
    expect(after).not.toBe(before); // the projection line recomputed, not a stale render
    expect(after.toLowerCase()).toMatch(/short by|to spare/);
  });
});
