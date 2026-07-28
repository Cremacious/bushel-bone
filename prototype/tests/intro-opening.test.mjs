import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

// Drive the New Game opening (#44): the lineage-naming step and the two-page
// inheritance letter that hands into the first Morning Brief.
function openIntro(doc) {
  doc.getElementById("btn-new-game").click(); // no save at boot → straight to intro
  return doc.getElementById("intro-screen");
}
function setName(doc, name) {
  const inp = doc.getElementById("lineage-input");
  inp.value = name;
  inp.dispatchEvent(new doc.defaultView.Event("input"));
}
function pageText(doc) {
  return doc.getElementById("intro-page").textContent;
}

describe("New Game opening — the inheritance letter (#44)", () => {
  it("New Game opens on the naming step, prefilled and ready", () => {
    const { doc } = boot({ atStartScreen: true });
    const scr = openIntro(doc);
    expect(scr.classList.contains("on")).toBe(true);
    expect(doc.getElementById("intro-name").classList.contains("on")).toBe(true);
    const inp = doc.getElementById("lineage-input");
    expect(inp.value).toBe("Crane");
    expect(doc.getElementById("lineage-continue").disabled).toBe(false);
  });

  it("clearing the surname disables Continue; typing one re-enables it", () => {
    const { doc } = boot({ atStartScreen: true });
    openIntro(doc);
    setName(doc, "   ");
    expect(doc.getElementById("lineage-continue").disabled).toBe(true);
    setName(doc, "Mercer");
    expect(doc.getElementById("lineage-continue").disabled).toBe(false);
  });

  it("Continue shows the letter, page 1: the Charter Company and the family name", () => {
    const { doc } = boot({ atStartScreen: true });
    openIntro(doc);
    doc.getElementById("lineage-continue").click();
    expect(doc.getElementById("intro-letter").classList.contains("on")).toBe(true);
    const t = pageText(doc);
    expect(t).toContain("The Sallows Charter Company");
    expect(t).toContain("March 3rd, 1884");
    expect(t).toContain("MALACHI CRANE");        // uppercase beside MALACHI
    expect(t).toContain("the Crane place");        // title-case in prose
    expect(t).toContain("We do not advise. We record.");
    expect(doc.getElementById("intro-pageno").textContent).toBe("Page 1 of 2");
    expect(doc.getElementById("intro-next").textContent).toBe("Next");
  });

  it("Next reaches page 2 (the arrival, Reuben at the fence) with a Begin button", () => {
    const { doc } = boot({ atStartScreen: true });
    openIntro(doc);
    doc.getElementById("lineage-continue").click();
    doc.getElementById("intro-next").click();
    const t = pageText(doc);
    expect(t).toContain("You had never met the man. You went anyway.");
    expect(t).toContain("You’ll be the blood, then");
    expect(t).toContain("the Crane place");
    expect(doc.getElementById("intro-pageno").textContent).toBe("Page 2 of 2");
    expect(doc.getElementById("intro-next").textContent).toBe("Begin");
  });

  it("Previous steps back through pages, then to the naming step", () => {
    const { doc } = boot({ atStartScreen: true });
    openIntro(doc);
    doc.getElementById("lineage-continue").click(); // page 1
    doc.getElementById("intro-next").click();       // page 2
    doc.getElementById("intro-prev").click();       // back to page 1
    expect(doc.getElementById("intro-pageno").textContent).toBe("Page 1 of 2");
    doc.getElementById("intro-prev").click();       // back to naming
    expect(doc.getElementById("intro-name").classList.contains("on")).toBe(true);
  });

  it("Begin hands into the game with the chosen lineage name in state", () => {
    const { doc, T } = boot({ atStartScreen: true });
    openIntro(doc);
    setName(doc, "Mercer");
    doc.getElementById("lineage-continue").click();
    // the letter reflects the typed name
    expect(pageText(doc)).toContain("MALACHI MERCER");
    expect(pageText(doc)).toContain("the Mercer place");
    doc.getElementById("intro-next").click();       // page 2
    doc.getElementById("intro-next").click();       // Begin
    expect(doc.getElementById("intro-screen").classList.contains("on")).toBe(false);
    expect(doc.getElementById("desk").style.display).not.toBe("none");
    expect(T.getState().year).toBe(1);
    expect(T.getState().lineageName).toBe("Mercer");
  });

  it("the lineage name survives a save/load round-trip", () => {
    const { doc, T } = boot({ atStartScreen: true });
    openIntro(doc);
    setName(doc, "Ashcombe");
    doc.getElementById("lineage-continue").click();
    doc.getElementById("intro-next").click();
    doc.getElementById("intro-next").click(); // Begin → newGame() autosaves
    T.continueGame();
    expect(T.getState().lineageName).toBe("Ashcombe");
  });

  it("the letter is dash-free per D-037", () => {
    const { doc } = boot({ atStartScreen: true });
    openIntro(doc);
    doc.getElementById("lineage-continue").click();
    const p1 = pageText(doc);
    doc.getElementById("intro-next").click();
    const p2 = pageText(doc);
    for (const t of [p1, p2]) {
      expect(t).not.toContain("—"); // em dash
      expect(t).not.toContain("–"); // en dash
      expect(t).not.toMatch(/ - /); // hyphen used as a pause
    }
  });

  it("normLineage trims, caps, and falls back to a default", () => {
    const { T } = boot({ atStartScreen: true });
    expect(T.normLineage("  mercer  ")).toBe("Mercer");
    expect(T.normLineage("van dyke")).toBe("Van dyke");
    expect(T.normLineage("")).toBe("Crane");
    expect(T.normLineage(null)).toBe("Crane");
  });
});
