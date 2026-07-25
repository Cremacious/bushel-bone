import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";

const here = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(here, "..", "year1.html");

// Boot a fresh game in jsdom. Returns { dom, win, doc, T } where
// T === window.__BB_TEST__ (the internals hook added in Task 1).
export function boot() {
  const html = readFileSync(htmlPath, "utf8");
  const full = "<!doctype html><html><head></head><body>" + html + "</body></html>";
  const dom = new JSDOM(full, { runScripts: "dangerously", pretendToBeVisual: true });
  const win = dom.window;
  const doc = win.document;
  const T = win.__BB_TEST__;
  if (!T) throw new Error("window.__BB_TEST__ hook missing (Task 1 not done)");
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
