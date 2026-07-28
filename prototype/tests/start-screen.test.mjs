import { describe, it, expect } from "vitest";
import { boot } from "./helpers.mjs";

describe("start screen", () => {
  it("shows the start screen and hides the game before any choice is made", () => {
    const { doc } = boot({ atStartScreen: true });
    expect(doc.getElementById("start-screen").style.display).not.toBe("none");
    expect(doc.getElementById("desk").style.display).toBe("none");
  });

  it("disables Continue when no save exists, and says so", () => {
    const { doc } = boot({ atStartScreen: true });
    const btn = doc.getElementById("btn-continue");
    expect(btn.disabled).toBe(true);
    expect(btn.querySelector("small").textContent).toBe("no game in progress");
  });

  it("enables Continue with matching text when a save already exists at boot", () => {
    const presetSave = {
      year:1, si:0, currentSetting:"homestead", marks:250, food:80, fuel:0, seed:20,
      fields:[], hands:[], foremanId:"reuben", alarmedTiers:{Warnings:false,Walkers:false},
      regard:50, reckoning:0, flags:{}, weather:{key:"mild",label:"Mild",grow:0,glyph:"cloud"},
      coldsnap:false, dead:[], lost:[], ended:false, tutShown:{}, seedDisplay:123, rngState:123,
    };
    const { doc } = boot({ atStartScreen: true, presetSave });
    const btn = doc.getElementById("btn-continue");
    expect(btn.disabled).toBe(false);
    expect(btn.querySelector("small").textContent).toBe("resume where you left off");
  });

  it("New Game with no existing save opens the intro letter, not the game directly (#44)", () => {
    const { doc } = boot({ atStartScreen: true });
    doc.getElementById("btn-new-game").click();
    // The inheritance-letter intro comes first now: no confirmation, but the
    // game board is not shown until the letter's Begin.
    expect(doc.getElementById("start-screen").style.display).toBe("none");
    expect(doc.getElementById("intro-screen").classList.contains("on")).toBe(true);
    expect(doc.getElementById("desk").style.display).toBe("none");
    expect(doc.getElementById("intro-name").classList.contains("on")).toBe(true);
  });

  it("autosaves at the start of a season, enabling Continue on a fresh boot", () => {
    const { T } = boot({ atStartScreen: true });
    expect(T.hasSave()).toBe(false);
    T.beginNewGame(); // buildSeason() inside newGame() should autosave
    expect(T.hasSave()).toBe(true);
  });

  it("New Game with an existing save asks for confirmation first", () => {
    const { doc, T } = boot(); // default boot already starts a game (and autosaves)
    expect(T.hasSave()).toBe(true);
    doc.getElementById("btn-new-game").click(); // the button element still exists even though its screen is hidden
    expect(doc.getElementById("overlay-panel").textContent.toLowerCase()).toContain("erase it");
  });

  it("confirming New Game clears the old save and starts fresh (through the intro)", () => {
    const { doc, T } = boot();
    const before = T.getState();
    before.marks = 12345; // mutate so we can tell a fresh game apart from the old one
    T.saveGame();
    doc.getElementById("btn-new-game").click();
    doc.getElementById("newgame-yes").click(); // confirm → opens the intro
    // walk the intro: name step → letter page 1 → page 2 → Begin
    doc.getElementById("lineage-continue").click();
    doc.getElementById("intro-next").click();
    doc.getElementById("intro-next").click();
    expect(T.getState().marks).toBe(100); // back to newGame()'s starting marks, not 12345
  });

  it("declining New Game keeps the existing save untouched", () => {
    const { doc, T } = boot();
    doc.getElementById("btn-new-game").click();
    doc.getElementById("newgame-no").click();
    expect(T.hasSave()).toBe(true);
  });

  it("Continue restores saved state instead of the current in-memory state", () => {
    // jsdom's localStorage is isolated per JSDOM instance (it does not persist
    // across separate boot() calls the way a real browser persists across page
    // reloads), so this stays within one instance: save a snapshot, mutate the
    // live state without saving again, then prove Continue reloads from disk
    // rather than reflecting whatever S currently holds in memory. Calls
    // continueGame() directly rather than clicking #btn-continue: that button's
    // disabled attribute is only refreshed at boot (there is no back-to-menu
    // path yet that would need it refreshed mid-game), so a stale disabled
    // attribute would make a DOM click silently no-op here without exercising
    // the actual behavior under test.
    const { doc, T } = boot();
    const s = T.getState();
    s.marks = 777;
    s.regard = 88;
    T.saveGame();
    s.marks = 1;
    s.regard = 1;
    T.continueGame();
    expect(T.getState().marks).toBe(777);
    expect(T.getState().regard).toBe(88);
    expect(doc.getElementById("desk").style.display).not.toBe("none");
  });

  it("How to Play explains the core loop, the goal, and the ledger", () => {
    const { doc } = boot({ atStartScreen: true });
    doc.getElementById("btn-how-to-play").click();
    const text = doc.getElementById("overlay-panel").textContent;
    expect(text).toContain("How to Play");
    expect(text.toLowerCase()).toContain("four seasons");
    expect(text.toLowerCase()).toContain("larder");
    expect(text.toLowerCase()).toContain("fertility");
  });

  it("Settings shows music/SFX toggles, defaulting to on, and is honest that there's no audio yet", () => {
    const { doc, T } = boot({ atStartScreen: true });
    doc.getElementById("btn-settings").click();
    const text = doc.getElementById("overlay-panel").textContent;
    expect(text).toContain("Settings");
    expect(text.toLowerCase()).toContain("no music or sound in this build");
    expect(T.musicOn()).toBe(true);
    expect(T.sfxOn()).toBe(true);
  });

  it("Settings toggles persist and reflect their state", () => {
    const { doc, T } = boot({ atStartScreen: true });
    doc.getElementById("btn-settings").click();
    doc.querySelector('button[data-k="music"][data-v="off"]').click();
    expect(T.musicOn()).toBe(false);
    expect(doc.querySelector('button[data-k="music"][data-v="off"]').classList.contains("sel")).toBe(true);
    doc.querySelector('button[data-k="sfx"][data-v="off"]').click();
    expect(T.sfxOn()).toBe(false);
  });

  it("How to Play is also reachable in-game via Ask Reuben", () => {
    const { doc, T } = boot();
    T.openAskReuben();
    const rows = [...doc.querySelectorAll(".askq")];
    const howTo = rows.find(r => r.textContent.includes("How do I play"));
    expect(howTo).toBeTruthy();
    howTo.click();
    expect(doc.getElementById("overlay-panel").textContent).toContain("How to Play");
  });
});
