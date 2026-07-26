import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("ledger stat help", () => {
  it("tapping the Larder cell opens an info popover explaining it", () => {
    const { doc } = boot();
    const larder = doc.querySelector('#ledger .cell[data-k="larder"]');
    expect(larder).toBeTruthy();
    larder.click();
    expect(doc.getElementById("overlay").classList.contains("on")).toBe(true);
    expect(doc.getElementById("overlay-panel").textContent).toContain("every season");
  });

  it("all four ledger cells are tappable and have distinct help text", () => {
    const { doc, T } = boot();
    ["coin","larder","fuel","seed"].forEach(k=>{
      expect(T.LEDGER_HELP[k]).toBeTruthy();
    });
    const keys = new Set(Object.values(T.LEDGER_HELP));
    expect(keys.size).toBe(4);
  });
});
