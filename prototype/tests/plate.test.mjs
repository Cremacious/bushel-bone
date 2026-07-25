import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("plate", () => {
  it("defaults to the homestead caption on boot", () => {
    const { doc } = boot();
    expect(doc.getElementById("plate-cap").textContent).toContain("Homestead");
    expect(doc.getElementById("plate-desc").textContent.length).toBeGreaterThan(0);
  });

  it("setPlate updates the caption and shows a described placeholder", () => {
    const { doc, T } = boot();
    T.setPlate("town", null);
    expect(doc.getElementById("plate-cap").textContent).toContain("Marrow's Cross");
    expect(doc.getElementById("plate-portrait").hidden).toBe(true);
  });

  it("a speaker shows a portrait with a nameplate", () => {
    const { doc, T } = boot();
    T.setPlate("town", "silas");
    expect(doc.getElementById("plate-portrait").hidden).toBe(false);
    expect(doc.getElementById("plate-nameplate").textContent).toContain("Silas");
  });
});
