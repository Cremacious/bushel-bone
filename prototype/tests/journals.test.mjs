import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("Malachi's journals (#43)", () => {
  it("unlocks one entry per season across Year 1", () => {
    const { T } = boot();
    const s = T.getState();
    s.si = 0; expect(T.journalUnlockedCount()).toBe(1);
    s.si = 1; expect(T.journalUnlockedCount()).toBe(2);
    s.si = 2; expect(T.journalUnlockedCount()).toBe(3);
    s.si = 3; expect(T.journalUnlockedCount()).toBe(4);
  });

  it("marks a new page unread until the book is opened", () => {
    const { doc, T } = boot();
    T.renderJournalDot();
    expect(T.journalUnread()).toBe(true); // spring page waiting from the start
    expect(doc.getElementById("booktog").classList.contains("unread")).toBe(true);
    T.openJournals();
    expect(T.journalUnread()).toBe(false);
    expect(doc.getElementById("booktog").classList.contains("unread")).toBe(false);
    // a new season brings a new page, unread again
    T.getState().si = 1;
    expect(T.journalUnread()).toBe(true);
  });

  it("shows only unlocked entries, in Malachi's voice, tokens resolved", () => {
    const { doc, T } = boot();
    T.openJournals();
    let text = doc.getElementById("overlay-panel").textContent;
    expect(text).toContain("Malachi’s Journals");
    expect(text).toContain("The first spring, 1864");
    expect(text).toContain("Signed the charter today");
    expect(text).not.toContain("Summer, 1864");      // summer still sealed at si=0
    expect(text).toContain("The later pages are still to come");
    T.closeOverlay();
    // reach summer: the second page appears, with {{npc.reuben}} resolved
    T.getState().si = 1;
    T.openJournals();
    text = doc.getElementById("overlay-panel").textContent;
    expect(text).toContain("Summer, 1864");
    expect(text).toContain("Reuben, the merchant called him");
    expect(doc.getElementById("overlay-panel").innerHTML).not.toContain("{{");
  });

  it("Reuben carries a 'knew Malachi' thread on the Ask Reuben panel", () => {
    const { doc, T } = boot();
    T.openAskReuben();
    const rows = [...doc.querySelectorAll(".askq")];
    const uncle = rows.find(r => r.textContent.includes("Did you know my uncle?"));
    expect(uncle).toBeTruthy();
    uncle.click();
    const ans = doc.getElementById("reuben-answer");
    expect(ans.textContent).toContain("Mister Malachi");
    expect(ans.textContent).toContain("twenty year");
    expect(ans.innerHTML).not.toContain("{{");
  });
});
