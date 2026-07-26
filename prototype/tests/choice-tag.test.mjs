import { describe, it, expect } from "vitest";
import { boot, advance } from "./helpers.mjs";

// This task adds the tag/why *mechanism* to choiceHTML(). No in-game choice
// uses `tag` yet (Task 4 adds the first one, Silas's "You believe the
// stories" choice, tag:"−regard" — see spring-clarity.test.mjs for the
// end-to-end assertion once that lands). These tests only prove the
// mechanism is additive and doesn't regress existing choices.
describe("choice tag/why mechanism", () => {
  it("a choice with no tag renders no .tag element", () => {
    const { doc } = boot();
    const btn = doc.querySelector("#stage .btn[data-c]");
    expect(btn.querySelector(".tag")).toBeFalsy();
  });

  it("a disabled choice with no `why` still falls back to its existing `sub` text", () => {
    const { doc, T } = boot();
    const S = T.getState();
    S.marks = 0;
    // Vane's Wagon (Summer, scripted): drive there via advance()
    let guard = 0;
    while (guard++ < 40) {
      const h2 = doc.querySelector("#stage h2");
      if (h2 && h2.textContent === "Vane's Wagon") break;
      if (!advance(doc)) break;
    }
    const btns = [...doc.querySelectorAll("#stage .btn[data-c]")];
    const grower = btns.find(b => b.querySelector(".t").textContent.includes("Buy the Grower"));
    expect(grower).toBeTruthy();
    expect(grower.hasAttribute("disabled")).toBe(true);
    // Task 5 added a `why` field to this choice ("needs 110m, have 0m"), and
    // choiceHTML() shows `why` instead of `sub` once a choice is disabled, so
    // this expectation was updated from the original `sub` text accordingly.
    expect(grower.querySelector(".sub").textContent).toBe("needs 110m, have 0m");
  });
});
