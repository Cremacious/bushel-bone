import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";

const here = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(here, "..", "year1.html");

// Boot a fresh game in jsdom. Returns { dom, win, doc, T } where
// T === window.__BB_TEST__ (the internals hook added in Task 1).
// By default, boot() starts a fresh game immediately (via the same
// beginNewGame() the start screen's "New Game" button calls), so every
// existing test that expects to land straight in the game keeps working
// unchanged after #36 added a start screen in front of the boot sequence.
// Pass { atStartScreen: true } to instead get the start screen itself,
// unstarted, for tests that exercise New Game/Continue/the save system.
export function boot(opts = {}) {
  const { seenIntro = true, guided = false, atStartScreen = false } = opts;
  const html = readFileSync(htmlPath, "utf8");
  const full = "<!doctype html><html><head></head><body>" + html + "</body></html>";
  const dom = new JSDOM(full, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "http://localhost/",
    beforeParse(window) {
      try {
        if (seenIntro) window.localStorage.setItem("bb_seenIntro", "1");
        window.localStorage.setItem("bb_guided", guided ? "1" : "0");
      } catch (e) {}
    },
  });
  const win = dom.window;
  const doc = win.document;
  const T = win.__BB_TEST__;
  if (!T) throw new Error("window.__BB_TEST__ hook missing");
  if (!atStartScreen) T.beginNewGame();
  return { dom, win, doc, T };
}

// Click the first enabled advance button on the current card. Returns false
// when an end screen is reached (no advance button).
export function advance(doc) {
  const stage = doc.getElementById("stage");
  if (doc.getElementById("again")) return false;
  const btns = [...stage.querySelectorAll(".btn[data-c]")].filter(b => !b.hasAttribute("disabled"));
  if (!btns.length) return false;
  (btns.find(b => b.classList.contains("primary")) || btns[0]).click();
  return true;
}
