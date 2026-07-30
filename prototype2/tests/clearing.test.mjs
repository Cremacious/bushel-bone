import { describe, it, expect } from "vitest";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { clearCost, clearedFields } from "../src/core/selectors.js";
import { BALANCE } from "../src/core/balance.js";

describe("the 1-field start", () => {
  it("starts with exactly one cleared field", () => {
    const s = initialState(1);
    expect(clearedFields(s).length).toBe(1);
    expect(s.fields[0].cleared).toBe(true);
    expect(s.fields[1].cleared).toBe(false);
  });
  it("clearCost escalates with the number of fields already cleared", () => {
    const s = initialState(1);
    expect(clearCost(s)).toBe(BALANCE.clearCosts[0]); // clearing the 2nd field
    const s2 = { ...s, fields: s.fields.map((f, i) => ({ ...f, cleared: i < 2 })) };
    expect(clearCost(s2)).toBe(BALANCE.clearCosts[1]); // clearing the 3rd
  });
});

describe("CLEAR_FIELD", () => {
  it("clears an uncleared field for coin", () => {
    let s = initialState(1); s = { ...s, coin: 100 };
    const cost = clearCost(s);
    s = reduce(s, { type: "CLEAR_FIELD", fieldId: 1 });
    expect(s.fields[1].cleared).toBe(true);
    expect(s.coin).toBe(100 - cost);
  });
  it("is a no-op when it cannot be afforded or the field is already cleared", () => {
    let s = initialState(1); s = { ...s, coin: 0 };
    expect(reduce(s, { type: "CLEAR_FIELD", fieldId: 1 })).toEqual(s); // too poor
    expect(reduce(s, { type: "CLEAR_FIELD", fieldId: 0 })).toEqual(s); // already cleared
  });
  it("planting an uncleared field is refused", () => {
    let s = initialState(1);
    s = reduce(s, { type: "PLANT", fieldId: 1, crop: "potato" });
    expect(s.fields[1].crop).toBe(null);
  });
});
