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

describe("Spring content clarity", () => {
  it("the intro's advance button states its function", () => {
    const { doc } = boot();
    const btn = doc.querySelector("#stage .btn[data-c]");
    expect(btn.querySelector(".sub").textContent).toBe("begin the year");
  });

  it("Silas's two choices carry the right sub/tag", () => {
    const { doc } = boot();
    advance(doc);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const civil = btns.find(b => b.querySelector(".t").textContent.includes("Obliged"));
    const needle = btns.find(b => b.querySelector(".t").textContent.includes("believe the stories"));
    expect(civil.querySelector(".sub").textContent).toBe("keep the peace with your banker");
    expect(needle.querySelector(".sub").textContent).toBe("needle him; he does not care for it");
    expect(needle.querySelector(".tag").textContent).toBe("−regard");
  });

  it("Crows in the Corn's 'scare them' choice discloses it untends every field, not just this one (#40)", () => {
    const { doc, T } = boot();
    // SYSTEMIC.spring draws one of 3 events at random per run (Crows in the
    // Corn is pool index 1). Mark the other two as already-seen so
    // drawSystemic's "don't repeat" filter deterministically leaves only it.
    T.getState().flags._seen = { spring0: true, spring2: true };
    expect(driveToTitle(doc, "Crows in the Corn")).toBe(true);
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const scare = btns.find(b => b.querySelector(".t").textContent.includes("scaring them"));
    const tagEl = scare.querySelector(".tag");
    expect(tagEl.childNodes[0].textContent).toBe("all fields"); // tag's own text node, excluding the nested (i) icon
    const infoBtn = scare.querySelector(".whyinfo");
    expect(infoBtn).toBeTruthy();
    infoBtn.click();
    expect(doc.getElementById("overlay-panel").textContent.toLowerCase()).toContain("every other field");
  });
});
