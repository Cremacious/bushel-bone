import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

function driveToTitle(doc, title, guard=60){
  return driveToAnyTitle(doc, [title], guard);
}

// Checking each candidate title in its own driveToTitle() call would advance
// past the real card the first time it fails to match (advance() has
// already fired before the second call gets a look), so a "titleA ||
// titleB" pattern across two separate calls can never find titleB once
// titleA's call has walked past it. Check all candidates within one pass
// instead.
function driveToAnyTitle(doc, titles, guard=60){
  let n=0;
  while(n++ < guard){
    const h2 = doc.querySelector("#stage h2");
    if (h2 && titles.includes(h2.textContent)) return true;
    if (!advance(doc)) return false;
  }
  return false;
}

describe("Summer content clarity", () => {
  it("Vane's Wagon: an unaffordable purchase shows why, not the old sub", () => {
    const { doc, T } = boot();
    T.getState().marks = 0;
    expect(driveToTitle(doc, "Vane's Wagon")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const grower = btns.find(b => b.querySelector(".t").textContent.includes("Buy the Grower"));
    const hand = btns.find(b => b.querySelector(".t").textContent.includes("Buy the Field Hand"));
    expect(grower.hasAttribute("disabled")).toBe(true);
    expect(grower.querySelector(".sub").textContent).toBe("needs 110m, have 0m");
    expect(hand.hasAttribute("disabled")).toBe(true);
    expect(hand.querySelector(".sub").textContent).toBe("needs 60m, have 0m");
  });

  it("the moral fork's choices carry heart/fertility tags, never a reckoning tag", () => {
    const { doc } = boot();
    expect(driveToAnyTitle(doc, ["The Cotton Won't Wait", "The Harvest Won't Wait"])).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const work = btns.find(b => b.querySelector(".t").textContent.includes("Work him through"));
    const rest = btns.find(b => b.querySelector(".t").textContent.includes("Let him rest"));
    expect(work.querySelector(".tag").textContent).toBe("−heart");
    expect(rest.querySelector(".tag").textContent).toBe("−fertility");
  });

  it("Rats in the Stores' 'Ignore it' states the actual amount, not just a direction (#40)", () => {
    const { doc, T } = boot();
    // SYSTEMIC.summer draws one of 3 events at random per run (Rats in the
    // Stores is pool index 2). Mark the other two as already-seen so
    // drawSystemic's "don't repeat" filter deterministically leaves only it.
    T.getState().flags._seen = { summer0: true, summer1: true };
    expect(driveToTitle(doc, "Rats in the Stores")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const ignore = btns.find(b => b.querySelector(".t").textContent.includes("Ignore it"));
    expect(ignore.querySelector(".tag").textContent).toBe("−10 food");
  });
});
