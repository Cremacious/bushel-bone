import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

function driveToTitle(doc, title, guard=130){
  let n=0;
  while(n++ < guard){
    const h2 = doc.querySelector("#stage h2");
    if (h2 && h2.textContent === title) return true;
    if (!advance(doc)) return false;
  }
  return false;
}

describe("Winter content clarity", () => {
  it("the Long Vigil choices carry regard tags", () => {
    const { doc } = boot();
    expect(driveToTitle(doc, "The Long Vigil")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const watch = btns.find(b => b.querySelector(".t").textContent.includes("Watch the night"));
    const home = btns.find(b => b.querySelector(".t").textContent.includes("Go home"));
    expect(watch.querySelector(".tag").textContent).toBe("+regard");
    expect(home.querySelector(".tag").textContent).toBe("−regard");
  });

  it("winter's intro advance button states its function", () => {
    const { doc } = boot();
    expect(driveToTitle(doc, "The short days close in")).toBe(true);
    const btn = doc.querySelector("#stage .btn[data-c]");
    expect(btn.querySelector(".sub").textContent).toBe("begin winter");
  });

  it("Sister Ruth's Basket's accept choice carries the deliberate dual-stat tag", () => {
    const { doc, T } = boot();
    expect(driveToTitle(doc, "The short days close in")).toBe(true);
    const state = T.getState();
    state.food = 0;
    state.fuel = 0;
    expect(driveToTitle(doc, "Sister Ruth's Basket")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const accept = btns.find(b => b.querySelector(".t").textContent.includes("Accept the basket"));
    expect(accept.querySelector(".tag").textContent).toBe("+food, +fuel");
  });
});
