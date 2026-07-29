import { describe, it, expect } from "vitest";
import { choiceCard, warnLines, fieldCard } from "../src/render/components.js";
import { initialState } from "../src/core/state.js";
import { reduce } from "../src/core/reducer.js";
import { fieldProjection } from "../src/core/selectors.js";

describe("choiceCard", () => {
  it("renders title, tag, and sub", () => {
    const b = choiceCard({ text: "Plant turnips", tag: "-3 seed", sub: "a safe first crop" }, () => {});
    expect(b.querySelector(".ctitle").textContent).toContain("Plant turnips");
    expect(b.querySelector(".ctag").textContent).toBe("-3 seed");
    expect(b.querySelector(".csub").textContent).toBe("a safe first crop");
    expect(b.classList.contains("disabled")).toBe(false);
  });

  it("fires onPick when enabled", () => {
    let hits = 0;
    const b = choiceCard({ text: "Begin" }, () => { hits++; });
    b.click();
    expect(hits).toBe(1);
  });

  it("disabled: sets the attribute, shows `why` instead of sub, and swallows the click", () => {
    let hits = 0;
    const b = choiceCard({ text: "Buy fuel", sub: "keeps the crew warm", why: "not enough coin", disabled: true }, () => { hits++; });
    expect(b.disabled).toBe(true);
    expect(b.classList.contains("disabled")).toBe(true);
    expect(b.querySelector(".csub").textContent).toBe("not enough coin"); // `why` wins over `sub`
    b.click();
    expect(hits).toBe(0);
  });

  it("resolves name tokens in text, sub, and tag", () => {
    const b = choiceCard({ text: "Ask {{npc.reuben}}", sub: "about {{npc.malachi}}", tag: "{{npc.reuben}}" }, () => {});
    expect(b.querySelector(".ctitle").textContent).toContain("Reuben");
    expect(b.querySelector(".csub").textContent).toContain("Malachi");
    expect(b.querySelector(".ctag").textContent).toBe("Reuben");
  });
});

describe("fieldCard", () => {
  it("shows the field name, the crop, and the projection", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    s.fields[0] = { ...s.fields[0], crop: "potato", progress: 0, fert: 3 };
    const card = fieldCard(s.fields[0], fieldProjection(s, s.fields[0]));
    expect(card.querySelector(".fc-name").textContent).toContain("East Field");
    expect(card.textContent).toContain("Potato");
    expect(card.textContent).toContain("ripens wk 5");
    expect(card.textContent).toContain("20 food");
  });
  it("an empty field reads as fallow", () => {
    let s = reduce(initialState(1), { type: "BEGIN_SEASON" });
    const card = fieldCard(s.fields[0], fieldProjection(s, s.fields[0]));
    expect(card.textContent.toLowerCase()).toContain("fallow");
  });
});

describe("warnLines", () => {
  it("returns null when there is nothing to warn about", () => {
    expect(warnLines([])).toBe(null);
  });
  it("renders one line per warning", () => {
    const node = warnLines(["The larder runs thin.", "No fuel is laid in."]);
    expect(node.querySelectorAll(".warnline").length).toBe(2);
  });
});
