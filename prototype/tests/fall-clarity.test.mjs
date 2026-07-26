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

describe("Fall content clarity", () => {
  it("Harvest Home choices carry regard tags", () => {
    const { doc } = boot();
    expect(driveToTitle(doc, "The town lights the long tables")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const go = btns.find(b => b.querySelector(".t").textContent.includes("Go to the feast"));
    const stay = btns.find(b => b.querySelector(".t").textContent.includes("Stay and bring"));
    expect(go.querySelector(".tag").textContent).toBe("+regard");
    expect(stay.querySelector(".tag").textContent).toBe("−regard");
  });

  it("the Foundling's cruel choice ('Turn them out') carries no tag at all", () => {
    const { doc, T } = boot();
    // SYSTEMIC.fall draws one of 3 events at random per run (Foundling is
    // pool index 0). Mark the other two as already-seen so drawSystemic's
    // "don't repeat" filter deterministically leaves only Foundling.
    T.getState().flags._seen = { fall1: true, fall2: true };
    expect(driveToTitle(doc, "A Foundling")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const turnOut = btns.find(b => b.querySelector(".t").textContent.includes("Turn them out"));
    expect(turnOut.querySelector(".tag")).toBeFalsy();
  });

  it("provisioning steppers disable the + button once unaffordable", () => {
    const { doc, T } = boot();
    T.getState().marks = 2; // enough for exactly one grain (2m), not one coal (3m)
    expect(driveToTitle(doc, "Provision against winter")).toBe(true);
    const coalPlus = doc.querySelector('#stage button[data-a="coal+"]');
    expect(coalPlus.hasAttribute("disabled")).toBe(true);
  });
});
