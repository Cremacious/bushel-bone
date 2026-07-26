import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

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
});
