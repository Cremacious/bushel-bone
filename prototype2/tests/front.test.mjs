import { describe, it, expect } from "vitest";
import { startFront, normLineage } from "../src/front.js";

function mount() {
  const root = document.createElement("div");
  let started = null;
  const api = startFront(root, { onStart: (name) => { started = name; } });
  return { root, api, getStarted: () => started };
}

describe("front porch — title / naming / letter", () => {
  it("normLineage trims, caps length, and capitalizes; falls back to Crane", () => {
    expect(normLineage("  mackall ")).toBe("Mackall");
    expect(normLineage("")).toBe("Crane");
    expect(normLineage("abcdefghijklmnopqrstuvwx").length).toBe(18);
  });

  it("the title screen shows the four menu items", () => {
    const { root } = mount();
    const labels = [...root.querySelectorAll(".fr-menuitem .fr-mi-label")].map((n) => n.textContent);
    expect(labels).toEqual(["New Game", "Continue", "How to Play", "Settings"]);
    expect(root.querySelector(".fr-menuitem.disabled .fr-mi-label").textContent).toBe("Continue");
  });

  it("the naming step shows the trimmed prompt, a surname input, and a Continue control", () => {
    const { root } = mount();
    [...root.querySelectorAll(".fr-menuitem")].find((b) => /New Game/.test(b.textContent)).click();
    expect(root.querySelector(".fr-name")).toBeTruthy();
    expect(root.textContent).toContain("This land will carry your family's name");
    expect(root.textContent).not.toContain("Before the letter comes");
    expect(root.textContent).not.toContain("name over the door");
    expect(root.querySelector(".fr-input")).toBeTruthy();
    expect([...root.querySelectorAll("button")].some((b) => /Continue/.test(b.textContent))).toBe(true);
  });

  it("New Game opens the naming step; naming carries into the letter with the surname in it", () => {
    const { root } = mount();
    [...root.querySelectorAll(".fr-menuitem")].find((b) => /New Game/.test(b.textContent)).click();
    expect(root.querySelector(".fr-name")).toBeTruthy();
    const input = root.querySelector(".fr-input");
    input.value = "Mackall"; input.dispatchEvent(new window.Event("input"));
    [...root.querySelectorAll("button")].find((b) => /Continue/.test(b.textContent)).click();
    // page 1 of the letter, with the lineage surname interpolated
    expect(root.querySelector(".fr-letter")).toBeTruthy();
    expect(root.textContent).toContain("MACKALL");
    expect(root.querySelector(".fr-pageno").textContent).toBe("Page 1 of 2");
    // the paging nav (Back / Next) is present on page 1
    expect(root.querySelector(".fr-actions")).toBeTruthy();
  });

  it("paging to the last page and Begin fires onStart with the normalized lineage", () => {
    const { root, getStarted } = mount();
    [...root.querySelectorAll(".fr-menuitem")].find((b) => /New Game/.test(b.textContent)).click();
    const input = root.querySelector(".fr-input");
    input.value = "mackall"; input.dispatchEvent(new window.Event("input"));
    [...root.querySelectorAll("button")].find((b) => /Continue/.test(b.textContent)).click();
    [...root.querySelectorAll("button")].find((b) => /Next/.test(b.textContent)).click(); // → page 2
    expect(root.querySelector(".fr-pageno").textContent).toBe("Page 2 of 2");
    // the paging nav (Back / Begin) is still present on page 2, same as page 1
    expect(root.querySelector(".fr-actions")).toBeTruthy();
    [...root.querySelectorAll("button")].find((b) => /Begin/.test(b.textContent)).click();
    expect(getStarted()).toBe("Mackall");
  });
});
